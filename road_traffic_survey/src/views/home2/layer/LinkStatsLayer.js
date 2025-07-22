import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

import { COLOR_LIST, DEFAULT_COLOR, getColor } from "./LinkLayer";

export class LinkStatsLayer extends Layer {
  name = "LinkStatsLayer";
  size = 100;
  data = [];
  colors = null;

  constructor(opt) {
    super(opt);
    this.size = opt.size || 100;
    this.data = opt.data;
    this.colors = opt.colors || COLOR_LIST;

    this.texture = new THREE.TextureLoader().load(require("@/assets/image/address.png"));

    this.geometry = new THREE.BufferGeometry();

    this.material = this.getMaterial({
      map: this.texture,
      vertexColors: true,
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
    this.mesh.userData.center = [0, 0];
    this.pickLayerMesh.position.set(0, 0, 0);
    this.pickLayerScene.add(this.pickLayerMesh);

    this.pickMaterial = this.getMaterial({
      vertexColors: true,
      usePickColor: true,
    });
    this.pickMesh = new THREE.Points(this.geometry, this.pickMaterial);
    this.mesh.userData.center = [0, 0];
    this.pickMesh.position.set(0, 0, 0);
    this.pickMeshScene.add(this.pickMesh);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      this.handleEventListener(type);
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      this.handleEventListener(type, this.data[data.pickColor - 1]);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setSize(this.map.cameraHeight / 20);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
    this.setSize(this.map.cameraHeight / 20);
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
    if (this.pickMaterial) {
      this.pickMaterial.setValues({ size });
      this.pickMaterial.needsUpdate = true;
    }

    if (this.mesh) this.mesh.position.z = 0;
    if (this.pickLayerMesh) this.pickLayerMesh.position.z = 0;
    if (this.pickMesh) this.pickMesh.position.z = 0;
  }

  setData(data) {
    this.data = data;
    this.update();
  }

  setColors(colors) {
    this.colors = colors || COLOR_LIST;
    this.update();
  }

  update() {
    if (!this.map) return;
    if (!this.data) return;
    const count = this.data.length;
    const positions = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    const pickColors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    const colors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    let center = [];

    for (let i = 0; i < count; i++) {
      const v = this.data[i];
      if (i == 0) center = [v.x, v.y];

      positions.setXYZ(i, v.x - center[0], v.y - center[1], 0);

      const pickColor = new THREE.Color(i + 1);
      pickColors.setXYZ(i, pickColor.r, pickColor.g, pickColor.b);

      const color = getColor(v.type, this.colors) || DEFAULT_COLOR;
      colors.setXYZ(i, color.r, color.g, color.b);
    }

    this.geometry.setAttribute("position", positions);
    this.geometry.setAttribute("pickColor", pickColors);
    this.geometry.setAttribute("color", colors);
    this.geometry.needsUpdate = true;
    this.geometry.computeBoundingSphere();

    let [x, y] = this.map.WebMercatorToCanvasXY(...center);

    this.mesh.userData.center = center;
    this.mesh.position.set(x, y, 0);

    this.pickLayerMesh.userData.center = center;
    this.pickLayerMesh.position.set(x, y, 0);

    this.pickMesh.userData.center = center;
    this.pickMesh.position.set(x, y, 0);
  }

  getMaterial({ usePickColor, ...opt }) {
    const material = new THREE.PointsMaterial({
      size: this.size,
      transparent: true,
      sizeAttenuation: true,

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
            vColor.rgb = pickColor.rgb;
          `
        );
      }
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
}
