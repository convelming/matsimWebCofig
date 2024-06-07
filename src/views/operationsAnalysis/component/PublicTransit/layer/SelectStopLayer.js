import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

import * as Bean from "@/utils/Bean";

const STOP_SIZE = 80;

export class SelectStopLayer extends Layer {
  name = "SelectStopLayer";
  size = 0.3;
  scale = 6;
  data = [];
  center = [0, 0];
  color = new THREE.Color(0xffa500);
  texture = new THREE.TextureLoader().load(require("@/assets/image/point1.png"));

  constructor(opt) {
    super(opt);

    this.size = opt.size || this.size;
    this.scale = opt.scale || this.scale;
    this.color = new THREE.Color(opt.color || this.color);

    this.geometry = new THREE.BoxGeometry(STOP_SIZE, STOP_SIZE);
    this.material = new THREE.MeshBasicMaterial({
      depthWrite: false,
      transparent: true,
      map: this.texture,
      color: this.color
    });
    this.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
          outgoingLight = diffuse.rgb;
          #include <output_fragment>
        `
      );
    };

    this.pickGeometry = new THREE.BoxGeometry(STOP_SIZE * 1.1, STOP_SIZE * 1.1);
    this.pickMaterial = new THREE.MeshBasicMaterial();
  }

  onAdd(map) {
    super.onAdd(map);
    this.setSize(this.map.cameraHeight / 10000);
    this.update();
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
    }
  }

  setColor(color) {
    this.color = new THREE.Color(color);
    this.material.setValues({ color: this.color });
    this.material.needsUpdate = true;
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
      const obj = {};
      const center = new Bean.Coord(data[0]);
      let pickColor = 1;
      for (const v of data) {
        const key = `${v.x}-${v.y}`;
        if (!obj[key]) {
          obj[key] = {
            stops: [v],
            pickColor: new THREE.Color(++pickColor),
            coord: new Bean.Coord(v).offset(center),
          };
        } else {
          obj[key].stops.push(v);
        }
      }
      this.data = Object.values(obj);
      this.center = center.toList();
      this.update();
    } catch (error) {
      this.data = [];
      this.center = [0, 0];
      this.update();
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
}
