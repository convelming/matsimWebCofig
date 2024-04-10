import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

/**
 * 注意：本图层自身高度为0.3
 */
export class GuangZhouLayer extends Layer {
  name = "GuangZhouLayer";
  data = null;
  color = new THREE.Color(0x909399);

  lineWidth = 4;

  material = null;
  pickLayerMaterial = null;
  pickMaterial = null;

  highMaterial = null;

  geometry = null;

  constructor(options) {
    super(options);
    this.setData(options.data);
    this.color = new THREE.Color(opt.color || this.color);
    this.lineWidth = options.lineWidth || 1;
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.data.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.data.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...this.data.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      this.handleEventListener(type);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.setValues({
        lineWidth: this.map.cameraHeight / 400,
      });
    }
  }

  onAdd(map) {
    super.onAdd(map);
    this.setValues({
      lineWidth: this.map.cameraHeight / 400,
    });
    this.update();
  }

  setData(data) {
    this.data = data;
    this.update();
  }

  update() {
    this.clearScene();
    if (!this.map) return;
    if (!this.data) return;
    this.material = this.getMaterial({
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

    const [x, y] = this.map.WebMercatorToCanvasXY(...this.data.center);

    const geometry = this.getGeometry();

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
          float offset = lineWidth / 2.0  * side;
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
        usePickColor: usePickColor,
        pickOffset: pickOffset,
      });
    };
    return material;
  }

  getGeometry() {
    const geometryList = [];
    for (const path of this.data.lineList) {
      const length = path.length;
      const attrPosition = new THREE.BufferAttribute(
        new Float32Array(length * 4 * 3),
        3
      );
      const attrStartPosition = new THREE.BufferAttribute(
        new Float32Array(length * 4 * 2),
        2
      );
      const attrEndPosition = new THREE.BufferAttribute(
        new Float32Array(length * 4 * 2),
        2
      );
      const attrSide = new THREE.BufferAttribute(
        new Float32Array(length * 4),
        1
      );
      const attrIndex = new THREE.BufferAttribute(
        new Uint16Array(length * 2 * 3),
        1
      );
      const attrUv = new THREE.BufferAttribute(
        new Float32Array(length * 4 * 2),
        2
      );
      const attrPickColor = new THREE.BufferAttribute(
        new Float32Array(length * 4 * 3),
        3
      );
      const attrColor = new THREE.BufferAttribute(
        new Float32Array(length * 4 * 3),
        3
      );

      for (let index = 0; index < path.length; index++) {
        const link = path[index];
        const prevLink = index == 0 ? link : path[index - 1];
        const nextLink = index == path.length - 1 ? link : path[index + 1];
        const color = this.color;
        const pickColor = this.getPickMeshColor();

        const prevFromxy = prevLink.fromxy;
        const linkFromxy = link.fromxy;
        const linkToxy = link.toxy;
        const nextToxy = nextLink.toxy;

        // fromNode
        {
          attrStartPosition.setXY(index * 4, prevFromxy[0], prevFromxy[1]);
          attrStartPosition.setXY(index * 4 + 1, prevFromxy[0], prevFromxy[1]);
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
          attrStartPosition.setXY(index * 4 + 2, linkFromxy[0], linkFromxy[1]);
          attrStartPosition.setXY(index * 4 + 3, linkFromxy[0], linkFromxy[1]);
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
    return BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
  }
}
