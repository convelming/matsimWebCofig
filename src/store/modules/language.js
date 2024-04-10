import Vue from "vue";

const DEFUALT_LANGUAGE = "zh_CN";

const LANGUAGE_DATAS = {
  zh_CN: () => require("./language.ch.json"),
  zh_MO: () => require("./language.mo.json"),
  en_US: () => require("./language.en.json"),
};

Vue.mixin({
  data() {
    return {
      language_name: "",
    };
  },
  computed: {
    $l() {
      return (key) => {
        try {
          return this.$store.getters.getLocale(key);
        } catch (error) {
          return key;
        }
      };
    },
    page_language() {
      return this.$store.getters.language;
    },
    page_default_language() {
      return this.$store.getters.defaultLanguage;
    },
  },
  methods: {
    setLanguage(name = DEFUALT_LANGUAGE) {
      this.$store.dispatch("setLanguage", name);
    },
  },
});

Vue.component("Locale", {
  render(createElement) {
    console.log(this.tag);
    const text = this.$l(this.$slots.default[0].text);
    return createElement(this.tag, text);
  },
  props: {
    tag: {
      type: String,
      default: "span",
    },
  },
});

function internationalize(state, key) {
  try {
    return LANGUAGE_DATAS[state.language]()[key];
    return (
      LANGUAGE_DATAS[state.language]()[key] ||
      LANGUAGE_DATAS[DEFUALT_LANGUAGE]()[key] ||
      key
    );
  } catch (error) {
    console.error("国际化失败", key, error);
    return key;
  }
}

function setLanguage(state, language) {
  let _language =
    language || localStorage.getItem("language") || DEFUALT_LANGUAGE;
  if (state) state.language = _language;
  localStorage.setItem("language", _language);
  return _language;
}

const language = {
  state: {
    language: setLanguage(),
  },

  mutations: {
    SET_LANGUAGE: setLanguage,
  },

  actions: {
    setLanguage({ commit }, language) {
      commit("SET_LANGUAGE", language);
    },
  },
  getters: {
    getLocale: (state) => (textKey) => internationalize(state, textKey),
    language: (state) => state.language,
    defaultLanguage: (state) => DEFUALT_LANGUAGE,
  },
};

export default language;

// 生成一个vue computer
// 可以根据当前语言输出对应的数据
export function languageParam(zh_MO_name, zh_CN_name, en_us_name) {
  let options = {
    zh_MO: zh_MO_name,
    zh_CN: zh_CN_name,
    en_US: en_us_name,
  };
  return function () {
    return function (data) {
      try {
        let dl = this.$store.getters.defaultLanguage;
        let l = this.$store.getters.language;
        return data[options[l]] || data[options[dl]] || "";
      } catch (error) {
        console.error(error);
        return "";
      }
    };
  };
}

// 生成一个vue computer
// 可以根据当前语言输出对应的数据并转成html
export function languageParamHtml(zh_MO_name, zh_CN_name, en_us_name) {
  let options = {
    zh_MO: zh_MO_name,
    zh_CN: zh_CN_name,
    en_US: en_us_name,
  };
  return function () {
    return function (data) {
      try {
        let dl = this.$store.getters.defaultLanguage;
        let l = this.$store.getters.language;
        if (data[options[l]] && data[options[l]].replace(/<[^>]+>/g, "")) {
          return data[options[l]];
        } else {
          return data[options[dl]];
        }
      } catch (error) {
        console.error(error);
        return "";
      }
    };
  };
}
