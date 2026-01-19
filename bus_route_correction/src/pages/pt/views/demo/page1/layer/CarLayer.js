import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { ModelPool } from "@/mymap/utils/ModelPool.js";

import CarLayerWorker from "./CarLayer.worker";

export class CarLayer extends Layer {
  name = "CarLayer";
  time = 3600 * 8;

  runCarList = new Array();

  selectCarIndex = -1;

  maxCarNum = 2000;
  modelSize = 10;
  lockSelectCar = true;

  canRender = false;

  modelPool = null;

  center = [0, 0];

  constructor(opt) {
    super(opt);
    this.maxCarNum = opt.maxCarNum || this.maxCarNum;
    this.lockSelectCar = opt.lockSelectCar || this.lockSelectCar;
    this.modelSize = opt.modelSize || this.modelSize;

    this.modelPool = new ModelPool({
      SUV: window.VUE_APP_EXTERNAL_FILE_PATH + "/models/SUV.gltf",
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

    const geometry = new THREE.ConeGeometry(18, 30, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.8,
      transparent: true,
    });
    this.coneMesh = new THREE.Mesh(geometry, material);
    this.coneMesh.rotateX((Math.PI / 2) * 3);

    this.worker = new CarLayerWorker();
    this.worker.onmessage = (event) => {
      const { type, postTime, callTime, array } = event.data;
      switch (type) {
        case 1:
          this.center = event.data.center;
          this.idList = event.data.idList;
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
          this.handleRenderCallback(array);
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
      this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, id);
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
    let windowRange = {
      maxX: 0,
      minX: 0,
      maxY: 0,
      minY: 0,
      width: 0,
      height: 0
    };
    if (this.map) windowRange = this.map.getWindowRangeAndWebMercator();
    const list = [];
    list.push(this.time);
    list.push(this.maxCarNum);
    list.push(this.selectCarIndex);
    list.push(windowRange.maxX);
    list.push(windowRange.minX);
    list.push(windowRange.maxY);
    list.push(windowRange.minY);
    const array = new Float64Array(list);
    this.worker.postMessage({
      type: 2,
      postTime: new Date().getTime(),
      array: array
    }, [array.buffer]);
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
    const modelName = "SUV";
    this.runCarList.forEach(model => {
      this.carGroup.remove(model);
      this.modelPool.still(modelName, model)
    })
    this.runCarList.length = 0;
    this.modelPool.dispose();
    this.pickGeometry.dispose();
  }


  handleRenderCallback(array) {
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
      if (data[0] == this.selectCarIndex && data[0] != undefined) {
        this.coneMesh.position.set(data[1], data[2], this.modelSize * 4.5);
        const scale = this.modelSize * 0.1;
        this.coneMesh.scale.set(scale, scale, scale);
        this.carGroup.add(this.coneMesh);
        if (this.lockSelectCar && this.map) this.map.setCenter([data[1] + this.center[0], data[2] + this.center[1]]);
      } else if (i > this.maxCarNum || data[0] == undefined) {
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

      // const scale = this.modelSize * 0.005;
      // model.scale.set(scale, scale, scale);
      // model.position.set(data[1], data[2], this.modelSize);
      // const rotationOrderMap = { 1: "XYZ", 2: "YXZ", 3: "ZXY", 4: "ZYX", 5: "YZX", 6: "XZY" };
      // model.rotation.fromArray([data[3], data[4], data[5], rotationOrderMap[data[6]]]);

      const scale = this.modelSize * 0.005;
      model.scale.set(scale, scale, scale);
      model.position.set(data[1], data[2], this.modelSize);
      model.quaternion.set(data[3], data[4], data[5], data[6]);


      runCarList[i] = model;

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
