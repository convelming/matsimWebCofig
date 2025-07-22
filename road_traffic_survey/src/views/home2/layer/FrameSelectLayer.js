import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

export const FRAME_SELECT_STATE_KEY = {
  NOT_STARTED: 0, // 未开始框选
  CAN_START: 1, // 可以开始框选
  IN_PROGREES: 2, // 进行中的
  ENDED: 3, // 框选结束
};

export const FRAME_SELECT_EVENT = {
  STATE_CHANGE: "handle:statechange", // 状态改变事件
};

export class FrameSelectLayer extends Layer {
  name = "FrameSelectLayer";
  color = 0x409eff;
  opacity = 0.5;
  state = FRAME_SELECT_STATE_KEY.NOT_STARTED;
  startPoint = [0, 0];
  endPoint = [0, 0];

  constructor(opt) {
    super(opt);
    this.color = opt.color || 0x409eff;
    this.opacity = opt.opacity || 0.5;
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: this.opacity,
      color: new THREE.Color(this.color),
      depthFunc: THREE.AlwaysDepth,
      alphaTest: 0.2,
      // depthWrite: false
    });

    this.geometry = new THREE.BufferGeometry();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  on(type, data) {
    if (type == MAP_EVENT.HANDLE_MOUSE_LEFT_DOWN) {
      if (
        this.state == FRAME_SELECT_STATE_KEY.CAN_START ||
        this.state == FRAME_SELECT_STATE_KEY.ENDED
      ) {
        this.startPoint = data.webMercatorXY;
        this.endPoint = data.webMercatorXY;
        this.state = FRAME_SELECT_STATE_KEY.IN_PROGREES;
        this.update();
        this.scene.add(this.mesh);
        this.handleStateChange();
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_LEFT_UP) {
      if (this.state == FRAME_SELECT_STATE_KEY.IN_PROGREES) {
        this.endPoint = data.webMercatorXY;
        this.state = FRAME_SELECT_STATE_KEY.ENDED;
        this.update();
        this.handleStateChange();
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE) {
      if (this.state == FRAME_SELECT_STATE_KEY.IN_PROGREES) {
        this.endPoint = data.webMercatorXY;
        this.update();
      }
    }
    if (type == MAP_EVENT.HANDLE_CLICK_LEFT) {
      if (this.state == FRAME_SELECT_STATE_KEY.IN_PROGREES) {
        this.endPoint = data.webMercatorXY;
        this.state = FRAME_SELECT_STATE_KEY.ENDED;
        this.update();
        this.handleStateChange();
      } else if (this.state != FRAME_SELECT_STATE_KEY.NOT_STARTED) {
        this.startPoint = data.webMercatorXY;
        this.endPoint = data.webMercatorXY;
        this.state = FRAME_SELECT_STATE_KEY.IN_PROGREES;
        this.update();
        this.scene.add(this.mesh);
        this.handleStateChange();
      }
    }
    if (type == MAP_EVENT.HANDLE_CLICK_RIGHT) {
      if (this.state != FRAME_SELECT_STATE_KEY.NOT_STARTED) {
        this.startPoint = [0, 0];
        this.endPoint = [0, 0];
        this.state = FRAME_SELECT_STATE_KEY.CAN_START;
        this.update();
        this.handleStateChange();
      }
    }
    if (type == MAP_EVENT.UPDATE_CENTER || type == MAP_EVENT.UPDATE_ZOOM) {
      if (this.state != FRAME_SELECT_STATE_KEY.NOT_STARTED) {
        this.update();
      }
    }
    super.on(type, data);
  }

  handleStateChange() {
    const mapCenter = this.map.center;
    let [x1, y1] = this.map.WebMercatorToCanvasXY(
      ...this.startPoint,
      ...mapCenter
    );
    let [x2, y2] = this.map.WebMercatorToCanvasXY(
      ...this.endPoint,
      ...mapCenter
    );
    const rightTop = x1 > x2 ? this.startPoint : this.endPoint;
    const leftBottom = x1 > x2 ? this.endPoint : this.startPoint;
    this.handleEventListener(FRAME_SELECT_EVENT.STATE_CHANGE, {
      state: this.state,
      xy: {
        rightTop: rightTop,
        rightBottom: [rightTop[0], leftBottom[1]],
        leftBottom: leftBottom,
        leftTop: [leftBottom[0], rightTop[1]],
      },
    });
  }

  stop() {
    this.clearScene();
    this.state = FRAME_SELECT_STATE_KEY.NOT_STARTED;
    this.handleStateChange();
  }

  play() {
    this.state = FRAME_SELECT_STATE_KEY.CAN_START;
    this.handleStateChange();
  }

  reset() {
    this.clearScene();

    this.state = FRAME_SELECT_STATE_KEY.NOT_STARTED;
    this.startPoint = [0, 0];
    this.endPoint = [0, 0];
    this.update();
    this.handleStateChange();
  }

  update() {
    const mapCenter = this.map.center;
    let [x1, y1] = this.map.WebMercatorToCanvasXY(
      ...this.startPoint,
      ...mapCenter
    );
    let [x2, y2] = this.map.WebMercatorToCanvasXY(
      ...this.endPoint,
      ...mapCenter
    );
    let attrUv = [0, 0, 0, 1, 1, 1, 1, 0];
    let attrPosition = [
      Math.min(x1, x2),
      Math.min(y1, y2),
      0, // 左下
      Math.max(x1, x2),
      Math.min(y1, y2),
      0, // 右下
      Math.max(x1, x2),
      Math.max(y1, y2),
      0, // 右上
      Math.min(x1, x2),
      Math.max(y1, y2),
      0, // 左上
    ];
    let attrIndex = [0, 1, 2, 0, 2, 3];
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(attrPosition), 3)
    );
    this.geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(attrUv), 2)
    );
    this.geometry.index = new THREE.BufferAttribute(
      new Uint16Array(attrIndex),
      1
    );
    this.geometry.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }
}
