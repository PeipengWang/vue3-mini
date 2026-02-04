<template>
  <div class="container">
    <!-- 第一层 Tab：核心功能分类（房贷计算/收益统计/支出计算） -->
    <el-tabs
        v-model="mainTab"
        type="card"
        style="margin-bottom: 16px;"
        @tab-change="handleMainTabChange"
    >
      <el-tab-pane label="房贷还款计算" name="repay-calc"></el-tab-pane>
      <el-tab-pane label="收益统计计算" name="income-calc"></el-tab-pane>
      <!-- 新增：必要支出&应急金计算 Tab -->
      <el-tab-pane label="必要支出&应急金计算" name="expense-calc"></el-tab-pane>
    </el-tabs>

    <!-- 1. 房贷还款计算模块（原有功能完整保留） -->
    <div v-if="mainTab === 'repay-calc'">
      <!-- 计算类型下拉选择框 -->
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

      <!-- 还款方式 Tab -->
      <el-tabs
          v-model="activeTab"
          type="card"
          @tab-change="handleTabChange"
          style="margin-bottom: 20px;"
      >
        <el-tab-pane label="等额本金" name="equal-principal">
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
      </el-tabs>

      <!-- 房贷计算结果 -->
      <CalculatorResult
          :summary="summary"
          :monthlyDetails="monthlyDetails"
          :yearlySummaries="yearlySummaries"
          :loading="loading"
          :showResult="showResult"
      />
    </div>

    <!-- 2. 收益统计计算模块（独立 Tab，不干扰原有功能） -->
    <div v-if="mainTab === 'income-calc'">
      <IncomeCalculator :visible="true" />
    </div>

    <!-- 新增：3. 必要支出&应急金计算模块 -->
    <div v-if="mainTab === 'expense-calc'">
      <ExpenseCalculator :visible="true" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import CalculatorForm from './components/CalculatorForm.vue'
import CalculatorResult from './components/CalculatorResult.vue'
// 新增：导入支出计算组件
import ExpenseCalculator from './components/ExpenseCalculator.vue'
// 保留：导入收益统计组件
import IncomeCalculator from './components/IncomeCalculator.vue'
// 导入配置（保留原有逻辑）
import { CONFIG, API_PATH } from './config/api.config.js'

// ========== 核心功能 Tab 控制（新增支出计算 Tab） ==========
const mainTab = ref('repay-calc') // 默认显示房贷计算

// ========== 原有房贷计算相关变量 ==========
const calcType = ref('normal')
const showPrepaymentForm = computed(() => {
  return calcType.value === 'prepayment'
})
const activeTab = ref('equal-principal')

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

// ========== 事件处理函数 ==========
// 优化：切换核心功能 Tab 时重置对应模块结果
const handleMainTabChange = (tabName) => {
  // 切换到房贷 Tab 时重置房贷结果
  if (tabName === 'repay-calc') {
    handleReset()
  }
  // 切换到收益/支出 Tab 时无需重置（保留用户输入）
}

// 原有：计算类型切换
const handleCalcTypeChange = () => {
  handleReset()
}

// 原有：重置房贷计算结果
const handleReset = () => {
  showResult.value = false
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

// 原有：切换还款方式 Tab
const handleTabChange = () => {
  handleReset()
}

// 原有：原生 AJAX 请求
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

// 原有：处理房贷计算请求
const handleCalculate = (params) => {
  loading.value = true
  let apiPath = ''
  switch (activeTab.value) {
    case 'equal-principal':
      apiPath = 'equal-principal'
      break
    case 'equal-interest':
      apiPath = 'equal-interest'
      break
    default:
      apiPath = 'equal-principal'
  }
  const fullUrl = `${CONFIG.baseURL}${API_PATH.repay}/${apiPath}`

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

/* Tab 样式优化 */
:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__content) {
  padding: 0;
}

/* 下拉框样式 */
:deep(.el-select) {
  --el-select-input-height: 32px;
}

/* 核心功能 Tab 样式区分 */
:deep(.el-tabs--card.el-tabs__header .el-tabs__item:first-child) {
  margin-left: 0;
}

/* 新增：多个核心Tab时的宽度适配 */
:deep(.el-tabs--card .el-tabs__item) {
  padding: 0 20px;
}

/* 响应式适配：小屏幕下核心Tab换行 */
@media (max-width: 768px) {
  :deep(.el-tabs--card .el-tabs__nav) {
    flex-wrap: wrap;
  }
  :deep(.el-tabs--card .el-tabs__item) {
    margin-bottom: 8px;
    flex: 1 1 auto;
    text-align: center;
  }
}
</style>