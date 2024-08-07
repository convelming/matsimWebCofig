
export function send(obj, funcName, callback) {
  let oldFunc = obj[funcName];
  obj[funcName] = callback.bind(obj, oldFunc.bind(obj));
}

// 这个函数用于生成一个带有文本的图片，并返回图片的URL和宽高比。
export function getTextImage(
  name,
  {
    padding = 20,
    colNum: _colNum = 10,
    lineHeight = 1.2,
    backgroundColor = "#fffffc",
    color = "black",
    border = 4,
    borderColor = "black",
  } = {}
) {
  if (!name) name = "";
  const colNum = Math.min(name.length, _colNum);
  const rowNum = Math.ceil(name.length / colNum);

  const ctx = document.createElement("canvas").getContext("2d");
  const font = `${40}px bold`;
  ctx.font = font;

  const textWidth = ctx.measureText("测").width;
  const width = textWidth * colNum + padding * 2 + border * 2;
  const height = textWidth * rowNum * lineHeight + padding * 2 + border * 2;

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
  for (let row = 0; row <= rowNum; row++) {
    const x = width / 2;
    const y = (row + 0.5) * textWidth * lineHeight + padding + border;
    const text = name.substr(row * colNum, colNum);
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