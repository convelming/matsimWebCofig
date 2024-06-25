import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { BuildGeometry } from "./Build3DLayer"

export class SelectBuild3DLayer extends Layer {
  name = "SelectBuild3DLayer";
  buildColor = "#ff4500";
  buildOpacity = 0.8;

  loadingNum = 0;

  constructor(opt) {
    super(opt);
    this.buildColor = opt.buildColor || this.buildColor;
    this.buildOpacity = opt.buildOpacity || this.buildOpacity;

    this.material = new THREE.MeshBasicMaterial({
      color: this.buildColor,
      opacity: this.buildOpacity,
      transparent: true,
      // polygonOffset: true,
      // polygonOffsetFactor: -1,
      // polygonOffsetUnits: -1
    });

    this.geometry = new THREE.BufferGeometry();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }


  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const center = this.mesh.userData.center || [0, 0];
      const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);
      this.mesh.position.set(x, y, 0);
    }

    if (type == MAP_EVENT.UPDATE_CAMERA_ROTATE) {
      const { newPitch } = data;
      const show3D = newPitch <= 80;
      if (this.show3D != show3D) {
        this.show3D = show3D;
        if (this.show3D) {
          this.mesh.scale.set(1.01, 1.01, 1.01);
        } else {
          this.mesh.scale.set(1, 1, 0.000001);
        }
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    const { pitch } = map;
    const show3D = pitch <= 80;
    if (this.show3D != show3D) {
      this.show3D = show3D;
      if (this.show3D) {
        this.mesh.scale.set(1.01, 1.01, 1.01);
      } else {
        this.mesh.scale.set(1, 1, 0.000001);
      }
    }
    this.update();
  }

  render() {
    super.render();
  }

  setBuildColor(buildColor) {
    this.buildColor = buildColor;
    this.material.setValues({ color: buildColor });
    this.material.needsUpdate = true;
  }

  setBuildOpacity(buildOpacity) {
    this.buildOpacity = buildOpacity;
    this.material.setValues({ opacity: buildOpacity });
    this.material.needsUpdate = true;
  }

  async update() {
    this.clearScene();
    if (!this.map) return
    if (!this.data) return
    const { coordinates, coord, height } = this.data
    const center = [coord.x, coord.y]
    const _coordinates = coordinates.map(v => v.map(v2 => [v2[0] - center[0], v2[1] - center[1]]))
    const shapes = [
      {
        points: _coordinates[0],
        holes: _coordinates.slice(1),
      },
    ];
    this.geometry = new BuildGeometry({ shapes, height: height });
    this.mesh.geometry = this.geometry;
    this.mesh.needsUpdate = true;
    this.mesh.userData.center = center;

    const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);
    this.mesh.position.set(x, y, 0);
    this.scene.add(this.mesh);
  }

  dispose() {
    this.material.dispose();
  }

  setData(data) {
    this.data = data;
    this.update()
    console.log(data);
  }
}
