<template>
  <div class="ConfigBodyer" ref="scrollView">
    <div class="list" v-loading="loading">
      <template v-if="type == 'item' && !loading">
        <div class="title">{{ $l("mandatoryModules") }}</div>
        <div class="section">
          <Global :style="{ order: itemOrder[0][0] }" :xml.sync="form.global" />
          <Network :style="{ order: itemOrder[0][1] }" :xml.sync="form.network" />
          <Controler :style="{ order: itemOrder[0][2] }" :xml.sync="form.controler" />
          <Strategy :style="{ order: itemOrder[0][3] }" :xml.sync="form.strategy" />
          <Qsim :style="{ order: itemOrder[0][4] }" :xml.sync="form.qsim" />
          <Plans :style="{ order: itemOrder[0][5] }" :xml.sync="form.plans" />
        </div>
        <div class="title">{{ $l("mainModules") }}</div>
        <div class="section">
          <TimeAllocationMutator :style="{ order: itemOrder[1][0] }" :xml.sync="form.TimeAllocationMutator" />
          <ChangeMode :style="{ order: itemOrder[1][1] }" :xml.sync="form.changeMode" />
          <Counts :style="{ order: itemOrder[1][2] }" :xml.sync="form.counts" />
          <Facilities :style="{ order: itemOrder[1][3] }" :xml.sync="form.facilities" />
          <PlanCalcScore :style="{ order: itemOrder[1][4] }" :xml.sync="form.planCalcScore" />
          <Planscalcroute :style="{ order: itemOrder[1][5] }" :xml.sync="form.planscalcroute" />
          <LinkStats :style="{ order: itemOrder[1][6] }" :xml.sync="form.linkStats" />
          <ParallelEventHandling :style="{ order: itemOrder[1][7] }" :xml.sync="form.parallelEventHandling" />
          <PtCounts :style="{ order: itemOrder[1][8] }" :xml.sync="form.ptCounts" />
          <SubtourModeChoice :style="{ order: itemOrder[1][9] }" :xml.sync="form.subtourModeChoice" />
          <Transit :style="{ order: itemOrder[1][10] }" :xml.sync="form.transit" />
          <TransitRouter :style="{ order: itemOrder[1][11] }" :xml.sync="form.transitRouter" />
          <TravelTimeCalculator :style="{ order: itemOrder[1][12] }" :xml.sync="form.travelTimeCalculator" />
          <Vehicles :style="{ order: itemOrder[1][13] }" :xml.sync="form.vehicles" />
        </div>
        <div class="title">{{ $l("optionalModules") }}</div>
        <div class="section">
          <JDEQSim :style="{ order: itemOrder[2][0] }" :xml.sync="form.JDEQSim" />
          <ReplanningAnnealer :style="{ order: itemOrder[2][1] }" :xml.sync="form.ReplanningAnnealer" />
          <VspExperimental :style="{ order: itemOrder[2][2] }" :xml.sync="form.vspExperimental" />
        </div>
        <!-- <div class="title">{{ $l("customizedModules") }}</div> -->
        <!-- <div class="section">
          <CustomizedModule />
        </div> -->
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
  "waitRunning": {
    "zh-CN": "运行中，请稍等...",
    "en-US": "running, please wait..."
  },
  "runFailure": {
    "zh-CN": "运行失败",
    "en-US": "run failed..."
  },
  "runSuccess": {
    "zh-CN": "模型已经开始运行，视模型大小可能需要加钟至几天的时间，请耐心等待",
    "en-US": "Changed routes is updated and running. Based on the scale of the base scenario, it will last a few minutes or even days. Please confirm and check the status in the modify menu"
  },
  "runAgainMsg": {
    "zh-CN": "模型已有运行结果，是否需要备份运行结果，如果需要请输入备份名称。",
    "en-US": "模型已有运行结果，是否需要备份运行结果，如果需要请输入备份名称。"
  },
  "备份": {
    "zh-CN": "备份",
    "en-US": "backups"
  },
  "覆盖": {
    "zh-CN": "覆盖",
    "en-US": "cover"
  },
  "返回页面": {
    "zh-CN": "返回页面",
    "en-US": "back to the page"
  },
  "确定并关闭页面": {
    "zh-CN": "确定并关闭页面",
    "en-US": "confirm and close the page"
  },
}
</language>

<script>
import { uploadConfig, getConfig, runMatsim } from "@/api/database";
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

