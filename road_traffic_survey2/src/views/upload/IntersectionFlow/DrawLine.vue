<!-- DrawLine -->
<template>
  <div class="DrawLine"></div>

  <Dialog
    class="DrawLine"
    title="绘制检测线"
    :top="40"
    :left="100"
    width="calc(100vw - 200px)"
    hideMinimize
    :visible="visible"
    @close="handleClose"
  >
    <div class="DrawLine_body">
      <!-- <div class="image_list">
        <img class="image_item selected" :src="this.drawUrl" />
      </div> -->
      <el-row :gutter="20">
        <el-col :span="24" :lg="16" :xl="13">
          <div class="draw_map_box">
            <div
              class="img_size"
              :style="{ paddingBottom: `${(drawHeight / drawWidth) * 100}%` }"
            ></div>
            <div class="draw_map" id="draw_map"></div>
          </div>
        </el-col>
        <el-col :span="24" :lg="8" :xl="11">
          <div class="draw_toolbar">
            <div class="row">
              <el-button
                v-if="!isChangeMap"
                type="primary"
                size="small"
                @click="handleStartChangeMap"
                >调整位置</el-button
              >
              <el-button v-else type="primary" size="small" @click="handleEndChangeMap"
                >结束调整</el-button
              >
              <div
                class="open_btn el-icon-arrow-down"
                :class="{ hide: !showChangeMapSetting }"
                @click="showChangeMapSetting = !showChangeMapSetting"
              ></div>
            </div>
            <template v-if="showChangeMapSetting">
              <div class="row">
                <span class="label">显示地图:</span>
                <el-switch v-model="showMapLayer" :active-value="true" :inactive-value="false">
                </el-switch>
              </div>
              <div class="row">
                <span class="label">显示路网:</span>
                <el-switch v-model="showNetworkLayer" :active-value="true" :inactive-value="false">
                </el-switch>
              </div>
              <div class="row">
                <span class="label">地图透明度:</span>
                <el-slider
                  :disabled="!showMapLayer"
                  style="width: 100%; padding: 0 2em 0 0"
                  v-model="mapLayerOpacity"
                  :step="0.01"
                  :min="0"
                  :max="1"
                >
                </el-slider>
              </div>
              <div class="row">
                <span class="label">topLeft:</span>
                <span>{{ mapFrom.topLeft }}</span>
              </div>
              <div class="row">
                <span class="label">topRight:</span>
                <span>{{ mapFrom.topRight }}</span>
              </div>
              <div class="row">
                <span class="label">bottomLeft:</span>
                <span>{{ mapFrom.bottomLeft }}</span>
              </div>
              <div class="row">
                <span class="label">bottomRight:</span>
                <span>{{ mapFrom.bottomRight }}</span>
              </div>
            </template>
            <div class="row">
              <el-button type="primary" size="small" @click="handleAddDrawLine">添加画线</el-button>
              <div
                class="open_btn el-icon-arrow-down"
                :class="{ hide: !showChangeDrawLineSetting }"
                @click="showChangeDrawLineSetting = !showChangeDrawLineSetting"
              ></div>
            </div>
            <template v-if="showChangeDrawLineSetting">
              <template v-if="drawLineFrom">
                <div class="row">
                  <span class="label">线名：</span>
                  <el-input
                    v-model="drawLineFrom.name"
                    placeholder=""
                    size="mini"
                    clearable
                    @change=""
                  ></el-input>
                </div>
                <div class="row">
                  <span class="label">开始点：</span>
                  <span> {{ formatterPoint(drawLineFrom.begin) }}</span>
                </div>
                <div class="row">
                  <span class="label">结束点：</span>
                  <span> {{ formatterPoint(drawLineFrom.end) }}</span>
                </div>
                <div class="row">
                  <span class="label">颜色：</span>
                  <el-color-picker
                    v-model="drawLineFrom.color"
                    :predefine="predefineColors"
                    size="mini"
                  ></el-color-picker>
                </div>
                <div class="row">
                  <el-button type="primary" size="small" @click="handleConfirmDrawLine"
                    >确定</el-button
                  >
                  <el-button type="primary" size="small" @click="handleCancelLine">取消</el-button>
                </div>
              </template>
              <template v-else>
                <div class="row">
                  <el-table class="small" :data="drawLineList" border stripe height="300px">
                    <el-table-column prop="color" label="颜色" width="50">
                      <template slot-scope="{ row }">
                        <el-color-picker
                          v-model="row.color"
                          :predefine="predefineColors"
                          size="mini"
                        ></el-color-picker>
                      </template>
                    </el-table-column>
                    <el-table-column prop="name" label="线名"> </el-table-column>
                    <el-table-column prop="begin" label="开始点">
                      <template slot-scope="{ row }">{{ formatterPoint(row.begin) }}</template>
                    </el-table-column>
                    <el-table-column prop="end" label="结束点">
                      <template slot-scope="{ row }">{{ formatterPoint(row.end) }}</template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                      <template slot-scope="{ row, $index }">
                        <el-button
                          type="primary"
                          size="mini"
                          @click="handleEditDrawLine(row, $index)"
                          >编辑</el-button
                        >
                        <el-button
                          type="danger"
                          size="mini"
                          @click="handleRemoveDrawLine(row, $index)"
                          >删除</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </template>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="DrawLine_footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="saving">保存绘制内容</el-button>
    </div>
  </Dialog>
</template>

<script setup></script>

<style lang="scss" scoped>
.DrawLine {
  .DrawLine_body {
    height: calc(100vh - 230px);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .DrawLine_footer {
    padding-top: 10px;
    display: flex;
    justify-content: center;
  }
  .image_list {
    position: relative;
    top: 1px;
    line-height: 0;
    margin-bottom: 20px;
    .image_item {
      height: 50px;
      border: 2px solid transparent;
      border-radius: 5px;
      margin-right: 10px;
      cursor: pointer;
      &.selected {
        border: 2px solid #1989fa;
      }
    }
  }
  .draw_map_box {
    position: relative;
    margin-bottom: 20px;
    .img_size {
      display: block;
      width: 100%;
      height: 0;
      opacity: 0;
    }
    .draw_map {
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  .draw_toolbar {
    font-size: 14px;
    .row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .label {
      white-space: nowrap;
      margin-right: 20px;
    }
    .open_btn {
      margin-left: auto;
      height: 32px;
      line-height: 32px;
      padding: 0 12px;
      cursor: pointer;
      transition: all 0.3s;
      &.hide {
        transform: rotate(90deg);
      }
    }
  }
}
</style>
