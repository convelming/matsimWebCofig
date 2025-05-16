import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
import SpriteText from "./SpriteText.js";

export class PinkLayer extends Layer {
  constructor(opt) {
    super(opt);

    this.geometry = new THREE.CylinderGeometry(80, 80, 80, 32); //new THREE.BoxGeometry(80, 80, 80); //new THREE.PlaneGeometry(100, 100);
    const m4 = new THREE.Matrix4().makeTranslation(0, 0, -30);
    m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    m4.multiply(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
    this.geometry.applyMatrix4(m4);
    this.material1 = new THREE.MeshBasicMaterial({ opacity: 1, transparent: true, map: new THREE.TextureLoader().load(require("../data/停机坪.svg")) });
    this.material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    this.material3 = new THREE.MeshBasicMaterial({});
  }
  setPickLayerColor(pickLayerColor) {
    console.log("pickLayerColor", pickLayerColor);

    this.pickLayerColor = new THREE.Color(pickLayerColor);
    this.material2.setValues({ color: pickLayerColor });
    this.material2.needsUpdate = true;
  }

  setPinkList(pinkList) {
    const list = pinkList.map((item) => {
      const [x, y] = WGS84ToMercator(item.wgs_lon, item.wgs_lat);
      return { x, y, z: item.SAMPLE_1, ...item };
    });

    this.pinkList = list;
    this.center = { x: list[0].x, y: list[0].y };
    this.update();
  }

  clearScene() {
    super.clearScene();
    if (this.mesh1) this, this.mesh1.removeFromParent();
    if (this.mesh2) this, this.mesh2.removeFromParent();
    if (this.mesh3) this, this.mesh3.removeFromParent();
    if (this.mesh4) this, this.mesh4.removeFromParent();
  }

  update() {
    this.clearScene();
    if (!this.pinkList) return;

    const center = this.center;

    // 全部起/降点
    this.mesh1 = new THREE.InstancedMesh(this.geometry, this.material1, this.pinkList.length);
    this.mesh2 = new THREE.InstancedMesh(this.geometry, this.material2, this.pinkList.length);
    this.mesh3 = new THREE.InstancedMesh(this.geometry, this.material3, this.pinkList.length);
    this.mesh4 = new THREE.Group();
    for (const index in this.pinkList) {
      const pickColor = new THREE.Color(1 + Number(index));

      const node = this.pinkList[index];

      const matrix4 = new THREE.Matrix4().makeTranslation(node.x - center.x, node.y - center.y, node.z);

      this.mesh1.setMatrixAt(index, matrix4);
      this.mesh2.setMatrixAt(index, matrix4);
      this.mesh3.setMatrixAt(index, matrix4);

      this.mesh3.setColorAt(index, pickColor);

      const mesh = new SpriteText(node.name, 12, "#000");
      mesh.borderRadius = 2;
      mesh.backgroundColor = "#fff";
      mesh.center.set(0.5, 0);
      mesh.renderOrder = this.zIndex;
      mesh.position.set(node.x - center.x, node.y - center.y, node.z);
      this.mesh4.add(mesh);
    }

    if (this.mesh1.instanceMatrix) this.mesh1.instanceMatrix.needsUpdate = true;
    if (this.mesh2.instanceMatrix) this.mesh2.instanceMatrix.needsUpdate = true;
    if (this.mesh3.instanceMatrix) this.mesh3.instanceMatrix.needsUpdate = true;

    if (this.mesh3.instanceColor) this.mesh3.instanceColor.needsUpdate = true;

    this.scene.add(this.mesh1);
    this.scene.add(this.mesh4);
    this.pickLayerScene.add(this.mesh2);
    this.pickMeshScene.add(this.mesh3);
    if (this.map) {
      this.on(MAP_EVENT.UPDATE_CENTER);
    }
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER && this.center) {
      const center = this.center;
      const [x, y] = this.map.WebMercatorToCanvasXY(center.x, center.y);
      for (const mesh of this.scene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickLayerScene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickMeshScene.children) {
        mesh.position.set(x, y, 0);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
  }
}
