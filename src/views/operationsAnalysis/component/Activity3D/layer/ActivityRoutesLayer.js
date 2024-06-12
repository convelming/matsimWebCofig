import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";

const SIZE = 80;

export class ActivityRoutesLayer extends Layer {

  center = [0, 0];

  actScale = 1;
  actColor = new THREE.Color(0xffa500);
  actTexture = new THREE.TextureLoader().load(require("@/assets/image/point.png"));
  actList = [];

  legScale = 1;
  legWidth = 10;
  legColor = new THREE.Color(0xff0000);
  legTexture = new THREE.TextureLoader().load(require("@/assets/image/link_top5.png"));
  legList = [];
  legMeshList = [];


  height = 100;

  setActColor(actColor) {
    this.actColor = new THREE.Color(actColor);
    this.actMaterial.setValues({ color: this.actColor });
    this.actMaterial2.setValues({ color: this.actColor });
  }

  setLegColor(legColor) {
    this.legColor = new THREE.Color(legColor);
    this.legMaterial.setValues({ color: this.legColor });
  }

  setHeight(height) {
    this.height = height;
    this.scaleScene.scale.set(1, 1, this.height / 100);
  }

  constructor(opt) {
    super(opt);


    this.height = opt.height || this.height;
    this.actScale = opt.actScale || this.actScale;
    this.actColor = new THREE.Color(opt.actColor || this.actColor);
    this.legScale = opt.legScale || this.legScale;
    this.legColor = new THREE.Color(opt.legColor || this.legColor);

    this.actGeometry = new THREE.BoxGeometry(SIZE, SIZE);
    this.actMaterial = this.getActMaterial({
      depthWrite: false,
      transparent: true,
      map: this.actTexture,
      color: this.actColor,
    });
    this.actGeometry2 = new THREE.BoxGeometry(SIZE, SIZE);
    this.actMaterial2 = new THREE.MeshBasicMaterial({
      depthWrite: false,
      transparent: true,
      color: this.actColor,
    });

    this.legMaterial = this.getLegMaterial({
      map: this.legTexture,
      color: this.legColor,
      usePickColor: true,
    });

    this.scaleScene = new THREE.Group();
    this.scaleScene.scale.set(1, 1, this.height / 100);
    this.scene.add(this.scaleScene);
  }


