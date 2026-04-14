importScripts(process.env.VUE_APP_PUBLIC_PATH + "static/js/proj4.js");
try {
  importScripts(process.env.VUE_APP_BASE_API + "/pt/main2/getJsConfig/config.js");
} catch (error) {
  importScripts(process.env.VUE_APP_PUBLIC_PATH + "static/js/config.js");
}

const showLog = false;

class GeoJSONParser {
  // static DEFAULT_CRS = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } };

  // urn:ogc:def:crs:EPSG::3857
  // urn:ogc:def:crs:OGC:1.3:CRS84

  // 0 未有数据 1 正在处理数据 2 已经处理完数据
  static = 0;

  range = {
    minx: Number.MAX_SAFE_INTEGER,
    miny: Number.MAX_SAFE_INTEGER,
    maxx: Number.MIN_SAFE_INTEGER,
    maxy: Number.MIN_SAFE_INTEGER,
  };

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

  setData(json) {
    this.static = 1;
    this.crs = json.crs;
    this.coordSys = GeoJSONParser.decodeCrs(json.crs);

    const timeKey = new Date().getTime() + Math.random();
    const list = [json];

    // 属性类型
    const propertiesLabels = {};
    let properties__id = 0;
    const geomMap = {
      0: {
        tl: { x: 0, y: 0 },
        br: { x: 0, y: 0 },
        pointList: [],
        lineList: [],
        polygonList: [],
        properties: {},
      },
    };

    if (showLog) {
      console.time(timeKey + "_解析几何属性 success");
    }
    while (list.length > 0) {
      const item = list.pop();
      // propertiesKey默认为父元素的propertiesKey 如果父元素没有propertiesKey，则默认为0
      let propertiesKey = item.propertiesKey || 0;
      // 如果有properties，则根据properties的长度生成propertiesKey，propertiesKey=0代表没有属性
      if (item.properties) {
        propertiesKey = ++properties__id;
        const properties = JSON.parse(JSON.stringify(item.properties));
        properties.__id = propertiesKey;
        geomMap[propertiesKey] = {
          tl: { x: Number.MAX_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER },
          br: { x: Number.MIN_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER },
          pointList: [],
          lineList: [],
          polygonList: [],
          properties: properties,
        };
        for (const key in properties) {
          // 判断属性类型
          const type = Number.isFinite(Number(properties[key])) && properties[key] !== "" ? "Number" : "String";
          if (type === "String") {
            // 如果value是字符串类型，则创建一个map作为映射表，把字符串映射成数字再使用
            propertiesLabels[key] = { type: "String", name: key, map: {}, min: 0, max: 0, values: [] };
          } else if (type === "Number") {
            // 如果value是数字类型，则直接使用
            propertiesLabels[key] = { type: "Number", name: key, min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER, values: [] };
          }
        }
      }
      // 解析几何属性
      if (item.type === "FeatureCollection") {
        for (const f of item.features || []) {
          f.propertiesKey = propertiesKey;
          list.push(f);
        }
      } else if (item.type === "Feature" && item.geometry) {
        item.geometry.propertiesKey = propertiesKey;
        list.push(item.geometry);
      } else if (item.type === "GeometryCollection") {
        for (const g of item.geometries || []) {
          g.propertiesKey = propertiesKey;
          list.push(g);
        }
      } else if (item.type === "Point") {
        const pointList = geomMap[propertiesKey].pointList;
        for (const point of this.#getMultiPoint([item.coordinates])) {
          pointList[pointList.length] = point;
        }
      } else if (item.type === "MultiPoint") {
        const pointList = geomMap[propertiesKey].pointList;
        for (const point of this.#getMultiPoint(item.coordinates)) {
          pointList[pointList.length] = point;
        }
      } else if (item.type === "LineString") {
        const lineList = geomMap[propertiesKey].lineList;
        for (const line of this.#getMultiLineString([item.coordinates])) {
          lineList[lineList.length] = line;
        }
      } else if (item.type === "MultiLineString") {
        const lineList = geomMap[propertiesKey].lineList;
        for (const line of this.#getMultiLineString(item.coordinates)) {
          lineList[lineList.length] = line;
        }
      } else if (item.type === "Polygon") {
        const polygonList = geomMap[propertiesKey].polygonList;
        for (const polygon of this.#getMultiPolygon([item.coordinates])) {
          polygonList[polygonList.length] = polygon;
        }
      } else if (item.type === "MultiPolygon") {
        const polygonList = geomMap[propertiesKey].polygonList;
        for (const polygon of this.#getMultiPolygon(item.coordinates)) {
          polygonList[polygonList.length] = polygon;
        }
      }
    }
    if (showLog) {
      console.timeEnd(timeKey + "_解析几何属性 success");
    }

    this.propertiesLabels = propertiesLabels;
    this.geomMap = geomMap;
    this.static = 2;
  }