import CustomizedModule from "./Item/CustomizedModule";
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
    CustomizedModule,
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
      saveLoading: false,
      runLoading: false,
      form: {},
      type: "item",
    };
  },
  created() {
    this.handleWindowResize();
    this.type = sessionStorage.getItem("config_page_type") || "item";
  },
  mounted() {
    window.addEventListener("resize", this.handleWindowResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleWindowResize);
  },
  methods: {
    handleWindowResize() {
      const { innerWidth, innerHeight } = window;
      if (innerWidth >= 1400) {
        this.itemOrder = [
          [1, 2, 3, 4, 5, 6],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
          [1, 2, 3],
        ];
      } else if (innerWidth >= 1000) {
        this.itemOrder = [
          [1, 3, 2, 4, 5, 6],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
          [1, 2, 3],
        ];
      } else {
        this.itemOrder = [
          [1, 2, 3, 4, 5, 6],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
          [1, 2, 3],
        ];
      }
    },
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
    $handleChangeView() {
      if (this.type == "editor") {
        this.form = this.getForm(this.$refs.Editor.getXml());
        this.type = "item";
      } else {
        this.$refs.Editor.setXml(this.getXml(this.form));
        this.type = "editor";
      }
      sessionStorage.setItem("config_page_type", this.type);
    },
    $handleScrollTop() {
      if (this.$refs.scrollView) {
        this.$refs.scrollView.scrollTo(0, 0);
      }
    },
    $handleUpload() {
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
    async $handleSave() {
      if (this.saveLoading) return this.$message.warning(this.$l("waitSaving"));
      this.saveLoading = true;
      try {
        const xml = this.getXml(this.form);
        const blob = new Blob([xml], { type: "application/xml" });
        const file = new File([blob], "config.xml", {
          type: "application/xml",
        });
        await uploadConfig(file, this.dataSource);
        this.$message.success(this.$l("saveSuccess"));
        this.$handleReload();
        this.saveLoading = false;
      } catch (error) {
        console.log("config保存失败", error);
        this.$message.error(this.$l("saveFailure"));
        this.saveLoading = false;
      }
    },
    $handleReload() {
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
    async $handleRun() {
      if (this.runLoading) return this.$message.warning(this.$l("waitRunning"));
      this.runLoading = true;
      const xml = this.getXml(this.form);
      const blob = new Blob([xml], { type: "application/xml" });
      const file = new File([blob], "config.xml", {
        type: "application/xml",
      });

      try {
        await uploadConfig(file, this.dataSource);
        const runRes = await runMatsim({ key: this.dataSource, newKey: "", overwrite: false });
        if (runRes.code == 0) {
          const name = this.dataSource.split("/").pop();
          let value = name + "_" + moment().format("YYYYMMDDHHmmss");
          let overwrite = false;
          try {
            await this.$prompt(this.$l("runAgainMsg"), this.$l("提示"), {
              confirmButtonText: this.$l("备份"),
              cancelButtonText: this.$l("覆盖"),
              inputValue: name + "_" + moment().format("YYYYMMDDHHmmss"),
              distinguishCancelAndClose: true,
              beforeClose: (action, instance, done) => {
                if (action == "close") {
                  done();
                  return;
                } else if (action == "confirm") {
                  value = instance.inputValue;
                  overwrite = false;
                } else if (action == "cancel") {
                  value = instance.inputValue;
                  overwrite = true;
                }
                runMatsim({ key: this.dataSource, newKey: value, overwrite: overwrite })
                  .then((res) => {
                    console.log("备份成功", res);
                    done();
                  })
                  .catch((error) => {});
              },
            }).catch((action) => {
              console.log(action);
              if (action === "close") {
                return Promise.reject(action);
              }
              return Promise.resolve(action);
            });
          } catch (error) {
            console.log(error);
            this.runLoading = false;
            return;
          }
        }
        this.runLoading = false;
        this.$confirm(this.$l("runSuccess"), this.$l("提示"), {
          confirmButtonText: this.$l("确定并关闭页面"),
          cancelButtonText: this.$l("返回页面"),
          type: "success",
        }).then(() => {
          window.close();
          this.$store.dispatch("getDataSourceList", this.dataBase);
        });
      } catch (error) {
        console.log("运行失败", error);
        this.$message.error(this.$l("runFailure"));
        this.runLoading = false;
        this.$store.dispatch("getDataSourceList", this.dataBase);
      }
    },
    $handleDownload() {
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
  overflow-y: auto;
  background: #f4f6fa;
  .list {
    box-sizing: border-box;
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
      // position: sticky;
      // top: -5px;
      z-index: 1000;
      line-height: 40px;
    }
    .collapse_list {
      .collapse_item {
        .collapse_item_header {
          display: flex;
          align-items: center;
          background: #fff;
          // position: sticky;
          // top: 35px;
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
