<template>
  <div class="container">
    <!-- 提示框：Element Plus 自带的 Message 已替代原生 alert -->
    <!-- 表单组件 -->
    <CalculatorForm
        @calculate="handleCalculate"
        @reset="handleReset"
    />
    <!-- 结果组件 -->
    <CalculatorResult
        :summary="summary"
        :monthlyDetails="monthlyDetails"
        :yearlySummaries="yearlySummaries"
        :loading="loading"
        :showResult="showResult"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CalculatorForm from './components/CalculatorForm.vue'
import CalculatorResult from './components/CalculatorResult.vue'

// 全局配置
const CONFIG = {
  baseURL: 'http://localhost:8080',
  // baseURL: 'http://154.8.237.182:8080',
  timeout: 5000
}

// 结果数据
const summary = reactive({
  loanTotal: '-',
  years: '-',
  totalMonths: '-',
  totalAllPrincipal: '-',
  totalAllInterest: '-',
  totalAllRepay: '-'
})
const monthlyDetails = ref([])
const yearlySummaries = ref([])
const loading = ref(false)
const showResult = ref(false)

// 重置结果
const handleReset = () => {
  showResult.value = false
}

// 原生 AJAX 请求（可替换为 Axios，需安装：npm install axios）
const requestPost = (url, data, success, error) => {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8')
  xhr.timeout = CONFIG.timeout

  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const res = JSON.parse(xhr.responseText)
        success(res)
      } catch (e) {
        error('返回数据格式错误：' + e.message)
      }
    } else {
      error(`请求失败：${xhr.status} ${xhr.statusText}`)
    }
  }

  xhr.onerror = () => error('网络请求异常，请检查后端服务是否启动')
  xhr.ontimeout = () => error('请求超时，请重试')
  xhr.send(JSON.stringify(data))
}

// 处理计算请求
const handleCalculate = (params) => {
  loading.value = true
  // 发送请求
  requestPost(
      `${CONFIG.baseURL}/demo/api/repay/equal-principal`,
      params,
      (res) => {
        loading.value = false
        Object.assign(summary, res)
        monthlyDetails.value = res.monthlyDetails || []
        yearlySummaries.value = res.yearSummaries || []
        showResult.value = true
        ElMessage.success('计算成功！')
      },
      (errMsg) => {
        loading.value = false
        ElMessage.error(errMsg)
        console.error('计算失败：', errMsg)
      }
  )
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>