  getAllGeom() {}

  getGeomByKeys(keys) {
    return keys.map((v) => this.geomMap[v] || null);
  }

  clear() {
    this.propertiesLabels = {};
    this.geomMap = {};
    this.static = 0;
  }

  #getMultiPoint(coordinates) {
    const list = [];
    for (let i = 0; i < coordinates.length; i++) {
      let [x, y] = coordinates[i];
      // if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);
      // if (!this.center) this.center = [x, y];
      // if (this.range.minx > x) this.range.minx = x;
      // if (this.range.maxx < x) this.range.maxx = x;
      // if (this.range.miny > y) this.range.miny = y;
      // if (this.range.maxy < y) this.range.maxy = y;
      // x -= this.center[0];
      // y -= this.center[1];

      list[list.length] = [x, y];
    }
    return list;
  }

  #getMultiLineString(coordinates) {
    const list = [];
    for (let i = 0; i < coordinates.length; i++) {
      const line = [];
      let fromCoord = null;
      let length = 0;
      for (let j = 0; j < coordinates[i].length; j++) {
        let [x, y] = coordinates[i][j];
        // if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);
        // if (!this.center) this.center = [x, y];
        // if (this.range.minx > x) this.range.minx = x;
        // if (this.range.maxx < x) this.range.maxx = x;
        // if (this.range.miny > y) this.range.miny = y;
        // if (this.range.maxy < y) this.range.maxy = y;
        // x -= this.center[0];
        // y -= this.center[1];
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

  #getMultiPolygon(coordinates) {
    const list = [];
    for (let i = 0; i < coordinates.length; i++) {
      const coordinate = [];
      for (let j = 0; j < coordinates[i].length; j++) {
        coordinate[j] = [];
        for (let k = 0; k < coordinates[i][j].length; k++) {
          let [x, y] = coordinates[i][j][k];
          if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);
          if (!this.center) this.center = [x, y];
          if (this.range.minx > x) this.range.minx = x;
          if (this.range.maxx < x) this.range.maxx = x;
          if (this.range.miny > y) this.range.miny = y;
          if (this.range.maxy < y) this.range.maxy = y;
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

const parser = new GeoJSONParser();

onmessage = function (e) {
  const key = e.data.key;
  const time = e.data.time;
  console.log("postMessage:time:", new Date().getTime() - time + "ms");
  if (key === "setData") {
    const decode = new TextDecoder();
    const resData = JSON.parse(decode.decode(e.data.data));
    parser.setData(resData);
    this.postMessage({ key: key, time: new Date().getTime(), code: 200, data: null, msg: "success" });
  } else if (key === "getGeomByKeys") {
    if (parser.static == 2) {
      const resData = parser.getGeomByKeys(e.data.data);
      this.postMessage({ key: key, time: new Date().getTime(), code: 200, data: resData, msg: "success" });
    } else {
      this.postMessage({ key: key, time: new Date().getTime(), code: 500, data: null, msg: "static:" + parser.static });
    }
  }
  if (key === "getAllGeom") {
    if (parser.static == 2) {
      this.postMessage({ key: key, time: new Date().getTime(), code: 206, data: null, msg: "" });
      this.postMessage({ key: key, time: new Date().getTime(), code: 200, data: null, msg: "" });
    } else {
      this.postMessage({ key: key, time: new Date().getTime(), code: 500, data: null, msg: "static:" + parser.static });
    }
  } else if (key === "clear") {
    parser.clear();
    this.postMessage({ key: key, time: new Date().getTime(), code: 200, data: null, msg: "success" });
  } else if (key === "func") {
    console.log(e.data.data);
    importScripts(e.data.data);
    console.log(getColor, getColor());
  }
};
