<template>
  <el-card
      shadow="hover"
      header="还款计算结果"
      v-if="showResult"
      style="margin-top: 20px;"
  >
    <!-- 总计信息：补充商贷/公积金/合计的本金、利息、总还款 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <div class="summary-item">
          <label>还款总年限</label>
          <div class="value">{{ summary.years || '-' }} 年（{{ summary.totalMonths || '-' }} 个月）</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-item">
          <label>商贷总还款</label>
          <div class="value">{{ formatMoney(summary.businessTotalRepay) }} 元</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="summary-item">
          <label>公积金贷总还款</label>
          <div class="value">{{ formatMoney(summary.fundTotalRepay) }} 元</div>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="summary-item total">
          <label>组合贷合计总还款</label>
          <div class="value">{{ formatMoney(summary.totalAllRepay) }} 元</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="summary-item">
          <label>商贷总本金/利息</label>
          <div class="value">{{ formatMoney(summary.businessTotalPrincipal) }} / {{ formatMoney(summary.businessTotalInterest) }} 元</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="summary-item">
          <label>公积金总本金/利息</label>
          <div class="value">{{ formatMoney(summary.fundTotalPrincipal) }} / {{ formatMoney(summary.fundTotalInterest) }} 元</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="summary-item">
          <label>合计总本金/利息</label>
          <div class="value">{{ formatMoney(summary.totalAllPrincipal) }} / {{ formatMoney(summary.totalAllInterest) }} 元</div>
        </div>
      </el-col>
    </el-row>

    <!-- 主标签页：保留整体月度明细 + 拆分明细 + 年度汇总 -->
    <el-tabs v-model="activeTab" type="card">
      <!-- 整体月度还款明细（保留原功能，不删除） -->
      <el-tab-pane label="整体月度还款明细" name="totalMonthly">
        <div v-if="!summary.totalMonthlyDetails || summary.totalMonthlyDetails.length === 0 && !loading" class="empty-tip">
          <el-empty description="暂无整体月度还款数据" />
        </div>
        <el-table
            :data="summary.totalMonthlyDetails"
            border
            v-loading="loading"
            style="width: 100%;"
            height="400px"
            v-else
            :empty-text="''"
        >
          <el-table-column prop="month" label="还款月份" align="center" />
          <el-table-column prop="monthlyPrincipal" label="当月本金（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.monthlyPrincipal) }}</template>
          </el-table-column>
          <el-table-column prop="monthlyInterest" label="当月利息（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.monthlyInterest) }}</template>
          </el-table-column>
          <el-table-column prop="monthlyRepay" label="当月还款总额（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.monthlyRepay) }}</template>
          </el-table-column>
          <el-table-column prop="remainingPrincipal" label="剩余本金（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.remainingPrincipal) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 拆分版月度还款明细：商贷 + 公积金贷 -->
      <el-tab-pane label="拆分月度还款明细" name="splitMonthly">
        <el-tabs v-model="monthlySubTab" type="border-card" style="margin-bottom: 10px;">
          <el-tab-pane label="商贷月度明细" name="businessMonthly">
            <div v-if="!summary.businessMonthlyDetails || summary.businessMonthlyDetails.length === 0 && !loading" class="empty-tip">
              <el-empty description="暂无商贷月度还款数据" />
            </div>
            <el-table
                :data="summary.businessMonthlyDetails"
                border
                v-loading="loading"
                style="width: 100%;"
                height="400px"
                v-else
                :empty-text="''"
            >
              <el-table-column prop="month" label="还款月份" align="center" />
              <el-table-column prop="monthlyPrincipal" label="当月本金（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.monthlyPrincipal) }}</template>
              </el-table-column>
              <el-table-column prop="monthlyInterest" label="当月利息（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.monthlyInterest) }}</template>
              </el-table-column>
              <el-table-column prop="monthlyRepay" label="当月还款总额（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.monthlyRepay) }}</template>
              </el-table-column>
              <el-table-column prop="remainingPrincipal" label="剩余本金（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.remainingPrincipal) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="公积金贷月度明细" name="fundMonthly">
            <div v-if="!summary.fundMonthlyDetails || summary.fundMonthlyDetails.length === 0 && !loading" class="empty-tip">
              <el-empty description="暂无公积金贷月度还款数据" />
            </div>
            <el-table
                :data="summary.fundMonthlyDetails"
                border
                v-loading="loading"
                style="width: 100%;"
                height="400px"
                v-else
                :empty-text="''"
            >
              <el-table-column prop="month" label="还款月份" align="center" />
              <el-table-column prop="monthlyPrincipal" label="当月本金（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.monthlyPrincipal) }}</template>
              </el-table-column>
              <el-table-column prop="monthlyInterest" label="当月利息（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.monthlyInterest) }}</template>
              </el-table-column>
              <el-table-column prop="monthlyRepay" label="当月还款总额（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.monthlyRepay) }}</template>
              </el-table-column>
              <el-table-column prop="remainingPrincipal" label="剩余本金（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.remainingPrincipal) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- 年度还款汇总：商贷 + 公积金贷 + 年度合计 -->
      <el-tab-pane label="年度还款汇总" name="yearly">
        <el-tabs v-model="yearlySubTab" type="border-card" style="margin-bottom: 10px;">
          <el-tab-pane label="商贷年度汇总" name="businessYearly">
            <div v-if="!summary.businessYearSummaries || summary.businessYearSummaries.length === 0 && !loading" class="empty-tip">
              <el-empty description="暂无商贷年度还款数据" />
            </div>
            <el-table
                :data="summary.businessYearSummaries"
                border
                v-loading="loading"
                style="width: 100%;"
                height="400px"
                v-else
                :empty-text="''"
            >
              <el-table-column prop="year" label="还款年度" align="center" />
              <el-table-column prop="yearPrincipal" label="当年本金（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.yearPrincipal) }}</template>
              </el-table-column>
              <el-table-column prop="yearInterest" label="当年利息（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.yearInterest) }}</template>
              </el-table-column>
              <el-table-column prop="yearTotalRepay" label="当年还款总额（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.yearTotalRepay) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="公积金贷年度汇总" name="fundYearly">
            <div v-if="!summary.fundYearSummaries || summary.fundYearSummaries.length === 0 && !loading" class="empty-tip">
              <el-empty description="暂无公积金贷年度还款数据" />
            </div>
            <el-table
                :data="summary.fundYearSummaries"
                border
                v-loading="loading"
                style="width: 100%;"
                height="400px"
                v-else
                :empty-text="''"
            >
              <el-table-column prop="year" label="还款年度" align="center" />
              <el-table-column prop="yearPrincipal" label="当年本金（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.yearPrincipal) }}</template>
              </el-table-column>
              <el-table-column prop="yearInterest" label="当年利息（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.yearInterest) }}</template>
              </el-table-column>
              <el-table-column prop="yearTotalRepay" label="当年还款总额（元)" align="right">
                <template #default="scope">{{ formatMoney(scope.row.yearTotalRepay) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="年度合计汇总" name="totalYearly">
            <div v-if="mergedYearlySummaries.length === 0 && !loading" class="empty-tip">
              <el-empty description="暂无年度合计还款数据" />
            </div>
            <el-table
                :data="mergedYearlySummaries"
                border
                v-loading="loading"
                style="width: 100%;"
                height="400px"
                v-else
                :empty-text="''"
                highlight-current-row
            >
              <el-table-column prop="year" label="还款年度" align="center" width="100" />
              <el-table-column prop="businessPrincipal" label="商贷本金（元)" align="right" />
              <el-table-column prop="fundPrincipal" label="公积金本金（元)" align="right" />
              <el-table-column prop="totalPrincipal" label="合计本金（元)" align="right" font-weight="bold" />
              <el-table-column prop="businessInterest" label="商贷利息（元)" align="right" />
              <el-table-column prop="fundInterest" label="公积金利息（元)" align="right" />
              <el-table-column prop="totalInterest" label="合计利息（元)" align="right" font-weight="bold" />
              <el-table-column prop="totalRepay" label="年度总还款（元)" align="right" font-weight="bold" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ref, defineProps, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 接收父组件参数，匹配后端CombinationLoanResponse实体
