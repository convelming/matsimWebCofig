import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { ModelPool } from "@/mymap/utils/ModelPool.js";

import CarTravelLayerWorker from "../worker/CarTravelLayer.worker";

const BUILD_ZOOM = 15;
const EARTH_RADIUS = 20037508.3427892;

export class CarTravelLayer extends Layer {
  time = 27046; //3600 * 8;
  timeSpeed = 60 * 1;

  runCarList = new Array();
  maxCarNum = Number.MAX_SAFE_INTEGER;
  modelSize = 10;
  lockSelectCar = true;
  modelPool = null;

  loading = false;

  dataSource = "";

  center = [12628397, 2655338.7];

  selectCarIndex = -1;

  constructor(opt) {
    super(opt);
    this.dataSource = opt.dataSource || this.dataSource;
    this.center = opt.center || this.center;

    this.maxVehicleNum = opt.maxVehicleNum || this.maxVehicleNum;
    this.lockSelectVehicle = opt.lockSelectVehicle || this.lockSelectVehicle;
    this.modelSize = opt.modelSize || this.modelSize;

    this.modelPool = new ModelPool({
      SUV: "/models/SUV.gltf",
    });

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

    this.worker = new CarTravelLayerWorker();
    this.worker.onmessage = (event) => {
      const [key] = event.data;
      const data = event.data.slice(1);
      switch (key) {
        case 1: {
          //"loadTiles":
          this.loading = false;
          this.handleEventListener(MAP_EVENT.LAYER_LOADING, this.loading);
          this.handleRender();
          break;
        }
        case 2: {
          //"render":
          // console.log(data);
          this.handleRenderCallback(data);
          break;
        }
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
  }

  // 地图加载完成回调
  async onAdd(map) {
    super.onAdd(map);
    this.handleLoadTiles();
  }

  // 地图事件回调
  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER || type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.handleLoadTiles();
    }

    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.carGroup.position.set(x, y, 0);
      this.pickLayerMesh.position.set(x, y, 0);
      this.pickMeshMesh.position.set(x, y, 0);
    }

    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, data.pickColor - 1);
    }
  }

  render() {
    super.render();
    // this.handleRender();
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
  }

  handleLoadTiles() {
    if (!this.map) return;
    this.loading = true;
    this.handleEventListener(MAP_EVENT.LAYER_LOADING, this.loading);
    this.worker.postMessage({
      ...this.map.getTileRangeByZoom(BUILD_ZOOM),
      key: 1,
      dataSource: this.dataSource,
    });
  }

  handleRender() {
    if (this.rendering) return;
    this.rendering = true;
    let windowRange = {
      maxX: 0,
      minX: 0,
      maxY: 0,
      minY: 0,
      width: 0,
      height: 0,
    };
    if (this.map) windowRange = this.map.getTileRangeByZoom(this.map.zoom);
    this.worker.postMessage({
      ...windowRange,
      key: 2,
      time: this.time,
      maxCarNum: this.maxCarNum,
      selectCarIndex: this.selectCarIndex,
      center: this.center,
    });
  }

  setTime(time) {
    // this.time = Number(time.toFixed(4));
    if (this._changeTimeout || Math.abs(this.time - time) < 0.001) return;
    this._changeTimeout = setTimeout(() => {
      this.time = Number(time.toFixed(4));
      this.handleRender();
      this._changeTimeout = null;
    }, 1000 / 60);
  }

  setModelSize(modelSize) {
    this.modelSize = modelSize;
    this.pickLayerMaterial.setValues({ size: this.modelSize * 5 });
    this.pickLayerMaterial.needsUpdate = true;
    this.pickMeshMaterial.setValues({ size: this.modelSize * 5 });
    this.pickMeshMaterial.needsUpdate = true;
    this.handleRender();
  }

  handleRenderCallback(array) {
    this.rendering = false;
    if (!this.map) return;
    const arraySize = 8;
    const num = Math.max(this.runCarList.length, array.length / arraySize);
    const runCarList = [];
    const attrPoitions = [];
    const attrPickColors = [];
    const modelName = "SUV";
    const scale = this.modelSize * 0.005;

    this.carGroup.remove(this.coneMesh);
    for (let i = 0; i < num; i++) {
      let model = this.runCarList[i];
      const data = array.slice(i * arraySize, i * arraySize + arraySize);
      const [carId, x, y, z, qx, qy, qz, qw] = data;
      if (carId == this.selectCarIndex && carId != undefined) {
        this.coneMesh.position.set(x, y, z + this.modelSize * 4.5);
        const scale = this.modelSize * 0.1;
        this.coneMesh.scale.set(scale, scale, scale);
        this.carGroup.add(this.coneMesh);
        if (this.lockSelectCar && this.map) this.map.setCenter([x + this.center[0], y + this.center[1]]);
      } else if (i > this.maxCarNum || carId == undefined) {
        if (model) {
          this.carGroup.remove(model);
          this.modelPool.still(modelName, model);
        }
        continue;
      }
      if (!model) {
        model = this.modelPool.take(modelName);
        if (!model) continue;
        this.carGroup.add(model);
      }

      model.scale.set(scale, scale, scale);
      model.position.set(x, y, z + this.modelSize);
      model.quaternion.set(qx, qy, qz, qw);

      runCarList[i] = model;

      const attrLength = attrPoitions.length;
      const pickColor = new THREE.Color(carId + 1);
      attrPoitions[attrLength] = x;
      attrPoitions[attrLength + 1] = y;
      attrPoitions[attrLength + 2] = z + (this.modelSize * 5) / 4;
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

    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.carGroup.position.set(x, y, 0);
    this.pickLayerMesh.position.set(x, y, 0);
    this.pickMeshMesh.position.set(x, y, 0);
  }

  setSelectCarIndex(index) {
    this.selectCarIndex = index;
    this.handleRender();
  }
}
