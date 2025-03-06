<template>
  <div class="PageConfig">
    <el-dropdown @command="handleCommand" placement="top-start" trigger="click">
      <div class="locale_btn">
        <img class="icon" src="" /> <span class="text">{{ $l("config") }}</span>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="import">{{ $l("import") }}</el-dropdown-item>
        <el-dropdown-item command="export">{{ $l("export") }}</el-dropdown-item>
        <el-dropdown-item command="save">{{ $l("save") }}</el-dropdown-item>
        <el-dropdown-item command="load">{{ $l("load") }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dialog class="tabel_dialog" :title="$l('configList')" :visible.sync="show" width="700px" append-to-body>
      <el-table height="400" :data="configList" border stripe v-loading="loading">
        <el-table-column :label="$l('configName')"
          ><template slot-scope="{ row }">{{ row }}</template>
        </el-table-column>
        <el-table-column :label="$l('操作')" width="250">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="loadConfig(row)">{{ $l("loadConfig") }}</el-button>
            <el-button type="primary" size="mini" @click="copyLink(row)">{{ $l("copyLink") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<language>
{
  "config":{
    "zh-CN": "配置",
    "en-US": "config"
  },
  "import":{
    "zh-CN": "导入",
    "en-US": "import"
  },
  "export":{
    "zh-CN": "导出",
    "en-US": "export"
  },
  "save":{
    "zh-CN": "保存到云端",
    "en-US": "save"
  },
  "load":{
    "zh-CN": "从云端加载",
    "en-US": "load"
  },
  "configList":{
    "zh-CN": "配置列表",
    "en-US": "Config List"
  },
  "configName":{
    "zh-CN": "配置名称",
    "en-US": "Config Name"
  },
  "loadConfig":{
    "zh-CN": "加载配置",
    "en-US": "Load Config"
  },
  "copyLink":{
    "zh-CN": "复制链接",
    "en-US": "copy Link"
  },
  "inputConfigName":{
    "zh-CN": "请输入配置名称",
    "en-US": "Please enter the config name"
  },
  "exporting":{
    "zh-CN": "导出中...",
    "en-US": "Exporting..."
  },
  "saving":{
    "zh-CN": "保存中...",
    "en-US": "Saving..."
  },
  "loading":{
    "zh-CN": "加载中...",
    "en-US": "Loading..."
  },
  "saveSuccess":{
    "zh-CN": "保存成功",
    "en-US": "Successfully saved"
  },
  "importSuccess":{
    "zh-CN": "导入成功",
    "en-US": "Successfully imported"
  },
  "loadSuccess":{
    "zh-CN": "加载成功",
    "en-US": "Successfully loaded"
  },

}
</language>

<script>
import { saveUserCfg, getUserCfg, userCfgList } from "@/api/index.js";
import { copyText, stringToFile, fileToString } from "@/utils/utils.js";
import moment from "moment";

export default {
  name: "PageConfig",
  inject: ["rootVue"],
  data() {
    return {
      show: false,
      loading: false,
      configList: [],
    };
  },
  mounted() {},
  methods: {
    handleCommand(command) {
      switch (command) {
        case "import":
          this.importConfig();
          break;
        case "export":
          this.exportConfig();
          break;
        case "save":
          this.saveConfig();
          break;
        case "load":
          this.show = true;
          this.loading = true;
          userCfgList()
            .then((res) => {
              this.configList = res.data;
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
          break;
      }
    },
    async exportConfig() {
      const { value: configName } = await this.$prompt(this.$l("inputConfigName"), this.$l("提示"), {
        confirmButtonText: this.$l("确定"),
        cancelButtonText: this.$l("取消"),
      });
      const loading = this.$loading({
        lock: true,
        text: this.$l("exporting"),
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      try {
        const config = await this.rootVue.getConfig();
        const blob = new Blob([JSON.stringify(config)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${configName}_${moment().format("YYYYMMDDHHmmss")}`;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error(error);
      }
      loading.close();
    },
    importConfig() {
      const input = document.createElement("input");
      input.type = "file";
      // input.accept = ".geojson";
      input.style = "position:absolute;width:0;height:0;top: -100px;";
      document.body.appendChild(input);
      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          const configJsonStr = await fileToString(file);
          const configJson = JSON.parse(configJsonStr);
          this.rootVue.initByConfig(configJson);
          this.$message.success(this.$l("importSuccess"));
          document.body.removeChild(input);
        } catch (error) {
          console.error(error);
          this.$message.error(error.msg);
        }
      };
      input.click();
    },
    async saveConfig() {
      const { value: configName } = await this.$prompt(this.$l("请输入配置名称"), this.$l("提示"), {
        confirmButtonText: this.$l("确定"),
        cancelButtonText: this.$l("取消"),
      });
      const loading = this.$loading({
        lock: true,
        text: this.$l("saving"),
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      try {
        const config = await this.rootVue.getConfig();
        const fileName = `${configName}_${moment().format("YYYYMMDDHHmmss")}`;
        const file = stringToFile(JSON.stringify(config), fileName);
        await saveUserCfg(fileName, file);
        this.$message.success(this.$l("saveSuccess"));
      } catch (error) {
        console.error(error);
        // this.$message.success(error.msg);
      }
      loading.close();
    },
    async loadConfig(configName) {
      const loading = this.$loading({
        lock: true,
        text: this.$l("loading"),
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      try {
        const res = await getUserCfg({ fileName: configName });
        this.rootVue.initByConfig(res);
        this.show = false;
        this.$message.success(this.$l("loadSuccess"));
      } catch (error) {
        console.error(error);
        // this.$message.success(error.msg);
      }
      loading.close();
    },
    copyLink(configName) {
      copyText(`${window.location.origin}${window.location.pathname}#${this.$route.path}?configName=${configName}`, this.$message.success, this.$message.error);
    },
  },
};
</script>

<style lang="scss" scoped>
.PageConfig {
  flex-shrink: 0;
  .locale_btn {
    flex-shrink: 0;
    width: 70px;
    cursor: pointer;
    height: 32px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;

    .icon {
      width: 24px;
      height: 24px;
      margin-right: 5px;
    }

    .text {
      font-weight: 400;
      font-size: 14px;
      color: #434343;
      line-height: 20px;
    }
  }
}
</style>
