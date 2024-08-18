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
    this.pointList = [];
    this.lineList = [];
    this.polygonList = [];
    this.center = null;
    this.json = json;
    this.crs = json.crs;
    this.coordSys = GeoJSONParser.decodeCrs(json.crs);
    this.parse(this.json);
  }

  parse(data) {
    const list = [data];
    while (list.length > 1) {
      const item = list.shift();
      if (data.type === "FeatureCollection") {
        list.push(...item.features);
      } else if (data.type === "Feature") {
        const { properties, geometry } = item;
      } else if (data.type === "GeometryCollection") {
        list.push(...item.geometries);
      } else if (data.type === "Point") {
        const { coordinates, crs, ...other } = data;
        this.getMultiPoint([coordinates], crs || parentCrs);
      } else if (data.type === "MultiPoint") {
        const { coordinates, crs, ...other } = data;
        this.getMultiPoint(coordinates, crs || parentCrs);
      } else if (data.type === "LineString") {
        const { coordinates, crs, ...other } = data;
        this.getMultiLineString([coordinates], crs || parentCrs);
      } else if (data.type === "MultiLineString") {
        const { coordinates, crs, ...other } = data;
        this.getMultiLineString(coordinates, crs || parentCrs);
      } else if (data.type === "Polygon") {
        const { coordinates, crs, ...other } = data;
        this.getMultiPolygon([coordinates], crs || parentCrs);
      } else if (data.type === "MultiPolygon") {
        const { coordinates, crs, ...other } = data;
        this.getMultiPolygon(coordinates, crs || parentCrs);
      }
    }
  }

  getMultiPoint(coordinates, crs) {
    const coordSys = GeoJSONParser.decodeCrs(crs);
    for (let i = 0; i < coordinates.length; i++) {
      let [x, y] = coordinates[i];
      if (coordSys !== "EPSG:3857") [x, y] = proj4(coordSys, "EPSG:3857", [x, y]);
      if (!this.center) this.center = [x, y];
      x -= this.center[0];
      y -= this.center[1];
      this.pointList[this.pointList.length] = [x, y]
    }
  }

  getMultiLineString(coordinates, crs) {
    const coordSys = GeoJSONParser.decodeCrs(crs);
    for (let i = 0; i < coordinates.length; i++) {
      const line = [];
      let fromCoord = null;
      let length = 0
      for (let j = 0; j < coordinates[i].length; j++) {
        let [x, y] = coordinates[i][j];
        if (coordSys !== "EPSG:3857") [x, y] = proj4(coordSys, "EPSG:3857", [x, y]);
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
      this.lineList[this.lineList.length] = line;
    }
  }

  getMultiPolygon(coordinates, crs) {
    const coordSys = GeoJSONParser.decodeCrs(crs);
    for (let i = 0; i < coordinates.length; i++) {
      const coordinate = [];
      for (let j = 0; j < coordinates[i].length; j++) {
        coordinate[j] = [];
        for (let k = 0; k < coordinates[i][j].length; k++) {
          let [x, y] = coordinates[i][j][k];
          if (coordSys !== "EPSG:3857") [x, y] = proj4(coordSys, "EPSG:3857", [x, y]);
          if (!this.center) this.center = [x, y];
          x -= this.center[0];
          y -= this.center[1];
          coordinate[j][k] = [x, y]
        }
      }
      this.polygonList[this.polygonList.length] = coordinate;
    }
  }

  getPointArray() {
    return new Float64Array([this.center[0], this.center[1], this.pointList].flat(2));
  }

  getLineArray() {
    const list = [this.center[0], this.center[1]];
    for (let i = 0; i < this.lineList.length; i++) {
      const v1 = this.lineList[i];
      list[list.length] = v1.length * 3;
      for (const v2 of v1) {
        list[list.length] = v2[0];
        list[list.length] = v2[1];
        list[list.length] = v2[2];
      }
    }
    return new Float64Array(list);
  }

  getPolygonArray() {
    const list = [this.center[0], this.center[1]];
    for (let i = 0; i < this.polygonList.length; i++) {
      const polygon = this.polygonList[i];
      const pl = [];
      for (let j = 0; j < polygon.length; j++) {
        const coordinate = polygon[j];
        pl[pl.length] = coordinate.length * 2;
        pl[pl.length] = coordinate;
      }
      const _l = pl.flat(2);
      list[list.length] = _l.length;
      list[list.length] = _l;
    }
    return new Float64Array(list.flat(2));
  }

}

onmessage = function (e) {
  const decode = new TextDecoder();
  const str = decode.decode(e.data);
  const parser = new GeoJSONParser(JSON.parse(str));
  const pointArray = parser.getPointArray();
  const lineArray = parser.getLineArray();
  const polygonArray = parser.getPolygonArray()
  this.postMessage({
    center: parser.center,
    point: pointArray,
    line: lineArray,
    polygon: polygonArray,
  }, [pointArray.buffer, lineArray.buffer, polygonArray.buffer]);
};