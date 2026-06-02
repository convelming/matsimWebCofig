// importScripts(process.env.VUE_APP_PUBLIC_PATH + "static/js/proj4.js");
// try {
//   importScripts(process.env.VUE_APP_BASE_API + "/pt/main2/getJsConfig/config.js");
// } catch (error) {
//   importScripts(process.env.VUE_APP_PUBLIC_PATH + "static/js/config.js");
// }
import proj4 from "proj4";
proj4.defs("EPSG:4526", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
proj4.defs("urn:ogc:def:crs:OGC:1.3:CRS84", proj4.defs("EPSG:4326"));

class GeoJSONParser {
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
    this.center = null;
    this.range = {
      minx: Number.MAX_SAFE_INTEGER,
      miny: Number.MAX_SAFE_INTEGER,
      maxx: Number.MIN_SAFE_INTEGER,
      maxy: Number.MIN_SAFE_INTEGER,
    };
    this.crs = json.crs;
    this.coordSys = GeoJSONParser.decodeCrs(json.crs);
    this.#parse(json, options);
  }

  #parse(data) {
    const list = [data];

    // 属性列表
    const propertiesList = [];
    const pointList = [];
    const lineList = [];
    const polygonList = [];

    while (list.length > 0) {
      const item = list.pop();
      // propertiesIndex默认为父元素的propertiesIndex 如果父元素没有propertiesIndex，则默认为0
      let propertiesIndex = item.propertiesIndex || 0;
      // 如果有properties，则根据properties的长度生成propertiesIndex，propertiesIndex=0代表没有属性
      if (item.properties) {
        propertiesIndex = propertiesList.length;
        propertiesList[propertiesIndex] = JSON.parse(JSON.stringify(item.properties));
      }
      // 解析几何属性
      if (item.type === "FeatureCollection") {
        for (const f of item.features || []) {
          f.propertiesIndex = propertiesIndex;
          list.push(f);
        }
      } else if (item.type === "Feature" && item.geometry) {
        item.geometry.propertiesIndex = propertiesIndex;
        list.push(item.geometry);
      } else if (item.type === "GeometryCollection") {
        for (const g of item.geometries || []) {
          g.propertiesIndex = propertiesIndex;
          list.push(g);
        }
      } else if (item.type === "Point") {
        const geometry = this.getMultiPoint([item.coordinates]);
        pointList[pointList.length] = {
          propertiesIndex: propertiesIndex || 0,
          geometry: geometry,
        };
      } else if (item.type === "MultiPoint") {
        const geometry = this.getMultiPoint(item.coordinates);
        pointList[pointList.length] = {
          propertiesIndex: propertiesIndex || 0,
          geometry: geometry,
        };
      } else if (item.type === "LineString") {
        const geometry = this.getMultiLineString([item.coordinates]);
        lineList[lineList.length] = {
          propertiesIndex: propertiesIndex || 0,
          geometry: geometry,
        };
      } else if (item.type === "MultiLineString") {
        const geometry = this.getMultiLineString(item.coordinates);
        lineList[lineList.length] = {
          propertiesIndex: propertiesIndex || 0,
          geometry: geometry,
        };
      } else if (item.type === "Polygon") {
        const geometry = this.getMultiPolygon([item.coordinates]);
        polygonList[polygonList.length] = {
          propertiesIndex: propertiesIndex || 0,
          geometry: geometry,
        };
      } else if (item.type === "MultiPolygon") {
        const geometry = this.getMultiPolygon(item.coordinates);
        polygonList[polygonList.length] = {
          propertiesIndex: propertiesIndex || 0,
          geometry: geometry,
        };
      }
    }

    this.propertiesList = propertiesList;
    this.pointList = pointList;
    this.lineList = lineList;
    this.polygonList = polygonList;
  }

  getMultiPoint(coordinates) {
    const list = [];
    for (let i = 0; i < coordinates.length; i++) {
      let [x, y, ...o] = coordinates[i];
      if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);
      // 设置偏移点坐标，并记录xy的最大最小值
      if (!this.center) this.center = [Math.floor(x), Math.floor(y)];
      this.range.minx = Math.min(this.range.minx, x);
      this.range.miny = Math.min(this.range.miny, y);
      this.range.maxx = Math.max(this.range.maxx, x);
      this.range.maxy = Math.max(this.range.maxy, y);

      x -= this.center[0];
      y -= this.center[1];

      list[list.length] = [x, y, ...o];
    }
    return list;
  }

  getMultiLineString(coordinates) {
    const list = [];
    for (let i = 0; i < coordinates.length; i++) {
      const line = [];
      for (let j = 0; j < coordinates[i].length; j++) {
        let [x, y, ...o] = coordinates[i][j];
        if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);

        // 设置偏移点坐标，并记录xy的最大最小值
        if (!this.center) this.center = [Math.floor(x), Math.floor(y)];
        this.range.minx = Math.min(this.range.minx, x);
        this.range.miny = Math.min(this.range.miny, y);
        this.range.maxx = Math.max(this.range.maxx, x);
        this.range.maxy = Math.max(this.range.maxy, y);

        x -= this.center[0];
        y -= this.center[1];

        line[j] = [x, y, ...o];
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
          let [x, y, ...o] = coordinates[i][j][k];
          if (this.coordSys !== "EPSG:3857") [x, y] = proj4(this.coordSys, "EPSG:3857", [x, y]);

          // 设置偏移点坐标，并记录xy的最大最小值
          if (!this.center) this.center = [Math.floor(x), Math.floor(y)];
          this.range.minx = Math.min(this.range.minx, x);
          this.range.miny = Math.min(this.range.miny, y);
          this.range.maxx = Math.max(this.range.maxx, x);
          this.range.maxy = Math.max(this.range.maxy, y);

          x -= this.center[0];
          y -= this.center[1];

          coordinate[j][k] = [x, y, ...o];
        }
      }
      list[list.length] = coordinate;
    }
    return list;
  }
}

