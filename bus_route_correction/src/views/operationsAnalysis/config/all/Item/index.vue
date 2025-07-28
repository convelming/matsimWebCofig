<!-- index -->
<template>
  <div class="Item">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText" clearable prefix-icon="el-icon-search" />
    <div class="tree-box">
      <el-tree ref="tree" :data="data" node-key="id" :props="{ children: 'nodes', label: 'name' }" default-expand-all :expand-on-click-node="false" :filter-node-method="filterNode">
        <div class="custom-tree-node" slot-scope="{ node, data }">
          <el-dropdown size="mini" placement="bottom-start" @command="handleCommand($event, data)" trigger="click">
            <span class="text1">{{ data.name }}</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="remove">删除当前配置</el-dropdown-item>
              <el-dropdown-item command="edit">编辑配置属性</el-dropdown-item>
              <el-dropdown-item command="addChlid">添加子配置</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span v-for="item in data.attrs" style="margin-left: 10px">
            <span class="text2">{{ item[0] }}:&nbsp;</span>
            <input :id="item[2]" type="text" v-if="item[3]" v-model="item[1]" @blur="handleBlurAttrs(item)" />
            <span class="text3" v-else @dblclick="handleChickAttrs(item)">{{ item[1] }}</span>
          </span>
          <span style="margin-left: 10px" v-if="data.helps.length">
            <span class="text2">help:&nbsp;</span>
            <span class="text3">{{ data.helps.join(",") }}</span>
          </span>
        </div>
      </el-tree>
    </div>
    <el-dialog :title="editDialog.parentId ? '添加子配置' : '编辑配置属性'" :visible.sync="editDialog.show" width="600px">
      <el-form :model="editDialog.form" label-width="80px" :inline="false" size="mini">
        <el-form-item label="标签名称">
          <el-input v-model="editDialog.form.name"></el-input>
        </el-form-item>
        <el-form-item label="属性">
          <div class="__table">
            <div class="row" style="padding: 0">
              <div class="col">属性名</div>
              <div class="col">属性值</div>
            </div>
            <div class="row" v-for="(item, index) in editDialog.form.attrs">
              <div class="col"><el-input style="display: block" v-model="editDialog.form.attrs[index][0]"></el-input></div>
              <div class="col"><el-input style="display: block" v-model="editDialog.form.attrs[index][1]"></el-input></div>
            </div>
            <div class="row">
              <div class="col"><el-button style="width: 100%" type="primary" @click="editDialog.form.attrs.push(['', ''])" icon="el-icon-plus">添加属性</el-button></div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="帮助">
          <template v-for="(item, index) in editDialog.form.helps">
            <el-input style="width: 100%; display: block; margin-bottom: 5px" type="textarea" autosize placeholder="请输入内容" v-model="editDialog.form.helps[index]"></el-input>
            <!-- <el-input style="width: 100%; display: block; margin-bottom: 5px" v-model="editDialog.form.helps[index]"></el-input> -->
          </template>
          <el-button style="width: 100%; display: block" type="primary" @click="editDialog.form.helps.push('')" icon="el-icon-plus">添加帮助</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="editDialog.show = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export function guid() {
  return "xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default {
  name: "Item",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      filterText: "",
      data: [],
      editDialog: {
        show: false,
        parentId: null,
        form: {},
        // show: true,
        // form: {
        //   id: "5c89f3e8-de31-4368-ae18-d4457cc7a341",
        //   name: "param",
        //   attrs: [
        //     ["name", "activateAnnealingModule"],
        //     ["value", "false"],
        //   ],
        //   helps: [" Activate the scaling of replanning modules using an annealing approach rather than fixed rates. "],
        // },
      },
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {},
  mounted() {},
  methods: {
    setXml(xml) {
      const domParser = new DOMParser();
      const xmlDom = domParser.parseFromString(xml, "application/xml");
      const config = xmlDom.getElementsByTagName("config")[0];
      function _parse(xmlNode, helps) {
        const name = xmlNode.nodeName;
        const attrs = [];
        const nodes = [];
        for (const attr of xmlNode.attributes || []) {
          attrs.push([attr.nodeName, attr.nodeValue, guid(), false]);
        }
        if (xmlNode.hasChildNodes()) {
          let helpNodes = [];
          for (const node of xmlNode.childNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              nodes.push(_parse(node, helpNodes));
              helpNodes = [];
            } else if (node.nodeType === Node.COMMENT_NODE) {
              // new Comment()
              helpNodes.push(node.nodeValue.trim());
            }
          }
        }
        return { id: guid(), name, attrs, helps, nodes };
      }
      const obj = _parse(config, []);
      this._xml = xml;
      this.data = [obj];
    },
    getXml() {
      const domParser = new DOMParser();
      const xmlDom = domParser.parseFromString(this._xml, "application/xml");
      const oldConfig = xmlDom.getElementsByTagName("config")[0];
      xmlDom.removeChild(oldConfig);

      function _parse(obj, parent) {
        const { id, name, attrs, helps, nodes } = obj;
        const nodeList = [];
        const node = xmlDom.createElement(name);
        for (const [key, value] of attrs) {
          node.setAttribute(key, value);
        }
        for (const help of helps) {
          const nodeHelp = new Comment(` ${help} `);
          parent.appendChild(nodeHelp);
        }
        for (const cNode of nodes) {
          _parse(cNode, node);
        }
        parent.appendChild(node);
        return parent;
      }

      _parse(this.data[0], xmlDom);
      const serializer = new XMLSerializer();
      return serializer.serializeToString(xmlDom);
    },
    filterNode(value, data, node) {
      if (node.parent.visible) return true;
      if (!value) return true;
      for (const [v1, v2] of data.attrs) {
        let index = v2.indexOf(value);
        if (index > -1) return true;
      }
      return false;
    },
    handleCommand(command, data) {
      switch (command) {
        case "remove": {
          this.handleRemoveChild(data);
          break;
        }
        case "edit": {
          this.editDialog.parentId = null;
          this.editDialog.form = JSON.parse(
            JSON.stringify({
              id: data.id,
              name: data.name,
              attrs: data.attrs,
              helps: data.helps,
            })
          );
          this.editDialog.show = true;
          break;
        }
        case "addChlid": {
          this.editDialog.parentId = data.id;
          this.editDialog.form = {
            id: guid(),
            name: "",
            attrs: [
              ["name", "", guid(), false],
              ["value", "", guid(), false],
            ],
            helps: [""],
          };
          this.editDialog.show = true;
          break;
        }
      }
    },
    handleSubmit() {
      if (this.editDialog.parentId) {
        this.handleSubmitAddChild();
      } else {
        this.handleSubmitEdit();
      }
    },
    handleSubmitEdit() {
      const data = this.editDialog.form;
      let item = null;
      let list = [...this.data];
      while (list.length) {
        const i = list.shift();
        if (i.id === data.id) {
          item = i;
          break;
        }
        list.push(...i.nodes);
      }
      if (item) {
        const helps = data.helps.filter((v) => !!v);
        const attrs = data.attrs.filter((v) => !!v[0]);
        this.$set(item, "name", data.name);
        this.$set(item, "attrs", attrs);
        this.$set(item, "helps", helps);
      }
      this.editDialog.show = false;
    },
    handleSubmitAddChild() {
      if (!this.editDialog.form.name) {
        this.$message.error("请输入标签名称");
        return;
      }
      const parentId = this.editDialog.parentId;
      let item = null;
      let list = [...this.data];
      while (list.length) {
        const i = list.shift();
        if (i.id === parentId) {
          item = i;
          break;
        }
        list.push(...i.nodes);
      }
      if (item) {
        item.nodes.push({
          ...this.editDialog.form,
          nodes: [],
        });
      }
      this.editDialog.show = false;
    },
    handleRemoveChild(data) {
      if (data.id == this.data[0].id) {
        return this.$message.error("不能删除根节点");
      }
      let item = null;
      let index = -1;
      let list = [...this.data];
      while (list.length) {
        const i = list.shift();
        const i2 = i.nodes.findIndex((v) => v.id === data.id);
        if (i2 > -1) {
          item = i;
          index = i2;
          break;
        }
        list.push(...i.nodes);
      }
      if (item && index > -1) {
        item.nodes.splice(index, 1);
      }
    },
    handleChickAttrs(item) {
      this.$set(item, 3, true);
      this.$nextTick(() => {
        const input = document.getElementById(item[2]);
        input.focus();
      });
    },
    handleBlurAttrs(item) {
      this.$set(item, 3, false);
    },
  },
};
</script>

<style lang="scss" scoped>
.Item {
  box-sizing: border-box;
  background-color: #fff;
  .tree-box {
    margin-top: 10px;
    height: calc(100vh - 170px - 50px);
    overflow: scroll;
  }
  .custom-tree-node {
    width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 12px;
    .text1 {
      user-select: none;
      color: #65d68f;
      font-weight: bold;
      font-size: 14px;
    }
    .text2 {
      user-select: none;
      color: #00c;
    }
    .text3 {
      color: #a11;
      font-weight: bold;
    }
  }
  .__table {
    border-top: 1px solid #ccc;
    .row {
      display: flex;
      gap: 10px;
      padding: 5px 0;
      border-bottom: 1px solid #ccc;
      .col {
        text-align: center;
        width: 0;
        flex: 1;
      }
    }
  }
}
</style>
