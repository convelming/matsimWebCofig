import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";

import { Line2 } from "./lines/Line2.js";
import { LineMaterial } from "./lines/LineMaterial.js";
import { LineGeometry } from "./lines/LineGeometry.js";
import { LineSegments2 } from "./lines/LineSegments2.js";
import { LineSegmentsGeometry } from "./lines/LineSegmentsGeometry.js";

const textureLoader = new THREE.TextureLoader();

export class Network3DLayer extends Layer {
  constructor(opt) {
    super(opt);

    this.linkWidth = opt.linkWidth || 1;
    this.linkColor = new THREE.Color(opt.linkColor || "#e8ce79");

    this.nodeSize = opt.nodeSize || 5;
    this.nodeColor = new THREE.Color(opt.nodeColor || "#76819a");
    this.nodeMap = textureLoader.load(require("@/assets/image/point.svg"));

    // 初始化渲染节点需要的资源
    this.nodesMaterial = new THREE.PointsMaterial({
      size: this.nodeSize,
      sizeAttenuation: false,
      color: this.nodeColor,
      opacity: 1,
      transparent: true,
      map: this.nodeMap,
    });
    this.nodesMaterial1 = new THREE.PointsMaterial({
      color: this.pickLayerColor,
      size: this.nodeSize,
      sizeAttenuation: false,
      opacity: 1,
      transparent: true,
      map: this.nodeMap,
    });
    this.nodesMaterial2 = new THREE.PointsMaterial({
      size: this.nodeSize,
      sizeAttenuation: false,
      opacity: 1,
      transparent: true,
      map: this.nodeMap,
      vertexColors: true,
    });

    // 初始化渲染线路需要的资源
    this.linksMaterial = new LineMaterial({
      // color: this.linkColor,
      linewidth: this.linkWidth,
      opacity: 0.8,
      transparent: true,

      vertexColors: true,
    });
    this.linksMaterial1 = new LineMaterial({
      color: this.pickLayerColor,
      linewidth: this.linkWidth,
      opacity: 1,
      transparent: true,
    });

    this.showLink = !!opt.showLink;
    this.showNode = !!opt.showNode;
    this.valueName = opt.valueName || "flow";
    this.colorsFunc =
      opt.colorsFunc ||
      function () {
        return opt.color || "yellow";
      };
  }

  setShowLink(showLink) {
    this.showLink = !!showLink;
    try {
      if (this.showLink) {
        this.scene.add(this.linksMesh);
        this.pickLayerScene.add(this.linksMesh1);
        this.pickMeshScene.add(this.linksMesh2);
      } else {
        this.linksMesh.removeFromParent();
        this.linksMesh1.removeFromParent();
        this.linksMesh2.removeFromParent();
      }

      if (this.map) {
        this.on(MAP_EVENT.UPDATE_CENTER);
      }
    } catch (error) {}
  }

