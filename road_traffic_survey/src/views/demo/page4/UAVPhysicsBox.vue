<!-- index -->
<template>
  <div class="index">
    <div class="box">
      <el-form label-width="auto" :inline="false" size="small">
        <el-form-item label="场景">
          <el-select
            v-model="playType"
            @change="
              handleReset();
              handlePlay();
            "
          >
            <el-option v-for="item in playTypeNum" :key="item" :label="`场景${item}`" :value="item"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleReset">重置</el-button>
          <el-button @click="handlePlay">播放</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div ref="threeBox" class="threeBox"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import * as CANNON from "cannon-es";

import init from "./UAVPhysics";

export default {
  name: "index",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      playType: 1,
      playTypeNum: 0,
    };
  },
  created() {},
  mounted() {
    const threeBox = this.$refs.threeBox;
    const obj = init(threeBox);
    Promise.all(Object.values(obj).map((v) => v())).then((res) => {
      this._playList = res;
      this.playTypeNum = res.length;
      this.handleReset();
    });
  },
  methods: {
    handleReset() {
      this._playList.forEach((element) => {
        element.close();
      });
      this._playList[this.playType - 1].reset();
    },
    handlePlay() {
      this._playList[this.playType - 1].play();
    },
  },
};
</script>

<style lang="scss" scoped>
.threeBox {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100vw;
  height: 100vh;
}
.box {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 20;
  padding: 20px 20px 0 20px;
  border-radius: 10px;
  background-color: #fff;
}
</style>
