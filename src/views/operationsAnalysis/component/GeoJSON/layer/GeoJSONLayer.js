

import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { ColorBar2D } from "@/mymap/utils/ColorBar2D.js";

import GeoJSONLayerWorker from "../worker/GeoJSONLayer.worker";

const POINT_SIZE = 80;
const textureLoader = new THREE.TextureLoader();

export const LINE_STYPE = {
  NONE: 0, // 不显示
  SOLID: 1, // 实线
  DASHED: 2 // 虚线
}

export class GeoJSONLayer extends Layer {

  color = new THREE.Color(0xffa500);

  pointScale = 1;
  pointColor = new THREE.Color(0xffa500);
  pointTexture = textureLoader.load(require("@/assets/image/point2.png"));
  pointValue = null;
  pointColorBar = null;
  pointOpacity = 1;
  pointMesh = null;

  lineWidth = 100;
  lineColor = new THREE.Color(0xffa500);
  lineStyle = LINE_STYPE.SOLID;
  lineValue = null;
  lineColorBar = null;
  lineOpacity = 1;
  lineMeshList = [];

  polygonColor = new THREE.Color(0xffa500);
  polygonOpacity = 1;
  polygonBorderWidth = 1;
  polygonBorderColor = new THREE.Color(0xffa500);
  polygonBorderStyle = LINE_STYPE.SOLID;
  polygonValue = null;
  polygonColorBar = null;
  polygon3D = false;
  polygon3DHeight = false;
  polygonMeshList = [];

  // ******************** 点 ******************** //
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
  setPointTexture(pointTexture) {
    this.pointTexture = pointTexture;
  }
  setPointValue(pointValue) {
    this.pointValue = pointValue;
  }
  setPointColorBar(pointColorBar) {
    this.pointColorBar = pointColorBar;
  }
  setPointOpacity(pointOpacity) {
    this.pointOpacity = pointOpacity;
  }

