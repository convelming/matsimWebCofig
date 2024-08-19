import proj4 from "@/utils/proj4.util";

class GeoJSONParser {

  static DEFAULT_CRS = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } };

  // urn:ogc:def:crs:EPSG::3857
  // urn:ogc:def:crs:OGC:1.3:CRS84
  static decodeCrs(crs) {
    try {
      return crs.properties.name.match(/EPSG::\d+/)[0].replace("::", ":");
    } catch (error) {
      return crs.properties.name || "EPSG:3857";
    }
  }

  constructor(json) {
    this.json = json;
    this.crs = json.crs;
    this.coordSys = GeoJSONParser.decodeCrs(json.crs);
    console.time("GeoJSONParser");
    this.#parse(this.json);
    console.timeEnd("GeoJSONParser");
    console.log(this.pointList, this.lineList, this.polygonList);
  }

  // #parse(item) {
  //   let propertiesKey = item.propertiesKey || 0;
  //   if (item.properties) {
  //     propertiesKey = ++this._propertiesKey;
  //     this.propertiesMap[propertiesKey] = item.properties;
  //   }
  //   if (item.type === "FeatureCollection") {
  //     for (const f of item.features) {
  //       f.propertiesKey = propertiesKey;
  //       this.#parse(f);
  //     }
  //   } else if (item.type === "Feature") {
  //     item.geometry.propertiesKey = propertiesKey;
  //     this.#parse(item.geometry)
  //   } else if (item.type === "GeometryCollection") {
  //     for (const g of item.geometries) {
  //       g.propertiesKey = propertiesKey;
  //       this.#parse(g);
  //     }
  //   } else if (item.type === "Point") {
  //     this.pointList[this.pointList.length] = {
  //       propertiesKey: item.propertiesKey || 0,
  //       geometry: this.getMultiPoint([item.coordinates])
  //     }
  //   } else if (item.type === "MultiPoint") {
  //     this.pointList[this.pointList.length] = {
  //       propertiesKey: item.propertiesKey || 0,
  //       geometry: this.getMultiPoint(item.coordinates)
  //     }
  //   } else if (item.type === "LineString") {
  //     this.pointList[this.pointList.length] = {
  //       propertiesKey: item.propertiesKey || 0,
  //       geometry: this.getMultiLineString([item.coordinates])
  //     }
  //       ;
  //   } else if (item.type === "MultiLineString") {
  //     this.pointList[this.pointList.length] = {
  //       propertiesKey: item.propertiesKey || 0,
  //       geometry: this.getMultiLineString(item.coordinates)
  //     }
  //   } else if (item.type === "Polygon") {
  //     this.pointList[this.pointList.length] = {
  //       propertiesKey: item.propertiesKey || 0,
  //       geometry: this.getMultiPolygon([item.coordinates])
  //     }
  //   } else if (item.type === "MultiPolygon") {
  //     this.pointList[this.pointList.length] = {
  //       propertiesKey: item.propertiesKey || 0,
  //       geometry: this.getMultiPolygon(item.coordinates)
  //     }
  //   }
  // }

  #parse(data) {
    const list = [data];

    const propertiesMap = {
      0: {},
    };
    const pointList = [];
    const lineList = [];
    const polygonList = [];
    let _propertiesKey = 0;
    while (list.length > 0) {
      const item = list.pop();
      if (item.type === "FeatureCollection") {
        for (const f of item.features) {
          list.push(f)
        }
      } else if (item.type === "Feature") {
        const propertiesKey = ++_propertiesKey;
        const { properties, geometry } = item;
        propertiesMap[propertiesKey] = properties;
        if (geometry.type === "GeometryCollection") {
          for (const g of geometry.geometries) {
            g.propertiesKey = propertiesKey;
            list.push(g);
          }
        } else {
          geometry.propertiesKey = propertiesKey;
          list.push(geometry);
        }
      } else if (item.type === "GeometryCollection") {
        for (const g of item.geometries) {
          list.push(g);
        }
      } else if (item.type === "Point") {
        const geometry = this.getMultiPoint([item.coordinates]);
        pointList[pointList.length] = {
          propertiesKey: item.propertiesKey || 0,
          geometry: geometry
        };
      } else if (item.type === "MultiPoint") {
        const geometry = this.getMultiPoint(item.coordinates);
        pointList[pointList.length] = {
          propertiesKey: item.propertiesKey || 0,
          geometry: geometry
        };
      } else if (item.type === "LineString") {
        const geometry = this.getMultiLineString([item.coordinates]);
        lineList[lineList.length] = {
          propertiesKey: item.propertiesKey || 0,
          geometry: geometry
        };
      } else if (item.type === "MultiLineString") {
        const geometry = this.getMultiLineString(item.coordinates);
        lineList[lineList.length] = {
          propertiesKey: item.propertiesKey || 0,
          geometry: geometry
        };
      } else if (item.type === "Polygon") {
        const geometry = this.getMultiPolygon([item.coordinates]);
        polygonList[polygonList.length] = {
          propertiesKey: item.propertiesKey || 0,
          geometry: geometry
        };
      } else if (item.type === "MultiPolygon") {
        const geometry = this.getMultiPolygon(item.coordinates);
        polygonList[polygonList.length] = {
          propertiesKey: item.propertiesKey || 0,
          geometry: geometry
        };
      }
    }
    {
      const list = [];
      for (const { propertiesKey, geometry } of pointList) {
        const l = geometry.flat();
        list.push(l.length + 1);
        list.push(propertiesKey);
        list.push(...l);
      }
      this.pointArray = new Float64Array(list);
    }
    {
      const list = [];
      for (const { propertiesKey, geometry } of lineList) {
        for (const line of geometry) {
          const l = line.flat();
          list.push(l.length + 1);
          list.push(propertiesKey);
          list.push(...l);
        }
      }
      this.lineArray = new Float64Array(list);

    }
    {
      const list = [];
      for (const { propertiesKey, geometry } of polygonList) {
        for (const polygon of geometry) {
          const shapeList = []
          for (const shape of polygon) {
            const l = shape.flat();
            shapeList.push(l.length);
            shapeList.push(...l);
          }
          list.push(shapeList.length + 1);
          list.push(propertiesKey);
          list.push(...shapeList);
        }
      }
      this.polygonArray = new Float64Array(list);
    }
    {
      const encode = new TextEncoder();
      const uint8 = encode.encode(JSON.stringify(propertiesMap));
      this.propertiesMapArray = new Float64Array(list);
    }

    this.pointList = pointList;
    this.lineList = lineList;
    this.polygonList = polygonList;
    this.propertiesMap = propertiesMap;
  }

  getMultiPoint(coordinates, propertiesKey) {
    const list = []
    for (let i = 0; i < coordinates.length; i++) {
      let [x, y] = coordinates[i];
      if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);
      if (!this.center) this.center = [x, y];
      x -= this.center[0];
      y -= this.center[1];
      list[list.length] = [x, y]
    }
    return list;
  }

  getMultiLineString(coordinates, propertiesKey) {
    const list = []
    for (let i = 0; i < coordinates.length; i++) {
      const line = [];
      let fromCoord = null;
      let length = 0
      for (let j = 0; j < coordinates[i].length; j++) {
        let [x, y] = coordinates[i][j];
        if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);
        if (!this.center) this.center = [x, y];
        x -= this.center[0];
        y -= this.center[1];
        if (j == 0) {
          line[0] = [x, y, 0];
        } else {
          const lineLength = Math.sqrt(Math.pow(fromCoord[0] - x, 2) + Math.pow(fromCoord[1] - y, 2));
          length += lineLength;
          const toLength = length;
          line[j] = [x, y, toLength];
        }
        fromCoord = [x, y];
      }
      list[list.length] = line;
    }
    return list;
  }

  getMultiPolygon(coordinates, propertiesKey) {
    const list = []
    for (let i = 0; i < coordinates.length; i++) {
      const coordinate = [];
      for (let j = 0; j < coordinates[i].length; j++) {
        coordinate[j] = [];
        for (let k = 0; k < coordinates[i][j].length; k++) {
          let [x, y] = coordinates[i][j][k];
          if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);
          if (!this.center) this.center = [x, y];
          x -= this.center[0];
          y -= this.center[1];
          coordinate[j][k] = [x, y]
        }
      }
      list[list.length] = coordinate;
    }
    return list;
  }

}

onmessage = function (e) {
  const decode = new TextDecoder();
  const str = decode.decode(e.data);
  const parser = new GeoJSONParser(JSON.parse(str));
  // const pointArray = parser.getPointArray();
  // const lineArray = parser.getLineArray();
  // const polygonArray = parser.getPolygonArray()
  // this.postMessage({
  //   center: parser.center,
  //   point: pointArray,
  //   line: lineArray,
  //   polygon: polygonArray,
  // }, [pointArray.buffer, lineArray.buffer, polygonArray.buffer]);
};