

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
  pointMaxValue = 1;
  pointMinValue = 0;
  pointOpacity = 1;
  pointMesh = null;

  lineWidth = 100;
  lineColor = new THREE.Color(0xffa500);
  lineStyle = LINE_STYPE.SOLID;
  lineValue = null;
  lineColorBar = null;
  lineMaxValue = 1;
  lineMinValue = 0;
  lineOpacity = 1;
  lineMeshList = [];

  polygonColor = new THREE.Color(0xffa500);
  polygonOpacity = 1;
  polygonBorderWidth = 1;
  polygonBorderColor = new THREE.Color(0xffa500);
  polygonBorderStyle = LINE_STYPE.SOLID;
  polygonValue = null;
  polygonColorBar = null;
  polygonMaxValue = 1;
  polygonMinValue = 0;
  polygon3D = false;
  polygon3DHeight = false;
  polygonMeshList = [];

  // ******************** 点 ******************** //
  async setPointScale(pointScale) {
    this.pointScale = pointScale;

    // const pointArray = this.pointData.slice(2);
    // const scale = this.pointScale;
    // for (let i = 0, l = this.pointMesh.count, time = 0; i < l; i++, time++) {
    //   const x = pointArray[i * 2];
    //   const y = pointArray[i * 2 + 1];
    //   const matrix = new THREE.Matrix4().makeTranslation(x, y, 0);
    //   matrix.scale(new THREE.Vector3(scale, scale, scale));
    //   this.pointMesh.setMatrixAt(i, matrix);

    //   if (time > 20000) {
    //     time = 0;
    //     await new Promise(resolve => setTimeout(resolve, 0));
    //   }
    // }
    // if (this.pointMesh.instanceMatrix) this.pointMesh.instanceMatrix.needsUpdate = true;
  }
  setPointColor(pointColor) {
    this.pointColor = new THREE.Color(pointColor);
    this.pointMaterial.setValues({ color: this.pointColor })
    this.pointMaterial.needsUpdate = true;
  }
  setPointIcon(url) {
    // this.pointTexture = pointTexture;
  }
  setPointValue(pointValue) {
    this.pointValue = pointValue;
  }
  setPointColorBar(pointColorBar) {
    this.pointColorBar = pointColorBar;
    const pointColorBarUrl = ColorBar2D.instance.drow(this.pointColorBar);
    this.pointColorBarMap = pointColorBarUrl ? textureLoader.load(pointColorBarUrl) : null;
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
    this.pointMaterial = new GeoJSONPointMaterial({ transparent: true });
    this.pointMeshList = [];

    this.setPointScale(opt.pointScale);
    this.setPointColor(opt.pointColor);
    this.setPointIcon(opt.pointIcon);
    this.setPointValue(opt.pointValue);
    this.setPointColorBar(opt.pointColorBar);
    this.setPointOpacity(opt.pointOpacity);



    // ******************** 线 ******************** //
    this.lineMaterial = new GeoJSONLineMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      color: this.lineColor,
    });
    this.lineMeshList = [];

    this.setLineWidth(opt.lineWidth);
    this.setLineColor(opt.lineColor);
    this.setLineStyle(opt.lineStyle);
    this.setLineValue(opt.lineValue);
    this.setLineColorBar(opt.lineColorBar);
    this.setLineOpacity(opt.lineOpacity);


    // ******************** 面 ******************** //
    this.polygonMaterial = new THREE.MeshBasicMaterial({
      color: this.polygonColor,
      transparent: true,
    });
    this.polygonMeshList = [];

    this.setPolygonOpacity(opt.polygonOpacity);
    this.setPolygonColor(opt.polygonColor);
    this.setPolygonBorderWidth(opt.polygonBorderWidth);
    this.setPolygonBorderColor(opt.polygonBorderColor);
    this.setPolygonBorderStyle(opt.polygonBorderStyle);
    this.setPolygonValue(opt.polygonValue);
    this.setPolygonColorBar(opt.polygonColorBar);
    this.setPolygon3D(opt.polygon3D);
    this.setPolygon3DHeight(opt.polygon3DHeight);




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
    // if (this.pointData) this.updatePoint();
    // if (this.lineData) this.updateLine();
    // if (this.polygonData) this.updatePolygon();
  }

  // async updatePoint() {
  //   if (!this.map) return;
  //   if (!this.pointData) return;
  //   const pointCenter = Array.from(this.pointData.slice(0, 2));
  //   const [x, y] = this.map.WebMercatorToCanvasXY(pointCenter[0], pointCenter[1]);
  //   const meshPoint = 20000
  //   for (let i = 2, l = this.pointMesh.count; i < l; i += meshPoint * 3) {
  //     const pointArray = this.pointData.slice(i, i + meshPoint * 3 + 1);
  //     const geometry = new GeoJSONPointListGeometry(pointArray);
  //     const mesh = new THREE.Mesh(geometry, this.pointMaterial);
  //     mesh.position.set(x, y, 0.02);
  //     mesh.userData.center = pointCenter;
  //     this.pointMeshList.push(mesh)
  //     this.scene.add(mesh);
  //     await new Promise(resolve => setTimeout(resolve, 0));
  //   }
  // }

  // async updateLine() {
  //   if (!this.map) return;
  //   if (!this.lineData) return;
  //   const lineCenter = Array.from(this.lineData.slice(0, 2));
  //   const lineArray = this.lineData.slice(2);
  //   const geometryList = [];
  //   for (let index = 0, l = lineArray.length, time = 0, lineDataSize = lineArray[0]; index < l; index += 1 + lineDataSize, lineDataSize = lineArray[index]) {
  //     const line = lineArray.slice(index + 1, index + 1 + lineDataSize);
  //     const geometry = this.getLineGeometry(line);
  //     geometryList[geometryList.length] = geometry;
  //     // 每20000个数据创建一个mesh，并等待下一个事件循环执行 避免卡顿
  //     if (index - time > 20000) {
  //       time = index;
  //       const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
  //       const mesh = new THREE.Mesh(geometry, this.lineMaterial);
  //       const [x, y] = this.map.WebMercatorToCanvasXY(lineCenter[0], lineCenter[1]);
  //       mesh.position.set(x, y, 0.01);
  //       mesh.userData.center = lineCenter;
  //       mesh.userData.type = "line";
  //       this.lineMeshList.push(mesh);
  //       this.scene.add(mesh);

  //       geometryList.length = 0;
  //       await new Promise(resolve => setTimeout(resolve, 0));
  //     }
  //   }

  //   if (geometryList.length > 0) {
  //     const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
  //     const mesh = new THREE.Mesh(geometry, this.lineMaterial);
  //     const [x, y] = this.map.WebMercatorToCanvasXY(lineCenter[0], lineCenter[1]);
  //     mesh.position.set(x, y, 0.01);
  //     mesh.userData.center = lineCenter;
  //     mesh.userData.type = "line";
  //     this.lineMeshList.push(mesh);
  //     this.scene.add(mesh);
  //   }

  //   console.log(lineCenter);
  // }

  // async updatePolygon() {
  //   const polygonCenter = Array.from(this.polygonData.slice(0, 2));
  //   const geometryList = [];
  //   const array1 = this.polygonData.slice(2);
  //   for (let i = 0, l1 = array1.length, time = 0, size1 = array1[0]; i < l1; i += 1 + size1, size1 = array1[i]) {
  //     const array2 = array1.slice(i + 1, i + 1 + size1);
  //     let shape = null;
  //     for (let j = 0, l2 = array2.length, time = 0, size2 = array2[0]; j < l2; j += 1 + size2, size2 = array2[j]) {
  //       const v2 = array2.slice(j + 1, j + 1 + size2);
  //       const points = [];
  //       for (let k = 0, l3 = v2.length / 2; k < l3; k++) {
  //         points[points.length] = new THREE.Vector2(v2[k * 2 + 0], v2[k * 2 + 1])
  //       }
  //       if (!shape) {
  //         shape = new THREE.Shape(points);
  //       } else {
  //         const holePath = new THREE.Path(points);
  //         shape.holes.push(holePath);
  //       }
  //     }
  //     if (!shape) continue;
  //     geometryList[geometryList.length] = new THREE.ShapeGeometry(shape);
  //     // 每20000个数据创建一个mesh，并等待下一个事件循环执行 避免卡顿
  //     if (i - time > 20000) {
  //       time = i;

  //       const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
  //       const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
  //       const [x, y] = this.map.WebMercatorToCanvasXY(polygonCenter[0], polygonCenter[1]);
  //       mesh.position.set(x, y, 0.02);
  //       mesh.userData.center = polygonCenter;
  //       mesh.userData.type = "polygon";
  //       this.polygonMeshList.push(mesh);
  //       this.scene.add(mesh);

  //       geometryList.length = 0;
  //       await new Promise(resolve => setTimeout(resolve, 0));
  //     }
  //   }

  //   if (geometryList.length > 0) {
  //     const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
  //     const mesh = new THREE.Mesh(geometry, this.lineMaterial);
  //     const [x, y] = this.map.WebMercatorToCanvasXY(polygonCenter[0], polygonCenter[1]);
  //     mesh.position.set(x, y, 0);
  //     mesh.userData.center = polygonCenter;
  //     mesh.userData.type = "polygon";
  //     this.polygonMeshList.push(mesh);
  //     this.scene.add(mesh);
  //   }
  // }

}


