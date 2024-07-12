

import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

// import GeoJSONLayerWorker from "../worker/GeoJSONLayer.worker";
import GeoJSONLayerWorker from "./GeoJSONLayer.worker";

const POINT_SIZE = 80;

export class GeoJSONLayer extends Layer {

  color = new THREE.Color(0xffa500);


  pointColor = new THREE.Color(0xffa500);
  pointScale = 1;
  pointTexture = new THREE.TextureLoader().load(require("@/assets/image/point2.png"));

  lineColor = new THREE.Color(0xffa500);
  lineWidth = 100;
  lineTexture = null;

  polygonColor = new THREE.Color(0xffa500);

  setPointScale(pointScale) {
    this.pointScale = pointScale;
    this.scene.traverse(item => {
      if (item.isMesh && item.userData.type == "PointItem") {
        item.scale.set(pointScale, pointScale, 1);
      }
    });
  }
  setPointColor(pointColor) {
    this.pointColor = new THREE.Color(pointColor);
    this.pointMaterial.setValues({ color: this.pointColor })
    this.pointMaterial.needsUpdate = true;
  }
  setLineColor(lineColor) {
    this.lineColor = new THREE.Color(lineColor);
    this.lineMaterial.setValues({ color: this.lineColor })
    this.lineMaterial.needsUpdate = true;
  }
  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
    this.lineMaterial.needsUpdate = true;
  }
  setPolygonColor(polygonColor) {
    this.polygonColor = new THREE.Color(polygonColor);
    this.polygonMaterial.setValues({ color: this.polygonColor });
    this.polygonMaterial.needsUpdate = true;
  }

  constructor(opt) {
    super(opt);
    this.pointColor = new THREE.Color(opt.pointColor || this.pointColor);
    this.pointScale = opt.pointScale || this.pointScale;
    this.lineColor = new THREE.Color(opt.lineColor || this.lineColor);
    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.polygonColor = new THREE.Color(opt.polygonColor || this.polygonColor);


    this.pointGeometry = new THREE.PlaneGeometry(POINT_SIZE, POINT_SIZE);

    this.pointMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      map: this.pointTexture,
      color: this.pointColor,
    })
    this.pointMesh = null;

    this.lineMaterial = this.getLineMaterial({
      // side: THREE.DoubleSide,
      transparent: true,
      map: this.lineTexture,
      color: this.lineColor,
    });
    this.polygonMaterial = new THREE.MeshBasicMaterial({
      color: this.polygonColor,
      transparent: true,
    });

    this.worker = new GeoJSONLayerWorker();
    this.worker.onmessage = (event) => {
      const [key] = event.data;
      const data = event.data.slice(1);
      switch (key) {
        case 1:
          this.handleSetPoint(data);
          break;
        case 2:
          this.handleSetLine(data);
          break;
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
  }

  getLineMaterial(opt) {
    const material = new THREE.MeshBasicMaterial(opt);
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
          #include <common>

          attribute vec3 pickColor;
          attribute float side;
          attribute float lineLength;
          attribute vec2 startPosition;
          attribute vec2 endPosition;
          varying float vLineLength;
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float lineWidth = ${Number(this.lineWidth).toFixed(2)};
          float offset = lineWidth / 2.0 * side;
          vLineLength = lineLength;

          float lenA = length(position.xy - startPosition);
          float lenB = length(position.xy - endPosition);

          if(lenA == 0. && lenB == 0.) {
            transformed = position;
          } else {
            vec2 dirA = normalize(position.xy - startPosition);
            vec2 dirB = normalize(position.xy - endPosition);
  
            if(lenA == 0.) {
              float angle = PI / 2.0;
              vec2 normal = vec2(-dirB.y, dirB.x);
              transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
            } else if(lenB == 0.) {
              float angle = PI / 2.0;
              vec2 normal = vec2(dirA.y, -dirA.x);
              transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
            } else {
              vec2 dir = normalize(dirB - dirA);
              vec2 normal = vec2(-dir.y, dir.x);
              float angle = acos(dot(dirB, normal));
              if(angle < 0.2) angle = 0.2;
              if(angle > 2.94) angle = 2.94;
              transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
            }
          }
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
          #include <common>
          varying float vLineLength;
          `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
            #ifdef USE_MAP
              float lineWidth = ${Number(this.lineWidth).toFixed(2)} * 2.0;
              float l = mod(vLineLength, lineWidth * 5.0) / lineWidth ;
              if(0.0 < l && l < 1.0){
                vec4 sampledDiffuseColor = texture2D(map, vec2(vUv.x,  l));
                if(sampledDiffuseColor.a > 0.6) {
                  diffuseColor = vec4(1.0);
                }
              }
            #endif
          `
      );
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
        uuid: material.uuid,
        lineWidth: this.lineWidth,
      });
    };
    return material;
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    // this.updatePoint()
  }

  setData(data) {
    if (data instanceof Int8Array) {
      console.log(data);
      console.time("setLine")
      const array = new Int8Array(data.length + 1);
      array.set([1], 0);
      array.set(data, 1);
      this.worker.postMessage(array, [array.buffer]);
    } else {
      throw new Error("data instanceof Int8Array");
    }
  }

  handleSetPoint(array) {
    this.pointData = array;
    this.updatePoint()
  }
  updatePoint() {
    if (!this.map) return;
    if (!this.pointData) return;
    const pointCenter = Array.from(this.pointData.slice(0, 2));
    const pointArray = this.pointData.slice(2);
    console.log(pointCenter, pointArray);
    this.pointMesh = new THREE.InstancedMesh(this.pointGeometry, this.pointMaterial, pointArray.length / 2);
    for (let i = 0, l = pointArray.length / 2; i < l; i++) {
      const x = pointArray[i * 2];
      const y = pointArray[i * 2 + 1];
      this.pointMesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, y, 0));
    }
    const [x, y] = this.map.WebMercatorToCanvasXY(pointCenter[0], pointCenter[1]);
    this.pointMesh.position.set(x, y, 0.02);
    this.pointMesh.userData.center = pointCenter;
    this.scene.add(this.pointMesh);
  }

  handleSetLine(array) {
    this.lineData = array;
    this.updateLine()
  }
  updateLine() {
    console.timeEnd("setLine")
    if (!this.map) return;
    if (!this.lineData) return;
    const lineCenter = Array.from(this.lineData.slice(0, 2));
    const lineArray = this.lineData.slice(2);
    const geometryList = [];
    for (let index = 0, l = lineArray.length, lineDataSize = lineArray[0]; index < l; index += 1 + lineDataSize, lineDataSize = lineArray[index]) {
      const line = lineArray.slice(index + 1, index + 1 + lineDataSize);
      const geometry = this.getLineGeometry(line);
      console.log(geometry);
      geometryList[geometryList.length] = geometry;
    }
    const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
    const mesh = new THREE.Mesh(geometry, this.lineMaterial);
    const [x, y] = this.map.WebMercatorToCanvasXY(lineCenter[0], lineCenter[1]);
    mesh.position.set(x, y, 0.01);
    mesh.userData.center = lineCenter;
    console.log(lineCenter);
    this.scene.add(mesh);
  }
  getLineGeometry(array) {
    console.time("getLineGeometry")
    if (array.length < 6) return null;
    const attrPosition = [];
    const attrStartPosition = [];
    const attrEndPosition = [];
    const attrSide = [];
    const attrIndex = [];
    const attrUv = [];
    const attrLength = [];
    const length = array.length / 3;
    for (let index = 0; index < length; index++) {
      let prev = Array.from(array.slice((index - 1) * 3, index * 3));
      let that = Array.from(array.slice(index * 3, (index + 1) * 3))
      let next = Array.from(array.slice((index + 1) * 3, (index + 2) * 3));
      if (index === 0) {
        next = Array.from(array.slice((index + 1) * 3, (index + 2) * 3));
        prev = [that[0] * 2 - next[0], that[1] * 2 - next[1], that[2] * 2 - next[2]];
      }
      if (array[(index + 1) * 3] === undefined) {
        prev = Array.from(array.slice((index - 1) * 3, index * 3));
        next = [that[0] * 2 - prev[0], that[1] * 2 - prev[1], that[2] * 2 - prev[2]];
      }
      console.log(prev, next, that);
      attrStartPosition[index] = [prev[0], prev[1], 0, prev[0], prev[1], 0];
      attrPosition[index] = [that[0], that[1], 0, that[0], that[1], 0];
      attrEndPosition[index] = [next[0], next[1], 0, next[0], next[1], 0];
      attrUv[index] = [0, 0, 0, 1];
      attrLength[index] = [that[2], that[2]];
      attrSide[index] = [-1, 1];
      if (index !== 0) attrIndex[index - 1] = [0, 1, 3, 0, 3, 2].map(v => v + (index - 1) * 2);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(attrPosition.flat()), 3));
    geometry.setAttribute("startPosition", new THREE.BufferAttribute(new Float32Array(attrStartPosition.flat()), 3));
    geometry.setAttribute("endPosition", new THREE.BufferAttribute(new Float32Array(attrEndPosition.flat()), 3));
    geometry.setAttribute("side", new THREE.BufferAttribute(new Int8Array(attrSide.flat()), 1));
    geometry.setAttribute("lineLength", new THREE.BufferAttribute(new Float32Array(attrLength.flat()), 1));
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(attrLength.flat()), 2));
    geometry.index = new THREE.BufferAttribute(new Uint16Array(attrIndex.flat()), 1);
    console.timeEnd("getLineGeometry")
    return geometry
  }
}









