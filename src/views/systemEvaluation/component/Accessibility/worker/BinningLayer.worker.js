import * as THREE from "three";

class BinningWorker {
  size = 110;

  setData(data) {
    let size = 110;
    const rowList = [];
    const colList = [];
    const _data = {};

    data.features.forEach((v1) => {
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
      _data[`${row}_${col}`] = v1;
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
    this.data = _data;
  }

  update({ segm, valueFuncStr }) {
    const valueFunc = new Function(
      "item",
      `const func = ${valueFuncStr};return func(item);`
    );
    const { size, s_row, e_row, s_col, e_col, data } = this;
    const values = [];
    const positions = [];

    const center = [s_col * size, s_row * size];

    for (let j = s_col; j < e_col; j += segm) {
      for (let i = s_row; i < e_row; i += segm) {
        let value = 0;
        let index = 0;
        for (let k = 0; k < segm; k++) {
          for (let g = 0; g < segm; g++) {
            const _row = i + k;
            const _col = j + g;
            try {
              value += valueFunc(data[`${_row}_${_col}`]);
              index++;
            } catch (error) {}
          }
        }
        if (index > 0) {
          const s_x = (j - s_col + segm / 2) * size;
          const s_y = (i - s_row + segm / 2) * size;
          values.push(value);
          positions.push([s_x, s_y]);
        }
      }
    }
    return { values, positions, center };
  }
}

onmessage = function (e) {
  if (!this.worker) this.worker = new BinningWorker();
  const { key, data } = e.data;
  switch (key) {
    case "setData":
      this.postMessage({ key: key, data: this.worker.setData(data) });
      break;
    case "update":
      this.postMessage({ key: key, data: this.worker.update(data) });
      break;
  }
};
