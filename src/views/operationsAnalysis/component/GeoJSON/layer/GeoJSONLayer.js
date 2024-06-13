

import * as THREE from "three";
import { Layer, MAP_EVENT } from "@/mymap/index.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import proj4 from 'proj4'
proj4.defs("EPSG:4526", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
// proj4("EPSG:4526", "EPSG:3857", [lng, lat])

import axios from "axios";

const DEFAULT_CRS = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } };

const POINT_SIZE = 10;


export class GeoJSONLayer extends Layer {

  color = new THREE.Color(0xffa500);


  pointColor = new THREE.Color(0xffa500);
  pointTexture = new THREE.TextureLoader().load(require("@/assets/image/point2.png"));

  lineColor = new THREE.Color(0xffa500);

  polygonColor = new THREE.Color(0xffa500);

  constructor(opt) {
    super(opt);
    this.color = new THREE.Color(opt.color || this.color);


    axios.get("./data/hpPTAL.json").then((res) => {
      this.setData(res.data)
    });
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
    const mesh = new THREE.Group();
    mesh.add(this.loadGeoJson(geometry, crs, center));
    mesh.userData = { ...other, crs, center };
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
    const geometry = new THREE.PlaneGeometry(POINT_SIZE, POINT_SIZE);
    const material = new THREE.MeshBasicMaterial({
      depthWrite: false,
      transparent: true,
      map: this.pointTexture,
      color: this.pointColor,
    });
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
              outgoingLight = vColor.rgb;
            }
          #endif
          #include <output_fragment>
        `
      );
    };
    const mesh = new THREE.InstancedMesh(geometry, material, coordinates.length);
    const _scale = 1;

    for (let i = 0; i < coordinates.length; i++) {
      let [x, y] = coordinates[i];
      if (coordSys !== "EPSG:3857") {
        [x, y] = proj4(coordSys, "EPSG:3857", [x, y]);
      }
      const point = [x - center[0], y - center[1]];

      const positionV3 = new THREE.Vector3(point[0], point[1], 0);
      const scaleV3 = new THREE.Vector3(_scale, _scale, _scale);
      const matrix = new THREE.Matrix4();
      matrix.compose(positionV3, new THREE.Quaternion(), scaleV3);

      this.mesh.setMatrixAt(i, matrix);
    }


    mesh.userData = { ...other, crs, center };
    mesh.position.set(0, 0, 0.3)
    return mesh;
  }

  getMultiLineString(coordinates, crs, center, other) {
    const geometry = new THREE.BoxGeometry(80, 80);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, coordinates.length);
    mesh.userData = { ...other, crs, center };
    mesh.position.set(0, 0, 0.2)
    return mesh;
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
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { ...other, crs, center };
    mesh.position.set(0, 0, 0.1)
    return mesh;
  }

}









