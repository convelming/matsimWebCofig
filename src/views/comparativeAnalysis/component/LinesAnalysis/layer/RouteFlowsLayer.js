import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import { getTextImage } from "@/mymap/utils/index";

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

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
      })
    );
    this.labelMesh.center.set(0.5, -0.5);
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
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE_PICK) {
      let labelData = null;
      if (data.layerId == this.id) {
        const pickColor = new THREE.Color(data.pickColor);
        const item = this.data.find((v2) => v2.pickColor.equals(pickColor));
        if (item) {
          if (this.labelData && item.pickColor.equals(this.labelData.pickColor)) {
            labelData = this.labelData;
          } else {
            if (this.labelData) this.labelData.map.dispose();
            labelData = {};
            const { url, width, height } = getTextImage(`${item.key}: ${item.value}`);
            const texture = new THREE.TextureLoader().load(url);
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            labelData.map = texture;
            labelData.mapWidth = width;
            labelData.mapHeight = height;
            labelData.x = item.center[0];
            labelData.y = item.center[1];
            labelData.height = item.distance / 2;
            labelData.pickColor = item.pickColor;
          }
        }
      }
      this.labelData = labelData;
      this.updateLabel();
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
        const fromStop = stops.get(value.sourceId);
        const toStop = stops.get(value.targetId);
        if (fromStop && toStop && value.value > 0) {
          const fromPoint = new THREE.Vector3(fromStop.x, fromStop.y, 0);
          const toPoint = new THREE.Vector3(toStop.x, toStop.y, 0);
          const distance = fromPoint.distanceTo(toPoint);
          const center = [(fromPoint.x + toPoint.x) / 2, (fromPoint.y + toPoint.y) / 2];
          const vector = new THREE.Vector2(toStop.x - fromStop.x, toStop.y - fromStop.y).angle();
          const item = {
            key: `${fromStop.name} - ${toStop.name}`,
            pickColor: new THREE.Color(++pickColorNum),
            fromStop: stops.get(value.sourceId),
            toStop: stops.get(value.targetId),
            value: value.value,
            proportion: value.value / maxValue,
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
      console.log(error);
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
        const geometry = new THREE.TorusGeometry(value.distance / 2, value.proportion * this.maxTube, 16, 100, Math.PI);
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

  updateLabel() {
    if (!this.labelData) {
      this.scene.remove(this.labelMesh);
    } else {
      this.labelMesh.material.setValues({ map: this.labelData.map });
      this.labelMesh.material.needsUpdate = true;
      const scale = this.map.cameraHeight / 2000;
      this.labelMesh.scale.set(this.labelData.mapWidth * scale, this.labelData.mapHeight * scale, 1);
      const [x, y] = this.map.WebMercatorToCanvasXY(this.labelData.x, this.labelData.y);
      this.labelMesh.position.set(x, y, this.labelData.height);
      this.scene.add(this.labelMesh);
    }
  }
}
