import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

const SIZE = 80;

export class SelectActivityLayer extends Layer {

  color = new THREE.Color(0xffa500);

  scale = 1;
  time = 0;
  center = [0, 0];

  texture = new THREE.TextureLoader().load(require("@/assets/image/point1.png"));

  // 初始化函数
  constructor(opt) {
    super(opt);

    this.scale = opt.scale || this.scale;
    this.color = new THREE.Color(opt.color || this.color);

    this.texture = opt.texture || this.texture;

    this.geometry = new THREE.PlaneGeometry(SIZE, SIZE);
    this.material = new THREE.MeshBasicMaterial({
      depthWrite: false,
      transparent: true,
      map: this.texture,
      color: this.color,
    });
    this.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
          outgoingLight = diffuse.rgb;
          #include <output_fragment>
        `
      );
    };
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  // 监听事件
  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.mesh.position.set(x, y, 0);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      const _scale = this.map.cameraHeight / 1800 * this.scale;
      this.mesh.scale.set(_scale, _scale, _scale);
    }
  }

  // 销毁函数
  dispose() {
    super.dispose();
  }

  // 添加图层
  onAdd(map) {
    super.onAdd(map);
    this.update()
  }

  // 地图渲染刷新
  render() {
    super.render();
  }

  // 更新图层
  update() {
    if (!this.map) return
    if (!this.data) return;
    this.center = [this.data.coord.x, this.data.coord.y];
    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.mesh.position.set(x, y, 0);
    const _scale = this.map.cameraHeight / 1800 * this.scale;
    this.mesh.scale.set(_scale, _scale, _scale);
  }

  // 设置缩放比例
  setScale(scale) {
    this.scale = scale;
    const _scale = this.map.cameraHeight / 1800 * this.scale;
    this.mesh.scale.set(_scale, _scale, _scale);
  }

  // 设置颜色
  setColor(color) {
    this.color = color;
    this.material.setValues({ color: new THREE.Color(this.color) })
    this.material.needsUpdate = true;
  }

  // 设置绘制数据
  setData(data) {
    try {
      this.data = data;
    } catch (error) {
      this.data = null;
    }
    this.update();
  }
}