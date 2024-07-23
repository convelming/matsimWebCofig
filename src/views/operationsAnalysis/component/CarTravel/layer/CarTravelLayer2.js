import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

import CarTravelLayerWorker from "../worker/CarTravelLayer.worker";

const BUILD_ZOOM = 13;
const EARTH_RADIUS = 20037508.3427892;

export class CarTravelLayer2 extends Layer {

  time = 27046 //3600 * 8;
  timeSpeed = 60 * 1;

  loading = false;

  dataSource = "";

  center = [12628397, 2655338.7]

  constructor(opt) {
    super(opt);
    this.dataSource = opt.dataSource || this.dataSource;
    this.center = opt.center || this.center;

    this.worker = new CarTravelLayerWorker();
    this.worker.onmessage = (event) => {
      const [key] = event.data;
      const data = event.data.slice(1);
      switch (key) {
        case 1: {
          //"loadTiles":
          this.loading = false;
          this.handleEventListener(MAP_EVENT.LAYER_LOADING, this.loading);
          console.timeEnd("handleLoadTiles")
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
    this.worker.terminate();
  }

  handleLoadTiles() {
    if (!this.map) return;
    this.loading = true;
    this.handleEventListener(MAP_EVENT.LAYER_LOADING, this.loading)
    this.worker.postMessage({
      ...this.map.getTileRangeByZoom(BUILD_ZOOM),
      key: 1,
      dataSource: this.dataSource,
    })
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
      height: 0
    };
    if (this.map) windowRange = this.map.getWindowRangeAndWebMercator();
    this.worker.postMessage({
      ...windowRange,
      key: 2,
      time: this.time,
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
  }

  setSelectCarIndex(index) {
    this.selectCarIndex = index;
    this.handleRender();
  }
}



export class CarTravel2Geometry extends THREE.BufferGeometry {
  constructor(array) {
    super();
    this.type = "CarTravel2Geometry";
    this.isCarTravel2Geometry = true;

    const posLen = lineList.length * 4;

    const positions = []; // new Array(posLen * 3);
    const uvs = []; // new Array(posLen * 3);
    const indices = []; // new Array(lineList.length * 6);
    const lineNormals = [];
    const lineLengths = [];


    this.setIndex(indices);
    this.setAttribute("lineLength", new THREE.Float32BufferAttribute(lineLengths, 1));
    this.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    this.setAttribute("lineNormal", new THREE.Float32BufferAttribute(lineNormals, 3));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.computeVertexNormals();
  }
}

export class CarTravel2Material extends THREE.Material {
  constructor(argu) {
    super();
    const { color = 0xffffff, opacity = 1, lineWidth = 10, lineOffset = 0, map = null, ...params } = argu || {};
    this.defines = {
      USE_MAP: !!map,
    };
    this.uniforms = {
      diffuse: {
        value: new THREE.Color(color),
      },
      opacity: {
        value: opacity,
      },
      map: {
        value: map,
      },
      uvTransform: {
        value: new THREE.Matrix3(),
      },
      lineWidth: {
        value: lineWidth,
      },
      lineOffset: {
        value: lineOffset,
      },
      colorBar: {
        value: colorBar,
        properties: {
          map: {},
          max: {},
          min: {},
          range: {},
        },
      },
      flowMax: {
        value: 1,
      },
      flowMin: {
        value: 0,
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      
      attribute vec3 pickColor;
      attribute vec3 lineNormal;
      attribute float lineLength;
      attribute float flow;
      // attribute vec2 uv;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;
      varying float vFlow;
      varying float vLineLength;

      uniform float lineWidth;
      uniform float lineOffset;
      uniform mat3 uvTransform;
      uniform float flowMax;
      uniform float flowMin;


      void main() {

        vFlow = flow;
        vPickColor = pickColor;
        vLineLength = lineLength;

        vec3 transformed = vec3(1.0);

        #ifdef USE_MAP
          vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
        #endif
        transformed = vec3(position.xy + lineNormal.xy * lineNormal.z * lineWidth / 2.0 - lineNormal.xy * lineOffset, position.z);
        transformed.z = transformed.z + flow / (flowMax - flowMin);

        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );

        #include <logdepthbuf_vertex>

      }
    `;
    this.fragmentShader = `
      #include <common>
      #include <logdepthbuf_pars_fragment>

      struct ColorBar {
        sampler2D map;
        float max;
        float min;
        float range;
      };

      uniform float lineWidth;
      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      uniform ColorBar colorBar;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;
      varying float vFlow;
      varying float vLineLength;


      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>

        #ifdef USE_MAP
          vec2 uv = vUv;
          uv.x = mod(vUv.x * vLineLength, lineWidth) / lineWidth;
          vec4 sampledDiffuseColor = texture2D(map, uv);
          sampledDiffuseColor.rgb *= sampledDiffuseColor.a;
          diffuseColor.rgb += sampledDiffuseColor.rgb;
        #endif

        gl_FragColor = diffuseColor;

      }
    `;
    this.setValues(params);
  }
}
