import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { getTextImage } from "@/mymap/utils/index";

import { getStopFacilities } from "@/api/index";

import * as Bean from "@/utils/Bean";

export const STOPS_STATE_KEY = {
  DISABLE: 0, // 禁用
  CAN_SELECT: 1, // 可以选择
  IN_FRAME: 2, // 框选中
};

export const STOPS_EVENT = {
  SELECT_STOP_CHANGE: "handle:select:stop:change", // 值改变事件
};

const STOP_SIZE = 80;

export class StopsLayer extends Layer {
  name = "StopsLayer";
  size = 0.3;
  scale = 1;
  data = [];
  color = new THREE.Color(0x409eff);
  center = null;
  range = [];
  selectIds = [];

  state = STOPS_STATE_KEY.DISABLE;

  frameColor = new THREE.Color(0x409eff);
  frameOpacity = 0.5;
  frameStartPoint = [0, 0];
  frameEndPoint = [0, 0];
  texture = new THREE.TextureLoader().load(require("@/assets/image/point.png"));

  constructor(opt) {
    super(opt);

    this.size = opt.size || this.size;
    this.data = opt.data || this.data;
    this.scale = opt.scale || this.scale;
    this.color = new THREE.Color(opt.color || this.color);
    this.frameColor = new THREE.Color(opt.frameColor || this.frameColor);
    this.frameOpacity = opt.frameOpacity || this.frameOpacity;

    this.texture = opt.texture || this.texture;

    this.geometry = new THREE.BoxGeometry(STOP_SIZE, STOP_SIZE);
    this.material = new THREE.MeshBasicMaterial({
      depthWrite: false,
      transparent: true,
      map: this.texture,
    });
    this.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
          #if defined(USE_MAP) && defined(USE_COLOR)
            if(length(texture2D( map, vUv ).rgb) < .01){
              outgoingLight = vec3(1.0);
            }else{
              outgoingLight = vColor.rgb;
            }
          #endif
          #include <output_fragment>
        `
      );
    };

    this.pickGeometry = new THREE.BoxGeometry(STOP_SIZE * 1.1, STOP_SIZE * 1.1);
    this.pickMaterial = new THREE.MeshBasicMaterial();

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
        sizeAttenuation: false,
      })
    );
    this.labelMesh.center.set(0.5, -0.5);

    this.frameGeometry = new THREE.BufferGeometry();
    this.frameMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.frameOpacity,
      color: this.frameColor,
    });
    this.frameMesh = new THREE.Mesh(this.frameGeometry, this.frameMaterial);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
        mesh.position.set(x, y, mesh.position.z);
      }

      this.update();
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setSize(this.map.cameraHeight / 10000);
      this.update();
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      if (this.state == STOPS_STATE_KEY.CAN_SELECT) {
        let item = this.data[data.pickColor - 1];
        if (item) {
          this.setSelectIds([item.data.stop.id]);
        }
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE_PICK) {
      let labelData = null;
      if (data.layerId == this.id) {
        const pickColor = new THREE.Color(data.pickColor);
        const item = this.data.find((v2) => v2.pickColor.equals(pickColor));
        if (item) {
          if (this.labelData && item.data.stop.name == this.labelData.name) {
            labelData = this.labelData;
          } else {
            labelData = {};
            const { url, width, height } = getTextImage(item.data.stop.name);
            const texture = new THREE.TextureLoader().load(url);
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            labelData.map = texture;
            labelData.mapWidth = width;
            labelData.mapHeight = height;
            labelData.x = item.data.stop.coord.x;
            labelData.y = item.data.stop.coord.y;
            labelData.name = item.data.stop.name;
          }
        }
      }
      this.labelData = labelData;
      this.updateLabel();
    }

    // 框选逻辑
    if (type == MAP_EVENT.HANDLE_MOUSE_LEFT_DOWN) {
      if (this.state == STOPS_STATE_KEY.CAN_SELECT) {
        this.frameStartPoint = data.webMercatorXY;
        this.frameEndPoint = data.webMercatorXY;
        this.state = STOPS_STATE_KEY.IN_FRAME;
        this.updateFrame();
        this.scene.add(this.frameMesh);
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_LEFT_UP) {
      if (this.state == STOPS_STATE_KEY.IN_FRAME) {
        this.frameEndPoint = data.webMercatorXY;
        this.state = STOPS_STATE_KEY.CAN_SELECT;
        this.updateFrame();
        this.scene.remove(this.frameMesh);
        this.computeFrameStop();
      }
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE) {
      if (this.state == STOPS_STATE_KEY.IN_FRAME) {
        this.frameEndPoint = data.webMercatorXY;
        this.updateFrame();
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.setSize(this.map.cameraHeight / 10000);
    console.log(this.map.cameraHeight);
    this.update();
  }

  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = new THREE.Color(pickLayerColor);
    if (this.pickLayerMesh) {
      for (let i = 0; i < this.pickLayerMesh.count; i++) {
        this.pickLayerMesh.setColorAt(i, this.pickLayerColor);
      }
    }
  }

  setSize(size = this.size, scale = this.scale) {
    this.size = size;
    this.scale = scale;
    const data = this.data;
    const count = data.length;
    for (let i = 0; i < count; i++) {
      const { coord } = data[i];
      const positionV3 = new THREE.Vector3(coord.x, coord.y, i / count);
      const _scale = scale * size;
      const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);

      const matrix = new THREE.Matrix4();
      matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

      if (this.mesh) this.mesh.setMatrixAt(i, matrix);
      if (this.pickLayerMesh) this.pickLayerMesh.setMatrixAt(i, matrix);
      if (this.pickMesh) this.pickMesh.setMatrixAt(i, matrix);
    }

    if (this.mesh) this.mesh.instanceMatrix.needsUpdate = true;
    if (this.pickLayerMesh)
      this.pickLayerMesh.instanceMatrix.needsUpdate = true;
    if (this.pickMesh) this.pickMesh.instanceMatrix.needsUpdate = true;
  }

  show() {
    super.show();
    this.update();
  }

  setColor(color) {
    this.color = new THREE.Color(color);
    if (this.mesh) {
      for (let i = 0; i < this.mesh.count; i++) {
        this.mesh.setColorAt(i, this.color);
        this.mesh.instanceColor.needsUpdate = true;
      }
    }
  }

  showName() {}

  hideName() {}

  async update() {
    if (this.updateTimeout) return;
    this.updateTimeout = setTimeout(() => (this.updateTimeout = null), 1000);
    try {
      if (!this.map) return;
      if (!this.visible) return;
      if (this.updateing) return;
      this.updateing = true;
      const { maxX, minX, maxY, minY } =
        this.map.getWindowRangeAndWebMercator();
      const wd = Math.abs(maxX - minX);
      const hd = Math.abs(maxY - minY);
      const maxX1 = maxX + wd;
      const minX1 = minX - wd;
      const maxY1 = maxY + hd;
      const minY1 = minY - hd;
      const [maxX2, minX2, maxY2, minY2] = this.range;
      if (maxX1 <= maxX2 && minX1 >= minX2 && maxY1 <= maxY2 && minY1 >= minY2)
        throw new Error("当前视野范围不需要更新");
      if (!maxX1 || !minX1 || !maxY1 || !minY1) throw new Error("坐标不能为空");
      this.range = [maxX1, minX1, maxY1, minY1];
      const res = await getStopFacilities({
        xyarr: [
          [maxX1, minY1],
          [maxX1, maxY1],
          [minX1, maxY1],
          [minX1, minY1],
        ],
      });

      this.clearScene();
      const center = new Bean.Coord({
        x: (maxX + minX) / 2,
        y: (maxY + minY) / 2,
      });
      this.center = center.toList();
      this.data = res.data.map((v, i) => {
        let stop = new Bean.Stops({ stop: v });
        return {
          coord: stop.coord.offset(center),
          pickColor: new THREE.Color(i + 1),
          data: stop.toJSON(),
        };
      });
      this.updateStop();
    } catch (error) {
    } finally {
      this.updateing = false;
    }
  }

  clearScene() {
    super.clearScene();
    if (this.mesh) {
      this.mesh.dispose();
      this.mesh = null;
    }
    if (this.pickLayerMesh) {
      this.pickLayerMesh.dispose();
      this.pickLayerMesh = null;
    }
    if (this.pickMesh) {
      this.pickMesh.dispose();
      this.pickMesh = null;
    }
  }

  // 更新站点
  updateStop() {
    const data = this.data;
    const count = data.length;
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, count);
    const pickLayerMesh = new THREE.InstancedMesh(
      this.pickGeometry,
      this.pickMaterial,
      count
    );
    const pickMesh = new THREE.InstancedMesh(
      this.pickGeometry,
      this.pickMaterial,
      count
    );

    for (let i = 0; i < count; i++) {
      const { coord, pickColor } = data[i];

      const positionV3 = new THREE.Vector3(coord.x, coord.y, i / count);
      const _scale = this.scale * this.size;
      const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);

      const matrix = new THREE.Matrix4();
      matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

      mesh.setMatrixAt(i, matrix);
      pickLayerMesh.setMatrixAt(i, matrix);
      pickMesh.setMatrixAt(i, matrix);

      mesh.setColorAt(i, this.color);
      pickLayerMesh.setColorAt(i, this.pickLayerColor);
      pickMesh.setColorAt(i, pickColor);
    }

    let [x, y] = this.map.WebMercatorToCanvasXY(...this.center);

    mesh.position.set(x, y, 0);
    pickLayerMesh.position.set(x, y, 0);
    pickMesh.position.set(x, y, 0);

    this.mesh = mesh;
    this.pickLayerMesh = pickLayerMesh;
    this.pickMesh = pickMesh;

    this.scene.add(mesh);
    this.pickLayerScene.add(pickLayerMesh);
    this.pickMeshScene.add(pickMesh);
  }

  // 更新标签
  updateLabel() {
    if (!this.labelData) {
      this.scene.remove(this.labelMesh);
    } else {
      const height = 0.05;
      const width =
        (height * this.labelData.mapWidth) / this.labelData.mapHeight;

      this.labelMesh.material.setValues({ map: this.labelData.map });
      this.labelMesh.material.needsUpdate = true;
      this.labelMesh.scale.set(width, height, 1);
      const [x, y] = this.map.WebMercatorToCanvasXY(
        this.labelData.x,
        this.labelData.y
      );
      this.labelMesh.position.set(x, y, 10);
      this.scene.add(this.labelMesh);
    }
  }

  // 更新选择框
  updateFrame() {
    let [x1, y1] = this.map.WebMercatorToCanvasXY(
      ...this.frameStartPoint,
      ...this.center
    );
    let [x2, y2] = this.map.WebMercatorToCanvasXY(
      ...this.frameEndPoint,
      ...this.center
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
    this.frameGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(attrPosition), 3)
    );
    this.frameGeometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(attrUv), 2)
    );
    this.frameGeometry.index = new THREE.BufferAttribute(
      new Uint16Array(attrIndex),
      1
    );
    this.frameGeometry.needsUpdate = true;
    this.frameGeometry.computeBoundingSphere();

    let [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.frameMesh.position.set(x, y, 0.1);
  }

  // 计算选择框中的站点
  computeFrameStop() {
    const [x1, y1] = this.frameStartPoint;
    const [x2, y2] = this.frameEndPoint;

    const maxX = Math.max(x1, x2);
    const minX = Math.min(x1, x2);
    const maxY = Math.max(y1, y2);
    const minY = Math.min(y1, y2);

    let selectIds = this.data
      .filter((v) => {
        const { x, y } = v.data.stop.coord;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      })
      .map((v) => v.data.stop.id);
    this.setSelectIds(selectIds);
  }

  setSelectIds(selectIds) {
    this.selectIds = selectIds;
    this.handleEventListener(STOPS_EVENT.SELECT_STOP_CHANGE, this.selectIds);
  }
}
