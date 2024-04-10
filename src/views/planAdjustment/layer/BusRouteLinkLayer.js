import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { getTextImage } from "@/mymap/utils/index";


export class BusRouteLinkLayer extends Layer {
  name = "BusRouteLinkLayer";
  lineWidth = 10;
  size = 33;
  linkColor = new THREE.Color("red");
  stopColor = new THREE.Color("green");
  middleLinkColor = new THREE.Color("white");
  center = [0, 0];
  linkData = [];
  middleLinkData = [];
  stopData = [];
  pointTexture = new THREE.TextureLoader().load(
    require("@/assets/image/point.png")
  );
  linkTexture = new THREE.TextureLoader().load(
    require("@/assets/image/link_top5.png")
  );

  constructor(opt) {
    super(opt);
    this.linkColor = new THREE.Color(opt.linkColor || this.linkColor);
    this.stopColor = new THREE.Color(opt.stopColor || this.stopColor);
    this.middleLinkColor = new THREE.Color(opt.middleLinkColor || this.middleLinkColor);

    this.labelMesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
      })
    );
  }

  onAdd(map) {
    super.onAdd(map);
    this.lineWidth = this.map.cameraHeight / 160;
    this.size = this.map.cameraHeight / 30;
    this.update();
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
      this.center = [0, 0];
      this.update();
    }
  }

  update() {
    if (!this.map) return;
    this.clearScene();
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
    }
    if (this.middleLinkData.length) {
      let geometryList = this.middleLinkData.map((v) =>
        this.getLineGeometry([v])
      );
      let geometry = BufferGeometryUtils.mergeBufferGeometries(
        geometryList,
        false
      );

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

  getPointsGeometry(data) {
    const count = data.length;
    const positions = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    const pickColors = new THREE.BufferAttribute(
      new Float32Array(count * 3),
      3
    );
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
                outgoingLight = vColor.rgb;
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
              float l = mod(vLineLength, 100.0) / lineWidth ;
              if(0.0 < l && l < 1.0){
                vec4 sampledDiffuseColor = texture2D(map, vec2(vUv.x,  l));
                if(sampledDiffuseColor.a > 0.6) {
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
        usePickColor: usePickColor,
        lineWidth: this.lineWidth,
      });
    };
    return material;
  }

  getLineGeometry(data) {
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
    const attrLength = new THREE.BufferAttribute(
      new Float32Array(length * 4 + 2),
      1
    );

    for (let index = 0; index < data.length; index++) {
      const link = data[index];
      const prevLink = index == 0 ? link : data[index - 1];
      const nextLink = index == data.length - 1 ? link : data[index + 1];
      const pickColor = link.pickColor;

      const prevFromxy = prevLink.fromCoord;
      const linkFromxy = link.fromCoord;
      const linkToxy = link.toCoord;
      const nextToxy = nextLink.toCoord;

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
        attrLength.setX(index * 4, link.fromLength || 0);
        attrLength.setX(index * 4 + 1, link.fromLength || 0);

        attrPickColor.setXYZ(index * 4, pickColor.r, pickColor.g, pickColor.b);
        attrPickColor.setXYZ(
          index * 4 + 1,
          pickColor.r,
          pickColor.g,
          pickColor.b
        );
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
        attrLength.setX(index * 4 + 2, link.toLength || 0);
        attrLength.setX(index * 4 + 3, link.toLength || 0);

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
    geometry.setAttribute("pickColor", attrPickColor);
    geometry.index = attrIndex;
    return geometry;
  }
}
