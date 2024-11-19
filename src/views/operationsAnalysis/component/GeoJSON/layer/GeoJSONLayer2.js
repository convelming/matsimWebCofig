

import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { ColorBar2D } from "@/mymap/utils/ColorBar2D.v2";

const textureLoader = new THREE.TextureLoader();

export const LINE_STYLE = {
  NONE: 1, // 不显示
  SOLID: 2, // 实线
  DASHED: 3 // 虚线
}

export class GeoJSONLayer extends Layer {

  color = new THREE.Color(0xffa500);
  center = [0, 0];
  propertiesLabels = {};

  pointSize = 1;
  pointColor = new THREE.Color(0xffa500);
  pointTexture = textureLoader.load(require("@/assets/image/point2.png"));
  pointValue = null;
  pointColorBar = null;
  pointOpacity = 1;
  pointMesh = null;


  lineWidth = 100;
  lineColor = new THREE.Color(0xffa500);
  lineStyle = LINE_STYLE.SOLID;
  lineValue = null;
  lineColorBar = null;
  lineOpacity = 1;
  lineMeshList = [];

  polygonColor = new THREE.Color(0xffa500);
  polygonOpacity = 1;
  polygonBorderWidth = 1;
  polygonBorderColor = new THREE.Color(0xffa500);
  polygonBorderStyle = LINE_STYLE.SOLID;
  polygonValue = null;
  polygonColorBar = null;
  polygon3DValue = "";
  polygon3DScale = 100;
  polygonMeshList = [];
  polygonBorderMeshList = [];

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
    for (const mesh of this.pointMeshList) {
      mesh.geometry.setValueKey(this.pointValue);
    }
    this.pointMaterial.setColorBar(!!this.pointValue ? this.pointColorBar : null);
  }
  setPointColorBar(pointColorBar) {
    if (!pointColorBar || pointColorBar.length <= 0) {
      this.pointColorBar = null;
    } else {
      this.pointColorBar = new ColorBar2D(pointColorBar);
    }
    this.pointMaterial.setColorBar(!!this.pointValue ? this.pointColorBar : null);
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
    for (const mesh of this.lineMeshList) {
      mesh.geometry.setValueKey(this.lineValue);
    }
    this.lineMaterial.setColorBar(!!this.pointValue ? this.pointColorBar : null);
  }
  setLineColorBar(lineColorBar) {
    if (!lineColorBar || lineColorBar.length <= 0) {
      this.lineColorBar = null;
    } else {
      this.lineColorBar = new ColorBar2D(lineColorBar);
    }
    this.lineMaterial.setColorBar(!!this.lineValue ? this.lineColorBar : null);
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

    this.polygonMaterial.uniforms.opacity.value = this.polygonOpacity;
    this.polygonMaterial.needsUpdate = true;
    this.polygonBorderMaterial.uniforms.opacity.value = this.polygonOpacity;
    this.polygonBorderMaterial.needsUpdate = true;
  }
  setPolygonColor(polygonColor) {
    this.polygonColor = new THREE.Color(polygonColor);

    this.polygonMaterial.uniforms.diffuse.value = this.polygonColor;
    this.polygonMaterial.needsUpdate = true;
  }
  setPolygonBorderWidth(polygonBorderWidth) {
    this.polygonBorderWidth = polygonBorderWidth;

    this.polygonBorderMaterial.uniforms.lineWidth.value = this.polygonBorderWidth;
    this.polygonBorderMaterial.needsUpdate = true;
  }
  setPolygonBorderColor(polygonBorderColor) {
    this.polygonBorderColor = new THREE.Color(polygonBorderColor);

    this.polygonBorderMaterial.uniforms.diffuse.value = this.polygonBorderColor;
    this.polygonBorderMaterial.needsUpdate = true;
  }
  setPolygonBorderStyle(polygonBorderStyle) {
    this.polygonBorderStyle = polygonBorderStyle;

    this.polygonBorderMaterial.uniforms.lineStyle.value = this.polygonBorderStyle;
    this.polygonBorderMaterial.needsUpdate = true;
  }
  setPolygonValue(polygonValue) {
    this.polygonValue = polygonValue;

    for (const mesh of this.polygonMeshList) {
      mesh.geometry.setValueKey(this.polygonValue);
    }
    for (const mesh of this.polygonBorderMeshList) {
      mesh.geometry.setValueKey(this.polygonValue);
    }

    this.polygonMaterial.setColorBar(!!this.polygonValue ? this.polygonColorBar : null);
    this.polygonBorderMaterial.setColorBar(!!this.polygonValue ? this.polygonColorBar : null);
  }
  setPolygonColorBar(polygonColorBar) {
    if (!polygonColorBar || polygonColorBar.length <= 0) {
      this.polygonColorBar = null;
    } else {
      this.polygonColorBar = new ColorBar2D(polygonColorBar);
    }
    this.polygonMaterial.setColorBar(!!this.polygonValue ? this.polygonColorBar : null);
    this.polygonBorderMaterial.setColorBar(!!this.polygonValue ? this.polygonColorBar : null);
  }
  setPolygon3DValue(polygon3DValue) {
    this.polygon3DValue = polygon3DValue;

    for (const mesh of this.polygonMeshList) {
      mesh.geometry.setValueKey(this.polygon3DValue);
    }
    for (const mesh of this.polygonBorderMeshList) {
      mesh.geometry.setValueKey(this.polygon3DValue);
    }

    this.polygonMaterial.defines.USE_3D = !!this.polygon3DValue;
    this.polygonMaterial.needsUpdate = true;

    this.polygonBorderMaterial.defines.USE_3D = !!this.polygon3DValue;
    this.polygonBorderMaterial.needsUpdate = true;

  }
  setPolygon3DScale(polygon3DScale) {
    this.polygon3DScale = polygon3DScale;

    this.polygonMaterial.uniforms.scale3D.value = this.polygon3DScale;
    this.polygonMaterial.needsUpdate = true;

    this.polygonBorderMaterial.uniforms.scale3D.value = this.polygon3DScale;
    this.polygonBorderMaterial.needsUpdate = true;
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

  setPropertiesLabels(propertiesLabels) {
    this.propertiesLabels = propertiesLabels;

    const properties = this.propertiesLabels[this.polygon3DValue];
    if (properties) {
      this.polygonMaterial.uniforms.min3DValue.value = properties.min;
      this.polygonMaterial.uniforms.max3DValue.value = properties.max;
      this.polygonBorderMaterial.uniforms.min3DValue.value = properties.min;
      this.polygonBorderMaterial.uniforms.max3DValue.value = properties.max;
    }

    for (const mesh of this.pointMeshList) {
      mesh.geometry.setPropertiesLabels(this.propertiesLabels);
    }
    for (const mesh of this.lineMeshList) {
      mesh.geometry.setPropertiesLabels(this.propertiesLabels);
    }
    for (const mesh of this.polygonMeshList) {
      mesh.geometry.setPropertiesLabels(this.propertiesLabels);
    }
    for (const mesh of this.polygonBorderMeshList) {
      mesh.geometry.setPropertiesLabels(this.propertiesLabels);
    }


  }

  constructor(opt) {
    super(opt);

    // ******************** 点 ******************** //
    this.pointMaterial = new GeoJSONPointMaterial({
      // side: THREE.DoubleSide,
      transparent: true
    });
    this.pointMeshList = [];

    this.setPointSize(opt.pointSize);
    this.setPointColor(opt.pointColor);
    this.setPointIcon(opt.pointIcon);
    this.setPointValue(opt.pointValue);
    this.setPointColorBar(opt.pointColorBar);
    this.setPointOpacity(opt.pointOpacity);


    // ******************** 线 ******************** //
    this.lineMaterial = new GeoJSONLineMaterial({
      transparent: true,
    });
    this.lineMeshList = [];

    this.setLineWidth(opt.lineWidth);
    this.setLineColor(opt.lineColor);
    this.setLineStyle(opt.lineStyle);
    this.setLineValue(opt.lineValue);
    this.setLineColorBar(opt.lineColorBar);
    this.setLineOpacity(opt.lineOpacity);


    // ******************** 面 ******************** //
    this.polygonMaterial = new GeoJSONPolygonMaterial({
      transparent: true,
    });
    this.polygonBorderMaterial = new GeoJSONPolygonBorderMaterial({
      color: "#ff0000",
      transparent: true,
    })
    this.polygonMeshList = [];
    this.polygonBorderMeshList = [];

    this.setPolygonOpacity(opt.polygonOpacity);
    this.setPolygonColor(opt.polygonColor);
    this.setPolygonBorderWidth(opt.polygonBorderWidth);
    this.setPolygonBorderColor(opt.polygonBorderColor);
    this.setPolygonBorderStyle(opt.polygonBorderStyle);
    this.setPolygonValue(opt.polygonValue);
    this.setPolygonColorBar(opt.polygonColorBar);
    this.setPolygon3DValue(opt.polygon3DValue);
    this.setPolygon3DScale(opt.polygon3DScale);

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
    let cx = 0, cy = 0;
    if (this.map) [cx, cy] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
    const maxPoint = 100000;
    for (let i = 0, l = this.pointArray.length; i < l; i += maxPoint * 3) {
      const pointArray = this.pointArray.slice(i, i + maxPoint * 3 + 1);

      const geometry = new GeoJSONPointListGeometry(pointArray, this.propertiesLabels, this.pointValue);
      const mesh = new THREE.Mesh(geometry, this.pointMaterial);
      mesh.position.set(cx, cy, 0.004);
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
    let cx = 0, cy = 0;
    if (this.map) [cx, cy] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
    const maxLine = 10000000;
    const lineList = [];
    for (let index = 0, l = this.lineArray.length, dataSize = this.lineArray[0], num = 0; index < l; index += 1 + dataSize, dataSize = this.lineArray[index]) {
      const line = this.lineArray.slice(index + 1, index + 1 + dataSize);
      lineList[lineList.length] = line;

      if (index - num > maxLine) {
        num = index;

        const geometry = new GeoJSONLineListGeometry(lineList, this.propertiesLabels, this.lineValue);
        const mesh = new THREE.Mesh(geometry, this.lineMaterial);
        mesh.position.set(cx, cy, 0.003);
        this.lineMeshList.push(mesh);
        this.scene.add(mesh);

        lineList.length = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    if (lineList.length > 0) {
      const geometry = new GeoJSONLineListGeometry(lineList, this.propertiesLabels, this.lineValue);
      const mesh = new THREE.Mesh(geometry, this.lineMaterial);
      mesh.position.set(cx, cy, 0.003);
      this.lineMeshList.push(mesh);
      this.scene.add(mesh);

      lineList.length = 0;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  clearPolygon() {
    for (const mesh of this.polygonMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.polygonMeshList = [];

    for (const mesh of this.polygonBorderMeshList) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    this.polygonBorderMeshList = [];
  }
  async updatePolygon() {
    if (!this.polygonArray) return this.clearPolygon();
    let cx = 0, cy = 0;
    if (this.map) [cx, cy] = this.map.WebMercatorToCanvasXY(this.center[0], this.center[1]);
    const maxPolygon = 10000000;
    const polygonList = [];
    for (let index = 0, l = this.polygonArray.length, num = 0, dataSize = this.polygonArray[0]; index < l; index += 1 + dataSize, dataSize = this.polygonArray[index]) {
      const polygon = this.polygonArray.slice(index + 1, index + 1 + dataSize);
      polygonList[polygonList.length] = polygon;
      if (index - num > maxPolygon) {
        num = index;

        const geometry = new GeoJSONPolygonListGeometry(polygonList, this.propertiesLabels, this.polygonValue);
        const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
        mesh.position.set(cx, cy, 0.001);
        this.polygonMeshList.push(mesh);
        this.scene.add(mesh);

        const borderGeometry = new GeoJSONPolygonBorderListGeometry(polygonList, this.propertiesLabels, this.polygonValue);
        const borderMesh = new THREE.Mesh(borderGeometry, this.polygonBorderMaterial);
        borderMesh.position.set(cx, cy, 0.002);
        this.polygonBorderMeshList.push(borderMesh);
        this.scene.add(borderMesh);

        polygonList.length = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }

    }

    if (polygonList.length > 0) {
      const geometry = new GeoJSONPolygonListGeometry(polygonList, this.propertiesLabels, this.polygonValue);
      const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
      mesh.position.set(cx, cy, 0.001);
      this.polygonMeshList.push(mesh);
      this.scene.add(mesh);

      const borderGeometry = new GeoJSONPolygonBorderListGeometry(polygonList, this.propertiesLabels, this.polygonValue);
      const borderMesh = new THREE.Mesh(borderGeometry, this.polygonBorderMaterial);
      borderMesh.position.set(cx, cy, 0.002);
      this.polygonBorderMeshList.push(borderMesh);
      this.scene.add(borderMesh);

      polygonList.length = 0;
    }
  }

}


export class GeoJSONPointListGeometry extends THREE.BufferGeometry {
  constructor(pointArray = [], propertiesLabels = {}, valueKey = "") {
    super();
    this.type = "GeoJSONPointListGeometry";
    this.isGeoJSONPointListGeometry = true;

    this.valueMap = {};

    const propertiesKeyList = [];

    const attrPosition = new Array();
    const attrNormal = new Array();
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
        attrNormal[attrNormal.length] = 0;
        attrNormal[attrNormal.length] = 0;
        attrNormal[attrNormal.length] = 1;
        attrSide[attrSide.length] = i2;
        attrValue[attrValue.length] = 0;
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
    this.setAttribute("normal", new THREE.Float32BufferAttribute(attrNormal, 3));
    this.setAttribute("side", new THREE.Float32BufferAttribute(attrSide, 1));
    this.noValueAttribute = new THREE.Float32BufferAttribute(attrValue, 1);
    this.setAttribute("value", this.noValueAttribute);
    this.setIndex(attrIndex);
    // this.computeVertexNormals();
    this.computeBoundingBox();

    this.propertiesKeyList = propertiesKeyList;
    this.setPropertiesLabels(propertiesLabels);
    this.setValueKey(valueKey);
  }

  setPropertiesLabels(propertiesLabels) {
    try {
      const map = {};
      for (const [label, item] of Object.entries(propertiesLabels)) {
        const l = this.propertiesKeyList.map(v => Number(item.values[v]));
        map[label] = new THREE.Float32BufferAttribute(l, 1);
      }
      this.valueMap = map;
      this.setValueKey(this._valuekey);
    } catch (error) {
      console.log(error);
      this.valueMap = {};
      this.setValueKey(this._valuekey);
    }
  }

  setValueKey(valueKey) {
    try {
      this._valuekey = valueKey;
      const attrValue = this.valueMap[valueKey];
      if (attrValue) {
        this.setAttribute("value", attrValue);
      } else {
        // mac系统中不能设置空数组，不然图像不显示
        // this.setAttribute("value", new THREE.Float32BufferAttribute([], 1));
        this.setAttribute("value", this.noValueAttribute);
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
    const { color = 0xff0000, opacity = 1, size = 50, map = null, colorBar = null, ...params } = argu || {};
    // this.alphaTest = 0.1;
    // this.transparent = true;
    // this.depthWrite = false;
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
        value: !!colorBar ? textureLoader.load(colorBar.getImage()) : null,
      },
      minValue: {
        value: !!colorBar ? colorBar.min : 0,
      },
      maxValue: {
        value: !!colorBar ? colorBar.max : 1,
      },
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>

      attribute float side;
      attribute float value;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vValue;

      uniform float size;
      uniform mat3 uvTransform;

      void main() {
        vValue = value;

        vec3 transformed = vec3(1.0);

        // 0 2
        // 1 3 

        if(side == 0.0) {
          transformed.x = position.x - size / 2.0;
          transformed.y = position.y + size / 2.0;
          transformed.z = position.z;
          vUv = ( uvTransform * vec3( 0.0, 1.0, 1.0 ) ).xy;
        } else if(side == 1.0) {
          transformed.x = position.x - size / 2.0;
          transformed.y = position.y - size / 2.0;
          transformed.z = position.z;
          vUv = ( uvTransform * vec3( 0.0, 0.0, 1.0 ) ).xy;
        } else if(side == 2.0) {
          transformed.x = position.x + size / 2.0;
          transformed.y = position.y + size / 2.0;
          transformed.z = position.z;
          vUv = ( uvTransform * vec3( 1.0, 1.0, 1.0 ) ).xy;
        } else if(side == 3.0) {
          transformed.x = position.x + size / 2.0;
          transformed.y = position.y - size / 2.0;
          transformed.z = position.z;
          vUv = ( uvTransform * vec3( 1.0, 0.0, 1.0 ) ).xy;
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
          float p = 0.0;
          if(maxValue != minValue) {
            p = (vValue - minValue) / (maxValue - minValue);
          }
          if(p> 1.0) p = 1.0;
          if(p< 0.0) p = 0.0;
          vec4 barDiffuseColor = texture2D(colorBar, vec2(p , 0.5));
          diffuseColor = barDiffuseColor;
          diffuseColor.a *= opacity;
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

  setColorBar(colorBar) {
    if (colorBar) {
      this.defines.USE_COLOR_BAR = true;
      this.uniforms.colorBar.value = textureLoader.load(colorBar.getImage());
      this.uniforms.minValue.value = colorBar.min;
      this.uniforms.maxValue.value = colorBar.max;
    } else {
      this.defines.USE_COLOR_BAR = false;
      this.uniforms.colorBar.value = null;
      this.uniforms.minValue.value = 0;
      this.uniforms.maxValue.value = 1;
    }
    this.needsUpdate = true;
  }
}

export class GeoJSONLineListGeometry extends THREE.BufferGeometry {
  constructor(lineList = [], propertiesLabels = {}, valueKey = "") {
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

    for (let i1 = 0, l1 = lineList.length; i1 < l1; i1++) {
      const value = lineList[i1][0];
      const array = lineList[i1].slice(1);
      addLine(array, value);
    }
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("startPosition", new THREE.Float32BufferAttribute(attrStartPosition, 2));
    this.setAttribute("endPosition", new THREE.Float32BufferAttribute(attrEndPosition, 2));
    this.setAttribute("side", new THREE.Int8BufferAttribute(attrSide, 1));
    this.noValueAttribute = new THREE.Float32BufferAttribute(attrValue, 1)
    this.setAttribute("value", this.noValueAttribute);
    this.setAttribute("distance", new THREE.Float32BufferAttribute(attrDistance, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();
    this.computeBoundingBox();


    this.propertiesKeyList = propertiesKeyList;
    this.setPropertiesLabels(propertiesLabels);
    this.setValueKey(valueKey);

    function addLine(array, value) {
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

        attrValue[attrValue.length] = 0;
        attrValue[attrValue.length] = 0;

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
  }

  setPropertiesLabels(propertiesLabels) {
    try {
      const map = {};
      for (const [label, item] of Object.entries(propertiesLabels)) {
        const l = this.propertiesKeyList.map(v => Number(item.values[v]));
        map[label] = new THREE.Float32BufferAttribute(l, 1);
      }
      this.valueMap = map;
      this.setValueKey(this._valuekey);
    } catch (error) {
      console.log(error);
      this.valueMap = {};
      this.setValueKey(this._valuekey);
    }
  }

  setValueKey(valueKey) {
    try {
      this._valuekey = valueKey;
      const attrValue = this.valueMap[valueKey];
      if (attrValue) {
        this.setAttribute("value", attrValue);
      } else {
        // mac系统中不能设置空数组，不然图像不显示
        // this.setAttribute("value", new THREE.Float32BufferAttribute([], 1));
        this.setAttribute("value", this.noValueAttribute);
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
    const { color = 0xff0000, opacity = 1, lineStyle = LINE_STYLE.SOLID, lineWidth = 50, lineOffset = 0, colorBar = null, ...params } = argu || {};
    // this.alphaTest = 0.1;
    // this.transparent = true;
    // this.depthWrite = false;
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
        value: !!colorBar ? textureLoader.load(colorBar.getImage()) : null,
      },
      minValue: {
        value: !!colorBar ? colorBar.min : 0,
      },
      maxValue: {
        value: !!colorBar ? colorBar.max : 1,
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
          float p = 0.0;
          if(maxValue != minValue) {
            p = (vValue - minValue) / (maxValue - minValue);
          }
          if(p> 1.0) p = 1.0;
          if(p< 0.0) p = 0.0;
          vec4 barDiffuseColor = texture2D(colorBar, vec2(p , 0.5));
          diffuseColor = barDiffuseColor;
          diffuseColor.a *= opacity;
        #endif

        if(lineStyle == ${Number(LINE_STYLE.DASHED).toFixed(1)}){
          float dl = mod(vDistance / (lineWidth * 3.0), 1.0);
          if(0.50 < dl && dl <= 1.0){
            diffuseColor.a = 0.0;
          }
        } else if(lineStyle == ${Number(LINE_STYLE.NONE).toFixed(1)}){
          diffuseColor.a = 0.0;
        }

        gl_FragColor = diffuseColor;

      }
    `;
    this.setValues(params);
  }

  setColorBar(colorBar) {
    if (!!colorBar) {
      this.defines.USE_COLOR_BAR = true;
      this.uniforms.colorBar.value = textureLoader.load(colorBar.getImage());
      this.uniforms.minValue.value = colorBar.min;
      this.uniforms.maxValue.value = colorBar.max;
    } else {
      this.defines.USE_COLOR_BAR = false;
      this.uniforms.colorBar.value = null;
      this.uniforms.minValue.value = 0;
      this.uniforms.maxValue.value = 1;
    }
    this.needsUpdate = true;
  }

}

export class GeoJSONPolygonListGeometry extends THREE.BufferGeometry {
  constructor(polygonList = [], propertiesLabels = {}, valueKey = "") {
    super();
    this.type = "GeoJSONPolygonListGeometry";
    this.isGeoJSONPolygonListGeometry = true;

    this.valueMap = {};

    const propertiesKeyList = [];

    // buffers
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    const values = [];
    for (let i = 0; i < polygonList.length; i++) {
      const { shape, value } = getShape(polygonList[i]);
      addShape(shape, value);
    }
    // build geometry
    this.setIndex(indices);
    this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    // this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    this.noValueAttribute = new THREE.Float32BufferAttribute(values, 1)
    this.setAttribute('value', this.noValueAttribute);
    this.computeVertexNormals();
    this.computeBoundingBox();
    // helper functions
    function addShape(shape, value) {

      const points = shape.extractPoints(12);

      let shapeVertices = points.shape;
      const shapeHoles = points.holes;

      // 把所有路径变成顺时针
      if (THREE.ShapeUtils.isClockWise(shapeVertices) === false) {
        shapeVertices = shapeVertices.reverse();
      }

      for (let i = 0, l = shapeHoles.length; i < l; i++) {
        const shapeHole = shapeHoles[i];
        if (THREE.ShapeUtils.isClockWise(shapeHole) === true) {
          shapeHoles[i] = shapeHole.reverse();
        }
      }
      // 根据路径和空洞生成面
      const faces = THREE.ShapeUtils.triangulateShape(shapeVertices, shapeHoles);
      for (let i = 0, l = shapeHoles.length; i < l; i++) {
        const shapeHole = shapeHoles[i];
        shapeVertices = shapeVertices.concat(shapeHole);
      }

      // 添加底面
      // {
      //   const indicesOffset = vertices.length / 3;
      //   // 添加点，法向量，uv，保存点对应的valueKey
      //   for (let i = 0, l = shapeVertices.length; i < l; i++) {
      //     const vertex = shapeVertices[i];
      //     vertices.push(vertex.x, vertex.y, 0);
      //     // normals.push(0, 0, 1);
      //     uvs.push(vertex.x, vertex.y); // world uvs

      //     propertiesKeyList.push(value);
      //     values.push(0);
      //   }
      //   // 添加面
      //   for (let i = 0, l = faces.length; i < l; i++) {
      //     const face = faces[i];
      //     const a = face[0] + indicesOffset;
      //     const b = face[1] + indicesOffset;
      //     const c = face[2] + indicesOffset;
      //     indices.push(a, b, c);
      //   }
      // }

      // 添加顶面
      {
        const indicesOffset = vertices.length / 3;
        // 添加点，法向量，uv，保存点对应的valueKey
        for (let i = 0, l = shapeVertices.length; i < l; i++) {
          const vertex = shapeVertices[i];
          vertices.push(vertex.x, vertex.y, 1);
          // normals.push(0, 0, 1);
          uvs.push(vertex.x, vertex.y); // world uvs

          propertiesKeyList.push(value);
          values.push(0);
        }
        // 添加面
        for (let i = 0, l = faces.length; i < l; i++) {
          const face = faces[i];
          const a = face[0] + indicesOffset;
          const b = face[1] + indicesOffset;
          const c = face[2] + indicesOffset;
          indices.push(a, b, c);
        }
      }


      // 添加外墙壁
      {
        const indicesOffset = vertices.length / 3;
        const shapeList = [...points.shape, points.shape[0]];
        for (let i = 0, l = shapeList.length - 1; i < l; i++) {
          const vertex1 = shapeList[i];
          const vertex2 = shapeList[i + 1];

          vertices.push(vertex1.x, vertex1.y, 0);
          vertices.push(vertex1.x, vertex1.y, 1);
          vertices.push(vertex2.x, vertex2.y, 0);
          vertices.push(vertex2.x, vertex2.y, 1);

          propertiesKeyList.push(value);
          propertiesKeyList.push(value);
          propertiesKeyList.push(value);
          propertiesKeyList.push(value);

          values.push(0);
          values.push(0);
          values.push(0);
          values.push(0);

          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs

          const a = i * 4 + indicesOffset;
          const b = i * 4 + 1 + indicesOffset;
          const c = i * 4 + 2 + indicesOffset;
          const d = i * 4 + 3 + indicesOffset;

          indices.push(a, b, c);
          indices.push(c, b, d);
        }
      }

      // 添加孔洞墙壁
      for (const holes of points.holes) {
        const indicesOffset = vertices.length / 3;
        const holeList = [...holes, holes[0]];
        for (let i = 0, l = holeList.length - 1; i < l; i++) {
          const vertex1 = holeList[i];
          const vertex2 = holeList[i + 1];

          vertices.push(vertex1.x, vertex1.y, 0);
          vertices.push(vertex1.x, vertex1.y, 1);
          vertices.push(vertex2.x, vertex2.y, 0);
          vertices.push(vertex2.x, vertex2.y, 1);

          propertiesKeyList.push(value);
          propertiesKeyList.push(value);
          propertiesKeyList.push(value);
          propertiesKeyList.push(value);

          values.push(0);
          values.push(0);
          values.push(0);
          values.push(0);

          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          // normals.push(0, 0, -1);
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex1.x, vertex1.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs
          uvs.push(vertex2.x, vertex2.y); // world uvs

          const a = i * 4 + indicesOffset;
          const b = i * 4 + 1 + indicesOffset;
          const c = i * 4 + 2 + indicesOffset;
          const d = i * 4 + 3 + indicesOffset;

          indices.push(a, b, c);
          indices.push(c, b, d);
        }
      }

    }

    function getShape(array) {
      const value = array[0];
      const shapeArray = array.slice(1);
      let shape = null;
      for (let j = 0, l = shapeArray.length, size = shapeArray[0]; j < l; j += 1 + size, size = shapeArray[j]) {
        const v = shapeArray.slice(j + 1, j + 1 + size);
        const points = [];
        for (let k = 0, l3 = v.length / 2; k < l3; k++) {
          points[points.length] = new THREE.Vector2(v[k * 2 + 0], v[k * 2 + 1])
        }
        if (!shape) {
          shape = new THREE.Shape(points);
        } else {
          const holePath = new THREE.Path(points);
          shape.holes.push(holePath);
        }
      }
      return { shape, value };
    }

    this.propertiesKeyList = propertiesKeyList;
    this.setPropertiesLabels(propertiesLabels);
    this.setValueKey(valueKey);
  }

  setPropertiesLabels(propertiesLabels) {
    try {
      const map = {};
      for (const [label, item] of Object.entries(propertiesLabels)) {
        const l = this.propertiesKeyList.map(v => Number(item.values[v]));
        map[label] = new THREE.Float32BufferAttribute(l, 1);
      }
      this.valueMap = map;
      this.setValueKey(this._valuekey);
    } catch (error) {
      console.log(error);
      this.valueMap = {};
      this.setValueKey(this._valuekey);
    }
  }

  setValueKey(valueKey) {
    try {
      this._valuekey = valueKey;
      const attrValue = this.valueMap[valueKey];
      if (attrValue) {
        this.setAttribute("value", attrValue);
      } else {
        // mac系统中不能设置空数组，不然图像不显示
        // this.setAttribute("value", new THREE.Float32BufferAttribute([], 1));
        this.setAttribute("value", this.noValueAttribute);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export class GeoJSONPolygonMaterial extends THREE.Material {
  constructor(argu) {
    super();
    this.isGeoJSONLineMaterial = true;
    const { color = 0xff0000, opacity = 1, size = 50, colorBar = null, ...params } = argu || {};
    this.defines = {
      USE_COLOR_BAR: !!colorBar,
      USE_3D: false
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
      colorBar: {
        value: !!colorBar ? textureLoader.load(colorBar.getImage()) : null,
      },
      minValue: {
        value: !!colorBar ? colorBar.min : 0,
      },
      maxValue: {
        value: !!colorBar ? colorBar.max : 1,
      },
      scale3D: {
        value: 1
      }
    };
    this.vertexShader = `
      #include <common>
      #include <logdepthbuf_pars_vertex>


      attribute float value;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vValue;

      uniform float size;
      uniform mat3 uvTransform;
      uniform float maxValue;
      uniform float minValue;

      uniform float scale3D;

      void main() {
        vValue = value;

        vec3 transformed = position;
        
        #ifdef USE_3D
          transformed.z *= value * scale3D;
        #else
          transformed.z = 0.0;
        #endif

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
          float p = 0.0;
          if(maxValue != minValue) {
            p = (vValue - minValue) / (maxValue - minValue);
          }
          if(p> 1.0) p = 1.0;
          if(p< 0.0) p = 0.0;
          vec4 barDiffuseColor = texture2D(colorBar, vec2(p , 0.5));
          diffuseColor.rgb = barDiffuseColor.rgb;
          diffuseColor.a *= barDiffuseColor.a;
        #endif

        gl_FragColor = diffuseColor;
      }
    `;
    this.setValues(params);
  }

  setColorBar(colorBar) {
    if (!!colorBar) {
      this.defines.USE_COLOR_BAR = true;
      this.uniforms.colorBar.value = textureLoader.load(colorBar.getImage());
      this.uniforms.minValue.value = colorBar.min;
      this.uniforms.maxValue.value = colorBar.max;
    } else {
      this.defines.USE_COLOR_BAR = false;
      this.uniforms.colorBar.value = null;
      this.uniforms.minValue.value = 0;
      this.uniforms.maxValue.value = 1;
    }
    this.needsUpdate = true;
  }

}

export class GeoJSONPolygonBorderListGeometry extends THREE.BufferGeometry {
  constructor(polygonList, propertiesLabels, valueKey) {
    super();
    this.type = "GeoJSONPolygonBorderListGeometry";
    this.isGeoJSONPolygonBorderListGeometry = true;

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

    for (let i = 0; i < polygonList.length; i++) {
      const { shape, value } = getShape(polygonList[i]);
      const points = shape.extractPoints(12);
      let shapeVertices = points.shape;
      const shapeHoles = points.holes;
      // 把所有路径变成顺时针
      if (THREE.ShapeUtils.isClockWise(shapeVertices) === false) {
        shapeVertices = shapeVertices.reverse();
      }
      addLine(shapeVertices, value);

      for (let i = 0, l = shapeHoles.length; i < l; i++) {
        let shapeHole = shapeHoles[i];
        if (THREE.ShapeUtils.isClockWise(shapeHole) === true) {
          shapeHole = shapeHole.reverse();
        }
        addLine(shapeHole, value);
      }
    }

    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("startPosition", new THREE.Float32BufferAttribute(attrStartPosition, 2));
    this.setAttribute("endPosition", new THREE.Float32BufferAttribute(attrEndPosition, 2));
    this.setAttribute("side", new THREE.Int8BufferAttribute(attrSide, 1));
    this.noValueAttribute = new THREE.Float32BufferAttribute(attrValue, 1)
    this.setAttribute("value", this.noValueAttribute);
    this.setAttribute("distance", new THREE.Float32BufferAttribute(attrDistance, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();
    this.computeBoundingBox();


    this.propertiesKeyList = propertiesKeyList;
    this.setPropertiesLabels(propertiesLabels);
    this.setValueKey(valueKey);

    function addLine(points, value) {
      let distance = 0;
      for (let i2 = 0, l2 = points.length; i2 < l2; i2++) {
        let prev = points[i2 - 1];
        let that = points[i2];
        let next = points[i2 + 1];
        if (i2 === 0) {
          prev = that.clone().multiplyScalar(2).sub(next);
        }
        if (i2 >= l2 - 1) {
          next = that.clone().multiplyScalar(2).sub(prev);
        }

        attrPosition[attrPosition.length] = that.x;
        attrPosition[attrPosition.length] = that.y;
        attrPosition[attrPosition.length] = 1;
        attrPosition[attrPosition.length] = that.x;
        attrPosition[attrPosition.length] = that.y;
        attrPosition[attrPosition.length] = 1;

        attrStartPosition[attrStartPosition.length] = prev.x;
        attrStartPosition[attrStartPosition.length] = prev.y;
        attrStartPosition[attrStartPosition.length] = prev.x;
        attrStartPosition[attrStartPosition.length] = prev.y;

        attrEndPosition[attrEndPosition.length] = next.x;
        attrEndPosition[attrEndPosition.length] = next.y;
        attrEndPosition[attrEndPosition.length] = next.x;
        attrEndPosition[attrEndPosition.length] = next.y;

        propertiesKeyList[propertiesKeyList.length] = value;
        propertiesKeyList[propertiesKeyList.length] = value;

        attrValue[attrValue.length] = 0;
        attrValue[attrValue.length] = 0;

        attrDistance[attrDistance.length] = distance;
        attrDistance[attrDistance.length] = distance;

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

        distance += that.distanceTo(next);
      }
    }

    function getShape(array) {
      const value = array[0];
      const shapeArray = array.slice(1);
      let shape = null;
      for (let j = 0, l = shapeArray.length, size = shapeArray[0]; j < l; j += 1 + size, size = shapeArray[j]) {
        const v = shapeArray.slice(j + 1, j + 1 + size);
        const points = [];
        for (let k = 0, l3 = v.length / 2; k < l3; k++) {
          points[points.length] = new THREE.Vector2(v[k * 2 + 0], v[k * 2 + 1])
        }
        if (!shape) {
          shape = new THREE.Shape(points);
        } else {
          const holePath = new THREE.Path(points);
          shape.holes.push(holePath);
        }
      }
      return { shape, value };
    }
  }

  setPropertiesLabels(propertiesLabels) {
    try {
      const map = {};
      for (const [label, item] of Object.entries(propertiesLabels)) {
        const l = this.propertiesKeyList.map(v => Number(item.values[v]));
        map[label] = new THREE.Float32BufferAttribute(l, 1);
      }
      this.valueMap = map;
      this.setValueKey(this._valuekey);
    } catch (error) {
      console.log(error);
      this.valueMap = {};
      this.setValueKey(this._valuekey);
    }
  }

  setValueKey(valueKey) {
    try {
      this._valuekey = valueKey;
      const attrValue = this.valueMap[valueKey];
      if (attrValue) {
        this.setAttribute("value", attrValue);
      } else {
        // mac系统中不能设置空数组，不然图像不显示
        // this.setAttribute("value", new THREE.Float32BufferAttribute([], 1));
        this.setAttribute("value", this.noValueAttribute);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export class GeoJSONPolygonBorderMaterial extends THREE.Material {
  constructor(argu) {
    super();
    this.isGeoJSONPolygonBorderMaterial = true;
    const { color = 0xff0000, opacity = 1, lineStyle = LINE_STYLE.SOLID, lineWidth = 50, lineOffset = 0, colorBar = null, ...params } = argu || {};
    this.defines = {
      USE_COLOR_BAR: !!colorBar,
      USE_3D: false
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
        value: !!colorBar ? textureLoader.load(colorBar.getImage()) : null,
      },
      minValue: {
        value: !!colorBar ? colorBar.min : 0,
      },
      maxValue: {
        value: !!colorBar ? colorBar.max : 1,
      },
      min3DValue: {
        value: 0,
      },
      max3DValue: {
        value: 1,
      },
      scale3D: {
        value: 100
      }
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
      uniform float maxValue;
      uniform float minValue;

      uniform float scale3D;

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
          
        #ifdef USE_3D
          transformed.z *= value * scale3D;
        #else
          transformed.z = 0.0;
        #endif

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
      uniform float maxValue;
      uniform float minValue;
      
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vValue;
      varying float vDistance;

      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>

        if(lineStyle == ${Number(LINE_STYLE.DASHED).toFixed(1)}){
          float dl = mod(vDistance / (lineWidth * 3.0), 1.0);
          if(0.50 < dl && dl <= 1.0){
            diffuseColor.a = 0.0;
          }
        } else if(lineStyle == ${Number(LINE_STYLE.NONE).toFixed(1)}){
          diffuseColor.a = 0.0;
        }

        gl_FragColor = diffuseColor;
      }
    `;
    this.setValues(params);
  }

  setColorBar(colorBar) {
    if (!!colorBar) {
      this.defines.USE_COLOR_BAR = true;
      this.uniforms.colorBar.value = textureLoader.load(colorBar.getImage());
      this.uniforms.minValue.value = colorBar.min;
      this.uniforms.maxValue.value = colorBar.max;
    } else {
      this.defines.USE_COLOR_BAR = false;
      this.uniforms.colorBar.value = null;
      this.uniforms.minValue.value = 0;
      this.uniforms.maxValue.value = 1;
    }
    this.needsUpdate = true;
  }
}
