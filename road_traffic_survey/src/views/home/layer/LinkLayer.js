import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

const color0 = 0xe6a23c;
const color1 = 0xf56c6c;
const color2 = 0x409eff;
export const DEFAULT_COLOR = new THREE.Color(0x909399);

export const COLOR_LIST = {
  0: new THREE.Color(color0), // 其他 橙色
  1: new THREE.Color(color1), // 人工 红色
  2: new THREE.Color(color2), // 视频 蓝色

  "0,1": new THREE.Color((color0 + color1) / 2),
  "1,0": new THREE.Color((color0 + color1) / 2),

  "0,2": new THREE.Color((color0 + color2) / 2),
  "2,0": new THREE.Color((color0 + color2) / 2),

  "1,2": new THREE.Color((color1 + color2) / 2),
  "2,1": new THREE.Color((color1 + color2) / 2),

  "0,1,2": new THREE.Color((color0 + color1 + color2) / 3),
  "1,0,2": new THREE.Color((color0 + color1 + color2) / 3),
  "1,2,0": new THREE.Color((color0 + color1 + color2) / 3),
  "0,2,1": new THREE.Color((color0 + color1 + color2) / 3),
  "2,0,1": new THREE.Color((color0 + color1 + color2) / 3),
  "2,1,0": new THREE.Color((color0 + color1 + color2) / 3),
};

export class LinkLayer extends Layer {
  name = "LinkLayer";
  data = null;
  color = null;

  lineWidth = 4;
  twoWayOffset = 0;

  selectId = null;
  selectMesh = null;

  get isTwoWay() {
    return this.data.length - 1;
  }

  material = null;
  pickLayerMaterial = null;
  pickMaterial = null;

