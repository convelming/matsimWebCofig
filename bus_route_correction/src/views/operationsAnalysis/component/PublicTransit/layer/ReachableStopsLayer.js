import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import { getTextImage } from "@/mymap/utils/index";

const STOP_SIZE = 80;

export class ReachableStopsLayer extends Layer {
  name = "ReachableStopsLayer";
  size = 50;
  scale = 3;
  color = new THREE.Color(0xffffff);

  showLine = [];
  data = [];
  center = [0, 0];
  highStopId = -1;

  texture = new THREE.TextureLoader().load(require("@/assets/image/point.svg"));

  constructor(opt) {
    super(opt);
    this.scene.renderOrder = this.zIndex;

    this.size = opt.size || this.size;
    this.data = opt.data || this.data;
    this.color = new THREE.Color(opt.color || this.color);

    this.geometry = new THREE.PlaneGeometry(STOP_SIZE, STOP_SIZE);
    this.material = new THREE.MeshBasicMaterial({
      depthWrite: false,
      transparent: true,
      map: this.texture,
      color: this.color,
    });
    this.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
          #if defined(USE_MAP)
            vec4 textColor = texture2D( map, vUv );
            float length = (textColor.r + textColor.g + textColor.b) / 3.0  ;
            if(length < 0.5){
              outgoingLight = vec3(1.0);
            }else{
              outgoingLight = diffuse.rgb;
            }
          #endif
          #include <output_fragment>
        `
      );
    };

    this.pickGeometry = new THREE.PlaneGeometry(STOP_SIZE * 1.1, STOP_SIZE * 1.1);
    this.pickLayerMaterial = new THREE.MeshBasicMaterial({
      color: this.pickLayerColor,
    });
    this.pickMeshMaterial = new THREE.MeshBasicMaterial();

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: false,
      })
    );
    this.labelMesh.center.set(0.5, -0.5);
  }

  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = new THREE.Color(pickLayerColor);
    this.pickLayerMaterial.setValues({ color: this.pickLayerColor });
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, 0);
      }
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setSize(this.map.cameraHeight / 10000);
      // this.update();
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const pickColor = new THREE.Color(data.pickColor);
      const item = this.getItemByPickColor(pickColor);
      if (item) {
        this.handleEventListener(type, item.data);
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE_PICK) {
      let labelData = null;
      if (data.layerId == this.id) {
        const pickColor = new THREE.Color(data.pickColor);
        const item = this.getItemByPickColor(pickColor);
        if (item) {
          if (this.labelData && item.data.stop.name == this.labelData.name) {
            labelData = this.labelData;
          } else {
            if (this.labelData) this.labelData.map.dispose();
            labelData = {};
            const { url, width, height } = getTextImage(item.data.stop.name);
            const texture = new THREE.TextureLoader().load(url);
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            labelData.map = texture;
            labelData.mapWidth = width;
            labelData.mapHeight = height;
            labelData.x = item.data.stop.coord.x;
            labelData.y = item.data.stop.coord.y;
            labelData.name = item.data.stop.name;
          }
        }
      }
      this.labelData = labelData;
      this.updateLabel();
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.setSize(this.map.cameraHeight / 10000);
    this.update();
  }

  getItemByPickColor(pickColor) {
    for (const [li, line] of this.data.entries()) {
      for (const [si, stop] of line.stopList.entries()) {
        if (stop.pickColor.equals(pickColor)) return stop;
      }
    }
    return null
  }

  setSize(size = this.size, scale = this.scale) {
    this.size = size;
    this.scale = scale;
    const count = this.data.length;
    for (const [li, line] of this.data.entries()) {
      for (const [si, stop] of line.stopList.entries()) {
        const { coord } = stop;
        const positionV3 = new THREE.Vector3(coord.x, coord.y, li / count);
        const _scale = scale * size;
        const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);

        const matrix = new THREE.Matrix4();
        matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

        if (line.mesh) line.mesh.setMatrixAt(si, matrix);
        if (line.pickLayerMesh) line.pickLayerMesh.setMatrixAt(si, matrix);
        if (line.pickMesh) line.pickMesh.setMatrixAt(si, matrix);
      }

      if (line.mesh) line.mesh.instanceMatrix.needsUpdate = true;
      if (line.pickLayerMesh) line.pickLayerMesh.instanceMatrix.needsUpdate = true;
      if (line.pickMesh) line.pickMesh.instanceMatrix.needsUpdate = true;


      if (this.labelData && this.labelMesh) {
        const scale = this.map.cameraHeight / 2000;
        this.labelMesh.scale.set(this.labelData.mapWidth * scale, this.labelData.mapHeight * scale, 1);
      }
    }
  }

  setData(data) {
    try {
      const center = data[0].center;
      const lineList = [];
      let pickColorNum = 1;
      for (const route of data) {
        const line = {
          id: route.routeId,
          stopList: []
        }
        for (const stop of route.stops) {
          line.stopList.push({
            coordKey: `${Number(stop.coord.x).toFixed(0)}_${Number(stop.coord.y).toFixed(0)}`,
            coord: stop.coord.offset(center),
            pickColor: new THREE.Color(++pickColorNum),
            id: stop.uuid,
            data: stop.toJSON(),
          });
        }
        lineList.push(line);
      }
      this.data = lineList;

      this.center = center.toList();
      this.update();
    } catch (error) {
      this.data = [];
      this.center = [0, 0];
      this.update();
    }
  }

  setColor(color) {
    this.color = new THREE.Color(color);
    this.material.setValues({ color: this.color });
  }

  clearScene() {
    super.clearScene();
    if (this.mesh) {
      this.mesh.dispose();
      this.mesh = null;
    }
    if (this.pickLayerMesh) {
      this.pickLayerMesh.dispose();
      this.pickLayerMesh = null;
    }
    if (this.pickMesh) {
      this.pickMesh.dispose();
      this.pickMesh = null;
    }
  }

  setShowLine(idList) {
    this.showLine = idList;
    if (this.map) {
      const [cx, cy] = this.map.WebMercatorToCanvasXY(...this.center);
      for (const [li, line] of this.data.entries()) {
        if (idList.includes(line.id)) {
          line.mesh.position.set(cx, cy, 0);
          line.pickLayerMesh.position.set(cx, cy, 0);
          line.pickMesh.position.set(cx, cy, 0);

          this.scene.add(line.mesh);
          this.pickLayerScene.add(line.pickLayerMesh);
          this.pickMeshScene.add(line.pickMesh);
        } else {
          line.mesh.removeFromParent();
          line.pickLayerMesh.removeFromParent();
          line.pickMesh.removeFromParent();
        }
      }
    }
    const obj = {};
    for (const [li, line] of this.data.entries()) {
      if (idList.includes(line.id)) {
        for (const [si, stop] of line.stopList.entries()) {
          obj[stop.coordKey] = stop.data;
        }
      }
    }
    return Array.from(Object.values(obj));
  }

  update() {
    this.clearScene();
    if (!this.map) return;
    if (!this.data) return;

    const [cx, cy] = this.map.WebMercatorToCanvasXY(...this.center);

    const count = this.data.length;
    for (const [li, line] of this.data.entries()) {
      line.mesh = new THREE.InstancedMesh(this.geometry, this.material, line.stopList.length);
      line.pickLayerMesh = new THREE.InstancedMesh(this.pickGeometry, this.pickLayerMaterial, line.stopList.length);
      line.pickMesh = new THREE.InstancedMesh(this.pickGeometry, this.pickMeshMaterial, line.stopList.length);

      line.mesh.position.set(cx, cy, 0);
      line.pickLayerMesh.position.set(cx, cy, 0);
      line.pickMesh.position.set(cx, cy, 0);

      this.scene.add(line.mesh);
      this.pickLayerScene.add(line.pickLayerMesh);
      this.pickMeshScene.add(line.pickMesh);

      for (const [si, stop] of line.stopList.entries()) {
        const { coord, pickColor } = stop;

        const positionV3 = new THREE.Vector3(coord.x, coord.y, li / count);
        const _scale = this.scale * this.size;
        const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);

        const matrix = new THREE.Matrix4();
        matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

        line.mesh.setMatrixAt(si, matrix);
        line.pickLayerMesh.setMatrixAt(si, matrix);
        line.pickMesh.setMatrixAt(si, matrix);

        line.pickMesh.setColorAt(si, pickColor);
      }
    }

    this.setShowLine(this.showLine || []);
  }

  getMaterial({ usePickColor, ...opt }) {
    const material = new THREE.PointsMaterial({
      size: this.size,
      transparent: true,
      sizeAttenuation: true,
      vertexColors: true,

      ...opt,
    });

    material.onBeforeCompile = (shader) => {
      if (usePickColor) {
        shader.vertexShader = shader.vertexShader.replace(
          "#include <color_pars_vertex>",
          `
            #include <color_pars_vertex>
            attribute vec3 pickColor;
          `
        );
        shader.vertexShader = shader.vertexShader.replace(
          "#include <color_vertex>",
          `
            #include <color_vertex>
            #if defined( USE_COLOR_ALPHA )
              vColor = vec4(pickColor, 1.0);
            #elif defined( USE_COLOR )
              vColor = pickColor;
            #endif
          `
        );
      }

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
          #if defined( USE_MAP )
            vec4 textColor = texture2D( map, uv );
            float length = (textColor.r + textColor.g + textColor.b) / 3.0  ;
            if(length < 0.5){
              outgoingLight = vec3(1.0);
            }else{
              outgoingLight = diffuse.rgb;
            }
          #endif
          #include <output_fragment>
        `
      );
    };
    /**
     * 当用到onBeforeCompile回调的时候，
     * 这个回调函数可以用来定义在onBeforeCompile中使用的配置项，
     * 这样three.js就可以根据这个回调返回的字符串来判定使用一个
     * 缓存的编译好的着色器代码还是根据需求重新编译一段新的着色器代码。
     * material.needsUpdate也要设置为true
     */
    material.customProgramCacheKey = () => {
      return JSON.stringify({
        uuid: material.uuid,
        usePickColor: usePickColor,
      });
    };

    return material;
  }

  // 更新标签
  updateLabel() {
    if (!this.labelData) {
      this.scene.remove(this.labelMesh);
    } else {
      this.labelMesh.material.setValues({ map: this.labelData.map });
      this.labelMesh.material.needsUpdate = true;
      const scale = this.map.cameraHeight / 2000;
      this.labelMesh.scale.set(this.labelData.mapWidth * scale, this.labelData.mapHeight * scale, 1);
      const [x, y] = this.map.WebMercatorToCanvasXY(this.labelData.x, this.labelData.y);
      this.labelMesh.position.set(x, y, 10);
      this.scene.add(this.labelMesh);
    }
  }
}
