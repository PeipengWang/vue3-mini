// src/config/api.config.js
// 全局 API 配置（抽离后的独立文件）
export const CONFIG = {
    // 后端接口基础地址（可根据环境切换）
    baseURL: 'http://localhost:8080',
    // baseURL: 'http://154.8.237.182:8080', // 测试环境（注释/取消注释切换）
    // 请求超时时间（毫秒）
    timeout: 5000
}

// 可选：扩展其他配置（如接口路径、请求头）
export const API_PATH = {
    repay: '/demo/api/repay' // 还款计算接口基础路径
}