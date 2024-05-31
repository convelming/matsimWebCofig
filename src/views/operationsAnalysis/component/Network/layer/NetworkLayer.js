import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { EARTH_RADIUS } from "@/mymap/utils/LngLatUtils.js";
import { ColorBar2D } from "@/mymap/utils/ColorBar2D.js";

import { getTileNetwork } from "@/api/index.js";

import { guid } from "@/utils/utils";

import NetworkLayerWorker from "../worker/NetworkLayer3.worker";

const BUILD_ZOOM = 11;

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

    this.time = opt.time || this.time;
    this.colors = opt.colors || this.colors;

    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.lineOffset = opt.lineOffset || this.lineOffset;
    this.showNode = opt.showNode || this.showNode;
    this.selectLine = {
      show: false,
      tile: null,
      line: null,
      center: [0, 0],
      mesh: new THREE.Mesh(
        new THREE.BufferGeometry(),
        new NetworkMaterial({
          color: 0xffa500,
          lineWidth: this.lineWidth,
          lineOffset: this.lineOffset,
        })
      ),
    };
    this.selectNode = {
      show: false,
      tile: null,
      node: null,
      center: [0, 0],
      mesh: new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshBasicMaterial({
          map: NetworkTile.noodMap,
          color: 0xffa500,
          transparent: true,
        })
      ),
    };

    // this.worker = new CarMotionLayerWorker();
    // this.worker.onmessage = (event) => {
    //   const { key, data } = event.data;
    //   switch (key) {
    //     case "getNetworkTile":
    //       this.handleGetNetworkTileCallback(data);
    //       break;
    //   }
    // };
    // this.worker.addEventListener("error", (error) => {
    //   console.log(error);
    // });

    // this.worker.postMessage({
    //   key: "getNetworkTile",
    //   data: {
    //     row: 1668,
    //     col: 888,
    //   },
    // });
  }

  handleGetNetworkTileCallback(data) { }

  setSelectLine(lineId) {
    console.log("setSelectLine", lineId);
    for (const tile of Object.values(this.tileMap)) {
      const lineItem = tile.getLineById(lineId);
      if (lineItem) {
        this.selectLine.tile = tile;
        this.selectLine.line = lineItem;
        this.selectLine.show = true;
        const geometry = new NetworkGeometry([lineItem], 0);
        this.selectLine.mesh.geometry = geometry;
        this.loadMesh();
        return;
      }
    }
    this.scene.remove(this.selectLine.mesh);
  }

  setSelectNode(nodeId) {
    console.log("setSelectNode", nodeId);
    for (const tile of Object.values(this.tileMap)) {
      const nodeItem = tile.getNodeById(nodeId);
      if (nodeItem) {
        this.selectNode.tile = tile;
        this.selectNode.node = nodeItem;
        this.selectNode.show = true;
        this.loadMesh();
        return;
      }
    }
    this.selectNode.show = false;
  }

  setShowNode(showNode) {
    this.showNode = showNode;
    for (const tile of Object.values(this.tileMap)) {
      tile.setShowNode(showNode);
    }
  }

  setTime(time) {
    this.time = time;
    for (const tile of Object.values(this.tileMap)) {
      tile.setTime(time);
    }
  }

  setColors(colors) {
    this.colors = colors || ColorBar2D.defaultColors;
    for (const tile of Object.values(this.tileMap)) {
      tile.setColors(colors);
    }
  }

  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
    for (const tile of Object.values(this.tileMap)) {
      tile.setLineWidth(lineWidth);
    }
    this.selectLine.mesh.material.uniforms.lineWidth.value = lineWidth;
    this.selectLine.mesh.material.needsUpdate = true;

    const scale = lineWidth / 100;
    this.selectNode.mesh.scale.set(scale, scale, 1);
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

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      this.loadMesh();
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const pickColorNum = data.pickColor;
      for (const tile of Object.values(this.tileMap)) {
        const lineItem = tile.getLineByPickColor(pickColorNum);
        const nodeItem = tile.getNodeByPickColor(pickColorNum);
        const nodeList = Object.keys(tile._nodeData);
        console.log(pickColorNum, nodeList[0], nodeList[nodeList.length - 1]);
        if (lineItem) {
          this.handleEventListener(type, lineItem);
          break;
        } else if (nodeItem) {
          this.handleEventListener(type, nodeItem);
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
    const width = Math.max(maxX - minX, maxY - minY);

    const [row, col] = [Math.floor(((EARTH_RADIUS + mapCenterX) * Math.pow(2, zoom)) / (EARTH_RADIUS * 2)), Math.floor(((EARTH_RADIUS - mapCenterY) * Math.pow(2, zoom)) / (EARTH_RADIUS * 2))];
    const tileSize = (EARTH_RADIUS * 2) / Math.pow(2, zoom);
    const radius = 0// Math.ceil(width / tileSize);

    const max_row_col = Math.pow(2, zoom);
    let rowStart = row - radius;
    if (rowStart < 0) rowStart = 0;
    let rowEnd = row + radius + 1;
    if (rowEnd > max_row_col) rowEnd = max_row_col;

    let colStart = col - radius;
    if (colStart < 0) colStart = 0;
    let colEnd = col + radius + 1;
    if (colEnd > max_row_col) colEnd = max_row_col;

    const noLoadTileList = [];

    for (let i = rowStart; i < rowEnd; i++) {
      for (let j = colStart; j < colEnd; j++) {
        let key = `${i}_${j}`;
        let tile = this.tileMap[key];
        if (!tile) {
          tile = new NetworkTile({
            row: i,
            col: j,
            time: this.time,
            lineWidth: this.lineWidth,
            lineOffset: this.lineOffset,
            colors: this.colors,
            pickLayerColor: this.pickLayerColor,
          });
          this.tileMap[key] = tile;
        }
        if (tile.loadStatus == 1) {
          // noLoadTileList.push(tile);
          tile.load(() => ++this.pickColorNum);
        }
        const [x, y] = this.map.WebMercatorToCanvasXY(tile.x, tile.y);
        tile.baseScene.position.set(x, y, 0);
        this.scene.add(tile.baseScene);

        tile.pickLayerScene.position.set(x, y, 0);
        this.pickLayerScene.add(tile.pickLayerScene);

        tile.pickMeshScene.position.set(x, y, 0);
        this.pickMeshScene.add(tile.pickMeshScene);
      }
    }

    // while (noLoadTileList.length > 0) {
    //   const list = noLoadTileList.splice(0, 30);
    //   await Promise.all(list.map((v) => v.load(() => ++this.pickColorNum)));
    // }
    if (this.selectLine.show) {
      const { line, tile, mesh } = this.selectLine;
      const [x, y] = this.map.WebMercatorToCanvasXY(tile.x, tile.y);
      mesh.position.set(x, y, 1.5);
      this.scene.add(mesh);
    }

    if (this.selectNode.show) {
      const { node, tile, mesh } = this.selectNode;
      const [x, y] = this.map.WebMercatorToCanvasXY(node.coord.x + tile.x, node.coord.y + tile.y);
      mesh.position.set(x, y, 1.5);
      const scale = this.lineWidth / 100;
      mesh.scale.set(scale, scale, 1);
      this.scene.add(mesh);
    }
  }
}

