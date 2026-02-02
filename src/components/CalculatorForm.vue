<template>
  <el-card
      shadow="hover"
      header="房贷还款计算器"
      class="calc-card"
  >
    <!-- 表单容器：绑定校验规则 + 统一尺寸 -->
    <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="120px"
        size="default"
    >
      <!-- 贷款总额 -->
      <el-form-item label="贷款总额（元）" prop="loanTotal">
        <el-input
            v-model.number="form.loanTotal"
            type="number"
            step="0.01"
            placeholder="请输入贷款总额，如 1000000"
            clearable
        />
      </el-form-item>

      <!-- 年利率 -->
      <el-form-item label="年利率（%）" prop="annualRate">
        <el-input
            v-model.number="form.annualRate"
            type="number"
            step="0.01"
            placeholder="请输入年利率，如 4.9"
            clearable
        />
      </el-form-item>

      <!-- 还款年限 -->
      <el-form-item label="还款年限" prop="years">
        <el-input
            v-model.number="form.years"
            type="number"
            min="1"
            placeholder="请输入还款年限，如 30"
            clearable
        />
      </el-form-item>

      <!-- 保留本金 -->
      <el-form-item label="保留本金（元）" prop="reservedPrincipal">
        <el-input
            v-model.number="form.reservedPrincipal"
            type="number"
            step="0.01"
            min="0"
            placeholder="请输入保留不还的本金金额，如 10000（填 0 则不保留）"
            clearable
        />
      </el-form-item>

      <!-- 提前还款子组件：【关键修复】删除重复属性，规范书写 -->
      <PrepaymentSection
          v-if="visiblePrepayment"
          v-model:prepayments="form.prepayments"
          v-model:periodicRepayList="form.periodicRepayList"
          @reset="handlePrepaymentReset"
          ref="prepaymentSectionRef"
      />

      <!-- 操作按钮区域 -->
      <el-form-item class="form-actions">
        <el-button type="primary" @click="handleCalculate">
          计算还款明细
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref, defineEmits, defineProps } from 'vue'
import { ElMessage } from 'element-plus'
import PrepaymentSection from './PrepaymentSection.vue'

// Props 定义
const props = defineProps({
  visiblePrepayment: {
    type: Boolean,
    default: true
  }
})

// 事件定义
const emit = defineEmits(['calculate', 'reset'])

// 表单 Ref + 校验规则
const formRef = ref()
const prepaymentSectionRef = ref()

// 表单校验规则
const formRules = reactive({
  loanTotal: [
    { required: true, message: '请输入贷款总额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '贷款总额必须大于 0', trigger: 'blur' }
  ],
  annualRate: [
    { required: true, message: '请输入年利率', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '年利率必须大于 0', trigger: 'blur' }
  ],
  years: [
    { required: true, message: '请输入还款年限', trigger: 'blur' },
    { type: 'number', min: 1, message: '还款年限必须大于等于 1', trigger: 'blur' }
  ],
  reservedPrincipal: [
    { type: 'number', min: 0, message: '保留本金必须大于等于 0', trigger: 'blur' }
  ]
})

// 表单数据
const form = reactive({
  loanTotal: '',
  annualRate: '',
  years: '',
  reservedPrincipal: 0,
  prepayments: [],
  periodicRepayList: []
})

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  prepaymentSectionRef.value?.resetPrepayment()
  emit('reset')
  ElMessage.success('表单已重置')
}

// 提前还款子组件重置回调
const handlePrepaymentReset = () => {
  form.prepayments = []
  form.periodicRepayList = []
}

// 计算逻辑
const handleCalculate = async () => {
  // 表单校验
  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.error('表单校验失败，请检查输入内容')
    return
  }

  // 数值转换
  const loanTotalNum = Number(form.loanTotal)
  const annualRateNum = Number(form.annualRate)
  const yearsNum = Number(form.years)
  const reservedPrincipalNum = Number(form.reservedPrincipal)

  // 保留本金特殊校验
  if (reservedPrincipalNum >= loanTotalNum) {
    ElMessage.error(`保留本金需小于贷款总额（${loanTotalNum} 元）`)
    return
  }

  // 格式化参数
  const params = {
    loanTotal: loanTotalNum,
    annualRate: annualRateNum,
    years: yearsNum,
    reservedPrincipal: reservedPrincipalNum,
    prepayments: form.prepayments
        .filter(item => item.month && item.amount)
        .map(item => ({
          month: Number(item.month),
          amount: Number(item.amount),
          year: 0
        })),
    periodicRepayList: form.periodicRepayList
  }

  // 通知父组件计算
  emit('calculate', params)
  ElMessage.info('正在计算，请稍候...')
}
</script>

<style scoped>
<style scoped>
  /* 核心容器：基础样式 + 响应式最大宽度 */
.calc-card {
  /* 基础：最大宽度适配不同屏幕，小屏自动占满宽度 */
  max-width: 1000px;
  /* 最小宽度：避免小屏过度压缩 */
  min-width: 320px;
  /* 水平居中 */
  margin: 0 auto;
  /* 左右内边距：小屏时预留边距，避免内容贴边 */
  padding: 0 16px;
  /* 上下外边距：适配不同屏幕的间距 */
  margin-top: 20px;
  margin-bottom: 40px;
}

/* Element Plus 卡片内边距：响应式调整 */
:deep(.el-card__body) {
  padding: 24px;
  /* 小屏（手机）时减小内边距，节省空间 */
  @media (max-width: 768px) {
    padding: 16px;
  }
}

/* 表单项间距：响应式调整 */
:deep(.el-form-item) {
  margin-bottom: 20px;
  /* 小屏时减小间距，节省垂直空间 */
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
}

/* 按钮区域：核心响应式布局 */
.form-actions {
  display: flex;
  justify-content: flex-start;
  padding-left: 120px;
  margin-top: 8px;
  gap: 12px;

  /* 断点1：平板/小屏电脑（≤992px） */
  @media (max-width: 992px) {
    padding-left: 80px;
  }

  /* 断点2：手机（≤768px）- 核心适配 */
  @media (max-width: 768px) {
    /* 按钮从横向排列改为纵向排列 */
    flex-direction: column;
    /* 取消左内边距，避免内容溢出 */
    padding-left: 0;
    /* 按钮宽度占满容器，更易点击 */
    gap: 8px;
  }

  /* 断点3：超小屏手机（≤480px） */
  @media (max-width: 480px) {
    /* 进一步减小间距 */
    gap: 6px;
    margin-top: 4px;
  }
}

/* 表单标签宽度：响应式调整（解决小屏标签换行问题） */
:deep(.el-form-item__label) {
  /* 小屏时减小标签宽度，避免内容挤压 */
  @media (max-width: 768px) {
    width: 80px !important;
  }
  @media (max-width: 480px) {
    width: 60px !important;
    font-size: 14px; /* 减小字体，节省空间 */
  }
}

/* 输入框宽度：小屏占满容器 */
:deep(.el-input) {
  @media (max-width: 768px) {
    width: 100% !important;
  }
}
</style>
