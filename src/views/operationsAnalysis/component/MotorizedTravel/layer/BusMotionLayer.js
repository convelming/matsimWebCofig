import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { BusMotionPath, BusMotionPoint, ModelPool } from "../utils.js";

import BusMotionLayerWorker from "../worker/BusMotionLayer.worker";

export class BusMotionLayer extends Layer {
  name = "BusMotionLayer";
  time = 0;
  timeSpeed = 60 * 1;

  timeObj = new Map();
  busMap = new Map();
  runBusList = new Array();

  selectBusId = null;

  maxBusNum = 500;
  modelSize = 10;
  lockSelectBus = true;

  constructor(opt) {
    super(opt);
    this.maxBusNum = opt.maxBusNum || this.maxBusNum;
    this.lockSelectBus = opt.lockSelectBus || this.lockSelectBus;
    this.modelSize = opt.modelSize || this.modelSize;

    this.pickLayerMaterial = new THREE.PointsMaterial({
      size: this.modelSize * 10,
      transparent: true,
      sizeAttenuation: true,
      vertexColors: false,
      color: this.pickLayerColor,
    });

    this.pickMeshMaterial = new THREE.PointsMaterial({
      size: this.modelSize * 10,
      transparent: true,
      sizeAttenuation: true,
      vertexColors: true,
    });

    this.pickGeometry = new THREE.BufferGeometry();

    this.pickLayerMesh = new THREE.Points(this.pickGeometry, this.pickLayerMaterial);

    this.pickMeshMesh = new THREE.Points(this.pickGeometry, this.pickMeshMaterial);

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
      const { key, data } = event.data;
      switch (key) {
        case "setData":
          break;
        case "render":
          this.handleRenderCallback(data);
          break;
        case "getBusByColor":
          this.handleGetBusByColorCallback(data);
          break;
        case "getBusByUuid":
          this.handleGetBusByUuidCallback(data);
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
      this.scene.position.set(x, y, this.scene.position.z);
      this.pickLayerScene.position.set(x, y, this.pickLayerScene.position.z);
      this.pickMeshScene.position.set(x, y, this.pickMeshScene.position.z);
    }

    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      this.worker.postMessage({
        key: "getBusByColor",
        data: { pickColor: data.pickColor },
      });
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.center = this.map.center;
  }

  beforeRender() {
    if (this.lockSelectBus && this._selectBusDetail && this._selectBusPath) {
      const { startTime, desireSpeed } = this._selectBusDetail;
      const traveledDistance = (this.time - startTime) * desireSpeed;
      const { start, end, isRunning } = this._selectBusPath.getPointByDistance(traveledDistance);
      if (isRunning) {
        this.map.setCenter(start.toJSON());
      }
    }
  }

  render() {
    super.render();
    if (this.rendering) return;
    this.rendering = true;
    this.worker.postMessage({
      key: "render",
      data: {
        time: this.time,
        maxBusNum: this.maxBusNum,
        center: this.center,
      },
    });
  }

  dispose() {
    this.worker.terminate();
  }

  setSelectBusId(uuid) {
    this.selectBusId = uuid;
    this.worker.postMessage({
      key: "getBusByUuid",
      data: {
        uuid: this.selectBusId,
      },
    });
  }

  handleGetBusByUuidCallback(data) {
    if (data) {
      const { busDetail, path } = data;
      this._selectBusDetail = busDetail;
      this._selectBusPath = new BusMotionPath(path);
    } else {
      this._selectBusDetail = null;
      this._selectBusPath = null;
    }
  }

  handleRenderCallback({ time, list, center }) {
    this.rendering = false;

    const num = Math.max(this.runBusList.length, list.length);
    const runBusList = [];
    const attrPoitions = [];
    const attrPickColors = [];
    const modelName = "Bus";

    this.scene.remove(this.coneMesh);

    for (let i = 0; i < num; i++) {
      let model = this.runBusList[i];
      if (list[i] && list[i].busDetail.uuid == this.selectBusId) {
        const { position, worldPosition } = list[i].runDetail;
        this.coneMesh.position.set(position[0], position[1], this.modelSize * 7);
        const scale = this.modelSize * 0.1;
        this.coneMesh.scale.set(scale, scale, scale);
        this.scene.add(this.coneMesh);
        // if (this.lockSelectBus) {
        //   const eventId = this.map.addEventListener(MAP_EVENT.LAYER_AFTER_RENDER, () => {
        //     this.map.setCenter(worldPosition);
        //     this.map.removeEventListener(MAP_EVENT.LAYER_AFTER_RENDER, eventId);
        //   });
        // }
      } else if (i > this.maxBusNum || !list[i]) {
        if (model) {
          this.scene.remove(model);
          ModelPool.instance.still(modelName, model);
        }
        continue;
      }
      if (!model) {
        model = ModelPool.instance.take(modelName);
        this.scene.add(model);
      }
      const scale = this.modelSize * 0.005;
      model.scale.set(scale, scale, scale);
      runBusList[i] = model;

      const { busDetail, runDetail } = list[i];
      const { position, rotation } = runDetail;
      model.position.set(position[0], position[1], this.modelSize);
      model.rotation.fromArray(rotation);

      const attrLength = attrPoitions.length;
      const pickColor = new THREE.Color(busDetail.pickColor);
      attrPoitions[attrLength] = position[0];
      attrPoitions[attrLength + 1] = position[1];
      attrPoitions[attrLength + 2] = (this.modelSize * 10) / 4;
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

  handleGetBusByColorCallback(data) {
    console.log("handleGetBusByColorCallback", data);
    if (data) {
      this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, data.busDetail);
    }
  }

  clearScene() {
    this.runBusList.forEach((v) => {
      const bus = this.busMap.get(v);
      if (bus.model) ModelPool.instance.still(bus.modelName, bus.model);
      bus.isShow = false;
      bus.model = null;
    });

    this.busMap.clear();
    this.runBusList.length = 0;
    this.timeObj.forEach((v) => (v.length = 0));
    this.timeObj.clear();

    this.pickGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([]), 3));
    this.pickGeometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array([]), 3));
    this.coneMesh.removeFromParent();
    if (this.scene) this.scene.remove(...this.scene.children);
  }

  setData(data) {
    this.worker.postMessage({ key: "setData", data: data });
  }

  setTime(time) {
    this.time = time;
  }

  setModelSize(modelSize) {
    this.modelSize = modelSize;
    this.pickLayerMaterial.setValues({ size: this.modelSize * 10 });
    this.pickLayerMaterial.needsUpdate = true;
    this.pickMeshMaterial.setValues({ size: this.modelSize * 10 });
    this.pickMeshMaterial.needsUpdate = true;
  }
}
