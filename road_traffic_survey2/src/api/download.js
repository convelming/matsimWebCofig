import request from '@/utils/request'

// 路网信息
// POST /portal/roadInfo
// 接口ID：459418246
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-459418246
export function roadInfo(data) {
  return request({
    url: '/portal/roadInfo',
    method: 'post',
    data
  })
}