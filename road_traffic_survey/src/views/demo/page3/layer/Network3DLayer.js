import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
import { getTime } from "@/utils";

export class Network3DLayer extends Layer {
  constructor(opt) {
    super(opt);

    this.selectPinkNodesGeometry = new THREE.CircleGeometry(110, 32);

    this.pinkNodesGeometry = new THREE.CylinderGeometry(80, 80, 80, 32); //new THREE.BoxGeometry(80, 80, 80); //new THREE.PlaneGeometry(100, 100);
    const m4 = new THREE.Matrix4().makeTranslation(0, 0, -30);
    m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    m4.multiply(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
    this.pinkNodesGeometry.applyMatrix4(m4);
    this.pinkNodesMaterial = new THREE.MeshBasicMaterial({ opacity: 1, transparent: true, map: new THREE.TextureLoader().load(require("../data/停机坪.svg")) });
    this.pinkNodesPickLayerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    this.pinkNodesPickItemMaterial = new THREE.MeshBasicMaterial({});

    this.nodesGeometry = new THREE.BoxGeometry(5, 5, 5);
    this.nodesMaterial = new THREE.MeshBasicMaterial({ color: opt.color || "yellow", opacity: 0.5, transparent: true });
    this.nodesPickLayerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.nodesPickItemMaterial = new THREE.MeshBasicMaterial({});

    this.linksGeometry = new THREE.BufferGeometry();
    this.linksMaterial = new THREE.LineBasicMaterial({ color: opt.color || "yellow", opacity: 0.1, transparent: true });

    this.showLink = !!opt.showLink;
    this.showNode = !!opt.showNode;
  }

  setShowLink(showLink) {
    this.showLink = !!showLink;
    try {
      if (this.showLink) {
        this.scene.add(this.linksMesh);
      } else {
        this.linksMesh.removeFromParent();
      }
    } catch (error) {}
  }

  setShowNode(showNode) {
    this.showNode = !!showNode;
    try {
      if (this.showNode) {
        this.scene.add(this.nodesMesh);
      } else {
        this.nodesMesh.removeFromParent();
      }
    } catch (error) {}
  }

  setPickLayerColor(pickLayerColor) {
    console.log("pickLayerColor", pickLayerColor);

    this.pickLayerColor = new THREE.Color(pickLayerColor);
    this.nodesPickLayerMaterial.setValues({ color: pickLayerColor });
    this.nodesPickLayerMaterial.needsUpdate = true;
    this.pinkNodesPickLayerMaterial.setValues({ color: pickLayerColor });
    this.pinkNodesPickLayerMaterial.needsUpdate = true;
  }
  
  setNetwork(network) {
    this.network = network;
    this.pinkNodes = []; // ["n11978", "n12951", "n15905", "n1800", "n22086", "n4782"].map((v) => ({ id: v, ...(nodeMap[v] || {}) }));
    this.update();
  }

  setTifImage(tifImage) {
    this.tifImage = tifImage;
  }

  clearScene() {
    super.clearScene();
    if (this.pinkNodesMesh) this, this.pinkNodesMesh.removeFromParent();
    if (this.pinkNodesPickLayerMesh) this, this.pinkNodesPickLayerMesh.removeFromParent();
    if (this.pinkNodesPickItemMesh) this, this.pinkNodesPickItemMesh.removeFromParent();
    if (this.nodesMesh) this, this.nodesMesh.removeFromParent();
    if (this.nodesPickLayerMesh) this, this.nodesPickLayerMesh.removeFromParent();
    if (this.nodesPickItemMesh) this, this.nodesPickItemMesh.removeFromParent();

    if (this.linksGeometry) {
      this.linksGeometry.dispose();
      this.linksGeometry = null;
    }
  }

  update() {
    this.clearScene();
    if (!this.network) return;
    const { center, nodes, links } = this.network;

    // 全部起/降点
    this.pinkNodesMesh = new THREE.InstancedMesh(this.pinkNodesGeometry, this.pinkNodesMaterial, this.pinkNodes.length);
    this.pinkNodesPickLayerMesh = new THREE.InstancedMesh(this.pinkNodesGeometry, this.pinkNodesPickLayerMaterial, this.pinkNodes.length);
    this.pinkNodesPickItemMesh = new THREE.InstancedMesh(this.pinkNodesGeometry, this.pinkNodesPickItemMaterial, this.pinkNodes.length);
    for (const index in this.pinkNodes) {
      const pickColor = new THREE.Color(1 + Number(index));

      const node = this.pinkNodes[index];

      const matrix4 = new THREE.Matrix4().makeTranslation(node.x - center.x, node.y - center.y, node.z);

      this.pinkNodesMesh.setMatrixAt(index, matrix4);
      if (this.startPink && node.id == this.startPink.id) {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#f4ea2a"));
      } else if (this.endPink && node.id == this.endPink.id) {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#409eff"));
      } else {
        this.pinkNodesMesh.setColorAt(index, new THREE.Color("#1afa29"));
      }
      this.pinkNodesPickLayerMesh.setMatrixAt(index, matrix4);
      this.pinkNodesPickItemMesh.setMatrixAt(index, matrix4);

      this.pinkNodesPickItemMesh.setColorAt(index, pickColor);
    }

    if (this.pinkNodesMesh.instanceMatrix) this.pinkNodesMesh.instanceMatrix.needsUpdate = true;
    if (this.pinkNodesMesh.instanceColor) this.pinkNodesMesh.instanceColor.needsUpdate = true;
    if (this.pinkNodesPickLayerMesh.instanceMatrix) this.pinkNodesPickLayerMesh.instanceMatrix.needsUpdate = true;
    if (this.pinkNodesPickItemMesh.instanceMatrix) this.pinkNodesPickItemMesh.instanceMatrix.needsUpdate = true;

    if (this.pinkNodesPickItemMesh.instanceColor) this.pinkNodesPickItemMesh.instanceColor.needsUpdate = true;

    //  点
    this.nodesMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesMaterial, nodes.size);
    this.nodesPickLayerMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesPickLayerMaterial, nodes.size);
    this.nodesPickItemMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesPickItemMaterial, nodes.size);

    let nIndex = 0;
    nodes.forEach((node, key) => {
      nIndex++;
      const pickColor = new THREE.Color(1 + Number(nIndex));
      const matrix4 = new THREE.Matrix4().makeTranslation(node.x - center.x, node.y - center.y, node.z);

      this.nodesMesh.setMatrixAt(nIndex, matrix4);
      this.nodesPickLayerMesh.setMatrixAt(nIndex, matrix4);
      this.nodesPickItemMesh.setMatrixAt(nIndex, matrix4);

      this.nodesPickItemMesh.setColorAt(nIndex, pickColor);
    });
    if (this.nodesMesh.instanceMatrix) this.nodesMesh.instanceMatrix.needsUpdate = true;
    if (this.nodesPickLayerMesh.instanceMatrix) this.nodesPickLayerMesh.instanceMatrix.needsUpdate = true;
    if (this.nodesPickItemMesh.instanceMatrix) this.nodesPickItemMesh.instanceMatrix.needsUpdate = true;

    if (this.nodesPickItemMesh.instanceColor) this.nodesPickItemMesh.instanceColor.needsUpdate = true;

    //  线
    const points = [];
    links.forEach((link) => {
      points.push(new THREE.Vector3(link.fromCoord.x - center.x, link.fromCoord.y - center.y, link.fromCoord.z));
      points.push(new THREE.Vector3(link.toCoord.x - center.x, link.toCoord.y - center.y, link.toCoord.z));
    });
    this.linksGeometry = new THREE.BufferGeometry().setFromPoints(points);
    this.linksMesh = new THREE.LineSegments(this.linksGeometry, this.linksMaterial);

    this.scene.add(this.pinkNodesMesh);
    this.pickLayerScene.add(this.pinkNodesPickLayerMesh);
    this.pickMeshScene.add(this.pinkNodesPickItemMesh);

    if (this.showNode) this.scene.add(this.nodesMesh);
    // this.pickLayerScene.add(this.nodesPickLayerMesh);
    // this.pickMeshScene.add(this.nodesPickItemMesh);

    if (this.showLink) this.scene.add(this.linksMesh);
    
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
      this.handleEventListener(type, this.pinkNodes[index] || null);
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
  }
}
