<!-- AELinkFlow -->
<template>
  <MDialog
    class="AELinkFlow"
    :title="title"
    :subTitle="`人工数车 / 路段流量录入 / ${title}`"
    :top="80"
    :left="80"
    width="560px"
    hideClose
    :visible="showMain"
    @close="handleClose"
  >
    <el-scrollbar class="flex-scrollbar">
      <div class="ael_bodyer">
        <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
          label-position="left"
        >
          <!-- <el-form-item label="调查时间" prop="timeList">
          <el-date-picker v-model="form.timeList" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" />
          <div style="color: red">注意: 请输入实际调查起止时间，时长需准确</div>
        </el-form-item> -->
          <el-form-item label="调查日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="调查时段" prop="time">
            <el-select v-model="form.time" placeholder="选择时段">
              <el-option v-for="(v, i) in 24" :key="i" :label="i + '点'" :value="i"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="调查方式" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio v-for="(v, i) in typeOptions" :key="i" :label="String(i)">{{ v }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="上传视频" prop="video">
            <MUploadVideo v-model="form.video" />
          </el-form-item>
          <el-form-item label="视频录像是否可以覆盖到对向车道" label-width="auto" prop="isTwoWay">
            <el-switch v-model="form.isTwoWay" :active-value="true" :inactive-value="false">
            </el-switch>
          </el-form-item>
          <el-form-item label="PCU/H">
            <div class="pcu_box">
              <el-input-number v-model="form.pcuH" :step="0.01" :controls="true" />
              <el-collapse>
                <el-collapse-item title="PCU/H 计算器" name="0">
                  <div class="cpt_box">
                    <div class="item">
                      <div class="label">调查时长</div>
                      <el-input-number
                        class="value"
                        :step="1"
                        step-strictly
                        :min="0"
                        v-model="form.pcuCM"
                      />
                      <div class="util">分钟</div>
                    </div>
                    <div class="item">
                      <div class="label">小型客车</div>
                      <el-input-number
                        class="value"
                        :step="1"
                        step-strictly
                        :min="0"
                        v-model="form.scar"
                      />
                      <div class="util">辆</div>
                    </div>
                    <div class="item">
                      <div class="label">小型货车</div>
                      <el-input-number
                        class="value"
                        :step="1"
                        step-strictly
                        :min="0"
                        v-model="form.struck"
                      />
                      <div class="util">辆</div>
                    </div>
                    <div class="item">
                      <div class="label">中型客车</div>
                      <el-input-number
                        class="value"
                        :step="1"
                        step-strictly
                        :min="0"
                        v-model="form.mcar"
                      />
                      <div class="util">辆</div>
                    </div>
                    <div class="item">
                      <div class="label">中型货车</div>
                      <el-input-number
                        class="value"
                        :step="1"
                        step-strictly
                        :min="0"
                        v-model="form.mtruck"
                      />
                      <div class="util">辆</div>
                    </div>
                    <div class="item">
                      <div class="label">大型客车</div>
                      <el-input-number
                        class="value"
                        :step="1"
                        step-strictly
                        :min="0"
                        v-model="form.lcar"
                      />
                      <div class="util">辆</div>
                    </div>
                    <div class="item">
                      <div class="label">大型货车</div>
                      <el-input-number
                        class="value"
                        :step="1"
                        step-strictly
                        :min="0"
                        v-model="form.ltruck"
                      />
                      <div class="util">辆</div>
                    </div>
                    <div class="item">
                      <el-button type="primary" @click="handleComputePCUH">计算</el-button>
                      <el-button type="primary" @click="handleResetPCUHComputer">重置</el-button>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-form-item>
          <el-form-item label="数据复用" prop="remark">
            <el-button type="primary" @click="handleOpenFY">交评关键路段流量复用</el-button>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              v-model="form.remark"
              placeholder="请输入备注"
              :autosize="{ minRows: 3 }"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">确 定</el-button>
            <el-button @click="handleClose">取 消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-scrollbar>
  </MDialog>

  <CopyFlow v-model:visible="showCopy" :copyForm="copyForm" />
</template>

<script setup>
import * as API from '@/api/index'
import { addWatch } from '@/utils/index'
import { typeOptions } from './index.vue'
import CopyFlow from './CopyFlow.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  linkId: {
    type: Number,
    default: 0,
  },
  proId: {
    type: Number,
    default: 0,
  },
  flowId: {
    type: Number,
    default: 0,
  },
})

