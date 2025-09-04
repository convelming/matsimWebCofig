import * as THREE from "three";

export class ColorBar2D {
  get list() {
    return this._list;
  }

  get min() {
    return this._min;
  }
  get max() {
    return this._max;
  }

  constructor(list = []) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1024;
    this.canvas.height = 16;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.updateList(list);
  }

  updateList(list) {
    this._list = list.map((v) => new ColorBar2DItem(v)).sort((a, b) => a.min - b.min);
    if (this.list[0]) {
      const { range = [this.list[0].min, this.list[this.list.length - 1].max] } = this.list[0];
      this._min = range[0];
      this._max = range[1];
    } else {
      this._min = 0;
      this._max = 1;
    }
    this.updateCanvas();
  }

  getColor(value) {
    try {
      // 创建线性渐变色
      for (let i = this.list.length - 1; i >= 0; i--) {
        const { min, max, color } = this.list[i];
        if (min <= value && value <= max) {
          return color;
        }
      }
      return "#00000000";
    } catch (error) {
      return "#00000000";
    }
  }

  updateCanvas() {
    const canvas2D = this.canvas;
    const context2D = canvas2D.getContext("2d");
    // 先清空画布
    context2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
    const MIN = this.min;
    const MAX = this.max;
    // console.log(this.list);
    if (MIN < MAX) {
      for (const { min, max, color, use } of this.list) {
        if (use) {
          const x = ((min - MIN) / (MAX - MIN)) * canvas2D.width;
          const y = 0;
          const width = ((max - min) / (MAX - MIN)) * canvas2D.width;
          const height = canvas2D.height;
          // 绘制渐变色条
          context2D.fillStyle = color;
          context2D.fillRect(x, y, width, height);
        }
      }
    } else {
      for (const { min, max, color, use } of this.list) {
        if (use) {
          context2D.fillStyle = color;
          context2D.fillRect(0, 0, canvas2D.width, canvas2D.height);
          break;
        }
      }
    }
    // console.log(this.canvas.toDataURL("image/png"));
    this.texture.needsUpdate = true;
  }
}

class ColorBar2DItem {
  constructor({ min, max, label, color, use, range }) {
    this.min = min;
    if (min !== 0 && !min) {
      this.min = Number.MIN_SAFE_INTEGER;
    }
    this.max = max;
    if (max !== 0 && !max) {
      this.max = Number.MAX_SAFE_INTEGER;
    }
    this.label = label;
    this.color = color;
    this.use = use;
    this.range = range;
  }
}