  setShowNode(showNode) {
    this.showNode = !!showNode;
    try {
      if (this.showNode) {
        this.scene.add(this.nodesMesh);
        this.pickLayerScene.add(this.nodesMesh1);
        this.pickMeshScene.add(this.nodesMesh2);
      } else {
        this.nodesMesh.removeFromParent();
        this.nodesPickLayerMesh.removeFromParent();
        this.nodesPickItemMesh.removeFromParent();
      }

      if (this.map) {
        this.on(MAP_EVENT.UPDATE_CENTER);
      }
    } catch (error) {}
  }

  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = new THREE.Color(pickLayerColor);
    this.nodesMaterial1.setValues({ color: pickLayerColor });
    this.nodesMaterial1.needsUpdate = true;
    this.linksMaterial1.setValues({ color: pickLayerColor });
    this.linksMaterial1.needsUpdate = true;
  }

  setColotsFunc(colorsFunc) {
    this.colorsFunc = colorsFunc;
    this.update();
  }

  setNetwork(network) {
    this.network = network;
    this.update();
  }

  clearScene() {
    super.clearScene();
    if (this.nodesMesh) this.nodesMesh.removeFromParent();
    if (this.nodesMesh1) this.nodesMesh1.removeFromParent();
    if (this.nodesMesh2) this.nodesMesh2.removeFromParent();
    if (this.nodesGeometry) this.nodesGeometry.dispose();

    if (this.linksMesh) this.linksMesh.removeFromParent();
    if (this.linksMesh1) this.linksMesh1.removeFromParent();
    if (this.linksMesh2) this.linksMesh2.removeFromParent();
    if (this.linksGeometry) this.linksGeometry.dispose();
    if (this.linksGeometry2) this.linksGeometry2.dispose();
  }

  update() {
    this.clearScene();
    if (!this.network) return;
    const { center, nodes, links } = this.network;
    console.log(center);

    //  点
    // this.nodesMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesMaterial, nodes.size);
    // this.nodesPickLayerMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesPickLayerMaterial, nodes.size);
    // this.nodesPickItemMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesPickItemMaterial, nodes.size);

    this.nodesGeometry = new THREE.BufferGeometry();
    const nodesPoints = [];
    const nodesColors = [];

    let nIndex = 1;
    nodes.forEach((node, key) => {
      ++nIndex;
      const pickColor = new THREE.Color(Number(nIndex));
      nodesPoints.push(node.x - center.x, node.y - center.y, node.z);
      nodesColors.push(pickColor.r, pickColor.g, pickColor.b);
    });
    this.nodesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodesPoints, 3));
    this.nodesGeometry.setAttribute("color", new THREE.Float32BufferAttribute(nodesColors, 3));
    this.nodesMesh = new THREE.Points(this.nodesGeometry, this.nodesMaterial);
    this.nodesMesh1 = new THREE.Points(this.nodesGeometry, this.nodesMaterial1);
    this.nodesMesh2 = new THREE.Points(this.nodesGeometry, this.nodesMaterial2);

    //  线
    let maxValue = 1;
    let minValue = 0;
    let values = [];
    links.forEach((link) => {
      const value = Number(link.attrs[this.valueName] || 0);
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
      values.push(value);
    });
    values = values.map((v) => (v - minValue) / (maxValue - minValue));

    const points = [];
    const colors = [];
    const pickColors = [];
    let iLink = -1;
    links.forEach((link) => {
      points.push(link.fromCoord.x - center.x, link.fromCoord.y - center.y, link.fromCoord.z);
      points.push(link.toCoord.x - center.x, link.toCoord.y - center.y, link.toCoord.z);
      ++nIndex;
      ++iLink;
      if (this.colorsFunc) {
        const colorArray = new THREE.Color(this.colorsFunc(values[iLink])).toArray();
        colors.push(...colorArray);
        colors.push(...colorArray);
      } else {
        colors.push(1, 1, 0);
        colors.push(1, 1, 0);
      }
      const pickColor = new THREE.Color(Number(nIndex)).toArray()
      pickColors.push(...pickColor);
      pickColors.push(...pickColor);
    });

    this.linksGeometry = new LineSegmentsGeometry();
    this.linksGeometry.setPositions(points);
    this.linksGeometry.setColors(colors);
    this.linksMesh = new LineSegments2(this.linksGeometry, this.linksMaterial);
    this.linksMesh.computeLineDistances();
    this.linksMesh1 = new LineSegments2(this.linksGeometry, this.linksMaterial1);
    this.linksMesh1.computeLineDistances();

    this.linksGeometry2 = new LineSegmentsGeometry();
    this.linksGeometry2.setPositions(points);
    this.linksGeometry2.setColors(pickColors);
    this.linksMesh2 = new LineSegments2(this.linksGeometry2, this.linksMaterial2);
    this.linksMesh2.computeLineDistances();

    if (this.showNode) {
      this.scene.add(this.nodesMesh);
      this.pickLayerScene.add(this.nodesMesh1);
      this.pickMeshScene.add(this.nodesMesh2);
    }

    if (this.showLink) {
      this.scene.add(this.linksMesh);
      this.pickLayerScene.add(this.linksMesh1);
      this.pickMeshScene.add(this.linksMesh2);
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
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      const index = data.pickColor - 1;
      this.handleEventListener(type, index);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.on(MAP_EVENT.UPDATE_CENTER);
  }
}