  // ******************** 线 ******************** //
  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
    this.lineMaterial.needsUpdate = true;
  }
  setLineColor(lineColor) {
    this.lineColor = new THREE.Color(lineColor);
    this.lineMaterial.setValues({ color: this.lineColor })
    this.lineMaterial.needsUpdate = true;
  }
  setLineStyle(lineStyle) {
    this.lineStyle = lineStyle;
  }
  setLineValue(lineValue) {
    this.lineValue = lineValue;
  }
  setLineColorBar(lineColorBar) {
    this.lineColorBar = lineColorBar;
  }
  setLineOpacity(lineOpacity) {
    this.lineOpacity = lineOpacity;
  }

  // ******************** 面 ******************** //
  setPolygonOpacity(polygonOpacity) {
    this.polygonOpacity = polygonOpacity;
    this.polygonMaterial.setValues({ opacity: this.polygonOpacity });
    this.polygonMaterial.needsUpdate = true;
  }

  setPolygonColor(polygonColor) {
    this.polygonColor = new THREE.Color(polygonColor);
    this.polygonMaterial.setValues({ color: this.polygonColor });
    this.polygonMaterial.needsUpdate = true;
  }

  setPolygonBorderWidth(polygonBorderWidth) {
    this.polygonBorderWidth = polygonBorderWidth;
  }
  setPolygonBorderColor(polygonBorderColor) {
    this.polygonBorderColor = new THREE.Color(polygonBorderColor);
  }
  setPolygonBorderStyle(polygonBorderStyle) {
    this.polygonBorderStyle = polygonBorderStyle;
  }
  setPolygonValue(polygonValue) {
    this.polygonValue = polygonValue;
  }
  setPolygonColorBar(polygonColorBar) {
    this.polygonColorBar = polygonColorBar;
  }
  setPolygon3D(polygon3D) {
    this.polygon3D = polygon3D;
  }
  setPolygon3DHeight(polygon3DHeight) {
    this.polygon3DHeight = polygon3DHeight;
  }

  constructor(opt) {
    super(opt);

    // ******************** 点 ******************** //
    this.pointScale = opt.pointScale || this.pointScale;
    this.pointColor = new THREE.Color(opt.pointColor || this.pointColor);
    this.pointTexture = opt.pointTexture || this.pointTexture;
    this.pointValue = opt.pointValue || this.pointValue;
    const pointColorBarUrl = ColorBar2D.instance.drow(opt.pointColorBar);
    this.pointColorBar = {
      maxValue: 1,
      minValue: 0,
      map: pointColorBarUrl ? textureLoader.load(pointColorBarUrl) : null
    };
    this.pointOpacity = opt.pointOpacity || this.pointOpacity;

    this.pointGeometry = new THREE.PlaneGeometry(POINT_SIZE, POINT_SIZE);
    this.pointMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      map: this.pointTexture,
      color: this.pointColor,
    })
    this.pointMesh = null;



    // ******************** 线 ******************** //

    this.lineColor = new THREE.Color(opt.lineColor || this.lineColor);
    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.lineStyle = opt.lineStyle || this.lineStyle;
    this.lineValue = opt.lineValue || this.lineValue;
    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.lineMaterial = this.getLineMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      color: this.lineColor,
    });
    this.lineMeshList = [];




    // ******************** 面 ******************** //
    this.polygonColor = new THREE.Color(opt.polygonColor || this.polygonColor);
    this.polygonMaterial = new THREE.MeshBasicMaterial({
      color: this.polygonColor,
      transparent: true,
    });
    this.polygonMeshList = [];





    this.worker = new GeoJSONLayerWorker();
    this.worker.onmessage = (event) => {
      const {
        point,
        line,
        polygon
      } = event.data;

      this.pointData = point;
      this.lineData = line;
      this.polygonData = polygon;

      this.update();
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
    for (const mesh of this.lineMeshList) {
      mesh.geometry.dispose()
    }
    this.lineMeshList = [];
    for (const mesh of this.polygonMeshList) {
      mesh.geometry.dispose()
    }
    this.polygonMeshList = [];
  }

  getPointMaterial(opt) {
    const material = new THREE.MeshBasicMaterial(opt);
    material.onBeforeCompile = (shader) => {
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
    this.update();
  }

  setData(data) {
    if (data instanceof Int8Array) {
      this.worker.postMessage(data, [data.buffer]);
    } else {
      throw new Error("data instanceof Int8Array");
    }
  }

  update() {
    this.clearScene();
    if (!this.map) return;
    if (this.pointData) this.updatePoint();
    if (this.lineData) this.updateLine();
    if (this.polygonData) this.updatePolygon();
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
        const mesh = new THREE.Mesh(geometry, this.lineMaterial);
        const [x, y] = this.map.WebMercatorToCanvasXY(lineCenter[0], lineCenter[1]);
        mesh.position.set(x, y, 0.01);
        mesh.userData.center = lineCenter;
        mesh.userData.type = "line";
        this.lineMeshList.push(mesh);
        this.scene.add(mesh);

        geometryList.length = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    if (geometryList.length > 0) {
      const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
      const mesh = new THREE.Mesh(geometry, this.lineMaterial);
      const [x, y] = this.map.WebMercatorToCanvasXY(lineCenter[0], lineCenter[1]);
      mesh.position.set(x, y, 0.01);
      mesh.userData.center = lineCenter;
      mesh.userData.type = "line";
      this.lineMeshList.push(mesh);
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
        const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
        const [x, y] = this.map.WebMercatorToCanvasXY(polygonCenter[0], polygonCenter[1]);
        mesh.position.set(x, y, 0.02);
        mesh.userData.center = polygonCenter;
        mesh.userData.type = "polygon";
        this.polygonMeshList.push(mesh);
        this.scene.add(mesh);

        geometryList.length = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    if (geometryList.length > 0) {
      const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
      const mesh = new THREE.Mesh(geometry, this.lineMaterial);
      const [x, y] = this.map.WebMercatorToCanvasXY(polygonCenter[0], polygonCenter[1]);
      mesh.position.set(x, y, 0);
      mesh.userData.center = polygonCenter;
      mesh.userData.type = "polygon";
      this.polygonMeshList.push(mesh);
      this.scene.add(mesh);
    }
  }

}


export class GeoJSONLineListGeometry extends THREE.BufferGeometry {
  constructor(routeList) {
    super();
    this.type = "GeoJSONLineListGeometry";
    this.isGeoJSONLineListGeometry = true;

    const attrPosition = new Array();
    const attrStartPosition = new Array();
    const attrEndPosition = new Array();
    const attrSide = new Array();
    const attrTime = new Array();
    const attrIndex = new Array();
    let indexOffset = 0;
    for (let i1 = 0, l1 = routeList.length; i1 < l1; i1++) {
      const array = routeList[i1];
      for (let i2 = 0, l2 = array.length / 3; i2 < l2; i2++) {
        let prevX = array[i2 * 3 - 3];
        let prevY = array[i2 * 3 - 2];
        let prevL = array[i2 * 3 - 1];
        let thatX = array[i2 * 3 + 0];
        let thatY = array[i2 * 3 + 1];
        let thatL = array[i2 * 3 + 2];
        let nextX = array[i2 * 3 + 3];
        let nextY = array[i2 * 3 + 4];
        let nextL = array[i2 * 3 + 5];
        if (i2 === 0) {
          prevX = thatX * 2 - nextX;
          prevY = thatY * 2 - nextY;
        }
        if (i2 >= l2 - 1) {
          nextX = thatX * 2 - prevX;
          nextY = thatY * 2 - prevY;
        }

        attrPosition[attrPosition.length] = thatX;
        attrPosition[attrPosition.length] = thatY;
        attrPosition[attrPosition.length] = 0;
        attrPosition[attrPosition.length] = thatX;
        attrPosition[attrPosition.length] = thatY;
        attrPosition[attrPosition.length] = 0;

        attrStartPosition[attrStartPosition.length] = prevX;
        attrStartPosition[attrStartPosition.length] = prevY;
        attrStartPosition[attrStartPosition.length] = prevX;
        attrStartPosition[attrStartPosition.length] = prevY;

        attrEndPosition[attrEndPosition.length] = nextX;
        attrEndPosition[attrEndPosition.length] = nextY;
        attrEndPosition[attrEndPosition.length] = nextX;
        attrEndPosition[attrEndPosition.length] = nextY;

        attrTime[attrTime.length] = thatL;
        attrTime[attrTime.length] = thatL;

        attrSide[attrSide.length] = -1;
        attrSide[attrSide.length] = 1;

        if (i2 < l2 - 1) {
          attrIndex[attrIndex.length] = indexOffset + 0;
          attrIndex[attrIndex.length] = indexOffset + 1;
          attrIndex[attrIndex.length] = indexOffset + 3;
          attrIndex[attrIndex.length] = indexOffset + 0;
          attrIndex[attrIndex.length] = indexOffset + 3;
          attrIndex[attrIndex.length] = indexOffset + 2;
        };
        indexOffset += 2;
      }
    }
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("startPosition", new THREE.Float32BufferAttribute(attrStartPosition, 2));
    this.setAttribute("endPosition", new THREE.Float32BufferAttribute(attrEndPosition, 2));
    this.setAttribute("side", new THREE.Int8BufferAttribute(attrSide, 1));
    this.setAttribute("time", new THREE.Float32BufferAttribute(attrTime, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();
  }
}

export class GeoJSONLineMaterial extends THREE.Material {
  constructor(argu) {
    super();
    this.isGeoJSONLineMaterial = true;
    const { color = 0xff0000, opacity = 1, lineWidth = 50, lineOffset = 0, map = null, trailLength = 10, trailTime = 0, ...params } = argu || {};
    this.alphaTest = 0.1;
    this.transparent = true;
    this.depthWrite = false;
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
      lineWidth: {
        value: lineWidth,
      },
      lineOffset: {
        value: lineOffset,
      },
      map: {
        value: map,
      },
      uvTransform: {
        value: new THREE.Matrix3(),
      },
      trailTime: {
        value: trailTime,
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>

      attribute vec3 pickColor;
      attribute float side;
      attribute float length;
      attribute vec2 startPosition;
      attribute vec2 endPosition;
      
      varying vec3 vColor;
      varying vec2 vUv;

      uniform float lineWidth;
      uniform float lineOffset;
      uniform mat3 uvTransform;

      void main() {

        #ifdef USE_MAP
          vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
        #endif
        
        vec3 transformed = vec3(1.0);

        float offset = lineWidth / 2.0 * side + lineOffset;

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
            float angle = mod(acos(dot(dirB, normal)), 3.14);
            if(angle < 0.2) angle = 0.2;
            if(angle > 2.94) angle = 2.94;
            transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
          }
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );

        #include <logdepthbuf_vertex>

      }
    `;
    this.fragmentShader = `
      #include <common>
      #include <logdepthbuf_pars_fragment>


      // 当前时间
      uniform float trailLength;
      uniform float lineWidth;
      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;

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
export class NetworkMaterial extends THREE.Material {
  constructor(argu) {
    super();
    const { color = 0xffffff, opacity = 1, lineWidth = 10, lineOffset = 0, colorBar = null, ...params } = argu || {};
    this.defines = {
      USE_COLOR_BAR: !!colorBar,
    };
    this.uniforms = {
      diffuse: {
        value: new THREE.Color(color),
      },
      opacity: {
        value: opacity,
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
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>

      attribute vec3 pickColor;
      attribute float side;
      attribute float length;
      attribute vec2 startPosition;
      attribute vec2 endPosition;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vValue;

      uniform float lineWidth;
      uniform float lineOffset;
      uniform float maxValue;
      uniform float minValue;

      void main() {
        
        vec3 transformed = vec3(1.0);

        float offset = lineWidth / 2.0 * side + lineOffset;

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
            float angle = mod(acos(dot(dirB, normal)), 3.14);
            if(angle < 0.2) angle = 0.2;
            if(angle > 2.94) angle = 2.94;
            transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
          }
        }

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
      varying vec2 vUv;
      varying float vValue;


      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>
        
        #ifdef USE_COLOR_BAR
          vec4 barDiffuseColor = texture2D(colorBar.map, vec2(vValue / colorBar.range , 0.5));
          diffuseColor = barDiffuseColor;
        #endif

        gl_FragColor = diffuseColor;

      }
    `;
    this.setValues(params);
  }
}







