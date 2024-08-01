import { Layer, MAP_EVENT, OutlineLayer, SCENE_MAP } from "@/mymap";
import * as THREE from "three";
import { VectorTile, VectorTileFeature } from "@mapbox/vector-tile";
import Protobuf from "pbf";
import axios from "axios";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import styleJson from "./mapbox_style_json.json"
// const styleMap = style.layers.reduce(function (pre, cur) {
//   pre[cur["source-layer"]] = cur;
// }, {})

// "@mapbox/vector-tile": "^1.3.1",
// "pbf": "^3.2.1",
const colors = ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"];

export class MapBoxTileLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.init();
  }

  async init() {
    const tile = await MyTile.createTile(`/5636.vector.pbf`);
    console.log(tile);
    this.scene.add(tile._threeScene);

    console.log(styleJson);
  }
}

class MyTile extends VectorTile {

  _threeScene = null;

  static createTile(url) {
    return axios({
      url: url,
      method: "get",
      responseType: "arraybuffer",
    }).then(res => new MyTile(new Protobuf(res.data)))
  }

  constructor(pbf, col, row) {
    super(pbf);
    this._col = col;
    this._row = row;
    this._threeScene = new THREE.Group();
    for (const [namei, name] of Object.keys(this.layers).entries()) {
      const layer = this.layers[name];
      const color = colors[namei % 10];
      const group = new THREE.Group();
      group.name = name;
      for (let i = 0; i < layer.length; i++) {
        const feature = layer.feature(i);
        const points = feature.loadGeometry();
        const type = VectorTileFeature.types[feature.type];
        switch (type) {
          case "Point": {
            const mesh = this.getPointMesh(points, { color: color });
            mesh.position.setZ(namei * -0.05);
            this._threeScene.add(mesh);
            break;
          }
          case "LineString": {
            const mesh = this.getLineMesh(points, { color: color })
            mesh.position.setZ(namei * -0.05);
            this._threeScene.add(mesh);
            break;
          }
          case "Polygon": {
            const mesh = this.getPolygonMesh(points, { color: color })
            mesh.position.setZ(namei * -0.05);
            this._threeScene.add(mesh);
            break;
          }
          case "Unknown": {
            break;
          }
        }
      }
      console.log(name);
    }
  }

  getPointMesh(points, style) {
    const l1 = points.flat(1).map(v => new THREE.Vector3(v.x, v.y, 0));
    const material = new THREE.PointsMaterial({ color: style.color });
    const geometry = new THREE.BufferGeometry().setFromPoints(l1);
    return new THREE.Points(geometry, material);
  }

  getLineMesh(points, style) {
    const l1 = [];
    for (const v1 of points) {
      l1[l1.length] = new THREE.Vector3(v1[0].x, v1[0].y, 0);
      for (let i2 = 1, l = v1.length - 1; i2 < l; i2++) {
        l1[l1.length] = new THREE.Vector3(v1[i2].x, v1[i2].y, 0);
        l1[l1.length] = new THREE.Vector3(v1[i2].x, v1[i2].y, 0);
      }
      l1[l1.length] = new THREE.Vector3(v1[v1.length - 1].x, v1[v1.length - 1].y, 0);
    }
    const material = new THREE.LineBasicMaterial({ color: style.color });
    const geometry = new THREE.BufferGeometry().setFromPoints(l1);
    return new THREE.LineSegments(geometry, material);
  }

  getPolygonMesh(points, style) {
    const material = new THREE.MeshBasicMaterial({ color: style.color });
    const geometryList = [];
    for (const v1 of points) {
      const heartShape = new THREE.Shape(v1.map(v => new THREE.Vector2(v.x, v.y)));
      const geometry = new THREE.ShapeGeometry(heartShape);
      geometryList.push(geometry);
    }
    return new THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(geometryList, false), material);
  }

}