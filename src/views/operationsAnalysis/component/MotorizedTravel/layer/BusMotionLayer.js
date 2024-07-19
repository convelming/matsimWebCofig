import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { ModelPool } from "@/mymap/utils/ModelPool.js";

import BusMotionLayerWorker from "../worker/BusMotionLayer.worker";

// {
//   array: [
//     cx, cy,
//     公交数据总大小,
//     班次数据总大小, 班次index, 班次发车时间, 班次速度, 班次index, 班次发车时间, 班次速度, ... ,
//     路径数据总大小, 路径长度, 路径点x, 路径点y, 距离 , 路径点x, 路径点y, 距离 ...
//   ],
//   map: [
//      班次id,班次id,班次id,班次id...
//   ]
// }

export class BusMotionLayer extends Layer {
  name = "BusMotionLayer";
  time = 3600 * 8;
  timeSpeed = 60 * 1;

  timeObj = new Map();
  busMap = new Map();
  runBusList = new Array();

  selectBusIndex = -1;

  maxBusNum = 2000;
  modelSize = 10;
  lockSelectBus = true;

  canRender = false;

  modelPool = null;

  constructor(opt) {
    super(opt);
    this.maxBusNum = opt.maxBusNum || this.maxBusNum;
    this.lockSelectBus = opt.lockSelectBus || this.lockSelectBus;
    this.modelSize = opt.modelSize || this.modelSize;

    this.modelPool = new ModelPool({
      Bus: "/models/Bus.gltf",
    })

    this.busGroup = new THREE.Group();

    this.pickLayerMaterial = new THREE.PointsMaterial({
      size: this.modelSize * 5,
      transparent: true,
      sizeAttenuation: true,
      vertexColors: false,
      color: this.pickLayerColor,
    });

    this.pickMeshMaterial = new THREE.PointsMaterial({
      size: this.modelSize * 5,
      transparent: true,
      sizeAttenuation: true,
      vertexColors: true,
    });

    this.pickGeometry = new THREE.BufferGeometry();

    this.pickLayerMesh = new THREE.Points(this.pickGeometry, this.pickLayerMaterial);

    this.pickMeshMesh = new THREE.Points(this.pickGeometry, this.pickMeshMaterial);

    this.scene.add(this.busGroup);
    this.pickLayerScene.add(this.pickLayerMesh);
    this.pickMeshScene.add(this.pickMeshMesh);

    const geometry = new THREE.ConeGeometry(18, 30, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.8,
      transparent: true,
    });
    this.coneMesh = new THREE.Mesh(geometry, material);
    this.coneMesh.rotateX((Math.PI / 2) * 3);

