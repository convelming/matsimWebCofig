<template>
  <div class="ConfigBodyer" ref="scrollView">
    <div class="list" v-loading="loading">
      <template v-if="type == 'item' && !loading">
        <div class="title">{{ $l("mandatoryModules") }}</div>
        <div class="section">
          <Global :xml.sync="form.global" />
          <Network :xml.sync="form.network" />
          <Controler :xml.sync="form.controler" />
          <Strategy :xml.sync="form.strategy" />
          <Qsim :xml.sync="form.qsim" />
          <Plans :xml.sync="form.plans" />
        </div>
        <div class="title">{{ $l("mainModules") }}</div>
        <div class="section">
          <TimeAllocationMutator :xml.sync="form.TimeAllocationMutator" />
          <ChangeMode :xml.sync="form.changeMode" />
          <Counts :xml.sync="form.counts" />
          <Facilities :xml.sync="form.facilities" />
          <PlanCalcScore :xml.sync="form.planCalcScore" />
          <Planscalcroute :xml.sync="form.planscalcroute" />
          <LinkStats :xml.sync="form.linkStats" />
          <ParallelEventHandling :xml.sync="form.parallelEventHandling" />
          <PtCounts :xml.sync="form.ptCounts" />
          <SubtourModeChoice :xml.sync="form.subtourModeChoice" />
          <Transit :xml.sync="form.transit" />
          <TransitRouter :xml.sync="form.transitRouter" />
          <TravelTimeCalculator :xml.sync="form.travelTimeCalculator" />
          <Vehicles :xml.sync="form.vehicles" />
        </div>
        <div class="title">{{ $l("optionalModules") }}</div>
        <div class="section">
          <JDEQSim :xml.sync="form.JDEQSim" />
          <ReplanningAnnealer :xml.sync="form.ReplanningAnnealer" />
          <VspExperimental :xml.sync="form.vspExperimental" />
        </div>
        <div class="title">{{ $l("customizedModules") }}</div>
        <div class="section">
          <OtherModule />
        </div>
      </template>
      <Editor v-show="type == 'editor' && !loading" v-model="xml" ref="Editor" />
    </div>
  </div>
</template>

<language>
{
  "mandatoryModules": {
    "zh-CN": "必需配置",
    "en-US": "Mandatory Modules"
  },
  "mainModules": {
    "zh-CN": "可选配置-主要",
    "en-US": "Main Modules"
  },
  "optionalModules": {
    "zh-CN": "可选配置-次要",
    "en-US": "Optional Modules"
  },
  "customizedModules": {
    "zh-CN": "自定义配置",
    "en-US": "Customized Modules"
  },
  "saveSuccess": {
    "zh-CN": "保存成功",
    "en-US": "successfully saved..."
  },
  "saveFailure": {
    "zh-CN": "保存失败",
    "en-US": "save failed..."
  },
  "waitSaving": {
    "zh-CN": "保存中，请稍等...",
    "en-US": "saving, please wait..."
  },
}
</language>

<script>
import { uploadConfig, getConfig } from "@/api/database";
import moment from "moment";

import Global from "./Item/Global";
import Network from "./Item/Network";
import Plans from "./Item/Plans";
import Controler from "./Item/Controler";
import Strategy from "./Item/Strategy";
import Qsim from "./Item/Qsim";

import TimeAllocationMutator from "./Item/TimeAllocationMutator";
import ChangeMode from "./Item/ChangeMode";
import Counts from "./Item/Counts";
import Facilities from "./Item/Facilities";
import LinkStats from "./Item/LinkStats";
import ParallelEventHandling from "./Item/ParallelEventHandling";
import PlanCalcScore from "./Item/PlanCalcScore";
import Planscalcroute from "./Item/Planscalcroute";
import PtCounts from "./Item/PtCounts";
import SubtourModeChoice from "./Item/SubtourModeChoice";
import Transit from "./Item/Transit";
import TransitRouter from "./Item/TransitRouter";
import TravelTimeCalculator from "./Item/TravelTimeCalculator";
import Vehicles from "./Item/Vehicles";

import JDEQSim from "./Item/JDEQSim";
import ReplanningAnnealer from "./Item/ReplanningAnnealer";
import VspExperimental from "./Item/VspExperimental";

import OtherModule from "./Item/OtherModule";
import Editor from "./Editor/index.vue";

import { guid, xmlToJson, jsonToXml } from "./utils";

