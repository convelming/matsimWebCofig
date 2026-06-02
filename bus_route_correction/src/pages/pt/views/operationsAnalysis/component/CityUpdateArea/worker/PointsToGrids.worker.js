importScripts(process.env.VUE_APP_PUBLIC_PATH + "static/js/proj4.js");
try {
  importScripts(process.env.VUE_APP_BASE_API + "/pt/main2/getJsConfig/config.js");
} catch (error) {
  importScripts(process.env.VUE_APP_PUBLIC_PATH + "static/js/config.js");
}

function decodeCrs(crs) {
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

function toEPSG3857(point, coordSys) {
  return proj4(coordSys, "EPSG:3857", point);
}

let pointList = [];
let center = [0, 0];

onmessage = function (e) {
  if (e.data.json) {
    const decode = new TextDecoder();
    const str = decode.decode(e.data.json);
    const json = JSON.parse(str);
    const coordSys = decodeCrs(json.crs);
    const pointMap = {};
    for (let i = 0, l = json.features.length; i < l; i++) {
      try {
        const point = json.features[i];
        const geometry = toEPSG3857(point.geometry.coordinates, coordSys);
        if (i == 0) center = [Math.floor(geometry[0] / 10000) * 10000, Math.floor(geometry[1] / 10000) * 10000];
        const properties = point.properties;
        if (!pointMap[properties.grid]) {
          pointMap[properties.grid] = {
            grid: properties.grid,
            geometry: [geometry[0] - center[0], geometry[1] - center[1]],
            properties: {
              0: 0,
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
              6: 0,
              7: 0,
              8: 0,
              9: 0,
              10: 0,
              11: 0,
              12: 0,
              13: 0,
              14: 0,
              15: 0,
              16: 0,
              17: 0,
              18: 0,
              20: 0,
              21: 0,
              22: 0,
              23: 0,
            },
          };
        }
        pointMap[properties.grid].properties[properties.hour] = Number(properties.car_uv || 0);
      } catch (error) {}
    }

    pointList = Array.from(Object.values(pointMap));
  }
  const gridSize = e.data.size || 100;
  const gridMap = {};

  for (let i = 0, l = pointList.length; i < l; i++) {
    const { geometry, properties } = pointList[i];
    const [x, y] = geometry;
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);
    const key = col + "_" + row;
    if (!gridMap[key]) {
      gridMap[key] = {
        geometry: [
          [
            [
              [col * gridSize, row * gridSize],
              [col * gridSize, row * gridSize + gridSize],
              [col * gridSize + gridSize, row * gridSize + gridSize],
              [col * gridSize + gridSize, row * gridSize],
              [col * gridSize, row * gridSize],
            ],
          ],
        ],
        properties,
      };
    } else {
      for (const pkey in properties) {
        gridMap[key].properties[pkey] += properties[pkey];
      }
    }
  }

  const gridList = Array.from(Object.values(gridMap));
  const timeRange = e.data.timeRange;
  const propertiesLabels = {
    num: { type: "Number", name: "0", min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER, values: new Array(gridList.length + 1).fill(0) },
  };
  const list = [];
  for (let i = 0, l = gridList.length; i < l; i++) {
    const { properties, geometry } = gridList[i];
    for (const polygon of geometry) {
      const shapeList = [];
      for (const shape of polygon) {
        const l = shape.flat();
        shapeList.push(l.length);
        shapeList.push(...l);
      }
      list.push(shapeList.length + 1);
      list.push(i + 1);
      list.push(...shapeList);
    }

    let num = 0;
    for (const hour in properties) {
      const s = hour * 60 * 60;
      if (timeRange[0] <= s && s <= timeRange[1]) {
        num += Number(properties[hour] || 0);
      }
    }
    propertiesLabels.num.values[i + 1] = num;
    propertiesLabels.num.min = Math.min(propertiesLabels.num.min, num);
    propertiesLabels.num.max = Math.max(propertiesLabels.num.max, num);
  }
  const polygonArray = new Float64Array(list);
  const encode = new TextEncoder();
  postMessage(
    {
      center: center,
      pointArray: [],
      lineArray: [],
      polygonArray: polygonArray,
      propertiesLabelsArray: encode.encode(JSON.stringify(propertiesLabels)),
      propertiesListArray: [],
    },
    [polygonArray.buffer],
  );
};
