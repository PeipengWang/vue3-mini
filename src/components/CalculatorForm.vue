<template>
  <el-card shadow="hover" header="还款计算器">
    <!-- 表单容器 -->
    <el-form :model="form" label-width="120px" ref="formRef">
      <!-- 原有基础参数 -->
      <el-form-item label="贷款总额（元）" prop="loanTotal">
        <el-input
            v-model.number="form.loanTotal"
            type="number"
            step="0.01"
            placeholder="请输入贷款总额，如1000000"
        />
      </el-form-item>

      <el-form-item label="年利率（%）" prop="annualRate">
        <el-input
            v-model.number="form.annualRate"
            type="number"
            step="0.01"
            placeholder="请输入年利率，如4.9"
        />
      </el-form-item>

      <el-form-item label="还款年限" prop="years">
        <el-input
            v-model.number="form.years"
            type="number"
            min="1"
            placeholder="请输入还款年限，如30"
        />
      </el-form-item>

      <!-- 新增：保留不还的本金金额 -->
      <el-form-item label="保留本金（元）" prop="reservedPrincipal">
        <el-input
            v-model.number="form.reservedPrincipal"
            type="number"
            step="0.01"
            min="0"
            placeholder="请输入保留不还的本金金额，如10000（填0则不保留）"
        />
      </el-form-item>

      <!-- 新增：周期性提前还款设置 -->
      <el-form-item label="周期性提前还款">
        <!-- 外层容器：消除默认间距，确保一行展示 -->
        <div style="margin-left: 0; width: calc(100% - 120px); display: flex; align-items: center; gap: 8px; flex-wrap: nowrap;">
          <!-- 开始月份 -->
          <div style="display: flex; align-items: center;">
            <span>从第</span>
            <el-input
                v-model.number="form.periodicRepay.startMonth"
                type="number"
                min="1"
                placeholder="1"
                style="width: 60px; margin: 0 6px;"
                size="small"
            />
            <span>月</span>
          </div>

          <!-- 结束月份 -->
          <div style="display: flex; align-items: center;">
            <span>到第</span>
            <el-input
                v-model.number="form.periodicRepay.endMonth"
                type="number"
                min="1"
                placeholder="360"
                style="width: 60px; margin: 0 6px;"
                size="small"
            />
            <span>月</span>
          </div>

          <!-- 周期月数 -->
          <div style="display: flex; align-items: center;">
            <span>每隔</span>
            <el-input
                v-model.number="form.periodicRepay.cycleMonths"
                type="number"
                min="1"
                placeholder="6"
                style="width: 60px; margin: 0 6px;"
                size="small"
            />
            <span>个月</span>
          </div>

          <!-- 还款金额 -->
          <div style="display: flex; align-items: center; flex: 1; min-width: 150px;">
            <span>每次还</span>
            <el-input
                v-model.number="form.periodicRepay.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="50000"
                style="width: 100px; margin: 0 6px;"
                size="small"
            />
            <span>元</span>
          </div>

          <!-- 添加按钮 -->
          <el-button
              type="primary"
              size="small"
              @click="addPeriodicRepay"
              :disabled="!form.periodicRepay.startMonth || !form.periodicRepay.endMonth || !form.periodicRepay.cycleMonths || !form.periodicRepay.amount"
              style="flex-shrink: 0;"
          >
            添加周期还款
          </el-button>
        </div>
      </el-form-item>

      <!-- 原有一次性提前还款（保留） -->
      <el-form-item label="一次性提前还款">
        <el-button type="primary" size="small" @click="addPrepayment">添加单次还款</el-button>
      </el-form-item>

      <!-- 一次性提前还款表格（保留） -->
      <el-form-item>
        <el-table
            :data="form.prepayments"
            border
            style="width: calc(100% - 120px); margin-left: 120px; max-width: 800px;"
        >
          <el-table-column label="月数">
            <template #default="scope">
              <el-input
                  v-model.number="scope.row.month"
                  type="number"
                  min="1"
                  max="12"
                  size="small"
                  placeholder="如1"
              />
            </template>
          </el-table-column>
          <el-table-column label="还款金额（元）">
            <template #default="scope">
              <el-input
                  v-model.number="scope.row.amount"
                  type="number"
                  step="0.01"
                  size="small"
                  placeholder="如50000"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                  type="danger"
                  size="small"
                  @click="deletePrepayment(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <!-- 周期性提前还款表格（新增） -->
      <el-form-item label="已添加周期还款">
        <el-table
            :data="form.periodicRepayList"
            border
            style="width: calc(100% - 120px); margin-left: 120px; max-width: 800px;"
        >
          <el-table-column label="周期（月）" width="120">
            <template #default="scope">
              {{ scope.row.cycleMonths.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }} 个月
            </template>
          </el-table-column>
          <el-table-column label="每次还款金额（元）" width="180">
            <template #default="scope">
              {{ scope.row.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button
                  type="danger"
                  size="small"
                  @click="deletePeriodicRepay(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="handleCalculate" style="margin-left: 120px;">
          计算还款明细
        </el-button>
        <el-button @click="handleReset" style="margin-left: 10px;">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'

// 定义事件：向父组件传递计算参数
const emit = defineEmits(['calculate', 'reset'])  //声明组件会 emit 哪些事件

// 表单校验规则（可选，Element Plus 自带）
const formRef = ref(null)
// 扩展表单数据：新增周期性提前还款、保留本金
const form = reactive({
  loanTotal: '',          // 贷款总额
  annualRate: '',         // 年利率
  years: '',              // 还款年限
  reservedPrincipal: 0,   // 保留不还的本金（默认0）
  periodicRepay: {        // 临时输入的周期还款
    startMonth: '',       //周期性还款开始月份
    endMonth:   '',       //周期性还款结束月份
    cycleMonths: '',     // 周期月数
    amount: ''            // 周期还款金额
  },
  periodicRepayList: [],  // 已添加的周期还款列表
  prepayments: []         // 原有一次性提前还款列表
})

// 原有：添加一次性提前还款行
const addPrepayment = () => {
  form.prepayments.push({ month: '', amount: '' })
}

// 原有：删除一次性提前还款行
const deletePrepayment = (index) => {
  form.prepayments.splice(index, 1)
}

// 新增：添加周期性提前还款
const addPeriodicRepay = () => {
  debugger;
  const { cycleMonths, amount } = form.periodicRepay
  // 基础校验
  if (!cycleMonths || !amount) {
    ElMessage.error('请填写周期月数和还款金额')
    return
  }
  if (Number(cycleMonths) < 1 || Number(amount) <= 0) {
    ElMessage.error('周期月数需≥1，还款金额需＞0')
    return
  }
  // 添加到列表
  form.periodicRepayList.push({
    startMonth: Number(form.periodicRepay.startMonth),
    endMonth: Number(form.periodicRepay.endMonth),
    cycleMonths: Number(cycleMonths),
    amount: Number(amount)
  })
  // 清空临时输入框
  form.periodicRepay.periodMonths = ''
  form.periodicRepay.amount = ''
  ElMessage.success('周期还款规则添加成功')
}

// 新增：删除周期性提前还款
const deletePeriodicRepay = (index) => {
  form.periodicRepayList.splice(index, 1)
}

// 重置表单（扩展：清空新增字段）
const handleReset = () => {
  form.loanTotal = ''
  form.annualRate = ''
  form.years = ''
  form.reservedPrincipal = 0
  form.periodicRepay.periodMonths = ''
  form.periodicRepay.amount = ''
  form.periodicRepayList = []
  form.prepayments = []
  emit('reset')
}

// 提交计算（扩展：传递新增参数）
const handleCalculate = () => {
  // 基础校验（原有）
  if (!form.loanTotal || !form.annualRate || !form.years) {
    ElMessage.error('请填写必填项：贷款总额、年利率、还款年限')
    return
  }
  const loanTotalNum = Number(form.loanTotal)
  const annualRateNum = Number(form.annualRate)
  const yearsNum = Number(form.years)
  const reservedPrincipalNum = Number(form.reservedPrincipal)
  if (loanTotalNum <= 0 || annualRateNum <= 0 || yearsNum <= 0) {
    ElMessage.error('贷款总额、年利率、还款年限必须大于0')
    return
  }
  // 校验保留本金（不能超过贷款总额）
  if (reservedPrincipalNum < 0 || reservedPrincipalNum >= loanTotalNum) {
    ElMessage.error(`保留本金需≥0且＜贷款总额（${loanTotalNum}元）`)
    return
  }

  // 整理参数：原有一次性提前还款 + 新增周期还款 + 保留本金
  const params = {
    loanTotal: loanTotalNum,                // 贷款总额
    annualRate: annualRateNum,              // 年利率
    years: yearsNum,                        // 还款年限
    reservedPrincipal: reservedPrincipalNum,// 保留不还的本金
    prepayments: form.prepayments.filter(item => item.month && item.amount)
        .map(item => ({
          month: Number(item.month),
          amount: Number(item.amount),
          year: 0 // 原有字段保留，后端兼容
        })),
    periodicRepayList: form.periodicRepayList // 周期性提前还款列表
  }

  // 向父组件传递完整参数
  emit('calculate', params)
}
</script>