<template>
  <el-card
      shadow="hover"
      header="还款计算结果"
      v-if="showResult"
      style="margin-top: 20px;"
  >
    <!-- 总计信息：Element Plus 栅格布局 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <div class="summary-item">
          <label>贷款总额</label>
          <div class="value">{{ formatMoney(summary.loanTotal) }} 元</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-item">
          <label>还款总年限</label>
          <div class="value">{{ summary.years }} 年（{{ summary.totalMonths }} 个月）</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-item">
          <label>总还款本金</label>
          <div class="value">{{ formatMoney(summary.totalAllPrincipal) }} 元</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-item">
          <label>总还款利息</label>
          <div class="value">{{ formatMoney(summary.totalAllInterest) }} 元</div>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="summary-item total">
          <label>总还款金额</label>
          <div class="value">{{ formatMoney(summary.totalAllRepay) }} 元</div>
        </div>
      </el-col>
    </el-row>

    <!-- 标签页：Element Plus 自带 -->
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="月度还款明细" name="monthly">
        <el-table
            :data="monthlyDetails"
            border
            v-loading="loading"
            style="width: 100%;"
            height="400px"
        >
          <el-table-column prop="month" label="还款月份" />
          <el-table-column prop="monthlyPrincipal" label="当月本金（元)">
            <template #default="scope">{{ formatMoney(scope.row.monthlyPrincipal) }}</template>
          </el-table-column>
          <el-table-column prop="monthlyInterest" label="当月利息（元)">
            <template #default="scope">{{ formatMoney(scope.row.monthlyInterest) }}</template>
          </el-table-column>
          <el-table-column prop="monthlyRepay" label="当月还款总额（元)">
            <template #default="scope">{{ formatMoney(scope.row.monthlyRepay) }}</template>
          </el-table-column>
          <el-table-column prop="remainingPrincipal" label="剩余本金（元)">
            <template #default="scope">{{ formatMoney(scope.row.remainingPrincipal) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="年度还款汇总" name="yearly">
        <el-table
            :data="yearlySummaries"
            border
            v-loading="loading"
            style="width: 100%;"
            height="400px"
        >
          <el-table-column prop="year" label="还款年度" />
          <el-table-column prop="yearPrincipal" label="当年本金（元)">
            <template #default="scope">{{ formatMoney(scope.row.yearPrincipal) }}</template>
          </el-table-column>
          <el-table-column prop="yearInterest" label="当年利息（元)">
            <template #default="scope">{{ formatMoney(scope.row.yearInterest) }}</template>
          </el-table-column>
          <el-table-column prop="yearTotalRepay" label="当年还款总额（元)">
            <template #default="scope">{{ formatMoney(scope.row.yearTotalRepay) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ref, defineProps } from 'vue'

// 接收父组件传递的参数
const props = defineProps({
  summary: {
    type: Object,
    default: () => ({
      loanTotal: '-',
      years: '-',
      totalMonths: '-',
      totalAllPrincipal: '-',
      totalAllInterest: '-',
      totalAllRepay: '-'
    })
  },
  monthlyDetails: {
    type: Array,
    default: () => []
  },
  yearlySummaries: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showResult: {
    type: Boolean,
    default: false
  }
})

// 激活的标签页
const activeTab = ref('monthly')

// 金额格式化
const formatMoney = (num) => {
  if (!num || isNaN(num)) return '0.00'
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
/* 仅保留少量自定义样式，大部分由 Element Plus 提供 */
.summary-item {
  padding: 10px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}
.summary-item label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
}
.summary-item .value {
  color: #303133;
  font-size: 16px;
}
.summary-item.total .value {
  color: #e6a23c;
  font-weight: bold;
  font-size: 18px;
}
</style>