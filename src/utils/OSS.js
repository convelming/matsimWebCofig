import request from "./request.js"
import utils from "./utils.js"

export async function uploadFile(file, typeName) {
  if (!file) return;
  let ossConfig = await request({
    url: "/mp/common/oss",
    method: "get",
    data: {
      typeName: typeName
    },
    hasLoading: false
  })
  let ossKey = `${ossConfig.data.dir}/${utils.guid()}${file.name.substring(file.name.lastIndexOf("."),file.name.length)}`
  let formData = new FormData();
  formData.append("OSSAccessKeyId", ossConfig.data.accessid); //Bucket 拥有者的Access Key Id。
  formData.append("policy", ossConfig.data.policy); //policy规定了请求的表单域的合法性
  formData.append("Signature", ossConfig.data.signature); //根据Access Key Secret和policy计算的签名信息，OSS验证该签名信息从而验证该Post请求的合法性
  formData.append("key", ossKey); //文件名字，可设置路径
  formData.append("success_action_status", '200'); // 让服务端返回200,不然，默认会返回204
  formData.append('file', file); //需要上传的文件 file 
  await request({
    url: ossConfig.data.host,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    hasLoading: false,
    isToken: false,
    data: formData
  })
  return `${ossConfig.data.host}/${ossKey}`;
}