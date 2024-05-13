import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";

export class RouteFlowsLayer extends Layer {
  maxTube = 100;
  color = 0x00ff00;
  opacity = 1;
  geometryList = [];
  pickMeshMaterialList = [];

  data = [];
  stopList = [];

  texture = new THREE.TextureLoader().load(require("@/assets/image/point.png"));

  constructor(opt) {
    super(opt);
    this.color = opt.color || this.color;
    this.maxTube = opt.maxTube || this.maxTube;
    this.opacity = opt.opacity || this.opacity;

    this.material = new THREE.MeshLambertMaterial({ color: this.color });
    this.pickLayerMaterial = new THREE.MeshBasicMaterial({ color: this.pickLayerColor });
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      this.handleEventListener(type);
    }
  }

  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = pickLayerColor;
    this.pickLayerMaterial.setValues({ color: this.pickLayerColor });
    this.pickLayerMaterial.needsUpdate = true;
  }

  setColor(color) {
    this.color = color;
    this.material.setValues({ color: this.color });
    this.material.needsUpdate = true;
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    this.material.setValues({ opacity: this.opacity });
    this.material.needsUpdate = true;
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  setData(stops, data, maxValue) {
    try {
      const _data = [];
      let pickColorNum = 1;
      for (const value of Object.values(data)) {
        const fromStop = stops.get(value.targetId);
        const toStop = stops.get(value.sourceId);
        if (fromStop && toStop && value.value > 0) {
          const fromPoint = new THREE.Vector3(fromStop.x, fromStop.y, 0);
          const toPoint = new THREE.Vector3(toStop.x, toStop.y, 0);
          const distance = fromPoint.distanceTo(toPoint);
          const center = [(fromPoint.x + toPoint.x) / 2, (fromPoint.y + toPoint.y) / 2];
          const vector = new THREE.Vector3().subVectors(fromPoint, toPoint).angleTo(new THREE.Vector3(1, 0, 0));
          const item = {
            pickColor: new THREE.Color(++pickColorNum),
            fromStop: stops.get(value.targetId),
            toStop: stops.get(value.sourceId),
            value: value.value / maxValue,
            distance: distance,
            center: center,
            vector: vector,
          };
          _data.push(item);
        }
      }
      this.data = _data;
      this.update();
    } catch (error) {
      this.data = [];
      this.update();
    }
  }

  clearScene() {
    super.clearScene();
    this.geometryList.forEach((v) => v.dispose());
    this.geometryList.length = 0;
    this.geometryList = [];
    this.pickMeshMaterialList.forEach((v) => v.dispose());
    this.pickMeshMaterialList.length = 0;
    this.pickMeshMaterialList = [];
  }

  update() {
    this.clearScene();
    if (!this.map) return;
    if (this.data) {
      for (const value of this.data) {
        const [x, y] = this.map.WebMercatorToCanvasXY(value.center[0], value.center[1]);
        const geometry = new THREE.TorusGeometry(value.distance / 2, value.value * this.maxTube, 16, 100, Math.PI);
        this.geometryList.push(geometry);

        const mesh = new THREE.Mesh(geometry, this.material);
        mesh.rotateX(Math.PI / 2);
        mesh.rotateY(value.vector);
        mesh.position.set(x, y, 0);
        mesh.userData.center = value.center;
        this.scene.add(mesh);

        const pickLayerMesh = new THREE.Mesh(geometry, this.pickLayerMaterial);
        pickLayerMesh.rotateX(Math.PI / 2);
        pickLayerMesh.rotateY(value.vector);
        pickLayerMesh.position.set(x, y, 0);
        pickLayerMesh.userData.center = value.center;
        this.pickLayerScene.add(pickLayerMesh);

        const pickMeshMaterial = new THREE.MeshBasicMaterial({ color: value.pickColor });
        this.pickMeshMaterialList.push(this.pickLayerMaterial);
        const pickMesh = new THREE.Mesh(geometry, pickMeshMaterial);
        pickMesh.rotateX(Math.PI / 2);
        pickMesh.rotateY(value.vector);
        pickMesh.position.set(x, y, 0);
        pickMesh.userData.center = value.center;
        this.pickMeshScene.add(pickMesh);
      }
    }
  }
}