export class GeoJSONPointListGeometry extends THREE.BufferGeometry {
  constructor(pointArray = []) {
    super();
    this.type = "GeoJSONPointListGeometry";
    this.isGeoJSONPointListGeometry = true;

    const attrPosition = new Array();
    const attrSide = new Array();
    const attrValue = new Array();
    const attrIndex = new Array();
    for (let i1 = 0, l1 = pointArray.length / 3; i1 < l1; i1++) {
      const x = pointArray[i1 * 3];
      const y = pointArray[i1 * 3 + 1];
      const value = pointArray[i1 * 3 + 1];

      for (let i2 = 0; i2 < 4; i2++) {
        attrPosition[attrPosition.length] = x
        attrPosition[attrPosition.length] = y
        attrPosition[attrPosition.length] = 0
        attrValue[attrValue.length] = value;
        attrSide[attrSide.length] = i2;
      }

      attrIndex[attrIndex.length] = i1 * 4 + 0;
      attrIndex[attrIndex.length] = i1 * 4 + 1;
      attrIndex[attrIndex.length] = i1 * 4 + 3;
      attrIndex[attrIndex.length] = i1 * 4 + 0;
      attrIndex[attrIndex.length] = i1 * 4 + 3;
      attrIndex[attrIndex.length] = i1 * 4 + 2;
    }
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("side", new THREE.Int8BufferAttribute(attrSide, 1));
    this.setAttribute("value", new THREE.Float32BufferAttribute(attrValue, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();
  }
}


export class GeoJSONPointMaterial extends THREE.Material {
  constructor(argu) {

    super();
    this.isGeoJSONLineMaterial = true;
    const { color = 0xff0000, opacity = 1, size = 50, map = null, colorBar = null, minValue = 0, maxValue = 1, ...params } = argu || {};
    this.alphaTest = 0.1;
    this.transparent = true;
    this.depthWrite = false;
    this.defines = {
      USE_COLOR_BAR: !!colorBar,
      USE_MAP: !!map,
    };
    this.uniforms = {
      diffuse: {
        value: new THREE.Color(color),
      },
      opacity: {
        value: opacity,
      },
      size: {
        value: size,
      },
      map: {
        value: map,
      },
      uvTransform: {
        value: new THREE.Matrix3(),
      },
      colorBar: {
        value: colorBar,
      },
      minValue: {
        value: minValue,
      },
      maxValue: {
        value: maxValue,
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>

      attribute float side;
      attribute float value;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying vec2 vValue;

      uniform float size;
      uniform mat3 uvTransform;

      void main() {
        vValue = value;

        vec3 transformed = position;

        if(side == 0.0) {
          transformed.x -= size / 2;
          transformed.y -= size / 2;
          vUv = ( uvTransform * vec3( 0.0, 0.0, 1.0 ) ).xy;
        } else if(side == 1.0) {
          transformed.x -= size / 2;
          transformed.y += size / 2;
          vUv = ( uvTransform * vec3( 0.0, 1.0, 1.0 ) ).xy;
        } else if(side == 2.0) {
          transformed.x += size / 2;
          transformed.y -= size / 2;
          vUv = ( uvTransform * vec3( 1.0, 0.0, 1.0 ) ).xy;
        } else if(side == 3.0) {
          transformed.x += size / 2;
          transformed.y += size / 2;
          vUv = ( uvTransform * vec3( 1.0, 1.0, 1.0 ) ).xy;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );

        #include <logdepthbuf_vertex>

      }
    `;
    this.fragmentShader = `
      #include <common>
      #include <logdepthbuf_pars_fragment>


      // 当前时间
      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      uniform sampler2D colorBar;
      uniform float maxValue;
      uniform float minValue;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying vec2 vValue;

      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>
        
        #ifdef USE_COLOR_BAR
          float p = (vValue - minValue) / (maxValue - minValue);
          vec4 barDiffuseColor = texture2D(colorBar.map, vec2(p , 0.5));
          diffuseColor = barDiffuseColor;
        #endif

        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D(map, vUv);
          diffuseColor *= sampledDiffuseColor;
        #endif

        gl_FragColor = diffuseColor;

      }
    `;
    this.setValues(params);
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
    const { color = 0xff0000, opacity = 1, lineWidth = 50, lineOffset = 0, colorBar = null, maxValue = 1, minValue = 0, ...params } = argu || {};
    this.alphaTest = 0.1;
    this.transparent = true;
    this.depthWrite = false;
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
      },
      maxValue: {
        value: maxValue,
      },
      minValue: {
        value: minValue,
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>

      attribute float side;
      attribute float value;
      attribute float length;
      attribute vec2 startPosition;
      attribute vec2 endPosition;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying vec2 vValue;

      uniform float lineWidth;
      uniform float lineOffset;
      uniform mat3 uvTransform;

      void main() {
        vValue = value;

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







