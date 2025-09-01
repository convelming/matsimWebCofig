import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

export class BackLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.center = opt.center || [0, 0];
    this.width = opt.width || 100;
    this.height = opt.height || opt.width || 100;
    this.opacity = opt.opacity || 1;
    this.image = opt.image || null;

    this.loader = new THREE.TextureLoader();
    this.geometry = new THREE.PlaneGeometry(100, 100);
    this.material = new THREE.MeshBasicMaterial({
      map: this.loader.load(this.image),
      transparent: true,
      opacity: this.opacity,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setImage(image) {
    this.image = image;
    this.material.setValues({ map: this.loader.load(this.image) });
    this.material.needsUpdate = true;
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    this.material.setValues({ opacity: this.opacity });
    this.material.needsUpdate = true;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.update();
  }
  setCenter(center = [0, 0]) {
    this.center = center;
    this.update();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_RENDERER_SIZE || type == MAP_EVENT.UPDATE_CAMERA_HEIGHT || type == MAP_EVENT.UPDATE_CENTER) {
      this.update();
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  update() {
    if (!this.map) return;

    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    const scaleX = this.width / 100;
    const scaleY = this.height / 100;

    this.mesh.scale.set(scaleX, scaleY, 1);
    this.mesh.position.set(x, y, 0);
  }
}
