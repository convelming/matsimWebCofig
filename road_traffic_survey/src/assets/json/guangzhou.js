const fs = require("fs");
const proj4 = require("proj4");

proj4.defs(
  "EPSG:4526",
  "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs"
);

let data = JSON.parse(fs.readFileSync("./guangzhou.json", "utf8"));

const lineList = [];
let [cx, cy] = proj4(
  "EPSG:4326",
  "EPSG:3857",
  data.districts[0].center.split(",").map((v) => Number(v))
).map((v) => Math.round(v));

let list1 = data.districts[0].polyline.split("|");
for (const str of list1) {
  let list = str.split(";");
  const path = [];
  let fromx = null;
  let fromy = null;
  for (let i = 0; i < list.length; i++) {
    let l = list[i].split(",").map((v) => Number(v));
    let [x, y] = proj4("EPSG:4326", "EPSG:3857", l).map((v) => Math.round(v));
    if (i != 0) {
      path.push({
        fromxy: [fromx - cx, fromy - cy],
        toxy: [x - cx, y - cy],
      });
    }
    fromx = x;
    fromy = y;
  }
  lineList.push(path);
}
try {
  fs.writeFileSync(
    `./guangzhou2.json`,
    JSON.stringify({
      center: [cx - 598, cy + 315],
      lineList: lineList,
    })
  );
  console.log(`写入成功的./guangzhou2.json`);
} catch (error) {
  console.log(error + `，写入失败的./guangzhou2.json`);
}
