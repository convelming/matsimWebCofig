import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

export class NetworkLayer extends Layer {
  lineWidth = 6;
  lineOffset = 0;

  material = null;
  pickLayerMaterial = null;
  pickMaterial = null;
  loadingNum = 0;

  tileMap = {};

  pickColorOffset = 0;

  constructor(opt) {
    super(opt);

    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.lineOffset = opt.lineOffset || this.lineOffset;
  }

  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
    for (const tile of Object.values(this.tileMap)) {
      tile.setLineWidth(lineWidth);
    }
    this.selectLine.mesh.material.uniforms.lineWidth.value = lineWidth;
    this.selectLine.mesh.material.needsUpdate = true;
  }

  setLineOffset(lineOffset) {
    this.lineOffset = lineOffset;
    for (const tile of Object.values(this.tileMap)) {
      tile.setLineOffset(lineOffset);
    }
    this.selectLine.mesh.material.uniforms.lineOffset.value = lineOffset;
    this.selectLine.mesh.material.needsUpdate = true;
  }

  // 设置拾取图层颜色
  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = pickLayerColor;
    for (const tile of Object.values(this.tileMap)) {
      tile.setPickLayerColor(pickLayerColor);
    }
  }

  setNetwork(network) {
    this.network = network;
    this.update();
  }

  update() {
    this.clearScene();
    if (!this.network) return;
    const { center, nodes, links } = this.network;
    const step = 100000;
    const array = Array.from(links.values());
    const material = new GeoJSONLineMaterial({});
    const meshList = [];
    for (let i = 0; i < array.length; i += step) {
      console.time(`new LineListGeometry ${i}`);
      const array2 = array.slice(i, i + step);
      const geometry = new LineListGeometry(array2, center);
      const mesh = new THREE.LineSegments(geometry, material);
      meshList.push(mesh);
      console.timeEnd(`new LineListGeometry ${i}`);
      this.scene.add(mesh);
    }
    if (this.map) {
      this.on(MAP_EVENT.UPDATE_CENTER);
    }
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER && this.network) {
      const center = this.network.center;
      const [x, y] = this.map.WebMercatorToCanvasXY(center.x, center.y);
      for (const mesh of this.scene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickLayerScene.children) {
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickMeshScene.children) {
        mesh.position.set(x, y, 0);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
  }
}

export class LineListGeometry extends THREE.BufferGeometry {
  constructor(lineList = [], center = { x: 0, y: 0 }) {
    super();
    this.type = "LineListGeometry";
    this.isLineListGeometry = true;

    this.valueMap = {};

    const attrPosition = new Array();
    const attrPickColor = new Array();
    const attrStartPosition = new Array();
    const attrEndPosition = new Array();
    const attrSide = new Array();
    const attrDistance = new Array();
    const attrIndex = new Array();
    let indexOffset = 0;

    for (let i1 = 0, l1 = lineList.length; i1 < l1; i1++) {
      addLine([lineList[i1]]);
    }
    this.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    this.setAttribute("pickColor", new THREE.Float32BufferAttribute(attrPickColor, 3));
    this.setAttribute("startPosition", new THREE.Float32BufferAttribute(attrStartPosition, 2));
    this.setAttribute("endPosition", new THREE.Float32BufferAttribute(attrEndPosition, 2));
    this.setAttribute("side", new THREE.Int8BufferAttribute(attrSide, 1));
    this.setAttribute("distance", new THREE.Float32BufferAttribute(attrDistance, 1));
    this.setIndex(attrIndex);
    this.computeVertexNormals();
    this.computeBoundingBox();

    function addLine(array, value) {
      const pickColor = new THREE.Color(value);
      for (let i2 = 0, l2 = array.length; i2 <= l2; i2++) {
        let prev, that, next;
        if (i2 === 0) {
          that = array[i2].fromCoord;
          next = array[i2].toCoord;
          prev = that.getPrevByNext(next);
        } else if (i2 === array.length) {
          prev = array[i2 - 1].fromCoord;
          that = array[i2 - 1].toCoord;
          next = that.getNextByPrev(prev);
        }

        attrPosition[attrPosition.length] = that.x - center.x;
        attrPosition[attrPosition.length] = that.y - center.y;
        attrPosition[attrPosition.length] = 0;
        attrPosition[attrPosition.length] = that.x - center.x;
        attrPosition[attrPosition.length] = that.y - center.y;
        attrPosition[attrPosition.length] = 0;

        attrPickColor[attrPickColor.length] = pickColor.r;
        attrPickColor[attrPickColor.length] = pickColor.g;
        attrPickColor[attrPickColor.length] = pickColor.b;
        attrPickColor[attrPickColor.length] = pickColor.r;
        attrPickColor[attrPickColor.length] = pickColor.g;
        attrPickColor[attrPickColor.length] = pickColor.b;

        attrStartPosition[attrStartPosition.length] = prev.x - center.x;
        attrStartPosition[attrStartPosition.length] = prev.y - center.y;
        attrStartPosition[attrStartPosition.length] = prev.x - center.x;
        attrStartPosition[attrStartPosition.length] = prev.y - center.y;

        attrEndPosition[attrEndPosition.length] = next.x - center.x;
        attrEndPosition[attrEndPosition.length] = next.y - center.y;
        attrEndPosition[attrEndPosition.length] = next.x - center.x;
        attrEndPosition[attrEndPosition.length] = next.y - center.y;

        attrDistance[attrDistance.length] = 0; // thatL;
        attrDistance[attrDistance.length] = 0; // thatL;

        attrSide[attrSide.length] = -1;
        attrSide[attrSide.length] = 1;

        if (i2 < l2 - 1) {
          attrIndex[attrIndex.length] = indexOffset + 0;
          attrIndex[attrIndex.length] = indexOffset + 1;
          attrIndex[attrIndex.length] = indexOffset + 3;
          attrIndex[attrIndex.length] = indexOffset + 0;
          attrIndex[attrIndex.length] = indexOffset + 3;
          attrIndex[attrIndex.length] = indexOffset + 2;
        }
        indexOffset += 2;
      }
    }
  }
}

