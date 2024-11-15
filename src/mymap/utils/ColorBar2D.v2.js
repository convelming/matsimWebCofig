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
    try {
      this.list = list.map(v => new ColorBar2DItem(v)).sort((a, b) => a.min - b.min);
    } catch (error) {
      console.log(error);
    }
  }

  getColor(value) {
    try {
      // 创建线性渐变色
      for (let i = this.list.length - 1; i >= 0; i--) {
        const { min, max, color } = this.list[i];
        if (min < value && value <= max) {
          return color
        }
      }
    } catch (error) {
      return "#000000";
    }
  }

  getImage() {
    try {
      // 创建线性渐变色
      const linearGradient = context2D.createLinearGradient(0, 0, canvas2D.width, 0);
      const MIN = this.list[0].min;
      const MAX = this.list[this.list.length - 1].max;
      console.log(this.list);

      for (const { min, max, color } of this.list) {
        console.log(min, max, MIN, MAX);
        console.log((min - MIN) / (MAX - MIN), (max - MIN) / (MAX - MIN));

        linearGradient.addColorStop((min - MIN) / (MAX - MIN), color);
        linearGradient.addColorStop((max - MIN) / (MAX - MIN), color);
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
  constructor({ min, max, label, color }) {
    this.min = min;
    this.max = max;
    this.label = label;
    this.color = color;
  }
}