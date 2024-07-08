import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { ModelPool } from "@/mymap/utils/ModelPool.js";

import SubwayMotionLayerWorker from "../worker/SubwayMotionLayer2.worker";

// {
//   array: [
//     cx, cy,
//     公交数据总大小,
//     班次数据总大小, 班次index, 班次发车时间, 班次速度, 班次index, 班次发车时间, 班次速度, ... ,
//     路径数据总大小, 路径长度, 路径点x, 路径点y, 路径点x, 路径点y
//   ],
//   map: [
//      班次id,班次id,班次id,班次id...
//   ]
// }

export class SubwayMotionLayer extends Layer {
  name = "SubwayMotionLayer";
  time = 3600 * 8;
  timeSpeed = 60 * 1;

  timeObj = new Map();
  subwayMap = new Map();
  runSubwayList = new Array();

  selectSubwayIndex = -1;

  maxSubwayNum = 2000;
  modelSize = 10;
  lockSelectSubway = true;

  canRender = false;

  modelPool = null;

  constructor(opt) {
    super(opt);
    this.maxVehicleNum = opt.maxVehicleNum || this.maxVehicleNum;
    this.lockSelectVehicle = opt.lockSelectVehicle || this.lockSelectVehicle;
    this.modelSize = opt.modelSize || this.modelSize;

    this.modelPool = new ModelPool({
      Subway: "/models/Subway.gltf",
    })

    this.subwayGroup = new THREE.Group();

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

    this.scene.add(this.subwayGroup);
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

    this.worker = new SubwayMotionLayerWorker();
    this.worker.onmessage = (event) => {
      const [key, postTime, callTime] = event.data;
      const data = event.data.slice(3);
      switch (key) {
        case 1:
          this.center = [data[0], data[1]];
          const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
          this.subwayGroup.position.set(x, y, 0);
          this.pickLayerMesh.position.set(x, y, 0);
          this.pickMeshMesh.position.set(x, y, 0);
          this.canRender = true;
          const array = new Float64Array([2, new Date().getTime(), this.time, this.maxSubwayNum, this.selectSubwayIndex]);
          this.worker.postMessage(array, [array.buffer]);
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
      this.subwayGroup.position.set(x, y, 0);
      this.pickLayerMesh.position.set(x, y, 0);
      this.pickMeshMesh.position.set(x, y, 0);

      if (this.line) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.line.userData.center);
        this.line.position.set(x, y, 0);
      }
    }

    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const id = this.idList[data.pickColor - 1];
      this.setSelectSubwayId(id)
      this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, id);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.center = this.map.center;
  }

  render() {
    super.render();
    // if (this.canRender) {
    //   const array = new Float64Array([2, new Date().getTime(), this.time, this.maxSubwayNum, this.selectSubwayIndex]);
    //   this.worker.postMessage(array, [array.buffer]);
    // }
  }

  dispose() {
    this.worker.terminate();
    const modelName = "SUV";
    this.runSubwayList.forEach(model => {
      this.subwayGroup.remove(model);
      this.modelPool.still(modelName, model)
    })
    this.runSubwayList.length = 0;
    this.modelPool.dispose();
    this.pickGeometry.dispose();
  }


  handleRenderCallback(array) {
    this.rendering = false;
    const arraySize = 7;
    const num = Math.max(this.runSubwayList.length, array.length / arraySize);
    const runSubwayList = [];
    const attrPoitions = [];
    const attrPickColors = [];
    const modelName = "Subway";

    this.subwayGroup.remove(this.coneMesh);
    for (let i = 0; i < num; i++) {
      let model = this.runSubwayList[i];
      const data = array.slice(i * arraySize, i * arraySize + arraySize);
      const id = data[0];
      if (data[0] == this.selectSubwayIndex && data[0] != undefined) {
        this.coneMesh.position.set(data[1], data[2], this.modelSize * 7);
        const scale = this.modelSize * 0.1;
        this.coneMesh.scale.set(scale, scale, scale);
        this.subwayGroup.add(this.coneMesh);
        this.map.setCenter([data[1] + this.center[0], data[2] + this.center[1]]);
      } else if (i > this.maxSubwayNum || data[0] == undefined) {
        if (model) {
          this.subwayGroup.remove(model);
          this.modelPool.still(modelName, model);
        }
        continue;
      }
      if (!model) {
        model = this.modelPool.take(modelName);
        if (!model) continue;
        this.subwayGroup.add(model);
      }

      const scale = this.modelSize * 0.005;
      model.scale.set(scale, scale, scale);
      runSubwayList[i] = model;

      model.position.set(data[1], data[2], this.modelSize);

      const rotationOrderMap = { 1: "XYZ", 2: "YXZ", 3: "ZXY", 4: "ZYX", 5: "YZX", 6: "XZY" };
      model.rotation.fromArray([data[3], data[4], data[5], rotationOrderMap[data[6]]]);

      const attrLength = attrPoitions.length;
      const pickColor = new THREE.Color(id + 1);
      attrPoitions[attrLength] = data[1];
      attrPoitions[attrLength + 1] = data[2];
      attrPoitions[attrLength + 2] = (this.modelSize * 5) / 4;
      attrPickColors[attrLength] = pickColor.r;
      attrPickColors[attrLength + 1] = pickColor.g;
      attrPickColors[attrLength + 2] = pickColor.b;
    }

    this.runSubwayList = runSubwayList;

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
      if (this.canRender) {
        const array = new Float64Array([2, new Date().getTime(), this.time, this.maxSubwayNum, this.selectSubwayIndex]);
        this.worker.postMessage(array, [array.buffer]);
      }
      this._changeTimeout = null;
    }, 1000 / 60);
  }

  setModelSize(modelSize) {
    this.modelSize = modelSize;
    this.pickLayerMaterial.setValues({ size: this.modelSize * 5 });
    this.pickLayerMaterial.needsUpdate = true;
    this.pickMeshMaterial.setValues({ size: this.modelSize * 5 });
    this.pickMeshMaterial.needsUpdate = true;
  }

  setSelectSubwayId(selectSubwayId) {
    this.selectSubwayIndex = this.idList.findIndex(v => v == selectSubwayId);
    const array = new Float64Array([2, new Date().getTime(), this.time, this.maxSubwayNum, this.selectSubwayIndex]);
    this.worker.postMessage(array, [array.buffer]);
  }
}
