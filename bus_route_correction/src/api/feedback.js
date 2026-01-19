import request from "@/utils/request";
// 帖子列表
// GET /matsim/posts/page
// 接口ID：404062986
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-404062986
export function listPosts(params) {
  return request({
    url: `/matsim/posts/page`,
    method: "get",
    params: params,
  });
}

// 发布帖子
// PUT /matsim/posts
// 接口ID：404046850
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-404046850
export function updatePosts(params) {
  return request({
    url: `/matsim/posts`,
    method: "post",
    data: params,
  });
}

// 发布帖子
// PUT /matsim/posts
// 接口ID：404046850
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-404046850
export function addPosts(params) {
  return request({
    url: `/matsim/posts`,
    method: "put",
    data: params,
  });
}

export function getPosts(id) {
  return request({
    url: `/matsim/posts/detail/${id}`,
    method: "get",
  });
}

// 评论帖子/回复评论
// PUT /matsim/posts/comment
// 接口ID：404081359
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-404081359
export function commentPosts(params) {
  return request({
    url: `/matsim/posts/comment`,
    method: "put",
    data: params,
  });
}

// 评论列表
// GET /matsim/posts/comment/page
// 接口ID：404086402
// 接口地址：https://app.apifox.com/link/project/3709845/apis/api-404086402
export function listPostsComment(params) {
  return request({
    url: `/matsim/posts/comment/page`,
    method: "get",
    params: params,
  });
}
