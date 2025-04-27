import { PathCurve } from "./PathCurve";
import * as THREE from "three";

let pathList = [];

onmessage = function (e) {
  const { key } = e.data;
  switch (key) {
    case "setPaths": {
      const { paths, center } = e.data;
      pathList = paths.map((v) => new PathCurve(v.id, v.nodes, new THREE.Vector3(center[0], center[1], 0)));
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
