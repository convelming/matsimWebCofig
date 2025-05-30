const language = require("./language.json");

module.exports.$l = function (key, page_language) {
  const page_default_language = "zh-CN";
  if (language[key]) {
    if (language[key][page_language]) {
      return language[key][page_language];
    }
    if (language[key][page_default_language]) {
      return language[key][page_default_language];
    }
  }
  return key;
};
