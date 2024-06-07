import * as THREE from "three";
// 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
//引入性能监视器stats.js
import Stats from "three/addons/libs/stats.module.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";

import { WGS84ToMercator, EPSG4526ToMercator } from "../utils/LngLatUtils";
import { EventListener } from "./EventListener";
import { BloomComposer } from "../composer/BloomComposer";

export const SCENE_MAP = {
  ENTIRE_SCENE: 0, // 全景图层
  BLOOM_SCENE: 1, // 泛光图层
};

// 事件类型
export const MAP_EVENT = {
  // 鼠标点击没有拾取到模型事件
  HANDLE_NO_PICK: "handle:no:pick",
  // 鼠标点击模型拾取事件
  HANDLE_PICK_LEFT: "handle:pick",
  HANDLE_PICK_RIGHT: "handle:pick:right",
  // 鼠标移动时模型拾取事件
  HANDLE_MOUSE_MOVE_PICK: "handle:mousemove:pick",
  // 鼠标左键点击事件
  HANDLE_CLICK_LEFT: "handle:click",
  // 鼠标右键点击事件
  HANDLE_CLICK_RIGHT: "handle:contextmenu",
  // 鼠标左键按下事件
  HANDLE_MOUSE_LEFT_DOWN: "handle:left:mousedown",
  // 鼠标左键抬起事件
  HANDLE_MOUSE_LEFT_UP: "handle:left:mouseup",
  // 鼠标右键按下事件
  HANDLE_MOUSE_RIGHT_DOWN: "handle:right:mousedown",
  // 鼠标右键抬起事件
  HANDLE_MOUSE_RIGHT_UP: "handle:right:mouseup",
  // 鼠标移动事件
  HANDLE_MOUSE_MOVE: "handle:mousemove",
  // 地图层级缩放事件
  UPDATE_ZOOM: "update:zoom",
  // 地图中心点改变事件
  UPDATE_CENTER: "update:center",
  // 摄像机与观测点距离改变事件
  UPDATE_CAMERA_HEIGHT: "update:camera:height",
  // 摄像机视角改变事件
  UPDATE_CAMERA_ROTATE: "update:camera:rotate",
  // 摄像机位置改变事件
  UPDATE_CAMERA_POSITION: "update:camera:position",
  // 渲染器大小改变事件
  UPDATE_RENDERER_SIZE: "update:renderer:size",
  // 图层渲染前
  LAYER_BEFORE_RENDER: "layer:before:render",
  // 图层渲染后
  LAYER_AFTER_RENDER: "layer:after:render",
  LAYER_LOADING: "layer:loading",
};

export const MAP_ZOOM_RANGE = {
  MIN: 5,
  MAX: 18,
};

// 地图层级缩放高度基数
const MAP_ZOOM_HEIGHT = 400;

export class Map extends EventListener {
  name = "map";
  _pickLayerColorNum = 0xffffff;
  openGPUPick = true;

  // 获取摄像机到观测点距离
  get cameraHeight() {
    return this.cameraControls ? Math.round(this.cameraControls.getDistance()) : Math.pow(2, MAP_ZOOM_RANGE.MAX - this.zoom) * MAP_ZOOM_HEIGHT;
  }

  // 获取一个拾取图层颜色
  getPickLayerColor() {
    return new THREE.Color(--this._pickLayerColorNum);
  }

  // 性能监视器对象
  get stats() {
    if (!this._stats) {
      //创建性能监视器对象
      this._stats = new Stats();
      if (this.rootDoc) {
        this.rootDoc.appendChild(this._stats.domElement);
      }
    }
    return this._stats;
  }

  set enableRotate(enableRotate) {
    this._enableRotate = enableRotate;
    if (this.cameraControls) {
      this.cameraControls.enableRotate = enableRotate;
      if (!enableRotate) this.setPitchAndRotation(90, 0);
    }
  }

  set minPitch(minPitch) {
    if (minPitch >= 90) minPitch = 90;
    this._minPitch = minPitch;
    if (this.cameraControls) {
      this.cameraControls.maxPolarAngle = (Math.PI * (90 - minPitch)) / 180;
    }
  }

