export function send(obj, funcName, callback) {
  let oldFunc = obj[funcName];
  obj[funcName] = callback.bind(obj, oldFunc.bind(obj));
}


class TextImage {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
  }
}

// 这个函数用于生成一个带有文本的图片，并返回图片的URL和宽高比。
export function getTextImage(
  name,
  {
    padding = 20,
    colNum = 10,
    lineHeight = 1.2,
    backgroundColor = "#fffffc",
    color = "black",
    border = 4,
    borderColor = "black",
    family = "Avenir"
  } = {}
) {
  if (!name) name = "";
  const _colNum = Math.min(name.length, colNum);
  const _rowNum = Math.ceil(name.length / _colNum);

  const ctx = document.createElement("canvas").getContext("2d");
  const font = `bold 40px ${family}`;
  ctx.font = font;

  // const textWidth = ctx.measureText("测").width;
  // const width = textWidth * _colNum + padding * 2 + border * 2;
  // const height = textWidth * _rowNum * lineHeight + padding * 2 + border * 2;
  let textWidth = 0, textHeight = 0;
  for (let row = 0; row <= _rowNum; row++) {
    const str = name.substr(row * _colNum, _colNum);
    const text = ctx.measureText(str);

    textWidth = Math.max(textWidth || 0, text.width || 0);
    textHeight = Math.max(textHeight || 0, (text.width / str.length) || 0);
  }
  const width = textWidth + padding * 2 + border * 2;
  const height = textHeight * _rowNum * lineHeight + padding * 2 + border * 2;

  ctx.canvas.width = width;
  ctx.canvas.height = height;

  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(border, border, width - border * 2, height - border * 2);

  ctx.fillStyle = color;
  for (let row = 0; row <= _rowNum; row++) {
    const x = width / 2;
    const y = (row + 0.5) * textHeight * lineHeight + padding + border;
    const text = name.substr(row * _colNum, _colNum);
    ctx.fillText(text, x, y);
  }

  let url = ctx.canvas.toDataURL("image/png");
  ctx.clearRect(0, 0, width, height);

  return {
    url: url,
    width: width,
    height: height,
  };
}

export async function isDoubleClick(key, timeout = 200, callback = () => { }) {
  const map = window.isDoubleClickMap || (window.isDoubleClickMap = new Map());
  if (map.has(key)) {
    const t = map.get(key);
    clearTimeout(t);
    map.delete(key);
    callback(true);
  } else {
    const t = setTimeout(() => {
      map.delete(key);
      callback(false);
    }, timeout);
    map.set(key, t);
  }
}