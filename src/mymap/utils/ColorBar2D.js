let ColorBar2DInstance = null;

const defaultColors = { 0: "#313695", 0.4: "#74add1", 0.6: "#e0f3f8", 0.75: "#ffffbf", 0.85: "#fdae61", 0.95: "#f46d43", 1: "#a50026" };

export class ColorBar2D {
  static width = 1024;
  static height = 16;
  static get defaultColors() {
    return defaultColors;
  }

  static get instance() {
    if (!ColorBar2DInstance) {
      ColorBar2DInstance = new ColorBar2D();
    }
    return ColorBar2DInstance;
  }

  get canvas2D() {
    if (!this._canvas2D) {
      this._canvas2D = document.createElement("canvas");
      this._canvas2D.width = ColorBar2D.width;
      this._canvas2D.height = ColorBar2D.height;
      this._canvas2D.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        width: ${ColorBar2D.width}px;
        height: ${ColorBar2D.height}px;
        z-index: 9999;
      `;
    }
    return this._canvas2D;
  }

  get context2D() {
    if (!this._context2D) {
      this._context2D = this.canvas2D.getContext("2d");
    }
    return this._context2D;
  }

  // 渐变颜色条图
  drow(colors = defaultColors) {
    try {
      //颜色条的颜色分布
      const values = Object.keys(colors).map((v) => Number(v)).sort();
      const maxValue = values[values.length - 1];
      const minValue = values[0];

      // 创建线性渐变色
      const linearGradient = this.context2D.createLinearGradient(0, 0, ColorBar2D.width, 0);
      for (const v of values) {
        const key = (v - minValue) / maxValue - minValue;
        linearGradient.addColorStop(key, colors[v]);
      }

      // 绘制渐变色条
      this.context2D.fillStyle = linearGradient;
      this.context2D.fillRect(0, 0, ColorBar2D.width, ColorBar2D.height);

      const url = this.canvas2D.toDataURL("image/png");
      this.context2D.clearRect(0, 0, ColorBar2D.width, ColorBar2D.height);

      return url;
    } catch (error) {
      return null;
    }
  }
}
