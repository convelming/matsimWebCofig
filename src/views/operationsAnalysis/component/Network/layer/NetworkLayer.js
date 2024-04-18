import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { EARTH_RADIUS } from "@/mymap/utils/LngLatUtils.js";
import { ColorBar2D } from "@/mymap/utils/ColorBar2D.js";

import { getTileNetwork } from "@/api/index.js";

// import { Line2DGeometry, Line2DMaterial } from "@/mymap/geometry/Line2D";

const BUILD_ZOOM = 11;
let _pickColorNum = 0;

export class NetworkLayer extends Layer {
  colors = ColorBar2D.defaultColors;
  lineWidth = 6;
  lineOffset = 6;
  time = 0;

  material = null;
  pickLayerMaterial = null;
  pickMaterial = null;

  tileMap = {};

  constructor(opt) {
    super(opt);
    _pickColorNum = 0;

    this.time = opt.time || this.time;
    this.colors = opt.colors || this.colors;
    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.lineOffset = opt.lineOffset || this.lineOffset;

    this.material = new NetworkMaterial({ color: 0xff0000, colorBar: ColorBar2D.instance.drowColorBar(this.colors) });
    this.pickLayerMaterial = new NetworkMaterial({ color: this.pickLayerColor });
    this.pickBuildMaterial = new NetworkMaterial({ usePickColor: true });
  }

  setTime(time) {
    this.time = time;
    for (const tile of Object.values(this.tileMap)) {
      tile.setFlowNum(Math.floor(time / 3600));
    }
  }

  setColors(colors) {
    this.colors = colors || ColorBar2D.defaultColors;
    this.material.uniforms.colorBar.value = ColorBar2D.instance.drowColorBar(this.colors);
    this.material.needsUpdate = true;
  }

  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
    this.material.uniforms.lineWidth.value = this.lineWidth;
    this.material.needsUpdate = true;
    this.pickLayerMaterial.uniforms.lineWidth.value = this.lineWidth;
    this.pickLayerMaterial.needsUpdate = true;
    this.pickMeshMaterial.uniforms.lineWidth.value = this.lineWidth;
    this.pickMeshMaterial.needsUpdate = true;
  }

  setLineOffset(lineOffset) {
    this.lineOffset = lineOffset;
    this.material.uniforms.lineOffset.value = this.lineOffset;
    this.material.needsUpdate = true;
    this.pickLayerMaterial.uniforms.lineOffset.value = this.lineOffset;
    this.pickLayerMaterial.needsUpdate = true;
    this.pickMeshMaterial.uniforms.lineOffset.value = this.lineOffset;
    this.pickMeshMaterial.needsUpdate = true;
  }

  // 设置拾取图层颜色
  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = pickLayerColor;
    this.pickLayerMaterial.uniforms.diffuse.value = pickLayerColor;
    this.pickLayerMaterial.needsUpdate = true;
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      this.loadMesh();
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const pickColorNum = data.pickColor;
      for (const tile of Object.values(this.tileMap)) {
        const item = tile.getLineByPickColor(pickColorNum);
        if (item) {
          this.handleEventListener(type, item);
          break;
        }
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.loadMesh();
  }

  async loadMesh() {
    this.updateTimeout = null;
    this.clearScene();

    const zoom = BUILD_ZOOM;
    const [mapCenterX, mapCenterY] = this.map.center;
    const { maxX, minX, maxY, minY } = this.map.getWindowRangeAndWebMercator();
    const width = Math.max(maxX - minX, maxY - minY) * 1.1;

    const [row, col] = [Math.floor(((EARTH_RADIUS + mapCenterX) * Math.pow(2, zoom)) / (EARTH_RADIUS * 2)), Math.floor(((EARTH_RADIUS - mapCenterY) * Math.pow(2, zoom)) / (EARTH_RADIUS * 2))];
    const tileSize = (EARTH_RADIUS * 2) / Math.pow(2, zoom);
    const radius = Math.ceil(width / tileSize) + 1;

    const max_row_col = Math.pow(2, zoom);
    let rowStart = row - radius;
    if (rowStart < 0) rowStart = 0;
    let rowEnd = row + radius;
    if (rowEnd > max_row_col) rowEnd = max_row_col;

    let colStart = col - radius;
    if (colStart < 0) colStart = 0;
    let colEnd = col + radius;
    if (colEnd > max_row_col) colEnd = max_row_col;

    const noLoadTileList = [];

    for (let i = rowStart; i < rowEnd; i++) {
      for (let j = colStart; j < colEnd; j++) {
        let key = `${i}_${j}`;
        let tile = this.tileMap[key];
        if (!tile) {
          tile = new NetworkTile(i, j, this.material, this.pickLayerMaterial, this.pickBuildMaterial);
          this.tileMap[key] = tile;
        }
        if (tile.loadStatus == 1) {
          noLoadTileList.push(tile);
        }
        const [x, y] = this.map.WebMercatorToCanvasXY(tile.x, tile.y);

        tile.baseMesh.position.set(x, y, 0);
        this.scene.add(tile.baseMesh);

        tile.pickLayerMesh.position.set(x, y, 0);
        this.pickLayerScene.add(tile.pickLayerMesh);

        tile.pickBuildMesh.position.set(x, y, 0);
        this.pickMeshScene.add(tile.pickBuildMesh);
      }
    }

    while (noLoadTileList.length > 0) {
      const list = noLoadTileList.splice(0, 30);
      await Promise.all(list.map((v) => v.load(() => ++this.pickColorNum)));
    }

    if (this.selectBuildTile) {
      const [x, y] = this.map.WebMercatorToCanvasXY(this.selectBuildTile.x, this.selectBuildTile.y);
      this.coneMesh.position.set(x, y, 0);
      this.coneMesh.renderOrder = Number.MAX_SAFE_INTEGER;
      this.scene.add(this.coneMesh);
    } else {
      this.scene.remove(this.coneMesh);
    }
  }
}

