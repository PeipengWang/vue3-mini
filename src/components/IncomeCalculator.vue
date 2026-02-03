<template>
  <div class="income-calculator-section" v-show="visible">
    <el-card shadow="hover" header="收益统计计算器" class="calc-card">
      <!-- 储蓄产品类型选择 -->
      <el-form
          :model="form"
          :rules="formRules"
          ref="formRef"
          label-width="100px"
          size="default"
          class="income-form"
      >

        <!-- 统计年份 -->
        <el-form-item label="统计年份" prop="targetYear">
          <el-input
              v-model.number="form.targetYear"
              type="number"
              min="2000"
              max="2100"
              placeholder="请输入统计年份（如2025）"
              clearable
          />
        </el-form-item>


        <!-- 新增：工资收入配置 -->
        <el-form-item label="工资收入配置" prop="salaryConfig">
          <el-row :gutter="16">
            <el-col :span="10">
              <el-input
                  v-model.number="form.salaryDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="每月发薪日期（1-31）"
                  clearable
                  style="width: 100%;"
              />
            </el-col>
            <el-col :span="14">
              <el-input
                  v-model.number="form.monthlySalary"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="每月工资金额（元）"
                  clearable
                  style="width: 100%;"
              />
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 产品列表操作 -->
        <el-form-item label="储蓄产品管理">
          <el-button
              type="primary"
              size="small"
              @click="addProduct"
              icon="el-icon-plus"
          >
            添加储蓄产品
          </el-button>
          <el-button
              type="warning"
              size="small"
              @click="clearProducts"
              icon="el-icon-delete"
              style="margin-left: 8px;"
          >
            清空产品
          </el-button>
        </el-form-item>

        <!-- 产品列表表格 -->
        <el-form-item>
          <el-table
              :data="productList"
              border
              style="width: calc(100%); margin-left: -10px; max-width: 1350px;"
              @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="产品类型" width="120">
              <template #default="scope">
                <el-select
                    v-model="scope.row.savingsType"
                    size="small"
                    style="width: 100%;"
                    @change="handleProductTypeChange(scope.row)"
                >
                  <el-option
                      v-for="type in savingsTypeOptions"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="产品名称" width="180">
              <template #default="scope">
                <el-input
                    v-model="scope.row.productName"
                    size="small"
                    placeholder="如：招商银行活期存款"
                />
              </template>
            </el-table-column>
            <el-table-column label="本金（元）" width="120">
              <template #default="scope">
                <el-input
                    v-model.number="scope.row.principal"
                    type="number"
                    step="0.01"
                    min="0.01"
                    size="small"
                    placeholder="0.00"
                />
              </template>
            </el-table-column>
            <el-table-column label="年利率（%）" width="100">
              <template #default="scope">
                <el-input
                    v-model.number="scope.row.annualRate"
                    type="number"
                    step="0.01"
                    min="0"
                    size="small"
                    placeholder="0.00"
                />
              </template>
            </el-table-column>
            <!-- 动态列：仅银行存款显示存款类型 -->
            <el-table-column
                label="存款类型"
                width="100"
                v-if="showDepositTypeColumn"
            >
              <template #default="scope">
                <el-select
                    v-model="scope.row.depositType"
                    size="small"
                    style="width: 100%;"
                >
                  <el-option label="活期" value="DEMAND" />
                  <el-option label="定期" value="FIXED" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="开始日期" width="120">
              <template #default="scope">
                <el-date-picker
                    v-model="scope.row.startDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                    placeholder="选择开始日期"
                />
              </template>
            </el-table-column>
            <el-table-column label="结束日期" width="120">
              <template #default="scope">
                <el-date-picker
                    v-model="scope.row.endDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                    placeholder="选择结束日期"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button
                    type="danger"
                    size="small"
                    icon="el-icon-delete"
                    @click="deleteProduct(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button
              type="primary"
              @click="calculateIncome"
              icon="el-icon-calculator"
          >
            计算收益
          </el-button>
          <el-button
              type="default"
              @click="resetForm"
              icon="el-icon-refresh"
              style="margin-left: 8px;"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 收益统计结果 -->
      <div v-if="incomeResult" class="income-result">
        <el-divider content-position="left">{{ form.targetYear }}年收益统计结果</el-divider>

        <!-- 年度汇总 -->
        <el-card shadow="hover" class="result-card">
          <div class="annual-summary">
            <h4>年度核心数据汇总</h4>
            <div class="type-summary">
              <div class="type-item">
                年度工资总收入：{{ form.monthlySalary > 0 ? (form.monthlySalary * 12).toFixed(2) : '0.00' }} 元
              </div>
              <div class="type-item">
                年度理财总收益：{{ incomeResult.annualIncome.totalIncome }} 元
              </div>
              <div class="type-item" style="background: #e8f4f8; font-weight: bold;">
                年末收入：{{ calculateAnnualTotalBalance() }} 元
              </div>
              <div class="type-item" style="background: #e8f4f8; font-weight: bold;">
                年末余额：{{ incomeResult.annualIncome.totalYearIncome }} 元
              </div>
            </div>
          </div>
        </el-card>

        <!-- 月度明细 -->
        <el-card shadow="hover" class="result-card" style="margin-top: 16px;">
          <h4>月度明细（本金+利息+工资）</h4>
          <el-table
              :data="incomeResult.monthlyIncomeList"
              border
              style="width: 100%; margin-top: 8px;"
          >
            <el-table-column label="月份" width="80">
              <template #default="scope">
                {{ scope.row.month }} 月
              </template>
            </el-table-column>
            <el-table-column label="月度工资（元）" width="120" v-if="form.monthlySalary">
              <template #default="scope">
                {{ form.monthlySalary.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="月度理财收益（元）" width="140">
              <template #default="scope">
                {{ scope.row.totalIncome }}
              </template>
            </el-table-column>
            <el-table-column label="月度总余额（元）" width="140" style="font-weight: 500;">
              <template #default="scope">
                {{ calculateMonthlyBalance(scope.row.month) }}
              </template>
            </el-table-column>
            <el-table-column label="收益明细" min-width="200">
              <template #default="scope">
                <div
                    v-for="(value, key) in scope.row.typeIncomeMap"
                    :key="key"
                    style="display: inline-block; margin-right: 16px;"
                >
                  {{ getSavingsTypeName(key) }}：{{ value }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, watch, defineProps, defineEmits, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import {API_PATH, CONFIG} from "../config/api.config.js";

// 定义Props：控制组件显隐
const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  }
})

