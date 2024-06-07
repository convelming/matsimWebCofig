import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { CarMotionPath, CarMotionPoint, ModelPool } from "../utils.js";

import CarMotionLayerWorker from "../worker/CarMotionLayer.worker";

export class CarMotionLayer extends Layer {
  name = "CarMotionLayer";
  time = 0;
  timeSpeed = 60 * 1;

  timeObj = new Map();
  carMap = new Map();
  runCarList = new Array();

  selectCarId = null;

  maxCarNum = 500;
  modelSize = 10;
  lockSelectCar = true;

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
      const { key, data } = event.data;
      switch (key) {
        case "setData":
          break;
        case "render":
          this.handleRenderCallback(data);
          break;
        case "getCarByColor":
          this.handleGetCarByColorCallback(data);
          break;
        case "getCarByUuid":
          this.handleGetCarByUuidCallback(data);
          break;
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });

    ModelPool.instance.defaultModel
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.carGroup.position.set(x, y, 0);
      this.pickLayerMesh.position.set(x, y, 0);
      this.pickMeshMesh.position.set(x, y, 0);
    }

    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      this.worker.postMessage({
        key: "getCarByColor",
        data: { pickColor: data.pickColor },
      });
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
    this.worker.postMessage({
      key: "render",
      data: {
        time: this.time,
        maxCarNum: this.maxCarNum,
        center: this.center,
      },
    });
  }

  dispose() {
    this.worker.terminate();
  }

  setSelectCarId(uuid) {
    this.selectCarId = uuid;
    this.worker.postMessage({
      key: "getCarByUuid",
      data: {
        uuid: this.selectCarId,
      },
    });
  }

  handleGetCarByUuidCallback(data) {
    if (data) {
      const { carDetail, path } = data;
      this._selectCarDetail = carDetail;
      this._selectCarPath = new CarMotionPath(path);
    } else {
      this._selectCarDetail = null;
      this._selectCarPath = null;
    }
  }

  handleRenderCallback({ time, list }) {
    this.rendering = false;

    const num = Math.max(this.runCarList.length, list.length);
    const runCarList = [];
    const attrPoitions = [];
    const attrPickColors = [];
    const modelName = "SUV";

    this.carGroup.remove(this.coneMesh);
    for (let i = 0; i < num; i++) {
      let model = this.runCarList[i];
      if (list[i] && list[i].carDetail.uuid == this.selectCarId) {
        const { position, worldPosition } = list[i].runDetail;
        this.coneMesh.position.set(position[0], position[1], this.modelSize * 7);
        const scale = this.modelSize * 0.1;
        this.coneMesh.scale.set(scale, scale, scale);
        this.carGroup.add(this.coneMesh);
        // if (this.lockSelectCar) {
        //   const eventId = this.map.addEventListener(MAP_EVENT.LAYER_AFTER_RENDER, () => {
        //     this.map.setCenter(worldPosition);
        //     this.map.removeEventListener(MAP_EVENT.LAYER_AFTER_RENDER, eventId);
        //   });
        // }
      } else if (i > this.maxCarNum || !list[i]) {
        if (model) {
          this.carGroup.remove(model);
          ModelPool.instance.still(modelName, model);
        }
        continue;
      }
      if (!model) {
        model = ModelPool.instance.take(modelName);
        this.carGroup.add(model);
      }
      const scale = this.modelSize * 0.005;
      model.scale.set(scale, scale, scale);
      runCarList[i] = model;

      const { carDetail, runDetail } = list[i];
      const { position, rotation } = runDetail;
      model.position.set(position[0], position[1], this.modelSize);
      model.rotation.fromArray(rotation);

      const attrLength = attrPoitions.length;
      const pickColor = new THREE.Color(carDetail.pickColor);
      attrPoitions[attrLength] = position[0];
      attrPoitions[attrLength + 1] = position[1];
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

  handleGetCarByColorCallback(data) {
    if (data) {
      this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, data.carDetail);
    }
  }
  
  setData(data) {
    this.worker.postMessage({ key: "setData", data: data });
  }

  setTime(time) {
    this.time = time;
  }

  setModelSize(modelSize) {
    this.modelSize = modelSize;
    this.pickLayerMaterial.setValues({ size: this.modelSize * 5 });
    this.pickLayerMaterial.needsUpdate = true;
    this.pickMeshMaterial.setValues({ size: this.modelSize * 5 });
    this.pickMeshMaterial.needsUpdate = true;
  }
}