export const LINE_STYLE = {
  NONE: 1, // 不显示
  SOLID: 2, // 实线
  DASHED: 3, // 虚线
};

export const LINE_WIDTH_STYLE = {
  UNAUTO: 1, // 固定值
  AUTO: 2, // 根据数据值变化
};

export class GeoJSONLineMaterial extends THREE.Material {
  constructor(argu) {
    super();
    this.isGeoJSONLineMaterial = true;
    const { color = 0xff0000, opacity = 1, lineStyle = LINE_STYLE.SOLID, lineWidth = 50, lineWidthStyle = LINE_WIDTH_STYLE.UNAUTO, lineOffset = 0, colorBar = null, usePickColor = false, lineAnimation = 0, ...params } = argu || {};
    // this.alphaTest = 0.1;
    // this.transparent = true;
    // TODO: 暂时关闭深度写入，否则会遮挡其他物体
    // this.depthWrite = false;
    this.defines = {
      USE_COLOR_BAR: !!colorBar,
      USE_PICK_COLOR: usePickColor,
    };
    this.uniforms = {
      diffuse: {
        value: new THREE.Color(color),
      },
      opacity: {
        value: opacity,
      },
      lineStyle: {
        value: lineStyle,
      },
      lineWidth: {
        value: lineWidth,
      },
      lineWidthStyle: {
        value: lineWidthStyle,
      },
      lineOffset: {
        value: lineOffset,
      },
      colorBar: {
        value: !!colorBar ? colorBar : null,
      },
      minValue: {
        value: !!colorBar ? colorBar.min : 0,
      },
      maxValue: {
        value: !!colorBar ? colorBar.max : 1,
      },
      mAnimation: {
        value: 0,
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
      attribute vec3 pickColor;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;
      varying float vValue;
      varying float vDistance;

      uniform float lineWidth;
      uniform float lineWidthStyle;
      uniform float lineOffset;
      uniform float maxValue;
      uniform float minValue;
      uniform mat3 uvTransform;

      void main() {
        vValue = value;
        vPickColor = pickColor;
        vDistance = distance;

        #ifdef USE_MAP
          vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
        #endif
        
        vec3 transformed = vec3(1.0);

        float offset = lineWidth * 0.5 * side + lineOffset;
        float p = (value - minValue) / (maxValue - minValue) + 0.1;
        
        if(lineWidthStyle == ${Number(LINE_WIDTH_STYLE.AUTO).toFixed(1)}) {
          offset = p * lineWidth * 0.5 * side + lineOffset;
          // 让小的值在上面避免被遮盖
          // p = 1.1 - p;
        }

        float lenA = length(position.xy - startPosition);
        float lenB = length(position.xy - endPosition);

        if(lenA == 0. && lenB == 0.) {
          transformed = position;
        } else {
          vec2 dirA = normalize(position.xy - startPosition);
          vec2 dirB = normalize(position.xy - endPosition);

          if(lenA == 0.) {
            float angle = PI * 0.5;
            vec2 normal = vec2(-dirB.y, dirB.x);
            transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
          } else if(lenB == 0.) {
            float angle = PI * 0.5;
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

        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed.xy, transformed.z + p, 1.0 );

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
      uniform float mAnimation;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
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
          float dl = mod(vDistance / (lineWidth * 3.0) + mAnimation, 1.0);
          if(0.50 < dl && dl <= 1.0){
            diffuseColor.a = 0.0;
          }
        } else if(lineStyle == ${Number(LINE_STYLE.NONE).toFixed(1)}){
          diffuseColor.a = 0.0;
        }

        #ifdef USE_PICK_COLOR
          diffuseColor = vec4(vPickColor, 1.0);
        #endif

        gl_FragColor = diffuseColor;

      }
    `;
    this.setValues(params);
    this.setLineAnimation(lineAnimation);
  }

  setLineAnimation(lineAnimation) {
    this.__lineAnimation = lineAnimation;
    this.__ct = new Date().getTime();
    this.updateAnimation();
  }

  setColorBar(colorBar, USE_COLOR_BAR = true) {
    if (!!colorBar) {
      this.defines.USE_COLOR_BAR = USE_COLOR_BAR && true;
      this.uniforms.colorBar.value = colorBar.texture;
      this.uniforms.minValue.value = colorBar.min;
      this.uniforms.maxValue.value = colorBar.max;
    } else {
      this.defines.USE_COLOR_BAR = USE_COLOR_BAR && false;
      this.uniforms.colorBar.value = null;
      this.uniforms.minValue.value = 0;
      this.uniforms.maxValue.value = 1;
    }
    this.needsUpdate = true;
  }

  updateAnimation() {
    if (this.__lineAnimation <= 0) return;
    const now = new Date().getTime();
    const p = ((now - this.__ct) % this.__lineAnimation) / this.__lineAnimation;
    this.uniforms.mAnimation.value = p;
    this.needsUpdate = true;
  }
}
