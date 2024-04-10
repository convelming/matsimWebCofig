<template>
  <el-collapse-item class="RouteDepartures" :name="name">
    <div class="RouteDepartures_bodyer">
      <div class="stop_title">
        <el-button
          type="primary"
          size="small"
          @click="
            handleRouteManu({ data, command: 'Transit Route Analysis...' })
          "
          >{{ $("Transit Route Analysis...") }}</el-button
        >
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "Transit Route Analysis...":{
    "zh-CN": "Transit Route Analysis...",
    "en-US": "Transit Route Analysis..."
  },
}
</language>

<script>
export default {};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
  }
}
.RouteDepartures {
  .collapse_item_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  .RouteDepartures_bodyer {
    padding: 0 20px;
    .stop_name {
      font-size: 16px;
      line-height: 30px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .stop_title {
      font-size: 14px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .stops_table {
      margin-bottom: 10px;
    }
    .routes_type {
      margin-bottom: 10px;
      .el-select {
        width: 100%;
      }
    }
    .routes_table {
      margin-bottom: 10px;
    }
  }
}
</style>
