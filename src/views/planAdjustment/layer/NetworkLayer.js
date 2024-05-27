import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

import NetworkLayerWorker from "../worker/NetworkLayer.worker";

import { getGeomjson } from "@/api/index";


export class NetworkLayer extends Layer {
  name = "NetworkLayer";
  data = null;
  color = new THREE.Color(0x909399);

  loader = new THREE.BufferGeometryLoader();
  texture = new THREE.TextureLoader().load(
    require("@/assets/image/link_top2.png")
  );

  lineWidth = 1;
  lineOffset = 0;
  center = null;
  range = null;

  material = null;
  pickLayerMaterial = null;
  pickMaterial = null;

  highMaterial = null;

  geoList = [];
  center = null;
  range = [];

  constructor(options) {
    super(options);
    this.color = new THREE.Color(opt.color || this.color);
    this.lineWidth = options.lineWidth || this.lineWidth;

    this.loader = new THREE.BufferGeometryLoader();
    // this.update();
    
    this.worker = new NetworkLayerWorker();
    this.worker.onmessage = this.workerOnMessage.bind(this);
    this.worker.onerror = this.workerOnError.bind(this);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, 0);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, 0);
      }
      this.update();
      this.handleEventListener(type);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.update();
      this.setValues({
        lineWidth: this.map.cameraHeight / 160,
      });
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      let color = new THREE.Color(data.pickColor);
      let item = this.data.find((v) => color.equals(v.pickColor));
      if (item) {
        this.handleEventListener(type, item.data);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
    this.setValues({
      lineWidth: this.map.cameraHeight / 160,
    });
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
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
      const res = await getGeomjson({
        xyarr: [
          [maxX1, minY1],
          [maxX1, maxY1],
          [minX1, maxY1],
          [minX1, minY1],
        ],
      });
      this.worker.postMessage({
        list: res.data,
        center: [(maxX + minX) / 2, (maxY + minY) / 2],
      });
    } catch (error) {
    } finally {
      this.updateing = false;
    }
  }
  
  workerOnMessage(event) {
    const { center, data, geoJsonList } = event.data;
    this.center = center;
    this.data = data;

    this.clearScene();
    for (const geo of this.geoList) {
      geo.dispose();
    }
    this.geoList = [];

    this.material = this.getMaterial({
      // map: this.texture,
      color: this.color,
    });

    this.pickLayerMaterial = this.getMaterial({
      color: this.pickLayerColor,
      pickOffset: 10,
    });

    this.pickMaterial = this.getMaterial({
      vertexColors: true,
      usePickColor: true,
      pickOffset: 10,
    });
    for (const geoJson of geoJsonList) {
      const [x, y] = this.map.WebMercatorToCanvasXY(center[0], center[1]);

      const geometry = this.loader.parse(geoJson);
      this.geoList.push(geometry);

      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.userData.center = center;
      mesh.position.set(x, y, 0);
      this.scene.add(mesh);

      const pickLayerMesh = new THREE.Mesh(geometry, this.pickLayerMaterial);
      pickLayerMesh.userData.center = center;
      pickLayerMesh.position.set(x, y, 0);
      this.pickLayerScene.add(pickLayerMesh);

      const pickMesh = new THREE.Mesh(geometry, this.pickMaterial);
      pickMesh.userData.center = center;
      pickMesh.position.set(x, y, 0);
      this.pickMeshScene.add(pickMesh);
    }
  }

  workerOnError(event) {
    this.center = null;
    this.data = null;
    this.clearScene();
    for (const geo of this.geoList) {
      geo.dispose();
    }
    this.geoList = [];
  }

  setValues(opt) {
    for (const key in opt) {
      this[key] = opt[key];
    }
    if (this.material) this.material.needsUpdate = true;
    if (this.pickLayerMaterial) this.pickLayerMaterial.needsUpdate = true;
    if (this.pickMaterial) this.pickMaterial.needsUpdate = true;
  }

  getMaterial({ usePickColor, pickOffset, ...opt }) {
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      wireframe: false,
      ...opt,
    });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
          #include <common>


          attribute vec3 pickColor;
          attribute float side;
          attribute vec2 startPosition;
          attribute vec2 endPosition;
          varying float lineLength;
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float lineWidth = ${Number(
            this.lineWidth + (pickOffset || 0)
          ).toFixed(2)};
          float lineOffset = ${Number(this.lineOffset).toFixed(2)};
          float offset = lineWidth / 2.0  * side + lineOffset;

          float lenA = length(position.xy - startPosition);
          float lenB = length(position.xy - endPosition);

          #ifdef USE_MAP
            if(vUv.y <= 0.5){
              lineLength = lenB;
            }else {
              lineLength = lenA;
            }
          #endif

          if(lenA == 0. && lenB == 0.) {
            transformed = position;
          } else {
            vec2 dirA = normalize(position.xy - startPosition);
            vec2 dirB = normalize(position.xy - endPosition);
  
            if(lenA == 0.) {
              float angle = PI / 2.0;
              vec2 normal = vec2(-dirB.y, dirB.x);
              transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
            } else if(lenB == 0.) {
              float angle = PI / 2.0;
              vec2 normal = vec2(dirA.y, -dirA.x);
              transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
            } else {
              vec2 dir = normalize(dirB - dirA);
              vec2 normal = vec2(-dir.y, dir.x);
              float angle = acos(dot(dirB, normal));
              if(angle < 0.2) angle = 0.2;
              transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
            }
          }
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
        #include <common>
        varying float lineLength;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
        #ifdef USE_MAP
          float lineWidth = ${Number(this.lineWidth).toFixed(2)} * 2.0;
          float l = mod(vUv.y * lineLength, lineWidth) / lineWidth;
          if(0.0 < l && l < 0.9){
            vec4 sampledDiffuseColor = texture2D(map, vec2(vUv.x,  l));
            if(sampledDiffuseColor.a > 0.5) {
              diffuseColor = vec4(1.0);
            }
          }
        #endif
        `
      );
      if (usePickColor) {
        shader.vertexShader = shader.vertexShader.replace(
          "#include <color_vertex>",
          `
            #include <color_vertex>
            #if defined( USE_COLOR_ALPHA )
              vColor = vec4(pickColor,1.0);
            #elif defined( USE_COLOR )
              vColor = pickColor;
            #endif
          `
        );
      }
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
        lineWidth: this.lineWidth,
        lineOffset: this.lineOffset,
        usePickColor: usePickColor,
        pickOffset: pickOffset,
      });
    };
    return material;
  }
}
