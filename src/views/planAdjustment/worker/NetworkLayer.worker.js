import * as THREE from "three";

import { Coord, RouteLinkItem } from "@/utils/Bean";

onmessage = function (e) {
  if (!e.data) {
    postMessage({
      center: null,
      data: null,
      geometry: null,
    });
  } else {
    try {
      const { list, center, mainColor } = e.data;
      const center2 = new Coord({
        x: center[0],
        y: center[1],
      });
      const _data = list.map((v, i) => {
        let link = new RouteLinkItem(v);
        return {
          fromCoord: link.fromCoord.offset(center2),
          toCoord: link.toCoord.offset(center2),
          pickColor: new THREE.Color(i + 1),
          color: new THREE.Color(mainColor),
          data: link.toJSON(),
        };
      });
      const _max = 10000;
      const _length = _data.length % _max;
      const geoJsonList = [];
      for (let i = 0; i < _length; i++) {
        const data = _data.slice(i * _max, (i + 1) * _max);

        const length = data.length;

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
        const attrSide = new THREE.BufferAttribute(
          new Float32Array(length * 4),
          1
        );
        const attrIndex = new THREE.BufferAttribute(
          new Uint16Array(length * 2 * 3),
          1
        );
        const attrUv = new THREE.BufferAttribute(
          new Float32Array(length * 4 * 2),
          2
        );
        const attrPickColor = new THREE.BufferAttribute(
          new Float32Array(length * 4 * 3),
          3
        );
        const attrColor = new THREE.BufferAttribute(
          new Float32Array(length * 4 * 3),
          3
        );

        for (let index = 0; index < data.length; index++) {
          const { fromCoord, toCoord, pickColor, color } = data[index];

          // fromNode
          {
            attrStartPosition.setXY(index * 4, fromCoord.x, fromCoord.y);
            attrStartPosition.setXY(index * 4 + 1, fromCoord.x, fromCoord.y);
            attrPosition.setXYZ(index * 4, fromCoord.x, fromCoord.y, 0);
            attrPosition.setXYZ(index * 4 + 1, fromCoord.x, fromCoord.y, 0);
            attrEndPosition.setXY(index * 4, toCoord.x, toCoord.y);
            attrEndPosition.setXY(index * 4 + 1, toCoord.x, toCoord.y);
            attrSide.setX(index * 4, 1);
            attrSide.setX(index * 4 + 1, -1);

            attrPickColor.setXYZ(
              index * 4,
              pickColor.r,
              pickColor.g,
              pickColor.b
            );
            attrPickColor.setXYZ(
              index * 4 + 1,
              pickColor.r,
              pickColor.g,
              pickColor.b
            );
            attrColor.setXYZ(index * 4, color.r, color.g, color.b);
            attrColor.setXYZ(index * 4 + 1, color.r, color.g, color.b);
          }
          // toNode
          {
            attrStartPosition.setXY(index * 4 + 2, fromCoord.x, fromCoord.y);
            attrStartPosition.setXY(index * 4 + 3, fromCoord.x, fromCoord.y);
            attrPosition.setXYZ(index * 4 + 2, toCoord.x, toCoord.y, 0);
            attrPosition.setXYZ(index * 4 + 3, toCoord.x, toCoord.y, 0);
            attrEndPosition.setXY(index * 4 + 2, toCoord.x, toCoord.y);
            attrEndPosition.setXY(index * 4 + 3, toCoord.x, toCoord.y);
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
            attrColor.setXYZ(index * 4 + 2, color.r, color.g, color.b);
            attrColor.setXYZ(index * 4 + 3, color.r, color.g, color.b);
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
        geometry.setAttribute("color", attrColor);
        geometry.index = attrIndex;
        geoJsonList.push(geometry.toJSON());
      }

      postMessage({
        center: center2.toList(),
        data: _data,
        geoJsonList: geoJsonList,
      });
    } catch (error) {
      postMessage({
        center: null,
        range: null,
        data: null,
        geoJsonList: null,
      });
    }
  }
};
