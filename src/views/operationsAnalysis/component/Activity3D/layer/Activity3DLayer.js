import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

import Activity3DLayerWorker from "../worker/Activity3DLayer.worker";

const SIZE = 80;

export class Activity3DLayer extends Layer {
  canRender = false;

  color = new THREE.Color(0xff0000);

  scale = 1;
  colors = [];
  time = 0;
  maxNum = 1000;

  texture = new THREE.TextureLoader().load(require("@/assets/image/point2.png"));

  // 初始化函数
  constructor(opt) {
    super(opt);

    this.scale = opt.scale || this.scale;
    this.colors = new Map((opt.colors || this.colors).map(v => [v.name, v.color]));
    this.maxNum = opt.maxNum || this.maxNum;

    this.texture = opt.texture || this.texture;

    this.geometry = new THREE.PlaneGeometry(SIZE, SIZE);
    this.material = new THREE.MeshBasicMaterial({
      depthWrite: false,
      transparent: true,
      map: this.texture,
      // color: this.color,
    });
    this.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
          #if defined(USE_MAP)
            vec4 textColor = texture2D( map, vUv );
            outgoingLight.rgb = vColor.rgb;
          #endif
          #include <output_fragment>
        `
      );
    };

    this.pickGeometry = new THREE.BoxGeometry(SIZE * 1.1, SIZE * 1.1);
    this.pickMaterial = new THREE.MeshBasicMaterial({
      color: this.pickLayerColor,
    });
    this.pickGeometry2 = new THREE.BoxGeometry(SIZE * 1.1, SIZE * 1.1);
    this.pickMaterial2 = new THREE.MeshBasicMaterial();

    this.worker = new Activity3DLayerWorker();

    this.worker.onmessage = (event) => {
      const [key] = event.data;
      const data = event.data.slice(1);
      switch (key) {
        case 1:
          this.canRender = true;
          this.callWorkerRender();
          break;
        case 2:
          this.handleRenderCallback(data);
          break;
        case 3:
          this.handleGetActivityByColor(data);
          break;
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
  }

  // 监听事件
  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      if (this.canRender) this.callWorkerRender();
    }
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const array = new Float64Array([3, data.pickColor]);
      this.worker.postMessage(array, [array.buffer]);
    }
  }

  // 销毁函数
  dispose() {
    super.dispose();
    this.worker.terminate();
  }

  // 添加到地图
  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER, {})
  }

  // 地图渲染刷新
  render() {
    super.render();
  }

  // 调用多线程渲染计算
  callWorkerRender() {
    const array = new Float64Array([2, this.time, this.maxNum]);
    this.worker.postMessage(array, [array.buffer]);
  }


  // 清空图层
  clearScene() {
    super.clearScene();
    if (this.mesh) this.mesh.dispose();
    if (this.pickLayerMesh) this.pickLayerMesh.dispose();
    if (this.pickMesh) this.pickMesh.dispose();
    this.mesh = null;
    this.pickLayerMesh = null;
    this.pickMesh = null;
  }

  // 多线程渲染计算回调
  handleRenderCallback(array) {
    if (!this.map) {
      this.clearScene();
    } else {
      const [time, cx, cy, runNum] = array;
      this.center = [cx, cy];
      const _scale = this.map.cameraHeight / 4000 * this.scale;
      const decode = new TextDecoder();

      if (!this.mesh || this.mesh.count != runNum) {
        this.clearScene();

        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, runNum);
        this.pickLayerMesh = new THREE.InstancedMesh(this.pickGeometry, this.pickMaterial, runNum);
        this.pickMesh = new THREE.InstancedMesh(this.pickGeometry2, this.pickMaterial2, runNum);

        this.scene.add(this.mesh);
        this.pickLayerScene.add(this.pickLayerMesh);
        this.pickMeshScene.add(this.pickMesh);
      }
      let aIndex = 0;
      for (let i = 4, dataLength = array[4]; i < array.length; i += dataLength + 1, dataLength = array[i]) {
        const activity = array.slice(i + 1, i + 1 + dataLength);
        const [px, py, pickColor, startTime, endTime, ...typeArray] = activity;

        const positionV3 = new THREE.Vector3(px, py, aIndex / runNum);
        const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);
        const matrix = new THREE.Matrix4();
        if (time - startTime < 20 && startTime > 30) {
          const s = _scale * ((1 - (time - startTime) / 20) * 2 + 1);
          scaleV3.set(s, s, s);
        }
        matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

        this.mesh.setMatrixAt(aIndex, matrix);
        this.pickLayerMesh.setMatrixAt(aIndex, matrix);
        this.pickMesh.setMatrixAt(aIndex, matrix);

        const mtype = decode.decode(new Uint8Array(typeArray));
        const color = this.colors.get(mtype) || this.color;
        this.mesh.setColorAt(aIndex, new THREE.Color(color));
        // pickLayerMesh.setColorAt(aIndex, this.pickLayerColor);
        this.pickMesh.setColorAt(aIndex, new THREE.Color(pickColor));

        aIndex += 1;
      }

      this.mesh.instanceMatrix.needsUpdate = true;
      this.pickLayerMesh.instanceMatrix.needsUpdate = true;
      this.pickMesh.instanceMatrix.needsUpdate = true;

      if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
      if (this.pickMesh.instanceColor) this.pickMesh.instanceColor.needsUpdate = true;
      if (this.map) {
        const [x, y] = this.map.WebMercatorToCanvasXY(cx, cy);
        this.mesh.position.set(x, y, 0);
        this.pickLayerMesh.position.set(x, y, 0);
        this.pickMesh.position.set(x, y, 0);
      }
    }
  }

  // 根据拾取颜色获取活动
  handleGetActivityByColor(array) {
    if (array.length > 0) {
      try {
        const v = JSON.parse(new TextDecoder().decode(new Uint8Array(Array.from(array))));
        this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, v);
      } catch (error) {
        console.log(error)
      }
    }
  }

  // 设置时间
  setTime(time) {
    if (this._changeTimeout || Math.abs(this.time - time) < 0.001) return;
    this._changeTimeout = setTimeout(() => {
      this.time = Number(time.toFixed(4));
      if (this.canRender) this.callWorkerRender();
      this._changeTimeout = null;
    }, 1000 / 60);
  }

  // 设置最大渲染值
  setMaxNum(maxNum) {
    this.maxNum = maxNum;
    if (this.canRender) this.callWorkerRender();
  }

  // 设置大小
  setScale(scale) {
    this.scale = scale;
    if (this.canRender) this.callWorkerRender();
  }

  // 设置活动颜色
  setColors(colors) {
    this.colors = new Map(colors.map(v => [v.name, v.color]));
    if (this.canRender) this.callWorkerRender();
  }

  // 设置图层拾取颜色
  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = new THREE.Color(pickLayerColor);
    this.pickMaterial.setValues({ color: this.pickLayerColor });
    if (this.canRender) this.callWorkerRender();
  }

  // 设置数据
  setData(data) {
    this.canRender = false;
    const str = JSON.stringify(data);
    const strArray = new TextEncoder().encode(str);
    const array = new Float64Array(1 + strArray.length);
    array.set([1], 0);
    array.set(strArray, 1);
    this.worker.postMessage(array, [array.buffer]);
  }

}