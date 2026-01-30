<template>
  <div class="prepayment-section">
    <!-- 周期性提前还款设置 -->
    <el-form-item label="周期性提前还款">
      <!-- 外层容器：消除默认间距，确保一行展示 -->
      <div style="margin-left: 0; width: calc(100% - 120px); display: flex; align-items: center; gap: 8px; flex-wrap: nowrap;">
        <!-- 开始月份 -->
        <div style="display: flex; align-items: center;">
          <span>从第</span>
          <el-input
              v-model.number="periodicRepay.startMonth"
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
              v-model.number="periodicRepay.endMonth"
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
              v-model.number="periodicRepay.cycleMonths"
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
              v-model.number="periodicRepay.amount"
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
            :disabled="!periodicRepay.startMonth || !periodicRepay.endMonth || !periodicRepay.cycleMonths || !periodicRepay.amount"
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
          :data="prepayments"
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
          :data="periodicRepayList"
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
  </div>
</template>

<script setup>
import { reactive, ref, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 定义接收的props（父组件传递的初始化数据，可选）
const props = defineProps({
  // 允许父组件传入初始化的提前还款数据
  initPrepayments: {
    type: Array,
    default: () => []
  },
  initPeriodicRepayList: {
    type: Array,
    default: () => []
  }
})

// 定义向外暴露的事件
const emit = defineEmits([
  'update:prepayments', // 一次性还款列表更新
  'update:periodicRepayList', // 周期还款列表更新
  'reset' // 重置事件
])

// 临时周期还款输入数据
const periodicRepay = reactive({
  startMonth: '',
  endMonth: '',
  cycleMonths: '',
  amount: ''
})

// 一次性提前还款列表（双向绑定）
const prepayments = ref([...props.initPrepayments])
// 周期还款列表（双向绑定）
const periodicRepayList = ref([...props.initPeriodicRepayList])

// 监听列表变化，向父组件同步数据
watch(prepayments, (newVal) => {
  emit('update:prepayments', newVal)
}, { deep: true })

watch(periodicRepayList, (newVal) => {
  emit('update:periodicRepayList', newVal)
}, { deep: true })

// 添加一次性提前还款行
const addPrepayment = () => {
  prepayments.value.push({ month: '', amount: '' })
}

// 删除一次性提前还款行
const deletePrepayment = (index) => {
  prepayments.value.splice(index, 1)
}

// 添加周期性提前还款
const addPeriodicRepay = () => {
  const { startMonth, endMonth, cycleMonths, amount } = periodicRepay
  // 基础校验
  if (!startMonth || !endMonth || !cycleMonths || !amount) {
    ElMessage.error('请填写完整的周期还款信息（开始/结束月份、周期、金额）')
    return
  }
  if (Number(cycleMonths) < 1 || Number(amount) <= 0) {
    ElMessage.error('周期月数需≥1，还款金额需＞0')
    return
  }
  if (Number(startMonth) > Number(endMonth)) {
    ElMessage.error('开始月份不能大于结束月份')
    return
  }
  // 添加到列表
  periodicRepayList.value.push({
    startMonth: Number(startMonth),
    endMonth: Number(endMonth),
    cycleMonths: Number(cycleMonths),
    amount: Number(amount)
  })
  // 清空临时输入框
  periodicRepay.startMonth = ''
  periodicRepay.endMonth = ''
  periodicRepay.cycleMonths = ''
  periodicRepay.amount = ''
  ElMessage.success('周期还款规则添加成功')
}

// 删除周期性提前还款
const deletePeriodicRepay = (index) => {
  periodicRepayList.value.splice(index, 1)
}

// 重置提前还款相关数据
const resetPrepayment = () => {
  periodicRepay.startMonth = ''
  periodicRepay.endMonth = ''
  periodicRepay.cycleMonths = ''
  periodicRepay.amount = ''
  prepayments.value = []
  periodicRepayList.value = []
  emit('reset')
}

// 向外暴露方法（供父组件调用）
defineExpose({
  resetPrepayment
})
</script>

<style scoped>
.prepayment-section {
  margin-top: 16px;
}
</style>