import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import { ColorBar2D } from "./ColorBar2D";

export class LinksLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.data = opt.data || null;
    this.linkWidth = opt.linkWidth || [0, 4];
    this.linkOffset = opt.linkOffset || 0;
    this.colorBar = new ColorBar2D(opt.colorList || []);
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
  }
  onAdd(map) {
    super.onAdd(map);
    if (!this.map) this.on(MAP_EVENT.UPDATE_CENTER);
  }

  setData(data) {
    try {
      this.center = data[0][0].fromxy;
      const colorValueMap = { A: 0.2, B: 0.5, C: 0.65, D: 0.77, E: 0.88, F: 0.99 };

      this.data = JSON.parse(JSON.stringify(data));
      this.data.forEach((v) => {
        v.forEach((v2) => {
          v2.fromPoint = v2.fromxy.map((v4, i) => Math.round(v4 - this.center[i]));
          v2.toPoint = v2.toxy.map((v4, i) => Math.round(v4 - this.center[i]));
          v2.widthValue = v2.saturation || 0;
          // v2.colorValue = v2.service || 0;
          v2.colorValue = colorValueMap[v2.service] || 0;
        });
      });

      console.log(this.center, this.data);
    } catch (error) {
      this.data = null;
    }
    this.update();
  }

  setLinkWidth(linkWidth) {
    this.linkWidth = linkWidth || [0, 4];
    try {
      this.material.newShader.uniforms.linkWidthMin.value = linkWidth[0];
      this.material.newShader.uniforms.linkWidthMax.value = linkWidth[1];
      this.material.needsUpdate = true;
    } catch (error) {
      console.error(error);
    }
  }

  setLinkOffset(linkOffset) {
    this.linkOffset = linkOffset;
    try {
      this.material.newShader.uniforms.linkOffset.value = linkOffset;
      this.material.needsUpdate = true;
    } catch (error) {
      console.error(error);
    }
  }

  setColorList(colorList) {
    this.colorBar.updateList(colorList);
    try {
      this.material.newShader.uniforms.colorBar.value = this.colorBar.texture;
      this.material.needsUpdate = true;
    } catch (error) {
      console.error(error);
    }
  }
  clearScene() {
    super.clearScene();
    if (this.geometry) this.geometry.dispose();
  }
  update() {
    this.clearScene();
    if (!this.data) return;
    this.meshList = [];
    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);

    const material = this.getMaterial({
      linkWidth: this.linkWidth,
      linkOffset: this.linkOffset,
      usePickColor: false,
      colorBar: this.colorBar,
    });
    const geometry = this.getGeometry();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, 0);
    this.scene.add(mesh);

    this.mesh = mesh;
    this.material = material;
    this.geometry = geometry;

    if (!this.map) this.on(MAP_EVENT.UPDATE_CENTER);
  }

  getMaterial({ usePickColor, linkWidth, linkOffset, colorBar, ...opt }) {
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      wireframe: false,
      ...opt,
    });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.linkWidthMin = { value: linkWidth[0] };
      shader.uniforms.linkWidthMax = { value: linkWidth[1] };
      shader.uniforms.linkOffset = { value: linkOffset };
      shader.uniforms.usePickColor = { value: usePickColor };
      shader.uniforms.colorBar = { value: colorBar.texture };
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
          #include <common>

          vec3 linkOffsetFunc(vec2 start, vec3 current, vec2 end, float offset) {
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
              float angle = mod(acos(dot(dirB, normal)), 3.14);
              if(angle < 0.2) angle = 0.2;
              if(angle > 2.94) angle = 2.94;
              return vec3(current.xy + normal * offset / sin(angle), current.z);
            }
          }

          attribute vec3 pickColor;
          attribute float side;
          attribute float offsetSide;
          attribute vec2 startPosition;
          attribute vec2 endPosition;
          attribute float colorValue;
          attribute float widthValue;

          uniform float linkWidthMin;
          uniform float linkWidthMax;
          uniform float linkOffset;
          uniform bool usePickColor;
          varying float vValue;
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float offset = (linkWidthMax - linkWidthMin) * 0.5 * widthValue * side + linkWidthMin * 0.5 * side + offsetSide * linkOffset;
          transformed = linkOffsetFunc(startPosition, position, endPosition, offset);
          
          vValue = colorValue;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <color_vertex>",
        `
          #include <color_vertex>
          if( usePickColor ){
            #if defined( USE_COLOR_ALPHA )
              vColor = vec4(pickColor,1.0);
            #elif defined( USE_COLOR )
              vColor = pickColor;
            #endif
          }
        `
      );
      console.log(shader.fragmentShader);

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
          #include <common>
          uniform sampler2D colorBar;
          varying float vValue;
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
          #include <color_fragment>
          
          vec4 barDiffuseColor = texture2D(colorBar, vec2(vValue , 0.5));
          diffuseColor.rgb = barDiffuseColor.rgb;
          // diffuseColor.a *= barDiffuseColor.a;
        `
      );

      material.newShader = shader;
    };
    return material;
  }

  getGeometry() {
    const attrPosition = [];
    const attrStartPosition = [];
    const attrEndPosition = [];
    const attrLength = [];
    const attrSide = [];
    const attrOffsetSide = [];
    const attrIndex = [];
    const attrPickColor = [];
    const attrColor = [];
    const attrColorValue = [];
    const attrWidthValue = [];
    let indexOffset = 0;
    for (const data of this.data) {
      for (let index = 0, l = data.length; index < l; index++) {
        const cLink = data[index];
        const pLink = index == 0 ? cLink : data[index - 1];
        const nLink = index == data.length - 1 ? cLink : data[index + 1];

        const prevFromxy = pLink.fromPoint;
        const linkFromxy = cLink.fromPoint;
        const linkToxy = cLink.toPoint;
        const nextToxy = nLink.toPoint;

        const offsetSide = pLink.oneWay ? 0 : 1;
        const colorValue = cLink.colorValue || 0;
        const widthValue = cLink.widthValue || 0;
        // fromNode
        {
          attrStartPosition.push(prevFromxy[0], prevFromxy[1]);
          attrStartPosition.push(prevFromxy[0], prevFromxy[1]);
          attrPosition.push(linkFromxy[0], linkFromxy[1], 0);
          attrPosition.push(linkFromxy[0], linkFromxy[1], 0);
          attrEndPosition.push(linkToxy[0], linkToxy[1]);
          attrEndPosition.push(linkToxy[0], linkToxy[1]);
          attrSide.push(1, -1);
          attrOffsetSide.push(offsetSide, offsetSide);
          attrColorValue.push(colorValue, colorValue);
          attrWidthValue.push(widthValue, widthValue);
        }

        {
          attrStartPosition.push(linkFromxy[0], linkFromxy[1]);
          attrStartPosition.push(linkFromxy[0], linkFromxy[1]);
          attrPosition.push(linkToxy[0], linkToxy[1], 0);
          attrPosition.push(linkToxy[0], linkToxy[1], 0);
          attrEndPosition.push(nextToxy[0], nextToxy[1]);
          attrEndPosition.push(nextToxy[0], nextToxy[1]);
          attrSide.push(1, -1);
          attrOffsetSide.push(offsetSide, offsetSide);
          attrColorValue.push(colorValue, colorValue);
          attrWidthValue.push(widthValue, widthValue);
        }

        attrIndex.push(indexOffset + index * 4);
        attrIndex.push(indexOffset + index * 4 + 1);
        attrIndex.push(indexOffset + index * 4 + 3);
        attrIndex.push(indexOffset + index * 4);
        attrIndex.push(indexOffset + index * 4 + 3);
        attrIndex.push(indexOffset + index * 4 + 2);
      }
      indexOffset += data.length * 4;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(attrPosition, 3));
    geometry.setAttribute("startPosition", new THREE.Float32BufferAttribute(attrStartPosition, 2));
    geometry.setAttribute("endPosition", new THREE.Float32BufferAttribute(attrEndPosition, 2));
    geometry.setAttribute("side", new THREE.Float32BufferAttribute(attrSide, 1));
    geometry.setAttribute("offsetSide", new THREE.Float32BufferAttribute(attrOffsetSide, 1));
    geometry.setAttribute("colorValue", new THREE.Float32BufferAttribute(attrColorValue, 1));
    geometry.setAttribute("widthValue", new THREE.Float32BufferAttribute(attrWidthValue, 1));
    // geometry.setAttribute("pickColor", new THREE.Float32BufferAttribute(attrPickColor, 3));
    // geometry.setAttribute("color", new THREE.Float32BufferAttribute(attrColor, 3));
    geometry.index = new THREE.Uint16BufferAttribute(attrIndex, 1);
    return geometry;
  }
}