export class NetworkTile {
  static noodMap = new THREE.TextureLoader().load(require("@/assets/image/point2.png"));
  static lineMap = new THREE.TextureLoader().load(require("@/assets/image/up2.png"));

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
  get baseScene() {
    return this._baseScene;
  }
  get pickLayerScene() {
    return this._pickLayerScene;
  }
  get pickMeshScene() {
    return this._pickMeshScene;
  }
  get flowNum() {
    return this._flowNum;
  }

  constructor({ row, col, flowNum = 0, lineWidth = 10, lineOffset = 0, colors = ColorBar2D.defaultColors, pickLayerColor = 0xff0000, showNode = false }) {
    this._row = row;
    this._col = col;
    this._x = ((row + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, BUILD_ZOOM) - EARTH_RADIUS;
    this._y = EARTH_RADIUS - ((col + 0.5) * (EARTH_RADIUS * 2)) / Math.pow(2, BUILD_ZOOM);
    this._lineOffset = lineOffset;
    this._lineWidth = lineWidth;
    this._colors = colors;
    this._pickLayerColor = pickLayerColor;
    this._showNode = showNode;
    this._nodeData = {};
    this._lineData = {};

    this._geometry = new THREE.BufferGeometry();
    this._baseMaterial = new NetworkMaterial({
      color: 0xff0000,
      colorBar: ColorBar2D.instance.drowColorBar(this._colors),
      lineWidth: this._lineWidth,
      lineOffset: this._lineOffset,
      // map: NetworkTile.lineMap,
    });
    this._pickLayerMaterial = new NetworkMaterial({
      color: this._pickLayerColor,
      lineWidth: this._lineWidth,
      lineOffset: this._lineOffset,
    });
    this._pickMeshMaterial = new NetworkMaterial({
      usePickColor: true,
      lineWidth: this._lineWidth,
      lineOffset: this._lineOffset,
    });

    this._nodeGeometry = new THREE.PlaneGeometry(100, 100);
    this._baseNodeMaterial = new THREE.MeshBasicMaterial({
      map: NetworkTile.noodMap,
      color: new THREE.Color(0xff0000),
      transparent: true,
    });
    this._pickLayerNodeMaterial = new THREE.MeshBasicMaterial({ color: this._pickLayerColor });
    this._pickMeshNodeMaterial = new THREE.MeshBasicMaterial();

    this._baseScene = new THREE.Group();
    this._pickLayerScene = new THREE.Group();
    this._pickMeshScene = new THREE.Group();

    this._flowNum = flowNum;
  }

  clear() {
    this._baseScene.remove(...this._baseScene.children);
    this._pickLayerScene.remove(...this._pickLayerScene.children);
    this._pickMeshScene.remove(...this._pickMeshScene.children);

    this._baseNodeMesh = null;
    this._pickLayerNodeMesh = null;
    this._pickMeshNodeMesh = null;
  }

  async load(getPickColorFunc) {
    try {
      this._loadStatus = 4;
      const { data } = await getTileNetwork({ x: this._row, y: this._col });
      if (data && data.length > 0) {
        this._lineData = {};
        this._nodeData = {};
        const nodeObj = {};
        for (const v of data) {
          v.pickColorNum = getPickColorFunc();
          v.type = "line";
          v.uuid = guid();
          v.id = v.linkId;
          this._lineData[v.pickColorNum] = v;

          const fromNode = { coord: v.fromCoord, id: v.fromNodeId, type: "node", uuid: guid() };
          const toNode = { coord: v.toCoord, id: v.toNodeId, type: "node", uuid: guid() };
          if (!nodeObj[fromNode.id]) {
            const pickColorNum = getPickColorFunc();
            fromNode.pickColorNum = pickColorNum;
            this._nodeData[pickColorNum] = fromNode;
            nodeObj[fromNode.id] = true;
          }
          if (!nodeObj[toNode.id]) {
            const pickColorNum = getPickColorFunc();
            toNode.pickColorNum = pickColorNum;
            this._nodeData[pickColorNum] = toNode;
            nodeObj[toNode.id] = true;
          }
        }
        this._geometry = new NetworkGeometry(data, this._flowNum);

        // this._baseMaterial.uniforms.flowMax.value = this._geometry.flowMax;
        // this._baseMaterial.uniforms.flowMin.value = this._geometry.flowMin;
        // this._baseMaterial.needsUpdate = true;
        // this._pickLayerMaterial.uniforms.flowMax.value = this._geometry.flowMax;
        // this._pickLayerMaterial.uniforms.flowMin.value = this._geometry.flowMin;
        // this._pickLayerMaterial.needsUpdate = true;
        // this._pickMeshMaterial.uniforms.flowMax.value = this._geometry.flowMax;
        // this._pickMeshMaterial.uniforms.flowMin.value = this._geometry.flowMin;
        // this._pickMeshMaterial.needsUpdate = true;

        this._baseMesh = new THREE.Mesh(this._geometry, this._baseMaterial);
        this._pickLayerMesh = new THREE.Mesh(this._geometry, this._pickLayerMaterial);
        this._pickBuildMesh = new THREE.Mesh(this._geometry, this._pickMeshMaterial);
        this._baseScene.add(this._baseMesh);
        this._pickLayerScene.add(this._pickLayerMesh);
        this._pickMeshScene.add(this._pickBuildMesh);

        const nodeList = Object.values(this._nodeData);
        this._baseNodeMesh = new THREE.InstancedMesh(this._nodeGeometry, this._baseNodeMaterial, nodeList.length);
        this._pickLayerNodeMesh = new THREE.InstancedMesh(this._nodeGeometry, this._pickLayerNodeMaterial, nodeList.length);
        this._pickMeshNodeMesh = new THREE.InstancedMesh(this._nodeGeometry, this._pickMeshNodeMaterial, nodeList.length);

        const _scale = (this._lineWidth / 100) * 1.1;
        for (let i = 0, l = nodeList.length; i < l; i++) {
          const { coord, pickColorNum } = nodeList[i];
          const matrix = new THREE.Matrix4();
          const positionV3 = new THREE.Vector3(coord.x, coord.y, 1);
          const scaleV3 = new THREE.Vector3(_scale, _scale, 1);
          matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

          this._baseNodeMesh.setMatrixAt(i, matrix);
          this._pickLayerNodeMesh.setMatrixAt(i, matrix);
          this._pickMeshNodeMesh.setMatrixAt(i, matrix);
          this._pickMeshNodeMesh.setColorAt(i, new THREE.Color(pickColorNum));
        }
        this._baseNodeMesh.instanceMatrix.needsUpdate = true;
        this._pickLayerNodeMesh.instanceMatrix.needsUpdate = true;
        this._pickMeshNodeMesh.instanceMatrix.needsUpdate = true;
        if (this._showNode) {
          this._baseScene.add(this._baseNodeMesh);
          this._pickLayerScene.add(this._pickLayerNodeMesh);
          this._pickMeshScene.add(this._pickMeshNodeMesh);
        }
      }
      this._loadStatus = 2;
    } catch (error) {
      this._loadStatus = 3;
      console.log("networktile:error", error);
    }
    return this;
  }

  getLineById(lineId) {
    for (const line of Object.values(this._lineData)) {
      if (line.id === lineId) {
        return line;
      }
    }
    return null;
  }

  getNodeById(nodeId) {
    for (const node of Object.values(this._nodeData)) {
      if (node.id === nodeId) {
        return node;
      }
    }
    return null;
  }

  getLineByPickColor(pickColor) {
    return this._lineData[pickColor];
  }

  getNodeByPickColor(pickColor) {
    return this._nodeData[pickColor];
  }

  setColors(colors) {
    this._colors = colors || ColorBar2D.defaultColors;
    this._baseMaterial.uniforms.colorBar.value = ColorBar2D.instance.drowColorBar(this._colors);
    console.log(this._baseMaterial.uniforms.colorBar.value);
    this._baseMaterial.needsUpdate = true;
  }

  setPickLayerColor(pickLayerColor) {
    this._pickLayerColor = pickLayerColor;
    this._pickLayerMaterial.uniforms.diffuse.value = pickLayerColor;
    this._pickLayerMaterial.needsUpdate = true;
  }

  setLineWidth(lineWidth) {
    this._lineWidth = lineWidth;
    this._baseMaterial.uniforms.lineWidth.value = this._lineWidth;
    this._baseMaterial.needsUpdate = true;
    this._pickLayerMaterial.uniforms.lineWidth.value = this._lineWidth;
    this._pickLayerMaterial.needsUpdate = true;
    this._pickMeshMaterial.uniforms.lineWidth.value = this._lineWidth;
    this._pickMeshMaterial.needsUpdate = true;

    if (this.loadStatus != 2) return;
    const nodeList = Object.values(this._nodeData);
    for (let i = 0, l = nodeList.length; i < l; i++) {
      const { coord, pickColorNum } = nodeList[i];
      const matrix = new THREE.Matrix4();
      const positionV3 = new THREE.Vector3(coord.x, coord.y, i / l + 1);
      const _scale = (this._lineWidth / 100) * 1.1;
      const scaleV3 = new THREE.Vector3(_scale, _scale, 1);
      matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

      if (this._baseNodeMesh) this._baseNodeMesh.setMatrixAt(i, matrix);
      if (this._pickLayerNodeMesh) this._pickLayerNodeMesh.setMatrixAt(i, matrix);
      if (this._pickMeshNodeMesh) this._pickMeshNodeMesh.setMatrixAt(i, matrix);
    }
    if (this._baseNodeMesh) this._baseNodeMesh.instanceMatrix.needsUpdate = true;
    if (this._pickLayerNodeMesh) this._pickLayerNodeMesh.instanceMatrix.needsUpdate = true;
    if (this._pickMeshNodeMesh) this._pickMeshNodeMesh.instanceMatrix.needsUpdate = true;
  }

  setLineOffset(lineOffset) {
    this._lineOffset = lineOffset;
    this._baseMaterial.uniforms.lineOffset.value = this._lineOffset;
    this._baseMaterial.needsUpdate = true;
    this._pickLayerMaterial.uniforms.lineOffset.value = this._lineOffset;
    this._pickLayerMaterial.needsUpdate = true;
    this._pickMeshMaterial.uniforms.lineOffset.value = this._lineOffset;
    this._pickMeshMaterial.needsUpdate = true;
  }

  setTime(time) {
    this._flowNum = Math.floor(time / 3600);
    if (this.loadStatus != 2) return;
    if (this._geometry.isNetworkGeometry) {
      this._geometry.setFlowNum(this._flowNum);
    }
  }

  setShowNode(showNode) {
    this._showNode = showNode;
    if (showNode) {
      if (this._baseNodeMesh) this._baseScene.add(this._baseNodeMesh);
      if (this._pickLayerNodeMesh) this._pickLayerScene.add(this._pickLayerNodeMesh);
      if (this._pickMeshNodeMesh) this._pickMeshScene.add(this._pickMeshNodeMesh);
    } else {
      if (this._baseNodeMesh) this._baseNodeMesh.removeFromParent();
      if (this._pickLayerNodeMesh) this._pickLayerNodeMesh.removeFromParent();
      if (this._pickMeshNodeMesh) this._pickMeshNodeMesh.removeFromParent();
    }
  }

  toJSON() {
    const data = {
      row: this._row,
      col: this._col,
      flowNum: this._flowNum,
      lineWidth: this._lineWidth,
      lineOffset: this._lineOffset,
      colors: this._colors,
      pickLayerColor: this._pickLayerColor,
      showNode: this._showNode,
      loadStatus: this._loadStatus,
    };
    if (this._loadStatus == 2) {
      data.lineData = JSON.parse(JSON.stringify(this._lineData));
      data.nodeData = JSON.parse(JSON.stringify(this._nodeData));
      data.geometry = this._geometry.toJSON();
    }
    return data;
  }

  static fromJSON(json) {
    const tile = new NetworkTile({
      row: json.row,
      col: json.col,
      flowNum: json.flowNum,
      lineWidth: json.lineWidth,
      lineOffset: json.lineOffset,
      colors: json.colors,
      pickLayerColor: json.pickLayerColor,
      showNode: json.showNode,
    });
    if (json.loadStatus == 2) {
      tile._loadStatus = 2;
      tile._lineData = json.lineData;
      tile._nodeData = json.nodeData;
      tile._geometry = NetworkGeometry.fromJSON(json.geometry);
    }
    return tile;
  }
}

export class NetworkGeometry extends THREE.BufferGeometry {
  static nullFlows = new THREE.Float32BufferAttribute([], 2);

