import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { getTextImage } from "@/mymap/utils/index";

export class BusRouteLinkLayer extends Layer {
  name = "BusRouteLinkLayer";
  lineWidth = 10;
  lineOffset = 0;
  size = 33;
  linkColor = new THREE.Color("red");
  stopColor = new THREE.Color("green");
  middleLinkColor = new THREE.Color("white");
  center = [0, 0];
  linkData = [];
  middleLinkData = [];
  stopData = [];
  pointTexture = new THREE.TextureLoader().load(require("@/assets/image/point.svg"));
  linkTexture = new THREE.TextureLoader().load(require("@/assets/image/link_top5.png"));

  constructor(opt) {
    super(opt);
    this.linkColor = new THREE.Color(opt.linkColor || this.linkColor);
    this.stopColor = new THREE.Color(opt.stopColor || this.stopColor);
    this.middleLinkColor = new THREE.Color(opt.middleLinkColor || this.middleLinkColor);

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
      }),
    );
    this.labelMesh.center.set(0.5, -0.5);
  }

  onAdd(map) {
    super.onAdd(map);
    this.lineWidth = this.map.cameraHeight / 160;
    this.size = this.map.cameraHeight / 30;
    this.update();

    this.on(MAP_EVENT.UPDATE_CENTER, null);
    this.on(MAP_EVENT.UPDATE_CAMERA_HEIGHT, null);
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
      let color = new THREE.Color(data.pickColor);
      let item = this.middleLinkData.find((v) => color.equals(v.pickColor));
      if (item) {
        this.handleEventListener(type, item.data);
      }
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.lineWidth = this.map.cameraHeight / 160;
      this.size = this.map.cameraHeight / 30;
      for (const mesh of this.scene.children) {
        if (mesh.material.isPointsMaterial) {
          mesh.material.setValues({ size: this.size });
        }
        mesh.material.needsUpdate = true;
      }
      for (const mesh of this.pickLayerScene.children) {
        if (mesh.material.isPointsMaterial) {
          mesh.material.setValues({ size: this.size });
        }
        mesh.material.needsUpdate = true;
      }
      for (const mesh of this.pickMeshScene.children) {
        if (mesh.material.isPointsMaterial) {
          mesh.material.setValues({ size: this.size });
        }
        mesh.material.needsUpdate = true;
      }
    }

    if (type == MAP_EVENT.HANDLE_MOUSE_MOVE_PICK) {
      let labelData = null;
      if (data.layerId == this.id) {
        const pickColor = new THREE.Color(data.pickColor);
        const item = this.stopData.find((v2) => v2.pickColor.equals(pickColor));
        if (item) {
          if (this.labelData && item.data.stop.name == this.labelData.name) {
            labelData = this.labelData;
          } else {
            if (this.labelData.map) this.labelData.map.dispose();
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

  render() {
    super.render();
  }

  setData(data) {
    try {
      const center = data.center;
      let lineLength = 0;
      this.linkData = data.route.map((v) => {
        let data = {
          fromLength: lineLength,
          fromCoord: v.fromCoord.offset(center),
          toLength: lineLength + v.length,
          toCoord: v.toCoord.offset(center),
          pickColor: this.getPickMeshColor(),
          data: v.toJSON(),
        };
        lineLength += v.length;
        return data;
      });
      this.middleLinkData = data.middleLink.map((v) => {
        let data = {
          fromCoord: v.fromCoord.offset(center),
          toCoord: v.toCoord.offset(center),
          pickColor: this.getPickMeshColor(),
          data: v.toJSON(),
        };
        return data;
      });
      this.stopData = data.stops.map((v) => {
        return {
          coord: v.coord.offset(center),
          pickColor: this.getPickMeshColor(),
          data: v.toJSON(),
        };
      });
      this.center = center.toList();
      this.update();
    } catch (error) {
      this.stopData = [];
      this.linkData = [];
      this.middleLinkData = [];
      this.center = [0, 0];
      this.update();
    }
  }

  clearScene() {
    super.clearScene();
    if (this.linkGeometry) this.linkGeometry.dispose();
    if (this.stopGeometry) this.stopGeometry.dispose();
    if (this.middleLinkGeometry) this.middleLinkGeometry.dispose();
  }

  dispose() {
    super.dispose();
    if (this.labelData) this.labelData.map.dispose();
    if (this.linkGeometry) this.linkGeometry.dispose();
    if (this.stopGeometry) this.stopGeometry.dispose();
    if (this.middleLinkGeometry) this.middleLinkGeometry.dispose();
    if (this.linkTexture) this.linkTexture.dispose();
    if (this.pointTexture) this.pointTexture.dispose();
  }

  update() {
    this.clearScene();
    if (!this.map) return;
    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    {
      let geometry = this.getLineGeometry(this.linkData);
      let material = this.getLineMaterial({
        usePickColor: false,
        vertexColors: false,
        color: new THREE.Color(this.linkColor),
        map: this.linkTexture,
      });

      let mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, 0);
      this.scene.add(mesh);

      this.linkGeometry = geometry;
    }
    {
      let geometry = this.getPointsGeometry(this.stopData);
      let material = this.getPointMaterial({
        map: this.pointTexture,
        usePickColor: false,
      });

      let mesh = new THREE.Points(geometry, material);
      mesh.position.set(x, y, 0.001);
      this.scene.add(mesh);

      let pickLayerMaterial = this.getPointMaterial({
        usePickColor: false,
      });
      let pickLayerMesh = new THREE.Points(geometry, pickLayerMaterial);
      pickLayerMesh.position.set(x, y, 0.001);
      this.pickLayerScene.add(pickLayerMesh);

      let pickMeshMaterial = this.getPointMaterial({
        usePickColor: true,
      });
      let pickMeshMesh = new THREE.Points(geometry, pickMeshMaterial);
      pickMeshMesh.position.set(x, y, 0.001);
      this.pickMeshScene.add(pickMeshMesh);

      this.stopGeometry = geometry;
    }
    if (this.middleLinkData.length) {
      let geometryList = this.middleLinkData.map((v) => this.getLineGeometry([v]));
      let geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);

      let material = this.getLineMaterial({
        usePickColor: false,
        vertexColors: false,
        opacity: 0.7,
        color: new THREE.Color(this.middleLinkColor),
      });

      let mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, 0.002);
      this.scene.add(mesh);

      let pickLayerMaterial = this.getLineMaterial({
        usePickColor: false,
        vertexColors: false,
        color: new THREE.Color(this.pickLayerColor),
      });
      let pickLayerMesh = new THREE.Mesh(geometry, pickLayerMaterial);
      pickLayerMesh.position.set(x, y, 0.002);
      this.pickLayerScene.add(pickLayerMesh);

      let pickMeshMaterial = this.getLineMaterial({
        vertexColors: true,
        usePickColor: true,
      });
      let pickMeshMesh = new THREE.Mesh(geometry, pickMeshMaterial);
      pickMeshMesh.position.set(x, y, 0.002);
      this.pickMeshScene.add(pickMeshMesh);

      this.middleLinkGeometry = geometry;
    }
  }

  updateLabel() {
    if (!this.labelData) {
      this.scene.remove(this.labelMesh);
    } else {
      this.labelMesh.material.setValues({ map: this.labelData.map });
      this.labelMesh.material.needsUpdate = true;
      const scale = this.map.cameraHeight / 2000;
      this.labelMesh.scale.set(this.labelData.mapWidth * scale, this.labelData.mapHeight * scale, 1);
      const [x, y] = this.map.WebMercatorToCanvasXY(this.labelData.x, this.labelData.y);
      this.labelMesh.position.set(x, y, 10);
      this.scene.add(this.labelMesh);
    }
  }

  getPointsGeometry(data) {
    const count = data.length;
    const positions = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    const pickColors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    const colors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);

    const color = new THREE.Color(this.stopColor);
    for (let i = 0; i < count; i++) {
      const { coord, pickColor } = data[i];
      positions.setXYZ(i, coord.x, coord.y, 0);
      pickColors.setXYZ(i, pickColor.r, pickColor.g, pickColor.b);
      colors.setXYZ(i, color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute("position", positions);
    geometry.setAttribute("pickColor", pickColors);
    geometry.setAttribute("color", colors);
    return geometry;
  }

  getPointMaterial({ usePickColor, ...opt }) {
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
          `,
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
          `,
        );
      }

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `
            #if defined( USE_MAP )
              vec4 textColor = texture2D( map, uv );
              float length = (textColor.r + textColor.g + textColor.b) / 3.0  ;
              if(length < 0.5){
                outgoingLight = vec3(1.0);
              }else{
                outgoingLight = vColor.rgb;
              }
            #endif
            #include <output_fragment>
          `,
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

  getLineMaterial({ usePickColor, ...opt }) {
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
          attribute vec2 side;
          attribute float lineLength;
          attribute vec2 position2;
          varying float vLineLength;
        `,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float lineWidth = ${Number(this.lineWidth).toFixed(2)};
          float lineOffset = ${Number(this.lineOffset).toFixed(2)};
          vLineLength = lineLength;

          // 线段
          vec2 dir = normalize(position.xy - position2.xy) * side.x;
          // 线段法向量
          vec2 normal = vec2(-dir.y, dir.x);
          // 宽度位移
          vec2 width = normal * lineWidth * side.y;
          // 线段位移
          vec2 offset = normal * lineOffset;
          // 顶点位置
          transformed = vec3(position.xy + width + offset, position.z);

        `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
          #include <common>
          varying float vLineLength;
          `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
            #ifdef USE_MAP
              float lineWidth = ${Number(this.lineWidth).toFixed(2)} * 2.0;
              float l = mod(vLineLength, lineWidth * 2.0) / lineWidth;
              if(0.0 < l && l < 1.0){
                vec4 sampledDiffuseColor = texture2D(map, vec2(vUv.x,  l));
                if(sampledDiffuseColor.a > 0.6) {
                  diffuseColor = vec4(1.0);
                }
              }
            #endif
          `,
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
          `,
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
        usePickColor: usePickColor,
        lineWidth: this.lineWidth,
      });
    };
    return material;
  }

  getLineGeometry(data) {
    const length = data.length;
    const attrPosition = new THREE.Float32BufferAttribute(length * 4 * 3, 3);
    const attrPosition2 = new THREE.Float32BufferAttribute(length * 4 * 3, 3);
    const attrSide = new THREE.Float32BufferAttribute(length * 4 * 2, 2);
    const attrPickColor = new THREE.Float32BufferAttribute(length * 4 * 3, 3);
    const attrLength = new THREE.Float32BufferAttribute(length * 4 * 1, 1);
    const attrUv = new THREE.Float32BufferAttribute(length * 4 * 2, 2);

    const attrIndex = new THREE.Uint32BufferAttribute(length * 2 * 3 + (length - 1) * 2 * 3, 1);

    let indexOffset = 0;
    for (let index = 0; index < length - 1; index++) {
      attrIndex.setX(indexOffset + index * 6, index * 4 + 2);
      attrIndex.setX(indexOffset + index * 6 + 1, index * 4 + 3);
      attrIndex.setX(indexOffset + index * 6 + 2, index * 4 + 5);

      attrIndex.setX(indexOffset + index * 6 + 3, index * 4 + 2);
      attrIndex.setX(indexOffset + index * 6 + 4, index * 4 + 5);
      attrIndex.setX(indexOffset + index * 6 + 5, index * 4 + 4);
    }
    indexOffset = (length - 1) * 2 * 3;

    for (let index = 0; index < length; index++) {
      const link = data[index];

      const pickColor = link.pickColor;
      const color = this.color;

      const linkFromxy = link.fromCoord;
      const linkToxy = link.toCoord;

      {
        attrPosition.setXYZ(index * 4, linkFromxy.x, linkFromxy.y, 0);
        attrPosition.setXYZ(index * 4 + 1, linkFromxy.x, linkFromxy.y, 0);
        attrPosition2.setXYZ(index * 4, linkToxy.x, linkToxy.y, 0);
        attrPosition2.setXYZ(index * 4 + 1, linkToxy.x, linkToxy.y, 0);

        // 线段方向 ， 宽度位移方向
        attrSide.setXY(index * 4, 1, 0.5);
        attrSide.setXY(index * 4 + 1, 1, -0.5);

        attrLength.setX(index * 4, link.fromLength || 0);
        attrLength.setX(index * 4 + 1, link.fromLength || 0);

        attrPickColor.setXYZ(index * 4, pickColor.r, pickColor.g, pickColor.b);
        attrPickColor.setXYZ(index * 4 + 1, pickColor.r, pickColor.g, pickColor.b);
      }

      {
        attrPosition.setXYZ(index * 4 + 2, linkToxy.x, linkToxy.y, 0);
        attrPosition.setXYZ(index * 4 + 3, linkToxy.x, linkToxy.y, 0);
        attrPosition2.setXYZ(index * 4 + 2, linkFromxy.x, linkFromxy.y, 0);
        attrPosition2.setXYZ(index * 4 + 3, linkFromxy.x, linkFromxy.y, 0);

        // 线段方向 ， 宽度位移方向
        attrSide.setXY(index * 4 + 2, -1, 0.5);
        attrSide.setXY(index * 4 + 3, -1, -0.5);

        attrLength.setX(index * 4 + 2, link.toLength || 0);
        attrLength.setX(index * 4 + 3, link.toLength || 0);

        attrPickColor.setXYZ(index * 4 + 2, pickColor.r, pickColor.g, pickColor.b);
        attrPickColor.setXYZ(index * 4 + 3, pickColor.r, pickColor.g, pickColor.b);
      }

      attrUv.setXY(index * 4, 0, 0);
      attrUv.setXY(index * 4 + 1, 1, 0);
      attrUv.setXY(index * 4 + 2, 0, 1);
      attrUv.setXY(index * 4 + 3, 1, 1);

      attrIndex.setX(indexOffset + index * 6, index * 4);
      attrIndex.setX(indexOffset + index * 6 + 1, index * 4 + 1);
      attrIndex.setX(indexOffset + index * 6 + 2, index * 4 + 3);

      attrIndex.setX(indexOffset + index * 6 + 3, index * 4);
      attrIndex.setX(indexOffset + index * 6 + 4, index * 4 + 3);
      attrIndex.setX(indexOffset + index * 6 + 5, index * 4 + 2);
    }

    const geometry = new THREE.BufferGeometry();

    console.log(attrPosition, data);

    geometry.setAttribute("position", attrPosition);
    geometry.setAttribute("position2", attrPosition2);
    geometry.setAttribute("side", attrSide);
    geometry.setAttribute("lineLength", attrLength);
    geometry.setAttribute("uv", attrUv);
    geometry.setAttribute("pickColor", attrPickColor);
    geometry.index = attrIndex;
    return geometry;
  }
}
