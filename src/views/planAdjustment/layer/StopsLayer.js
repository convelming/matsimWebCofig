import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { getTextImage } from "@/mymap/utils/index";

import { getStopFacilities } from "@/api/index";

import * as Bean from "@/utils/Bean";

export class StopsLayer extends Layer {
  name = "StopsLayer";
  size = 50;
  data = [];
  color = new THREE.Color(0x409eff);
  center = null;
  range = [];

  constructor(opt) {
    super(opt);

    this.size = opt.size || this.size;
    this.data = opt.data || this.data;
    this.color = new THREE.Color(opt.color || this.color);

    this.texture = new THREE.TextureLoader().load(
      require("@/assets/image/point.png")
    );

    this.geometry = new THREE.BufferGeometry();
    this.material = this.getMaterial({
      color: this.color,
      map: this.texture,
      vertexColors: false,
      usePickColor: false,
    });
    this.pickLayerMaterial = this.getMaterial({
      color: this.pickLayerColor,
      vertexColors: false,
      usePickColor: false,
    });

    this.pickMeshMaterial = this.getMaterial({
      vertexColors: true,
      usePickColor: true,
    });

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
      })
    );
  }

  setPickLayerColor(pickLayerColor) {
    this.pickLayerColor = new THREE.Color(pickLayerColor);
    this.pickLayerMaterial.color = this.pickLayerColor;
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
      this.handleEventListener(type);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setSize(this.map.cameraHeight / 30);
      this.update();
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      let item = this.data[data.pickColor - 1];
      if (item) {
        this.handleEventListener(type, item.data);
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
  }

  onAdd(map) {
    super.onAdd(map);
    this.setSize(this.map.cameraHeight / 30);
    this.update();
  }

  setSize(size) {
    this.size = size;

    if (this.material) {
      this.material.setValues({ size });
      this.material.needsUpdate = true;
    }

    if (this.pickLayerMaterial) {
      this.pickLayerMaterial.setValues({ size });
      this.pickLayerMaterial.needsUpdate = true;
    }
    if (this.pickMeshMaterial) {
      this.pickMeshMaterial.setValues({ size });
      this.pickMeshMaterial.needsUpdate = true;
    }
  }

  show() {
    super.show();
    this.update();
  }

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
      this.geometry.dispose();

      const center = new Bean.Coord({
        x: this.map.center[0],
        y: this.map.center[1],
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
      const count = this.data.length;
      const positions = new THREE.BufferAttribute(
        new Float32Array(count * 3),
        3
      );
      const pickColors = new THREE.BufferAttribute(
        new Float32Array(count * 3),
        3
      );
      for (let i = 0; i < count; i++) {
        const { coord, pickColor } = this.data[i];
        positions.setXYZ(i, coord.x, coord.y, 0);
        pickColors.setXYZ(i, pickColor.r, pickColor.g, pickColor.b);
      }

      this.geometry = new THREE.BufferGeometry();
      this.geometry.setAttribute("position", positions);
      this.geometry.setAttribute("pickColor", pickColors);
      this.geometry.computeBoundingSphere();
      this.geometry.needsUpdate = true;

      let [x, y] = this.map.WebMercatorToCanvasXY(...center.toList());

      this.mesh = new THREE.Points(this.geometry, this.material);
      this.mesh.position.set(x, y, 0);
      this.scene.add(this.mesh);

      this.pickLayerMesh = new THREE.Points(
        this.geometry,
        this.pickLayerMaterial
      );
      this.pickLayerMesh.position.set(x, y, 0);
      this.pickLayerScene.add(this.pickLayerMesh);

      this.pickMesh = new THREE.Points(this.geometry, this.pickMeshMaterial);
      this.pickMesh.position.set(x, y, 0);
      this.pickMeshScene.add(this.pickMesh);
    } catch (error) {
    } finally {
      this.updateing = false;
    }
  }

  updateLabel() {
    if (!this.labelData) {
      this.scene.remove(this.labelMesh);
    } else {
      this.labelMesh.material.setValues({ map: this.labelData.map });
      this.labelMesh.material.needsUpdate = true;
      this.labelMesh.scale.set(
        (this.labelData.mapWidth * this.size) / 80,
        (this.labelData.mapHeight * this.size) / 80,
        1
      );
      const [x, y] = this.map.WebMercatorToCanvasXY(
        this.labelData.x,
        this.labelData.y
      );
      this.labelMesh.position.set(x, y + this.size, 10);
      this.scene.add(this.labelMesh);
    }
  }

  getMaterial({ usePickColor, ...opt }) {
    const material = new THREE.PointsMaterial({
      size: this.size,
      transparent: true,
      sizeAttenuation: true,
      vertexColors: true,

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
            if(length(texture2D( map, uv ).rgb) < .01){
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
}