const props = defineProps({
  summary: {
    type: Object,
    default: () => ({
      // 基础信息
      years: '-',
      totalMonths: '-',
      // 整体月度明细
      totalMonthlyDetails: [],
      // 商贷相关
      businessTotalPrincipal: 0,
      businessTotalInterest: 0,
      businessTotalRepay: 0,
      businessMonthlyDetails: [],
      businessYearSummaries: [],
      // 公积金贷相关
      fundTotalPrincipal: 0,
      fundTotalInterest: 0,
      fundTotalRepay: 0,
      fundMonthlyDetails: [],
      fundYearSummaries: [],
      // 组合贷合计
      totalAllPrincipal: 0,
      totalAllInterest: 0,
      totalAllRepay: 0
    }),
    required: true
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

// 主标签页、子标签页激活状态
const activeTab = ref('totalMonthly') // 默认显示整体月度明细
const monthlySubTab = ref('businessMonthly')
const yearlySubTab = ref('businessYearly')

// 计算属性：合并商贷+公积金贷年度数据，生成年度合计
const mergedYearlySummaries = computed(() => {
  const businessList = props.summary.businessYearSummaries || []
  const fundList = props.summary.fundYearSummaries || []
  const yearMap = new Map()

  // 处理商贷年度数据
  businessList.forEach(item => {
    if (item.year) {
      yearMap.set(item.year, {
        year: item.year,
        businessPrincipal: item.yearPrincipal || 0,
        businessInterest: item.yearInterest || 0,
        fundPrincipal: 0,
        fundInterest: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        totalRepay: 0
      })
    }
  })

  // 处理公积金贷年度数据，合并到同一年份
  fundList.forEach(item => {
    if (item.year) {
      if (yearMap.has(item.year)) {
        const cur = yearMap.get(item.year)
        cur.fundPrincipal = item.yearPrincipal || 0
        cur.fundInterest = item.yearInterest || 0
      } else {
        yearMap.set(item.year, {
          year: item.year,
          businessPrincipal: 0,
          businessInterest: 0,
          fundPrincipal: item.yearPrincipal || 0,
          fundInterest: item.yearInterest || 0,
          totalPrincipal: 0,
          totalInterest: 0,
          totalRepay: 0
        })
      }
    }
  })

  // 计算合计值并格式化
  const result = Array.from(yearMap.values()).map(item => {
    item.totalPrincipal = Number(item.businessPrincipal) + Number(item.fundPrincipal)
    item.totalInterest = Number(item.businessInterest) + Number(item.fundInterest)
    item.totalRepay = item.totalPrincipal + item.totalInterest
    // 金额格式化（提前处理，避免表格重复计算）
    item.businessPrincipal = formatMoney(item.businessPrincipal)
    item.fundPrincipal = formatMoney(item.fundPrincipal)
    item.totalPrincipal = formatMoney(item.totalPrincipal)
    item.businessInterest = formatMoney(item.businessInterest)
    item.fundInterest = formatMoney(item.fundInterest)
    item.totalInterest = formatMoney(item.totalInterest)
    item.totalRepay = formatMoney(item.totalRepay)
    return item
  })

  // 按年度升序排序
  return result.sort((a, b) => a.year - b.year)
})

// 监听数据更新，给出友好提示
watch([() => props.summary], () => {
  if (props.showResult && !props.loading) {
    ElMessage.success('组合贷还款数据已更新')
  }
}, { deep: true })

// 通用金额格式化函数
const formatMoney = (num) => {
  if (!num || num === '-' || isNaN(Number(num))) return '0.00'
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
/* 汇总项基础样式 */
.summary-item {
  padding: 12px 15px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.3s ease;
}
.summary-item:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}
.summary-item label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
}
.summary-item .value {
  color: #303133;
  font-size: 16px;
  font-family: "Microsoft YaHei", sans-serif;
}
/* 合计汇总项特殊样式 */
.summary-item.total {
  background-color: #fff8e6;
  border-color: #ffd591;
}
.summary-item.total .value {
  color: #e6a23c;
  font-weight: bold;
  font-size: 18px;
}

/* 空数据提示样式 */
.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

/* 表格样式优化 */
:deep(.el-table td),
:deep(.el-table th) {
  text-align: center;
}
:deep(.el-table .cell) {
  font-family: "Microsoft YaHei", sans-serif;
}
:deep(.el-table th.is-bold) {
  color: #303133;
}

/* 标签页样式优化 */
:deep(.el-tabs__header) {
  margin-bottom: 15px;
}
:deep(.el-tabs--border-card) {
  --el-tabs-header-text-color: #606266;
  --el-tabs-active-color: #409eff;
  margin-bottom: 20px;
}
:deep(.el-tab-pane) {
  padding: 0;
}
</style>