import { Layer, MAP_EVENT, OutlineLayer, SCENE_MAP } from "@/mymap";
import * as THREE from "three";
import { ColorBar2D } from "@/mymap/utils/ColorBar2D.v2"


export class LinkFlowLayer extends Layer {
  color = 0x0000ff;
  height = 100;
  colorBar = [];
  constructor(opt) {
    super(opt);
    this.height = opt.height || this.height;
    this.timeRange = opt.timeRange;
    console.log(opt.colorBar);

    this.colorBar = new ColorBar2D(opt.colorBar || []);

    this.material = new THREE.LineBasicMaterial({
      vertexColors: true
    });
  }

  setTimeRange(timeRange) {
    this.timeRange = timeRange;
    this.update();
  }

  setHeight(height) {
    this.height = height;
    for (const mesh of this.meshList || []) {
      mesh.scale.set(1, 1, this.height / 100);
    }
  }

  setColorBar(colorBar) {
    this.colorBar = new ColorBar2D(colorBar);
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
    console.log(data);

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
    console.log("update");

    this.clearScene();
    if (!this.map) return;
    if (!this.data) return;

    const { link, legs } = this.data;

    // const geoList = new Array(legs.length).fill(null);
    const { center, fromCoord, toCoord } = link;
    const linkCenter = [center.x, center.y];
    const meshList = [];
    for (let i = 0, l = legs.length; i < l; i++) {
      const { offset, coords } = legs[i];
      if (this.timeRange) {
        try {
          const [start, end] = this.timeRange;
          const value = coords[0][2];
          if (value < start || value > end) continue;
        } catch (error) { }
      }
      const points = coords.map((v) => new THREE.Vector3(v[0], v[1], v[2] / 60));
      const colors = coords.map((v) => new THREE.Color(this.colorBar.getColor(v[3])).toArray());

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