    this.worker = new BusMotionLayerWorker();
    this.worker.onmessage = (event) => {
      const [key, postTime, callTime] = event.data;
      const data = event.data.slice(3);
      switch (key) {
        case 1:
          this.center = [data[0], data[1]];
          const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
          this.busGroup.position.set(x, y, 0);
          this.pickLayerMesh.position.set(x, y, 0);
          this.pickMeshMesh.position.set(x, y, 0);
          this.canRender = true;
          if (this.canRender) this.callWorkerRender();
          break;
        case 2:
          this.handleRenderCallback(data);
          break;
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.busGroup.position.set(x, y, 0);
      this.pickLayerMesh.position.set(x, y, 0);
      this.pickMeshMesh.position.set(x, y, 0);

      if (this.line) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.line.userData.center);
        this.line.position.set(x, y, 0);
      }
    }

    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const id = this.idList[data.pickColor - 1];
      this.setSelectBusId(id)
      this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, id);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.center = this.map.center;
  }

  render() {
    super.render();
    // if (this.canRender) this.callWorkerRender();
  }

  callWorkerRender() {
    let windowRange = {
      maxX: 0,
      minX: 0,
      maxY: 0,
      minY: 0,
      width: 0,
      height: 0
    };
    if (this.map) windowRange = this.map.getWindowRangeAndWebMercator();
    const list = [2, new Date().getTime()];
    list.push(this.time);
    list.push(this.maxBusNum);
    list.push(this.selectBusIndex);
    list.push(windowRange.maxX);
    list.push(windowRange.minX);
    list.push(windowRange.maxY);
    list.push(windowRange.minY);
    const array = new Float64Array(list);
    this.worker.postMessage(array, [array.buffer]);
  }

  dispose() {
    this.worker.terminate();
    const modelName = "SUV";
    this.runBusList.forEach(model => {
      this.busGroup.remove(model);
      this.modelPool.still(modelName, model)
    })
    this.runBusList.length = 0;
    this.modelPool.dispose();
    this.pickGeometry.dispose();
  }


  handleRenderCallback(array) {
    this.rendering = false;
    const arraySize = 7;
    const num = Math.max(this.runBusList.length, array.length / arraySize);
    const runBusList = [];
    const attrPoitions = [];
    const attrPickColors = [];
    const modelName = "Bus";

    this.busGroup.remove(this.coneMesh);
    for (let i = 0; i < num; i++) {
      let model = this.runBusList[i];
      const data = array.slice(i * arraySize, i * arraySize + arraySize);
      const id = data[0];
      if (data[0] == this.selectBusIndex && data[0] != undefined) {
        this.coneMesh.position.set(data[1], data[2], this.modelSize * 7);
        const scale = this.modelSize * 0.1;
        this.coneMesh.scale.set(scale, scale, scale);
        this.busGroup.add(this.coneMesh);
        if (this.lockSelectBus && this.map) this.map.setCenter([data[1] + this.center[0], data[2] + this.center[1]]);
      } else if (i > this.maxBusNum || data[0] == undefined) {
        if (model) {
          this.busGroup.remove(model);
          this.modelPool.still(modelName, model);
        }
        continue;
      }
      if (!model) {
        model = this.modelPool.take(modelName);
        if (!model) continue;
        this.busGroup.add(model);
      }

      // const scale = this.modelSize * 0.005;
      // model.scale.set(scale, scale, scale);
      // model.position.set(data[1], data[2], this.modelSize);
      // const rotationOrderMap = { 1: "XYZ", 2: "YXZ", 3: "ZXY", 4: "ZYX", 5: "YZX", 6: "XZY" };
      // model.rotation.fromArray([data[3], data[4], data[5], rotationOrderMap[data[6]]]);

      const scale = this.modelSize * 0.005;
      model.scale.set(scale, scale, scale);
      model.position.set(data[1], data[2], this.modelSize);
      model.quaternion.set(data[3], data[4], data[5], data[6]);

      runBusList[i] = model;


      const attrLength = attrPoitions.length;
      const pickColor = new THREE.Color(id + 1);
      attrPoitions[attrLength] = data[1];
      attrPoitions[attrLength + 1] = data[2];
      attrPoitions[attrLength + 2] = (this.modelSize * 5) / 4;
      attrPickColors[attrLength] = pickColor.r;
      attrPickColors[attrLength + 1] = pickColor.g;
      attrPickColors[attrLength + 2] = pickColor.b;
    }

    this.runBusList = runBusList;

    // 更新车辆选择视图
    this.pickGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(attrPoitions), 3));
    this.pickGeometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(attrPickColors), 3));
    this.pickGeometry.needsUpdate = true;
    this.pickGeometry.computeBoundingSphere();
  }

  setData(data) {
    try {
      console.time("new Float64Array")
      this.idList = data.idList;
      const array = new Float64Array(data.array.length + 2);
      array.set([1], 0);
      array.set([new Date().getTime()], 1);
      array.set(data.array, 2);
      console.timeEnd("new Float64Array")
      this.worker.postMessage(array, [array.buffer]);
    } catch (error) {
      console.log(error);
      this.idList = [];
      const array = new Float64Array([0, 0]);
      this.worker.postMessage(array, [array.buffer]);
    }
  }

  setTime(time) {
    if (this._changeTimeout || Math.abs(this.time - time) < 0.001) return;
    this._changeTimeout = setTimeout(() => {
      this.time = Number(time.toFixed(4));
      if (this.canRender) this.callWorkerRender();
      this._changeTimeout = null;
    }, 1000 / 60);
  }

  setModelSize(modelSize) {
    this.modelSize = modelSize;
    this.pickLayerMaterial.setValues({ size: this.modelSize * 5 });
    this.pickLayerMaterial.needsUpdate = true;
    this.pickMeshMaterial.setValues({ size: this.modelSize * 5 });
    this.pickMeshMaterial.needsUpdate = true;
    if (this.canRender) this.callWorkerRender();
  }

  setSelectBusId(selectBusId) {
    this.selectBusIndex = this.idList.findIndex(v => v == selectBusId);
    if (this.canRender) this.callWorkerRender();
  }
}
