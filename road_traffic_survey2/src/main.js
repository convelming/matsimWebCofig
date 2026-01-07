import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

// echarts
import VChart from 'vue-echarts'
import * as echarts from 'echarts'
import Dialog from '@/components/Dialog.vue'
import Pagination from '@/components/Pagination.vue'
import UploadVideo from '@/components/UploadVideo.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import moment from 'moment'

import './assets/style/main.scss'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.$echarts = echarts
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$alert = ElMessageBox.alert
app.config.globalProperties.$confirm = ElMessageBox.confirm
app.config.globalProperties.$prompt = ElMessageBox.prompt
app.config.globalProperties.$moment = moment
// 全局组件挂载
app.component('VChart', VChart)
app.component('MDialog', Dialog)
app.component('MPagination', Pagination)
app.component('MUploadVideo', UploadVideo)
app.component('QuillEditor', QuillEditor);

app.use(ElementPlus, { locale: zhCn })
app.use(createPinia())
app.use(router)

app.mount('#app')
