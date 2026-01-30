<template>
  <div class="container">
    <!-- Element Plus 多 Tab 组件 -->
    <el-tabs
        v-model="activeTab"
        type="card"
        @tab-change="handleTabChange"
        style="margin-bottom: 20px;"
    >
      <el-tab-pane label="等额本金" name="equal-principal">
        <!-- 表单组件：不同 Tab 复用同一个表单，仅调整请求接口 -->
        <CalculatorForm
            @calculate="handleCalculate"
            @reset="handleReset"
        />
      </el-tab-pane>
      <el-tab-pane label="等额本息" name="equal-interest">
        <CalculatorForm
            @calculate="handleCalculate"
            @reset="handleReset"
        />
      </el-tab-pane>
      <!-- 可扩展更多 Tab，比如“先息后本” -->
      <!-- <el-tab-pane label="先息后本" name="interest-first">
        <CalculatorForm
          @calculate="handleCalculate"
          @reset="handleReset"
        />
      </el-tab-pane> -->
    </el-tabs>

    <!-- 结果组件：所有 Tab 共用一个结果展示区域 -->
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
// 确保已全局引入 Element Plus 的 ElMessage/ElTabs/ElTabPane，若未全局引入需单独导入
// import { ElMessage, ElTabs, ElTabPane } from 'element-plus'

// 全局配置
const CONFIG = {
  baseURL: 'http://localhost:8080',
  // baseURL: 'http://154.8.237.182:8080',
  timeout: 5000
}

// 绑定当前激活的 Tab（对应不同的还款方式）
const activeTab = ref('equal-principal') // 默认选中“等额本金”

// 结果数据（和原有逻辑一致）
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

// 重置结果（和原有逻辑一致）
const handleReset = () => {
  showResult.value = false
  // 可选：重置表单数据（如果需要）
  // 可通过给 CalculatorForm 传 ref，调用其内部的重置方法
}

// 切换 Tab 时重置结果展示
const handleTabChange = () => {
  handleReset() // 切换 Tab 清空之前的计算结果
}

// 原生 AJAX 请求（保留原有逻辑）
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

// 处理计算请求（核心改造：根据当前 Tab 动态切换接口）
const handleCalculate = (params) => {
  loading.value = true
  // 根据激活的 Tab 拼接不同的接口地址
  let apiPath = ''
  switch (activeTab.value) {
    case 'equal-principal':
      apiPath = 'equal-principal' // 等额本金接口
      break
    case 'equal-interest':
      apiPath = 'equal-interest' // 等额本息接口（需后端对应实现）
      break
      // case 'interest-first':
      //   apiPath = 'interest-first' // 先息后本接口（扩展用）
      //   break
    default:
      apiPath = 'equal-principal'
  }

  // 发送请求（动态接口地址）
  requestPost(
      `${CONFIG.baseURL}/demo/api/repay/${apiPath}`,
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

/* 可选：调整 Tab 样式，和页面更适配 */
:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__content) {
  padding: 0;
}
</style>