import * as THREE from "three";


const canvas2D = window.__ColorBar2DCanvas || (window.__ColorBar2DCanvas = document.createElement("canvas"));
canvas2D.width = 1024;
canvas2D.height = 16;
canvas2D.style.cssText = `
  position: absolute;
  left: 0;
  top: 0;
  width: 1024px;
  height: 16px;
  z-index: 9999;
`;
document.body.appendChild(canvas2D);
const context2D = canvas2D.getContext("2d");

export class ColorBar2D {

  list = [];

  constructor(list = []) {
    this.list = list.map(v => new ColorBar2DItem(v)).sort((a, b) => a.min - b.min);
  }

  get min() {
    let i = this.list.length - 1
    let v = this.list[i];
    while (v && !v.use) {
      v = this.list[++i];
    }
    return !!v ? v.min : 0;
  }

  get max() {
    let i = this.list.length - 1
    let v = this.list[i];
    while (v && !v.use) {
      v = this.list[--i];
    }
    return !!v ? v.max : 1;
  }

  getColor(value) {
    try {
      // 创建线性渐变色
      for (let i = this.list.length - 1; i >= 0; i--) {
        const { min, max, color } = this.list[i];
        if (min <= value && value <= max) {
          return color
        }
      }
      return "#000000";
    } catch (error) {
      return "#000000";
    }
  }

  getImage() {
    try {
      // 创建线性渐变色
      const linearGradient = context2D.createLinearGradient(0, 0, canvas2D.width, 0);
      const MIN = this.min;
      const MAX = this.max;
      // console.log(this.list);
      for (const { min, max, color, use } of this.list) {
        // console.log(min, max, MIN, MAX);
        // console.log((min - MIN) / (MAX - MIN), (max - MIN) / (MAX - MIN));
        if (use) {
          linearGradient.addColorStop((min - MIN) / (MAX - MIN), color);
          linearGradient.addColorStop((max - MIN) / (MAX - MIN), color);
        }
      }
      // 绘制渐变色条
      context2D.fillStyle = linearGradient;
      context2D.fillRect(0, 0, canvas2D.width, canvas2D.height);
      const url = canvas2D.toDataURL("image/png");
      context2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
      console.log("ColorBarUrl:", url);
      return url;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

}


class ColorBar2DItem {
  constructor({ min, max, label, color, use }) {
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
  }
}