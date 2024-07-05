import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { ModelPool } from "./CarMotionLayer2.utils.js";

import CarMotionLayerWorker from "./CarMotionLayer2.worker";

export class CarMotionLayer extends Layer {
  name = "CarMotionLayer";
  time = 3600 * 8;
  timeSpeed = 60 * 1;

  timeObj = new Map();
  carMap = new Map();
  runCarList = new Array();

  selectCarId = null;

  maxCarNum = 50000;
  modelSize = 10;
  lockSelectCar = true;

  canRender = false;



  constructor(opt) {
    super(opt);
    this.maxVehicleNum = opt.maxVehicleNum || this.maxVehicleNum;
    this.lockSelectVehicle = opt.lockSelectVehicle || this.lockSelectVehicle;
    this.modelSize = opt.modelSize || this.modelSize;

    this.carGroup = new THREE.Group();

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

    this.scene.add(this.carGroup);
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

    this.worker = new CarMotionLayerWorker();
    this.worker.onmessage = (event) => {
      const [key, postTime, callTime] = event.data;
      const data = event.data.slice(3);
      switch (key) {
        case 1:
          this.center = [data[0], data[1]];
          const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
          this.carGroup.position.set(x, y, 0);
          this.pickLayerMesh.position.set(x, y, 0);
          this.pickMeshMesh.position.set(x, y, 0);
          this.canRender = true;
          const array = new Float64Array([2, new Date().getTime(), this.time, this.maxCarNum]);
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

    ModelPool.instance.default
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.carGroup.position.set(x, y, 0);
      this.pickLayerMesh.position.set(x, y, 0);
      this.pickMeshMesh.position.set(x, y, 0);

      if (this.line) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.line.userData.center);
        this.line.position.set(x, y, 0);
      }
    }

    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const index = data.pickColor;
      console.log(index - 1);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.center = this.map.center;
  }

  beforeRender() {
    if (this.lockSelectCar && this._selectCarDetail && this._selectCarPath) {
      const { start, end, isRunning } = this._selectCarPath.getPointByTime(this.time);
      if (isRunning) {
        this.map.setCenter(start.toJSON());
      }
    }
  }

  render() {
    super.render();
    // if (this.canRender) {
    //   const array = new Float64Array([2, new Date().getTime(), this.time, this.maxCarNum]);
    //   this.worker.postMessage(array, [array.buffer]);
    // }
  }

  dispose() {
    this.worker.terminate();
  }


  handleRenderCallback(array) {
    console.log("handleRenderCallback");
    this.rendering = false;
    const arraySize = 7;
    const num = Math.max(this.runCarList.length, array.length / arraySize);
    const runCarList = [];
    const attrPoitions = [];
    const attrPickColors = [];
    const modelName = "SUV";

    this.carGroup.remove(this.coneMesh);
    for (let i = 0; i < num; i++) {
      let model = this.runCarList[i];
      const data = array.slice(i * arraySize, i * arraySize + arraySize);
      const id = data[0];
      // console.log(data[1] + this.center[0], data[2] + this.center[1])
      if (data[0] == this.selectCarId && data[0] != undefined) {
        this.coneMesh.position.set(data[1], data[2], this.modelSize * 7);
        const scale = this.modelSize * 0.1;
        this.coneMesh.scale.set(scale, scale, scale);
        this.carGroup.add(this.coneMesh);
      } else if (i > this.maxCarNum || data[0] == undefined) {
        if (model) {
          this.carGroup.remove(model);
          ModelPool.instance.still(modelName, model);
        }
        continue;
      }
      if (!model) {
        model = ModelPool.instance.take(modelName);
        if (!model) continue;
        this.carGroup.add(model);
      }

      const scale = this.modelSize * 0.005;
      model.scale.set(scale, scale, scale);
      runCarList[i] = model;

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

    this.runCarList = runCarList;

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
        const array = new Float64Array([2, new Date().getTime(), this.time, this.maxCarNum]);
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
}
