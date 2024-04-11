class Language {
  constructor() {
    this.base_lanuage_dict = require("./base_lanuage_dict.json");
    this.page_default_language = "zh-CN";
    this.page_language = sessionStorage.getItem("language") || this.page_default_language;
  }

  setLanguage(name) {
    this.page_language = name || this.page_default_language;
    sessionStorage.setItem("language", this.page_language);
    if (this.$event) this.$event.$emit("languageChange", this.page_language);
  }

  internationalize(key, dict = this.base_lanuage_dict, page_language = this.page_language) {
    try {
      return dict[key][page_language] || dict[key][this.page_default_language] || "";
    } catch (error) {
      return "";
    }
  }

  install(Vue, options = {}) {
    console.log(window);
    
    if (window && !window.$language) window.$language = this;

    const _self = this;

    _self.page_default_language = options.page_default_language || _self.page_default_language;
    _self.base_lanuage_dict = options.base_lanuage_dict || _self.base_lanuage_dict;
    _self.$event = new Vue();

    Vue.prototype.$setLanguage = (name) => _self.setLanguage(name);

    Vue.mixin({
      data() {
        return {
          page_language: _self.page_language,
        };
      },
      computed: {
        $l() {
          return (key) => _self.internationalize(key, this.language, this.page_language);
        },
      },
      beforeCreate() {
        this.language = Object.assign({}, _self.base_lanuage_dict, this.$options.language);
      },
      created() {
        _self.$event.$on("languageChange", this.handleLanguageChange);
      },
      beforeDestroy() {
        _self.$event.$off("languageChange", this.handleLanguageChange);
      },
      methods: {
        handleLanguageChange(name) {
          this.page_language = name;
        },
      },
    });
  }
}

const language = new Language();

export default language;
