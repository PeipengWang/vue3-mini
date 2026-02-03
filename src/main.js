// 仅引入 Vue3 核心的 createApp 方法
import { createApp } from 'vue'
// 引入根组件
import App from './App.vue'
// 2. 全局配置 axios（可选：配置后端接口基础地址）
// axios.defaults.baseURL = 'http://localhost:8080' // 替换为你的后端服务地址
// axios.defaults.timeout = 5000
// axios.defaults.headers.post['Content-Type'] = 'application/json'
//
// // 3. 挂载到 Vue 全局属性
// app.config.globalProperties.$axios = axios

// 创建 Vue 实例并挂载到 #app 容器
createApp(App).mount('#app')