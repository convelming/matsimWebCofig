import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";


import Activity3DLayerWorker from "../worker/Activity3DLayer.worker";


const SIZE = 80;

export class Activity3DLayer extends Layer {

  color = new THREE.Color(0xff0000);

  scale = 1;
  colors = [];
  time = 0;
  maxNum = 1000;

  texture = new THREE.TextureLoader().load(require("@/assets/image/point.png"));


  constructor(opt) {
    super(opt);

    this.scale = opt.scale || this.scale;
    this.colors = new Map((opt.colors || this.colors).map(v => [v.name, v.color]));
    this.maxNum = opt.maxNum || this.maxNum;

    this.texture = opt.texture || this.texture;

    this.geometry = new THREE.BoxGeometry(SIZE, SIZE);
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

    this.worker = new Activity3DLayerWorker();
    this.worker.onmessage = (event) => {
      const { key, data } = event.data;
      switch (key) {
        case "setData":
          // this.handleSetData(data);
          break;
        case "render":
          this.handleRenderCallback(data);
          break;
        case "getActivityByColor":
          this.handleGetActivityByColor(data);
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
        key: "getActivityByColor",
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
    this.worker.postMessage({
      key: "render",
      data: {
        time: this.time,
        maxNum: this.maxNum,
        center: this.center,
      },
    });
  }

  handleRenderCallback({ time, maxNum, center, list }) {
    console.log("handleRenderCallback");
    this.center = center;
    const _scale = this.map.cameraHeight / 4000;

    if (!this.mesh || this.mesh.count != this.maxNum) {
      this.clearScene();
      if (this.mesh) this.mesh.dispose();
      if (this.pickLayerMesh) this.pickLayerMesh.dispose();
      if (this.pickMesh) this.pickMesh.dispose();

      this.mesh = new THREE.InstancedMesh(this.geometry, this.material, maxNum);
      this.pickLayerMesh = new THREE.InstancedMesh(this.pickGeometry, this.pickMaterial, maxNum);
      this.pickMesh = new THREE.InstancedMesh(this.pickGeometry2, this.pickMaterial2, maxNum);

      this.scene.add(this.mesh);
      this.pickLayerScene.add(this.pickLayerMesh);
      this.pickMeshScene.add(this.pickMesh);
    }
    for (let i = 0; i < maxNum; i++) {
      const activity = list[i];
      if (activity) {
        const { coord, pickColor, actType } = activity;
        const positionV3 = new THREE.Vector3(coord.x, coord.y, i / maxNum);
        const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);
        const matrix = new THREE.Matrix4();
        matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

        this.mesh.setMatrixAt(i, matrix);
        this.pickLayerMesh.setMatrixAt(i, matrix);
        this.pickMesh.setMatrixAt(i, matrix);

        const color = this.colors.get(actType) || this.color;
        this.mesh.setColorAt(i, new THREE.Color(color));
        // pickLayerMesh.setColorAt(i, this.pickLayerColor);
        this.pickMesh.setColorAt(i, new THREE.Color(pickColor));
      } else {
        const positionV3 = new THREE.Vector3(0, 0, -1000);
        const scaleV3 = new THREE.Vector3(1, 1, 1);
        const matrix = new THREE.Matrix4();
        matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

        this.mesh.setMatrixAt(i, matrix);
        this.pickLayerMesh.setMatrixAt(i, matrix);
        this.pickMesh.setMatrixAt(i, matrix);


        this.mesh.setColorAt(i, new THREE.Color(0));
        this.pickMesh.setColorAt(i, new THREE.Color(0));
      }
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.pickLayerMesh.instanceMatrix.needsUpdate = true;
    this.pickMesh.instanceMatrix.needsUpdate = true;

    this.mesh.instanceColor.needsUpdate = true;
    this.pickMesh.instanceColor.needsUpdate = true;

    const [x, y] = this.map.WebMercatorToCanvasXY(...center);

    this.mesh.position.set(x, y, 0);
    this.pickLayerMesh.position.set(x, y, 0);
    this.pickMesh.position.set(x, y, 0);

    this.rendering = false;
  }

  handleGetActivityByColor(v) {
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
    this.worker.postMessage({ key: "setData", data: data });
  }

}