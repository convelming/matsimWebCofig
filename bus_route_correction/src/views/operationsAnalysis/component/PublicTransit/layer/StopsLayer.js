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

export class StopsLayer extends Layer {
  name = "StopsLayer";
  size = 50;
  scale = 1;
  data = [];
  color = new THREE.Color(0x409eff);
  selectColor = new THREE.Color("orange");
  center = null;
  range = [];
  selectIds = [];

  state = STOPS_STATE_KEY.DISABLE;

  frameColor = new THREE.Color(0x409eff);
  frameOpacity = 0.5;
  frameStartPoint = [0, 0];
  frameEndPoint = [0, 0];
  texture = new THREE.TextureLoader().load(require("@/assets/image/point2.png"));
  texture2 = new THREE.TextureLoader().load(require("@/assets/image/bus_icon.png"));
  texture3D = new THREE.TextureLoader().load(require("@/assets/image/公交站牌.png"));

  constructor(opt) {
    super(opt);
    this.scene.renderOrder = this.zIndex;

    this.size = opt.size || this.size;
    this.data = opt.data || this.data;
    this.scale = opt.scale || this.scale;
    this.color = new THREE.Color(opt.color || this.color);
    this.selectColor = new THREE.Color(opt.selectColor || this.selectColor);
    this.frameColor = new THREE.Color(opt.frameColor || this.frameColor);
    this.frameOpacity = opt.frameOpacity || this.frameOpacity;

    this.geometry = new THREE.BufferGeometry();
    this.material = this.getStopMaterial({
      color: this.color,
      map: this.texture,
      vertexColors: false,
      usePickColor: false,
    });
    this.pickLayerMaterial = this.getStopMaterial({
      color: this.pickLayerColor,
      vertexColors: false,
      usePickColor: false,
    });

    this.pickMeshMaterial = this.getStopMaterial({
      vertexColors: true,
      usePickColor: true,
    });

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
      })
    );
    this.labelMesh.center.set(0.5, -0.5);

    this.selectGeometry = new THREE.BufferGeometry();
    this.selectMaterial = this.getStopMaterial({
      color: this.selectColor,
      map: this.texture,
      vertexColors: false,
      usePickColor: false,
    });

    this.frameGeometry = new THREE.BufferGeometry();
    this.frameMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.frameOpacity,
      color: this.frameColor,
    });
    this.frameMesh = new THREE.Mesh(this.frameGeometry, this.frameMaterial);
  }

  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = pickLayerColor;
    this.pickLayerMaterial.color = pickLayerColor;
    this.pickLayerMaterial.needsUpdate = true;
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
      this.setSize(this.map.plottingScale * 10);
      this.setPitch(this.pitch);
      this.update();
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      let item = this.data[data.pickColor - 1];
      if (item) {
        this.setSelectIds([item.data.stop.id]);
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
            if (this.labelData) this.labelData.map.dispose();
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

    if (type == MAP_EVENT.UPDATE_CAMERA_ROTATE) {
      this.setPitch(data.newPitch);
    }

  }

  onAdd(map) {
    super.onAdd(map);
    this.setSize(this.map.plottingScale * 10);
    this.setPitch(this.map.pitch);
    this.update();
  }

  setPitch(pitch) {
    this.pitch = pitch;
    if (this.pitch < 80) {
      this.material.setValues({ map: this.texture3D });
      this.material.needsUpdate = true;
      if (this.mesh) {
        this.mesh.position.setZ(this.size * this.scale * 0.5);
      }
      if (this.pickLayerMesh) {
        this.pickLayerMesh.position.setZ(this.size * this.scale * 0.5);
      }
      if (this.pickMesh) {
        this.pickMesh.position.setZ(this.size * this.scale * 0.5);
      }
    } else {
      this.material.setValues({ map: this.map.zoom > 15 ? this.texture2 : this.texture });
      this.material.needsUpdate = true;
      if (this.mesh) {
        this.mesh.position.setZ(0);
      }
      if (this.pickLayerMesh) {
        this.pickLayerMesh.position.setZ(0);
      }
      if (this.pickMesh) {
        this.pickMesh.position.setZ(0);
      }
    }
  }

  setSize(size = this.size, scale = this.scale) {
    this.size = size;
    this.scale = scale;

    if (this.material) {
      this.material.setValues({ size: this.scale * this.size });
      this.material.needsUpdate = true;
    }

    if (this.pickLayerMaterial) {
      this.pickLayerMaterial.setValues({ size: this.scale * this.size });
      this.pickLayerMaterial.needsUpdate = true;
    }

    if (this.pickMeshMaterial) {
      this.pickMeshMaterial.setValues({ size: this.scale * this.size });
      this.pickMeshMaterial.needsUpdate = true;
    }

    if (this.selectMaterial) {
      this.selectMaterial.setValues({ size: this.scale * this.size });
      this.selectMaterial.needsUpdate = true;
    }

    if (this.labelData && this.labelMesh) {
      const scale = this.map.plottingScale * 0.3;
      this.labelMesh.scale.set(this.labelData.mapWidth * scale, this.labelData.mapHeight * scale, 1);
    }
  }

  show() {
    super.show();
    if (this.map) {
      this.setSize(this.map.plottingScale * 10);
      this.setPitch(this.map.pitch);
      this.update();
    }
  }

  setColor(color) {
    this.color = color;
    this.material.setValues({ color: color });
    this.material.needsUpdate = true;
  }

  setSelectColor(color) {
    this.selectColor = color;
    this.selectMaterial.setValues({ color: color });
    this.selectMaterial.needsUpdate = true;
  }

  showName() { }

  hideName() { }

  async update() {
    if (this.updateTimeout) return;
    this.updateTimeout = setTimeout(() => (this.updateTimeout = null), 1000);
    try {
      if (!this.map) return;
      if (!this.visible) return;
      if (this.updateing) return;
      this.updateing = true;

      const { maxX, minX, maxY, minY } = this.map.getWindowRangeAndWebMercator();
      const wd = Math.abs(maxX - minX);
      const hd = Math.abs(maxY - minY);
      const maxX1 = maxX + wd;
      const minX1 = minX - wd;
      const maxY1 = maxY + hd;
      const minY1 = minY - hd;
      const [maxX2, minX2, maxY2, minY2] = this.range;
      if (maxX1 <= maxX2 && minX1 >= minX2 && maxY1 <= maxY2 && minY1 >= minY2) throw new Error("当前视野范围不需要更新");
      if (!maxX1 || !minX1 || !maxY1 || !minY1) throw new Error("坐标不能为空");
      this.range = [maxX1, minX1, maxY1, minY1];
      this.handleEventListener(MAP_EVENT.LAYER_LOADING, true);
      const res = await getStopFacilities({
        xyarr: [
          [maxX1, minY1],
          [maxX1, maxY1],
          [minX1, maxY1],
          [minX1, minY1],
        ],
      });
      this.handleEventListener(MAP_EVENT.LAYER_LOADING, false);

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

  updateFrame() {
    let [x1, y1] = this.map.WebMercatorToCanvasXY(...this.frameStartPoint, ...this.center);
    let [x2, y2] = this.map.WebMercatorToCanvasXY(...this.frameEndPoint, ...this.center);
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
    this.frameGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(attrPosition), 3));
    this.frameGeometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(attrUv), 2));
    this.frameGeometry.index = new THREE.BufferAttribute(new Uint16Array(attrIndex), 1);
    this.frameGeometry.needsUpdate = true;
    this.frameGeometry.computeBoundingSphere();

    let [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.frameMesh.position.set(x, y, 0.1);
  }

  updateStop() {
    const data = this.data;
    const count = data.length;
    const positions = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    const pickColors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    for (let i = 0; i < count; i++) {
      const { coord, pickColor } = data[i];
      positions.setXYZ(i, coord.x, coord.y, 0);
      pickColors.setXYZ(i, pickColor.r, pickColor.g, pickColor.b);
    }

    this.geometry.setAttribute("position", positions);
    this.geometry.setAttribute("pickColor", pickColors);
    this.geometry.computeBoundingSphere();
    this.geometry.needsUpdate = true;

    let [x, y] = this.map.WebMercatorToCanvasXY(...this.center);

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.position.set(x, y, 0);
    this.scene.add(this.mesh);

    this.pickLayerMesh = new THREE.Points(this.geometry, this.pickLayerMaterial);
    this.pickLayerMesh.position.set(x, y, 0);
    this.pickLayerScene.add(this.pickLayerMesh);

    this.pickMesh = new THREE.Points(this.geometry, this.pickMeshMaterial);
    this.pickMesh.position.set(x, y, 0);
    this.pickMeshScene.add(this.pickMesh);
  }

  updateLabel() {
    if (!this.labelData) {
      this.scene.remove(this.labelMesh);
    } else {
      this.labelMesh.material.setValues({ map: this.labelData.map });
      this.labelMesh.material.needsUpdate = true;
      const scale = this.map.plottingScale * 0.3;
      this.labelMesh.scale.set(this.labelData.mapWidth * scale, this.labelData.mapHeight * scale, 1);
      const [x, y] = this.map.WebMercatorToCanvasXY(this.labelData.x, this.labelData.y);
      this.labelMesh.position.set(x, y, 10);
      this.scene.add(this.labelMesh);
    }
  }

  getStopMaterial({ usePickColor, ...opt }) {
    const material = new THREE.PointsMaterial({
      size: this.size,
      transparent: true,
      sizeAttenuation: true,
      vertexColors: true,
      
      depthWrite: false,

      ...opt,
    });

    material.onBeforeCompile = (shader) => {
      if (usePickColor) {
        shader.vertexShader = shader.vertexShader.replace(
          "#include <color_pars_vertex>",
          `
            #include <color_pars_vertex>
            attribute vec3 pickColor;
          `
        );
        shader.vertexShader = shader.vertexShader.replace(
          "#include <color_vertex>",
          `
            #include <color_vertex>
            #if defined( USE_COLOR_ALPHA )
              vColor = vec4(pickColor, 1.0);
            #elif defined( USE_COLOR )
              vColor = pickColor;
            #endif
          `
        );
      }

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
          #if defined( USE_MAP )
            vec4 textColor = texture2D( map, uv );
            float length = (textColor.r + textColor.g + textColor.b) / 3.0;
            if(length < 0.5){
              outgoingLight = vec3(1.0);
            }else{
              outgoingLight = diffuse.rgb;
            }
          #endif
          #include <output_fragment>
        `
      );
    };
    /**
     * 当用到onBeforeCompile回调的时候，
     * 这个回调函数可以用来定义在onBeforeCompile中使用的配置项，
     * 这样three.js就可以根据这个回调返回的字符串来判定使用一个
     * 缓存的编译好的着色器代码还是根据需求重新编译一段新的着色器代码。
     * material.needsUpdate也要设置为true
     */
    material.customProgramCacheKey = () => {
      return JSON.stringify({
        uuid: material.uuid,
        usePickColor: usePickColor,
      });
    };

    return material;
  }

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