// 定义Emits
const emit = defineEmits(['reset'])

// 储蓄类型选项
const savingsTypeOptions = [
  { label: '银行存款', value: 'BANK_DEPOSIT' },
  { label: '债券', value: 'BOND' },
  { label: '基金', value: 'FUND' },
  { label: '股票', value: 'STOCK' }
]

// 表单Ref
const formRef = ref()

// 表单数据 - 新增初始本金、工资相关字段
const form = reactive({
  targetYear: new Date().getFullYear(), // 默认当前年份
  salaryDay: 15, // 默认每月15号发工资
  monthlySalary: 0 // 每月工资金额
})

// 产品列表
const productList = ref([])

// 选中的产品（批量操作）
const selectedProducts = ref([])

// 收益计算结果
const incomeResult = ref(null)

// 动态列控制
const showDepositTypeColumn = ref(false)
const showMonthlyRateColumn = ref(false)

// 表单校验规则 - 新增初始本金、工资字段校验
const formRules = reactive({
  targetYear: [
    { required: true, message: '请输入统计年份', trigger: 'blur' },
    { type: 'number', min: 2000, max: 2100, message: '年份需在2000-2100之间', trigger: 'blur' }
  ],
  salaryDay: [
    { type: 'number', min: 1, max: 31, message: '发薪日期需在1-31之间', trigger: 'blur' }
  ],
  monthlySalary: [
    { type: 'number', min: 0.01, message: '工资金额不能小于0.01元', trigger: 'blur' }
  ]
})

// 监听产品列表变化，控制动态列显示
watch(
    productList,
    (newList) => {
      // 判断是否有银行存款产品
      showDepositTypeColumn.value = newList.some(item => item.savingsType === 'BANK_DEPOSIT')
      // 判断是否有基金/股票产品
      showMonthlyRateColumn.value = newList.some(item => ['FUND', 'STOCK'].includes(item.savingsType))
    },
    { deep: true, immediate: true }
)

// 添加新产品
const addProduct = () => {
  productList.value.push({
    savingsType: 'BANK_DEPOSIT', // 默认银行存款
    productName: '',
    principal: '',
    annualRate: '',
    depositType: 'DEMAND', // 默认活期
    monthlyRate: '',
    startDate: '',
    endDate: ''
  })
}

