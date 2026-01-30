<template>
  <el-card shadow="hover" header="房贷还款计算器">
    <!-- 表单容器 -->
    <el-form
        :model="form"
        label-width="120px"
        ref="formRef"
    >
      <!-- 基础贷款参数 - 贷款总额 -->
      <el-form-item label="贷款总额（元）" prop="loanTotal">
        <el-input
            v-model.number="form.loanTotal"
            type="number"
            step="0.01"
            placeholder="请输入贷款总额，如1000000"
        />
      </el-form-item>

      <!-- 基础贷款参数 - 年利率 -->
      <el-form-item label="年利率（%）" prop="annualRate">
        <el-input
            v-model.number="form.annualRate"
            type="number"
            step="0.01"
            placeholder="请输入年利率，如4.9"
        />
      </el-form-item>

      <!-- 基础贷款参数 - 还款年限 -->
      <el-form-item label="还款年限" prop="years">
        <el-input
            v-model.number="form.years"
            type="number"
            min="1"
            placeholder="请输入还款年限，如30"
        />
      </el-form-item>

      <!-- 基础贷款参数 - 保留本金 -->
      <el-form-item label="保留本金（元）" prop="reservedPrincipal">
        <el-input
            v-model.number="form.reservedPrincipal"
            type="number"
            step="0.01"
            min="0"
            placeholder="请输入保留不还的本金金额，如10000（填0则不保留）"
        />
      </el-form-item>

      <!-- 引入提前还款子组件（透传显隐控制） -->
      <PrepaymentSection
          :visible="visiblePrepayment"
          v-model:prepayments="form.prepayments"
          v-model:periodicRepayList="form.periodicRepayList"
          @reset="handlePrepaymentReset"
          ref="prepaymentSectionRef"
      />

      <!-- 操作按钮区域 -->
      <el-form-item>
        <el-button
            type="primary"
            @click="handleCalculate"
            style="margin-left: 120px;"
        >
          计算还款明细
        </el-button>
        <el-button
            @click="handleReset"
            style="margin-left: 10px;"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref, defineEmits, defineProps } from 'vue'
import { ElMessage } from 'element-plus'
// 引入拆分后的提前还款子组件
import PrepaymentSection from './PrepaymentSection.vue'

// 定义接收的Props（由父组件控制提前还款显隐）
const props = defineProps({
  visiblePrepayment: {
    type: Boolean,
    default: true // 默认显示提前还款模块
  }
})

// 定义向外触发的事件
const emit = defineEmits(['calculate', 'reset'])

// 表单Ref（用于表单校验，预留扩展）
const formRef = ref(null)
// 提前还款子组件Ref（用于调用其重置方法）
const prepaymentSectionRef = ref(null)

// 表单核心数据（仅保留基础参数 + 提前还款列表）
const form = reactive({
  // 基础贷款参数
  loanTotal: '',          // 贷款总额
  annualRate: '',         // 年利率
  years: '',              // 还款年限
  reservedPrincipal: 0,   // 保留不还的本金（默认0）
  // 提前还款相关（双向绑定子组件）
  prepayments: [],        // 一次性提前还款列表
  periodicRepayList: []   // 周期性提前还款列表
})

/**
 * 重置表单所有数据
 * 1. 重置基础贷款参数
 * 2. 调用子组件重置提前还款数据
 * 3. 通知父组件执行重置逻辑
 */
const handleReset = () => {
  // 重置基础参数
  form.loanTotal = ''
  form.annualRate = ''
  form.years = ''
  form.reservedPrincipal = 0

  // 调用提前还款子组件的重置方法
  if (prepaymentSectionRef.value) {
    prepaymentSectionRef.value.resetPrepayment()
  }

  // 通知父组件重置结果展示
  emit('reset')
}

/**
 * 处理提前还款子组件的重置事件（预留扩展）
 */
const handlePrepaymentReset = () => {
  // 可在此添加额外的重置逻辑（如日志、状态更新等）
}

/**
 * 提交计算逻辑
 * 1. 基础参数校验
 * 2. 整理参数格式
 * 3. 通知父组件执行计算请求
 */
const handleCalculate = () => {
  // 第一步：基础必填项校验
  if (!form.loanTotal || !form.annualRate || !form.years) {
    ElMessage.error('请填写必填项：贷款总额、年利率、还款年限')
    return
  }

  // 第二步：数值合法性转换与校验
  const loanTotalNum = Number(form.loanTotal)
  const annualRateNum = Number(form.annualRate)
  const yearsNum = Number(form.years)
  const reservedPrincipalNum = Number(form.reservedPrincipal)

  // 数值范围校验
  if (loanTotalNum <= 0 || annualRateNum <= 0 || yearsNum <= 0) {
    ElMessage.error('贷款总额、年利率、还款年限必须大于0')
    return
  }

  // 保留本金范围校验（不能≥贷款总额）
  if (reservedPrincipalNum < 0 || reservedPrincipalNum >= loanTotalNum) {
    ElMessage.error(`保留本金需≥0且＜贷款总额（${loanTotalNum}元）`)
    return
  }

  // 第三步：整理参数格式（适配后端接口）
  const params = {
    loanTotal: loanTotalNum,                // 贷款总额
    annualRate: annualRateNum,              // 年利率
    years: yearsNum,                        // 还款年限
    reservedPrincipal: reservedPrincipalNum,// 保留不还的本金
    // 一次性提前还款（过滤空数据，格式化类型）
    prepayments: form.prepayments
        .filter(item => item.month && item.amount)
        .map(item => ({
          month: Number(item.month),
          amount: Number(item.amount),
          year: 0 // 兼容原有后端字段
        })),
    // 周期性提前还款列表
    periodicRepayList: form.periodicRepayList
  }

  // 第四步：通知父组件执行计算请求
  emit('calculate', params)
}
</script>

<style scoped>
/* 基础容器样式，保持页面适配 */
:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>