const emits = defineEmits(['update:visible', 'close', 'updateData'])

const { proxy } = getCurrentInstance()
const formRef = ref(null)
const form = ref({})
const title = ref('')
const rules = ref({
  date: [{ required: true, message: '调查日期不能为空', trigger: 'blur' }],
  time: [{ required: true, message: '调查时段不能为空', trigger: 'blur' }],
  // timeList: [{ required: true, message: "时间不能为空", trigger: "blur" }],
  type: [{ required: true, message: '调查方式不能为空', trigger: 'blur' }],
})

const showCopy = ref(false)
const copyForm = ref(null)

const watchVisible = addWatch(
  () => props.visible,
  (val) => {
    console.log(val, props.flowId)
    if (val) {
      if (props.flowId) {
        handleEdit()
      } else {
        handleAdd()
      }
    } else {
    }
  },
  {
    immediated: true,
  },
)

const showMain = computed(() => {
  return !showCopy.value && props.visible
})
function handleClose() {
  emits('update:visible', false)
  emits('close')
}
function handleAdd() {
  formRef.value.resetFields()
  form.value = {
    linkId: props.linkId,
    date: '',
    time: '',
    beginTime: null,
    endTime: null,
    type: '0',
    pcuH: 0,
    remark: null,
    isTwoWay: false,
    video: '',
    proId: props.proId,

    pcuH: 0,

    pcuCM: 0,
    scar: 0,
    struck: 0,
    mcar: 0,
    mtruck: 0,
    lcar: 0,
    ltruck: 0,
  }
  title.value = '新增道路信息'
}
function handleEdit() {
  formRef.value.resetFields()
  API.statsDetail(props.flowId).then((response) => {
    // response.data.timeList = [response.data.beginTime, response.data.endTime];
    response.data.date = response.data.beginTime.substring(0, 10)
    response.data.time = Number(response.data.beginTime.substring(11, 13))
    response.data.pcuCM = 60
    form.value = response.data
    title.value = '修改道路信息'
  })
}
function handleResetPCUHComputer() {
  // form.value.pcuH = 0
  form.value.pcuCM = 0
  form.value.scar = 0
  form.value.struck = 0
  form.value.mcar = 0
  form.value.mtruck = 0
  form.value.lcar = 0
  form.value.ltruck = 0
}
function handleComputePCUH() {
  const _form = {
    scar: form.value.scar,
    struck: form.value.struck,
    mcar: form.value.mcar,
    mtruck: form.value.mtruck,
    lcar: form.value.lcar,
    ltruck: form.value.ltruck,
    minute: form.value.pcuCM,
  }
  API.statsCalcPcu(_form).then((res) => {
    console.log(res.data)

    form.value.pcuH = res.data
  })
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const form = JSON.parse(JSON.stringify(this.form))
      form.beginTime = form.date + ' ' + (form.time < 10 ? '0' + form.time : form.time) + ':00:00'
      form.endTime =
        form.date + ' ' + (form.time < 9 ? '0' + (form.time + 1) : form.time + 1) + ':00:00'
      if (form.id != undefined) {
        API.statsUpdate(form).then((response) => {
          proxy.$message.success('修改成功')
          emits('updateData')
          handleClose()
        })
      } else {
        API.statsInsert(form).then((response) => {
          proxy.$message.success('新增成功')
          emits('updateData')
          handleClose()
        })
      }
    }
  })
}
function handleOpenFY() {
  formRef.value.validate((valid) => {
    if (valid) {
      showCopy.value = true
    }
  })
}
</script>

<style lang="scss" scoped>
.AELinkFlow {
  .close_btn {
    z-index: 100;
    cursor: pointer;
    position: absolute;
    fill: #000;
    right: 16px;
    top: 16px;
    width: 20px;
    height: 20px;
    z-index: 10;
  }
  .flex-scrollbar {
    max-height: calc(100vh - 200px);
  }
  .ael_bodyer {
    padding: 16px;
    .pcu_box {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      .cpt_box {
        display: flex;
        flex-direction: column;
        gap: 10px;
        .item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .el-button {
          margin-left: 0;
        }
      }
    }
  }
}
</style>
