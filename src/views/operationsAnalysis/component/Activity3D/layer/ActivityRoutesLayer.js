import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import { getTextImage } from "@/mymap/utils/index";
import { formatHour } from "@/utils/utils"
// const { url, width, height } = getTextImage(item.data.stop.name);

const SIZE = 10;
const COLOR = "#000000"

export class ActivityRoutesLayer extends Layer {

  center = [0, 0];
  legColors = new Map();
  activityColors = new Map();

  actScale = 1;
  actWidth = 2;
  actTexture = new THREE.TextureLoader().load(require("@/assets/image/point.png"));
  actList = [];
  actStartMeshList = [];
  actEndMeshList = [];
  actCylMeshList = [];

  legScale = 1;
  legWidth = 20;
  legTexture = new THREE.TextureLoader().load(require("@/assets/image/link_top5.png"));
  legList = [];
  legMeshList = [];


  labelScale = 1.5;
  labelWidth = 2;
  labelColor = 0x000000;
  labelMeshList = [];


  height = 100;

  // 构造函数
  constructor(opt) {
    super(opt);

    this.height = opt.height || this.height;
    this.actScale = opt.actScale || this.actScale;
    this.legScale = opt.legScale || this.legScale;
    this.labelScale = opt.labelScale || this.labelScale;
    this.labelColor = opt.labelColor || this.labelColor;
    this.legColors = new Map((opt.legColors || []).map(v => [v.name, v.color]));
    this.activityColors = new Map((opt.activityColors || []).map(v => [v.name, v.color]));

    this.scaleScene = new THREE.Group();
    this.scaleScene.scale.set(1, 1, this.height / 100);
    this.scene.add(this.scaleScene);
  }


  // 添加到地图
  onAdd(map) {
    super.onAdd(map);
    this.updateSize();
    this.update();
  }

