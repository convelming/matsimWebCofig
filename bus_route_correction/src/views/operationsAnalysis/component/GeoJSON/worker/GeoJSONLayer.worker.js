import proj4 from "@/utils/proj4.util";

class GeoJSONParser {
  // static DEFAULT_CRS = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } };

  // urn:ogc:def:crs:EPSG::3857
  // urn:ogc:def:crs:OGC:1.3:CRS84
  static decodeCrs(crs) {
    try {
      if (crs.properties.name.indexOf("EPSG") > -1) {
        return crs.properties.name.match(/EPSG::\d+/)[0].replace("::", ":");
      } else {
        return crs.properties.name;
      }
    } catch (error) {
      return "EPSG:3857";
    }
  }

  constructor(json) {
    this.crs = json.crs;
    this.coordSys = GeoJSONParser.decodeCrs(json.crs);
    console.time("GeoJSONParser");
    this.#parse(json);
    console.timeEnd("GeoJSONParser");
  }

  #parse(data) {
    const list = [data];

    const propertiesLabels = {};
    const propertiesList = [{}];
    const pointList = [];
    const lineList = [];
    const polygonList = [];

    while (list.length > 0) {
      const item = list.pop();
      // propertiesKey默认为父元素的propertiesKey 如果父元素没有propertiesKey，则默认为0
      let propertiesKey = item.propertiesKey || 0;
      // 如果有properties，则根据properties的长度生成propertiesKey，propertiesKey=0代表没有属性
      if (item.properties) {
        propertiesKey = propertiesList.length;
        const properties = {};
        propertiesList[propertiesKey] = properties;
        for (const key in item.properties) {
          const type = Number.isFinite(Number(item.properties[key])) ? "Number" : "String";
          // 在属性名里面拼上属性类型，避免同名属性存在不同类型
          // TODO: 如果有同名属性，但类型不同，应该把属性统一为字符串
          const label = key + "__" + type;
          if (type === "Number") {
            // 如果value是数字类型，则直接使用
            const value = Number(item.properties[key]);
            properties[label] = value;
            if (!propertiesLabels[label]) propertiesLabels[label] = { type, name: key, min: value, max: value };
            propertiesLabels[label].min = Math.min(propertiesLabels[label].min, value);
            propertiesLabels[label].max = Math.max(propertiesLabels[label].max, value);
          } else if (type === "String") {
            // 如果value是字符串类型，则创建一个map作为映射表，把字符串映射成数字再使用
            const value = String(item.properties[key]);
            if (!propertiesLabels[label]) propertiesLabels[label] = { type, name: key, map: new Map(), min: 0, max: 0 };
            const map = propertiesLabels[label].map;
            if (!map.has(value)) map.set(value, map.size + 0.5);
            properties[label] = map.get(value);
            propertiesLabels[label].max = map.size;
          }
        }
      }
      if (item.type === "FeatureCollection") {
        for (const f of item.features) {
          f.propertiesKey = propertiesKey;
          list.push(f);
        }
      } else if (item.type === "Feature") {
        item.geometry.propertiesKey = propertiesKey;
        list.push(item.geometry);
      } else if (item.type === "GeometryCollection") {
        for (const g of item.geometries) {
          g.propertiesKey = propertiesKey;
          list.push(g);
        }
      } else if (item.type === "Point") {
        const geometry = this.getMultiPoint([item.coordinates]);
        pointList[pointList.length] = {
          propertiesKey: propertiesKey || 0,
          geometry: geometry,
        };
      } else if (item.type === "MultiPoint") {
        const geometry = this.getMultiPoint(item.coordinates);
        pointList[pointList.length] = {
          propertiesKey: propertiesKey || 0,
          geometry: geometry,
        };
      } else if (item.type === "LineString") {
        const geometry = this.getMultiLineString([item.coordinates]);
        lineList[lineList.length] = {
          propertiesKey: propertiesKey || 0,
          geometry: geometry,
        };
      } else if (item.type === "MultiLineString") {
        const geometry = this.getMultiLineString(item.coordinates);
        lineList[lineList.length] = {
          propertiesKey: propertiesKey || 0,
          geometry: geometry,
        };
      } else if (item.type === "Polygon") {
        const geometry = this.getMultiPolygon([item.coordinates]);
        polygonList[polygonList.length] = {
          propertiesKey: propertiesKey || 0,
          geometry: geometry,
        };
      } else if (item.type === "MultiPolygon") {
        const geometry = this.getMultiPolygon(item.coordinates);
        polygonList[polygonList.length] = {
          propertiesKey: propertiesKey || 0,
          geometry: geometry,
        };
      }
    }

    {
      const list = [];
      for (const { propertiesKey, geometry } of pointList) {
        for (const [x, y] of geometry) {
          list.push(x, y, propertiesKey);
        }
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
          const shapeList = [];
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
      this.propertiesListArray = encode.encode(JSON.stringify(propertiesList));
    }
    {
      const encode = new TextEncoder();
      const propertiesLabelsCopy = JSON.parse(JSON.stringify(propertiesLabels));
      for (const [key, value] of Object.entries(propertiesLabelsCopy)) {
        value.values = propertiesList.map((v) => v[key] || 0);
        if (value.type === "String") {
          value.map = Object.fromEntries(propertiesLabels[key].map);
        }
      }
      this.propertiesLabelsArray = encode.encode(JSON.stringify(propertiesLabelsCopy));
    }
    {
      this.propertiesLabels = propertiesLabels;
    }
  }

  getMultiPoint(coordinates) {
    const list = [];
    for (let i = 0; i < coordinates.length; i++) {
      let [x, y] = coordinates[i];
      if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);
      if (!this.center) this.center = [x, y];
      x -= this.center[0];
      y -= this.center[1];
      list[list.length] = [x, y];
    }
    return list;
  }

  getMultiLineString(coordinates) {
    const list = [];
    for (let i = 0; i < coordinates.length; i++) {
      const line = [];
      let fromCoord = null;
      let length = 0;
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

  getMultiPolygon(coordinates) {
    const list = [];
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
          coordinate[j][k] = [x, y];
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
  const time1 = new Date().getTime();
  this.postMessage(
    {
      center: parser.center,
      propertiesLabels: parser.propertiesLabels,
      propertiesLabelsArray: parser.propertiesLabelsArray,
      pointArray: parser.pointArray,
      lineArray: parser.lineArray,
      polygonArray: parser.polygonArray,
      propertiesListArray: parser.propertiesListArray,
    },
    [parser.pointArray.buffer, parser.lineArray.buffer, parser.polygonArray.buffer, parser.propertiesListArray.buffer, parser.propertiesLabelsArray.buffer]
  );
};
