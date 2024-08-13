import proj4 from 'proj4'
proj4.defs("EPSG:4526", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
// proj4("EPSG:4526", "EPSG:3857", [lng, lat])

function parse(data) {
  if (data.type === "FeatureCollection") {
    let obj = data.properties || {};
    for (const item of data.features) {
      Object.assign(obj, parse(item))
    }
    return obj;
  } else if (data.type === "Feature") {
    return Object.assign(data.properties || {}, parse(data.geometry))
  } else if (data.type === "GeometryCollection") {
    let obj = data.properties || {};
    for (const item of data.geometries) {
      Object.assign(obj, parse(item))
    }
    return obj;
  } else {
    return {};
  }
}

onmessage = function (e) {
  const decode = new TextDecoder();
  const encode = new TextEncoder();
  const parser = parse(JSON.parse(decode.decode(e.data)));
  const array = encode.encode(JSON.stringify(Array.from(Object.keys(parser))))
  this.postMessage(array, [array.buffer]);
};