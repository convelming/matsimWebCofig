import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";


import Parking3DLayerWorker from "../worker/Parking3DLayer.worker";


const SIZE = 80;

export class Parking3DLayer extends Layer {

  color = new THREE.Color(0xff0000);

  scale = 1;
  colors = [];
  time = 0;
  maxNum = 1000;

  texture = new THREE.TextureLoader().load(require("@/assets/image/point2.png"));


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
            float length = (textColor.r + textColor.g + textColor.b) / 3.0  ;
            if(length < 0.5){
              outgoingLight = vec3(1.0);
            }else{
              outgoingLight = vColor.rgb;
            }
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

    this.worker = new Parking3DLayerWorker();
    // this.worker.onmessage = (event) => {
    //   const { key, data } = event.data;
    //   switch (key) {
    //     case "setData":
    //       // this.handleSetData(data);
    //       break;
    //     case "render":
    //       this.handleRenderCallback(data);
    //       break;
    //     case "getParkingByColor":
    //       this.handleGetParkingByColor(data);
    //       break;
    //   }
    // };

    this.worker.onmessage = (event) => {
      const [key] = event.data;
      const data = event.data.slice(1);
      switch (key) {
        case 1:
          // this.center = [data[0], data[1]];
          // this.canRender = true;
          // if (this.map) {
          //   const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
          //   this.busGroup.position.set(x, y, 0);
          //   this.pickLayerMesh.position.set(x, y, 0);
          //   this.pickMeshMesh.position.set(x, y, 0);
          //   this.callWorkerRender();
          // }

          const array = new Float64Array([2, this.time, 3]);
          this.worker.postMessage(array, [array.buffer]);
          break;
        case 2:
          this.handleRenderCallback(data);
          break;
        case 3:
          this.handleGetParkingByColor(data);
          break;
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
  }

  on(type, data) {
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
      console.log(data);
      this.worker.postMessage({
        key: "getParkingByColor",
        data: {
          pickColor: data.pickColor,
        },
      });
    }

  }

  dispose() {
    super.dispose();
    this.worker.terminate();
  }

  onAdd(map) {
    super.onAdd(map);
  }

  render() {
    super.render();
    if (this.rendering) return;
    this.rendering = true;
    // const array = new Float64Array([2, this.time, this.maxNum]);
    // this.worker.postMessage(array, [array.buffer]);
  }

  handleRenderCallback(array) {
    const [time, cx, cy, maxNum] = array;
    const list = array.slice(4);
    this.center = [cx, cy];
    const _scale = this.map.cameraHeight / 4000 * this.scale;
    const decode = new TextDecoder();

    // if (!this.mesh || this.mesh.count != this.maxNum) {
    //   this.clearScene();
    //   if (this.mesh) this.mesh.dispose();
    //   if (this.pickLayerMesh) this.pickLayerMesh.dispose();
    //   if (this.pickMesh) this.pickMesh.dispose();

    //   this.mesh = new THREE.InstancedMesh(this.geometry, this.material, maxNum);
    //   this.pickLayerMesh = new THREE.InstancedMesh(this.pickGeometry, this.pickMaterial, maxNum);
    //   this.pickMesh = new THREE.InstancedMesh(this.pickGeometry2, this.pickMaterial2, maxNum);

    //   this.scene.add(this.mesh);
    //   this.pickLayerScene.add(this.pickLayerMesh);
    //   this.pickMeshScene.add(this.pickMesh);
    // }
    let runnum = 0;
    for (let i = 0, dataLength = list[0]; i < list.length; i += dataLength + 1, dataLength = list[i]) {
      const activity = list.slice(i + 1, i + 1 + dataLength);
      const [px, py, pickColor, startTime, endTime, ...typeArray] = activity;
      console.log(px, py, pickColor, startTime, endTime, typeArray, decode.decode(new Uint8Array(typeArray)));
      runnum += 1;
    }
    // for (let i = 0; i < maxNum; i++) {
    //   const activity = list[i];
    //   if (activity) {
    //     const { point, pickColor, actType, startTime } = activity;
    //     const positionV3 = new THREE.Vector3(point[0], point[1], i / maxNum);
    //     const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);
    //     const matrix = new THREE.Matrix4();
    //     if (time - startTime < 20 && startTime > 30) {
    //       const s = _scale * ((1 - (time - startTime) / 20) * 2 + 1);
    //       scaleV3.set(s, s, s);
    //     }
    //     matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

    //     this.mesh.setMatrixAt(i, matrix);
    //     this.pickLayerMesh.setMatrixAt(i, matrix);
    //     this.pickMesh.setMatrixAt(i, matrix);

    //     const color = this.colors.get(actType) || this.color;
    //     this.mesh.setColorAt(i, new THREE.Color(color));
    //     // pickLayerMesh.setColorAt(i, this.pickLayerColor);
    //     this.pickMesh.setColorAt(i, new THREE.Color(pickColor));
    //   } else {
    //     const positionV3 = new THREE.Vector3(0, 0, -1000);
    //     const scaleV3 = new THREE.Vector3(1, 1, 1);
    //     const matrix = new THREE.Matrix4();
    //     matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

    //     this.mesh.setMatrixAt(i, matrix);
    //     this.pickLayerMesh.setMatrixAt(i, matrix);
    //     this.pickMesh.setMatrixAt(i, matrix);


    //     this.mesh.setColorAt(i, new THREE.Color(0));
    //     this.pickMesh.setColorAt(i, new THREE.Color(0));
    //   }
    // }

    // this.mesh.instanceMatrix.needsUpdate = true;
    // this.pickLayerMesh.instanceMatrix.needsUpdate = true;
    // this.pickMesh.instanceMatrix.needsUpdate = true;

    // this.mesh.instanceColor.needsUpdate = true;
    // this.pickMesh.instanceColor.needsUpdate = true;

    // const [x, y] = this.map.WebMercatorToCanvasXY(cx, cy);

    // this.mesh.position.set(x, y, 0);
    // this.pickLayerMesh.position.set(x, y, 0);
    // this.pickMesh.position.set(x, y, 0);

    this.rendering = false;
  }

  handleGetParkingByColor(v) {
    if (v) this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, v);
  }

  setTime(time) {
    this.time = time;
  }

  setMaxNum(maxNum) {
    this.maxNum = maxNum;
  }

  setScale(scale) {
    this.scale = scale;
  }

  setColors(colors) {
    this.colors = new Map(colors.map(v => [v.name, v.color]))
  }

  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = new THREE.Color(pickLayerColor);
    this.pickMaterial.setValues({ color: this.pickLayerColor });
  }

  setData(data) {
    const str = JSON.stringify(data);
    const strArray = new TextEncoder().encode(str);
    const array = new Uint8Array(1 + strArray.length);
    array.set([1], 0);
    array.set(strArray, 1);
    this.worker.postMessage(array, [array.buffer]);
  }

}