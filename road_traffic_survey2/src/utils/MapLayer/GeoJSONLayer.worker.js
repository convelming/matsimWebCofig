import proj4 from "proj4";
proj4.defs("EPSG:4526", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
proj4.defs("urn:ogc:def:crs:OGC:1.3:CRS84", proj4.defs("EPSG:4326"));
proj4.defs("wgs84", proj4.defs("EPSG:4326"));

const showLog = false;

class GeoJSONParser {
  // static DEFAULT_CRS = { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } };

  // urn:ogc:def:crs:EPSG::3857
  // urn:ogc:def:crs:OGC:1.3:CRS84

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

  constructor(json, options = {}) {
    this.crs = json.crs;
    this.coordSys = GeoJSONParser.decodeCrs(json.crs);
    const timeKey = "GeoJSONParser_" + new Date().getTime();
    console.time(timeKey);
    this.#parse(json, options);
    console.timeEnd(timeKey);
  }

  #parse(data, options) {
    const timeKey = new Date().getTime() + Math.random();
    const list = [data];

    // 属性类型
    const propertiesLabels = {};
    // 属性列表
    const propertiesList = [{}];
    const geomList = [
      {
        tl: { x: 0, y: 0 },
        br: { x: 0, y: 0 },
        pointArray: [],
        lineArray: [],
        polygonArray: [],
      },
    ];
    const pointList = [];
    const lineList = [];
    const polygonList = [];

    if (showLog) {
      console.time(timeKey + "_解析几何属性 success");
    }
    while (list.length > 0) {
      const item = list.pop();
      // propertiesKey默认为父元素的propertiesKey 如果父元素没有propertiesKey，则默认为0
      let propertiesKey = item.propertiesKey || 0;
      // 如果有properties，则根据properties的长度生成propertiesKey，propertiesKey=0代表没有属性
      if (item.properties) {
        propertiesKey = propertiesList.length;
        propertiesList[propertiesKey] = JSON.parse(JSON.stringify(item.properties));
        propertiesList[propertiesKey].__id = propertiesKey;
        geomList[propertiesKey] = {
          tl: { x: Number.MAX_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER },
          br: { x: Number.MIN_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER },
          pointArray: [],
          lineArray: [],
          polygonArray: [],
        };
        for (const key in item.properties) {
          // 判断属性类型
          const type = Number.isFinite(Number(item.properties[key])) && item.properties[key] !== "" ? "Number" : "String";
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
    if (showLog) {
      console.timeEnd(timeKey + "_解析几何属性 success");
    }
    if (showLog) {
      console.time(timeKey + "_创建点数据数组 success");
    }
    // 创建点数据数组
    {
      const list = [];
      for (const { propertiesKey, geometry } of pointList) {
        for (const [x, y] of geometry) {
          list.push(x, y, propertiesKey);

          const geom = geomList[propertiesKey];

          geom.pointArray.push(x, y, propertiesKey);

          geom.tl.x = Math.min(geom.tl.x, x);
          geom.tl.y = Math.max(geom.tl.y, y);

          geom.br.x = Math.max(geom.br.x, x);
          geom.br.y = Math.min(geom.br.y, y);
        }
      }
      this.pointArray = new Float64Array(list);
    }
    if (showLog) {
      console.timeEnd(timeKey + "_创建点数据数组 success");
    }
    if (showLog) {
      console.time(timeKey + "_创建线数据数组 success");
    }
    // 创建线数据数组
    {
      const list = [];
      for (const { propertiesKey, geometry } of lineList) {
        for (const line of geometry) {
          const l = line.flat();
          list.push(l.length + 1);
          list.push(propertiesKey);
          list.push(...l);

          const geom = geomList[propertiesKey];

          geom.lineArray.push(l.length + 1);
          geom.lineArray.push(propertiesKey);
          geom.lineArray.push(...l);

          const xl = l.filter((v, i) => i % 3 == 0);
          const yl = l.filter((v, i) => i % 3 == 1);
          geom.tl.x = Math.min(...xl);
          geom.tl.y = Math.max(...yl);
          geom.br.x = Math.max(...xl);
          geom.br.y = Math.min(...yl);
        }
      }
      this.lineArray = new Float64Array(list);
    }
    if (showLog) {
      console.timeEnd(timeKey + "_创建线数据数组 success");
    }

    if (showLog) {
      console.time(timeKey + "_创建多边形数据数组 success");
    }
    // 创建多边形数据数组
    {
      const list = [];
      for (const { propertiesKey, geometry } of polygonList) {
        for (const polygon of geometry) {
          const shapeList = [];
          const geom = geomList[propertiesKey];
          for (const shape of polygon) {
            const l = shape.flat();
            shapeList.push(l.length);
            shapeList.push(...l);

            const xl = l.filter((v, i) => i % 2 == 0);
            const yl = l.filter((v, i) => i % 2 == 1);
            geom.tl.x = Math.min(...xl, geom.tl.x);
            geom.tl.y = Math.max(...yl, geom.tl.y);
            geom.br.x = Math.max(...xl, geom.br.x);
            geom.br.y = Math.min(...yl, geom.br.y);
          }
          list.push(shapeList.length + 1);
          list.push(propertiesKey);
          list.push(...shapeList);

          geom.polygonArray.push(shapeList.length + 1);
          geom.polygonArray.push(propertiesKey);
          geom.polygonArray.push(...shapeList);
        }
      }
      this.polygonArray = new Float64Array(list);
    }
    if (showLog) {
      console.timeEnd(timeKey + "_创建多边形数据数组 success");
    }
    if (showLog) {
      console.time(timeKey + "_创建属性数组 success");
    }
    // 创建属性数组
    if (options.noProperties) {
      const encode = new TextEncoder();
      this.propertiesListArray = encode.encode(JSON.stringify([{}]));
      this.propertiesLabelsArray = encode.encode(JSON.stringify({}));
    } else {
      const encode = new TextEncoder();
      this.propertiesListArray = encode.encode(JSON.stringify(propertiesList));
      for (const [key, label] of Object.entries(propertiesLabels)) {
        if (label.type === "String") {
          for (const [index, properties] of propertiesList.entries()) {
            const value = properties[key];
            if (value !== undefined && !label.map[value]) {
              const v = Object.values(label.map).length + 1;
              label.map[value] = v;
              label.max = v;
            }
            label.values[index] = label.map[value] || 0;
          }
          if (label.max == label.min) label.max += 1;
        } else if (label.type === "Number") {
          for (const [index, properties] of propertiesList.entries()) {
            const value = Number(properties[key] || 0);
            label.values[index] = value;
            if (index != 0) {
              label.max = Math.max(label.max, value);
              label.min = Math.min(label.min, value);
            }
          }
          if (label.max == label.min) label.max += 1;
        }
      }
      this.propertiesLabels = propertiesLabels;
      this.propertiesLabelsArray = encode.encode(JSON.stringify(propertiesLabels));
    }
    if (showLog) {
      console.timeEnd(timeKey + "_创建属性数组 success");
    }
    if (showLog) {
      console.time(timeKey + "_构建图像数组 success");
    }
    // 构建图像数组
    if (options.noGeomList) {
      const encode = new TextEncoder();
      this.geomListArray = encode.encode(JSON.stringify([]));
    } else {
      const encode = new TextEncoder();
      this.geomListArray = encode.encode(JSON.stringify(geomList));
    }
    if (showLog) {
      console.timeEnd(timeKey + "_构建图像数组 success");
    }
  }

  getMultiPoint(coordinates) {
    const list = [];
    for (let i = 0; i < coordinates.length; i++) {
      let [x, y] = coordinates[i];
      if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);
      if (!this.center) this.center = [x, y];
      if (this.range.minx > x) this.range.minx = x;
      if (this.range.maxx < x) this.range.maxx = x;
      if (this.range.miny > y) this.range.miny = y;
      if (this.range.maxy < y) this.range.maxy = y;
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
        if (this.range.minx > x) this.range.minx = x;
        if (this.range.maxx < x) this.range.maxx = x;
        if (this.range.miny > y) this.range.miny = y;
        if (this.range.maxy < y) this.range.maxy = y;
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

onmessage = function (e) {
  try {
    const decode = new TextDecoder();
    const str = decode.decode(e.data.json);
    const parser = new GeoJSONParser(JSON.parse(str), e.data.options);
    this.postMessage(
      {
        range: parser.range,
        center: parser.center,
        pointArray: parser.pointArray,
        lineArray: parser.lineArray,
        polygonArray: parser.polygonArray,
        propertiesListArray: parser.propertiesListArray,
        propertiesLabelsArray: parser.propertiesLabelsArray,
        geomListArray: parser.geomListArray,
      },
      [parser.pointArray.buffer, parser.lineArray.buffer, parser.polygonArray.buffer, parser.propertiesListArray.buffer, parser.propertiesLabelsArray.buffer, parser.geomListArray.buffer]
    );
  } catch (error) {
    console.log(error);

    const encode = new TextEncoder();
    this.postMessage({
      range: [],
      center: [],
      pointArray: [],
      lineArray: [],
      polygonArray: [],
      propertiesListArray: encode.encode(JSON.stringify([{}])),
      propertiesLabelsArray: encode.encode(JSON.stringify({})),
      geomListArray: encode.encode(JSON.stringify([])),
    });
  }
};
