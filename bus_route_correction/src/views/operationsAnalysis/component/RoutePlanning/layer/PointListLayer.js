import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

export class PointListLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.geometry = new THREE.CylinderGeometry(100, 100, 25, 32); //new THREE.BoxGeometry(80, 80, 80); //new THREE.PlaneGeometry(100, 100);

    const m4 = new THREE.Matrix4().makeTranslation(0, 0, this.geometry.parameters.height / 2);
    m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    m4.multiply(new THREE.Matrix4().makeRotationY(-Math.PI / 2));

    this.geometry.applyMatrix4(m4);

    this.materialTop = new THREE.MeshBasicMaterial({ color: opt.color || "#76819a", opacity: 0.8, transparent: true, map: new THREE.TextureLoader().load(require("@/assets/image/停机坪.svg")) });
    this.materialWall = new THREE.MeshBasicMaterial({ color: opt.color || "#76819a", opacity: 0.8, transparent: true });

    // const mesh = new THREE.InstancedMesh(this.geometry, [this.materialWall, this.materialWall, this.materialTop], 1);
    // const matrix4 = new THREE.Matrix4().makeTranslation(0, 0, 0);

    // mesh.setMatrixAt(0, matrix4);
    // mesh.instanceMatrix.needsUpdate = true;
    // this.scene.add(mesh);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER && this.center) {
      const center = this.center;
      const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);
      this.mesh.position.set(x, y, 0);
    }
  }

  setPointList(pointList) {
    this.pointList = pointList;
    this.center = null;
    this.update();
  }
  clearScene() {
    super.clearScene();
    if (this.mesh) this.mesh.dispose();
  }
  update() {
    this.clearScene();
    const pointList = this.pointList;
    const center = [0, 0];

    const mesh = new THREE.InstancedMesh(this.geometry, [this.materialWall, this.materialWall, this.materialTop], pointList.length);

    for (let i = 0; i < pointList.length; i++) {
      const node = pointList[i];
      if (i == 0) {
        center[0] = node.x;
        center[1] = node.y;
      }

      const matrix4 = new THREE.Matrix4().makeTranslation(node.x - center[0], node.y - center[1], node.sample_1 || 0);
      // matrix4.multiply(new THREE.Matrix4().makeScale(10,10,10));

      mesh.setMatrixAt(i, matrix4);
    }

    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;

    this.scene.add(mesh);

    this.mesh = mesh;
    this.center = center;

    if (this.map) {
      this.on(MAP_EVENT.UPDATE_CENTER);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
  }
}
