import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils"


const loader = new STLLoader();

export class UAVLayer extends Layer {
  name = "UAVLayer";
  path = [];
  time = 10;
  canRender = false;

  lockSelect = true;
  modelSize = 1;

  constructor(opt) {
    super(opt);
    this.lockSelect = opt.lockSelect || this.lockSelect;
    this.modelSize = opt.modelSize || this.modelSize;
    this.group = new THREE.Group();

    const geometry = new THREE.ConeGeometry(22, 40, 4);
    geometry.rotateY(45 / 180 * Math.PI).rotateX(90 / 180 * Math.PI);
    geometry.scale(1.6, 1, 0.9);
    geometry.translate(0, 0, -18);

    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true, });
    const cylinder = new THREE.Mesh(geometry, material);
    this.group.add(cylinder);

    // 创建材质并设置描边
    var material2 = new THREE.MeshBasicMaterial({
      color: 0xffffff, 
      wireframe: true, 
      wireframeLinewidth: 4 
    });
    var cube = new THREE.Mesh(geometry, material2);
    this.group.add(cube);

    loader.load(process.env.VUE_APP_BASE_API + "/models/无人机.stl", geometry => {
      const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
      this.group.add(mesh);
      this.update();
    })
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      this.update()
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  render() {
    super.render();
  }

  update() {
    if (!this.canRender || !this.group) {
      if (this.group) this.group.removeFromParent();
      return;
    }
    if (this.group.parent != this.scene && this.group) this.scene.add(this.group);

    if (!this.map) return;

    const { time, path } = this;

    if (time <= path[0].time || time >= path[path.length - 1].time) {
      if (this.group) this.group.removeFromParent();
    } else {
      for (let i = 0; i < path.length; i++) {
        const line_startTime = path[i].time;
        const line_endTime = path[i + 1].time;
        if (line_startTime <= time && time < line_endTime) {
          let line_start = path[i].point;
          let line_end = path[i + 1].point;
          let percentage = (time - line_startTime) / (line_endTime - line_startTime);

          let _i = i;
          while (line_start[0] == line_end[0] && line_start[1] == line_end[1] && _i < path.length) {
            line_end = path[++_i].point;
            percentage = 0;
          }
          _i = i;
          while (line_start[0] == line_end[0] && line_start[1] == line_end[1] && _i >= 0) {
            line_end = path[--_i].point;
            percentage = 0;
          }
          if (_i < i) {
            line_end[0] = line_end[0] * 2 - line_start[0];
            line_end[1] = line_end[1] * 2 - line_start[1];
          }
          if (percentage > 0) {
            let x = line_start[0] + (line_end[0] - line_start[0]) * percentage;
            let y = line_start[1] + (line_end[1] - line_start[1]) * percentage;
            let z = line_start[2] + (line_end[2] - line_start[2]) * percentage;
            line_start = [x, y, z];
          }

          if (this.lockSelect && this.map) {
            this.map.setCenter([line_start[0], line_start[1]]);
            console.log(this.map.center, this.map.zoom, this.map.cameraRotation);
            try {
              const px = line_end[0] - line_start[0];
              const pz = line_end[1] - line_start[1];
              let rotation = Math.atan(px / pz);
              if (px >= 0 && pz >= 0) {
                rotation = rotation;
              } else if (px >= 0 && pz < 0) {
                rotation = Math.PI + rotation;
              } else if (px < 0 && pz < 0) {
                rotation = Math.PI + rotation;
              } else if (px < 0 && pz >= 0) {
                rotation = Math.PI * 2 + rotation;
              }
              console.log((-rotation * 180 / Math.PI) || 0);
              this.map.setPitchAndRotation(undefined, (2 * Math.PI - rotation * 180 / Math.PI) || 0)
            } catch (error) {
              console.log(error);
            }
          }

          const line_start_map = this.map.WebMercatorToCanvasXY(line_start[0], line_start[1]);
          const line_end_map = this.map.WebMercatorToCanvasXY(line_end[0], line_end[1]);

          const position = new THREE.Vector3(line_start_map[0], line_start_map[1], line_start[2]);
          const target = new THREE.Vector3(line_end_map[0], line_end_map[1], line_start[2]);
          const m4 = new THREE.Matrix4().lookAt(position, target, new THREE.Vector3(0, 0, 1));
          m4.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

          const scale = this.modelSize * 10;
          this.group.scale.set(scale, scale, scale);
          this.group.position.set(line_start_map[0], line_start_map[1], line_start[2]);
          this.group.quaternion.setFromRotationMatrix(m4);
          break
        }
      }
    }
  }


  setModelSize(modelSize) {
    this.modelSize = modelSize;
    this.update()
  }

  setData(data) {
    try {
      let perv = null;
      let lookAtPerv = null;
      let dispose = 0;
      let lookAtDispose = 0;

      const path = data.track.map(({ point, lookAt, time }) => {
        const [x1, y1] = WGS84ToMercator(point[0], point[1]);
        const [x2, y2] = WGS84ToMercator(lookAt[0], lookAt[1]);

        perv = [time, x1, y1]
        lookAtPerv = [time, x2, y2]

        const d1 = Math.sqrt(Math.pow(x1 - perv[1], 2) + Math.pow(y1 - perv[2], 2));
        dispose += d1;

        const d2 = Math.sqrt(Math.pow(x2 - lookAtPerv[1], 2) + Math.pow(y2 - lookAtPerv[2], 2));
        lookAtDispose += d2;


        return {
          time: time,
          point: [x1, y1, point[2]],
          lookAt: [x2, y2, lookAt[2]],
          dispose: dispose,
          lookAtDispose: lookAtDispose
        }
      });
      this.path = path;
      this.canRender = true;
      this.update();

    } catch (error) {
      console.log(error);
      this.path = [];
      this.canRender = false;
    }
  }

  setTime(time) {
    if (this._changeTimeout || Math.abs(this.time - time) < 0.001) return;
    this._changeTimeout = setTimeout(() => {
      this.time = Number(time.toFixed(4));
      if (this.canRender) this.update();
      this._changeTimeout = null;
    }, 1000 / 60);
  }
}