  constructor({ rootId, center = [12614426, 2646623], zoom = 15, pitch = 90, minPitch = 30, rotation = 0, openGPUPick = true, noControls = false, enableRotate = false, background = 0xd9ecff, ...opt }) {
    super(opt);
    // 获取根节点dom
    this.rootDoc = document.getElementById(rootId);
    if (!this.rootDoc) {
      throw new Error("无法获取地图根节点:" + rootId);
    }
    this.rootDoc.style.position = "relative";
    this.rootDoc.style.overflow = "hidden";
    // 图层数组
    this.layers = [];
    // 地图中点经纬度
    this.center = center;
    // 地图缩放层级
    this.zoom = zoom;
    // 设置地图是否3D视角
    this.enableRotate = enableRotate;
    // 相机视线与地图平面的夹角 单位：度 minPitch ~ 90
    this.pitch = pitch;
    // 相机视线与地图平面的最小夹角 单位：度 0 ~ 90
    this.minPitch = minPitch;
    // 相机与正南方向的夹角 单位：度
    this.rotation = rotation;
    // 打开GPU拾取
    this.openGPUPick = openGPUPick;
    // 地图背景色
    this.background = background;

    // 初始化渲染器
    this.initRenderer();
    // 初始化场景
    this.initScene();
    // 初始化光源
    this.initLight();
    // 初始化相机
    this.initCamera();
    // 初始化相机控制器
    if (!noControls) this.initCameraControls();
    this.initComposer();

    // 设置层级
    this.setZoom(zoom);
    // 初始化地图大小监听
    this.ininResize();
    // 设置相机视角
    this.setPitchAndRotation();
    // 开启渲染循环
    this.animation();

    // 初始化鼠标事件监听
    this.initMouseEventListener();
  }

  setBackground(background) {
    this.background = background;
    this.scene.background = new THREE.Color(this.background);
    this.scene.fog.color = this.background;
  }

