import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

export const LINK_STATE_KEY = {
  DISABLE: 0, // 禁用
  CAN_START: 1, // 可以开始
  IN_PROGREES: 2, // 进行中的
  ENDED: 3, // 结束
};

export const LINK_EVENT = {
  STATE_CHANGE: "handle:statechange", // 状态改变事件
};

export class LinkLayer extends Layer {
  name = "LinkLayer";
  color = 0x409eff;

  state = LINK_STATE_KEY.DISABLE;
  startPoint = [0, 0];
  endPoint = [0, 0];

  constructor(opt) {
    super(opt);
    this.color = new THREE.Color(opt.color || this.color);

    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.color),
    });
    this.geometry = new THREE.BufferGeometry();
    this.mesh = new THREE.Line(this.geometry, this.material);
  }

  on(type, data) {
    if (type == MAP_EVENT.HANDLE_MOUSE_LEFT_DOWN) {
      if (
        this.state == LINK_STATE_KEY.CAN_START ||
        this.state == LINK_STATE_KEY.ENDED
      ) {
        this.startPoint = data.webMercatorXY;
        this.endPoint = data.webMercatorXY;
        this.state = LINK_STATE_KEY.IN_PROGREES;
        this.update();
        this.scene.add(this.mesh);
        this.handleStateChange();
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_LEFT_UP) {
      if (this.state == LINK_STATE_KEY.IN_PROGREES) {
        this.endPoint = data.webMercatorXY;
        this.state = LINK_STATE_KEY.ENDED;
        this.update();
        this.handleStateChange();
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE) {
      if (this.state == LINK_STATE_KEY.IN_PROGREES) {
        this.endPoint = data.webMercatorXY;
        this.update();
      }
    }
    if (type == MAP_EVENT.HANDLE_CLICK_LEFT) {
      if (this.state == LINK_STATE_KEY.IN_PROGREES) {
        this.endPoint = data.webMercatorXY;
        this.state = LINK_STATE_KEY.ENDED;
        this.update();
        this.handleStateChange();
      } else if (this.state != LINK_STATE_KEY.DISABLE) {
        this.startPoint = data.webMercatorXY;
        this.endPoint = data.webMercatorXY;
        this.state = LINK_STATE_KEY.IN_PROGREES;
        this.update();
        this.scene.add(this.mesh);
        this.handleStateChange();
      }
    }
    if (type == MAP_EVENT.HANDLE_CLICK_RIGHT) {
      if (this.state != LINK_STATE_KEY.DISABLE) {
        this.startPoint = [0, 0];
        this.endPoint = [0, 0];
        this.state = LINK_STATE_KEY.CAN_START;
        this.update();
        this.handleStateChange();
      }
    }
    if (type == MAP_EVENT.UPDATE_CENTER || type == MAP_EVENT.UPDATE_ZOOM) {
      if (this.state != LINK_STATE_KEY.DISABLE) {
        this.update();
      }
    }
  }

  handleStateChange() {
    this.handleEventListener(LINK_EVENT.STATE_CHANGE, {
      state: this.state,
      startPoint: this.startPoint,
      endPoint: this.endPoint,
    });
  }

  stop() {
    this.clearScene();
    this.state = LINK_STATE_KEY.DISABLE;
    this.handleStateChange();
  }

  play() {
    this.state = LINK_STATE_KEY.CAN_START;
    this.handleStateChange();
  }

  reset() {
    this.clearScene();

    this.state = LINK_STATE_KEY.DISABLE;
    this.startPoint = [0, 0];
    this.endPoint = [0, 0];
    this.update();
    this.handleStateChange();
  }

  update() {
    if (!this.map) return;
    const mapCenter = this.map.center;
    let [x1, y1] = this.map.WebMercatorToCanvasXY(
      ...this.startPoint,
      ...mapCenter
    );
    let [x2, y2] = this.map.WebMercatorToCanvasXY(
      ...this.endPoint,
      ...mapCenter
    );
    let attrPosition = [x1, y1, 0, x2, y2, 0];
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(attrPosition), 3)
    );
    this.geometry.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }
}
