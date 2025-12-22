import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import UAVListLayerWorker from "./UAVListLayer.worker";

import { Line2 } from "./lines/Line2.js";
import { LineSegments2 } from "./lines/LineSegments2.js";

import { LineMaterial } from "./lines/LineMaterial.js";

import { LineGeometry } from "./lines/LineGeometry.js";
import { LineSegmentsGeometry } from "./lines/LineSegmentsGeometry.js";

import * as PathCurve from "./PathCurve.js";

// import { Birds } from "./Birds.js";

const textureLoader = new THREE.TextureLoader();

export class UAVListLayer extends Layer {
  center = [0, 0];
  selectIndex = -1;

  constructor(opt) {
    super(opt);
    this.rootDoc = opt.rootDoc;
    this.lockSelect = opt.lockSelect || false;

    this.linkWidth = opt.linkWidth || 10;
    this.selectLinkWidth = opt.selectLinkWidth || 10.1;
    this.linkColor = new THREE.Color(opt.linkColor || "#e8ce79");
    this.selectLinkColor = new THREE.Color(opt.selectLinkColor || "#e8ce79");

    this.nodeSize = opt.nodeSize || 15;
    this.selectNodeSize = opt.selectNodeSize || 15;
    this.nodeColor = new THREE.Color(opt.nodeColor || "#76819a");
    this.selectNodeColor = new THREE.Color(opt.selectNodeColor || "#ea7f7f");
    this.nodeMap = textureLoader.load(require("@/assets/image/point.svg"));
    this.selectNodeMap = textureLoader.load(require("@/assets/image/point2.svg"));

    this.uavColor = new THREE.Color(opt.uavColor || "#ea7f7f");
    this.selectUavColor = new THREE.Color(opt.selectUavColor || this.uavColor);

    // 创建线程
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
    this.camera = new THREE.PerspectiveCamera(60, 1, 10, 30000);
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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.useLegacyLights = true;
    this.rootDoc.appendChild(this.renderer.domElement);

    // 监听rootDoc大小变化，更新渲染器大小
    new ResizeObserver((entries) => {
      // 节流
      if (this._setSizeTimeout) return;
      this._setSizeTimeout = setTimeout(() => {
        const width = this.rootDoc.clientWidth;
        const height = this.rootDoc.clientHeight;
        // 更新摄影机的纵横比
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        // 更新渲染器的大小
        this.renderer.setSize(width, height);
        this._setSizeTimeout = null;
      }, 1000 / 120);
    }).observe(this.rootDoc);

    // 初始化渲染节点需要的资源
    this.nodeMeshList = [];
    this.nodeMeshList1 = [];
    this.nodeMeshList2 = [];
    this.nodeMaterial = new THREE.PointsMaterial({
      size: this.nodeSize,
      sizeAttenuation: false,
      color: this.nodeColor,
      opacity: 1,
      transparent: true,
      map: this.nodeMap,
    });
    this.nodeMaterial1 = new THREE.PointsMaterial({
      color: this.pickLayerColor,
      size: this.nodeSize,
      sizeAttenuation: false,
      opacity: 1,
      transparent: true,
      map: this.nodeMap,
    });
    this.nodeMaterial_s = new THREE.PointsMaterial({
      size: this.selectNodeSize,
      sizeAttenuation: false,
      // color: this.selectNodeColor,
      opacity: 1,
      transparent: true,
      map: this.selectNodeMap,
    });

    // 初始化渲染线路需要的资源
    this.linkMeshList = [];
    this.linkMeshList1 = [];
    this.linkMeshList2 = [];
    this.linkMaterial = new LineMaterial({
      color: this.linkColor,
      linewidth: this.linkWidth,
      opacity: 0.5,
      transparent: true,
      worldUnits: true,

      dashed: true,
      dashSize: this.linkWidth * 3,
      gapSize: this.linkWidth * 3,
    });
    this.linkMaterial1 = new LineMaterial({
      color: this.pickLayerColor,
      linewidth: this.linkWidth,
      opacity: 1,
      transparent: true,
      worldUnits: true,
    });
    this.linkSelectMesh = null;
    this.linkMaterial_s = new LineMaterial({
      color: this.selectLinkColor,
      linewidth: this.selectLinkWidth,
      opacity: 0.5,
      transparent: true,
      worldUnits: true,

      dashed: false,
      dashSize: 0,
      gapSize: 0,
    });

    // 初始化渲染无人机需要的资源
    this.UAVGeometry = new THREE.BoxGeometry(50, 50, 50);
    // this.UAVMaterial = new THREE.MeshStandardMaterial({ color: this.uavColor,vertexColors:true });
    this.UAVMaterial = new THREE.MeshStandardMaterial({ color: this.uavColor, wireframe: true });
    this.UAVMaterial_s = new THREE.MeshStandardMaterial({ color: this.selectUavColor, wireframe: true });
    this.UAVMaterial1 = new THREE.MeshBasicMaterial({});
    this.UAVMaterial2 = new THREE.MeshBasicMaterial({});
    this.UAVMesh = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial, 1);
    this.UAVMesh1 = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial1, 1);
    this.UAVMesh2 = new THREE.InstancedMesh(this.UAVGeometry, this.UAVMaterial2, 1);

    // this.birds = new Birds(undefined, { opacity: 0.5, width: 20 });
    // this.birds.scale.set(0.5, 0.5, 0.5);
    // this.birds.initComputeRenderer(this.renderer);
    // this.scene.add(this.birds);

    // 加载无人机模型
    // 用于优化渲染性能的模型
    new STLLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机.stl", (geometry) => {
      const m4 = new THREE.Matrix4().makeScale(0.2, 0.2, 0.2);
      m4.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
      m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      geometry.applyMatrix4(m4);
      this.UAVGeometry = geometry;
      this.initUAV();
    });
    // 用于螺旋桨旋转的模型
    new GLTFLoader().load(process.env.VUE_APP_BASE_API + "/models/无人机.glb", (gltf) => {
      const SelectUAVModel = {};

      SelectUAVModel.lxjs = [];
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = this.UAVMaterial_s;
          if (String(child.name || "").includes("螺旋桨")) {
            SelectUAVModel.lxjs.push(child);
          }
        }
      });
      gltf.scene.scale.set(0.2, 0.2, 0.2);
      gltf.scene.position.set(0, 0, 5);
      // 设置定时器旋转螺旋桨
      SelectUAVModel.interval = setInterval(() => {
        for (const mesh of SelectUAVModel.lxjs) {
          mesh.rotation.z += (Math.PI * 2) / 15;
          if (mesh.rotation.z >= 2 * Math.PI) mesh.rotation.z = 0;
        }
      }, 1000 / 60);

      SelectUAVModel.scene = new THREE.Group();
      SelectUAVModel.scene.add(gltf.scene);

      this.SelectUAVModel = SelectUAVModel;
    });
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
      this.handleEventListener("select", { flag: !!this.pathList[pickColorNum - 1] });
      this.setSelectPath(pickColorNum - 1);
    }

    if (type == MAP_EVENT.zoom) {
      if (this.map.zoom > 13) {
      } else {
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
    map.scene.add(this.camera);
  }

  render(map) {
    if (this.lockSelect && this.selectIndex >= 0) {
      // this.birds.render();
      this.renderer.render(map.scene, this.camera);
    }
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
    this.rootDoc.removeChild(this.renderer.domElement);
    this.renderer.domElement = null;
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    if (this.SelectUAVModel) {
      clearInterval(this.SelectUAVModel.interval);
    }
  }

  setPickLayerColor(color) {
    super.setPickLayerColor(color);
    this.nodeMaterial1.setValues({ color: color });
    this.nodeMaterial1.needsUpdate = true;
    this.linkMaterial1.setValues({ color: color });
    this.linkMaterial1.needsUpdate = true;
    this.UAVMaterial1.setValues({ color: color });
    this.UAVMaterial1.needsUpdate = true;
  }

  setLinkColor(linkColor) {
    this.linkColor = linkColor;

    this.linkMaterial.setValues({ color: linkColor });

    this.linkMaterial.needsUpdate = true;
    this.linkMaterial_s.setValues({ color: linkColor });
    this.linkMaterial_s.needsUpdate = true;
  }

  setLinkWidth(linkWidth) {
    this.linkWidth = linkWidth;

    this.linkMaterial.setValues({ linewidth: this.linkWidth, dashSize: this.linkWidth * 3, gapSize: this.linkWidth * 3 });
    this.linkMaterial.needsUpdate = true;
    this.linkMaterial1.setValues({ linewidth: this.linkWidth });
    this.linkMaterial1.needsUpdate = true;
    this.linkMaterial_s.setValues({ linewidth: this.linkWidth + 0.1 });
    this.linkMaterial_s.needsUpdate = true;

    this.linkMeshList2.forEach((mesh) => {
      mesh.material.setValues({ linewidth: this.linkWidth });
      mesh.material.needsUpdate = true;
    });
  }

  // LinePath  CubicBezierPath
  setPaths(paths = [], pathClassName = "LinePath") {
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

  // setSelectPath(selectIndex) {
  //   this.selectIndex = selectIndex;
  //   const path = this.pathList[selectIndex];
  //   if (this.linkSelectMesh) {
  //     this.linkSelectMesh.removeFromParent();
  //     this.linkSelectMesh.geometry.dispose();
  //     this.linkSelectMesh = null;
  //   }
  //   if (path) {
  //     const positions = path.getPoints2(10);
  //     const linkPoints = positions.map((v, i) => [v.x, v.y, v.z]).flat();
  //     const linkGeometry = new LineGeometry();
  //     linkGeometry.setPositions(linkPoints);

  //     const link = new Line2(linkGeometry, this.linkMaterial_s);

  //     link.renderOrder = 10;
  //     this.scene.add(link);
  //     this.linkSelectMesh = link;
  //   }

  //   if (this.map) this.on(MAP_EVENT.UPDATE_CENTER);
  // }
  

  setSelectPath(selectIndex) {
    const oldIndex = this.selectIndex;
    this.selectIndex = selectIndex;
    if (oldIndex > -1) {
      // this.nodeMeshList[oldIndex].material = this.nodeMaterial;
      // this.nodeMeshList[oldIndex].needsUpdate = true;
      // this.nodeMeshList[oldIndex].renderOrder = 20;
      this.linkMeshList[oldIndex].material = this.linkMaterial;
      this.linkMeshList[oldIndex].needsUpdate = true;
      this.linkMeshList[oldIndex].renderOrder = 10;
    }
    if (selectIndex > -1) {
      // this.nodeMeshList[selectIndex].material = this.nodeMaterial_s;
      // this.nodeMeshList[selectIndex].needsUpdate = true;
      // this.nodeMeshList[selectIndex].renderOrder = 200;
      this.linkMeshList[selectIndex].material = this.linkMaterial_s;
      this.linkMeshList[selectIndex].needsUpdate = true;
      this.linkMeshList[selectIndex].renderOrder = 100;
    }
  }

  setSelectPathById(id) {
    const index = this.pathList.findIndex((v) => v.id == id);
    this.setSelectPath(index);
    return this.pathList[index];
  }

  setLockSelect(val) {
    this.lockSelect = val;
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
      const matrix4 = new THREE.Matrix4().makeTranslation(0, 0, -1000000);

      // this.UAVMesh.setColorAt(pIndex, this.uavColor);
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

  updatePaths() {
    for (const mesh of this.nodeMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    for (const mesh of this.nodeMeshList1) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    for (const mesh of this.nodeMeshList2) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
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
    for (let pIndex = 0; pIndex < this.pathList.length; pIndex++) {
      const path = this.pathList[pIndex];
      const pickColor = new THREE.Color(Number(pIndex + 1));

      // const nodePoints = path.nodes.map((node) => new THREE.Vector3(node.v.x, node.v.y, node.v.z));
      // const nodeGeometry = new THREE.BufferGeometry().setFromPoints(nodePoints);
      // nodeGeometry.computeBoundingBox();
      // nodeGeometry.computeBoundingSphere();
      // const node = new THREE.Points(nodeGeometry, this.nodeMaterial);
      // node.renderOrder = 10;
      // this.scene.add(node);
      // this.nodeMeshList.push(node);

      // const node1 = new THREE.Points(nodeGeometry, this.nodeMaterial1);
      // node1.renderOrder = 10;
      // this.pickLayerScene.add(node1);
      // this.nodeMeshList1.push(node1);

      // const nodeMaterial2 = new THREE.PointsMaterial({
      //   color: pickColor,
      //   size: this.nodeSize,
      //   sizeAttenuation: false,
      //   opacity: 1,
      //   transparent: true,
      //   map: this.nodeMap,
      // });
      // const node2 = new THREE.Points(nodeGeometry, nodeMaterial2);
      // node2.renderOrder = 10;
      // this.pickMeshScene.add(node2);
      // this.nodeMeshList2.push(node2);

      const positions = path.getPoints2(10);
      const linkPoints = positions.map((v, i) => [v.x, v.y, v.z]).flat();
      const linkGeometry = new LineGeometry();
      linkGeometry.setPositions(linkPoints);
      console.log(linkGeometry);
      
      // const segmentsGeometry = new LineSegmentsGeometry();
      // segmentsGeometry.setPositions(linkPoints);

      // const link = new LineSegments2(segmentsGeometry, this.linkMaterial);
      const link = new Line2(linkGeometry, this.linkMaterial);
      link.computeLineDistances();
      link.renderOrder = 10;
      this.scene.add(link);
      this.linkMeshList.push(link);

      const link1 = new Line2(linkGeometry, this.linkMaterial1);
      link1.renderOrder = 10;
      this.pickLayerScene.add(link1);
      this.linkMeshList1.push(link1);

      const linkMaterial2 = new LineMaterial({
        color: pickColor,
        linewidth: this.linkWidth,
        worldUnits: true,
        opacity: 1,
        transparent: true,
      });
      const link2 = new Line2(linkGeometry, linkMaterial2);
      link2.renderOrder = 10;
      this.pickMeshScene.add(link2);
      this.linkMeshList2.push(link2);

      // const linkGeometry = new THREE.TubeGeometry(path, path.nodes.length * 20, this.linkWidth, 8, false);
      // const link = new THREE.Mesh(linkGeometry, this.linkMaterial);
      // link.renderOrder = 10;
      // this.scene.add(link);
      // this.linkMeshList.push(link);

      // const link1 = new THREE.Mesh(linkGeometry, this.linkMaterial1);
      // link1.renderOrder = 10;
      // this.pickLayerScene.add(link1);
      // this.linkMeshList1.push(link1);

      // const linkMaterial2 = new THREE.MeshBasicMaterial({
      //   color: pickColor,
      //   // linewidth: this.linkWidth,
      //   opacity: 1,
      //   transparent: true,
      // });
      // const link2 = new THREE.Mesh(linkGeometry, linkMaterial2);
      // link2.renderOrder = 10;
      // this.pickMeshScene.add(link2);
      // this.linkMeshList2.push(link2);
    }
    if (this.map) this.on(MAP_EVENT.UPDATE_CENTER);
    this.setSelectPath(this.selectIndex);
  }

  updateUAV(data) {
    if (!this.pathList) return;
    if (!this.map) return;
    if (this.SelectUAVModel) this.SelectUAVModel.scene.removeFromParent();
    // if (this.birds) this.birds.removeFromParent();
    const { time, points } = data;
    for (let pIndex = 0; pIndex < points.length; pIndex++) {
      const { point, speed, dir, isEnd } = points[pIndex];
      if (pIndex === this.selectIndex) {
        const [x, y] = this.map.WebMercatorToCanvasXY(point.x + this.center[0], point.y + this.center[1]);
        // this.birds.position.set(x, y, point.z + 10);
        if (this.SelectUAVModel)
          if (!isEnd) {
            if (this.lockSelect) {
              this.camera.position.set(x, point.z + 30, -y).sub(new THREE.Vector3(dir.x, dir.z, -dir.y).setLength(30 * 2));
              this.camera.lookAt(x, point.z, -y);
              // this.map.setCameraHeight(point.z + 200);
              if (this.SelectUAVModel) {
                // this.scene.add(this.birds);
                this.scene.add(this.SelectUAVModel.scene);

                const matrix4 = new THREE.Matrix4().makeTranslation(0, 0, -1000000);
                this.UAVMesh.setMatrixAt(pIndex, matrix4);
                this.UAVMesh1.setMatrixAt(pIndex, matrix4);
                this.UAVMesh2.setMatrixAt(pIndex, matrix4);
                this.SelectUAVModel.scene.position.set(x, y, point.z);
                const target = new THREE.Vector3(x, point.z, -y).sub(new THREE.Vector3(-dir.x, point.z, dir.y));
                this.SelectUAVModel.scene.lookAt(target);
                this.SelectUAVModel.scene.rotateY(Math.PI);
              }
            }
            if (!this.lockSelect || (this.lockSelect && !this.SelectUAVModel)) {
              const matrix4 = new THREE.Matrix4().makeTranslation(point.x, point.y, point.z);
              this.UAVMesh.setColorAt(pIndex, this.selectUavColor);
              this.UAVMesh.setMatrixAt(pIndex, matrix4);
              this.UAVMesh1.setMatrixAt(pIndex, matrix4);
              this.UAVMesh2.setMatrixAt(pIndex, matrix4);
            }
          } else {
            const matrix4 = new THREE.Matrix4().makeTranslation(0, 0, -1000000);
            this.UAVMesh.setMatrixAt(pIndex, matrix4);
            this.UAVMesh1.setMatrixAt(pIndex, matrix4);
            this.UAVMesh2.setMatrixAt(pIndex, matrix4);
          }
      } else if (!isEnd) {
        const matrix4 = new THREE.Matrix4().makeTranslation(point.x, point.y, point.z);
        this.UAVMesh.setMatrixAt(pIndex, matrix4);
        this.UAVMesh1.setMatrixAt(pIndex, matrix4);
        this.UAVMesh2.setMatrixAt(pIndex, matrix4);
      } else {
        const matrix4 = new THREE.Matrix4().makeTranslation(0, 0, -1000000);
        this.UAVMesh.setMatrixAt(pIndex, matrix4);
        this.UAVMesh1.setMatrixAt(pIndex, matrix4);
        this.UAVMesh2.setMatrixAt(pIndex, matrix4);
      }
      this.UAVMesh.setColorAt(pIndex, this.uavColor);
    }
    this.handleEventListener("playing", { playDetail: points[this.selectIndex] });
    if (this.selectIndex > -1) this.UAVMesh.setColorAt(this.selectIndex, this.selectUavColor);
    if (this.UAVMesh.instanceColor) this.UAVMesh.instanceColor.needsUpdate = true;
    if (this.UAVMesh.instanceMatrix) this.UAVMesh.instanceMatrix.needsUpdate = true;
    if (this.UAVMesh1.instanceMatrix) this.UAVMesh1.instanceMatrix.needsUpdate = true;
    if (this.UAVMesh2.instanceMatrix) this.UAVMesh2.instanceMatrix.needsUpdate = true;
  }
}
