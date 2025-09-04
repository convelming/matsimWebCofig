import './assets/style/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

// echarts
import VChart from 'vue-echarts'
import * as echarts from 'echarts'
import Dialog from '@/components/Dialog.vue'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.$echarts = echarts
app.config.globalProperties.$message = ElementPlus.ElMessage
// 全局组件挂载
app.component('VChart', VChart)
app.component('MDialog', Dialog)

app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')
