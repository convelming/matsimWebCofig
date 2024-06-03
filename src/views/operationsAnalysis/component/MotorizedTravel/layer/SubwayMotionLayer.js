import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { SubwayMotionPath, SubwayMotionPoint, ModelPool } from "../utils.js";

import SubwayMotionLayerWorker from "../worker/SubwayMotionLayer.worker";

export class SubwayMotionLayer extends Layer {
  name = "SubwayMotionLayer";
  time = 0;
  timeSpeed = 60 * 1;

  timeObj = new Map();
  subwayMap = new Map();
  runSubwayList = new Array();

  selectSubwayId = null;

  maxSubwayNum = 500;
  modelSize = 10;
  lockSelectSubway = true;

  constructor(opt) {
    super(opt);
    this.maxSubwayNum = opt.maxSubwayNum || this.maxSubwayNum;
    this.lockSelectSubway = opt.lockSelectSubway || this.lockSelectSubway;
    this.modelSize = opt.modelSize || this.modelSize;

    this.subwayGroup = new THREE.Group();

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
      const { key, data } = event.data;
      switch (key) {
        case "setData":
          break;
        case "render":
          this.handleRenderCallback(data);
          break;
        case "getSubwayByColor":
          this.handleGetSubwayByColorCallback(data);
          break;
        case "getSubwayByUuid":
          this.handleGetSubwayByUuidCallback(data);
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
      this.subwayGroup.position.set(x, y, 0);
      this.pickLayerMesh.position.set(x, y, 0);
      this.pickMeshMesh.position.set(x, y, 0);
    }

    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      this.worker.postMessage({
        key: "getSubwayByColor",
        data: { pickColor: data.pickColor },
      });
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.center = this.map.center;
  }

  beforeRender() {
    if (this.lockSelectSubway && this._selectSubwayDetail && this._selectSubwayPath) {
      const { startTime, desireSpeed } = this._selectSubwayDetail;
      const traveledDistance = (this.time - startTime) * desireSpeed;
      const { start, end, isRunning } = this._selectSubwayPath.getPointByDistance(traveledDistance);
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
        maxSubwayNum: this.maxSubwayNum,
        center: this.center,
      },
    });
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
  }

  setSelectSubwayId(uuid) {
    this.selectSubwayId = uuid;
    this.worker.postMessage({
      key: "getSubwayByUuid",
      data: {
        uuid: this.selectSubwayId,
      },
    });
  }

  handleGetSubwayByUuidCallback(data) {
    if (data) {
      const { subwayDetail, path } = data;
      this._selectSubwayDetail = subwayDetail;
      this._selectSubwayPath = new SubwayMotionPath(path);
    } else {
      this._selectSubwayDetail = null;
      this._selectSubwayPath = null;
    }
  }

  handleRenderCallback({ time, list, center }) {
    this.rendering = false;

    const num = Math.max(this.runSubwayList.length, list.length);
    const runSubwayList = [];
    const attrPoitions = [];
    const attrPickColors = [];
    const modelName = "Subway";

    this.subwayGroup.remove(this.coneMesh);

    for (let i = 0; i < num; i++) {
      let model = this.runSubwayList[i];
      if (list[i] && list[i].subwayDetail.uuid == this.selectSubwayId) {
        const { position, worldPosition } = list[i].runDetail;
        this.coneMesh.position.set(position[0], position[1], this.modelSize * 7);
        const scale = this.modelSize * 0.1;
        this.coneMesh.scale.set(scale, scale, scale);
        this.subwayGroup.add(this.coneMesh);
        // if (this.lockSelectSubway) {
        //   const eventId = this.map.addEventListener(MAP_EVENT.LAYER_AFTER_RENDER, () => {
        //     this.map.setCenter(worldPosition);
        //     this.map.removeEventListener(MAP_EVENT.LAYER_AFTER_RENDER, eventId);
        //   });
        // }
      } else if (i > this.maxSubwayNum || !list[i]) {
        if (model) {
          this.subwayGroup.remove(model);
          ModelPool.instance.still(modelName, model);
        }
        continue;
      }
      if (!model) {
        model = ModelPool.instance.take(modelName);
        this.subwayGroup.add(model);
      }
      const scale = this.modelSize * 0.005;
      model.scale.set(scale, scale, scale);
      runSubwayList[i] = model;

      const { subwayDetail, runDetail } = list[i];
      const { position, rotation } = runDetail;
      model.position.set(position[0], position[1], this.modelSize);
      model.rotation.fromArray(rotation);

      const attrLength = attrPoitions.length;
      const pickColor = new THREE.Color(subwayDetail.pickColor);
      attrPoitions[attrLength] = position[0];
      attrPoitions[attrLength + 1] = position[1];
      attrPoitions[attrLength + 2] = (this.modelSize * 10) / 4;
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

  handleGetSubwayByColorCallback(data) {
    if (data) {
      this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, data.subwayDetail);
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
    this.pickLayerMaterial.setValues({ size: this.modelSize * 10 });
    this.pickLayerMaterial.needsUpdate = true;
    this.pickMeshMaterial.setValues({ size: this.modelSize * 10 });
    this.pickMeshMaterial.needsUpdate = true;
  }
}
