

import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import proj4 from 'proj4'
proj4.defs("EPSG:4526", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
// proj4("EPSG:4526", "EPSG:3857", [lng, lat])

import axios from "axios";

const DEFAULT_CRS = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } };

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
      if (item.isInstancedMesh && (item.userData.type == "Point" || item.userData.type == "MultiPoint")) {
        for (let i = 0, l = item.count; i < l; i++) {
          const matrix = new THREE.Matrix4();
          item.getMatrixAt(i, matrix);
          matrix.set(
            pointScale, 0, 0, matrix.elements[12],
            0, pointScale, 0, matrix.elements[13],
            0, 0, pointScale, matrix.elements[14],
            0, 0, 0, 1
          )
          item.setMatrixAt(i, matrix);
        }
        item.instanceMatrix.needsUpdate = true;
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

    // axios.get("./data/line2.geojson").then((res) => {
    //   console.log(res.data);
    //   this.setData(res.data)
    // });
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
    this.update();
  }

  setData(data) {
    this.data = data;
    this.update()
  }

  update() {
    this.clearScene();
    console.log("update", this.map, this.data);
    if (!this.map) return;
    if (!this.data) return;
    const center = [...this.map.center];
    // const center = [0, 0];
    console.time("loadGeoJson");
    const scene = this.loadGeoJson(this.data, DEFAULT_CRS, center);
    console.timeEnd("loadGeoJson");
    console.log(scene);
    this.scene.add(scene);

  }

  loadGeoJson(data, parentCrs, center) {
    if (data.type === "FeatureCollection") {
      const { features, crs, ...other } = data;
      return this.getFeatureCollection(features, crs || parentCrs, center, other);
    } else if (data.type === "Feature") {
      const { geometry, crs, ...other } = data;
      return this.getFeature(geometry, crs || parentCrs, center, other);
    } else if (data.type === "GeometryCollection") {
      const { geometries, crs, ...other } = data;
      return this.getGeometryCollection(geometries, crs || parentCrs, center, other);
    } else if (data.type === "Point") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiPoint([coordinates], crs || parentCrs, center, other);
    } else if (data.type === "MultiPoint") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiPoint(coordinates, crs || parentCrs, center, other);
    } else if (data.type === "LineString") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiLineString([coordinates], crs || parentCrs, center, other);
    } else if (data.type === "MultiLineString") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiLineString(coordinates, crs || parentCrs, center, other);
    } else if (data.type === "Polygon") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiPolygon([coordinates], crs || parentCrs, center, other);
    } else if (data.type === "MultiPolygon") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiPolygon(coordinates, crs || parentCrs, center, other);
    }
  }

  getFeatureCollection(features, crs, center, other) {
    const mesh = new THREE.Group();
    for (const item of features) {
      mesh.add(this.loadGeoJson(item, crs, center));
    }
    mesh.userData = { ...other, crs, center };
    return mesh;
  }

  getFeature(geometry, crs, center, other) {
    const mesh = this.loadGeoJson(geometry, crs, center);
    mesh.userData.feature = { ...other };
    return mesh;
  }

  getGeometryCollection(geometries, crs, center, other) {
    const mesh = new THREE.Group();
    for (const item of geometries) {
      mesh.add(this.loadGeoJson(item, crs, center));
    }
    mesh.userData = { ...other, crs, center };
    return mesh;
  }
  getMultiPoint(coordinates, crs, center, other) {
    const mesh = new THREE.InstancedMesh(this.pointGeometry, this.pointMaterial, coordinates.length);
    mesh.count
    const _scale = this.pointScale;
    const coordSys = crs.properties.name.match(/EPSG::\d+/)[0].replace("::", ":");

    for (let i = 0; i < coordinates.length; i++) {
      let [x, y] = coordinates[i];
      if (coordSys !== "EPSG:3857") {
        [x, y] = proj4(coordSys, "EPSG:3857", [x, y]);
      }
      const point = [x - center[0], y - center[1]];

      const positionV3 = new THREE.Vector3(point[0], point[1], 0.1 / coordinates.length);
      const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);

      const matrix = new THREE.Matrix4();
      matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData = { ...other, crs, center };
    mesh.position.set(0, 0, 0.3)
    return mesh;
  }

  getMultiLineString(coordinates, crs, center, other) {
    const coordSys = crs.properties.name.match(/EPSG::\d+/)[0].replace("::", ":");
    const geometryList = [];
    for (const pointList of coordinates) {
      const lineList = [];
      let fromCoord = null;
      let length = 0
      for (const point of pointList) {
        let [x, y] = point;
        if (coordSys !== "EPSG:3857") {
          [x, y] = proj4(coordSys, "EPSG:3857", [x, y]);
        }
        x = x - center[0];
        y = y - center[1];
        if (!fromCoord) {
          fromCoord = { x, y };
          continue;
        }
        const toCoord = { x, y };
        const fromLength = length;
        const lineLength = Math.sqrt(
          Math.pow(fromCoord.x - toCoord.x, 2) + Math.pow(fromCoord.y - toCoord.y, 2)
        );
        const toLength = fromLength + lineLength;
        lineList.push({
          fromCoord,
          toCoord,
          fromLength,
          toLength,
          lineLength,
        })
      }
      const geometry = this.getLineGeometry(lineList);
      geometryList.push(geometry)
    }
    const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
    const mesh = new THREE.Mesh(geometry, this.lineMaterial);
    mesh.userData = { ...other, crs, center };
    mesh.position.set(0, 0, 0.2)
    return mesh;
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
    const attrColor = new THREE.BufferAttribute(
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
        attrLength.setX(index * 4, link.fromLength);
        attrLength.setX(index * 4 + 1, link.fromLength);
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

  getLineMaterial({ ...opt }) {
    const material = new THREE.MeshBasicMaterial({
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

  getMultiPolygon(coordinates, crs, center, other) {
    const coordSys = crs.properties.name.match(/EPSG::\d+/)[0].replace("::", ":");
    const _coordinates = JSON.parse(JSON.stringify(coordinates));
    const geometryList = [];
    for (const v1 of _coordinates) {
      for (const v2 of v1) {
        for (const v3 of v2) {
          let [x, y] = v3;
          if (coordSys !== "EPSG:3857") {
            [x, y] = proj4(coordSys, "EPSG:3857", [x, y]);
          }
          v3[0] = x - center[0];
          v3[1] = y - center[1];
        }
      }
      const shape = new THREE.Shape(v1[0].map((v) => new THREE.Vector2(v[0], v[1])));
      for (const item2 of v1.slice(1)) {
        const holePath = new THREE.Path(item2.map((v) => new THREE.Vector2(v[0], v[1])));
        shape.holes.push(holePath);
      }
      geometryList.push(new THREE.ShapeGeometry(shape));
    }

    const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
    const mesh = new THREE.Mesh(geometry, this.polygonMaterial);
    mesh.userData = { ...other, crs, center };
    mesh.position.set(0, 0, 0.1)
    return mesh;
  }


}









