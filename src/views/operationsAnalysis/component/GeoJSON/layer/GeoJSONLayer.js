

import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { ColorBar2D } from "@/mymap/utils/ColorBar2D.js";

const POINT_SIZE = 80;
const textureLoader = new THREE.TextureLoader();

export const LINE_STYPE = {
  NONE: 0, // 不显示
  SOLID: 1, // 实线
  DASHED: 2 // 虚线
}

export class GeoJSONLayer extends Layer {

  color = new THREE.Color(0xffa500);
  center = [0, 0];
  propertiesLabels = {};
  propertiesList = [];

  pointSize = 1;
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
  async setPointSize(pointSize) {
    this.pointSize = pointSize;
    this.pointMaterial.uniforms.size.value = this.pointSize;
    this.pointMaterial.needsUpdate = true;
  }
  setPointColor(pointColor) {
    this.pointColor = new THREE.Color(pointColor);
    this.pointMaterial.uniforms.diffuse.value = this.pointColor;
    this.pointMaterial.needsUpdate = true;
  }
  setPointIcon(pointIcon) {
    textureLoader.load(pointIcon, (data) => {
      this.pointTexture = data;
      this.pointMaterial.defines.USE_MAP = !!this.pointTexture;
      this.pointMaterial.uniforms.map.value = this.pointTexture;
      this.pointMaterial.needsUpdate = true;
    }, null, () => {
      this.pointMaterial.defines.USE_MAP = false;
      this.pointMaterial.uniforms.map.value = null;
      this.pointMaterial.needsUpdate = true;
    })
  }
  setPointValue(pointValue) {
    this.pointValue = pointValue;

    const properties = this.propertiesLabels[this.pointValue];
    if (properties) {
      this.pointMaterial.uniforms.minValue.value = properties.min;
      this.pointMaterial.uniforms.maxValue.value = properties.max;
    }
    for (const mesh of this.pointMeshList) {
      mesh.geometry.setValueKey(this.pointValue);
    }
    this.pointMaterial.defines.USE_COLOR_BAR = !!this.pointColorBarMap && !!this.pointValue;
    this.pointMaterial.needsUpdate = true;
  }
  setPointColorBar(pointColorBar) {
    this.pointColorBar = pointColorBar;
    const pointColorBarUrl = ColorBar2D.instance.drow(this.pointColorBar);
    this.pointColorBarMap = pointColorBarUrl ? textureLoader.load(pointColorBarUrl) : null;

    this.pointMaterial.defines.USE_COLOR_BAR = !!this.pointColorBarMap && !!this.pointValue;
    this.pointMaterial.uniforms.colorBar.value = this.pointColorBarMap;
    this.pointMaterial.needsUpdate = true;
  }
  setPointOpacity(pointOpacity) {
    this.pointOpacity = pointOpacity;

    this.pointMaterial.uniforms.opacity.value = this.pointOpacity;
    this.pointMaterial.needsUpdate = true;
  }
  setPointArray(pointArray) {
    this.pointArray = pointArray;
    this.clearPoint();
    this.updatePoint();
  }

  // ******************** 线 ******************** //
  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;

