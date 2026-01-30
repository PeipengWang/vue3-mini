<template>
  <el-card shadow="hover" header="还款计算器">
    <!-- 表单容器 -->
    <el-form :model="form" label-width="120px" ref="formRef">
      <!-- 基础参数 -->
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

      <!-- 保留不还的本金金额 -->
      <el-form-item label="保留本金（元）" prop="reservedPrincipal">
        <el-input
            v-model.number="form.reservedPrincipal"
            type="number"
            step="0.01"
            min="0"
            placeholder="请输入保留不还的本金金额，如10000（填0则不保留）"
        />
      </el-form-item>

      <!-- 引入拆分后的提前还款子组件 -->
      <PrepaymentSection
          v-model:prepayments="form.prepayments"
          v-model:periodicRepayList="form.periodicRepayList"
          @reset="handlePrepaymentReset"
      />

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
import { reactive, ref, defineEmits, ref as vueRef } from 'vue'
import { ElMessage } from 'element-plus'
// 引入拆分后的提前还款子组件
import PrepaymentSection from './PrepaymentSection.vue'

// 定义事件：向父组件传递计算参数
const emit = defineEmits(['calculate', 'reset'])

// 表单ref
const formRef = ref(null)
// 提前还款子组件ref（用于调用其内部方法）
const prepaymentSectionRef = vueRef(null)

// 表单数据（仅保留基础参数 + 提前还款列表）
const form = reactive({
  loanTotal: '',          // 贷款总额
  annualRate: '',         // 年利率
  years: '',              // 还款年限
  reservedPrincipal: 0,   // 保留不还的本金（默认0）
  prepayments: [],        // 一次性提前还款列表（双向绑定子组件）
  periodicRepayList: []   // 周期性提前还款列表（双向绑定子组件）
})

// 重置表单
const handleReset = () => {
  // 重置基础参数
  form.loanTotal = ''
  form.annualRate = ''
  form.years = ''
  form.reservedPrincipal = 0
  // 调用子组件的重置方法
  if (prepaymentSectionRef.value) {
    prepaymentSectionRef.value.resetPrepayment()
  }
  emit('reset')
}

// 处理提前还款子组件的重置事件（可选）
const handlePrepaymentReset = () => {
  // 可在这里添加额外的重置逻辑
}

// 提交计算
const handleCalculate = () => {
  // 基础校验
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
  if (reservedPrincipalNum < 0 || reservedPrincipalNum >= loanTotalNum) {
    ElMessage.error(`保留本金需≥0且＜贷款总额（${loanTotalNum}元）`)
    return
  }

  // 整理参数
  const params = {
    loanTotal: loanTotalNum,
    annualRate: annualRateNum,
    years: yearsNum,
    reservedPrincipal: reservedPrincipalNum,
    // 一次性提前还款（过滤空数据）
    prepayments: form.prepayments.filter(item => item.month && item.amount)
        .map(item => ({
          month: Number(item.month),
          amount: Number(item.amount),
          year: 0 // 兼容原有后端字段
        })),
    // 周期性提前还款
    periodicRepayList: form.periodicRepayList
  }

  // 向父组件传递参数
  emit('calculate', params)
}
</script>

<style scoped>
/* 原有样式保留 */
</style>