const fs = require("fs");

const l1_name = "language.ch.json";
const l2_name = "language.en.json";

const l1 = JSON.parse(fs.readFileSync(l1_name, "utf8"));
const l2 = JSON.parse(fs.readFileSync(l2_name, "utf8"));
const newL = {};
for (const key in l1) {
  const v1 = l1[key];
  const v2 = l2[key];
  if (v2 === undefined || v2 === null) {
    newL[key] = v1;
  } else {
    newL[key] = v2;
  }
}

try {
  fs.writeFileSync(l2_name, JSON.stringify(newL));
  console.log(`写入成功的${l2_name}`);
} catch (error) {
  console.log(error + `，写入失败的${l2_name}`);
}
