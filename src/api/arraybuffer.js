
import axios from "axios";
import { guid } from "@/utils/utils";

export function getFloat32Buffer(url) {
  return axios({
    url: url,
    headers: { uuid: guid(), dataSource: "" },
    method: "get",
    responseType: "arraybuffer",
  }).then(response => {
    if (response.status != 200 || response.data.byteLength == 0) throw new Error("获取数据失败" + index);
    const array = [];
    const dataView = new DataView(response.data);
    for (let i = 0; i < dataView.byteLength; i += 4) {
      const value = dataView.getFloat32(i, false);
      array.push(value);
    }
    return new Float32Array(array);
  })
}