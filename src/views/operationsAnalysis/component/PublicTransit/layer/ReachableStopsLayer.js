import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import { getTextImage } from "@/mymap/utils/index";

const STOP_SIZE = 80;

export class ReachableStopsLayer extends Layer {
  name = "ReachableStopsLayer";
  size = 50;
  scale = 3;
  color = new THREE.Color(0xffffff);

  data = [];
  center = [0, 0];
  highStopId = -1;

  texture = new THREE.TextureLoader().load(require("@/assets/image/point.png"));

  constructor(opt) {
    super(opt);

    this.size = opt.size || this.size;
    this.data = opt.data || this.data;
    this.color = new THREE.Color(opt.color || this.color);

    this.geometry = new THREE.BoxGeometry(STOP_SIZE, STOP_SIZE);
    this.material = new THREE.MeshBasicMaterial({
      depthWrite: false,
      transparent: true,
      map: this.texture,
    });
    this.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
          #if defined(USE_MAP) && defined(USE_COLOR)
            if(length(texture2D( map, vUv ).rgb) < .01){
              outgoingLight = vec3(1.0);
            }else{
              outgoingLight = vColor.rgb;
            }
          #endif
          #include <output_fragment>
        `
      );
    };

    this.pickGeometry = new THREE.BoxGeometry(STOP_SIZE * 1.1, STOP_SIZE * 1.1);
    this.pickMaterial = new THREE.MeshBasicMaterial();

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
      })
    );
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setSize(this.map.cameraHeight / 10000);
      this.update();
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const pickColor = new THREE.Color(data.pickColor);
      const item = this.data.find((v2) => v2.pickColor.equals(pickColor));
      if (item) {
        this.handleEventListener(type, item.data);
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE_PICK) {
      let labelData = null;
      if (data.layerId == this.id) {
        const pickColor = new THREE.Color(data.pickColor);
        const item = this.data.find((v2) => v2.pickColor.equals(pickColor));
        if (item) {
          if (this.labelData && item.data.stop.name == this.labelData.name) {
            labelData = this.labelData;
          } else {
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

  setSize(size = this.size, scale = this.scale) {
    this.size = size;
    this.scale = scale;
    const data = this.data;
    const count = data.length;
    for (let i = 0; i < count; i++) {
      const { coord } = data[i];
      const positionV3 = new THREE.Vector3(coord.x, coord.y, i / count);
      const _scale = scale * size;
      const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);

      const matrix = new THREE.Matrix4();
      matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

      if (this.mesh) this.mesh.setMatrixAt(i, matrix);
      if (this.pickLayerMesh) this.pickLayerMesh.setMatrixAt(i, matrix);
      if (this.pickMesh) this.pickMesh.setMatrixAt(i, matrix);
    }

    if (this.mesh) this.mesh.instanceMatrix.needsUpdate = true;
    if (this.pickLayerMesh)
      this.pickLayerMesh.instanceMatrix.needsUpdate = true;
    if (this.pickMesh) this.pickMesh.instanceMatrix.needsUpdate = true;
  }

  setData(data) {
    try {
      const center = data[0].center;
      const stopList = [];
      let pickColorNum = 1;
      for (const route of data) {
        for (const stop of route.stops) {
          stopList.push({
            coord: stop.coord.offset(center),
            pickColor: new THREE.Color(++pickColorNum),
            id: stop.uuid,
            data: stop.toJSON(),
          });
        }
      }
      this.data = stopList;
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
    if (this.mesh) {
      for (let i = 0; i < this.mesh.count; i++) {
        this.mesh.setColorAt(i, this.color);
        this.mesh.instanceColor.needsUpdate = true;
      }
    }
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

  update() {
    this.clearScene();
    if (!this.map) return;
    if (!this.data) return;

    const data = this.data;
    const count = data.length;
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, count);
    const pickLayerMesh = new THREE.InstancedMesh(
      this.pickGeometry,
      this.pickMaterial,
      count
    );
    const pickMesh = new THREE.InstancedMesh(
      this.pickGeometry,
      this.pickMaterial,
      count
    );

    for (let i = 0; i < count; i++) {
      const { coord, pickColor } = data[i];

      const positionV3 = new THREE.Vector3(coord.x, coord.y, i / count);
      const _scale = this.scale * this.size;
      const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);

      const matrix = new THREE.Matrix4();
      matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

      mesh.setMatrixAt(i, matrix);
      pickLayerMesh.setMatrixAt(i, matrix);
      pickMesh.setMatrixAt(i, matrix);

      mesh.setColorAt(i, this.color);
      pickLayerMesh.setColorAt(i, this.pickLayerColor);
      pickMesh.setColorAt(i, pickColor);
    }

    let [x, y] = this.map.WebMercatorToCanvasXY(...this.center);

    mesh.position.set(x, y, 0);
    pickLayerMesh.position.set(x, y, 0);
    pickMesh.position.set(x, y, 0);

    this.mesh = mesh;
    this.pickLayerMesh = pickLayerMesh;
    this.pickMesh = pickMesh;

    this.scene.add(mesh);
    this.pickLayerScene.add(pickLayerMesh);
    this.pickMeshScene.add(pickMesh);
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
            if(length(texture2D( map, uv ).rgb) < .01){
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
      const height = 0.05;
      const width =
        (height * this.labelData.mapWidth) / this.labelData.mapHeight;

      this.labelMesh.material.setValues({ map: this.labelData.map });
      this.labelMesh.material.needsUpdate = true;
      this.labelMesh.scale.set(width, height, 1);
      const [x, y] = this.map.WebMercatorToCanvasXY(
        this.labelData.x,
        this.labelData.y
      );
      this.labelMesh.position.set(x, y, 10);
      this.scene.add(this.labelMesh);
    }
  }
}
