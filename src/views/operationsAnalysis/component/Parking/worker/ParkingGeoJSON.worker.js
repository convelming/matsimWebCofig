
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
  this.postMessage({
    key: 1,
    type: array,
    source: e.data
  }, [array.buffer, e.data.buffer]);
};