let parserInt = null;

onmessage = function (e) {
  const postSuccess = (data, transfer) => {
    this.postMessage({
      workerId: e.data.workerId,
      workerCode: 200,
      workerData: data,
      workerError: null,
    });
  };

  const postError = (error) => {
    this.postMessage({
      workerId: e.data.workerId,
      workerCode: 500,
      workerData: null,
      workerError: error,
    });
  };

  try {
    const { type, data } = e.data.workerData;
    if (type == "init") {
      parserInt = new GeoJSONParser(JSON.parse(new TextDecoder().decode(data)));

      postSuccess({
        center: parserInt.center,
      });
    } else if (type == "getAllGeom") {
      const encode = new TextEncoder();
      const pointArray = encode.encode(JSON.stringify(parserInt.pointList));
      const lineArray = encode.encode(JSON.stringify(parserInt.lineArray));
      const polygonArray = encode.encode(JSON.stringify(parserInt.polygonArray));
      postSuccess(
        {
          center: parserInt.center,
          pointArray,
          lineArray,
          polygonArray,
        },
        [pointArray.buffer, lineArray.buffer, polygonArray.buffer],
      );
    } else if (type == "getAllPoint") {
      const encode = new TextEncoder();
      const pointArray = encode.encode(JSON.stringify(parserInt.pointList));
      postSuccess(
        {
          center: parserInt.center,
          pointArray,
        },
        [pointArray.buffer],
      );
    } else if (type == "getAllLine") {
      const encode = new TextEncoder();
      const lineArray = encode.encode(JSON.stringify(parserInt.lineList));
      postSuccess(
        {
          center: parserInt.center,
          lineArray,
        },
        [lineArray.buffer],
      );
    } else if (type == "getAllPolygon") {
      const encode = new TextEncoder();
      const polygonArray = encode.encode(JSON.stringify(parserInt.polygonList));
      postSuccess(
        {
          center: parserInt.center,
          polygonArray,
        },
        [polygonArray.buffer],
      );
    } else if (type == "getGeomById") {
      const pointItem = parserInt.pointList.filter((item) => item.propertiesIndex == data);
      const lineItem = parserInt.lineArray.filter((item) => item.propertiesIndex == data);
      const polygonItem = parserInt.polygonArray.filter((item) => item.propertiesIndex == data);
      const encode = new TextEncoder();
      const geomArray = encode.encode(JSON.stringify(pointItem || lineItem || polygonItem));
      postSuccess({
        center: parserInt.center,
        geomArray,
      });
    } else if (type == "getAllProperties") {
      const encode = new TextEncoder();
      const propertiesListArray = encode.encode(JSON.stringify(parserInt.propertiesList));
      postSuccess(
        {
          propertiesListArray,
        },
        [propertiesListArray.buffer],
      );
    } else if (type == "getPropertiesById") {
      postSuccess({
        properties: parserInt.propertiesList[data],
      });
    } else if (type == "propertiesMap") {
      const func = eval(data);
      const list = parserInt.propertiesList.map(func);
      const encode = new TextEncoder();
      const listArray = encode.encode(JSON.stringify(list));
      postSuccess(listArray, [listArray.buffer]);
    }
  } catch (error) {
    postError(error);
  }
};
