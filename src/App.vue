<template>
  <div class="container">
    <!-- 新增：计算类型下拉选择框 -->
    <div class="calc-type-selector" style="margin-bottom: 16px;">
      <span style="margin-right: 8px; font-weight: 500;">计算类型：</span>
      <el-select
          v-model="calcType"
          size="default"
          style="width: 200px;"
          @change="handleCalcTypeChange"
      >
        <el-option label="普通计算" value="normal" />
        <el-option label="提前还款计算" value="prepayment" />
      </el-select>
    </div>

    <!-- Element Plus 多 Tab 组件 -->
    <el-tabs
        v-model="activeTab"
        type="card"
        @tab-change="handleTabChange"
        style="margin-bottom: 20px;"
    >
      <el-tab-pane label="等额本金" name="equal-principal">
        <!-- 表单组件：新增 visible-prepayment 属性控制提前还款显隐 -->
        <CalculatorForm
            @calculate="handleCalculate"
            @reset="handleReset"
            :visible-prepayment="showPrepaymentForm"
        />
      </el-tab-pane>
      <el-tab-pane label="等额本息" name="equal-interest">
        <CalculatorForm
            @calculate="handleCalculate"
            @reset="handleReset"
            :visible-prepayment="showPrepaymentForm"
        />
      </el-tab-pane>
      <!-- 可扩展更多 Tab，比如“先息后本” -->
      <!-- <el-tab-pane label="先息后本" name="interest-first">
        <CalculatorForm
          @calculate="handleCalculate"
          @reset="handleReset"
          :visible-prepayment="showPrepaymentForm"
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
import { ref, reactive, computed } from 'vue'
import CalculatorForm from './components/CalculatorForm.vue'
import CalculatorResult from './components/CalculatorResult.vue'
// 新增：导入抽离后的配置（路径根据实际目录调整）
import { CONFIG, API_PATH } from './config/api.config.js'
// 已全局引入 Element Plus，无需重复导入 ElMessage/ElTabs 等

// 1. 新增：计算类型（默认普通计算）
const calcType = ref('normal') // normal:普通计算，prepayment:提前还款计算
// 2. 新增：计算提前还款表单显隐（计算类型为prepayment时显示）
const showPrepaymentForm = computed(() => {
  return calcType.value === 'prepayment'
})

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

// 新增：切换计算类型时重置结果和表单
const handleCalcTypeChange = () => {
  handleReset()
}

// 重置结果（扩展：清空结果数据）
const handleReset = () => {
  showResult.value = false
  // 清空结果数据，避免切换类型后残留
  Object.assign(summary, {
    loanTotal: '-',
    years: '-',
    totalMonths: '-',
    totalAllPrincipal: '-',
    totalAllInterest: '-',
    totalAllRepay: '-'
  })
  monthlyDetails.value = []
  yearlySummaries.value = []
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
  // 优化：用导入的 CONFIG + API_PATH 拼接（更易维护）
  const fullUrl = `${CONFIG.baseURL}${API_PATH.repay}/${apiPath}`
  // 原写法：`${CONFIG.baseURL}/demo/api/repay/${apiPath}`

  // 发送请求（动态接口地址）
  requestPost(
      fullUrl,
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

/* 计算类型选择器样式 */
.calc-type-selector {
  display: flex;
  align-items: center;
}

/* 可选：调整 Tab 样式，和页面更适配 */
:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__content) {
  padding: 0;
}

/* 调整下拉框样式，和页面更协调 */
:deep(.el-select) {
  --el-select-input-height: 32px;
}
</style>