  onAdd(map) {
    super.onAdd(map);
    this.update();
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.scaleScene.position.set(x, y, 0);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.changeSize();
    }
  }

  setData(data, center) {
    try {
      const actList = [];
      const legList = [];
      let pickColor = 1;
      for (const v of data) {
        if (v.type === 'Activity') {
          v.point = [v.coord.x - center[0], v.coord.y - center[1]];
          v.pickColor = pickColor += 1;
          actList.push(v);
        } else if (v.type === 'Leg') {
          let length = 0;
          let time = v.path.startTime;
          const speed = v.path.distance / (v.path.endTime - v.path.startTime);
          // if (!legCenter) legCenter = v.center;
          v.path.paths.forEach(v2 => {

            v2.fromLength = length;
            v2.fromTime = time;
            v2.fromCoord = {
              x: v2.startPoint[0] - center[0],
              y: v2.startPoint[1] - center[1]
            };

            v2.toLength = length += v2.distance;
            v2.toTime = time += v2.distance / speed;
            v2.toCoord = {
              x: v2.endPoint[0] - center[0],
              y: v2.endPoint[1] - center[1]
            };

            v2.pickColor = pickColor += 10;
          })
          legList.push(v);
        }
      }
      this.center = center;
      this.legList = legList;
      this.actList = actList;
    } catch (error) {
      this.center = [0, 0];
      this.legList = [];
      this.actList = [];
    } finally {
      this.update();
    }
  }

  update() {
    if (!this.map) return;
    console.log(this.legList, this.actList);

    // 活动
    {
      if (this.actMesh) {
        this.actMesh.removeFromParent();
        this.actMesh.dispose();
      }
      if (this.actMesh2) {
        this.actMesh2.removeFromParent();
        this.actMesh2.dispose();
      }
      this.actMesh = new THREE.InstancedMesh(this.actGeometry, this.actMaterial, this.actList.length * 2);
      this.actMesh2 = new THREE.InstancedMesh(this.actGeometry2, this.actMaterial2, this.actList.length);
      this.scaleScene.add(this.actMesh);
      // this.scaleScene.add(this.actMesh2);
    }
    // 路径
    {
      for (const mesh of this.legMeshList) {
        mesh.removeFromParent();
        mesh.geometry.dispose();
      }

      this.legWidth = this.map.cameraHeight / 150 * this.legScale;

      for (let i = 0, l = this.legList.length; i < l; i++) {
        const item = this.legList[i];
        const geometry = this.getLegGeometry(item.path.paths);
        const mesh = new THREE.Mesh(geometry, this.legMaterial);
        this.scaleScene.add(mesh);
        this.legMeshList.push(mesh);
      }
    }

    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.scaleScene.position.set(x, y, 0);

    this.changeSize();
  }

  changeSize() {
    if (this.actMesh) {
      const _scale = this.map.cameraHeight / 4000 * this.actScale;
      for (let i = 0, l = this.actList.length * 2; i < l; i++) {
        const { point, pickColor, startTime, endTime } = this.actList[Math.floor(i / 2)];
        const z = i % 2 == 0 ? startTime / 60 : endTime / 60;
        const positionV3 = new THREE.Vector3(point[0], point[1], z);
        const scaleV3 = new THREE.Vector3(_scale, _scale, 1);
        const matrix = new THREE.Matrix4();
        matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);
        this.actMesh.setMatrixAt(i, matrix);


        if (i % 2 == 0) {
          const scaleV3_2 = new THREE.Vector3(_scale, _scale, (endTime - startTime) / 60);
          const matrix_2 = new THREE.Matrix4();
          matrix_2.compose(positionV3, new THREE.Quaternion(), scaleV3_2);
          this.actMesh2.setMatrixAt(Math.floor(i / 2), matrix_2);
        }
      }
      this.actMesh.instanceMatrix.needsUpdate = true;
      this.actMesh2.instanceMatrix.needsUpdate = true;
    }

    this.legWidth = this.map.cameraHeight / 150 * this.legScale;
    this.legMaterial.needsUpdate = true;

  }

  getActMaterial(opt) {

    const material = new THREE.MeshBasicMaterial(opt);
    material.onBeforeCompile = (shader) => {
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
      });
    };
    return material;
  }
  getLegMaterial({ usePickColor, ...opt }) {
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
          float lineWidth = ${Number(this.legWidth).toFixed(2)};
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
              float lineWidth = ${Number(this.legWidth).toFixed(2)} * 2.0;
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
        lineWidth: this.legWidth,
      });
    };
    return material;
  }
  getLegGeometry(data) {
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
    const attrLength = new THREE.BufferAttribute(
      new Float32Array(length * 4 + 2),
      1
    );

    const color = new THREE.Color(this.legColor);

    for (let index = 0; index < data.length; index++) {
      const link = data[index];
      const prevLink = index == 0 ? link : data[index - 1];
      const nextLink = index == data.length - 1 ? link : data[index + 1];
      const pickColor = new THREE.Color(link.pickColor);

      const prevFromxy = prevLink.fromCoord;
      const linkFromxy = link.fromCoord;
      const linkToxy = link.toCoord;
      const nextToxy = nextLink.toCoord;

      // fromNode
      {
        attrStartPosition.setXY(index * 4, prevFromxy.x, prevFromxy.y);
        attrStartPosition.setXY(index * 4 + 1, prevFromxy.x, prevFromxy.y);
        attrPosition.setXYZ(index * 4, linkFromxy.x, linkFromxy.y, link.fromTime / 60);
        attrPosition.setXYZ(index * 4 + 1, linkFromxy.x, linkFromxy.y, link.fromTime / 60);
        attrEndPosition.setXY(index * 4, linkToxy.x, linkToxy.y);
        attrEndPosition.setXY(index * 4 + 1, linkToxy.x, linkToxy.y);
        attrSide.setX(index * 4, 1);
        attrSide.setX(index * 4 + 1, -1);
        attrLength.setX(index * 4, link.fromLength);
        attrLength.setX(index * 4 + 1, link.fromLength);

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
        attrStartPosition.setXY(index * 4 + 2, linkFromxy.x, linkFromxy.y);
        attrStartPosition.setXY(index * 4 + 3, linkFromxy.x, linkFromxy.y);
        attrPosition.setXYZ(index * 4 + 2, linkToxy.x, linkToxy.y, link.toTime / 60);
        attrPosition.setXYZ(index * 4 + 3, linkToxy.x, linkToxy.y, link.toTime / 60);
        attrEndPosition.setXY(index * 4 + 2, nextToxy.x, nextToxy.y);
        attrEndPosition.setXY(index * 4 + 3, nextToxy.x, nextToxy.y);
        attrSide.setX(index * 4 + 2, 1);
        attrSide.setX(index * 4 + 3, -1);
        attrLength.setX(index * 4 + 2, link.toLength);
        attrLength.setX(index * 4 + 3, link.toLength);

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
    geometry.setAttribute("lineLength", attrLength);
    geometry.setAttribute("uv", attrUv);
    geometry.setAttribute("pickColor", attrPickColor);
    geometry.setAttribute("color", attrColor);
    geometry.index = attrIndex;
    return geometry
  }
}