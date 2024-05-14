import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import { getTextImage } from "@/mymap/utils/index";

export class BusStopLayer extends Layer {
  name = "BusStopLayer";
  size = 50;
  color = new THREE.Color(0xffffff);
  highStopColor = new THREE.Color(0xff0000);

  data = [];
  center = [0, 0];
  highStopId = -1;

  constructor(opt) {
    super(opt);

    this.size = opt.size || this.size;
    this.data = opt.data || this.data;
    this.color = new THREE.Color(opt.color || this.color);
    this.highStopColor = new THREE.Color(opt.highStopColor || this.highStopColor);

    this.texture = new THREE.TextureLoader().load(require("@/assets/image/point.png"));

    this.geometry = new THREE.BufferGeometry();
    this.material = this.getMaterial({
      map: this.texture,
      usePickColor: false,
    });
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.userData.center = [0, 0];
    this.mesh.position.set(0, 0, 0);
    this.scene.add(this.mesh);

    this.pickLayerMaterial = this.getMaterial({
      color: this.pickLayerColor,
      vertexColors: false,
      usePickColor: false,
    });
    this.pickLayerMesh = new THREE.Points(this.geometry, this.pickLayerMaterial);
    this.pickLayerMesh.userData.center = [0, 0];
    this.pickLayerMesh.position.set(0, 0, 0);
    this.pickLayerScene.add(this.pickLayerMesh);

    this.pickMeshMaterial = this.getMaterial({
      usePickColor: true,
    });
    this.pickMesh = new THREE.Points(this.geometry, this.pickMeshMaterial);
    this.pickMesh.userData.center = [0, 0];
    this.pickMesh.position.set(0, 0, 0);
    this.pickMeshScene.add(this.pickMesh);

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
      })
    );
    this.labelMesh.center.set(0.5, -0.5);
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
      this.handleEventListener(type);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setSize(this.map.cameraHeight / 30);
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
    this.setSize(this.map.cameraHeight / 30);
    this.update();
  }

  setSize(size) {
    this.size = size;

    if (this.material) {
      this.material.setValues({ size });
      this.material.needsUpdate = true;
    }

    if (this.pickLayerMaterial) {
      this.pickLayerMaterial.setValues({ size });
      this.pickLayerMaterial.needsUpdate = true;
    }
    if (this.pickMeshMaterial) {
      this.pickMeshMaterial.setValues({ size });
      this.pickMeshMaterial.needsUpdate = true;
    }
  }

  setData(data, highStopId = null) {
    try {
      const center = data.center;
      this.data = data.stops.map((v, i) => {
        return {
          coord: v.coord.offset(center),
          pickColor: new THREE.Color(i + 1),
          id: v.uuid,
          data: v.toJSON(),
        };
      });
      this.center = center.toList();
      this.highStopId = highStopId;
      this.update();
    } catch (error) {
      this.data = [];
      this.center = [0, 0];
      this.update();
    }
  }

  setHighStopId(id) {
    this.highStopId = id;
    this.update();
  }

  update() {
    if (!this.map) return;
    if (!this.data) return;

    let data = this.data;
    const count = data.length;
    const positions = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    const pickColors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    const colors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    const color = new THREE.Color(this.color);
    const highStopColor = new THREE.Color(this.highStopColor);
    for (let i = 0; i < count; i++) {
      const { coord, pickColor, id } = data[i];
      positions.setXYZ(i, coord.x, coord.y, 0);

      pickColors.setXYZ(i, pickColor.r, pickColor.g, pickColor.b);
      if (id == this.highStopId) {
        colors.setXYZ(i, highStopColor.r, highStopColor.g, highStopColor.b);
      } else {
        colors.setXYZ(i, color.r, color.g, color.b);
      }
    }

    this.geometry.setAttribute("position", positions);
    this.geometry.setAttribute("pickColor", pickColors);
    this.geometry.setAttribute("color", colors);
    this.geometry.computeBoundingSphere();
    this.geometry.needsUpdate = true;

    let [x, y] = this.map.WebMercatorToCanvasXY(...this.center);

    this.mesh.position.set(x, y, 0);
    this.pickLayerMesh.position.set(x, y, 0);
    this.pickMesh.position.set(x, y, 0);
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
              outgoingLight = vColor.rgb;
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

  updateLabel() {
    if (!this.labelData) {
      this.scene.remove(this.labelMesh);
    } else {
      this.labelMesh.material.setValues({ map: this.labelData.map });
      this.labelMesh.material.needsUpdate = true;
      this.labelMesh.scale.set((this.labelData.mapWidth * this.size) / 80, (this.labelData.mapHeight * this.size) / 80, 1);
      const [x, y] = this.map.WebMercatorToCanvasXY(this.labelData.x, this.labelData.y);
      this.labelMesh.position.set(x, y, 0);
      this.scene.add(this.labelMesh);
    }
  }
}
