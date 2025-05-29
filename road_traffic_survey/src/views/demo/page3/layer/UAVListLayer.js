import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

import UAVListLayerWorker from "./UAVListLayer.worker";

import { PathCurve } from "./PathCurve";

const loader = new STLLoader();

export class UAVListLayer extends Layer {
  center = [0, 0];
  selecIndex = -1;
  constructor(opt) {
    super(opt);
    this.linkWidth = opt.linkWidth || 5;
    this.nodeSize = opt.nodeSize || 10;
    this.nodeMeshList = [];
    this.nodeMeshList1 = [];
    this.nodeMeshList2 = [];
    this.nodeGeometry = new THREE.BoxGeometry(this.nodeSize, this.nodeSize, this.nodeSize);
    this.nodesMaterial = new THREE.MeshBasicMaterial({ color: opt.color || "#409EFF", opacity: 0.8, transparent: true });
    this.nodesMaterial_s = new THREE.MeshBasicMaterial({ depthFunc: THREE.AlwaysDepth, color: "red", opacity: 0.8, transparent: true });
    this.nodesMaterial1 = new THREE.MeshBasicMaterial({});

    this.linkMeshList = [];
    this.linkMeshList1 = [];
    this.linkMeshList2 = [];
    this.linkMaterial = new THREE.MeshBasicMaterial({ color: opt.color || "#409EFF", opacity: 0.8, transparent: true });
    this.linkMaterial_s = new THREE.MeshBasicMaterial({ depthFunc: THREE.AlwaysDepth, color: "red", opacity: 0.8, transparent: true });
    this.linkMaterial1 = new THREE.MeshBasicMaterial({});

    this.UAVGeometry = new THREE.BoxGeometry(50, 50, 50);
    this.UAVMaterial = new THREE.MeshBasicMaterial({ color: "#275994" });
    this.UAVMaterial1 = new THREE.MeshBasicMaterial({});
    this.UAVMaterial2 = new THREE.MeshBasicMaterial({});
    this.UAVMesh = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial, 1);
    this.UAVMesh1 = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial1, 1);
    this.UAVMesh2 = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial2, 1);

    loader.load(process.env.VUE_APP_BASE_API + "/models/无人机.stl", (geometry) => {
      const m4 = new THREE.Matrix4().makeScale(200, 200, 200);
      m4.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
      geometry.applyMatrix4(m4);
      this.UAVGeometry = geometry;
      this.initUAV();
    });

    this.worker = new UAVListLayerWorker();
    this.worker.onmessage = (e) => {
      switch (e.data.key) {
        case "addPaths": {
          break;
        }
        case "getPointsByTime": {
          this.updateUAV(e.data.data);
          break;
        }
        case "clearPaths": {
          break;
        }
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
  }

  setPickLayerColor(color) {
    super.setPickLayerColor(color);
    this.nodesMaterial1.setValues({ color: color });
    this.nodesMaterial1.needsUpdate = true;
    this.linkMaterial1.setValues({ color: color });
    this.linkMaterial1.needsUpdate = true;
    this.UAVMaterial1.setValues({ color: color });
    this.UAVMaterial1.needsUpdate = true;
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
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
      const pickColorNum = data.pickColor;
      this.setSelectPath(pickColorNum - 1);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
  }

  setPaths(paths) {
    const center = [paths[0].center[0], paths[0].center[1]];
    this.pathList = paths.map((v) => new PathCurve(v.id, v.nodes, new THREE.Vector3(center[0], center[1], 0)));
    this.center = center;
    this.worker.postMessage({
      key: "setPaths",
      paths: paths,
      center: center,
    });
    this.updatePaths();
    this.initUAV();
  }

  setTime(time) {
    this.time = time;
    this.worker.postMessage({
      key: "getPointsByTime",
      time: time,
    });
  }

  setSelectPath(selecIndex) {
    const oldIndex = this.selecIndex;
    this.selecIndex = selecIndex;
    console.log(this.pathList[this.selecIndex]);

    if (oldIndex > -1) {
      this.nodeMeshList[oldIndex].material = this.nodesMaterial;
      this.nodeMeshList[oldIndex].needsUpdate = true;
      this.nodeMeshList[oldIndex].renderOrder = 0;
      this.linkMeshList[oldIndex].material = this.linkMaterial;
      this.linkMeshList[oldIndex].needsUpdate = true;
      this.linkMeshList[oldIndex].renderOrder = 0;
    }
    if (selecIndex > -1) {
      this.nodeMeshList[selecIndex].material = this.nodesMaterial_s;
      this.nodeMeshList[selecIndex].needsUpdate = true;
      this.nodeMeshList[selecIndex].renderOrder = 9999;
      this.linkMeshList[selecIndex].material = this.linkMaterial_s;
      this.linkMeshList[selecIndex].needsUpdate = true;
      this.linkMeshList[selecIndex].renderOrder = 9999;
    }
  }

  updatePaths() {
    for (const mesh of this.nodeMeshList) {
      mesh.removeFromParent();
      mesh.dispose();
    }
    for (const mesh of this.nodeMeshList1) {
      mesh.removeFromParent();
      mesh.dispose();
    }
    for (const mesh of this.nodeMeshList2) {
      mesh.removeFromParent();
      mesh.dispose();
    }
    this.nodeMeshList = [];
    this.nodeMeshList1 = [];
    this.nodeMeshList2 = [];
    for (const mesh of this.linkMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      mesh.dispose();
    }
    for (const mesh of this.linkMeshList1) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      mesh.dispose();
    }
    for (const mesh of this.linkMeshList2) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      mesh.dispose();
    }
    this.linkMeshList = [];
    this.linkMeshList1 = [];
    this.linkMeshList2 = [];

    if (!this.pathList) return;
    let x = 0,
      y = 0;
    if (this.map) [x, y] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
    for (let pIndex = 0; pIndex < this.pathList.length; pIndex++) {
      const path = this.pathList[pIndex];

      const nodesMaterial2 = new THREE.MeshBasicMaterial({ color: new THREE.Color(Number(pIndex + 1)) });
      const nodesMesh = new THREE.InstancedMesh(this.nodeGeometry, this.nodesMaterial, path.nodes.length);
      const nodesMesh1 = new THREE.InstancedMesh(this.nodeGeometry, this.nodesMaterial1, path.nodes.length);
      const nodesMesh2 = new THREE.InstancedMesh(this.nodeGeometry, nodesMaterial2, path.nodes.length);
      for (const index in path.nodes) {
        const node = path.nodes[index];
        const matrix4 = new THREE.Matrix4().makeTranslation(node.v.x, node.v.y, node.v.z);
        nodesMesh.setMatrixAt(index, matrix4);
        nodesMesh1.setMatrixAt(index, matrix4);
        nodesMesh2.setMatrixAt(index, matrix4);
      }

      if (nodesMesh.instanceMatrix) nodesMesh.instanceMatrix.needsUpdate = true;
      if (nodesMesh1.instanceMatrix) nodesMesh1.instanceMatrix.needsUpdate = true;
      if (nodesMesh2.instanceMatrix) nodesMesh2.instanceMatrix.needsUpdate = true;
      if (nodesMesh2.instanceColor) nodesMesh2.instanceColor.needsUpdate = true;
      nodesMesh.position.set(x, y, 0);
      nodesMesh1.position.set(x, y, 0);
      nodesMesh2.position.set(x, y, 0);
      this.nodeMeshList.push(nodesMesh);
      this.nodeMeshList1.push(nodesMesh1);
      this.nodeMeshList2.push(nodesMesh2);
      this.scene.add(nodesMesh);
      this.pickLayerScene.add(nodesMesh1);
      this.pickMeshScene.add(nodesMesh2);

      const linkGeometry = new THREE.TubeGeometry(path, path.nodes.length * 4, this.linkWidth, 8, false);
      const linkMaterial2 = new THREE.MeshBasicMaterial({ color: new THREE.Color(Number(pIndex + 1)) });
      const linkMesh = new THREE.Mesh(linkGeometry, this.linkMaterial);
      const linkMesh1 = new THREE.Mesh(linkGeometry, this.linkMaterial1);
      const linkMesh2 = new THREE.Mesh(linkGeometry, linkMaterial2);
      linkMesh.position.set(x, y, 0);
      linkMesh1.position.set(x, y, 0);
      linkMesh2.position.set(x, y, 0);
      this.linkMeshList.push(linkMesh);
      this.linkMeshList1.push(linkMesh1);
      this.linkMeshList2.push(linkMesh2);
      this.scene.add(linkMesh);
      this.pickLayerScene.add(linkMesh1);
      this.pickMeshScene.add(linkMesh2);
    }
  }

  initUAV() {
    if (this.UAVMesh) {
      this.UAVMesh.removeFromParent();
      this.UAVMesh.dispose();
    }
    if (this.UAVMesh1) {
      this.UAVMesh1.removeFromParent();
      this.UAVMesh1.dispose();
    }
    if (this.UAVMesh2) {
      this.UAVMesh2.removeFromParent();
      this.UAVMesh2.dispose();
    }
    if (!this.pathList) return;
    this.UAVMesh = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial, this.pathList.length);
    this.UAVMesh1 = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial1, this.pathList.length);
    this.UAVMesh2 = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial2, this.pathList.length);
    for (let pIndex = 0; pIndex < this.pathList.length; pIndex++) {
      const matrix4 = new THREE.Matrix4().makeTranslation(0, 0, -1000);
      this.UAVMesh.setMatrixAt(pIndex, matrix4);
      this.UAVMesh1.setMatrixAt(pIndex, matrix4);
      this.UAVMesh2.setMatrixAt(pIndex, matrix4);
      this.UAVMesh2.setColorAt(pIndex, new THREE.Color(Number(pIndex + 1)));
    }
    if (this.UAVMesh.instanceMatrix) this.UAVMesh.instanceMatrix.needsUpdate = true;
    if (this.UAVMesh1.instanceMatrix) this.UAVMesh1.instanceMatrix.needsUpdate = true;
    if (this.UAVMesh2.instanceMatrix) this.UAVMesh2.instanceMatrix.needsUpdate = true;
    if (this.UAVMesh2.instanceColor) this.UAVMesh2.instanceColor.needsUpdate = true;

    let x = 0,
      y = 0;
    if (this.map) [x, y] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
    this.UAVMesh.position.set(x, y, 0);
    this.UAVMesh1.position.set(x, y, 0);
    this.UAVMesh2.position.set(x, y, 0);
    this.scene.add(this.UAVMesh);
    this.pickLayerScene.add(this.UAVMesh1);
    this.pickMeshScene.add(this.UAVMesh2);
  }

  updateUAV(data) {
    // console.log(data);
    if (!this.pathList) return;
    const { time, points } = data;
    for (let pIndex = 0; pIndex < points.length; pIndex++) {
      const { point, speed, dir } = points[pIndex];
      const matrix4 = new THREE.Matrix4().makeTranslation(point.x, point.y, point.z);
      this.UAVMesh.setMatrixAt(pIndex, matrix4);
      this.UAVMesh1.setMatrixAt(pIndex, matrix4);
      this.UAVMesh2.setMatrixAt(pIndex, matrix4);
    }

    if (this.lockSelect && points[this.selecIndex]) {
      const { point, speed, dir } = points[this.selecIndex];
      this.map.setCenter([point.x + this.center[0], point.y + this.center[1]]);
      this.map.setCameraHeight(point.z + 500);
      this.map.setPitchAndRotation((Math.atan((point.z + 500) / 1000) * 180) / Math.PI);
    }
    if (this.UAVMesh.instanceMatrix) this.UAVMesh.instanceMatrix.needsUpdate = true;
    if (this.UAVMesh1.instanceMatrix) this.UAVMesh1.instanceMatrix.needsUpdate = true;
    if (this.UAVMesh2.instanceMatrix) this.UAVMesh2.instanceMatrix.needsUpdate = true;
  }
}
