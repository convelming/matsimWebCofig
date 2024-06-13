import { Layer, MAP_EVENT } from "@/mymap";
import * as THREE from "three";

import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import axios from "axios";
export class PTALLayer extends Layer {
  name = "PTALLayer";

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER) {
      for (const mesh of this.scene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickLayerScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
      for (const mesh of this.pickMeshScene.children) {
        const [x, y] = this.map.WebMercatorToCanvasXY(...mesh.userData.center);
        mesh.position.set(x, y, mesh.position.z);
      }
    }
  }

  setData() {
    axios.get("./data/hpPTAL.json").then((res) => {
      const size = 110;
      const rowList = [];
      const colList = [];
      const data = {};

      res.data.features.forEach((v1) => {
        const centerX = [];
        const centerY = [];
        v1.geometry.coordinates.flat(2).forEach((v2) => {
          centerX.push(v2[0]);
          centerY.push(v2[1]);
        });
        const minX = Math.min(...centerX);
        const minY = Math.min(...centerY);

        const row = Math.floor(minY / size);
        const col = Math.floor(minX / size);
        data[`${row}_${col}`] = v1;
        rowList.push(row);
        colList.push(col);
      });

      const minRow = Math.min(...rowList);
      const minCol = Math.min(...colList);
      const maxRow = Math.max(...rowList);
      const maxCol = Math.max(...colList);

      this.size = size;
      this.s_row = minRow;
      this.e_row = maxRow;
      this.s_col = minCol;
      this.e_col = maxCol;
      this.center = [this.col * size, this.row * size];
      this.data = data;

      this.update();
    });
  }

  update() {
    const { size, s_row, e_row, s_col, e_col, center, data } = this;
    const segm = 5;
    const geometryList = [];
    for (let j = s_col; j < e_col; j += segm) {
      for (let i = s_row; i < e_row; i += segm) {
        let value = 0;
        let index = 0;
        for (let k = 0; k < segm; k++) {
          for (let g = 0; g < segm; g++) {
            const _row = i + k;
            const _col = j + g;
            try {
              value += data[`${_row}_${_col}`].properties.AI_all;
              index++;
            } catch (error) { }
          }
        }
        if (index > 0) {
          const colorStr = this.getColorByValue(value / index);
          const color = new THREE.Color(colorStr);
          const attrColor = new Array(4).fill([color.r, color.g, color.b]).flat();

          const geometry = new THREE.PlaneGeometry(size * segm, size * segm);
          geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(attrColor), 3));

          const s_x = (j - s_col + segm / 2) * size;
          const s_y = (i - s_row + segm / 2) * size;
          const matrix4 = new THREE.Matrix4();
          matrix4.setPosition(s_x, s_y, 0);
          geometry.attributes.position.applyMatrix4(matrix4);

          geometryList.push(geometry);
        }
      }
    }

    const geometry = BufferGeometryUtils.mergeBufferGeometries(geometryList, false);
    // geometry.computeBoundingSphere();

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: false,
    });

    const [x, y] = this.map.WebMercatorToCanvasXY(s_col * size, s_row * size);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, 0);
    mesh.userData.center = [s_col * size, s_row * size];

    this.scene.add(mesh);
  }

  constructor(opt) {
    super(opt);
  }

  onAdd(map) {
    super.onAdd(map);
    this.setData();
  }

  getColorByValue(value) {
    if (value < 1.0) {
      return "#313695";
    } else if (1.0 <= value && value < 2.0) {
      return "#4575b4";
    } else if (2.0 <= value && value < 3.0) {
      return "#74add1";
    } else if (3.0 <= value && value < 4.0) {
      return "#abd9e9";
    } else if (4.0 <= value && value < 5.0) {
      return "#e0f3f8";
    } else if (5.0 <= value && value < 6.0) {
      return "#ffffbf";
    } else if (6.0 <= value && value < 7.0) {
      return "#fee090";
    } else if (7.0 <= value && value < 8.0) {
      return "#fdae61";
    } else if (8.0 <= value && value < 9.0) {
      return "#f46d43";
    } else if (9.0 <= value && value < 10.0) {
      return "#d73027";
    } else if (10.0 <= value) {
      return "#a50026";
    }
  }
}
