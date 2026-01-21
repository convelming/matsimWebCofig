function getCookie(name) {
  var cookieStr = document.cookie;
  var cookieArr = cookieStr.split(";");
  cookieArr = cookieArr.map((res) => res.trim().split("="));
  var cookie = cookieArr.find((res) => res[0] == name) || ["", ""];
  return cookie[1];
}

$(function () {
  $.ajaxSetup({
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + getCookie("Admin-Token"));
    },
    complete: function (xhr, status) {
      if (xhr.status == 401 || xhr.responseJSON.code == 401) {
        alert("登录已过期，请重新登录");
        location.href = "/user.html?redirect=" + encodeURIComponent(location.href);
      }
    },
  });
});
