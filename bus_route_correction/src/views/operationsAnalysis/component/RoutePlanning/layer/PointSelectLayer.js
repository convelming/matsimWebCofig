import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

export const POINT_SELECT_STATE_KEY = {
  DISABLE: 0, // 未开始选择
  ENABLE: 1, // 可以开始选择
};

export const POINT_SELECT_EVENT = {
  POINT_CHANGE: "handle:pointchange", // 状态改变事件
  STATE_CHANGE: "handle:statechange", // 状态改变事件
};

export class PointSelectLayer extends Layer {

  _point = null;
  _size = 100;
  _state = POINT_SELECT_STATE_KEY.DISABLE;
  color = null;

  set point(point) {
    this._point = point;
    try {
      if (this.map) {
        const [x, y] = this.map.WebMercatorToCanvasXY(this._point[0], this._point[1]);
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);
      }
    } catch (error) { }
  }

  get point() {
    return this._point;
  }

  get size() {
    return this._size;
  }

  set size(size) {
    this._size = size;
    this.mesh.scale.set(this.size, this.size, 1)
  }

  set state(state) {
    this._state = state;
    this.handleEventListener(POINT_SELECT_EVENT.STATE_CHANGE, {
      state: this._state,
      point: this._point
    })
  }

  get state() {
    return this._state;
  }

  constructor(opt) {
    super(opt);

    this.texture = new THREE.TextureLoader().load(
      require("@/assets/image/图钉.png")
    );
    const material = new THREE.SpriteMaterial({
      color: opt.color,
      map: this.texture,
      transparent: true,
      sizeAttenuation: true,
    });
    this.mesh = new THREE.Sprite(material);
    this.mesh.center.set(0.5, 0);
    this.scene.add(this.mesh);

    this.size = 100;
    this.point = [0, 0];
    this.color = null;
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      this.point = this._point;
    }
    if (type == MAP_EVENT.HANDLE_CLICK_LEFT) {
      if (this.state == POINT_SELECT_STATE_KEY.ENABLE) {
        this.point = data.webMercatorXY;
        this.handleEventListener(POINT_SELECT_EVENT.POINT_CHANGE, {
          state: this._state,
          point: this._point
        })
      }
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.size = this.map.cameraHeight / 20
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.point = this._point;
    this.size = this.map.cameraHeight / 20;
  }

}