import { Layer, MAP_EVENT, OutlineLayer, SCENE_MAP } from "@/mymap";
import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

export class RegionalTrafficFlowLayer extends Layer {
  color = 0x0000ff;
  height = 100;
  colorBar = [];
  constructor(opt) {
    super(opt);
    this.color = opt.color || this.color;
    this.height = opt.height || this.height;
    this.colorBar = opt.colorBar || [];

    this.material = new THREE.LineBasicMaterial({
      // color: this.color,
      vertexColors: true
    });
  }

  setHeight(height) {
    this.height = height;
    for (const mesh of this.meshList) {
      mesh.scale.set(1, 1, this.height / 100);
    }
  }

  setColor(color) {
    this.color = color;
    // this.material.setValues({ color: color });
    // this.material.needsUpdate = true;
  }
  setColorBar(colorBar) {
    this.colorBar = colorBar;
    this.update();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  render() {
    super.render();
  }

  setData(data) {
    this.data = data;
    this.update();
  }
  clearScene() {
    super.clearScene();
    if (this.meshList && this.meshList.length) {
      this.meshList.forEach((v) => v.geometry.dispose());
      this.meshList = [];
    }
  }

  update() {
    this.clearScene();
    if (!this.map) return;
    if (!this.data) return;

    const { link, legs } = this.data;
    const speed = 1 / this.colorBar.length;

    // const geoList = new Array(legs.length).fill(null);
    const { center, fromCoord, toCoord } = link;
    const linkCenter = [center.x, center.y];
    const meshList = [];
    for (let i = 0, l = legs.length; i < l; i++) {
      const { offset, coords } = legs[i];

      const points = coords.map((v) => new THREE.Vector3(v[0], v[1], v[2] / 60));
      const colors = coords.map((v) => new THREE.Color(this.colorBar[Math.floor(v[3] / speed)] || this.colorBar[0]).toArray());

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors.flat(), 3));
      const mesh = new THREE.Line(geometry, this.material);

      const [x, y] = this.map.WebMercatorToCanvasXY(...linkCenter);
      mesh.position.set(x, y, 0);
      mesh.scale.set(1, 1, this.height / 100);
      mesh.userData.center = linkCenter;

      mesh.layers.enable(SCENE_MAP.BLOOM_SCENE);
      meshList.push(mesh);
      this.scene.add(mesh);
    }
    this.meshList = meshList;
    console.timeEnd("update");
  }

}
