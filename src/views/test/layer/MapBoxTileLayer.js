import { Layer, MAP_EVENT, OutlineLayer, SCENE_MAP } from "@/mymap";
import * as THREE from "three";
import { VectorTile } from "@mapbox/vector-tile";
import Protobuf from "pbf";
import axios from "axios";

import MapBoxTileLayerWorker from "./MapBoxTileLayer.worker";

// "@mapbox/vector-tile": "^1.3.1",
// "pbf": "^3.2.1",

export class MapBoxTileLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.init();
  }

  async init() {
    const response = await axios({
      url: `/5636.vector.pbf`,
      method: "get",
      responseType: "arraybuffer",
    })
    var pbfData = new Protobuf(response.data);
    var tile = new VectorTile(pbfData);
    console.log(tile);


    // Contains a map of all layers
    const json1 = {};
    const json2 = {};
    const json3 = {};

    for (const name in tile.layers) {
      const layer = tile.layers[name];
      const geoJsonList1 = [];
      const geoJsonList2 = [];
      const geoJsonList3 = [];
      for (let i = 0; i < layer.length; i++) {
        const feature = layer.feature(i);
        geoJsonList1.push(feature.loadGeometry());
        geoJsonList2.push(feature.toGeoJSON(0, 0, 0));
        geoJsonList3.push(feature);
      }

      json1[name] = geoJsonList1;
      json2[name] = geoJsonList2;
      json3[name] = geoJsonList3;
    }

    console.log(json1);
    console.log(json2);
    console.log(json3);

    this.worker = new MapBoxTileLayerWorker();
  }
}