class NetworkTile {
  _loadNum = 0;

  // 加载状态 1未加载 2加载成功 3加载失败 4加载中
  _loadStatus = 1;

  get loadStatus() {
    return this._loadStatus;
  }
  get row() {
    return this._row;
  }
  get col() {
    return this._col;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get geometry() {
    return this._geometry;
  }
  get baseMesh() {
    return this._baseMesh;
  }
  get pickLayerMesh() {
    return this._pickLayerMesh;
  }
  get pickBuildMesh() {
    return this._pickBuildMesh;
  }

  constructor(row, col, baseMaterial, pickLayerMaterial, pickBuildMaterial, flowNum) {
    this._row = row;
    this._col = col;
    this._x = ((row + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, BUILD_ZOOM) - EARTH_RADIUS;
    this._y = EARTH_RADIUS - ((col + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, BUILD_ZOOM);

    this._data = [];

    this._geometry = new THREE.BufferGeometry();

    this._baseMesh = new THREE.Mesh(this._geometry, baseMaterial);
    this._pickLayerMesh = new THREE.Mesh(this._geometry, pickLayerMaterial);
    this._pickBuildMesh = new THREE.Mesh(this._geometry, pickBuildMaterial);

    this._flowNum = flowNum;
  }

  async load(getPickColorFunc) {
    try {
      this._loadStatus = 4;
      if (this._geometry) {
        this._geometry.dispose();
      }
      const { data } = await getTileNetwork({ x: this._row, y: this._col });
      if (data && data.length > 0) {
        this._data = {};
        for (const v of data) {
          v.pickColorNum = getPickColorFunc();
          this._data[v.pickColorNum] = v;
        }
        this._geometry = new NetworkGeometry(data, this._flowNum);
      } else {
        this._geometry = new THREE.BufferGeometry();
      }
      this._loadStatus = 2;
    } catch (error) {
      this._geometry = new THREE.BufferGeometry();
      this._loadStatus = 3;
      console.log("networktile:error", error);
    }
    this._geometry.userData = this;

    this._baseMesh.geometry = this._geometry;
    this._baseMesh.needsUpdate = true;
    this._pickLayerMesh.geometry = this._geometry;
    this._pickLayerMesh.needsUpdate = true;
    this._pickBuildMesh.geometry = this._geometry;
    this._pickBuildMesh.needsUpdate = true;
    return this;
  }

  getLineByPickColor(pickColor) {
    return this._data[pickColor];
  }

  setFlowNum(flowNum) {
    this._flowNum = flowNum;
    if (this._loadStatus == 2 && this._geometry.isNetworkGeometry) {
      this._geometry.setFlowNum(flowNum);
    }
  }
}

class NetworkGeometry extends THREE.BufferGeometry {
  constructor(lineList, flowNum) {
    console.time(`NetworkGeometry:lineList:${lineList.length}`);
    super();
    this.type = "NetworkGeometry";
    this.isNetworkGeometry = true;

    const posLen = lineList.length * 4;

    const pickColors = []; // new Array(posLen * 3);
    const positions = []; // new Array(posLen * 3);
    const uvs = []; // new Array(posLen * 3);
    const indices = []; // new Array(lineList.length * 6);
    const lineNormals = [];
    const flowsMap = new Map();

    let flowMax = Number.MIN_SAFE_INTEGER;
    let flowMin = Number.MAX_SAFE_INTEGER;

    for (let i = 0, l = lineList.length; i < l; i++) {
      const { pickColorNum, flows, fromCoord, toCoord } = lineList[i];
      const pickColor = new THREE.Color(pickColorNum).toArray();
      for (let j = 0; j < flows.length; j++) {
        if (!flowsMap.has(j)) {
          const list = new THREE.Float32BufferAttribute(new Array(posLen * 4).fill(0), 1);
          flowsMap.set(j, list);
        }
        const flow = flows[j];
        if (flowMax < flow) flowMax = flow;
        if (flowMin > flow) flowMin = flow;
        const list = flowsMap.get(j);
        list.setX(i * 4, flow);
        list.setX(i * 4 + 1, flow);
        list.setX(i * 4 + 2, flow);
        list.setX(i * 4 + 3, flow);
      }
      const lineDirection = new THREE.Vector2(toCoord.x - fromCoord.x, toCoord.y - fromCoord.y);
      const lineLength = lineDirection.length();
      lineDirection.normalize();
      const normal = new THREE.Vector2(-lineDirection.y, lineDirection.x);

      // 起点
      lineNormals.push(normal.x, normal.y, 1);
      lineNormals.push(normal.x, normal.y, -1);
      positions.push(fromCoord.x, fromCoord.y, 0);
      positions.push(fromCoord.x, fromCoord.y, 0);
      pickColors.push(...pickColor);
      pickColors.push(...pickColor);
      uvs.push(0, 0);
      uvs.push(0, 1);
      // 终点
      lineNormals.push(normal.x, normal.y, 1);
      lineNormals.push(normal.x, normal.y, -1);
      positions.push(toCoord.x, toCoord.y, 0);
      positions.push(toCoord.x, toCoord.y, 0);
      pickColors.push(...pickColor);
      pickColors.push(...pickColor);
      uvs.push(1, 1);
      uvs.push(1, 0);
      // 三角形顶点
      indices.push(i * 4, i * 4 + 1, i * 4 + 3);
      indices.push(i * 4, i * 4 + 3, i * 4 + 2);
    }

    this.setIndex(indices);
    this.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    this.setAttribute("pickColor", new THREE.Float32BufferAttribute(pickColors, 3));
    this.setAttribute("lineNormal", new THREE.Float32BufferAttribute(lineNormals, 3));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.setAttribute("flow", flowsMap.get(flowNum) || []);
    this.computeVertexNormals();

    this.flowsMap = flowsMap;
    this.flowMax = flowMax;
    this.flowMin = flowMin;
    console.timeEnd(`NetworkGeometry:lineList:${lineList.length}`);
  }

  setFlowNum(flowNum) {
    this.setAttribute("flow", this.flowsMap.get(flowNum) || []);
    this.needsUpdate = true;
  }

  dispose() {
    this.flowsMap;
    super.dispose();
  }
}

class NetworkMaterial extends THREE.Material {
  constructor(argu) {
    super();
    const { color = 0xffffff, opacity = 1, usePickColor = false, lineWidth = 10, lineOffset = 0, map = null, colorBar, maxColorValue, ...params } = argu || {};
    this.defines = {
      USE_PICK_COLOR: !!usePickColor,
      USE_MAP: !!map,
      USE_COLOR_BAR: !!colorBar,
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

      uniform float lineWidth;
      uniform float lineOffset;
      uniform mat3 uvTransform;


      void main() {

        vFlow = flow;
        vPickColor = pickColor;

        vec3 transformed = vec3(1.0);

        #ifdef USE_MAP
          vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
          // vUv.y = mod(vUv.y * lineLength, lineWidth) / lineWidth;
        #endif

        transformed = vec3(position.xy + lineNormal.xy * lineNormal.z * lineWidth / 2.0 - lineNormal.xy * lineOffset, position.z);

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

      uniform vec3 diffuse;
      uniform float opacity;
      uniform sampler2D map;
      uniform ColorBar colorBar;
      
      varying vec3 vColor;
      varying vec3 vPickColor;
      varying vec2 vUv;
      varying float vFlow;


      void main() {
        vec4 diffuseColor = vec4( diffuse, opacity );
        
        #include <logdepthbuf_fragment>
        
        #ifdef USE_COLOR_BAR
          vec4 barDiffuseColor = texture2D(colorBar.map, vec2(vFlow / colorBar.range, 0.5));
          diffuseColor = barDiffuseColor;
        #endif

        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D(map, vUv);
          sampledDiffuseColor.rgb *= sampledDiffuseColor.a;
          diffuseColor.rgb += sampledDiffuseColor.rgb;
        #endif

        #ifdef USE_PICK_COLOR
          diffuseColor = vec4( vPickColor, 1.0);
        #endif

        gl_FragColor = diffuseColor;

      }
    `;
    this.setValues(params);
  }

  textureOffset(func) {
    try {
      const [x1, y1] = this.uniforms.map.value.offset.toArray();
      const [x2, y2] = func(x1, y1);
      this.uniforms.map.value.offset.set(x2, y2);
      this.uniforms.map.value.updateMatrix();
      this.uniforms.uvTransform.value.copy(this.uniforms.map.value.matrix);
    } catch (error) {}
  }
}
