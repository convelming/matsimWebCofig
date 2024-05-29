import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

onmessage = function (e) {
  if (!e.data) {
    postMessage({
      center: null,
      data: null,
      geometry: null,
    });
  } else {
    let pickColorNum = 0;
    const { data, center } = e.data;
    const list = data.map((v, i) => {
      let geomJson = JSON.parse(v.geom);
      let path = [];
      geomJson.coordinates.forEach((v3, i3, l3) => {
        if (i3 != 0) {
          let fromxy = l3[i3 - 1];
          let toxy = l3[i3];
          path.push({
            fromxy: [
              Math.round(fromxy[0] - center[0]),
              Math.round(fromxy[1] - center[1]),
            ],
            toxy: [
              Math.round(toxy[0] - center[0]),
              Math.round(toxy[1] - center[1]),
            ],
          });
        }
      });
      return {
        pickColorNum: ++pickColorNum,
        path: path,
        id: v.id,
      };
    });

    const postDataList = [];
    const MAX_LINE_NUM = 10000;
    const POST_NUM = Math.ceil(list.length / MAX_LINE_NUM);
    for (let i = 0; i < POST_NUM; i++) {
      const geometryList = [];
      const dataList = [];
      for (let j = 0; j < MAX_LINE_NUM; j++) {
        const index = i * MAX_LINE_NUM + j;
        if (index >= list.length) break;
        const data = list[index];
        const geometry = getGeometry(data);
        geometryList.push(geometry);
        dataList.push({
          id: data.id,
          pickColorNum: data.pickColorNum,
        });
      }
      postDataList.push({
        dataList: dataList,
        geometryJson: BufferGeometryUtils.mergeBufferGeometries(
          geometryList,
          false
        ).toJSON(),
      });
    }

    postMessage({
      type: "start",
    });
    // 每隔一段时间推一份数据，防止程序卡死
    const timer = setInterval(() => {
      const data = postDataList.shift();
      if (data) {
        postMessage({
          type: "progress",
          data: data,
        });
      } else {
        postMessage({
          type: "end",
        });
        clearInterval(timer);
      }
    }, 200);
  }
};

function getGeometry(data) {
  const length = data.path.length;

  const attrPosition = new THREE.BufferAttribute(
    new Float32Array(length * 4 * 3),
    3
  );
  const attrStartPosition = new THREE.BufferAttribute(
    new Float32Array(length * 4 * 2),
    2
  );
  const attrEndPosition = new THREE.BufferAttribute(
    new Float32Array(length * 4 * 2),
    2
  );
  const attrSide = new THREE.BufferAttribute(new Float32Array(length * 4), 1);
  const attrIndex = new THREE.BufferAttribute(
    new Uint16Array(length * 2 * 3),
    1
  );
  const attrUv = new THREE.BufferAttribute(new Float32Array(length * 4 * 2), 2);
  const attrPickColor = new THREE.BufferAttribute(
    new Float32Array(length * 4 * 3),
    3
  );
  const attrColor = new THREE.BufferAttribute(
    new Float32Array(length * 4 * 3),
    3
  );

  const pickColor = new THREE.Color(data.pickColorNum);

  for (let index = 0; index < data.path.length; index++) {
    const link = data.path[index];
    const prevLink = index == 0 ? link : data.path[index - 1];
    const nextLink =
      index == data.path.length - 1 ? link : data.path[index + 1];

    const prevFromxy = prevLink.fromxy;
    const linkFromxy = link.fromxy;
    const linkToxy = link.toxy;
    const nextToxy = nextLink.toxy;

    // fromNode
    {
      attrStartPosition.setXY(index * 4, prevFromxy[0], prevFromxy[1]);
      attrStartPosition.setXY(index * 4 + 1, prevFromxy[0], prevFromxy[1]);
      attrPosition.setXYZ(index * 4, linkFromxy[0], linkFromxy[1], 0);
      attrPosition.setXYZ(index * 4 + 1, linkFromxy[0], linkFromxy[1], 0);
      attrEndPosition.setXY(index * 4, linkToxy[0], linkToxy[1]);
      attrEndPosition.setXY(index * 4 + 1, linkToxy[0], linkToxy[1]);
      attrSide.setX(index * 4, 1);
      attrSide.setX(index * 4 + 1, -1);

      attrPickColor.setXYZ(index * 4, pickColor.r, pickColor.g, pickColor.b);
      attrPickColor.setXYZ(
        index * 4 + 1,
        pickColor.r,
        pickColor.g,
        pickColor.b
      );
    }
    // toNode
    {
      attrStartPosition.setXY(index * 4 + 2, linkFromxy[0], linkFromxy[1]);
      attrStartPosition.setXY(index * 4 + 3, linkFromxy[0], linkFromxy[1]);
      attrPosition.setXYZ(index * 4 + 2, linkToxy[0], linkToxy[1], 0);
      attrPosition.setXYZ(index * 4 + 3, linkToxy[0], linkToxy[1], 0);
      attrEndPosition.setXY(index * 4 + 2, nextToxy[0], nextToxy[1]);
      attrEndPosition.setXY(index * 4 + 3, nextToxy[0], nextToxy[1]);
      attrSide.setX(index * 4 + 2, 1);
      attrSide.setX(index * 4 + 3, -1);

      attrPickColor.setXYZ(
        index * 4 + 2,
        pickColor.r,
        pickColor.g,
        pickColor.b
      );
      attrPickColor.setXYZ(
        index * 4 + 3,
        pickColor.r,
        pickColor.g,
        pickColor.b
      );
    }

    attrUv.setXY(index * 4, 0, 0);
    attrUv.setXY(index * 4 + 1, 1, 0);
    attrUv.setXY(index * 4 + 2, 0, 1);
    attrUv.setXY(index * 4 + 3, 1, 1);

    attrIndex.setX(index * 6, index * 4);
    attrIndex.setX(index * 6 + 1, index * 4 + 1);
    attrIndex.setX(index * 6 + 2, index * 4 + 3);
    attrIndex.setX(index * 6 + 3, index * 4);
    attrIndex.setX(index * 6 + 4, index * 4 + 3);
    attrIndex.setX(index * 6 + 5, index * 4 + 2);
  }
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", attrPosition);
  geometry.setAttribute("startPosition", attrStartPosition);
  geometry.setAttribute("endPosition", attrEndPosition);
  geometry.setAttribute("side", attrSide);
  geometry.setAttribute("uv", attrUv);
  geometry.setAttribute("pickColor", attrPickColor);
  geometry.index = attrIndex;
  return geometry;
}
