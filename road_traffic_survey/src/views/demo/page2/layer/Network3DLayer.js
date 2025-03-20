import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

export class Network3DLayer extends Layer {
  startPink = null;
  endPink = null;
  constructor(opt) {
    super(opt);

    this.selectPinkNodesGeometry = new THREE.CircleGeometry(110, 32);

    const pinkSize = 80;
    this.pinkNodesGeometry = new THREE.BoxGeometry(80, 80, 80); //new THREE.PlaneGeometry(100, 100);
    const m4 = new THREE.Matrix4().makeTranslation(0, 0, -30);
    m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    this.pinkNodesGeometry.applyMatrix4(m4);
    this.pinkNodesMaterial = new THREE.MeshBasicMaterial({ opacity: 1, transparent: true, map: new THREE.TextureLoader().load(require("../data/停机坪.svg")) });
    this.pinkNodesPickLayerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    this.pinkNodesPickItemMaterial = new THREE.MeshBasicMaterial({});

    this.nodesGeometry = new THREE.BoxGeometry(5, 5, 5);
    this.nodesMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.8, transparent: true });
    this.nodesPickLayerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.nodesPickItemMaterial = new THREE.MeshBasicMaterial({});

    this.linksGeometry = new THREE.BufferGeometry();
    this.linksMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, opacity: 0.1 });
  }

  setPickLayerColor(pickLayerColor) {
    console.log("pickLayerColor", pickLayerColor);

    this.pickLayerColor = new THREE.Color(pickLayerColor);
    this.nodesPickLayerMaterial.setValues({ color: pickLayerColor });
    this.nodesPickLayerMaterial.needsUpdate = true;
    this.pinkNodesPickLayerMaterial.setValues({ color: pickLayerColor });
    this.pinkNodesPickLayerMaterial.needsUpdate = true;
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
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
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const index = data.pickColor - 1;
      this.handleEventListener(type, this.pinkNodes[index] || null);
    }
  }

  setStartPink(pink) {
    this.startPink = pink;
    for (const index in this.pinkNodes) {
      const node = this.pinkNodes[index];
      if (this.startPink && node.id == this.startPink.id) {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#f4ea2a"));
      } else if (this.endPink && node.id == this.endPink.id) {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#409eff"));
      } else {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#1afa29"));
      }
    }
    if (this.pinkNodesMesh.instanceColor) this.pinkNodesMesh.instanceColor.needsUpdate = true;
  }

  setEndPink(pink) {
    this.endPink = pink;
    for (const index in this.pinkNodes) {
      const node = this.pinkNodes[index];
      if (this.startPink && node.id == this.startPink.id) {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#f4ea2a"));
      } else if (this.endPink && node.id == this.endPink.id) {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#409eff"));
      } else {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#1afa29"));
      }
    }
    if (this.pinkNodesMesh.instanceColor) this.pinkNodesMesh.instanceColor.needsUpdate = true;
  }

  setData(data) {
    const nodeMap = {};
    for (const link of data) {
      nodeMap[link.fromNode] = { ...link.fromCoord };
      nodeMap[link.toNode] = { ...link.toCoord };
    }
    this.pinkNodes = ["n11978", "n12951", "n15905", "n1800", "n22086", "n4782"].map((v) => ({ id: v, ...(nodeMap[v] || {}) }));
    this.nodes = Object.entries(nodeMap).map((v) => ({ id: v[0], ...v[1] }));
    this.links = data;
    this.update();
  }

  clearScene() {
    super.clearScene();
    if (this.pinkNodesMesh) this, this.pinkNodesMesh.removeFromParent();
    if (this.pinkNodesPickLayerMesh) this, this.pinkNodesPickLayerMesh.removeFromParent();
    if (this.pinkNodesPickItemMesh) this, this.pinkNodesPickItemMesh.removeFromParent();
    if (this.nodesMesh) this, this.nodesMesh.removeFromParent();
    if (this.nodesPickLayerMesh) this, this.nodesPickLayerMesh.removeFromParent();
    if (this.nodesPickItemMesh) this, this.nodesPickItemMesh.removeFromParent();

    if (this.linksGeometry) {
      this.linksGeometry.dispose();
      this.linksGeometry = null;
    }
  }

  update() {
    this.clearScene();
    if (!this.nodes || !this.links) return;

    const center = [this.nodes[0].x, this.nodes[0].y];

    // 全部起/降点
    this.pinkNodesMesh = new THREE.InstancedMesh(this.pinkNodesGeometry, this.pinkNodesMaterial, this.pinkNodes.length);
    this.pinkNodesPickLayerMesh = new THREE.InstancedMesh(this.pinkNodesGeometry, this.pinkNodesPickLayerMaterial, this.pinkNodes.length);
    this.pinkNodesPickItemMesh = new THREE.InstancedMesh(this.pinkNodesGeometry, this.pinkNodesPickItemMaterial, this.pinkNodes.length);
    for (const index in this.pinkNodes) {
      const pickColor = new THREE.Color(1 + Number(index));

      const node = this.pinkNodes[index];

      const matrix4 = new THREE.Matrix4().makeTranslation(node.x - center[0], node.y - center[1], node.z);

      this.pinkNodesMesh.setMatrixAt(index, matrix4);
      if (this.startPink && node.id == this.startPink.id) {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#f4ea2a"));
      } else if (this.endPink && node.id == this.endPink.id) {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#409eff"));
      } else {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#1afa29"));
      }
      this.pinkNodesPickLayerMesh.setMatrixAt(index, matrix4);
      this.pinkNodesPickItemMesh.setMatrixAt(index, matrix4);

      this.pinkNodesPickItemMesh.setColorAt(index, pickColor);
    }

    if (this.pinkNodesMesh.instanceMatrix) this.pinkNodesMesh.instanceMatrix.needsUpdate = true;
    if (this.pinkNodesMesh.instanceColor) this.pinkNodesMesh.instanceColor.needsUpdate = true;
    if (this.pinkNodesPickLayerMesh.instanceMatrix) this.pinkNodesPickLayerMesh.instanceMatrix.needsUpdate = true;
    if (this.pinkNodesPickItemMesh.instanceMatrix) this.pinkNodesPickItemMesh.instanceMatrix.needsUpdate = true;

    if (this.pinkNodesPickItemMesh.instanceColor) this.pinkNodesPickItemMesh.instanceColor.needsUpdate = true;

    //  点
    this.nodesMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesMaterial, this.nodes.length);
    this.nodesPickLayerMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesPickLayerMaterial, this.nodes.length);
    this.nodesPickItemMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesPickItemMaterial, this.nodes.length);

    for (const index in this.nodes) {
      const pickColor = new THREE.Color(1 + Number(index));
      const node = this.nodes[index];

      const matrix4 = new THREE.Matrix4().makeTranslation(node.x - center[0], node.y - center[1], node.z);

      this.nodesMesh.setMatrixAt(index, matrix4);
      this.nodesPickLayerMesh.setMatrixAt(index, matrix4);
      this.nodesPickItemMesh.setMatrixAt(index, matrix4);

      this.nodesPickItemMesh.setColorAt(index, pickColor);
    }
    if (this.nodesMesh.instanceMatrix) this.nodesMesh.instanceMatrix.needsUpdate = true;
    if (this.nodesPickLayerMesh.instanceMatrix) this.nodesPickLayerMesh.instanceMatrix.needsUpdate = true;
    if (this.nodesPickItemMesh.instanceMatrix) this.nodesPickItemMesh.instanceMatrix.needsUpdate = true;

    if (this.nodesPickItemMesh.instanceColor) this.nodesPickItemMesh.instanceColor.needsUpdate = true;

    //  线
    const points = [];
    for (const link of this.links) {
      points.push(new THREE.Vector3(link.fromCoord.x - center[0], link.fromCoord.y - center[1], link.fromCoord.z));
      points.push(new THREE.Vector3(link.toCoord.x - center[0], link.toCoord.y - center[1], link.toCoord.z));
    }
    this.linksGeometry = new THREE.BufferGeometry().setFromPoints(points);
    this.linksMesh = new THREE.LineSegments(this.linksGeometry, this.linksMaterial);

    // 添加到视图
    this.center = center;
    if (this.map) {
      const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);

      this.pinkNodesMesh.position.set(x, y, 0.1);
      this.pinkNodesPickLayerMesh.position.set(x, y, 0.1);
      this.pinkNodesPickItemMesh.position.set(x, y, 0.1);

      this.nodesMesh.position.set(x, y, 0.2);
      this.nodesPickLayerMesh.position.set(x, y, 0.2);
      this.nodesPickItemMesh.position.set(x, y, 0.2);

      this.linksMesh.position.set(x, y, 0.3);
    }
    this.scene.add(this.pinkNodesMesh);
    this.pickLayerScene.add(this.pinkNodesPickLayerMesh);
    this.pickMeshScene.add(this.pinkNodesPickItemMesh);

    this.scene.add(this.nodesMesh);
    // this.pickLayerScene.add(this.nodesPickLayerMesh);
    // this.pickMeshScene.add(this.nodesPickItemMesh);

    // this.scene.add(this.linksMesh);
  }
}
