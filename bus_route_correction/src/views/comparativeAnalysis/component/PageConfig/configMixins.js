import defaultConfig from "./defaultConfig.js";
import { MAP_LAYER_STYLE } from "@/mymap/index.js";

export default {
  data() {
    return {
      defaultConfig,
    };
  },
  methods: {
    initByConfig(config) {
      config = Object.assign({}, defaultConfig, config);

      this.showLeftToolbar = config.showLeftToolbar;
      this.showStopToolbar = config.showStopToolbar;

      this.showClock = config.showClock;

      this.showHelpDialog = config.showHelpDialog;

      this.time = config.time;
      this.minTime = config.minTime;
      this.maxTime = config.maxTime;
      this.speedCommand(config.speed);
      this._Map.setCenter(config.center);
      this._Map.setZoom(config.zoom);
      this._Map.setPitchAndRotation(config.pitch, config.rotation);
      let map_style = MAP_LAYER_STYLE.find((v) => v.style_name == config.map_style_name);
      if (map_style) {
        this._MapLayer.setTileClass(map_style);
      }
      this.activeNames = config.activeNames;
      Object.entries(this.$refs).forEach(([k, v]) => {
        console.log(k, v.name);
        if (v.configKey == "ToolbarConfig") {
          v.initByConfig(config);
        } else if (v.initByConfig && v.configKey) {
          v.initByConfig(config[v.configKey]);
        }
      });
      this.$setLanguage(config.language);
    },
    async getConfig() {
      let cameraRotation = this._Map.cameraRotation;
      console.log(cameraRotation);
      let map_style_name = "";
      try {
        map_style_name = this._MapLayer.tileClass.style_name;
      } catch (error) {}
      const config = {
        key: "PageConfig",

        showLeftToolbar: this.showLeftToolbar,
        showStopToolbar: this.showStopToolbar,

        showClock: this.showClock,

        showHelpDialog: this.showHelpDialog,

        time: this.time,
        speed: this.speed,
        minTime: this.minTime,
        maxTime: this.maxTime,
        center: this._Map.center,
        zoom: this._Map.zoom,
        rotation: cameraRotation.rotationDeg,
        pitch: cameraRotation.pitchDeg,

        activeNames: this.activeNames,

        map_style_name: map_style_name,
        language: this.page_language,
      };
      for (const [k, v] of Object.entries(this.$refs)) {
        if (v.configKey == "ToolbarConfig") {
          Object.assign(config, await v.exportConfig());
        } else if (v.exportConfig && v.configKey) {
          config[v.configKey] = await v.exportConfig();
        }
      }
      return config;
    },
  },
};
