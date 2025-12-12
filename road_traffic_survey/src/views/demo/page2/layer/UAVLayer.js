import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
import { Vector3 } from "three";

const loader = new STLLoader();

export class UAVLayer extends Layer {
  name = "UAVLayer";
  path = null;
  time = 0;
  step = 10;
  lockSelect = false;

  constructor(opt) {
    super(opt);

    this.nodesGeometry = new THREE.BoxGeometry(20, 20, 20);
    this.nodesMaterial = new THREE.MeshBasicMaterial({ color: "red", opacity: 0.5, transparent: true });

    this.linksGeometry = new THREE.BufferGeometry();
    this.linksMaterial = new THREE.LineBasicMaterial({ color: "red", opacity: 0.5, transparent: true });

    this.UAVMesh = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), new THREE.MeshNormalMaterial());

    this.UAVScene = new THREE.Group();
    this.UAVScene.add(this.UAVMesh);

    loader.load(process.env.VUE_APP_BASE_API + "/models/无人机.stl", (geometry) => {
      this.UAVScene.remove(this.UAVMesh);
      this.UAVMesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
      this.UAVMesh.scale.set(1, 1, 1);
      this.UAVScene.add(this.UAVMesh);
      this.updateUAV();
    });
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER && this.path) {
      const [x, y] = this.map.WebMercatorToCanvasXY(this.path.center.x, this.path.center.y);
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
    this.updatePath();
    this.updateUAV();
  }

  render() {
    super.render();
  }

  play() {
    if (this._interval) clearInterval(this._interval);
    if (!this.path) return;
    this._interval = setInterval(() => {
      this.time += this.step / 60;
      this.updateUAV();
      if (this.time >= this.path.time) {
        this.stop();
      }
    }, 1000 / 60);
  }

  stop() {
    clearInterval(this._interval);
  }

  reset() {
    this.stop();
    this.time = 0;
    this.updateUAV();
  }

  setPath(path) {
    this.path = new PathCurve(path);
    this.updatePath();
    this.updateUAV();
  }

  updatePath() {
    if (this.nodesMesh) {
      this.nodesMesh.removeFromParent();
      this.nodesMesh.dispose();
      this.nodesMesh = null;
    }
    if (this.linksMesh) {
      this.linksMesh.removeFromParent();
      this.linksMesh = null;
    }
    if (this.linksGeometry) {
      this.linksGeometry.dispose();
      this.linksGeometry = null;
    }

    if (!this.path) return;
    this.nodesMesh = new THREE.InstancedMesh(this.nodesGeometry, this.nodesMaterial, this.path.nodes.length);
    for (const index in this.path.nodes) {
      const node = this.path.nodes[index];
      const matrix4 = new THREE.Matrix4().makeTranslation(node.v.x, node.v.y, node.v.z);
      this.nodesMesh.setMatrixAt(index, matrix4);
      // this.nodesMesh.setColorAt(index, new THREE.Color("#fff"));
    }
    if (this.nodesMesh.instanceMatrix) this.nodesMesh.instanceMatrix.needsUpdate = true;
    // if (this.nodesMesh.instanceColor) this.nodesMesh.instanceColor.needsUpdate = true;

    this.linksGeometry = new THREE.TubeGeometry(this.path, this.path.nodes.length * 10, 5, 8, false);
    this.linksMesh = new THREE.Mesh(this.linksGeometry, this.linksMaterial);

    if (this.map) {
      const [x, y] = this.map.WebMercatorToCanvasXY(this.path.center.x, this.path.center.y);
      this.nodesMesh.position.set(x, y, 0);
      this.linksMesh.position.set(x, y, 0);
    }
    this.scene.add(this.nodesMesh);
    this.scene.add(this.linksMesh);
  }

  updateUAV() {
    if (this.path) {
      const { point, speed, dir } = this.path.getPointByTime(this.time);
      this.UAVMesh.position.copy(point);
      if (this.map) {
        const [x, y] = this.map.WebMercatorToCanvasXY(this.path.center.x, this.path.center.y);
        this.UAVScene.position.set(x, y, 0);
      }
      if (this.lockSelect && this.map) {
        this.map.setCenter([point.x + this.path.center.x, point.y + this.path.center.y]);
        this.map.setCameraHeight(point.z + 500);
        this.map.setPitchAndRotation((Math.atan((point.z + 500) / 1000) * 180) / Math.PI);
      }
      this.scene.add(this.UAVScene);
      this.handleEventListener("playing", {
        x: point.x + this.path.center.x,
        y: point.y + this.path.center.y,
        z: point.z,
        time: this.time,
        speed: speed,
      });
    } else {
      this.UAVScene.removeFromParent();
    }
  }
}

class PathCurve extends THREE.Curve {
  dis = 0;
  time = 0;
  nodes = [];
  center = new THREE.Vector2();

  constructor(nodes) {
    super();
    this.setNodes(nodes);
  }

  setNodes(nodes) {
    const center = new THREE.Vector2(nodes[0][0], nodes[0][1]);
    const list = [];
    let dis = 0;
    for (let i = 0; i < nodes.length; i++) {
      let [x, y, z, t] = nodes[i];
      const v = new THREE.Vector3(x - center.x, y - center.y, z);
      if (i > 0) {
        dis += v.distanceTo(list[i - 1].v);
      }
      list.push({
        v: v,
        t: t,
        d: dis,
      });
    }
    this.center = center;
    this.nodes = list;
    this.dis = dis;
    this.time = list[list.length - 1].t;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const dis = t * this.dis;
    if (dis == 0) {
      const poi = this.nodes[0].v;
      return optionalTarget.set(poi.x, poi.y, poi.z);
    }
    for (let i = 0; i < this.nodes.length; i++) {
      const point = this.nodes[i];
      if (point.d >= dis) {
        const sp = this.nodes[i - 1];
        const ep = this.nodes[i];
        const p = (dis - sp.d) / (ep.d - sp.d);
        const poi = new THREE.Vector3().lerpVectors(sp.v, ep.v, p);
        return optionalTarget.set(poi.x, poi.y, poi.z);
      }
    }
    return optionalTarget.set(0, 0, 0);
  }

  getPointByTime(time) {
    if (this.nodes.length == 0) {
      return {
        point: new THREE.Vector3(),
        speed: 0,
        dir: new THREE.Vector3(),
      };
    } else if (time == 0) {
      return {
        point: this.nodes[0].v,
        speed: 0,
        dir: this.nodes[0].v,
      };
    } else if (time >= this.time) {
      return {
        point: this.nodes[this.nodes.length - 1].v,
        speed: 0,
        dir: this.nodes[this.nodes.length - 1].v,
      };
    }
    for (let i = 0; i < this.nodes.length; i++) {
      const point = this.nodes[i];
      if (point.t >= time) {
        const sp = this.nodes[i - 1];
        const ep = this.nodes[i];
        const p = (time - sp.t) / (ep.t - sp.t);
        const poi = new THREE.Vector3().lerpVectors(sp.v, ep.v, p);
        return {
          point: poi,
          speed: (ep.d - sp.d) / (ep.t - sp.t),
          dir: poi,
        };
      }
    }
  }
}
