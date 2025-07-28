import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import UAVListLayerWorker from "./UAVListLayer4.worker";

import * as PathCurve from "./PathCurve";
import { color } from "echarts";

export class UAVListLayer extends Layer {
  center = [0, 0];
  selecIndex = -1;
  constructor(opt) {
    super(opt);
    this.rootDoc = opt.rootDoc;
    this.lockSelect = opt.lockSelect || false;
    this.linkWidth = opt.linkWidth || 5;
    this.nodeSize = opt.nodeSize || 10;
    this.nodeMeshList = [];
    this.nodeMeshList1 = [];
    this.nodeMeshList2 = [];
    this.nodeGeometry = new THREE.BoxGeometry(this.nodeSize, this.nodeSize, this.nodeSize);
    this.nodesMaterial = new THREE.MeshBasicMaterial({ color: opt.nodeColor || "#76819a", opacity: 0.8, transparent: true });
    this.nodesMaterial_s = new THREE.MeshBasicMaterial({ depthFunc: THREE.AlwaysDepth, color: "red", opacity: 0.8, transparent: true });
    this.nodesMaterial1 = new THREE.MeshBasicMaterial({});

    this.linkMeshList = [];
    this.linkMeshList1 = [];
    this.linkMeshList2 = [];
    this.linkMaterial = new THREE.MeshBasicMaterial({ color: opt.linkColor || "#e8ce79", opacity: 0.8, transparent: true });
    this.linkMaterial_s = new THREE.MeshBasicMaterial({ depthFunc: THREE.AlwaysDepth, color: "red", opacity: 0.8, transparent: true });
    this.linkMaterial1 = new THREE.MeshBasicMaterial({});

    this.UAVGeometry = new THREE.BoxGeometry(50, 50, 50);
    this.UAVMaterial = new THREE.MeshStandardMaterial({ color: opt.uavColor || "#ea7f7f" });
    this.UAVMaterial1 = new THREE.MeshBasicMaterial({});
    this.UAVMaterial2 = new THREE.MeshBasicMaterial({});
    this.UAVMesh = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial, 1);
    this.UAVMesh1 = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial1, 1);
    this.UAVMesh2 = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial2, 1);

    new STLLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机.stl", (geometry) => {
      const m4 = new THREE.Matrix4().makeScale(1, 1, 1);
      m4.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
      geometry.applyMatrix4(m4);
      this.UAVGeometry = geometry;
      this.initUAV();
    });

    new GLTFLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机.glb", (gltf) => {
      gltf.lxjs = [];

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = this.UAVMaterial;
        }
        if (child.isMesh && String(child.name || "").includes("螺旋桨")) {
          gltf.lxjs.push(child);
        }
      });
      gltf.interval = setInterval(() => {
        for (const mesh of gltf.lxjs) {
          mesh.rotation.z += Math.PI / 30;
          if (mesh.rotation.z >= 2 * Math.PI) mesh.rotation.z = 0;
        }
      }, 1000 / 60);
      gltf.scene.rotation.z = Math.PI / 2;

      console.log(gltf);
      this.SelectUAVModel = gltf;
    });

    this.worker = new UAVListLayerWorker();
    this.worker.onmessage = (e) => {
      switch (e.data.key) {
        case "setPaths": {
          setTimeout(() => {
            this.setTime(this.time);
          }, 500);
          break;
        }
        case "getPointsByTime": {
          this.updateUAV(e.data.data);
          break;
        }
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(60, 1, 1, 30000);
    this.renderer = new THREE.WebGLRenderer({
      // 设置抗锯齿
      antialias: true,
      // 设置对数深度缓冲区
      logarithmicDepthBuffer: true,
      // precision: "highp"
      preserveDrawingBuffer: true,
    });
    this.renderer.domElement.style.userSelect = "none";
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.top = "0";
    this.renderer.domElement.style.left = "0";
    this.renderer.domElement.style.zIndex = "0";
    this.rootDoc.appendChild(this.renderer.domElement);
  }

  render(map) {
    if (this.lockSelect) {
      this.renderer.render(map.scene, this.camera);
    }
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
    if (type == MAP_EVENT.UPDATE_RENDERER_SIZE) {
      const { width, height } = data;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
    map.scene.add(this.camera);
  }

  setPaths(paths = [], pathClassName = "LinePath") {
    paths = paths.slice(0, 1);
    console.log(paths);

    const center = [paths[0].center[0], paths[0].center[1]];
    console.time("setPaths");
    this.pathList = paths.map((v) => new PathCurve[pathClassName](v.id, v.nodes, new THREE.Vector3(center[0], center[1], 0)));
    console.timeEnd("setPaths");
    this.center = center;
    this.worker.postMessage({
      key: "setPaths",
      paths: paths,
      pathClassName: pathClassName,
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
      // mesh.dispose();
    }
    for (const mesh of this.linkMeshList1) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      // mesh.dispose();
    }
    for (const mesh of this.linkMeshList2) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      // mesh.dispose();
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
    if (!this.pathList) return;
    if (!this.map) return;
    const { time, points } = data;
    for (let pIndex = 0; pIndex < points.length; pIndex++) {
      const { point, speed, dir, isEnd } = points[pIndex];
      if (this.lockSelect && pIndex === this.selecIndex && !isEnd) {
        const matrix4 = new THREE.Matrix4().makeTranslation(0, 0, -1000);
        this.UAVMesh.setColorAt(pIndex, new THREE.Color("red"));
        this.UAVMesh.setMatrixAt(pIndex, matrix4);
        this.UAVMesh1.setMatrixAt(pIndex, matrix4);
        this.UAVMesh2.setMatrixAt(pIndex, matrix4);

        if (this.SelectUAVModel) {
          this.scene.add(this.SelectUAVModel.scene);
          const [x, y] = this.map.WebMercatorToCanvasXY(point.x + this.center[0], point.y + this.center[1]);
          this.SelectUAVModel.scene.position.set(x, y, point.z);
        }

        this.map.setCenter([point.x + this.center[0], point.y + this.center[1]]);
        this.map.setCameraHeight(point.z + 200);
        this.camera.position.set(0, point.z + 50, 0).sub(new THREE.Vector3(dir.x, dir.z, -dir.y).setLength(100));
        this.camera.lookAt(0, point.z, 0);
      } else if (!isEnd) {
        const matrix4 = new THREE.Matrix4().makeTranslation(point.x, point.y, point.z);
        this.UAVMesh.setMatrixAt(pIndex, matrix4);
        this.UAVMesh1.setMatrixAt(pIndex, matrix4);
        this.UAVMesh2.setMatrixAt(pIndex, matrix4);
      } else {
        const matrix4 = new THREE.Matrix4().makeTranslation(0, 0, -1000);
        this.UAVMesh.setMatrixAt(pIndex, matrix4);
        this.UAVMesh1.setMatrixAt(pIndex, matrix4);
        this.UAVMesh2.setMatrixAt(pIndex, matrix4);
      }
    }
    this.handleEventListener("playing", { playDetail: points[this.selecIndex] });
    if (this.UAVMesh.instanceColor) this.UAVMesh.instanceColor.needsUpdate = true;
    if (this.UAVMesh.instanceMatrix) this.UAVMesh.instanceMatrix.needsUpdate = true;
    if (this.UAVMesh1.instanceMatrix) this.UAVMesh1.instanceMatrix.needsUpdate = true;
    if (this.UAVMesh2.instanceMatrix) this.UAVMesh2.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    super.dispose();
    this.rootDoc.removeChild(this.renderer.domElement);
    this.renderer.domElement = null;
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    if (this.SelectUAVModel) {
      clearInterval(this.SelectUAVModel.interval);
    }
  }
}
