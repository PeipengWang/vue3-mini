<template>
  <div class="container">
    <!-- 提示框 -->
    <div class="alert alert-error" v-show="alertShow.error">{{ alertMsg.error }}</div>
    <div class="alert alert-success" v-show="alertShow.success">{{ alertMsg.success }}</div>

    <!-- 输入表单卡片 -->
    <div class="card">
      <div class="card-title">等额本金还款计算器</div>
      <div class="form-item">
        <label>贷款总额（元）：</label>
        <input
            type="number"
            step="0.01"
            class="form-control"
            v-model.number="form.loanTotal"
            placeholder="请输入贷款总额，如1000000"
        >
      </div>
      <div class="form-item">
        <label>年利率（%）：</label>
        <input
            type="number"
            step="0.01"
            class="form-control"
            v-model.number="form.annualRate"
            placeholder="请输入年利率，如4.9"
        >
      </div>
      <div class="form-item">
        <label>还款年限：</label>
        <input
            type="number"
            min="1"
            class="form-control"
            v-model.number="form.years"
            placeholder="请输入还款年限，如30"
        >
      </div>
      <div class="form-item">
        <label>提前还款信息：</label>
        <button class="btn btn-primary btn-sm" @click="addPrepayment">添加提前还款</button>
      </div>
      <div class="prepay-table">
        <table>
          <thead>
          <tr>
            <th>年份</th>
            <th>月份</th>
            <th>还款金额（元）</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <!-- 提前还款行动态生成 -->
          <tr v-for="(item, index) in form.prepayments" :key="index">
            <td>
              <input
                  type="number"
                  class="form-control"
                  v-model.number="item.year"
                  placeholder="如2026"
              >
            </td>
            <td>
              <input
                  type="number"
                  min="1"
                  max="12"
                  class="form-control"
                  v-model.number="item.month"
                  placeholder="如1"
              >
            </td>
            <td>
              <input
                  type="number"
                  step="0.01"
                  class="form-control"
                  v-model.number="item.amount"
                  placeholder="如50000"
              >
            </td>
            <td>
              <button class="btn btn-danger btn-sm" @click="deletePrepayment(index)">删除</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="btn-group">
        <button class="btn btn-primary" @click="calculate">计算还款明细</button>
        <button class="btn btn-default" @click="resetForm">重置</button>
      </div>
    </div>

    <!-- 结果展示卡片 -->
    <div class="card result-card" v-show="resultShow">
      <div class="card-title">还款计算结果</div>
      <!-- 总计信息 -->
      <div class="desc-list">
        <div class="desc-item">
          <label>贷款总额</label>
          <div class="value">{{ formatMoney(summary.loanTotal) }} 元</div>
        </div>
        <div class="desc-item">
          <label>还款总年限</label>
          <div class="value">{{ summary.years }} 年（{{ summary.totalMonths }} 个月）</div>
        </div>
        <div class="desc-item">
          <label>总还款本金</label>
          <div class="value">{{ formatMoney(summary.totalAllPrincipal) }} 元</div>
        </div>
        <div class="desc-item">
          <label>总还款利息</label>
          <div class="value">{{ formatMoney(summary.totalAllInterest) }} 元</div>
        </div>
        <div class="desc-item">
          <label>总还款金额</label>
          <div class="value total-value">{{ formatMoney(summary.totalAllRepay) }} 元</div>
        </div>
      </div>

      <!-- 标签页：月度/年度明细 -->
      <div class="tab-container">
        <div class="tab-header">
          <div
              class="tab-item"
              :class="{ active: activeTab === 'monthly' }"
              @click="activeTab = 'monthly'"
          >
            月度还款明细
          </div>
          <div
              class="tab-item"
              :class="{ active: activeTab === 'yearly' }"
              @click="activeTab = 'yearly'"
          >
            年度还款汇总
          </div>
        </div>
        <div class="tab-content">
          <div class="tab-panel" :class="{ active: activeTab === 'monthly' }">
            <div class="loading" v-show="loading">加载中...</div>
            <div class="table-container" v-show="!loading">
              <table>
                <thead>
                <tr>
                  <th>还款月份</th>
                  <th>当月本金（元）</th>
                  <th>当月利息（元）</th>
                  <th>当月还款总额（元）</th>
                  <th>剩余本金（元）</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in monthlyDetails" :key="index">
                  <td>{{ item.month }}</td>
                  <td>{{ formatMoney(item.monthlyPrincipal) }}</td>
                  <td>{{ formatMoney(item.monthlyInterest) }}</td>
                  <td>{{ formatMoney(item.monthlyRepay) }}</td>
                  <td>{{ formatMoney(item.remainingPrincipal) }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="tab-panel" :class="{ active: activeTab === 'yearly' }">
            <div class="loading" v-show="loading">加载中...</div>
            <div class="table-container" v-show="!loading">
              <table>
                <thead>
                <tr>
                  <th>还款年度</th>
                  <th>当年本金（元）</th>
                  <th>当年利息（元）</th>
                  <th>当年还款总额（元）</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in yearlySummaries" :key="index">
                  <td>{{ item.year }}</td>
                  <td>{{ formatMoney(item.yearPrincipal) }}</td>
                  <td>{{ formatMoney(item.yearInterest) }}</td>
                  <td>{{ formatMoney(item.yearTotalRepay) }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 全局配置
const CONFIG = {
  baseURL: 'http://localhost:8080', // 替换为你的后端接口地址
  timeout: 5000
}

// 表单数据
const form = reactive({
  loanTotal: '', // 贷款总额
  annualRate: '', // 年利率
  years: '', // 还款年限
  prepayments: [], // 提前还款列表
  reservedPrincipalNum: ''
})

// 结果数据
const summary = reactive({
  loanTotal: '-',
  years: '-',
  totalMonths: '-',
  totalAllPrincipal: '-',
  totalAllInterest: '-',
  totalAllRepay: '-'
})
const monthlyDetails = ref([]) // 月度明细
const yearlySummaries = ref([]) // 年度汇总
const resultShow = ref(false) // 是否显示结果卡片
const activeTab = ref('monthly') // 激活的标签页
const loading = ref(false) // 加载状态

// 提示框
const alertMsg = reactive({
  error: '',
  success: ''
})
const alertShow = reactive({
  error: false,
  success: false
})

// 显示提示框
const showAlert = (type, message) => {
  alertMsg[type] = message
  alertShow[type] = true
  setTimeout(() => {
    alertShow[type] = false
  }, 3000)
}

// 金额格式化
const formatMoney = (num) => {
  if (!num || isNaN(num)) return '0.00'
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 添加提前还款行
const addPrepayment = () => {
  form.prepayments.push({
    year: '',
    month: '',
    amount: ''
  })
}

// 删除提前还款行
const deletePrepayment = (index) => {
  form.prepayments.splice(index, 1)
}

// 重置表单
const resetForm = () => {
  form.loanTotal = ''
  form.annualRate = ''
  form.years = ''
  form.prepayments = []
  resultShow.value = false
}

// 原生AJAX请求（替代Axios）
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

  xhr.onerror = function() {
    error('网络请求异常，请检查后端服务是否启动')
  }

  xhr.ontimeout = function() {
    error('请求超时，请重试')
  }

  xhr.send(JSON.stringify(data))
}

// 提交计算
const calculate = () => {
  // 基础校验
  if (!form.loanTotal || !form.annualRate || !form.years) {
    showAlert('error', '请填写必填项：贷款总额、年利率、还款年限')
    return
  }

  const loanTotalNum = Number(form.loanTotal)
  const annualRateNum = Number(form.annualRate)
  const yearsNum = Number(form.years)
  const reservedPrincipalNum = Number(form.reservedPrincipal)
  if (loanTotalNum <= 0 || annualRateNum <= 0 || yearsNum <= 0) {
    showAlert('error', '贷款总额、年利率、还款年限必须大于0')
    return
  }

  // 过滤空的提前还款数据
  const validPrepayments = form.prepayments.filter(item => {
    return item.year && item.month && item.amount
  }).map(item => {
    return {
      year: Number(item.year),
      month: Number(item.month),
      amount: Number(item.amount)
    }
  })

  // 构造请求参数
  const requestParams = {
    loanTotal: loanTotalNum,
    annualRate: annualRateNum,
    years: yearsNum,
    prepayments: validPrepayments
  }

  // 显示加载
  loading.value = true

  // 发送请求
  requestPost(
      `${CONFIG.baseURL}/demo/api/repay/equal-principal`,
      requestParams,
      function(res) {
        // 隐藏加载
        loading.value = false

        // 渲染结果
        Object.assign(summary, res)
        monthlyDetails.value = res.monthlyDetails || []
        yearlySummaries.value = res.yearSummaries || []

        // 显示结果卡片
        resultShow.value = true
        showAlert('success', '计算成功！')
      },
      function(errMsg) {
        // 隐藏加载
        loading.value = false
        showAlert('error', errMsg)
        console.error('计算失败：', errMsg)
      }
  )
}
</script>

<style scoped>
/* 原有样式全部保留，仅去掉全局 * 选择器的 scoped 冲突（用 :global 包裹） */
:global(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}
:global(body) {
  background-color: #f5f5f5;
  padding: 20px;
}
:global(.container) {
  max-width: 1200px;
  margin: 0 auto;
}
:global(.card) {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}
:global(.card-title) {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  border-bottom: 1px solid #e6e6e6;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
:global(.form-item) {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}
:global(.form-item label) {
  width: 120px;
  text-align: right;
  padding-right: 10px;
  color: #606266;
}
:global(.form-control) {
  flex: 1;
  max-width: 400px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}
:global(.form-control:focus) {
  border-color: #409eff;
}
:global(.btn) {
  display: inline-block;
  height: 36px;
  padding: 0 15px;
  line-height: 36px;
  text-align: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
:global(.btn-primary) {
  background-color: #409eff;
  color: #fff;
}
:global(.btn-primary:hover) {
  background-color: #66b1ff;
}
:global(.btn-default) {
  background-color: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
  margin-left: 10px;
}
:global(.btn-default:hover) {
  background-color: #f5f7fa;
}
:global(.btn-sm) {
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  font-size: 12px;
}
:global(.btn-danger) {
  background-color: #f56c6c;
  color: #fff;
}
:global(.btn-danger:hover) {
  background-color: #f78989;
}
:global(.btn-group) {
  margin-left: 130px;
  margin-top: 20px;
}
:global(table) {
  border-collapse: collapse;
  width: 100%;
  margin-top: 10px;
}
:global(table, th, td) {
  border: 1px solid #e6e6e6;
}
:global(th, td) {
  padding: 8px 10px;
  text-align: left;
}
:global(th) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: normal;
}
:global(.prepay-table) {
  margin-left: 130px;
  width: calc(100% - 130px);
  max-width: 800px;
}
:global(.result-card) {
  display: none;
}
:global(.desc-list) {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}
:global(.desc-item) {
  width: 25%;
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
  border-right: 1px solid #e6e6e6;
}
:global(.desc-item:nth-child(4n)) {
  border-right: none;
}
:global(.desc-item:last-child) {
  width: 100%;
  border-right: none;
}
:global(.desc-item label) {
  color: #606266;
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
}
:global(.desc-item .value) {
  color: #303133;
  font-size: 16px;
}
:global(.desc-item .total-value) {
  color: #e6a23c;
  font-weight: bold;
  font-size: 18px;
}
:global(.tab-container) {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}
:global(.tab-header) {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e6e6e6;
}
:global(.tab-item) {
  padding: 10px 20px;
  cursor: pointer;
  border-right: 1px solid #e6e6e6;
}
:global(.tab-item.active) {
  background-color: #fff;
  color: #409eff;
  font-weight: bold;
}
:global(.tab-content) {
  padding: 10px;
}
:global(.tab-panel) {
  display: none;
}
:global(.tab-panel.active) {
  display: block;
}
:global(.table-container) {
  height: 400px;
  overflow-y: auto;
  margin-top: 10px;
}
:global(.loading) {
  text-align: center;
  padding: 20px;
  color: #606266;
  display: none;
}
:global(.loading.show) {
  display: block;
}
:global(.alert) {
  padding: 10px 15px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 14px;
  display: none;
}
:global(.alert-error) {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}
:global(.alert-success) {
  background-color: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3e19d;
}
:global(.alert.show) {
  display: block;
}
</style>