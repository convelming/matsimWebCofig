// JavaScript Document
jQuery.extend({
  ajaxFileUpload: function (s) {
    // TODO introduce global settings, allowing the client to modify them for all requests, not only timeout
    // s = jQuery.extend({}, jQuery.ajaxSettings, s);
    // console.log(s);
    var inputEl = jQuery("#" + s.fileElementId);
    if (!inputEl[0] || !inputEl[0].files || inputEl[0].files.length <= 0) return;
    var formData = new FormData();
    for (let i = 0; i < inputEl[0].files.length; i++) {
      formData.append(s.fileElementId, inputEl[0].files[i]);
    }
    jQuery.ajax({
      url: s.url,
      type: s.type,
      // dataType: s.dataType,
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        console.log(s, data);
        s.success(data);
      },
      error: function (data) {
        console.log(data);
        s.error(data);
      },
    });
  },
});
