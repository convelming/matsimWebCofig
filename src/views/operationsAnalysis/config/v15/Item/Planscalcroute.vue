<template>
  <div class="ConfigItem col_2 Planscalcroute">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Planscalcroute">Planscalcroute</div>
    <div class="ConfigItem_bodyer">
      <el-form label-position="top">
        <el-row :gutter="20">
          <el-col :span="12" style="height: 100%">
            <div class="scroll_y">
              <el-form-item :label="$l('accessEgressType')">
                <el-select v-model="form.accessEgressType" clearable>
                  <el-option :label="$l('none')" value="none" />
                  <el-option :label="$l('accessEgressModeToLink')" value="accessEgressModeToLink" />
                  <el-option :label="$l('walkConstantTimeToLink')" value="walkConstantTimeToLink" />
                  <el-option :label="$l('accessEgressModeToLinkPlusTimeConstant')" value="accessEgressModeToLinkPlusTimeConstant" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$l('clearDefaultTeleportedModeParams')">
                <el-switch v-model="form.clearDefaultTeleportedModeParams" active-value="true" inactive-value="false" />
              </el-form-item>
              <el-form-item :label="$l('networkModes')">
                <el-input v-model="form.networkModes" clearable />
              </el-form-item>
              <el-form-item :label="$l('routingRandomness')">
                <el-input-number v-model="form.routingRandomness" :min="0" :step="0.1" controls-position="right" />
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="12" style="height: 100%">
            <div class="scroll_y">
              <div class="collapse">
                <div class="collapse_add_btn" @click="handleAddTeleportedMode">
                  <i class="el-icon-circle-plus-outline"></i>&nbsp;&nbsp;
                  <span>{{ $l("Parametersets: TeleportedMode") }}</span>
                </div>
                <div class="collapse_list">
                  <div class="collapse_item" v-for="(item, index) in form.TeleportedMode" :key="item.uuid">
                    <div class="collapse_item_title" :class="{ open: item.open }" @click="item.open = !item.open">
                      <div class="el-icon-arrow-right"></div>
                      <div class="text">{{ `${$l(item.type)} ${index}` }}</div>
                      <div class="el-icon-delete" @click.stop="handleDeleteTeleportedMode(item.uuid)"></div>
                    </div>
                    <el-collapse-transition>
                      <div class="collapse_item_content" v-show="item.open">
                        <el-form-item :label="$l('beelineDistanceFactor')">
                          <el-input-number v-model="item.beelineDistanceFactor" :min="0" :step="0.1" controls-position="right" />
                        </el-form-item>
                        <el-form-item :label="$l('mode')">
                          <el-input v-model="item.mode" clearable></el-input>
                        </el-form-item>
                        <el-form-item :label="$l('teleportedModeFreespeedFactor')">
                          <el-input v-model="item.teleportedModeFreespeedFactor" clearable></el-input>
                        </el-form-item>
                        <el-form-item :label="$l('teleportedModeSpeed')">
                          <el-input-number v-model="item.teleportedModeSpeed" :min="0" :step="0.1" controls-position="right" />
                        </el-form-item>
                      </div>
                    </el-collapse-transition>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "accessEgressType": {
    "zh-CN":"定义如何脱离/进入主要出行方式",
    "en-US":"accessEgressType"
  },
  "none": {
    "zh-CN":"无，不会模拟从初始位置到link的出行",
    "en-US":"none"
  },
  "accessEgressModeToLink": {
    "zh-CN":"accessEgressModeToLink",
    "en-US":"accessEgressModeToLink"
  },
  "walkConstantTimeToLink": {
    "zh-CN":"walkConstantTimeToLink",
    "en-US":"walkConstantTimeToLink"
  },
  "accessEgressModeToLinkPlusTimeConstant": {
    "zh-CN":"accessEgressModeToLinkPlusTimeConstant",
    "en-US":"accessEgressModeToLinkPlusTimeConstant"
  },
  "clearDefaultTeleportedModeParams": {
    "zh-CN":"清除默认的瞬移的出行方式",
    "en-US":"clearDefaultTeleportedModeParams"
  },
  "networkModes": {
    "zh-CN":"路网可接纳的方式",
    "en-US":"networkModes"
  },
  "routingRandomness": {
    "zh-CN":"路径随机性，与收费道路有关，默认3.0",
    "en-US":"routingRandomness"
  },
  "Parametersets: TeleportedMode": {
    "zh-CN":"参数集: 瞬移的出行方式",
    "en-US":"Parametersets: TeleportedMode"
  },
  "beelineDistanceFactor": {
    "zh-CN":"直线距离系数",
    "en-US":"beelineDistanceFactor"
  },
  "mode": {
    "zh-CN":"出行方式",
    "en-US":"mode"
  },
  "teleportedModeFreespeedFactor": {
    "zh-CN":"瞬移速度权重",
    "en-US":"teleportedModeFreespeedFactor"
  },
  "teleportedModeSpeed": {
    "zh-CN":"瞬移方式的速度",
    "en-US":"teleportedModeSpeed"
  },
  "TeleportedMode": {
    "zh-CN":"瞬移的出行方式",
    "en-US":"TeleportedMode"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  accessEgressType: "",
  clearDefaultTeleportedModeParams: "",
  networkModes: "",
  routingRandomness: "",
  TeleportedMode: [],
};
const defaultXml = `
	<module name="planscalcroute" >
		<!-- Defines how access and egress to main mode is simulated. Either of [none, accessEgressModeToLink, walkConstantTimeToLink, accessEgressModeToLinkPlusTimeConstant], Current default=none which means no access or egress trips are simulated. -->
		<param name="accessEgressType" value="none" />
		<!-- Some typical teleportation routing params are set by default, such as for walk and bike.  Setting this switch to "true" will clear them.  Note that this will also clear settings for helper modes such as for non_network_walk -->
		<param name="clearDefaultTeleportedModeParams" value="false" />
		<!-- All the modes for which the router is supposed to generate network routes (like car) -->
		<param name="networkModes" value="car" />
		<!-- strength of the randomness for the utility of money in routing under toll.  Leads to Pareto-optimal route with randomly drawn money-vs-other-attributes tradeoff. Technically the width parameter of a log-normal distribution. 3.0 seems to be a good value.  -->
		<param name="routingRandomness" value="3.0" />
		<parameterset type="teleportedModeParameters" >
			<param name="beelineDistanceFactor" value="1.3" />
			<param name="mode" value="bike" />
			<!-- Free-speed factor for a teleported mode. Travel time = teleportedModeFreespeedFactor * <freespeed car travel time>. Insert a line like this for every such mode. Please do not set teleportedModeFreespeedFactor as well as teleportedModeSpeed for the same mode, but if you do, +teleportedModeFreespeedFactor wins over teleportedModeSpeed. -->
			<param name="teleportedModeFreespeedFactor" value="null" />
			<!-- Speed for a teleported mode. Travel time = (<beeline distance> * beelineDistanceFactor) / teleportedModeSpeed. Insert a line like this for every such mode. -->
			<param name="teleportedModeSpeed" value="4.166666666666667" />
		</parameterset>
		<parameterset type="teleportedModeParameters" >
			<param name="beelineDistanceFactor" value="1.3" />
			<param name="mode" value="walk" />
			<param name="teleportedModeFreespeedFactor" value="null" />
			<param name="teleportedModeSpeed" value="0.8333333333333333" />
		</parameterset>
		<parameterset type="teleportedModeParameters" >
			<param name="beelineDistanceFactor" value="1.3" />
			<param name="mode" value="non_network_walk" />
			<param name="teleportedModeFreespeedFactor" value="null" />
			<param name="teleportedModeSpeed" value="0.8333333333333333" />
		</parameterset>
		<parameterset type="teleportedModeParameters" >
			<param name="beelineDistanceFactor" value="1.3" />
			<param name="mode" value="ride" />
			<param name="teleportedModeFreespeedFactor" value="1.0" />
			<param name="teleportedModeSpeed" value="null" />
		</parameterset>
		<parameterset type="teleportedModeParameters" >
			<param name="beelineDistanceFactor" value="1.3" />
			<param name="mode" value="pt" />
			<param name="teleportedModeFreespeedFactor" value="2.0" />
			<param name="teleportedModeSpeed" value="null" />
		</parameterset>
	</module>
`;
export default {
  props: {
    xml: {
      type: String,
      default: "",
    },
  },
  components: {},
  watch: {
    form: {
      handler(val) {
        this.s_xml = this.getXml(val);
        this.$emit("update:xml", this.s_xml);
      },
      deep: true,
    },
    xml: {
      handler(val) {
        if (val != this.s_xml) {
          this.form = this.getForm(val);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      form: {
        TeleportedMode: [],
      },
    };
  },
  created() {},
  methods: {
    getForm(xml) {
      const json = xmlToJson(xml);
      const form = defaultForm;
      function getTeleportedMode(node) {
        const obj = {
          uuid: guid(),
          open: false,
        };
        for (const { attrs } of node.nodes) {
          obj[attrs.name] = attrs.value;
        }
        return obj;
      }
      const nodes = json.nodes[0].nodes;
      for (const node of nodes) {
        if (node.name == "param") {
          form[node.attrs.name] = node.attrs.value;
        } else if (node.name == "parameterset") {
          const item = getTeleportedMode(node);
          item.index = form.TeleportedMode.length + 1;
          item.name = item.index;
          item.type = `TeleportedMode`;
          form.TeleportedMode.push(item);
        }
      }
      return form;
    },
    getXml(data) {
      const { TeleportedMode, ..._data } = data;
      const nodes = [];
      for (const key in _data) {
        const value = _data[key];
        if (value !== "" && value !== null && value !== "null") {
          nodes.push({
            name: "param",
            attrs: {
              name: key,
              value: _data[key],
            },
          });
        }
      }
      function mapFunc(v) {
        const nodes = ["beelineDistanceFactor", "mode", "teleportedModeFreespeedFactor", "teleportedModeSpeed"];
        return {
          name: "parameterset",
          attrs: {
            type: "teleportedModeParameters",
          },
          nodes: nodes
            .filter((v2) => v[v2] !== "" && v[v2] !== null && v[v2] !== "null")
            .map((v2) => ({
              name: "param",
              attrs: { name: v2, value: v[v2] },
            })),
        };
      }
      nodes.push(...TeleportedMode.map(mapFunc));
      return jsonToXml({
        name: "module",
        attrs: {
          name: "planscalcroute",
        },
        nodes: nodes,
      });
    },
    handleAddTeleportedMode() {
      let index = this.form.TeleportedMode.length > 0 ? this.form.TeleportedMode[this.form.TeleportedMode.length - 1].index + 1 : 1;
      this.form.TeleportedMode.push({
        open: false,
        name: `${index}`,
        type: "TeleportedMode",
        index: index,
        uuid: guid(),
        beelineDistanceFactor: "",
        mode: "",
        teleportedModeFreespeedFactor: "",
        teleportedModeSpeed: "",
      });
    },
    handleDeleteTeleportedMode(uuid) {
      let index = this.form.TeleportedMode.findIndex((item) => item.uuid === uuid);
      if (index >= 0) this.form.TeleportedMode.splice(index, 1);
    },
  },
};
</script>
<style lang="scss" scoped>
.Planscalcroute {
  .box {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    justify-content: space-between;
    .el-form {
      width: 48%;
    }
  }
}
</style>
