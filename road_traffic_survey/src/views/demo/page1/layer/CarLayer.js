import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { ModelPool } from "@/mymap/utils/ModelPool.js";

import CarLayerWorker from "./CarLayer.worker";

export const CAR_LAYER_EVENT = {
  SELECTED: "selected",
  UPDATE_DETAIL: "updateDetail",
};

export class CarLayer extends Layer {
  name = "CarLayer";
  time = 3600 * 8;

  runCarList = new Array();

  selectCarIndex = -1;

  maxCarNum = 200000;
  modelSize = 10;
  lockSelect = true;

  canRender = false;

  modelPool = null;

  center = [0, 0];

  constructor(opt) {
    super(opt);
    this.maxCarNum = opt.maxCarNum || this.maxCarNum;
    this.lockSelect = opt.lockSelect || this.lockSelect;
    this.modelSize = opt.modelSize || this.modelSize;

    this.modelPool = new ModelPool({
      SUV: process.env.VUE_APP_BASE_API + "models/SUV.glb",
      truck_truck: process.env.VUE_APP_BASE_API + "models/Van.glb",
      veh_passenger: process.env.VUE_APP_BASE_API + "models/SUV.glb",
    })

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

    const geometry = new THREE.ConeGeometry(2, 3, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.8,
      transparent: true,
    });
    this.coneMesh = new THREE.Mesh(geometry, material);
    this.coneMesh.rotateX((Math.PI / 2) * 3);

    this.worker = new CarLayerWorker();
    this.worker.onmessage = (event) => {
      switch (event.data.type) {
        case 1:
          this.center = event.data.center;
          this.idList = event.data.idList;
          this.typeList = event.data.typeList;
          console.log("worker", event.data);

          this.canRender = true;
          if (this.map) {
            const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
            this.carGroup.position.set(x, y, 0);
            this.pickLayerMesh.position.set(x, y, 0);
            this.pickMeshMesh.position.set(x, y, 0);
            this.callWorkerRender();
          }
          break;
        case 2:
          this.handleRenderCallback(event.data.array);
          if (event.data.detail) this.handleEventListener(CAR_LAYER_EVENT.UPDATE_DETAIL, event.data.detail);
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
      this.carGroup.position.set(x, y, 0);
      this.pickLayerMesh.position.set(x, y, 0);
      this.pickMeshMesh.position.set(x, y, 0);

      if (this.line) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.line.userData.center);
        this.line.position.set(x, y, 0);
      }
    }

    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const id = this.idList[data.pickColor - 1];
      this.setSelectCarId(id)
      this.handleEventListener(CAR_LAYER_EVENT.SELECTED, id);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER, {})
  }

  render() {
    super.render();
    // if (this.canRender) this.callWorkerRender();
  }

  callWorkerRender() {
    const list = [];
    list.push(this.time);
    list.push(this.maxCarNum);
    list.push(this.selectCarIndex);

    if (this.map) {
      const [mapCenterX, mapCenterY] = this.map.center;
      const { far, fov } = this.map.camera;
      const width = far / (Math.cos((Math.PI * fov) / 180) * 2);

      list.push(mapCenterX + width);
      list.push(mapCenterX - width);
      list.push(mapCenterY + width);
      list.push(mapCenterY - width);
    }
    const array = new Float64Array(list);
    this.worker.postMessage({
      type: 2,
      postTime: new Date().getTime(),
      array: array
    }, [array.buffer]);
  }

  dispose() {
    this.worker.terminate();
    this.runCarList.forEach(model => {
      this.carGroup.remove(model);
      this.modelPool.still(model)
    })
    this.runCarList.length = 0;
    this.modelPool.dispose();
    this.pickGeometry.dispose();
  }


  handleRenderCallback(array) {
    this.rendering = false;
    const arraySize = 8;
    const num = Math.max(this.runCarList.length, array.length / arraySize);
    const runCarList = [];
    const attrPoitions = [];
    const attrPickColors = [];

    this.runCarList.forEach(model => {
      model.userData.use = false;
      this.modelPool.still(model);
    })

    this.carGroup.remove(this.coneMesh);
    for (let i = 0; i < num; i++) {


      const [id, type, ...path] = array.slice(i * arraySize, i * arraySize + arraySize);

      const modelName = this.typeList[type] || "truck_truck";
      const model = this.modelPool.take(modelName);
      model.userData.use = true;
      if (!model.parent) this.carGroup.add(model);

      if (id == this.selectCarIndex && id != undefined) {
        this.coneMesh.position.set(path[0], path[1], this.modelSize * 6);
        const scale = this.modelSize;
        this.coneMesh.scale.set(scale, scale, scale);
        this.carGroup.add(this.coneMesh);
        if (this.lockSelect && this.map) this.map.setCenter([path[0] + this.center[0], path[1] + this.center[1]]);
      }

      const scale = this.modelSize;
      model.scale.set(scale, scale, scale);
      model.position.set(path[0], path[1], 0);
      model.quaternion.set(path[2], path[3], path[4], path[5]);

      runCarList[i] = model;

      const attrLength = attrPoitions.length;
      const pickColor = new THREE.Color(id + 1);
      if (path[0] && path[1]) {
        attrPoitions[attrLength] = path[0];
        attrPoitions[attrLength + 1] = path[1];
        attrPoitions[attrLength + 2] = (this.modelSize * 5) / 4;
        attrPickColors[attrLength] = pickColor.r;
        attrPickColors[attrLength + 1] = pickColor.g;
        attrPickColors[attrLength + 2] = pickColor.b;
      }
    }

    this.runCarList.forEach(model => {
      if (!model.userData.use) model.removeFromParent();
    })

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
      // this.idList = data.idList;
      // const array = new Float64Array(data.array.length + 2);
      this.idList = [];
      const array = data;
      this.worker.postMessage({
        type: 1,
        postTime: new Date().getTime(),
        array: array
      }, [array.buffer]);
    } catch (error) {
      console.log(error);
      this.idList = [];
      const array = new Float64Array([]);
      this.worker.postMessage({
        type: 1,
        postTime: new Date().getTime(),
        array: array
      }, [array.buffer]);
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

  setSelectCarId(selectCarId) {
    this.selectCarIndex = this.idList.findIndex(v => v == selectCarId);
    this.callWorkerRender();
  }
}
