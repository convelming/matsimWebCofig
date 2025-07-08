import * as PathCurve from "./PathCurve";
import * as THREE from "three";

let pathList = [];

onmessage = function (e) {
  const { key } = e.data;
  switch (key) {
    case "setPaths": {
      const { paths, pathClassName, center } = e.data;
      console.log(PathCurve);

      pathList = paths.map((v) => new PathCurve[pathClassName](v.id, v.nodes, new THREE.Vector3(center[0], center[1], 0)));
      postMessage({
        key: key,
        meg: "success",
      });
      break;
    }
    case "getPointsByTime": {
      const { time } = e.data;
      const points = pathList.map((v) => v.getPointByTime(time));
      postMessage({
        key: key,
        data: {
          time: time,
          points: points,
        },
        meg: "success",
      });
      break;
    }
    case "clearPaths": {
      postMessage({
        key: key,
        meg: "success",
      });
      break;
    }
  }
};
