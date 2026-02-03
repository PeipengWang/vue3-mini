<!--<template>-->
<!--  <div class="container">-->
<!--    &lt;!&ndash; 还款方式 Tab 切换 &ndash;&gt;-->
<!--    <el-tabs-->
<!--        v-model="activeTab"-->
<!--        type="card"-->
<!--        @tab-change="handleTabChange"-->
<!--        class="tab-container"-->
<!--    >-->
<!--      <el-tab-pane label="等额本金" name="equal-principal" />-->
<!--      <el-tab-pane label="等额本息" name="equal-interest" />-->
<!--    </el-tabs>-->

<!--    &lt;!&ndash; 计算器表单组件（透传提前还款显隐属性） &ndash;&gt;-->
<!--    <CalculatorForm-->
<!--        :visible-prepayment="showPrepayment"-->
<!--        @calculate="handleCalculate"-->
<!--        @reset="handleReset"-->
<!--    />-->

<!--    &lt;!&ndash; 还款结果展示组件 &ndash;&gt;-->
<!--    <CalculatorResult-->
<!--        :summary="summary"-->
<!--        :monthlyDetails="monthlyDetails"-->
<!--        :yearlySummaries="yearlySummaries"-->
<!--        :loading="loading"-->
<!--        :showResult="showResult"-->
<!--    />-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { ref, reactive } from 'vue'-->
<!--import { ElMessage } from 'element-plus'-->
<!--// 引入子组件（路径根据实际结构调整）-->
<!--import CalculatorForm from '../components/CalculatorForm.vue'-->
<!--import CalculatorResult from '../components/CalculatorResult.vue'-->

<!--// 全局配置：后端接口地址-->
<!--const CONFIG = {-->
<!--  baseURL: 'http://localhost:8080', // 本地后端地址-->
<!--  // baseURL: 'http://154.8.237.182:8080', // 测试环境地址-->
<!--  timeout: 5000 // 请求超时时间-->
<!--}-->

<!--// 1. 响应式状态管理-->
<!--// 当前激活的 Tab（默认等额本金）-->
<!--const activeTab = ref('equal-principal')-->
<!--// 控制提前还款模块显隐（仅等额本金显示）-->
<!--const showPrepayment = ref(activeTab.value === 'equal-principal')-->
<!--// 加载状态-->
<!--const loading = ref(false)-->
<!--// 是否显示计算结果-->
<!--const showResult = ref(false)-->

<!--// 计算结果数据-->
<!--const summary = reactive({-->
<!--  loanTotal: '-',-->
<!--  years: '-',-->
<!--  totalMonths: '-',-->
<!--  totalAllPrincipal: '-',-->
<!--  totalAllInterest: '-',-->
<!--  totalAllRepay: '-'-->
<!--})-->
<!--const monthlyDetails = ref([]) // 月度还款明细-->
<!--const yearlySummaries = ref([]) // 年度还款汇总-->

<!--// 2. Tab 切换处理-->
<!--const handleTabChange = () => {-->
<!--  // 切换 Tab 时重置结果和提前还款显隐-->
<!--  handleReset()-->
<!--  showPrepayment.value = activeTab.value === 'equal-principal'-->
<!--}-->

<!--// 3. 重置结果-->
<!--const handleReset = () => {-->
<!--  showResult.value = false-->
<!--  // 可选：清空结果数据（避免切换后残留旧数据）-->
<!--  Object.assign(summary, {-->
<!--    loanTotal: '-',-->
<!--    years: '-',-->
<!--    totalMonths: '-',-->
<!--    totalAllPrincipal: '-',-->
<!--    totalAllInterest: '-',-->
<!--    totalAllRepay: '-'-->
<!--  })-->
<!--  monthlyDetails.value = []-->
<!--  yearlySummaries.value = []-->
<!--}-->

<!--// 4. 封装 POST 请求-->
<!--const requestPost = (url, data, success, error) => {-->
<!--  const xhr = new XMLHttpRequest()-->
<!--  xhr.open('POST', url, true)-->
<!--  xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8')-->
<!--  xhr.timeout = CONFIG.timeout-->

<!--  // 请求成功处理-->
<!--  xhr.onload = function () {-->
<!--    if (xhr.status >= 200 && xhr.status < 300) {-->
<!--      try {-->
<!--        const res = JSON.parse(xhr.responseText)-->
<!--        success(res)-->
<!--      } catch (e) {-->
<!--        error('返回数据格式错误：' + e.message)-->
<!--      }-->
<!--    } else {-->
<!--      error(`请求失败：${xhr.status} ${xhr.statusText}`)-->
<!--    }-->
<!--  }-->

<!--  // 请求异常/超时处理-->
<!--  xhr.onerror = () => error('网络请求异常，请检查后端服务是否启动')-->
<!--  xhr.ontimeout = () => error('请求超时，请重试')-->

<!--  // 发送请求-->
<!--  xhr.send(JSON.stringify(data))-->
<!--}-->

<!--// 5. 处理计算请求（接收表单组件的参数）-->
<!--const handleCalculate = (params) => {-->
<!--  loading.value = true-->

<!--  // 根据当前 Tab 拼接接口路径-->
<!--  let apiPath = ''-->
<!--  switch (activeTab.value) {-->
<!--    case 'equal-principal':-->
<!--      apiPath = 'equal-principal' // 等额本金接口-->
<!--      break-->
<!--    case 'equal-interest':-->
<!--      apiPath = 'equal-interest' // 等额本息接口-->
<!--      break-->
<!--    default:-->
<!--      apiPath = 'equal-principal'-->
<!--  }-->

<!--  // 发起请求-->
<!--  requestPost(-->
<!--      `${CONFIG.baseURL}/demo/api/repay/${apiPath}`,-->
<!--      params,-->
<!--      // 请求成功回调-->
<!--      (res) => {-->
<!--        loading.value = false-->
<!--        // 更新结果数据-->
<!--        Object.assign(summary, res)-->
<!--        monthlyDetails.value = res.monthlyDetails || []-->
<!--        yearlySummaries.value = res.yearSummaries || []-->
<!--        showResult.value = true-->
<!--        ElMessage.success('计算成功！')-->
<!--      },-->
<!--      // 请求失败回调-->
<!--      (errMsg) => {-->
<!--        loading.value = false-->
<!--        ElMessage.error(errMsg)-->
<!--        console.error('计算失败：', errMsg)-->
<!--      }-->
<!--  )-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--/* 页面容器样式 */-->
<!--.container {-->
<!--  max-width: 1200px;-->
<!--  margin: 0 auto;-->
<!--  padding: 0 20px;-->
<!--}-->

<!--/* Tab 组件样式调整 */-->
<!--.tab-container {-->
<!--  margin-bottom: 20px;-->
<!--}-->

<!--/* 穿透 Element Plus 样式，统一视觉 */-->
<!--:deep(.el-tabs__header) {-->
<!--  margin: 0 0 20px 0;-->
<!--}-->

<!--:deep(.el-tabs__content) {-->
<!--  padding: 0;-->
<!--}-->

<!--:deep(.el-card) {-->
<!--  margin-bottom: 20px;-->
<!--}-->
<!--</style>-->