  // 初始化渲染器
  initRenderer() {
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      // 设置抗锯齿
      antialias: true,
      // 设置对数深度缓冲区
      logarithmicDepthBuffer: true,
    });
    this.renderer.domElement.style.userSelect = "none";
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.top = "0";
    this.renderer.domElement.style.left = "0";
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.rootDoc.appendChild(this.renderer.domElement);
  }

  initComposer() {
    this.composer = new EffectComposer(this.renderer);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.bloomComposer = new BloomComposer(this.renderer, this.scene, this.camera, {
      layerNum: SCENE_MAP.BLOOM_SCENE,
    });
    this.composer.addPass(this.bloomComposer.pass);

    //获取.setPixelRatio()设置的设备像素比
    const pixelRatio = this.renderer.getPixelRatio();
    // width、height是canva画布的宽高度
    this.smaaPass = new SMAAPass(this.rootDoc.clientWidth * pixelRatio, this.rootDoc.clientHeight * pixelRatio);
    this.composer.addPass(this.smaaPass);
  }

  // 初始化场景
  initScene() {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.background);
    this.scene.fog = new THREE.Fog(this.background, 1, 1000);

    // 创建渲染地图分组
    this.world = new THREE.Group();
    // 对地图的坐标系进行纠正
    this.world.rotateX(-Math.PI / 2);
    this.world.scale.set(1, 1, 1);
    this.scene.add(this.world);
    // 添加一个模拟3个坐标轴的对象
    // this.scene.add(new THREE.AxesHelper(1000));

    // 创建图层拾取场景
    this.pickLayerScene = new THREE.Scene();
    this.pickLayerWorld = new THREE.Group();
    this.pickLayerWorld.rotateX(-Math.PI / 2);
    this.pickLayerWorld.scale.set(1, 1, 1);
    this.pickLayerScene.add(this.pickLayerWorld);
    // 创建图层拾取渲染器
    this.pickLayerTarget = new THREE.WebGLRenderTarget();

    // 创建模型拾取场景
    this.pickMeshScene = new THREE.Scene();
    this.pickMeshWorld = new THREE.Group();
    this.pickMeshWorld.rotateX(-Math.PI / 2);
    this.pickMeshWorld.scale.set(1, 1, 1);
    this.pickMeshScene.add(this.pickMeshWorld);
    // 创建模型拾取渲染器
    this.pickMeshTarget = new THREE.WebGLRenderTarget();
  }

  // 初始化相机
  initCamera() {
    // 创建相机
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 3000);
    // 设置相机位置
    this.camera.position.y = 1000;
    this.camera.lookAt(0, 0, 0);
  }

  // 初始化光源
  initLight() {
    // 添加环境光线
    const light = new THREE.AmbientLight(0xaaaaaa);
    this.scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xaaaaaa); // 创建方向光
    directionalLight.position.set(-1500, 4000, 3500); // 设置方向光源位置

    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    // 方向光投影近点、远点更新
    directionalLight.shadow.camera.near = 2;
    directionalLight.shadow.camera.far = 10000;

    // 方向光投影边界更新
    directionalLight.shadow.camera.top = 8;
    directionalLight.shadow.camera.bottom = -8;
    directionalLight.shadow.camera.left = -8;
    directionalLight.shadow.camera.right = 8;

    this.scene.add(directionalLight);
  }

  // 添加地图鼠标事件监听
  initMouseEventListener() {
    this.rootDoc.addEventListener("mousemove", (event) => {
      let data = {};
      data.event = event;
      data.windowXY = [event.offsetX, event.offsetY];
      data.canvasXY = this.WindowXYToCanvasXY(event.offsetX, event.offsetY);
      data.webMercatorXY = this.CanvasXYToWebMercator(...data.canvasXY);
      this.on(MAP_EVENT.HANDLE_MOUSE_MOVE, data);

      if (!this.MOUSE_MOVE_TIMEOUT) {
        this.MOUSE_MOVE_TIMEOUT = setTimeout(() => {
          this.MOUSE_MOVE_TIMEOUT = null;
          const x = data.event.offsetX;
          const y = data.event.offsetY;
          const pickLayerColor = this.handleGPUPickLayer(x, y);
          const layer = this.layers.find((v) => v.pickLayerColor.getHex() == pickLayerColor);
          this.on(MAP_EVENT.HANDLE_MOUSE_MOVE_PICK, {
            ...data,
            pickColor: layer ? this.handleGPUPickMesh(layer.pickMeshScene, x, y) : 0,
            layerId: layer ? layer.id : null,
          });
        }, 50);
      }
    });

    this.rootDoc.addEventListener("mousedown", (event) => {
      this.mouseDowning = false;
      this.mousedownEvent = event;

      let data = {};
      data.event = event;
      data.windowXY = [event.offsetX, event.offsetY];
      data.canvasXY = this.WindowXYToCanvasXY(event.offsetX, event.offsetY);
      data.webMercatorXY = this.CanvasXYToWebMercator(...data.canvasXY);

      this.mousedownTimeout = setTimeout(() => {
        this.mouseDowning = true;
        if (event.button == 0) {
          this.on(MAP_EVENT.HANDLE_MOUSE_LEFT_DOWN, data);
        } else if (event.button == 2) {
          this.on(MAP_EVENT.HANDLE_MOUSE_RIGHT_DOWN, data);
        }
      }, 200);
    });

    this.rootDoc.addEventListener("mouseup", (event) => {
      let data = {};
      data.event = event;
      data.windowXY = [event.offsetX, event.offsetY];
      data.canvasXY = this.WindowXYToCanvasXY(event.offsetX, event.offsetY);
      data.webMercatorXY = this.CanvasXYToWebMercator(...data.canvasXY);

      if (event.button == 0) {
        if (this.mouseDowning) {
          this.mouseDowning = false;
          this.on(MAP_EVENT.HANDLE_MOUSE_LEFT_UP, data);
        } else {
          clearTimeout(this.mousedownTimeout);
          if (this.openGPUPick) {
            const x = data.event.offsetX;
            const y = data.event.offsetY;
            const pickLayerColor = this.handleGPUPickLayer(x, y);
            const layer = this.layers.find((v) => v.pickLayerColor.getHex() == pickLayerColor);
            const pickData = {
              ...data,
              pickColor: layer ? this.handleGPUPickMesh(layer.pickMeshScene, x, y) : 0,
              layerId: layer ? layer.id : null,
            };
            this.on(MAP_EVENT.HANDLE_CLICK_LEFT, pickData);
            this.on(MAP_EVENT.HANDLE_PICK_LEFT, pickData);
          } else {
            this.on(MAP_EVENT.HANDLE_CLICK_LEFT, data);
          }
        }
      } else if (event.button == 2) {
        if (this.mouseDowning) {
          this.mouseDowning = false;
          this.on(MAP_EVENT.HANDLE_MOUSE_RIGHT_UP, data);
        } else {
          clearTimeout(this.mousedownTimeout);
          if (this.openGPUPick) {
            const x = data.event.offsetX;
            const y = data.event.offsetY;
            const pickLayerColor = this.handleGPUPickLayer(x, y);
            const layer = this.layers.find((v) => v.pickLayerColor.getHex() == pickLayerColor);
            const pickData = {
              ...data,
              pickColor: layer ? this.handleGPUPickMesh(layer.pickMeshScene, x, y) : 0,
              layerId: layer ? layer.id : null,
            };
            this.on(MAP_EVENT.HANDLE_CLICK_RIGHT, pickData);
            this.on(MAP_EVENT.HANDLE_PICK_RIGHT, pickData);
          } else {
            this.on(MAP_EVENT.HANDLE_CLICK_RIGHT, data);
          }
        }
      }
    });
  }

  // 添加地图大小改变事件监听
  ininResize() {
    new ResizeObserver((entries) => {
      // 节流
      if (this._setSizeTimeout) return;
      this._setSizeTimeout = setTimeout(() => {
        const width = this.rootDoc.clientWidth;
        const height = this.rootDoc.clientHeight;
        // 更新摄影机的纵横比
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        // 更新渲染器的大小
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
        this.bloomComposer.setSize(width, height);
        // 更新拾取渲染器的大小
        this.pickLayerTarget.setSize(width, height);
        this.pickMeshTarget.setSize(width, height);
        this.on(MAP_EVENT.UPDATE_RENDERER_SIZE, {
          width,
          height,
        });
        this._setSizeTimeout = null;
      }, 1000 / 120);
    }).observe(this.rootDoc);
  }

  // 设置相机视线与地图平面的夹角、相机与正南方向的夹角
  setPitchAndRotation(pitch = this.pitch, rotation = this.rotation) {
    const oldPitch = this.pitch;
    const oldRotation = this.rotation;
    if (pitch > 90) pitch = 90;
    if (pitch < this.minPitch) pitch = this.minPitch;
    // 相机视线与地图平面的夹角
    this.pitch = pitch;
    // 相机与正南方向的夹角
    this.rotation = rotation;
    const l1 = Math.round(this.cameraControls.getDistance());
    const l2 = l1 * Math.cos((Math.PI / 180) * pitch);

    let z = l1 * Math.sin((Math.PI / 180) * pitch);
    let x = l2 * Math.sin((Math.PI / 180) * rotation);
    let y = l2 * Math.cos((Math.PI / 180) * rotation);
    this.camera.position.set(x, z, y);
    this.camera.lookAt(0, 0, 0);
    if (this.cameraControls) {
      this.cameraControls.target.set(0, 0, 0);
      this.cameraControls.update();
    }

    this.on(MAP_EVENT.UPDATE_CAMERA_ROTATE, {
      oldPitch: oldPitch,
      newPitch: this.pitch,
      oldRotation: oldRotation,
      newRotation: this.rotation,
    });
  }

  // 添加地图摄像机控制器
  initCameraControls() {
    // 设置相机控件轨道控制器OrbitControls
    this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
    // 启用或禁用摄像机水平或垂直旋转。默认值为true。
    // 请注意，可以通过将PolarAngle或者AzimuthAngle的min和max设置为相同的值来禁用单个轴， 这将使得水平旋转或垂直旋转固定为所设置的值。
    this.cameraControls.enableRotate = this._enableRotate;
    // 限制垂直旋转角度
    this.cameraControls.maxPolarAngle = (Math.PI * (90 - this._minPitch)) / 180;
    // 限制水平旋转角度
    // this.cameraControls.maxAzimuthAngle = 0;
    // this.cameraControls.minAzimuthAngle = 0;
    // 是否使用屏幕空间旋转。默认值为false。
    this.cameraControls.screenSpacePanning = false;

    this.cameraControls.minDistance = Math.pow(2, MAP_ZOOM_RANGE.MAX - MAP_ZOOM_RANGE.MAX) * MAP_ZOOM_HEIGHT;
    this.cameraControls.maxDistance = Math.pow(2, MAP_ZOOM_RANGE.MAX - MAP_ZOOM_RANGE.MIN) * MAP_ZOOM_HEIGHT;
    //修改鼠标按键
    // this.cameraControls.mouseButtons = {
    //   LEFT: THREE.MOUSE.PAN,
    //   MIDDLE: THREE.MOUSE.DOLLY,
    //   RIGHT: THREE.MOUSE.ROTATE,
    // };

    this.cameraControls.addEventListener("change", (res) => {
      const height = Math.round(this.cameraControls.getDistance());
      const zoom = MAP_ZOOM_RANGE.MAX - Math.LOG2E * Math.log(height / MAP_ZOOM_HEIGHT);
      this.scene.fog.near = height * 2;
      this.scene.fog.far = height * 3;
      this.camera.far = height * 3;
      this.camera.updateProjectionMatrix();
      this.setZoom(zoom, true);

      const [px, py, pz] = this.camera.position;
      let pitch = Math.round(Math.asin(py / height) * (180 / Math.PI));
      let rotation = Math.round(Math.atan(px / pz) * (180 / Math.PI));

      if (px > 0 && pz > 0) {
        rotation = rotation;
      } else if (px > 0 && pz < 0) {
        rotation = 180 + rotation;
      } else if (px < 0 && pz < 0) {
        rotation = 180 + rotation;
      } else if (px < 0 && pz > 0) {
        rotation = 360 + rotation;
      }
      if (Math.abs(this.pitch - pitch) > 1 || Math.abs(this.rotation - rotation) > 1) {
        this.on(MAP_EVENT.UPDATE_CAMERA_ROTATE, {
          oldPitch: this.pitch,
          newPitch: pitch,
          oldRotation: this.rotation,
          newRotation: rotation,
        });
        this.pitch = pitch;
        this.rotation = rotation;
      }

      this.on(MAP_EVENT.UPDATE_CAMERA_HEIGHT, height);
      const [x, y, z] = this.cameraControls.target;
      this.on(MAP_EVENT.UPDATE_CAMERA_POSITION, {
        position: [x, y, z],
        webMercator: this.CanvasXYToWebMercator(x, -z),
      });
    });

    this.cameraControls.addEventListener("end", (res) => {
      const [x, y, z] = this.cameraControls.target;
      if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
        const [lng, lat] = this.CanvasXYToWebMercator(x, -z);
        const position = this.camera.position;
        this.camera.position.set(position.x - x, position.y - y, position.z - z);
        this.camera.lookAt(0, 0, 0);
        this.cameraControls.target.set(0, 0, 0);
        this.setCenter([lng, lat]);
      }
    });
  }

  // 拾取逻辑：
  // 先对图层进行拾取
  // 拾取到图层后在对图层里的模型进行拾取

  // 对图层进行拾取
  handleGPUPickLayer(x, y) {
    // 获取点击位置的坐标
    // const x = data.event.offsetX;
    // const y = data.event.offsetY;
    this.renderer.setRenderTarget(this.pickLayerTarget);
    this.renderer.render(this.pickLayerScene, this.camera);
    this.renderer.setRenderTarget(null);
    // 读取点击位置的颜色
    const pixelBufferLayer = new Uint8Array(4);
    this.renderer.readRenderTargetPixels(this.pickLayerTarget, x, this.pickLayerTarget.height - y, 1, 1, pixelBufferLayer);
    // 将颜色信息转换回对象的唯一标识
    const pickLayerColor = (pixelBufferLayer[0] << 16) | (pixelBufferLayer[1] << 8) | pixelBufferLayer[2];
    return pickLayerColor;
  }

  // 对图层里的模型进行拾取
  handleGPUPickMesh(scene, x, y) {
    // 获取点击位置的坐标
    // const x = data.event.offsetX;
    // const y = data.event.offsetY;
    if (scene) {
      this.pickMeshWorld.remove(...this.pickMeshWorld.children);
      this.pickMeshWorld.add(scene);

      this.renderer.setRenderTarget(this.pickMeshTarget);
      this.renderer.render(this.pickMeshScene, this.camera);
      this.renderer.setRenderTarget(null);

      // 读取点击位置的颜色
      const pixelBufferMesh = new Uint8Array(4);
      this.renderer.readRenderTargetPixels(this.pickMeshTarget, x, this.pickMeshTarget.height - y, 1, 1, pixelBufferMesh);
      // 将颜色信息转换回对象的唯一标识
      const pickColor = (pixelBufferMesh[0] << 16) | (pixelBufferMesh[1] << 8) | pixelBufferMesh[2];
      this.pickMeshWorld.remove(scene);
      return pickColor;
    } else {
      return 0;
    }
  }

  // 添加图层
  addLayer(layer) {
    layer.onAdd(this);
    this.layers.push(layer);
    this.layers.sort((a, b) => a.zIndex - b.zIndex);
  }

  // 移除图层
  removeLayer(layer) {
    let index = this.layers.findIndex((v) => v.id == layer.id);
    if (index > -1) {
      this.layers.splice(index, 1);
      layer.onRemove();
    }
  }

  // 事件通知
  on(type, data) {
    this.handleEventListener(type, data);
    for (const layer of this.layers) {
      try {
        layer.on(type, data);
      } catch (error) {
        console.error(error);
      }
    }
  }

  // 渲染前事件
  beforeRender() {
    for (const layer of this.layers) {
      // new Promise((resolve) => {
      layer.beforeRender(this);
      //   resolve();
      // });
    }
  }

  // 渲染后事件
  afterRender() {
    for (const layer of this.layers) {
      // new Promise((resolve) => {
      layer.afterRender(this);
      //   resolve();
      // });
    }
  }

  // 渲染事件
  render() {
    for (const layer of this.layers) {
      // new Promise((resolve) => {
      layer.render(this);
      //   resolve();
      // });
    }
    this.bloomComposer.render();
    this.composer.render();
  }

  // 渲染循环
  animation() {
    this.beforeRender();
    this.on(MAP_EVENT.LAYER_BEFORE_RENDER, this);
    this.render();
    this.afterRender();
    this.on(MAP_EVENT.LAYER_AFTER_RENDER, this);
    // this.stats.update();
    window.requestAnimationFrame(this.animation.bind(this));
  }

  dispose() {
    // TODO
    const layers = [...this.layers];
    for (const layer of layers) {
      this.removeLayer(layer)
      layer.dispose();
    }
  }

  // 设置相机到观察点的距离
  setCameraHeight(height, noChangeZoom) {
    if (this.camera) {
      this.camera.position.y = height;
      this.scene.fog.near = height * 2;
      this.scene.fog.far = height * 3;
      this.camera.far = height * 3;
      this.camera.updateProjectionMatrix();
      this.on(MAP_EVENT.UPDATE_CAMERA_HEIGHT, height);

      if (!noChangeZoom) {
        let zoom = MAP_ZOOM_RANGE.MAX - Math.LOG2E * Math.log(height / MAP_ZOOM_HEIGHT);
        this.setZoom(zoom, true);
      }
    }
  }

  // 设置缩放层级
  setZoom(zoom, noChangeHeight) {
    // zoom = Math.floor(zoom * 1000) / 1000;
    if (zoom < MAP_ZOOM_RANGE.MIN) {
      zoom = MAP_ZOOM_RANGE.MIN;
    } else if (zoom > MAP_ZOOM_RANGE.MAX) {
      zoom = MAP_ZOOM_RANGE.MAX;
    }
    if (!noChangeHeight && this.camera) {
      let height2 = Math.pow(2, MAP_ZOOM_RANGE.MAX - zoom) * MAP_ZOOM_HEIGHT;
      this.setCameraHeight(height2);
    }
    if (this.zoom != zoom) {
      this.zoom = zoom;
      this.on(MAP_EVENT.UPDATE_ZOOM, zoom);
    }
  }

  // 设置地图中心点
  setCenter(center) {
    if (JSON.stringify(this.center) != JSON.stringify(center)) {
      this.center = center;
      this.on(MAP_EVENT.UPDATE_CENTER);
    }
  }

  // 获取最佳缩放层级和中心点
  getFitZoomAndCenterPoints(list) {
    if (list.length == 0) {
      return {
        height: this.cameraHeight,
        center: [...this.center],
        zoom: this.zoom,
      };
    }
    let maxX = 0,
      maxY = 0,
      minX = Number.MAX_SAFE_INTEGER,
      minY = Number.MAX_SAFE_INTEGER;
    for (const point of list) {
      maxX = Math.max(maxX, point[0]);
      maxY = Math.max(maxY, point[1]);
      minX = Math.min(minX, point[0]);
      minY = Math.min(minY, point[1]);
    }

    let lenX = maxX - minX;
    let lenY = maxY - minY;
    let { minX: _minX, minY: _minY, maxX: _maxX, maxY: _maxY } = this.getWindowRangeAndWebMercator();

    let _lenX = _maxX - _minX;
    let _lenY = _maxY - _minY;
    let _height = this.cameraHeight;

    let height = Math.max((_height * lenX * 1.5) / _lenX, (_height * lenY * 1.5) / _lenY);
    return {
      height: height,
      center: [(maxX + minX) / 2, (maxY + minY) / 2],
      zoom: MAP_ZOOM_RANGE.MAX - Math.LOG2E * Math.log(height / MAP_ZOOM_HEIGHT),
    };
  }

  // 获取窗口范围并转换成WebMercator
  getWindowRangeAndWebMercator() {
    const width = this.rootDoc.clientWidth;
    const height = this.rootDoc.clientHeight;
    const center = [...this.center];
    const topLeft = this.WindowXYToWebMercator(0, 0) || center;
    const buttomLeft = this.WindowXYToWebMercator(0, height) || center;
    const buttomRight = this.WindowXYToWebMercator(width, height) || center;
    const topRight = this.WindowXYToWebMercator(width, 0) || center;
    let maxX = Math.max(topLeft[0], buttomLeft[0], buttomRight[0], topRight[0]);
    let minX = Math.min(topLeft[0], buttomLeft[0], buttomRight[0], topRight[0]);
    let maxY = Math.max(topLeft[1], buttomLeft[1], buttomRight[1], topRight[1]);
    let minY = Math.min(topLeft[1], buttomLeft[1], buttomRight[1], topRight[1]);
    return {
      topLeft: topLeft,
      buttomLeft: buttomLeft,
      buttomRight: buttomRight,
      topRight: topRight,
      maxX: maxX,
      minX: minX,
      maxY: maxY,
      minY: minY,
    };
  }

  // 把渲染坐标转换成WebMercator
  CanvasXYToWebMercator(x, y, cx = this.center[0], cy = this.center[1]) {
    return [x + cx, y + cy];
  }

  // 把WebMercator转换成渲染坐标
  WebMercatorToCanvasXY(x, y, cx = this.center[0], cy = this.center[1]) {
    return [x - cx, y - cy];
  }

  // 把WGS84转换成渲染坐标
  WGS84ToCanvasXY(lng, lat, cx = this.center[0], cy = this.center[1]) {
    return this.WebMercatorToCanvasXY(...WGS84ToMercator(lng, lat, cx, cy));
  }

  // 把EPSG4526转换成渲染坐标
  EPSG4526ToCanvasXY(lng, lat, cx = this.center[0], cy = this.center[1]) {
    return this.WebMercatorToCanvasXY(...EPSG4526ToMercator(lng, lat, cx, cy));
  }

  // 把窗口坐标换成WebMercator
  WindowXYToWebMercator(x, y) {
    let [x1, y1] = this.WindowXYToCanvasXY(x, y);
    if (x1 == -Infinity) x1 = -3.5 * this.cameraHeight;
    if (x1 == Infinity) x1 = 3.5 * this.cameraHeight;
    if (y1 == Infinity) y1 = -3.5 * this.cameraHeight;
    if (y1 == -Infinity) y1 = 3.5 * this.cameraHeight;
    return this.CanvasXYToWebMercator(x1, y1);
  }

  // 把窗口坐标换成渲染坐标
  WindowXYToCanvasXY(x, y) {
    const origin = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld);
    const direction = new THREE.Vector3((x / this.rootDoc.clientWidth) * 2 - 1, -(y / this.rootDoc.clientHeight) * 2 + 1, 0.5).unproject(this.camera);

    const y3 = 0;
    const px = ((origin.x - direction.x) / (origin.y - direction.y)) * (y3 - direction.y) + direction.x;
    const pz = ((origin.z - direction.z) / (origin.y - direction.y)) * (y3 - direction.y) + direction.z;

    return [px, -pz];
  }
}
