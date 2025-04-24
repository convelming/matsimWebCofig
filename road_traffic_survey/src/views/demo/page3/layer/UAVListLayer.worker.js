import { PathCurve } from "./PathCurve";

let pathList = [];

onmessage = function (e) {
  const { key } = e.data;
  switch (key) {
    case "setPaths": {
      const { paths, center } = e.data;
      pathList = paths.map((v) => new PathCurve(v.id, v.nodes, center));
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
