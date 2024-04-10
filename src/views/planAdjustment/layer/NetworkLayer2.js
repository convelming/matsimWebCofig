import * as THREE from "three";

import NetworkLayerWorker from "../worker/NetworkLayer2.worker";

import { Layer, MAP_EVENT } from "@/mymap/index.js";

import { getGeomjson } from "@/api/index";

export class NetworkLayer2 extends Layer {
  name = "NetworkLayer2";
  color = new THREE.Color(0x909399);
  lineWidth = 6;
  center = [12594687.19, 2641696.16];

  material = null;
  pickLayerMaterial = null;
  pickMaterial = null;

  data = [];
  geometryList = [];

  bufferGeometryLoader = new THREE.BufferGeometryLoader();

  constructor(opt) {
    super(opt);
    this.data = [];
    this.geometryList = [];
    this.color = new THREE.Color(opt.color || this.color);
    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.center = opt.center || this.center;

    this.material = this.getMaterial({
      color: this.color,
      usePickColor: false,
    });

    this.pickLayerMaterial = this.getMaterial({
      pickOffset: 10,
      usePickColor: false,
    });

    this.pickMaterial = this.getMaterial({
      vertexColors: true,
      usePickColor: true,
      pickOffset: 10,
    });

    getGeomjson({
      selectAll: true,
    }).then((res) => {
      const worker = new NetworkLayerWorker();
      worker.onmessage = (event) => {
        if (event.data.type === "end") {
          this._timer = setInterval(() => {
            const geometryJson = this.geometryList.shift();
            if (!geometryJson) {
              return;
            }
            const geometry = this.bufferGeometryLoader.parse(geometryJson);

            const mesh = new THREE.Mesh(geometry, this.material);
            this.scene.add(mesh);

            const pickLayerMesh = new THREE.Mesh(
              geometry,
              this.pickLayerMaterial
            );
            this.pickLayerScene.add(pickLayerMesh);

            const pickMesh = new THREE.Mesh(geometry, this.pickMaterial);
            this.pickMeshScene.add(pickMesh);

            this._setMeshPosition();
          }, 100);
        } else if (event.data.type === "progress") {
          const { dataList, geometryJson } = event.data.data;
          this.data.push(...dataList);
          this.geometryList.push(geometryJson);
        }
      };
      worker.onerror = (event) => {};
      worker.postMessage({ data: res.data, center: this.center });
    });
  }

  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = pickLayerColor;
    this.pickLayerMaterial.setValues({
      color: pickLayerColor,
    });
    this.pickLayerMaterial.needsUpdate = true;
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      this._setMeshPosition();
      this.handleEventListener(type);
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      let item = this.data.find((v) => data.pickColor == v.pickColorNum);
      if (item) {
        this.handleEventListener(type, item);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this._setMeshPosition();
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
  }

  show() {
    super.show();
    this._setMeshPosition();
  }

  _setMeshPosition() {
    if (!this.map) return;
    for (const mesh of this.scene.children) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      mesh.position.set(x, y, 0);
    }
    for (const mesh of this.pickLayerScene.children) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      mesh.position.set(x, y, 0);
    }
    for (const mesh of this.pickMeshScene.children) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      mesh.position.set(x, y, 0);
    }
  }

  setValues(opt) {
    for (const key in opt) {
      this[key] = opt[key];
    }
    if (this.material) this.material.needsUpdate = true;
    if (this.pickLayerMaterial) this.pickLayerMaterial.needsUpdate = true;
    if (this.pickMaterial) this.pickMaterial.needsUpdate = true;
  }

  getMaterial({ usePickColor, pickOffset, ...opt }) {
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      wireframe: false,
      ...opt,
    });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
          #include <common>
          vec3 lineOffset(vec2 start, vec3 current, vec2 end, float offset) {
            float lenA = length(current.xy - start);
            float lenB = length(current.xy - end);

            if(lenA == 0. && lenB == 0.) return current;

            vec2 dirA = normalize(current.xy - start);
            vec2 dirB = normalize(current.xy - end);

            if(lenA == 0.) {
              float angle = PI / 2.0;
              vec2 normal = vec2(-dirB.y, dirB.x);
              return vec3(current.xy + normal * offset / sin(angle), current.z);
            } else if(lenB == 0.) {
              float angle = PI / 2.0;
              vec2 normal = vec2(dirA.y, -dirA.x);
              return vec3(current.xy + normal * offset / sin(angle), current.z);
            } else {
              vec2 dir = normalize(dirB - dirA);
              vec2 normal = vec2(-dir.y, dir.x);
              float angle = acos(dot(dirB, normal));
              return vec3(current.xy + normal * offset / sin(angle), current.z);
            }
          }

          attribute vec3 pickColor;
          attribute float side;
          attribute vec2 startPosition;
          attribute vec2 endPosition;
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float lineWidth = ${Number(
            this.lineWidth + (pickOffset || 0)
          ).toFixed(2)};
          float offset = lineWidth / 2.0  * side;
          transformed = lineOffset(startPosition, position, endPosition, offset);
        `
      );
      if (usePickColor) {
        shader.vertexShader = shader.vertexShader.replace(
          "#include <color_vertex>",
          `
            #include <color_vertex>
            #if defined( USE_COLOR_ALPHA )
              vColor = vec4(pickColor,1.0);
            #elif defined( USE_COLOR )
              vColor = pickColor;
            #endif
          `
        );
      }
    };
    /**
     * 当用到onBeforeCompile回调的时候，
     * 这个回调函数可以用来定义在onBeforeCompile中使用的配置项，
     * 这样three.js就可以根据这个回调返回的字符串来判定使用一个
     * 缓存的编译好的着色器代码还是根据需求重新编译一段新的着色器代码。
     * material.needsUpdate也要设置为true
     */
    material.customProgramCacheKey = () => {
      return JSON.stringify({
        lineWidth: this.lineWidth,
        usePickColor: usePickColor,
        pickOffset: pickOffset,
      });
    };
    return material;
  }
}
