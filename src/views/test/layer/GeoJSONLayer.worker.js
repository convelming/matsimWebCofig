import * as THREE from "three";

class GeoJSONWorker {

  loadGeoJson(data, parentCrs, center) {
    if (data.type === "FeatureCollection") {
      const { features, crs, ...other } = data;
      return this.getFeatureCollection(features, crs || parentCrs, center, other);
    } else if (data.type === "Feature") {
      const { geometry, crs, ...other } = data;
      return this.getFeature(geometry, crs || parentCrs, center, other);
    } else if (data.type === "GeometryCollection") {
      const { geometries, crs, ...other } = data;
      return this.getGeometryCollection(geometries, crs || parentCrs, center, other);
    } else if (data.type === "Point") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiPoint([coordinates], crs || parentCrs, center, other);
    } else if (data.type === "MultiPoint") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiPoint(coordinates, crs || parentCrs, center, other);
    } else if (data.type === "LineString") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiLineString([coordinates], crs || parentCrs, center, other);
    } else if (data.type === "MultiLineString") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiLineString(coordinates, crs || parentCrs, center, other);
    } else if (data.type === "Polygon") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiPolygon([coordinates], crs || parentCrs, center, other);
    } else if (data.type === "MultiPolygon") {
      const { coordinates, crs, ...other } = data;
      return this.getMultiPolygon(coordinates, crs || parentCrs, center, other);
    }
  }

  parse(array) {
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(new Blob([array]));
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        console.log(data);
        resolve(data);
      };
      reader.onerror = (e) => {
        reject(e);
      };
    });
  }
}

const worker = new GeoJSONWorker();

onmessage = function (e) {
  if (e.data instanceof Int8Array) {
    const [key] = e.data;
    const data = e.data.slice(1);
    switch (key) {
      case 1: {
        const workerData = worker.parse(data);
        const array = new Float64Array(workerData.length + 1);
        array.set([key], 0);
        array.set(workerData, 1);
        this.postMessage(array, [array.buffer]);
        break;
      }
    }
  }
};