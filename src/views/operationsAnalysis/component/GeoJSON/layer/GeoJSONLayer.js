

import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import GeoJSONLayerWorker from "./GeoJSONLayer.worker";

const POINT_SIZE = 80;

export class GeoJSONLayer extends Layer {

  color = new THREE.Color(0xffa500);


  pointColor = new THREE.Color(0xffa500);
  pointScale = 1;
  pointTexture = new THREE.TextureLoader().load(require("@/assets/image/point2.png"));
  pointMesh = null;

  lineColor = new THREE.Color(0xffa500);
  lineWidth = 100;
  lineTexture = null;
  lineGeoList = [];

  polygonColor = new THREE.Color(0xffa500);
  polygonGeoList = [];

  async setPointScale(pointScale) {
    this.pointScale = pointScale;

    const pointArray = this.pointData.slice(2);
    const scale = this.pointScale;
    for (let i = 0, l = this.pointMesh.count, time = 0; i < l; i++, time++) {
      const x = pointArray[i * 2];
      const y = pointArray[i * 2 + 1];
      const matrix = new THREE.Matrix4().makeTranslation(x, y, 0);
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      this.pointMesh.setMatrixAt(i, matrix);

      if (time > 20000) {
        time = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    if (this.pointMesh.instanceMatrix) this.pointMesh.instanceMatrix.needsUpdate = true;
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
      side: THREE.DoubleSide,
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
      const {
        point,
        line,
        polygon
      } = event.data;

      this.handleSetPoint(point);
      this.handleSetLine(line);
      this.handleSetPolygon(polygon);
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
  }

  dispose() {
    this.clearScene();
    this.worker.terminate();
  }

  clearScene() {
    super.clearScene();
    if (this.pointMesh) {
      this.pointMesh.dispose();
      this.pointMesh = null;
    }
    for (const geo of this.lineGeoList) {
      geo.dispose()
    }
    this.lineGeoList = [];
    for (const geo of this.polygonGeoList) {
      geo.dispose()
    }
    this.polygonGeoList = [];
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
          attribute float totalLength;
          attribute vec2 startPosition;
          attribute vec2 endPosition;
          varying float vLineLength;
          varying float vTotalLength;
          varying vec2 vSide;
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
          varying float vTotalLength;
          varying vec2 vSide;
          `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
            #ifdef USE_MAP
              float lineWidth = ${Number(this.lineWidth).toFixed(2)} * 2.0;
              float l = mod(vLineLength, lineWidth * 5.0) / lineWidth ;
              if(0.0 < l && l < 1.0){
                float side = 0.0;
                if(vSide == 1.0) side = 1.0;
                vec4 sampledDiffuseColor = texture2D(map, vec2(side,  l));
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
    this.clearScene();
    if (data instanceof Int8Array) {
      this.worker.postMessage(data, [data.buffer]);
    } else {
      throw new Error("data instanceof Int8Array");
    }
  }

  handleSetPoint(array) {
    this.pointData = array;
    this.updatePoint()
  }
  async updatePoint() {
    if (!this.map) return;
    if (!this.pointData) return;
    const pointCenter = Array.from(this.pointData.slice(0, 2));
    const pointArray = this.pointData.slice(2);
    this.pointMesh = new THREE.InstancedMesh(this.pointGeometry, this.pointMaterial, pointArray.length / 2);
    const scale = this.pointScale;
    for (let i = 0, l = this.pointMesh.count, time = 0; i < l; i++, time++) {
      const x = pointArray[i * 2];
      const y = pointArray[i * 2 + 1];
      const matrix = new THREE.Matrix4().makeTranslation(x, y, 0);
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      this.pointMesh.setMatrixAt(i, matrix);
      // 每20000个数据等待下一个事件循环执行 避免卡顿
      if (time > 20000) {
        time = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    if (this.pointMesh.instanceMatrix) this.pointMesh.instanceMatrix.needsUpdate = true;
    const [x, y] = this.map.WebMercatorToCanvasXY(pointCenter[0], pointCenter[1]);
    this.pointMesh.position.set(x, y, 0.02);
    this.pointMesh.userData.center = pointCenter;
    this.pointMesh.userData.type = "point";
    this.scene.add(this.pointMesh);

  }

  handleSetLine(array) {
    this.lineData = array;
    this.updateLine()
  }
  async updateLine() {
    if (!this.map) return;
    if (!this.lineData) return;
    const lineCenter = Array.from(this.lineData.slice(0, 2));
    const lineArray = this.lineData.slice(2);
    const geometryList = [];
    for (let index = 0, l = lineArray.length, time = 0, lineDataSize = lineArray[0]; index < l; index += 1 + lineDataSize, lineDataSize = lineArray[index]) {
      const line = lineArray.slice(index + 1, index + 1 + lineDataSize);
      const geometry = this.getLineGeometry(line);
      geometryList[geometryList.length] = geometry;
      // 每20000个数据创建一个mesh，并等待下一个事件循环执行 避免卡顿
      if (index - time > 20000) {
        time = index;
        const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
        this.lineGeoList.push(geometry);
        const mesh = new THREE.Mesh(geometry, this.lineMaterial);
        const [x, y] = this.map.WebMercatorToCanvasXY(lineCenter[0], lineCenter[1]);
        mesh.position.set(x, y, 0.01);
        mesh.userData.center = lineCenter;
        mesh.userData.type = "line";
        this.scene.add(mesh);
        geometryList.length = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    if (geometryList.length > 0) {
      const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
      this.lineGeoList.push(geometry);
      const mesh = new THREE.Mesh(geometry, this.lineMaterial);
      const [x, y] = this.map.WebMercatorToCanvasXY(lineCenter[0], lineCenter[1]);
      mesh.position.set(x, y, 0.01);
      mesh.userData.center = lineCenter;
      mesh.userData.type = "line";
      this.scene.add(mesh);
    }

    console.log(lineCenter);
  }
  getLineGeometry(array) {
    if (array.length < 6) return null;
    const length = array.length / 3;
    let totalLength = array[array.length - 1];
    const attrPosition = new Float32Array(length * 6);
    const attrStartPosition = new Float32Array(length * 4);
    const attrEndPosition = new Float32Array(length * 4);
    const attrSide = new Int8Array(length * 2);
    const attrLength = new Float32Array(length * 2);
    const attrIndex = new Uint16Array(length * 6 - 6);
    for (let index = 0; index < length; index++) {
      let prevX = array[index * 3 - 3]
      let prevY = array[index * 3 - 2]
      let prevL = array[index * 3 - 1]
      let thatX = array[index * 3 + 0]
      let thatY = array[index * 3 + 1]
      let thatL = array[index * 3 + 2]
      let nextX = array[index * 3 + 3]
      let nextY = array[index * 3 + 4]
      let nextL = array[index * 3 + 5]
      if (index === 0) {
        prevX = thatX * 2 - nextX;
        prevY = thatY * 2 - nextY;
      }
      if (index >= length - 1) {
        nextX = thatX * 2 - prevX;
        nextY = thatY * 2 - prevY;
      }

      attrPosition[index * 6] = thatX;
      attrPosition[index * 6 + 1] = thatY;
      attrPosition[index * 6 + 2] = 0;
      attrPosition[index * 6 + 3] = thatX;
      attrPosition[index * 6 + 4] = thatY;
      attrPosition[index * 6 + 5] = 0;

      attrStartPosition[index * 4] = prevX;
      attrStartPosition[index * 4 + 1] = prevY;
      attrStartPosition[index * 4 + 2] = prevX;
      attrStartPosition[index * 4 + 3] = prevY;

      attrEndPosition[index * 4] = nextX;
      attrEndPosition[index * 4 + 1] = nextY;
      attrEndPosition[index * 4 + 2] = nextX;
      attrEndPosition[index * 4 + 3] = nextY;

      attrLength[index * 2] = thatL;
      attrLength[index * 2 + 1] = thatL;

      attrSide[index * 2] = -1;
      attrSide[index * 2 + 1] = 1;

      if (index < length - 1) {
        attrIndex[index * 6] = index * 2 + 0
        attrIndex[index * 6 + 1] = index * 2 + 1
        attrIndex[index * 6 + 2] = index * 2 + 3
        attrIndex[index * 6 + 3] = index * 2 + 0
        attrIndex[index * 6 + 4] = index * 2 + 3
        attrIndex[index * 6 + 5] = index * 2 + 2
      };
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(attrPosition, 3));
    geometry.setAttribute("startPosition", new THREE.BufferAttribute(attrStartPosition, 2));
    geometry.setAttribute("endPosition", new THREE.BufferAttribute(attrEndPosition, 2));
    geometry.setAttribute("side", new THREE.BufferAttribute(attrSide, 1));
    geometry.setAttribute("lineLength", new THREE.BufferAttribute(attrLength, 1));
    geometry.setAttribute("totalLength", new THREE.BufferAttribute(new Float32Array(length).fill(totalLength), 1));
    geometry.index = new THREE.BufferAttribute(attrIndex, 1);
    return geometry
  }

  handleSetPolygon(array) {
    this.polygonData = array;
    this.updatePolygon()
  }

  async updatePolygon() {
    const polygonCenter = Array.from(this.polygonData.slice(0, 2));
    const geometryList = [];
    const array1 = this.polygonData.slice(2);
    for (let i = 0, l1 = array1.length, time = 0, size1 = array1[0]; i < l1; i += 1 + size1, size1 = array1[i]) {
      const array2 = array1.slice(i + 1, i + 1 + size1);
      let shape = null;
      for (let j = 0, l2 = array2.length, time = 0, size2 = array2[0]; j < l2; j += 1 + size2, size2 = array2[j]) {
        const v2 = array2.slice(j + 1, j + 1 + size2);
        const points = [];
        for (let k = 0, l3 = v2.length / 2; k < l3; k++) {
          points[points.length] = new THREE.Vector2(v2[k * 2 + 0], v2[k * 2 + 1])
        }
        if (!shape) {
          shape = new THREE.Shape(points);
        } else {
          const holePath = new THREE.Path(points);
          shape.holes.push(holePath);
        }
      }
      if (!shape) continue;
      geometryList[geometryList.length] = new THREE.ShapeGeometry(shape);
      // 每20000个数据创建一个mesh，并等待下一个事件循环执行 避免卡顿
      if (i - time > 20000) {
        time = i;

        const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
        this.polygonGeoList.push(geometry);
        const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
        const [x, y] = this.map.WebMercatorToCanvasXY(polygonCenter[0], polygonCenter[1]);
        mesh.position.set(x, y, 0.02);
        mesh.userData.center = polygonCenter;
        mesh.userData.type = "polygon";
        this.scene.add(mesh);

        geometryList.length = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    if (geometryList.length > 0) {
      const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
      this.polygonGeoList.push(geometry);
      const mesh = new THREE.Mesh(geometry, this.lineMaterial);
      const [x, y] = this.map.WebMercatorToCanvasXY(polygonCenter[0], polygonCenter[1]);
      mesh.position.set(x, y, 0);
      mesh.userData.center = polygonCenter;
      mesh.userData.type = "polygon";
      this.scene.add(mesh);
    }
  }

}









