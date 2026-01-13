
import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

const textureLoader = new THREE.TextureLoader();

export const LINE_STYLE = {
  NONE: 0, // 不显示
  SOLID: 1, // 实线
  DASHED: 2 // 虚线
}

export class LineLayer extends Layer {
  lineWidth = 1.5;
  constructor(opt) {
    super(opt);
    this.lineWidth = opt.lineWidth || this.lineWidth;

    this.material = new LineMaterial({
      transparent: true,
      lineWidth: this.lineWidth,
      map: textureLoader.load(require("@/assets/image/daolu.png"))
    });
    this.lineMeshList = [];

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
    this.update()
  }

  setData(data) {
    this.data = data;
    this.update()

  }
  update() {
    this.clearScene();
    if (!this.data) return;
    if (!this.map) return;

    const center = WGS84ToMercator(this.data[0].geom[0][0], this.data[0].geom[0][1]);
    const lineList = [];
    for (const [i1, v1] of this.data.entries()) {
      const line = [0];
      let length = 0;
      let prev = null
      for (const [i2, v2] of v1.geom.entries()) {
        const point = WGS84ToMercator(v2[0], v2[1]);
        point[0] -= center[0];
        point[1] -= center[1];
        if (prev) {
          length += Math.sqrt(Math.pow(point[0] - prev[0], 2) + Math.pow(point[1] - prev[1], 2))
        }
        line.push(point[0], point[1], length);
        prev = point;
      }
      lineList.push(line);
    }
    const geometry = new LineListGeometry(lineList, [], [], "");

    this.center = center;
    this.mesh = new THREE.Mesh(geometry, this.material);
    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.mesh.position.set(x, y, 0);
    this.scene.add(this.mesh);
  }

}

export class LineListGeometry extends THREE.BufferGeometry {
  constructor(lineList, propertiesList, propertiesLabels, valueKey) {
    super();
    this.type = "LineListGeometry";
    this.isLineListGeometry = true;

    this.valueMap = {};

    const propertiesKeyList = [];

    const attrPosition = new Array();
    const attrStartPosition = new Array();
    const attrEndPosition = new Array();
    const attrSide = new Array();
    const attrDistance = new Array();
    const attrValue = new Array();
    const attrIndex = new Array();
    const attrUv = new Array();
    let indexOffset = 0;

    for (let i1 = 0, l1 = lineList.length; i1 < l1; i1++) {
      const value = lineList[i1][0];
      const array = lineList[i1].slice(1);
      addLine(array, value, i1 * 0.0001);
    }
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("startPosition", new THREE.Float32BufferAttribute(attrStartPosition, 2));
    this.setAttribute("endPosition", new THREE.Float32BufferAttribute(attrEndPosition, 2));
    this.setAttribute("side", new THREE.Int8BufferAttribute(attrSide, 1));
    this.noValueAttribute = new THREE.Float32BufferAttribute(attrValue, 1)
    this.setAttribute("value", this.noValueAttribute);
    this.setAttribute("distance", new THREE.Float32BufferAttribute(attrDistance, 1));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(attrUv, 2));
    console.log(attrUv);

    this.setIndex(attrIndex);
    this.computeVertexNormals();
    this.computeBoundingBox();


    this.propertiesKeyList = propertiesKeyList;
    this.setPropertiesList(propertiesList, propertiesLabels);
    this.setValueKey(valueKey);

    function addLine(array, value, zIndex) {
      const totalL = array[array.length - 1]
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
        attrPosition[attrPosition.length] = zIndex;
        attrPosition[attrPosition.length] = thatX;
        attrPosition[attrPosition.length] = thatY;
        attrPosition[attrPosition.length] = zIndex;

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

        attrUv[attrUv.length] = 0;
        attrUv[attrUv.length] = thatL / totalL;
        attrUv[attrUv.length] = 1;
        attrUv[attrUv.length] = thatL / totalL;


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


  setPropertiesList(propertiesList, propertiesLabels) {
    try {
      const _pl = this.propertiesKeyList.map(v => propertiesList[v]);
      const map = {};
      for (const label in propertiesLabels) {
        const l = _pl.map(v => Number(v ? v[label] || 0 : 0) || 0);
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

export class LineMaterial extends THREE.Material {
  constructor(argu) {
    super();
    this.isLineMaterial = true;
    const { color = 0xff0000, opacity = 1, lineStyle = LINE_STYLE.SOLID, lineWidth = 50, lineOffset = 0, colorBar = null, map = null, maxValue = 1, minValue = 0, ...params } = argu || {};
    // this.alphaTest = 0.1;
    // this.transparent = true;
    // this.depthWrite = false;
    this.defines = {
      USE_MAP: !!map,
      USE_COLOR_BAR: !!colorBar,
    };
    console.log(argu);

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
      map: {
        value: map,
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
          float dl = mod(distance / lineWidth , 1.0);
          // vUv = ( uvTransform * vec3( uv.x, dl, 1.0 ) ).xy;
          vUv = vec2( uv.x, dl);
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
        #endif

        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D(map, vUv);
          diffuseColor = sampledDiffuseColor;
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
}