export default {
  components: {
    Global,
    Network,
    Plans,
    Controler,
    Qsim,
    Strategy,
    TimeAllocationMutator,
    ChangeMode,
    Counts,
    Facilities,
    LinkStats,
    ParallelEventHandling,
    PlanCalcScore,
    Planscalcroute,
    PtCounts,
    SubtourModeChoice,
    Transit,
    TransitRouter,
    TravelTimeCalculator,
    Vehicles,
    JDEQSim,
    ReplanningAnnealer,
    VspExperimental,
    OtherModule,
    Editor,
  },
  computed: {
    dataBase() {
      return this.$store.getters.dataBase;
    },
    dataSource() {
      return this.$store.getters.dataSource;
    },
  },
  data() {
    return {
      xml: "",
      loading: true,
      form: {},
      type: "item",
    };
  },
  created() {},
  methods: {
    getForm(xml) {
      const domParser = new DOMParser();
      const dom = domParser.parseFromString(xml, "application/xml");
      const modules = dom.getElementsByTagName("module");
      const form = {};
      for (const module of modules) {
        const name = module.getAttribute("name");
        form[name] = module.outerHTML;
      }
      return form;
    },
    getXml(data) {
      let str = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      str += `<!DOCTYPE config SYSTEM "http://www.matsim.org/files/dtd/config_v2.dtd">\n`;
      str += `<config>\n`;
      str += Object.keys(data)
        .map((name) => `${data[name]}`)
        .join("\n");
      str += `\n</config>`;
      return str;
    },
    handleChangeView() {
      if (this.type == "editor") {
        this.form = this.getForm(this.$refs.Editor.getXml());
        console.log(this.form);
        this.type = "item";
      } else {
        this.$refs.Editor.setXml(this.getXml(this.form));
        this.type = "editor";
      }
    },
    handleScrollTop() {
      if (this.$refs.scrollView) {
        console.log(this.$refs.scrollView);
        this.$refs.scrollView.scrollTo(0, 0);
      }
    },
    handleUpload() {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = (event) => {
        const file = input.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const xml = jsonToXml(xmlToJson(e.target.result));
            this.form = this.getForm(xml);
            this.$refs.Editor.setXml(this.getXml(this.form));
          };
          reader.onerror = (e) => {
            console.log(e);
          };
          reader.readAsText(file);
        }
      };
      input.click();
    },
    async handleSave() {
      this.saveLoading = true;
      if (this.saveLoading) return this.$message.warning(this.$l("waitSaving"));
      try {
        const xml = this.getXml(this.form);
        const blob = new Blob([xml], { type: "application/xml" });
        const file = new File([blob], "config.xml", {
          type: "application/xml",
        });
        await uploadConfig(file, this.dataSource);
        console.log(res);
        this.$message.success(this.$l("saveSuccess"));
        this.handleReload();
      } catch (error) {
        console.log("config保存失败", error);
        this.$message.success(this.$l("saveFailure"));
      } finally {
        this.saveLoading = false;
      }
    },
    handleReload() {
      this.loading = true;
      getConfig({
        database: this.dataBase,
        key: this.dataSource,
      }).then((res) => {
        const xml = jsonToXml(xmlToJson(res.data));
        this.form = this.getForm(xml);
        this.$refs.Editor.setXml(this.getXml(this.form));
        this.loading = false;
      });
    },
    handleRun() {
      this.$store.dispatch("runDataSource", {
        database: this.dataDase,
        key: this.dataSource,
      });
    },
    handleDownload() {
      const xml = this.getXml(this.form);
      const blob = new Blob([xml], { type: "application/xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `config_${moment().format("YYYY_MM_DD_HH_mm_ss")}.xml`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
  },
};
</script>

<style lang="scss">
.ConfigBodyer {
  margin: auto;
  width: 100%;
  height: calc(100vh - 90px);
  overflow-y: scroll;
  background: #f4f6fa;
  .list {
    margin: auto;
    width: 100%;
    max-width: 1400px;
    min-height: 100%;
    padding: 40px 0;
    .title {
      text-align: center;
      padding: 20px 0;
      font-size: 40px;
    }
    .section {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }
  }
  .collapse {
    font-size: 14px;
    .el-collapse-item__arrow {
      margin: 0 8px;
      order: -1;
    }
    .collapse_add_btn {
      cursor: pointer;
      padding: 0;
      color: #000;
      font-weight: 600;
      background: #fff;
      position: sticky;
      top: -5px;
      z-index: 1000;
      line-height: 40px;
    }
    .collapse_list {
      .collapse_item {
        .collapse_item_title {
          display: flex;
          align-items: center;
          background: #fff;
          position: sticky;
          top: 35px;
          z-index: 990;
          cursor: pointer;
          line-height: 40px;
          .el-icon-arrow-right {
            width: 20px;
            text-align: center;
            flex-shrink: 0;
          }
          .text {
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .el-icon-delete {
            width: 20px;
            text-align: center;
            flex-shrink: 0;
          }
        }
        .collapse_item_content {
          padding-left: 20px;
        }
      }
    }
  }
}

.ConfigItem {
  background: #fff;
  margin: 15px;
  box-sizing: border-box;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  &.col_1 {
    width: calc(25% - 30px);
  }
  &.col_2 {
    width: calc(50% - 30px);
  }
  &.col_3 {
    width: calc(75% - 30px);
  }
  &.col_4 {
    width: calc(100% - 30px);
  }
  .ConfigItem_title {
    height: 40px;
    margin-bottom: 10px;
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    line-height: 40px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ConfigItem_bodyer {
    width: 100%;
  }
}

@media screen and (max-width: 1400px) {
  .ConfigBodyer {
    width: 100%;
    .list {
      max-width: 1100px;
    }
  }
  .ConfigItem {
    margin: 10px;
    &.col_1 {
      width: calc(33% - 20px);
    }
    &.col_2 {
      width: calc(66% - 20px);
    }
    &.col_3 {
      width: calc(100% - 20px);
    }
    &.col_4 {
      width: calc(100% - 20px);
    }
  }
}

@media screen and (max-width: 1000px) {
  .ConfigItem {
    margin: 10px;
    &.col_1 {
      width: calc(50% - 20px);
    }
    &.col_2 {
      width: calc(100% - 20px);
    }
    &.col_3 {
      width: calc(100% - 20px);
    }
    &.col_4 {
      width: calc(100% - 20px);
    }
  }
}
</style>

<style lang="scss" scoped>
::v-deep {
  .scroll_y {
    box-sizing: border-box;
    padding: 5px;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    // height: 100%;
    height: 380px;
  }
  .scroll_x {
    box-sizing: border-box;
    padding: 5px;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    height: 100%;
  }
  .scroll_y.scroll_x {
    overflow: auto !important;
  }
  .el-form-item__label {
    font-size: 14px;
    line-height: 20px;
    font-weight: 600;
  }
  .el-input-number .el-input__inner {
    text-align: left;
  }
}
</style>