  constructor(lineList, flowNum) {
    console.time("NetworkGeometry:lineList:" + lineList.length);
    super();
    this.type = "NetworkGeometry";
    this.isNetworkGeometry = true;

    const posLen = lineList.length * 4;

    const pickColors = []; // new Array(posLen * 3);
    const positions = []; // new Array(posLen * 3);
    const uvs = []; // new Array(posLen * 3);
    const indices = []; // new Array(lineList.length * 6);
    const lineNormals = [];
    const lineLengths = [];

    const flowsMap = new Map();

    let flowMax = Number.MIN_SAFE_INTEGER;
    let flowMin = Number.MAX_SAFE_INTEGER;

    for (let i = 0, l = lineList.length; i < l; i++) {
      const { pickColorNum, flows, fromCoord, toCoord } = lineList[i];
      const pickColor = new THREE.Color(pickColorNum).toArray();
      for (let j = 0; j < flows.length; j++) {
        if (!flowsMap.has(String(j))) {
          const list = new THREE.Float32BufferAttribute(new Array(posLen * 4).fill(0), 1);
          flowsMap.set(String(j), list);
        }
        const flow = flows[j];
        if (flowMax < flow) flowMax = flow;
        if (flowMin > flow) flowMin = flow;
        const list = flowsMap.get(String(j));
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
      lineLengths.push(lineLength);
      lineLengths.push(lineLength);
      lineNormals.push(normal.x, normal.y, 1);
      lineNormals.push(normal.x, normal.y, -1);
      positions.push(fromCoord.x, fromCoord.y, 0);
      positions.push(fromCoord.x, fromCoord.y, 0);
      pickColors.push(...pickColor);
      pickColors.push(...pickColor);
      uvs.push(0, 0);
      uvs.push(0, 1);
      // 终点
      lineLengths.push(lineLength);
      lineLengths.push(lineLength);
      lineNormals.push(normal.x, normal.y, -1);
      lineNormals.push(normal.x, normal.y, 1);
      positions.push(toCoord.x, toCoord.y, 0);
      positions.push(toCoord.x, toCoord.y, 0);
      pickColors.push(...pickColor);
      pickColors.push(...pickColor);
      uvs.push(1, 1);
      uvs.push(1, 0);
      // 三角形顶点
      indices.push(i * 4, i * 4 + 1, i * 4 + 2);
      indices.push(i * 4, i * 4 + 2, i * 4 + 3);
    }

    this.setIndex(indices);
    this.setAttribute("lineLength", new THREE.Float32BufferAttribute(lineLengths, 1));
    this.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    this.setAttribute("pickColor", new THREE.Float32BufferAttribute(pickColors, 3));
    this.setAttribute("lineNormal", new THREE.Float32BufferAttribute(lineNormals, 3));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.setAttribute("flow", flowsMap.get(String(flowNum)) || NetworkGeometry.nullFlows);
    this.computeVertexNormals();

    this.flowsMap = flowsMap;
    this.flowMax = flowMax;
    this.flowMin = flowMin;
    this.flowNum = String(flowNum);
    console.timeEnd("NetworkGeometry:lineList:" + lineList.length);
  }

  setFlowNum(flowNum) {
    if (this.flowNum != String(flowNum)) {
      this.flowNum = String(flowNum);
      this.setAttribute("flow", this.flowsMap.get(String(this.flowNum)) || NetworkGeometry.nullFlows);
    }
  }

  toJSON() {
    const data = super.toJSON();
    data.data.flowMax = this.flowMax;
    data.data.flowMin = this.flowMin;
    data.data.flowsMap = {};
    for (const key of this.flowsMap.keys()) {
      const arr = this.flowsMap.get(key);
      data.data.flowsMap[key] = arr.toJSON();
    }
    return data;
  }

  static fromJSON(json) {
    const { flowMax, flowMin, flowsMap, attributes, index } = json.data;
    const geometry = new NetworkGeometry([], 0);
    geometry.flowMax = flowMax;
    geometry.flowMin = flowMin;
    for (const key of Object.keys(flowsMap)) {
      const { itemSize, type, array, normalized } = flowsMap[key];
      const arr = new THREE.Float32BufferAttribute(array, itemSize);
      geometry.flowsMap.set(String(key), arr);
    }
    for (const key of Object.keys(attributes)) {
      const { itemSize, type, array, normalized } = attributes[key];
      const arr = new THREE.Float32BufferAttribute(array, itemSize);
      geometry.setAttribute(key, arr);
    }
    geometry.setIndex(index.array);
    geometry.computeVertexNormals();
    return geometry;
  }

  dispose() {
    this.flowsMap;
    super.dispose();
  }
}

export class NetworkMaterial extends THREE.Material {
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
        
        #ifdef USE_COLOR_BAR
          vec4 barDiffuseColor = texture2D(colorBar.map, vec2(vFlow / colorBar.range , 0.5));
          diffuseColor = barDiffuseColor;
        #endif

        #ifdef USE_MAP
          vec2 uv = vUv;
          uv.x = mod(vUv.x * vLineLength, lineWidth) / lineWidth;
          vec4 sampledDiffuseColor = texture2D(map, uv);
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
}
