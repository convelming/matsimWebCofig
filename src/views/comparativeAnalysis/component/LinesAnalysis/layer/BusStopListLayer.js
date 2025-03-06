import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import { getTextImage } from "@/mymap/utils/index";
import { guid } from "@/utils/utils";

const STOP_SIZE = 100;

export class BusStopListLayer extends Layer {
  name = "BusStopListLayer";
  size = 50;
  color = new THREE.Color(0x000000);

  data = [];
  center = [0, 0];
  texture = new THREE.TextureLoader().load(require("@/assets/image/point.png"));

  // 初始化函数
  constructor(opt) {
    super(opt);

    this.size = opt.size || this.size;
    this.data = opt.data || this.data;
    this.color = new THREE.Color(opt.color || this.color);

    this.geometry = new THREE.PlaneGeometry(STOP_SIZE, STOP_SIZE);
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
          #if defined(USE_MAP) 
            vec4 textColor = texture2D( map, vUv );
            float length = (textColor.r + textColor.g + textColor.b) / 3.0  ;
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

    this.pickGeometry = new THREE.PlaneGeometry(STOP_SIZE * 1.1, STOP_SIZE * 1.1);
    this.pickMaterial = new THREE.MeshBasicMaterial();

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
      })
    );
    this.labelMesh.center.set(0.5, -0.5);
  }

  // 监听事件
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
      this.handleEventListener(type);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setSize(this.map.cameraHeight / 40);
    }
    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE_PICK) {
      let labelData = null;
      if (data.layerId == this.id) {
        const pickColor = new THREE.Color(data.pickColor);
        const item = this.data.find((v2) => v2.pickColor.equals(pickColor));
        if (item) {
          if (this.labelData && item.data.stopName == this.labelData.name) {
            labelData = this.labelData;
          } else {
            if (this.labelData) this.labelData.map.dispose();
            labelData = {};
            const { url, width, height } = getTextImage(item.data.stopName);
            const texture = new THREE.TextureLoader().load(url);
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            labelData.map = texture;
            labelData.mapWidth = width;
            labelData.mapHeight = height;
            labelData.x = item.data.coord.x;
            labelData.y = item.data.coord.y;
            labelData.name = item.data.stopName;
          }
        }
      }
      this.labelData = labelData;
      this.updateLabel();
    }
  }

  // 添加到地图时的回调
  onAdd(map) {
    super.onAdd(map);
    this.setSize(this.map.cameraHeight / 40);
    this.update();
  }

  // 设置大小
  setSize(size) {
    const [cx, cy] = this.center;
    this.size = size;
    const _scale = this.size / STOP_SIZE;
    const data = this.data;
    const count = data.length;
    for (let i = 0; i < count; i++) {
      const { coord } = data[i];
      const positionV3 = new THREE.Vector3(coord.x - cx, coord.y - cy, i / count);
      const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);

      const matrix = new THREE.Matrix4();
      matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

      if (this.mesh) this.mesh.setMatrixAt(i, matrix);
      if (this.pickLayerMesh) this.pickLayerMesh.setMatrixAt(i, matrix);
      if (this.pickMesh) this.pickMesh.setMatrixAt(i, matrix);
    }

    if (this.mesh) this.mesh.instanceMatrix.needsUpdate = true;
    if (this.pickLayerMesh) this.pickLayerMesh.instanceMatrix.needsUpdate = true;
    if (this.pickMesh) this.pickMesh.instanceMatrix.needsUpdate = true;
    

    if (this.labelData && this.labelMesh) {
      const scale = this.map.cameraHeight / 2000;
      this.labelMesh.scale.set(this.labelData.mapWidth * scale, this.labelData.mapHeight * scale, 1);
    }
  }

  // 设置数据
  setData(data) {
    try {
      let maxX = 0,
        minX = Number.MAX_SAFE_INTEGER,
        maxY = 0,
        minY = Number.MAX_SAFE_INTEGER;
      const _data = [];
      let pickColorNum = 1;
      for (const line of data) {
        if (line && line.stops) {
          for (const { stop } of line.stops) {
            const { x, y } = stop.coord;
            if (x > maxX) maxX = x;
            if (x < minX) minX = x;
            if (y > maxY) maxY = y;
            if (y < minY) minY = y;
            const item = {
              coord: { x, y },
              pickColor: new THREE.Color(++pickColorNum),
              uuid: guid(),
              data: {
                coord: { x, y },
                stopId: stop.id,
                linkId: stop.linkId,
                stopName: stop.name,
                routeId: line.routeId,
              },
            };
            _data.push(item);
          }
        }
      }
      this.center = [(maxX + minX) / 2, (maxY + minY) / 2];
      this.data = _data;
      this.update();
    } catch (error) {
      console.log(error);
      this.data = [];
      this.center = [0, 0];
      this.update();
    }
  }

  // 更新图层
  update() {
    this.clearScene();
    if (!this.map) return;
    if (!this.data || this.data.length <= 0) return;

    const data = this.data;
    const count = data.length;
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, count);
    const pickLayerMesh = new THREE.InstancedMesh(this.pickGeometry, this.pickMaterial, count);
    const pickMesh = new THREE.InstancedMesh(this.pickGeometry, this.pickMaterial, count);
    const [cx, cy] = this.center;
    const _scale = this.size / STOP_SIZE;
    for (let i = 0; i < count; i++) {
      const { coord, pickColor } = data[i];

      const positionV3 = new THREE.Vector3(coord.x - cx, coord.y - cy, i / count);
      const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);

      const matrix = new THREE.Matrix4();
      matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

      mesh.setMatrixAt(i, matrix);
      pickLayerMesh.setMatrixAt(i, matrix);
      pickMesh.setMatrixAt(i, matrix);

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
      this.labelMesh.material.setValues({ map: this.labelData.map });
      this.labelMesh.material.needsUpdate = true;
      const scale = this.map.cameraHeight / 2000;
      this.labelMesh.scale.set(this.labelData.mapWidth * scale, this.labelData.mapHeight * scale, 1);
      const [x, y] = this.map.WebMercatorToCanvasXY(this.labelData.x, this.labelData.y);
      this.labelMesh.position.set(x, y, 0);
      this.scene.add(this.labelMesh);
    }
  }

  // 设置颜色
  setColor(color) {
    this.color = new THREE.Color(color);
    this.material.setValues({ color: this.color });
  }

  // 销毁
  dispose() {
    super.dispose();
    // this.texture.dispose();
    // this.geometry.dispose();
    // this.data.length = 0;
    // this.data = [];
    // this.center = [0, 0];
  }
}
