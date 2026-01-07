import request from '@/utils/request'

// 新增附件
// PUT /newsAnnex
// 接口ID：401357405
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-401357405
export function newsAnnexAdd(data) {
  return request({
    url: '/newsAnnex',
    method: 'put',
    data: data,
  })
}

// 删除附件
// DELETE /newsAnnex/delete/{ids}
// 接口ID：401411616
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-401411616
export function newsAnnexDelete(ids) {
  return request({
    url: `/newsAnnex/delete/${ids}`,
    method: 'delete',
  })
}

// 新增新闻
// PUT /news
// 接口ID：401365586
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-401365586
export function newsAdd(data) {
  return request({
    url: '/news',
    method: 'put',
    data: data,
  })
}

// 新闻列表
// GET /news/page
// 接口ID：401398873
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-401398873
export function newsList(params) {
  return request({
    url: '/news/page',
    method: 'get',
    params: params,
  })
}

// 新闻详情
// GET /news/detail/{id}
// 接口ID：401384085
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-401384085
export function newsDetail(id) {
  return request({
    url: `/news/detail/${id}`,
    method: 'get',
  })
}

// 删除新闻
// DELETE /news/delete/{ids}
// 接口ID：401397262
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-401397262
export function newsDelete(ids) {
  return request({
    url: `/news/delete/${ids}`,
    method: 'delete',
  })
}

// 修改新闻
// POST /news/update
// 接口ID：401403748
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-401403748
export function newsUpdate(data) {
  return request({
    url: '/news/update',
    method: 'post',
    data: data,
  })
}

// 批量下载附件
// GET /newsAnnex/batchDownload/{ids}
// 接口ID：401481454
// 接口地址：https://app.apifox.com/link/project/3532778/apis/api-401481454
export function newsAnnexBatchDownload(ids) {
  return request({
    url: `/newsAnnex/batchDownload/${ids}`,
    method: 'get',
  })
}
