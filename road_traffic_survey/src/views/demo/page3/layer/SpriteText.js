import * as THREE from "three";

export default class extends THREE.Sprite {
  constructor(text = "", fontSize = 14, color = "rgba(255, 255, 255, 1)") {
    const canvas = document.createElement("canvas");
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ sizeAttenuation: false, transparent: true, map: texture });
    super(material);

    this._text = `${text}`;
    this._lineHeight = 1.3;
    this._color = color;
    this._backgroundColor = false; // no background color

    this._padding = fontSize * 0.1;
    this._borderWidth = 0;
    this._borderRadius = 0;
    this._borderColor = "white";

    this._strokeWidth = 0;
    this._strokeColor = "rgba(0, 0, 0, 1)";

    this._fontFace = "system-ui";
    this._fontSize = fontSize; // defines text resolution
    this._fontWeight = "normal";
    this._canvas = canvas;
    this._texture = texture;
    this._genCanvas();
  }
  get canvas() {
    return this._canvas;
  }
  get texture() {
    return this._texture;
  }

  get text() {
    return this._text;
  }
  set text(text) {
    this._text = text;
    this._genCanvas();
  }
  get lineHeight() {
    return this._lineHeight;
  }
  set lineHeight(lineHeight) {
    this._lineHeight = lineHeight;
    this._genCanvas();
  }
  get color() {
    return this._color;
  }
  set color(color) {
    this._color = color;
    this._genCanvas();
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(color) {
    this._backgroundColor = color;
    this._genCanvas();
  }
  get padding() {
    return this._padding;
  }
  set padding(padding) {
    this._padding = padding;
    this._genCanvas();
  }
  get borderWidth() {
    return this._borderWidth;
  }
  set borderWidth(borderWidth) {
    this._borderWidth = borderWidth;
    this._genCanvas();
  }
  get borderRadius() {
    return this._borderRadius;
  }
  set borderRadius(borderRadius) {
    this._borderRadius = borderRadius;
    this._genCanvas();
  }
  get borderColor() {
    return this._borderColor;
  }
  set borderColor(borderColor) {
    this._borderColor = borderColor;
    this._genCanvas();
  }
  get fontFace() {
    return this._fontFace;
  }
  set fontFace(fontFace) {
    this._fontFace = fontFace;
    this._genCanvas();
  }
  get fontSize() {
    return this._fontSize;
  }
  set fontSize(fontSize) {
    this._fontSize = fontSize;
    this._genCanvas();
  }
  get fontWeight() {
    return this._fontWeight;
  }
  set fontWeight(fontWeight) {
    this._fontWeight = fontWeight;
    this._genCanvas();
  }
  get strokeWidth() {
    return this._strokeWidth;
  }
  set strokeWidth(strokeWidth) {
    this._strokeWidth = strokeWidth;
    this._genCanvas();
  }
  get strokeColor() {
    return this._strokeColor;
  }
  set strokeColor(strokeColor) {
    this._strokeColor = strokeColor;
    this._genCanvas();
  }

  _genCanvas() {
    const canvas = this.canvas;
    const ctx = canvas.getContext("2d");

    const border = Array.isArray(this.borderWidth) ? this.borderWidth : [this.borderWidth, this.borderWidth]; // x,y border

    const borderRadius = Array.isArray(this.borderRadius) ? this.borderRadius : [this.borderRadius, this.borderRadius, this.borderRadius, this.borderRadius]; // tl tr br bl corners

    const padding = Array.isArray(this.padding) ? this.padding : [this.padding, this.padding]; // x,y padding

    const lines = this.text.split("\n");
    const font = `${this.fontWeight} ${this.fontSize}px ${this.fontFace}`;

    ctx.font = font; // measure canvas with appropriate font
    const textWidthList = lines.map((line) => ctx.measureText(line).width);
    const textHeightList = Array.from(this.text).map((line) => ctx.measureText(line).width);
    const textWidth = Math.max(...textWidthList);
    const textHeight = Math.max(...textHeightList);
    const innerWidth = textWidth;
    const innerHeight = textHeight * lines.length * this.lineHeight;
    canvas.width = innerWidth + border[0] * 2 + padding[0] * 2;
    canvas.height = innerHeight + border[1] * 2 + padding[1] * 2;

    // paint border
    if (this.borderWidth) {
      ctx.strokeStyle = this.borderColor;

      if (border[0]) {
        // left + right borders
        const hb = border[0] / 2;
        ctx.lineWidth = border[0];
        ctx.beginPath();
        ctx.moveTo(hb, borderRadius[0]);
        ctx.lineTo(hb, canvas.height - borderRadius[3]);
        ctx.moveTo(canvas.width - hb, borderRadius[1]);
        ctx.lineTo(canvas.width - hb, canvas.height - borderRadius[2]);
        ctx.stroke();
      }

      if (border[1]) {
        // top + bottom borders
        const hb = border[1] / 2;
        ctx.lineWidth = border[1];
        ctx.beginPath();
        ctx.moveTo(Math.max(border[0], borderRadius[0]), hb);
        ctx.lineTo(canvas.width - Math.max(border[0], borderRadius[1]), hb);
        ctx.moveTo(Math.max(border[0], borderRadius[3]), canvas.height - hb);
        ctx.lineTo(canvas.width - Math.max(border[0], borderRadius[2]), canvas.height - hb);
        ctx.stroke();
      }

      if (this.borderRadius) {
        // strike rounded corners
        const cornerWidth = Math.max(...border);
        const hb = cornerWidth / 2;
        ctx.lineWidth = cornerWidth;
        ctx.beginPath();
        [
          !!borderRadius[0] && [borderRadius[0], hb, hb, borderRadius[0]],
          !!borderRadius[1] && [canvas.width - borderRadius[1], canvas.width - hb, hb, borderRadius[1]],
          !!borderRadius[2] && [canvas.width - borderRadius[2], canvas.width - hb, canvas.height - hb, canvas.height - borderRadius[2]],
          !!borderRadius[3] && [borderRadius[3], hb, canvas.height - hb, canvas.height - borderRadius[3]],
        ]
          .filter((d) => d)
          .forEach(([x0, x1, y0, y1]) => {
            ctx.moveTo(x0, y0);
            ctx.quadraticCurveTo(x1, y0, x1, y1);
          });
        ctx.stroke();
      }
    }

    // paint background
    if (this.backgroundColor) {
      ctx.fillStyle = this.backgroundColor;
      if (!this.borderRadius) {
        ctx.fillRect(border[0], border[1], canvas.width - border[0] * 2, canvas.height - border[1] * 2);
      } else {
        // fill with rounded corners
        ctx.beginPath();
        ctx.moveTo(border[0], borderRadius[0]);
        [
          [border[0], borderRadius[0], canvas.width - borderRadius[1], border[1], border[1], border[1]], // t
          [canvas.width - border[0], canvas.width - border[0], canvas.width - border[0], border[1], borderRadius[1], canvas.height - borderRadius[2]], // r
          [canvas.width - border[0], canvas.width - borderRadius[2], borderRadius[3], canvas.height - border[1], canvas.height - border[1], canvas.height - border[1]], // b
          [border[0], border[0], border[0], canvas.height - border[1], canvas.height - borderRadius[3], borderRadius[0]], // t
        ].forEach(([x0, x1, x2, y0, y1, y2]) => {
          ctx.quadraticCurveTo(x0, y0, x1, y1);
          ctx.lineTo(x2, y2);
        });
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.translate(...border);
    ctx.translate(...padding);

    // paint text
    ctx.font = font; // Set font again after canvas is resized, as context properties are reset
    ctx.fillStyle = this.color;
    ctx.textBaseline = "bottom";

    const drawTextStroke = this.strokeWidth > 0;
    if (drawTextStroke) {
      ctx.lineWidth = (this.strokeWidth * this.fontSize) / 10;
      ctx.strokeStyle = this.strokeColor;
    }

    lines.forEach((line, index) => {
      const lineX = (innerWidth - ctx.measureText(line).width) / 2;
      const lineY = (index + 1) * this.fontSize * 1.2;

      drawTextStroke && ctx.strokeText(line, lineX, lineY);
      ctx.fillText(line, lineX, lineY);
    });

    this.texture.needsUpdate = true;
    // Inject canvas into sprite
    // if (this.material.map) this.material.map.dispose(); // gc previous texture
    // const texture = (this.material.map = new THREE.CanvasTexture(canvas));
    // texture.colorSpace = THREE.SRGBColorSpace;
    const yScale = (this.fontSize * this.lineHeight) / 450;
    this.scale.set((yScale * canvas.width) / canvas.height, yScale, 0);
    // this.scale.set(1, canvas.height / canvas.width, 0);
  }

  clone() {
    return new this.constructor(this.text, this.lineHeight, this.color).copy(this);
  }

  copy(source) {
    THREE.Sprite.prototype.copy.call(this, source);

    this.color = source.color;
    this.backgroundColor = source.backgroundColor;
    this.padding = source.padding;
    this.borderWidth = source.borderWidth;
    this.borderColor = source.borderColor;
    this.fontFace = source.fontFace;
    this.fontSize = source.fontSize;
    this.fontWeight = source.fontWeight;
    this.strokeWidth = source.strokeWidth;
    this.strokeColor = source.strokeColor;

    return this;
  }
}