  constructor(options) {
    super(options);
    this.setData(options.data);
    this.color = options.color ? new THREE.Color(options.color) : DEFAULT_COLOR;
    this.lineWidth = options.lineWidth || 4;
    this.twoWayOffset = options.twoWayOffset || 0;
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
      this.handleEventListener(type);
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      let pickColor = new THREE.Color(data.pickColor);
      for (const v1 of this.data) {
        let item = v1.find((v2) => v2.pickColor.equals(pickColor));
        if (item) {
          this.selectId = item.id;
          this.updateSelectLink();
          this.handleEventListener(type, item);
          break;
        } else {
          this.selectId = -1;
          this.updateSelectLink();
        }
      }
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  setData(data, selectId) {
    try {
      this.selectId = selectId;
      this.center = data[0][0].fromxy;
      this.data = JSON.parse(JSON.stringify(data)).map((v) => {
        let length = v.length;
        let list = [];

        for (let i = 0; i < length; i++) {
          const v2 = JSON.parse(JSON.stringify(v[i]));
          v2.pickColor = this.getPickMeshColor();
          v2.fromPoint = v2.fromxy.map((v4, i) =>
            Math.round(v4 - this.center[i])
          );
          v2.toPoint = v2.toxy.map((v4, i) => Math.round(v4 - this.center[i]));
          list.push(v2);
        }

        return list;
      });
    } catch (error) {
      this.data = null;
      this.selectId = null;
    }
    this.update();
    this.updateSelectLink();
  }

  setSelectId(selectId) {
    if (this.selectId != selectId) {
      this.selectId = selectId;
      this.updateSelectLink();
    }
  }

  update() {
    this.clearScene();

    if (!this.map) return;
    if (!this.data) return;

    this.material = this.getMaterial({
      vertexColors: true,
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

    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    // const [x, y] = [0,0];
    let geometry = this.getGeometry();

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.position.set(x, y, 0);
    this.scene.add(mesh);

    const pickLayerMesh = new THREE.Mesh(geometry, this.pickLayerMaterial);
    pickLayerMesh.position.set(x, y, 0);
    this.pickLayerScene.add(pickLayerMesh);

    const pickMesh = new THREE.Mesh(geometry, this.pickMaterial);
    pickMesh.position.set(x, y, 0);
    this.pickMeshScene.add(pickMesh);
  }

  setValues(opt) {
    for (const key in opt) {
      this[key] = opt[key];
    }
    if (this.material) this.material.needsUpdate = true;
    if (this.pickLayerMaterial) this.pickLayerMaterial.needsUpdate = true;
    if (this.pickMaterial) this.pickMaterial.needsUpdate = true;
    if (this.selectMesh) this.selectMesh.material.needsUpdate = true;
  }

  updateSelectLink() {
    if (this.selectMesh) {
      this.selectMesh.removeFromParent();
      this.selectMesh = null;
    }
    if (!this.selectId) return;
    let geometry = this.getSelectGeometry();
    let material = this.getMaterial({
      color: 0xffffff,
      opacity: 0.8,
      transparent: true,
    });
    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.selectMesh = new THREE.Mesh(geometry, material);
    this.selectMesh.position.set(x, y, 0);
    this.scene.add(this.selectMesh);
  }

  getSelectGeometry() {
    const attrPosition = [];
    const attrStartPosition = [];
    const attrEndPosition = [];
    const attrSide = [];
    const attrIndex = [];
    const attrUv = [];
    const attrPickColor = [];
    const attrColor = [];
    for (const data of this.data) {
      for (let index = 0; index < data.length; index++) {
        const link = data[index];
        if (link.id == this.selectId) {
          const prevLink = index == 0 ? link : data[index - 1];
          const nextLink = index == data.length - 1 ? link : data[index + 1];
          const pickColor = link.pickColor;
          const color = COLOR_LIST[link.statsType] || this.color;

          const prevFromxy = prevLink.fromPoint;
          const linkFromxy = link.fromPoint;
          const linkToxy = link.toPoint;
          const nextToxy = nextLink.toPoint;

          // fromNode
          {
            attrStartPosition.push(prevFromxy);
            attrStartPosition.push(prevFromxy);
            attrPosition.push([...linkFromxy, 0]);
            attrPosition.push([...linkFromxy, 0]);
            attrEndPosition.push(linkToxy);
            attrEndPosition.push(linkToxy);
            attrSide.push(1);
            attrSide.push(-1);

            attrPickColor.push([pickColor.r, pickColor.g, pickColor.b]);
            attrPickColor.push([pickColor.r, pickColor.g, pickColor.b]);
            attrColor.push([color.r, color.g, color.b]);
            attrColor.push([color.r, color.g, color.b]);
          }
          attrUv.push([0, 0]);
          attrUv.push([1, 0]);
          attrIndex.push([0, 0 + 1, 0 + 3]);
          // toNode
          {
            attrStartPosition.push(linkFromxy);
            attrStartPosition.push(linkFromxy);
            attrPosition.push([...linkToxy, 0]);
            attrPosition.push([...linkToxy, 0]);
            attrEndPosition.push(nextToxy);
            attrEndPosition.push(nextToxy);
            attrSide.push(1);
            attrSide.push(-1);

            attrPickColor.push([pickColor.r, pickColor.g, pickColor.b]);
            attrPickColor.push([pickColor.r, pickColor.g, pickColor.b]);
            attrColor.push([color.r, color.g, color.b]);
            attrColor.push([color.r, color.g, color.b]);
          }
          attrUv.push([0, 1]);
          attrUv.push([1, 1]);
          attrIndex.push([0, 0 + 3, 0 + 2]);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(attrPosition.flat()), 3)
    );
    geometry.setAttribute(
      "startPosition",
      new THREE.BufferAttribute(new Float32Array(attrStartPosition.flat()), 2)
    );
    geometry.setAttribute(
      "endPosition",
      new THREE.BufferAttribute(new Float32Array(attrEndPosition.flat()), 2)
    );
    geometry.setAttribute(
      "side",
      new THREE.BufferAttribute(new Float32Array(attrSide.flat()), 1)
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(attrUv.flat()), 2)
    );
    geometry.setAttribute(
      "pickColor",
      new THREE.BufferAttribute(new Float32Array(attrPickColor.flat()), 3)
    );
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(attrColor.flat()), 3)
    );
    geometry.index = new THREE.BufferAttribute(
      new Uint16Array(attrIndex.flat()),
      1
    );
    return geometry;
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

          vec3 lineOffset(vec2 start, vec3 current, vec2 end, float offset) {
            float lenA = length(current.xy - start);
            float lenB = length(current.xy - end);

            if(lenA == 0. && lenB == 0.) return current;

            vec2 dirA = normalize(current.xy - start);
            vec2 dirB = normalize(current.xy - end);

            if(lenA == 0.) {
              float angle = PI / 2.0;
              vec2 normal = vec2(-dirB.y, dirB.x);
              return vec3(current.xy + normal * offset / sin(angle), current.z);
            } else if(lenB == 0.) {
              float angle = PI / 2.0;
              vec2 normal = vec2(dirA.y, -dirA.x);
              return vec3(current.xy + normal * offset / sin(angle), current.z);
            } else {
              vec2 dir = normalize(dirB - dirA);
              vec2 normal = vec2(-dir.y, dir.x);
              float angle = acos(dot(dirB, normal));
              return vec3(current.xy + normal * offset / sin(angle), current.z);
            }
          }

          attribute vec3 pickColor;
          attribute float side;
          attribute vec2 startPosition;
          attribute vec2 endPosition;
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float lineWidth = ${Number(
            this.lineWidth + (pickOffset || 0)
          ).toFixed(2)};
          float twoWayOffset = ${Number(this.twoWayOffset).toFixed(2)};
          float isTwoWay = ${this.isTwoWay.toFixed(1)};
          float offset = lineWidth / 2.0 * side + isTwoWay * twoWayOffset;
          transformed = lineOffset(startPosition, position, endPosition, offset);
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
        twoWayOffset: this.twoWayOffset,
        isTwoWay: this.isTwoWay,
        usePickColor: usePickColor,
        pickOffset: pickOffset,
      });
    };
    return material;
  }

  getGeometry() {
    const geometryList = [];
    for (const data of this.data) {
      {
        const length = data.length;

        const attrPosition = new THREE.BufferAttribute(
          new Float32Array(length * 4 * 3 + 2 * 3),
          3
        );
        const attrStartPosition = new THREE.BufferAttribute(
          new Float32Array(length * 4 * 2 + 2 * 2),
          2
        );
        const attrEndPosition = new THREE.BufferAttribute(
          new Float32Array(length * 4 * 2 + 2 * 2),
          2
        );
        const attrSide = new THREE.BufferAttribute(
          new Float32Array(length * 4 + 2),
          1
        );
        const attrIndex = new THREE.BufferAttribute(
          new Uint16Array(length * 2 * 3 + 6),
          1
        );
        const attrUv = new THREE.BufferAttribute(
          new Float32Array(length * 4 * 2 + 2),
          2
        );
        const attrPickColor = new THREE.BufferAttribute(
          new Float32Array(length * 4 * 3 + 2 * 3),
          3
        );
        const attrColor = new THREE.BufferAttribute(
          new Float32Array(length * 4 * 3 + 2 * 3),
          3
        );

        for (let index = 0; index < data.length; index++) {
          const link = data[index];
          const prevLink = index == 0 ? link : data[index - 1];
          const nextLink = index == data.length - 1 ? link : data[index + 1];
          const pickColor = link.pickColor;
          const color = COLOR_LIST[link.statsType] || this.color;

          const prevFromxy = prevLink.fromPoint;
          const linkFromxy = link.fromPoint;
          const linkToxy = link.toPoint;
          const nextToxy = nextLink.toPoint;

          // fromNode
          {
            attrStartPosition.setXY(index * 4, prevFromxy[0], prevFromxy[1]);
            attrStartPosition.setXY(
              index * 4 + 1,
              prevFromxy[0],
              prevFromxy[1]
            );
            attrPosition.setXYZ(index * 4, linkFromxy[0], linkFromxy[1], 0);
            attrPosition.setXYZ(index * 4 + 1, linkFromxy[0], linkFromxy[1], 0);
            attrEndPosition.setXY(index * 4, linkToxy[0], linkToxy[1]);
            attrEndPosition.setXY(index * 4 + 1, linkToxy[0], linkToxy[1]);
            attrSide.setX(index * 4, 1);
            attrSide.setX(index * 4 + 1, -1);

            attrPickColor.setXYZ(
              index * 4,
              pickColor.r,
              pickColor.g,
              pickColor.b
            );
            attrPickColor.setXYZ(
              index * 4 + 1,
              pickColor.r,
              pickColor.g,
              pickColor.b
            );
            attrColor.setXYZ(index * 4, color.r, color.g, color.b);
            attrColor.setXYZ(index * 4 + 1, color.r, color.g, color.b);
          }
          // toNode
          {
            attrStartPosition.setXY(
              index * 4 + 2,
              linkFromxy[0],
              linkFromxy[1]
            );
            attrStartPosition.setXY(
              index * 4 + 3,
              linkFromxy[0],
              linkFromxy[1]
            );
            attrPosition.setXYZ(index * 4 + 2, linkToxy[0], linkToxy[1], 0);
            attrPosition.setXYZ(index * 4 + 3, linkToxy[0], linkToxy[1], 0);
            attrEndPosition.setXY(index * 4 + 2, nextToxy[0], nextToxy[1]);
            attrEndPosition.setXY(index * 4 + 3, nextToxy[0], nextToxy[1]);
            attrSide.setX(index * 4 + 2, 1);
            attrSide.setX(index * 4 + 3, -1);

            attrPickColor.setXYZ(
              index * 4 + 2,
              pickColor.r,
              pickColor.g,
              pickColor.b
            );
            attrPickColor.setXYZ(
              index * 4 + 3,
              pickColor.r,
              pickColor.g,
              pickColor.b
            );
            attrColor.setXYZ(index * 4 + 2, color.r, color.g, color.b);
            attrColor.setXYZ(index * 4 + 3, color.r, color.g, color.b);
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

          if (index == data.length - 1) {
            const fromxy = new THREE.Vector2(...linkFromxy);
            const toxy = new THREE.Vector2(...linkToxy);
            const vec1 = new THREE.Vector2(0, 0);
            vec1.subVectors(fromxy, toxy);
            vec1.setLength(15);
            vec1.add(toxy);
            vec1.round();

            // 防止原线段太短导致算出来的箭头不对，所以重新计算一个from点坐标
            const vec2 = new THREE.Vector2(0, 0);
            vec2.subVectors(fromxy, toxy);
            vec2.setLength(50);
            vec2.add(toxy);
            vec2.round();

            attrStartPosition.setXY(index * 4 + 4, vec2.x, vec2.y);
            attrStartPosition.setXY(index * 4 + 5, vec2.x, vec2.y);
            attrPosition.setXYZ(index * 4 + 4, vec1.x, vec1.y, 0);
            attrPosition.setXYZ(index * 4 + 5, vec1.x, vec1.y, 0);
            attrEndPosition.setXY(index * 4 + 4, linkToxy[0], linkToxy[1]);
            attrEndPosition.setXY(index * 4 + 5, linkToxy[0], linkToxy[1]);

            attrSide.setX(index * 4 + 4, 2);
            attrSide.setX(index * 4 + 5, 4);

            attrPickColor.setXYZ(
              index * 4 + 4,
              pickColor.r,
              pickColor.g,
              pickColor.b
            );
            attrPickColor.setXYZ(
              index * 4 + 5,
              pickColor.r,
              pickColor.g,
              pickColor.b
            );

            attrColor.setXYZ(index * 4 + 4, color.r, color.g, color.b);
            attrColor.setXYZ(index * 4 + 5, color.r, color.g, color.b);

            attrUv.setXY(index * 4 + 4, 0, 0);
            attrUv.setXY(index * 4 + 5, 1, 0);

            attrIndex.setX(index * 6 + 6, index * 4 + 2);
            attrIndex.setX(index * 6 + 7, index * 4 + 4);
            attrIndex.setX(index * 6 + 8, index * 4 + 5);

            attrIndex.setX(index * 6 + 9, index * 4 + 3);
            attrIndex.setX(index * 6 + 10, index * 4 + 2);
            attrIndex.setX(index * 6 + 11, index * 4 + 4);
          }
        }

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute("position", attrPosition);
        geometry.setAttribute("startPosition", attrStartPosition);
        geometry.setAttribute("endPosition", attrEndPosition);
        geometry.setAttribute("side", attrSide);
        geometry.setAttribute("uv", attrUv);
        geometry.setAttribute("pickColor", attrPickColor);
        geometry.setAttribute("color", attrColor);
        geometry.index = attrIndex;
        geometryList.push(geometry);
      }
    }
    return BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
  }
}
