

import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

// import GeoJSONLayerWorker from "../worker/GeoJSONLayer.worker";
import GeoJSONLayerWorker from "./GeoJSONLayer.worker";

const POINT_SIZE = 80;

export class GeoJSONLayer extends Layer {

  color = new THREE.Color(0xffa500);


  pointColor = new THREE.Color(0xffa500);
  pointScale = 1;
  pointTexture = new THREE.TextureLoader().load(require("@/assets/image/point2.png"));

  lineColor = new THREE.Color(0xffa500);
  lineWidth = 100;
  lineTexture = null;

  polygonColor = new THREE.Color(0xffa500);

  setPointScale(pointScale) {
    this.pointScale = pointScale;
    this.scene.traverse(item => {
      if (item.isMesh && item.userData.type == "PointItem") {
        item.scale.set(pointScale, pointScale, 1);
      }
    });
  }
  setPointColor(pointColor) {
    this.pointColor = new THREE.Color(pointColor);
    this.pointMaterial.setValues({ color: this.pointColor })
    this.pointMaterial.needsUpdate = true;
  }
  setLineColor(lineColor) {
    this.lineColor = new THREE.Color(lineColor);
    this.lineMaterial.setValues({ color: this.lineColor })
    this.lineMaterial.needsUpdate = true;
  }
  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
    this.lineMaterial.needsUpdate = true;
  }
  setPolygonColor(polygonColor) {
    this.polygonColor = new THREE.Color(polygonColor);
    this.polygonMaterial.setValues({ color: this.polygonColor });
    this.polygonMaterial.needsUpdate = true;
  }

  constructor(opt) {
    super(opt);
    this.pointColor = new THREE.Color(opt.pointColor || this.pointColor);
    this.pointScale = opt.pointScale || this.pointScale;
    this.lineColor = new THREE.Color(opt.lineColor || this.lineColor);
    this.lineWidth = opt.lineWidth || this.lineWidth;
    this.polygonColor = new THREE.Color(opt.polygonColor || this.polygonColor);


    this.pointGeometry = new THREE.PlaneGeometry(POINT_SIZE, POINT_SIZE);

    this.pointMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      map: this.pointTexture,
      color: this.pointColor,
    })

    this.lineMaterial = this.getLineMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      map: this.lineTexture,
      color: this.lineColor,
    });
    this.polygonMaterial = new THREE.MeshBasicMaterial({
      color: this.polygonColor,
      transparent: true,
    });

    this.worker = new GeoJSONLayerWorker();
    this.worker.onmessage = (event) => {
      const [key, postTime, callTime] = event.data;
      const data = event.data.slice(3);
      switch (key) {
        case 1:
          this.handleSetDataCallback(data);
          break;
        case 2:
          this.handleRenderCallback(data);
          break;
      }
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
  }

  getLineMaterial(opt) {
    const material = new THREE.MeshBasicMaterial(opt);
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
          #include <common>

          attribute vec3 pickColor;
          attribute float side;
          attribute float lineLength;
          attribute vec2 startPosition;
          attribute vec2 endPosition;
          varying float vLineLength;
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float lineWidth = ${Number(this.lineWidth).toFixed(2)};
          float offset = lineWidth / 2.0 * side;
          vLineLength = lineLength;

          float lenA = length(position.xy - startPosition);
          float lenB = length(position.xy - endPosition);

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
              if(angle > 2.94) angle = 2.94;
              transformed = vec3(position.xy + normal * offset / sin(angle), position.z);
            }
          }
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
          #include <common>
          varying float vLineLength;
          `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
            #ifdef USE_MAP
              float lineWidth = ${Number(this.lineWidth).toFixed(2)} * 2.0;
              float l = mod(vLineLength, lineWidth * 5.0) / lineWidth ;
              if(0.0 < l && l < 1.0){
                vec4 sampledDiffuseColor = texture2D(map, vec2(vUv.x,  l));
                if(sampledDiffuseColor.a > 0.6) {
                  diffuseColor = vec4(1.0);
                }
              }
            #endif
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
        lineWidth: this.lineWidth,
      });
    };
    return material;
  }

  handleRenderCallback(array) {

  }

  handleSetDataCallback(array) {
    this.center = [array[0], array[1]];
    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.busGroup.position.set(x, y, 0);
    this.pickLayerMesh.position.set(x, y, 0);
    this.pickMeshMesh.position.set(x, y, 0);
    this.canRender = true;
    if (this.canRender) this.postRender();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
  }

  setData(data) {
    if (data instanceof Int8Array) {
      const array = new Int8Array(data.length + 1);
      array.set([1], 0);
      array.set(data, 2);
      this.worker.postMessage(array, [array.buffer]);
    } else {
      throw new Error("data instanceof Int8Array");
    }
  }
}









