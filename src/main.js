// 仅引入 Vue3 核心的 createApp 方法
import { createApp } from 'vue'
// 引入根组件
import App from './App.vue'

// 创建 Vue 实例并挂载到 #app 容器
createApp(App).mount('#app')