// 删除产品
const deleteProduct = (index) => {
  productList.value.splice(index, 1)
  ElMessage.success('产品删除成功')
}

// 修复清空产品弹窗逻辑
const clearProducts = async () => {
  try {
    await ElMessageBox.confirm(
        '确定清空所有储蓄产品吗？',
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
          closeOnPressEscape: false
        }
    )
    productList.value = []
    ElMessage.success('产品列表已清空')
  } catch (error) {
    ElMessage.info('已取消清空产品操作')
  }
}

// 处理产品类型变更
const handleProductTypeChange = (row) => {
  if (row.savingsType !== 'BANK_DEPOSIT') {
    row.depositType = ''
  } else {
    row.depositType = row.depositType || 'DEMAND'
  }
  if (['FUND', 'STOCK'].includes(row.savingsType)) {
    row.depositType = ''
  }
}

// 处理表格选择事件
const handleSelectionChange = (val) => {
  selectedProducts.value = val
}

// 重置表单 - 新增重置初始本金、工资字段
const resetForm = () => {
  formRef.value.resetFields()
  productList.value = []
  incomeResult.value = null
  // 重置自定义字段
  form.salaryDay = 15
  form.monthlySalary = 0
  emit('reset')
  ElMessage.success('表单已重置')
}

// 计算月度总余额
const calculateMonthlyBalance = (month) => {
  if (!incomeResult.value) return '0.00'

  // 1. 累计工资：当前月及之前的工资总和
  let totalSalary = form.monthlySalary * month

  // 2. 累计理财收益：当前月及之前的收益总和
  let totalIncome = 0
  incomeResult.value.monthlyIncomeList.forEach(item => {
    if (item.month <= month) {
      totalIncome += Number(item.totalIncome)
    }
  })

  // 3. 月度总余额 = 初始本金 + 累计工资 + 累计理财收益
  const totalBalance =  totalSalary + totalIncome
  return totalBalance.toFixed(2)
}

// 计算年度总余额
const calculateAnnualTotalBalance = () => {
  return calculateMonthlyBalance(12)
}

// 计算收益 - 新增传递初始本金、工资数据到后端
const calculateIncome = async () => {
  // 表单校验
  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.error('请完善表单必填项')
    return
  }

  // 产品列表校验
  if (productList.value.length === 0) {
    ElMessage.error('请至少添加一个储蓄产品')
    return
  }

  // 格式化产品数据
  const formattedProducts = productList.value.map(item => {
    return {
      savingsType: item.savingsType,
      productName: item.productName,
      principal: item.principal ? Number(item.principal) : 0,
      annualRate: item.annualRate ? Number(item.annualRate) : 0,
      depositType: item.depositType,
      monthlyRate: item.monthlyRate ? Number(item.monthlyRate) : 0,
      startDate: item.startDate,
      endDate: item.endDate
    }
  })

  // 构造完整请求数据
  const requestData = {
    products: formattedProducts,
    salaryConfig: {
      salaryDay: form.salaryDay,
      monthlySalary: form.monthlySalary
    }
  }

  // 调用后端接口
  try {
    const response = await axios.post(
        `${CONFIG.baseURL}${API_PATH.income}?targetYear=${form.targetYear}`,
        requestData
    )
    incomeResult.value = response.data
    ElMessage.success('收益计算成功')
  } catch (error) {
    ElMessage.error('收益计算失败：' + (error.response?.data?.message || error.message))
    console.error('计算收益失败：', error)
  }
}

// 获取储蓄类型名称
const getSavingsTypeName = (key) => {
  const type = savingsTypeOptions.find(item => item.value === key)
  return type ? type.label : key
}
</script>

<style scoped>
.income-calculator-section {
  margin-top: 20px;
}

.income-form {
  margin-bottom: 20px;
}

.result-card {
  margin-bottom: 16px;
}

.annual-summary {
  padding: 8px 0;
}

.annual-summary h4 {
  margin: 0 0 16px 0;
  color: #1989fa;
}

.type-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.type-item {
  padding: 6px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  font-size: 14px;
}

/* 新增：工资配置行样式优化 */
.el-row {
  width: 100%;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .income-form .el-table {
    width: 100% !important;
    margin-left: 0 !important;
  }

  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 0 !important;
  }

  .type-summary {
    flex-direction: column;
    gap: 8px;
  }

  .el-col {
    width: 100% !important;
    margin-bottom: 8px;
  }
}
</style>