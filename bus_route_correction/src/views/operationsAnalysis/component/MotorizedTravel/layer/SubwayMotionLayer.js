import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { ModelPool } from "@/mymap/utils/ModelPool.js";

import SubwayMotionLayerWorker from "../worker/SubwayMotionLayer.worker.js";

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

export class SubwayMotionLayer extends Layer {
  name = "SubwayMotionLayer";
  time = 3600 * 8;
  timeSpeed = 60 * 1;

  timeObj = new Map();
  busMap = new Map();
  runSubwayList = new Array();

  selectSubwayIndex = -1;
  selectSubwayId = null;

  maxSubwayNum = 2000;
  modelSize = 10;
  lockSelectSubway = true;

  canRender = false;

  modelPool = null;

  center = [0, 0];

  constructor(opt) {
    super(opt);
    this.maxSubwayNum = opt.maxSubwayNum || this.maxSubwayNum;
    this.lockSelectSubway = opt.lockSelectSubway || this.lockSelectSubway;
    this.modelSize = opt.modelSize || this.modelSize;

    this.modelPool = new ModelPool({
      Subway: "/models/Subway.gltf",
    });

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

    this.worker = new SubwayMotionLayerWorker();
    this.worker.onmessage = (event) => {
      const [key, postTime, callTime] = event.data;
      const data = event.data.slice(3);
      switch (key) {
        case 1:
          this.center = [data[0], data[1]];
          this.canRender = true;
          if (this.map) {
            const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
            this.busGroup.position.set(x, y, 0);
            this.pickLayerMesh.position.set(x, y, 0);
            this.pickMeshMesh.position.set(x, y, 0);
            this.callWorkerRender();
          }
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
      this.setSelectSubwayId(id);
      this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, id);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER, {});
  }

  render() {
    super.render();
    // if (this.canRender) this.callWorkerRender();
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
    const modelName = "Subway";
    this.runSubwayList.forEach((model) => {
      this.busGroup.remove(model);
      this.modelPool.still(modelName, model);
    });
    this.runSubwayList.length = 0;
    this.modelPool.dispose();
    this.pickGeometry.dispose();
  }

  callWorkerRender() {
    let windowRange = {
      maxX: 0,
      minX: 0,
      maxY: 0,
      minY: 0,
      width: 0,
      height: 0,
    };
    if (this.map) windowRange = this.map.getWindowRangeAndWebMercator();
    const list = [2, new Date().getTime()];
    list.push(this.time);
    list.push(this.maxSubwayNum);
    list.push(this.selectSubwayIndex);
    list.push(windowRange.maxX);
    list.push(windowRange.minX);
    list.push(windowRange.maxY);
    list.push(windowRange.minY);
    const array = new Float64Array(list);
    this.worker.postMessage(array, [array.buffer]);
  }

  handleRenderCallback(array) {
    this.rendering = false;
    const arraySize = 8;
    const num = Math.max(this.runSubwayList.length, array.length / arraySize);
    const runSubwayList = [];
    const attrPoitions = [];
    const attrPickColors = [];
    const modelName = "Subway";

    this.busGroup.remove(this.coneMesh);
    for (let i = 0; i < num; i++) {
      let model = this.runSubwayList[i];
      const data = array.slice(i * arraySize, i * arraySize + arraySize);
      const [id, x, y, z, qx, qy, qz, qw] = data;
      if (id == this.selectSubwayIndex && id != undefined) {
        this.coneMesh.position.set(x, y, z + this.modelSize * 7);
        const scale = this.modelSize * 0.1;
        this.coneMesh.scale.set(scale, scale, scale);
        this.busGroup.add(this.coneMesh);
        if (this.lockSelectSubway && this.map) this.map.setCenter([x + this.center[0], y + this.center[1]]);
      } else if (i > this.maxSubwayNum || id == undefined) {
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
      
      const scale = this.modelSize * 0.005;
      model.scale.set(scale, scale, scale);
      model.position.set(x, y, z + this.modelSize);
      model.quaternion.set(qx, qy, qz, qw);

      runSubwayList[i] = model;

      const attrLength = attrPoitions.length;
      const pickColor = new THREE.Color(id + 1);
      attrPoitions[attrLength] = x;
      attrPoitions[attrLength + 1] = y;
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
      console.time("new Float64Array");
      this.idList = data.idList;
      const array = new Float64Array(data.array.length + 2);
      array.set([1], 0);
      array.set([new Date().getTime()], 1);
      array.set(data.array, 2);
      console.timeEnd("new Float64Array");
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

  setSelectSubwayId(selectSubwayId) {
    this.selectSubwayId = selectSubwayId;
    this.selectSubwayIndex = this.idList.findIndex((v) => v == selectSubwayId);
    if (this.canRender) this.callWorkerRender();
  }
}
