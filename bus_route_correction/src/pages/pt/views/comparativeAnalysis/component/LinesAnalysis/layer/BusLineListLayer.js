import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { guid } from "@/utils/utils";

const EARTH_RADIUS = 20037508.3427892;

export class BusLineListLayer extends Layer {
  name = "BusLineListLayer";
  lineWidth = 10;
  color = new THREE.Color("red");
  center = null;
  data = null;
  texture = new THREE.TextureLoader().load(require("@/assets/image/link_top5.png"));
  isDashed = false;

  // 初始化函数
  constructor(opt) {
    super(opt);
    this.color = new THREE.Color(opt.color || this.color);
    this.texture = opt.texture || this.texture;
    this.isDashed = !!opt.isDashed;

    this.material = this.getLineMaterial({
      // map: this.texture,
      color: this.color,
    });
  }

  // 添加到地图时的回调
  onAdd(map) {
    super.onAdd(map);
    this.setLineWidth(this.map.cameraHeight / 130);
    this.update();
  }

  // 事件处理
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
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      this.handleEventListener(type, data);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setLineWidth(this.map.cameraHeight / 130);
    }
  }

  // 地图渲染刷新回调函数
  render() {
    super.render();
    // this.texture.offset.y -= 0.01;
  }

  // 设置线宽
  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
    for (const mesh of this.scene.children) {
      mesh.material.needsUpdate = true;
    }
    for (const mesh of this.pickLayerScene.children) {
      mesh.material.needsUpdate = true;
    }
    for (const mesh of this.pickMeshScene.children) {
      mesh.material.needsUpdate = true;
    }
  }

  // 设置颜色
  setColor(color) {
    this.color = new THREE.Color(color);
    this.material.setValues({ color: this.color });
    this.material.needsUpdate = true;
  }

  // 设置绘制数据
  setData(data) {
    try {
      let maxX = 0,
        minX = Number.MAX_SAFE_INTEGER,
        maxY = 0,
        minY = Number.MAX_SAFE_INTEGER;
      const _data = [];
      let pickColorNum = 1;

      for (const line of data) {
        if (line && line.route) {
          const routeItem = {
            linkList: [],
            uuid: guid(),
            pickColor: new THREE.Color(++pickColorNum),
            data: {
              routeId: line.routeId,
            },
          };
          let lineLength = 0;
          for (const routeKey of line.route.route) {
            const linkItem = line.route.routeLink[routeKey];

            const { x, y } = linkItem.fromCoord;
            if (x > maxX) maxX = x;
            if (x < minX) minX = x;
            if (y > maxY) maxY = y;
            if (y < minY) minY = y;

            const item = {
              fromLength: lineLength,
              fromCoord: linkItem.fromCoord,
              toLength: lineLength + linkItem.length,
              toCoord: linkItem.toCoord,
              pickColor: this.getPickMeshColor(),
            };
            lineLength += linkItem.length;
            routeItem.linkList.push(item);
          }
          _data.push(routeItem);
        }
      }
      this.center = [(maxX + minX) / 2, (maxY + minY) / 2];
      this.data = _data;
      this.update();
    } catch (error) {
      console.log(error);
      this.data = null;
      this.center = [0, 0];
      this.update();
    }
  }

  // 更新图层
  update() {
    this.clearScene();
    if (!this.map) return;
    if (!this.data) return;
    const [cx, cy] = this.center;

    this.geometry = this.getLineGeometry(this.data, cx, cy);
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    const [x, y] = this.map.WebMercatorToCanvasXY(cx, cy);
    this.mesh.position.set(x, y, this.mesh.position.z);
    this.scene.add(this.mesh);
  }

  // 获取线纹理
  getLineMaterial({ ...opt }) {
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      ...opt,
    });

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
          vLineLength = lineLength;
          float lineWidth = ${Number(this.lineWidth).toFixed(2)};
          float offset = lineWidth / 2.0 * side;

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
          float lineWidth = ${Number(this.lineWidth).toFixed(2)};
          #ifdef USE_MAP
            float l = mod(vLineLength, 300.0) / (lineWidth  * 2.0);
            if(0.0 < l && l < 1.0){
              vec4 sampledDiffuseColor = texture2D(map, vec2(vUv.x,  l));
              if(sampledDiffuseColor.a > 0.6) {
                diffuseColor = vec4(1.0);
              }
            }
          #endif
          if(${!!this.isDashed}){
            float dl = mod(vLineLength, lineWidth * 5.0) / (lineWidth * 5.0);
            if(0.0 < dl && dl < 0.5){
              diffuseColor = vec4(1.0,1.0,1.0,0.0);
            }
          }
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
        isDashed: this.isDashed,
      });
    };
    return material;
  }

  // 获取线几何体
  getLineGeometry(lineList, cx, cy) {
    const geometryList = [];
    for (const line of lineList) {
      const data = line.linkList;
      const length = data.length;

      const attrPosition = new THREE.BufferAttribute(new Float32Array(length * 4 * 3 + 2 * 3), 3);
      const attrStartPosition = new THREE.BufferAttribute(new Float32Array(length * 4 * 2 + 2 * 2), 2);
      const attrEndPosition = new THREE.BufferAttribute(new Float32Array(length * 4 * 2 + 2 * 2), 2);
      const attrSide = new THREE.BufferAttribute(new Float32Array(length * 4 + 2), 1);
      const attrIndex = new THREE.BufferAttribute(new Uint16Array(length * 2 * 3 + 6), 1);
      const attrUv = new THREE.BufferAttribute(new Float32Array(length * 4 * 2 + 2), 2);
      const attrColor = new THREE.BufferAttribute(new Float32Array(length * 4 * 3 + 2 * 3), 3);
      const attrLength = new THREE.BufferAttribute(new Float32Array(length * 4 + 2), 1);

      const pickColor = line.pickColor;
      for (let index = 0; index < data.length; index++) {
        const link = data[index];
        const prevLink = index == 0 ? link : data[index - 1];
        const nextLink = index == data.length - 1 ? link : data[index + 1];

        const prevFromxy = { x: prevLink.fromCoord.x - cx, y: prevLink.fromCoord.y - cy };
        const linkFromxy = { x: link.fromCoord.x - cx, y: link.fromCoord.y - cy };
        const linkToxy = { x: link.toCoord.x - cx, y: link.toCoord.y - cy };
        const nextToxy = { x: nextLink.toCoord.x - cx, y: nextLink.toCoord.y - cy };

        // fromNode
        {
          attrStartPosition.setXY(index * 4, prevFromxy.x, prevFromxy.y);
          attrStartPosition.setXY(index * 4 + 1, prevFromxy.x, prevFromxy.y);
          attrPosition.setXYZ(index * 4, linkFromxy.x, linkFromxy.y, 0);
          attrPosition.setXYZ(index * 4 + 1, linkFromxy.x, linkFromxy.y, 0);
          attrEndPosition.setXY(index * 4, linkToxy.x, linkToxy.y);
          attrEndPosition.setXY(index * 4 + 1, linkToxy.x, linkToxy.y);
          attrSide.setX(index * 4, 1);
          attrSide.setX(index * 4 + 1, -1);
          attrLength.setX(index * 4, link.fromLength);
          attrLength.setX(index * 4 + 1, link.fromLength);

          attrColor.setXYZ(index * 4, pickColor.r, pickColor.g, pickColor.b);
          attrColor.setXYZ(index * 4 + 1, pickColor.r, pickColor.g, pickColor.b);
        }
        // toNode
        {
          attrStartPosition.setXY(index * 4 + 2, linkFromxy.x, linkFromxy.y);
          attrStartPosition.setXY(index * 4 + 3, linkFromxy.x, linkFromxy.y);
          attrPosition.setXYZ(index * 4 + 2, linkToxy.x, linkToxy.y, 0);
          attrPosition.setXYZ(index * 4 + 3, linkToxy.x, linkToxy.y, 0);
          attrEndPosition.setXY(index * 4 + 2, nextToxy.x, nextToxy.y);
          attrEndPosition.setXY(index * 4 + 3, nextToxy.x, nextToxy.y);
          attrSide.setX(index * 4 + 2, 1);
          attrSide.setX(index * 4 + 3, -1);
          attrLength.setX(index * 4 + 2, link.toLength);
          attrLength.setX(index * 4 + 3, link.toLength);

          attrColor.setXYZ(index * 4 + 2, pickColor.r, pickColor.g, pickColor.b);
          attrColor.setXYZ(index * 4 + 3, pickColor.r, pickColor.g, pickColor.b);
        }

        attrUv.setXY(index * 4, 0, 0);
        attrUv.setXY(index * 4 + 1, 1, 0);
        attrUv.setXY(index * 4 + 2, 0, 1);
        attrUv.setXY(index * 4 + 3, 1, 1);

        attrIndex.setX(index * 6, index * 4);
        attrIndex.setX(index * 6 + 1, index * 4 + 1);
        attrIndex.setX(index * 6 + 2, index * 4 + 3);
        attrIndex.setX(index * 6 + 3, index * 4);
        attrIndex.setX(index * 6 + 4, index * 4 + 3);
        attrIndex.setX(index * 6 + 5, index * 4 + 2);
      }

      const geometry = new THREE.BufferGeometry();

      geometry.setAttribute("position", attrPosition);
      geometry.setAttribute("startPosition", attrStartPosition);
      geometry.setAttribute("endPosition", attrEndPosition);
      geometry.setAttribute("side", attrSide);
      geometry.setAttribute("lineLength", attrLength);
      geometry.setAttribute("uv", attrUv);
      geometry.setAttribute("color", attrColor);
      geometry.index = attrIndex;
      geometryList.push(geometry);
    }
    return geometryList.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(geometryList) : new THREE.BufferGeometry();
  }
}
