import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { isDoubleClick } from "@/mymap/utils/index";
export const POLYGON_SELECT_STATE_KEY = {
  NOT_STARTED: 0, // 未开始框选
  CAN_START: 1, // 可以开始框选
  IN_PROGREES: 2, // 进行中的
  ENDED: 3, // 框选结束
};

export const POLYGON_SELECT_EVENT = {
  STATE_CHANGE: "handle:statechange", // 状态改变事件
};

export class PolygonSelectLayer extends Layer {
  name = "PolygonSelectLayer";
  color = 0x409eff;
  opacity = 0.5;
  state = POLYGON_SELECT_STATE_KEY.NOT_STARTED;

  center = [0, 0];
  path = [[0, 0]];
  movePoint = [0, 0];

  constructor(opt) {
    super(opt);
    this.color = opt.color || 0x409eff;
    this.opacity = opt.opacity || 0.5;
    this.material1 = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: this.opacity,
      color: new THREE.Color(this.color),
      depthFunc: THREE.AlwaysDepth,
      alphaTest: 0.2,
      // depthWrite: false
    });

    this.geometry1 = new THREE.BufferGeometry();
    this.mesh1 = new THREE.Mesh(this.geometry1, this.material1);

    this.material2 = new THREE.MeshBasicMaterial({
      transparent: true,
      color: new THREE.Color(this.color),
      depthFunc: THREE.AlwaysDepth,
      alphaTest: 0.2,
      // depthWrite: false
    });
    this.geometry2 = new THREE.BufferGeometry();
    this.mesh2 = new THREE.LineLoop(this.geometry2, this.material2);

    this.scene.add(this.mesh1);
    this.scene.add(this.mesh2);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.mesh1.position.set(x, y, 0);
      this.mesh2.position.set(x, y, 0);
    }
    if (type == MAP_EVENT.HANDLE_CLICK_LEFT) {
      isDoubleClick(this.id, 250, (res) => {
        if (!res) {
          if (this.state == POLYGON_SELECT_STATE_KEY.CAN_START) {
            this.state = POLYGON_SELECT_STATE_KEY.IN_PROGREES;
            const [x, y] = data.webMercatorXY;
            this.center = [x, y];
            this.movePoint = [x, y];
            this.path = [[x, y]];
            this.update();
            this.handleStateChange();
          } else if (this.state == POLYGON_SELECT_STATE_KEY.IN_PROGREES) {
            const [x, y] = data.webMercatorXY;
            this.path[this.path.length] = [x, y];
            this.update();
            this.handleStateChange();
          }
        } else {
          if (this.state == POLYGON_SELECT_STATE_KEY.IN_PROGREES) {
            this.state = POLYGON_SELECT_STATE_KEY.ENDED;
            const [x, y] = data.webMercatorXY;
            this.path[this.path.length] = [x, y];
            this.movePoint = [x, y];
            this.update();
            this.handleStateChange();
          }
        }
      });
    }

    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE) {
      if (this.state == POLYGON_SELECT_STATE_KEY.IN_PROGREES) {
        const [x, y] = data.webMercatorXY;
        this.movePoint = [x, y];
        this.update();
        this.handleStateChange();
      }
    }
  }

  handleStateChange() {
    this.handleEventListener(POLYGON_SELECT_EVENT.STATE_CHANGE, {
      state: this.state,
      path: this.path,
    });
  }

  stop() {
    this.state = POLYGON_SELECT_STATE_KEY.NOT_STARTED;
    this.handleStateChange();
  }

  play() {
    this.state = POLYGON_SELECT_STATE_KEY.CAN_START;
    this.handleStateChange();
  }

  reset() {
    this.state = POLYGON_SELECT_STATE_KEY.NOT_STARTED;
    this.path = [[0, 0]];
    this.center = [0, 0];
    this.movePoint = [0, 0];
    this.update();
    this.handleStateChange();
  }

  setPath(path) {
    this.path = path;
    this.update();
  }

  update() {
    const [cx, cy] = this.center;
    const path = this.path.map(([x, y]) => new THREE.Vector2(x - cx, y - cy));
    path.push(new THREE.Vector2(this.movePoint[0] - cx, this.movePoint[1] - cy));
    const shape = new THREE.Shape(path);
    const points = shape.extractPoints(12);

    let shapeVertices = points.shape;
    const shapeHoles = points.holes;

    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    // check direction of vertices
    if (THREE.ShapeUtils.isClockWise(shapeVertices) === false) {
      shapeVertices = shapeVertices.reverse();
    }
    for (let i = 0, l = shapeHoles.length; i < l; i++) {
      const shapeHole = shapeHoles[i];
      if (THREE.ShapeUtils.isClockWise(shapeHole) === true) {
        shapeHoles[i] = shapeHole.reverse();
      }
    }
    const faces = THREE.ShapeUtils.triangulateShape(shapeVertices, shapeHoles);
    // join vertices of inner and outer paths to a single array
    for (let i = 0, l = shapeHoles.length; i < l; i++) {
      const shapeHole = shapeHoles[i];
      shapeVertices = shapeVertices.concat(shapeHole);
    }
    // vertices, normals, uvs
    for (let i = 0, l = shapeVertices.length; i < l; i++) {
      const vertex = shapeVertices[i];
      vertices.push(vertex.x, vertex.y, 0);
      normals.push(0, 0, 1);
      uvs.push(vertex.x, vertex.y); // world uvs
    }

    // indices
    for (let i = 0, l = faces.length; i < l; i++) {
      const face = faces[i];
      const a = face[0];
      const b = face[1];
      const c = face[2];
      indices.push(a, b, c);
    }

    this.geometry1.setIndex(indices);
    this.geometry1.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    this.geometry1.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    this.geometry1.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.geometry1.needsUpdate = true;
    this.geometry1.computeBoundingSphere();

    this.geometry2.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    this.geometry2.needsUpdate = true;
    this.geometry2.computeBoundingSphere();

    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.mesh1.position.set(x, y, 0);
    this.mesh2.position.set(x, y, 0);
  }
}