    this.lineMaterial.uniforms.lineWidth.value = this.lineWidth;
    this.lineMaterial.needsUpdate = true;
  }
  setLineColor(lineColor) {
    this.lineColor = new THREE.Color(lineColor);

    this.lineMaterial.uniforms.diffuse.value = this.lineColor;
    this.lineMaterial.needsUpdate = true;
  }
  setLineStyle(lineStyle) {
    this.lineStyle = lineStyle;

    this.lineMaterial.uniforms.lineStyle.value = this.lineStyle;
    this.lineMaterial.needsUpdate = true;
  }
  setLineValue(lineValue) {
    this.lineValue = lineValue;

    const properties = this.propertiesLabels[this.lineValue];
    if (properties) {
      this.lineMaterial.uniforms.minValue.value = properties.min;
      this.lineMaterial.uniforms.maxValue.value = properties.max;
    }
    for (const mesh of this.lineMeshList) {
      mesh.geometry.setValueKey(this.lineValue);
    }
    this.lineMaterial.defines.USE_COLOR_BAR = !!this.lineColorBarMap && !!this.lineValue;
    this.lineMaterial.needsUpdate = true;
  }
  setLineColorBar(lineColorBar) {
    this.lineColorBar = lineColorBar;
    const lineColorBarUrl = ColorBar2D.instance.drow(this.lineColorBar);
    this.lineColorBarMap = lineColorBarUrl ? textureLoader.load(lineColorBarUrl) : null;

    this.lineMaterial.defines.USE_COLOR_BAR = !!this.lineColorBarMap && !!this.lineValue;
    this.lineMaterial.uniforms.colorBar.value = this.lineColorBarMap;
    this.lineMaterial.needsUpdate = true;
    console.log(this.lineMaterial);
  }
  setLineOpacity(lineOpacity) {
    this.lineOpacity = lineOpacity;

    this.lineMaterial.uniforms.opacity.value = this.lineOpacity;
    this.lineMaterial.needsUpdate = true;
  }
  setLineArray(lineArray) {
    this.lineArray = lineArray;
    this.clearLine();
    this.updateLine();
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
  setPolygonArray(polygonArray) {
    this.polygonArray = polygonArray;
    this.clearPolygon();
    this.updatePolygon();
  }


  setCenter(center) {
    this.center = center;
    if (this.map) this.on(MAP_EVENT.UPDATE_CENTER, {});
  }

  setPropertiesList(propertiesList, propertiesLabels) {
    this.propertiesList = propertiesList;
    this.propertiesLabels = propertiesLabels;

    const properties = this.propertiesLabels[this.pointValue];

    if (properties) {
      this.pointMaterial.uniforms.minValue.value = properties.min;
      this.pointMaterial.uniforms.maxValue.value = properties.max;
      this.lineMaterial.uniforms.minValue.value = properties.min;
      this.lineMaterial.uniforms.maxValue.value = properties.max;
      this.polygonMaterial.uniforms.minValue.value = properties.min;
      this.polygonMaterial.uniforms.maxValue.value = properties.max;
    }
    for (const mesh of this.pointMeshList) {
      mesh.geometry.setPropertiesList(this.propertiesList, this.propertiesLabels);
    }
    for (const mesh of this.lineMeshList) {
      mesh.geometry.setPropertiesList(this.propertiesList, this.propertiesLabels);
    }
    for (const mesh of this.polygonMeshList) {
      mesh.geometry.setPropertiesList(this.propertiesList, this.propertiesLabels);
    }
  }

  constructor(opt) {
    super(opt);

    // ******************** 点 ******************** //
    this.pointMaterial = new GeoJSONPointMaterial({ transparent: true, side: THREE.DoubleSide, });
    this.pointMeshList = [];

    this.setPointSize(opt.pointSize);
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

  }

  dispose() {
    this.clearScene();
  }

  clearScene() {
    super.clearScene();
    this.clearPoint();
    this.clearLine();
    this.clearPolygon();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER, {});
  }

  clearPoint() {
    for (const mesh of this.pointMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.pointMeshList = [];
  }

  async updatePoint() {
    if (!this.pointArray) return this.clearPoint();
    let x = 0, y = 0;
    if (this.map) [x, y] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
    const maxPoint = 100000;
    for (let i = 0, l = this.pointArray.length; i < l; i += maxPoint * 3) {
      const pointArray = this.pointArray.slice(i, i + maxPoint * 3 + 1);

      const geometry = new GeoJSONPointListGeometry(pointArray, this.propertiesList, this.propertiesLabels, "");
      const mesh = new THREE.Mesh(geometry, this.pointMaterial);
      mesh.position.set(x, y, 0.02);
      this.pointMeshList.push(mesh)
      this.scene.add(mesh);

      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }


  clearLine() {
    for (const mesh of this.lineMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.lineMeshList = [];
  }
  async updateLine() {
    if (!this.lineArray) return this.clearLine();
    let x = 0, y = 0;
    if (this.map) [x, y] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
    const maxLine = 10000000;
    const lineList = [];
    for (let index = 0, l = this.lineArray.length, time = 0, lineDataSize = this.lineArray[0]; index < l; index += 1 + lineDataSize, lineDataSize = this.lineArray[index]) {
      const line = this.lineArray.slice(index + 1, index + 1 + lineDataSize);
      lineList[lineList.length] = line;
      if (index - time > maxLine) {
        time = index;

        const geometry = new GeoJSONLineListGeometry(lineList, this.propertiesList, this.propertiesLabels, "");
        const mesh = new THREE.Mesh(geometry, this.lineMaterial);
        mesh.position.set(x, y, 0.01);
        this.lineMeshList.push(mesh);
        this.scene.add(mesh);

        lineList.length = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    if (lineList.length > 0) {
      const geometry = new GeoJSONLineListGeometry(lineList, this.propertiesList, this.propertiesLabels, "");
      const mesh = new THREE.Mesh(geometry, this.lineMaterial);
      mesh.position.set(x, y, 0.01);
      this.lineMeshList.push(mesh);
      this.scene.add(mesh);

      lineList.length = 0;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    console.log(this.scene);

  }


  clearPolygon() {
    for (const mesh of this.polygonMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.polygonMeshList = [];
  }
  async updatePolygon() {
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
  }

}


export class GeoJSONPointListGeometry extends THREE.BufferGeometry {
  constructor(pointArray = [], propertiesList, propertiesLabels, valueKey) {
    super();
    this.type = "GeoJSONPointListGeometry";
    this.isGeoJSONPointListGeometry = true;

    this.valueMap = {};

    const propertiesKeyList = [];

    const attrPosition = new Array();
    const attrSide = new Array();
    const attrValue = new Array();
    const attrIndex = new Array();
    for (let i1 = 0, l1 = Math.floor(pointArray.length / 3); i1 < l1; i1++) {
      const x = pointArray[i1 * 3];
      const y = pointArray[i1 * 3 + 1];
      const value = pointArray[i1 * 3 + 2];
      for (let i2 = 0; i2 < 4; i2++) {
        attrPosition[attrPosition.length] = x;
        attrPosition[attrPosition.length] = y;
        attrPosition[attrPosition.length] = 0;
        attrSide[attrSide.length] = i2;
        // attrValue[attrValue.length] = 0;
        propertiesKeyList[propertiesKeyList.length] = value;
      }

      attrIndex[attrIndex.length] = i1 * 4 + 0;
      attrIndex[attrIndex.length] = i1 * 4 + 1;
      attrIndex[attrIndex.length] = i1 * 4 + 3;
      attrIndex[attrIndex.length] = i1 * 4 + 0;
      attrIndex[attrIndex.length] = i1 * 4 + 3;
      attrIndex[attrIndex.length] = i1 * 4 + 2;
    }
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("side", new THREE.Float32BufferAttribute(attrSide, 1));
    this.setAttribute("value", new THREE.Float32BufferAttribute(attrValue, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();

    this.propertiesKeyList = propertiesKeyList;
    this.setPropertiesList(propertiesList, propertiesLabels);
    this.setValueKey(valueKey);
  }

  setPropertiesList(propertiesList, propertiesLabels) {
    try {
      const _pl = this.propertiesKeyList.map(v => propertiesList[v]);
      const map = {};
      for (const label in propertiesLabels) {
        const l = _pl.map(v => Number(v[label] || 0) || 0);
        map[label] = new THREE.Float32BufferAttribute(l, 1);
      }
      this.valueMap = map;
    } catch (error) {
      console.log(error);
      this.valueMap = {};
    }
  }

  setValueKey(valueKey) {
    try {
      const attrValue = this.valueMap[valueKey];
      if (attrValue) {
        this.setAttribute("value", attrValue);
        console.log(attrValue);

      } else {
        this.setAttribute("value", new THREE.Float32BufferAttribute([], 1));
      }
    } catch (error) {
      console.log(error);
    }
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
      attribute float distance;
      attribute float value;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vValue;
      varying float vDistance;

      uniform float size;
      uniform mat3 uvTransform;

      void main() {
        vValue = value;
        vDistance = distance;

        vec3 transformed = vec3(1.0);

        if(side == 0.0) {
          transformed.x = position.x - size / 2.0;
          transformed.y = position.y - size / 2.0;
          transformed.z = position.z;
          vUv = ( uvTransform * vec3( 0.0, 0.0, 1.0 ) ).xy;
        } else if(side == 1.0) {
          transformed.x = position.x - size / 2.0;
          transformed.y = position.y + size / 2.0;
          transformed.z = position.z;
          vUv = ( uvTransform * vec3( 0.0, 1.0, 1.0 ) ).xy;
        } else if(side == 2.0) {
          transformed.x = position.x + size / 2.0;
          transformed.y = position.y - size / 2.0;
          transformed.z = position.z;
          vUv = ( uvTransform * vec3( 1.0, 0.0, 1.0 ) ).xy;
        } else if(side == 3.0) {
          transformed.x = position.x + size / 2.0;
          transformed.y = position.y + size / 2.0;
          transformed.z = position.z;
          vUv = ( uvTransform * vec3( 1.0, 1.0, 1.0 ) ).xy;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );

        #include <logdepthbuf_vertex>

      }
    `;
    this.fragmentShader = `
      #include <common>
      #include <logdepthbuf_pars_fragment>


      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      uniform sampler2D colorBar;
      uniform float maxValue;
      uniform float minValue;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vValue;

      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>
        
        #ifdef USE_COLOR_BAR
          float p = (vValue - minValue) / (maxValue - minValue);
          if(p> 1.0) p = 1.0;
          if(p< 0.0) p = 0.0;
          vec4 barDiffuseColor = texture2D(colorBar, vec2(p , 0.5));
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
  constructor(lineList, propertiesList, propertiesLabels, valueKey) {
    super();
    this.type = "GeoJSONLineListGeometry";
    this.isGeoJSONLineListGeometry = true;

    this.valueMap = {};

    const propertiesKeyList = [];

    const attrPosition = new Array();
    const attrStartPosition = new Array();
    const attrEndPosition = new Array();
    const attrSide = new Array();
    const attrDistance = new Array();
    const attrValue = new Array();
    const attrIndex = new Array();
    let indexOffset = 0;
    console.log(lineList);

    for (let i1 = 0, l1 = lineList.length; i1 < l1; i1++) {
      const value = lineList[i1][0];
      const array = lineList[i1].slice(1);
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

        propertiesKeyList[propertiesKeyList.length] = value;
        propertiesKeyList[propertiesKeyList.length] = value;

        attrDistance[attrDistance.length] = thatL;
        attrDistance[attrDistance.length] = thatL;

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
    this.setAttribute("value", new THREE.Float32BufferAttribute(attrValue, 1));
    this.setAttribute("distance", new THREE.Float32BufferAttribute(attrDistance, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();


    this.propertiesKeyList = propertiesKeyList;
    this.setPropertiesList(propertiesList, propertiesLabels);
    this.setValueKey(valueKey);
  }

  setPropertiesList(propertiesList, propertiesLabels) {
    try {
      const _pl = this.propertiesKeyList.map(v => propertiesList[v]);
      const map = {};
      for (const label in propertiesLabels) {
        const l = _pl.map(v => Number(v[label] || 0) || 0);
        map[label] = new THREE.Float32BufferAttribute(l, 1);
      }
      this.valueMap = map;
    } catch (error) {
      console.log(error);
      this.valueMap = {};
    }
  }

  setValueKey(valueKey) {
    try {
      const attrValue = this.valueMap[valueKey];
      if (attrValue) {
        this.setAttribute("value", attrValue);
        console.log(attrValue);

      } else {
        this.setAttribute("value", new THREE.Float32BufferAttribute([], 1));
      }
    } catch (error) {
      console.log(error);
    }
  }

}

export class GeoJSONLineMaterial extends THREE.Material {
  constructor(argu) {
    super();
    this.isGeoJSONLineMaterial = true;
    const { color = 0xff0000, opacity = 1, lineStyle = LINE_STYPE.SOLID, lineWidth = 50, lineOffset = 0, colorBar = null, maxValue = 1, minValue = 0, ...params } = argu || {};
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
      lineStyle: {
        value: lineStyle
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
      attribute float distance;
      attribute vec2 startPosition;
      attribute vec2 endPosition;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vValue;
      varying float vDistance;

      uniform float lineWidth;
      uniform float lineOffset;
      uniform mat3 uvTransform;

      void main() {
        vValue = value;
        vDistance = distance;

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


      uniform float lineWidth;
      uniform float lineStyle;

      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      uniform sampler2D colorBar;
      uniform float maxValue;
      uniform float minValue;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vValue;
      varying float vDistance;

      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>
        
        #ifdef USE_COLOR_BAR
          float p = (vValue - minValue) / (maxValue - minValue);
          if(p> 1.0) p = 1.0;
          if(p< 0.0) p = 0.0;
          vec4 barDiffuseColor = texture2D(colorBar, vec2(p , 0.5));
          diffuseColor = barDiffuseColor;
        #endif

        if(lineStyle == ${Number(LINE_STYPE.DASHED).toFixed(1)}){
          float dl = mod(vDistance, lineWidth * 3.0) / (lineWidth * 3.0);
          if(0.33 < dl && dl < 0.66){
            diffuseColor.a = 0.0;
          }
        } else if(lineStyle == ${Number(LINE_STYPE.NONE).toFixed(1)}){
          diffuseColor.a = 0.0;
        }

        gl_FragColor = diffuseColor;

      }
    `;
    this.setValues(params);
  }
}







