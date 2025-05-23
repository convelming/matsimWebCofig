<template>
  <div class="ConfigBodyer" ref="scrollView">
    <div class="list" v-loading="loading">
      <Item v-show="type == 'item' && !loading" ref="Item" />
      <Editor v-show="type == 'editor' && !loading" ref="Editor" />
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

import Item from "./Item/index.vue";
import Editor from "./Editor/index.vue";

export default {
  components: {
    Item,
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
    this.type = sessionStorage.getItem("config_page_type") || "editor";
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    getXml() {
      if (this.type == "item" && this.$refs.Item) {
        return this.$refs.Item.getXml();
      } else if (this.type == "editor" && this.$refs.Editor) {
        return this.$refs.Editor.getXml();
      }
    },
    setXml(val) {
      if (this.$refs.Item) {
        this.$refs.Item.setXml(val);
      }
      if (this.$refs.Editor) {
        this.$refs.Editor.setXml(val);
      }
    },
    $handleChangeView() {
      const xml = this.getXml();
      this.setXml(xml);
      this.type = this.type == "item" ? "editor" : "item";
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
            this.setXml(e.target.result);
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
        const xml = this.getXml();
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
        this.setXml(res.data);
        this.loading = false;
      });
    },
    async $handleRun() {
      if (this.runLoading) return this.$message.warning(this.$l("waitRunning"));
      this.runLoading = true;
      const xml = this.getXml();
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
      const xml = this.getXml();
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
}
</style>