  // 监听事件
  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.scaleScene.position.set(x, y, 0);
    }
    if (type == MAP_EVENT.UPDATE_CAMERA_HEIGHT) {
      this.updateSize();
    }
  }

  // 销毁
  dispose() {
    super.dispose();
    this.scaleScene.removeFromParent();
    [this.actStartMeshList, this.actEndMeshList, this.actCylMeshList, this.legMeshList].flat().forEach((v) => {
      v.removeFromParent();
      v.geometry.dispose();
    });
    this.actStartMeshList = [];
    this.actEndMeshList = [];
    this.actCylMeshList = [];
    this.legMeshList = [];

    this.actTexture.dispose();
    this.legTexture.dispose();
    this.colors.clear()
  }

  // 设置数据
  setData(data, center) {
    try {
      const actList = [];
      const legList = [];
      for (const v of data) {
        if (v.type === 'Activity') {
          v.point = [v.coord.x - center[0], v.coord.y - center[1]];
          actList.push(v);
        } else if (v.type === 'Leg') {
          let length = 0;
          let time = v.path.startTime;
          const speed = v.path.distance / (v.path.endTime - v.path.startTime);
          const lineCenter = [];
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

  // 设置高度
  setHeight(height) {
    this.height = height;
    this.scaleScene.scale.set(1, 1, this.height / 100);
  }

  // 设置活动颜色
  setActivityColors(activityColors) {
    this.activityColors = new Map(activityColors.map(v => [v.name, v.color]));
    for (const mesh of this.actStartMeshList) {
      const color = new THREE.Color(this.activityColors.get(mesh.userData.activity) || COLOR);
      mesh.material.setValues({ color: color });
      mesh.material.needsUpdate = true;
    }
    for (const mesh of this.actEndMeshList) {
      const color = new THREE.Color(this.activityColors.get(mesh.userData.activity) || COLOR);
      mesh.material.setValues({ color: color });
      mesh.material.needsUpdate = true;
    }
    for (const mesh of this.actCylMeshList) {
      const color = new THREE.Color(this.activityColors.get(mesh.userData.activity) || COLOR);
      mesh.material.setValues({ color: color });
      mesh.material.needsUpdate = true;
    }
  }

  // 设置出行方式颜色
  setLegColors(legColors) {
    this.legColors = new Map(legColors.map(v => [v.name, v.color]));
    for (const mesh of this.legMeshList) {
      const color = new THREE.Color(this.legColors.get(mesh.userData.activity) || COLOR);
      mesh.material.setValues({ color: color });
      mesh.material.needsUpdate = true;
    }
  }

  setActScale(actScale) {
    this.actScale = actScale;
    this.updateSize()
  }

  setActScale(actScale) {
    this.actScale = actScale;
    this.updateSize()
  }

  setLegScale(legScale) {
    this.legScale = legScale;
    this.updateSize()
  }

  // 根据地图高度更新大小
  updateSize() {
    this.actWidth = this.map.cameraHeight / 400;
    this.legWidth = this.map.cameraHeight / 100;
    this.labelWidth = this.map.cameraHeight / 4000;
    {
      const scale = this.actScale * this.actWidth;
      for (const mesh of this.actStartMeshList) {
        mesh.scale.set(scale, scale, 1)
      }
      for (const mesh of this.actEndMeshList) {
        mesh.scale.set(scale, scale, 1)
      }
      for (const mesh of this.actCylMeshList) {
        mesh.scale.set(scale, 1, scale)
      }
    }
    {
      for (const mesh of this.legMeshList) {
        mesh.material.needsUpdate = true;
      }
    }
    {
      const scale = this.labelScale * this.labelWidth;
      for (const mesh of this.labelMeshList) {
        const { width, height } = mesh.userData;
        mesh.scale.set(width * scale, height * scale, 1);
      }
    }
  }

  // 更新图层
  update() {
    if (!this.map) return;
    [this.actStartMeshList, this.actEndMeshList, this.labelMeshList, this.actCylMeshList, this.legMeshList].flat().forEach((v) => {
      v.removeFromParent();
      v.geometry.dispose();
    });
    this.actStartMeshList = [];
    this.actEndMeshList = [];
    this.labelMeshList = [];
    this.actCylMeshList = [];
    this.labelMeshList = [];
    console.log(this.actList);
    console.log(this.legList);

    // 活动
    {
      for (let i = 0, l = this.actList.length; i < l; i++) {
        const item = this.actList[i]
        const { point, startTime, endTime, activity } = item;
        const startZ = Number(startTime) / 60;
        const endZ = Number(endTime) / 60;
        const height = Math.abs(endZ - startZ);
        const color = new THREE.Color(this.activityColors.get(activity) || COLOR);
        const scale = this.actScale * this.actWidth;

        const geometry = new THREE.PlaneGeometry(SIZE, SIZE);
        const material = this.getActMaterial({
          transparent: true,
          // depthWrite: false,
          map: this.actTexture,
          color: color,
        });
        const geometry2 = new THREE.CylinderGeometry(SIZE / 2, SIZE / 2, height);
        const material2 = new THREE.MeshBasicMaterial({
          transparent: true,
          // depthWrite: false,
          color: color,
          opacity: 0.8,
        });
        const startMesh = new THREE.Mesh(geometry, material);
        startMesh.position.set(point[0], point[1], startZ);
        startMesh.scale.set(scale, scale, 1)
        startMesh.userData.activity = activity;
        this.actStartMeshList.push(startMesh);
        this.scaleScene.add(startMesh);

        const endMesh = new THREE.Mesh(geometry, material);
        endMesh.position.set(point[0], point[1], endZ + 0.01);
        endMesh.scale.set(scale, scale, 1)
        endMesh.userData.activity = activity;
        this.actEndMeshList.push(endMesh);
        this.scaleScene.add(endMesh);

        const cylMesh = new THREE.Mesh(geometry2, material2);
        cylMesh.rotateX(Math.PI / 2);
        cylMesh.position.set(point[0], point[1], startZ + height / 2);
        cylMesh.scale.set(scale, 1, scale)
        cylMesh.userData.activity = activity;
        this.actCylMeshList.push(cylMesh);
        this.scaleScene.add(cylMesh);

      }
    }
    // 路径
    {
      for (let i = 0, l = this.legList.length; i < l; i++) {
        const item = this.legList[i];
        const { path, activity } = item;
        const color = new THREE.Color(this.legColors.get(activity) || COLOR);
        console.log(activity, color.getHexString());
        const geometry = this.getLegGeometry(path.paths);
        const material = this.getLegMaterial({
          side: THREE.DoubleSide,
          // depthWrite: false,
          transparent: true,
          map: this.legTexture,
          color: color,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.activity = activity;
        this.scaleScene.add(mesh);
        this.legMeshList.push(mesh);
      }
    }
    // 时间标签
    {
      const timeMap = {};
      for (let i = 0, l = this.actList.length; i < l; i++) {
        const item = this.actList[i]
        const { point, startTime, endTime, activity } = item;
        const startZ = Number(startTime) / 60;
        const endZ = Number(endTime) / 60;
        timeMap[startTime] = [point[0], point[1], startZ]
        timeMap[endTime] = [point[0], point[1], endZ];
      }
      const loader = new THREE.TextureLoader();
      const scale = this.labelScale * this.labelWidth;
      for (const key in timeMap) {
        const { url, width, height } = getTextImage(formatHour(Number(key)), { colNum: 8, family: "wending" });
        const texture = loader.load(url);
        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        const mesh = new THREE.Sprite(
          new THREE.SpriteMaterial({
            transparent: true,
            map: texture,
            depthTest: false,
          })
        );
        mesh.renderOrder = 999;

        mesh.scale.set(width * scale, height * scale, 1);
        mesh.center.set(0.5, 0);
        mesh.position.set(...timeMap[key]);

        mesh.userData.width = width;
        mesh.userData.height = height;

        this.scaleScene.add(mesh);
        this.labelMeshList.push(mesh);
      }
    }

    const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
    this.scaleScene.position.set(x, y, 0);
  }

  // 获取活动材质
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

  // 获取出行方式材质
  getLegMaterial(opt) {
    const material = new THREE.MeshBasicMaterial(opt);
    material.onBeforeCompile = (shader) => {
      const lineWidth = Number(this.legWidth * this.legScale).toFixed(2)
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
          #include <common>

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
          float lineWidth = ${lineWidth};
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
              float lineWidth = ${lineWidth} * 2.0;
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
        lineWidth: this.legWidth,
        lineScale: this.legScale,
      });
    };
    return material;
  }

  // 获取出行方式几何体
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
    const attrLength = new THREE.BufferAttribute(
      new Float32Array(length * 4 + 2),
      1
    );

    for (let index = 0; index < data.length; index++) {
      const link = data[index];
      const prevLink = index == 0 ? link : data[index - 1];
      const nextLink = index == data.length - 1 ? link : data[index + 1];

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
    geometry.index = attrIndex;
    return geometry
  }
}