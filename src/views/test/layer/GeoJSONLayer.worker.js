import proj4 from 'proj4'
proj4.defs("EPSG:4526", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
// proj4("EPSG:4526", "EPSG:3857", [lng, lat])

class GeoJSONParser {

  static DEFAULT_CRS = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } };

  constructor(json) {
    this.pointList = [];
    this.lineList = [];
    this.polygonList = [];
    this.center = null;
    this.json = json;
    this.parse(this.json, GeoJSONParser.DEFAULT_CRS);
  }

  parse(data, parentCrs) {
    if (data.type === "FeatureCollection") {
      const { features, crs, ...other } = data;
      for (const item of features) {
        this.parse(item, crs || parentCrs)
      }
    } else if (data.type === "Feature") {
      const { geometry, crs, ...other } = data;
      this.parse(geometry, crs || parentCrs)
    } else if (data.type === "GeometryCollection") {
      const { geometries, crs, ...other } = data;
      for (const item of geometries) {
        this.parse(item, crs || parentCrs);
      }
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

  getMultiPoint(coordinates, crs) {
    const coordSys = crs.properties.name.match(/EPSG::\d+/)[0].replace("::", ":");
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
    const coordSys = crs.properties.name.match(/EPSG::\d+/)[0].replace("::", ":");
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
          const fromLength = length;
          const lineLength = Math.sqrt(Math.pow(fromCoord[0] - x, 2) + Math.pow(fromCoord[1] - y, 2));
          const toLength = fromLength + lineLength;
          line[j] = [x, y, toLength];
        }
        fromCoord = [x, y];
      }
      this.lineList[this.lineList.length] = line;
    }
  }

  getMultiPolygon(coordinates, crs) {
    const coordSys = crs.properties.name.match(/EPSG::\d+/)[0].replace("::", ":");
    for (let i = 0; i < coordinates.length; i++) {
      const coordinate = [];
      for (let j = 0; j < coordinates[i].length; j++) {
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
    return mesh;
  }

  getPointArray() {
    return new Float32Array([1, this.center, this.pointList].flat(2));
  }

  getLineArray() {
    const list = [2, this.center];
    for (let i = 0; i < this.lineList.length; i++) {
      const line = this.lineList[i];
      list[list.length] = line.length * 3;
      list[list.length] = line;
    }
    return new Float32Array(list.flat(2));
  }
}

onmessage = function (e) {
  if (e.data instanceof Int8Array) {
    const [key] = e.data;
    const data = e.data.slice(1);
    switch (key) {
      case 1: {
        const reader = new FileReader();
        reader.readAsText(new Blob([data]));
        reader.onload = (e) => {
          const parser = new GeoJSONParser(JSON.parse(e.target.result));
          if (parser.pointList.length > 0) {
            const array = new Float32Array([1, parser.center, parser.pointList].flat(2));
            this.postMessage(array, [array.buffer]);
          }
          if (parser.lineList.length > 0) {
            const list = [2, parser.center];
            for (let i = 0; i < parser.lineList.length; i++) {
              const line = parser.lineList[i];
              list[list.length] = line.length * 3;
              list[list.length] = line;
            }
            const array = new Float32Array(list.flat(2));
            this.postMessage(array, [array.buffer]);
          }
        };
        reader.onerror = (e) => {
          reject(e);
        };
        break;
      }
    }
  }
};