export class Network {
  static fromXml(xml) {
    const dom = new DOMParser().parseFromString(xml, "application/xml");
    const networkDom = dom.getElementsByTagName("network")[0];

    const nodesDom = dom.getElementsByTagName("nodes")[0];
    const linksDom = dom.getElementsByTagName("links")[0];

    const nodes = Array.from(nodesDom.getElementsByTagName("node")).map((item) => NetworkNode.fromXmlNode(item));
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const links = Array.from(linksDom.getElementsByTagName("link")).map((item) => NetworkLink.fromXmlNode(item, nodeMap));
    const linkMap = new Map(links.map((link) => [link.id, link]));
    const center = { x: 0, y: 0 };
    if (nodes[0]) {
      center.x = nodes[0].x;
      center.y = nodes[0].y;
    }
    return new Network({ nodes: nodeMap, links: linkMap, center: center });
  }

  static fromArray(nodes, links, flows = []) {
    const nodeMap = new Map();
    let center = null;
    for (let i = 0; i < nodes.length; i += 3) {
      const x = nodes[i];
      const y = nodes[i + 1];
      const z = nodes[i + 2];
      const id = i / 3;
      const node = new NetworkNode({ id, x, y, z });
      if (center == null) center = { x, y };
      nodeMap.set(id, node);
    }
    const linkMap = new Map();
    for (let i = 0; i < links.length; i += 2) {
      const flow = flows[i] || 0;
      const from = links[i];
      const to = links[i + 1];
      const fromCoord = nodeMap.get(from);
      const toCoord = nodeMap.get(to);
      const id = i / 2;
      const link = new NetworkLink({ id, from, fromCoord, to, toCoord, attrs: { flow: flow } });
      linkMap.set(id, link);
    }
    return new Network({ nodes: nodeMap, links: linkMap, center: center });
  }

  constructor({ nodes, links, center }) {
    this.center = center;
    this.nodes = nodes;
    this.links = links;
  }
}

export class NetworkNode {
  static fromXmlNode(node) {
    const nodeObj = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const name = node.attributes[i].name;
      const value = node.attributes[i].value;
      nodeObj[name] = value;
    }
    return new NetworkNode(nodeObj);
  }

  constructor(opt = {}) {
    this.id = String(opt.id || "");
    const [x, y] = WGS84ToMercator(Number(opt.x || 0), Number(opt.y || 0));
    this.x = Number(x || 0);
    this.y = Number(y || 0);
    this.z = Number(opt.z || 0);
  }

  getPrevByNext(next) {
    const x = this.x * 2 - next.x;
    const y = this.y * 2 - next.y;
    const z = this.z * 2 - next.z;
    return new NetworkNode({ id: new Date().getTime(), x, y, z });
  }

  getNextByPrev(prev) {
    const x = this.x * 2 - prev.x;
    const y = this.y * 2 - prev.y;
    const z = this.z * 2 - prev.z;
    return new NetworkNode({ id: new Date().getTime(), x, y, z });
  }
}

export class NetworkLink {
  static fromXmlNode(node, nodeMap = new Map()) {
    const nodeObj = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const name = node.attributes[i].name;
      const value = node.attributes[i].value;
      nodeObj[name] = value;
    }
    const attrs = {};
    const chlidren = node.getElementsByTagName("attribute");
    for (const chlidNode of chlidren) {
      const name = chlidNode.getAttribute("from");
      const clazz = chlidNode.getAttribute("class");
      const text = chlidNode.textContent;
      attrs[name] = text;
    }
    nodeObj.attrs = attrs;
    nodeObj.fromCoord = nodeMap.get(nodeObj.from);
    nodeObj.toCoord = nodeMap.get(nodeObj.to);
    return new NetworkLink(nodeObj);
  }

  constructor(opt = {}) {
    this.id = String(opt.id || "");
    this.from = String(opt.from || "");
    this.fromCoord = opt.fromCoord || null;
    this.to = String(opt.to || "");
    this.toCoord = opt.toCoord || null;
    this.length = Number(opt.length || 0);
    this.freespeed = Number(opt.freespeed || 0);
    this.capacity = Number(opt.capacity || 0);
    this.permlanes = Number(opt.permlanes || 0);
    this.oneway = Number(opt.oneway || 0);
    this.modes = String(opt.modes || 0);
    this.attrs = opt.attrs;
  }
}
