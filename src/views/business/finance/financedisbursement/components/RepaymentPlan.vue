<template>
  <div class="py-3">
    <div class="mb-3 border-b border-gray-200">
      <el-tooltip
        :content="!canGenerate ? '已有正式的还款计划，无法重新生成' : '生成还款计划'"
        placement="bottom"
      >
        <el-button
          type="primary"
          @click="generateRepaymentPlan()"
          :loading="repaymentLoading"
          :disabled="!canGenerate"
        >
          {{ repaymentPlans.length > 0 ? '重新生成还款计划' : '生成还款计划' }}
        </el-button>
      </el-tooltip>
    </div>
    <div v-if="repaymentPlans.length > 0" class="mt-3">
      <el-table
        v-loading="loading"
        :data="repaymentPlans"
        :stripe="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column
          type="index"
          label="期数"
          align="center"
          width="80"
          :index="(index) => (queryParams.pageNo - 1) * queryParams.pageSize + index + 1"
        />
        <el-table-column prop="repaymentDate" label="还款时间" align="center" width="180px">
          <template #default="{ row }">
            {{ dayjs(row.repaymentDate).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column prop="rent" label="租金" align="center" />
        <el-table-column prop="interestRate" label="利率" align="center" />
        <el-table-column prop="capital" label="还款本金" align="center" />
        <el-table-column prop="interest" label="还款利息" align="center" />
      </el-table>
      <!-- 分页 -->
      <Pagination
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="loadExistingPlans"
      />
    </div>
    <div v-else-if="total === 0" class="text-center py-10">
      <el-empty description="暂无还款计划数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FinanceRepaymentApi,
  FinanceRepaymentVO,
  GenerateRepaymentPlanReqVO
} from '@/api/business/finance/financerepayment'
import dayjs from 'dayjs'

interface Props {
  leaseAmount?: string | number
  leaseTerm?: string | number
  interestRate?: string | number
  repaymentMode?: number
  leaseDate?: number
  projectName?: string
  companyId?: number
  deptId?: number
  disbursementId?: number
}

const props = defineProps<Props>()

const message = useMessage()

const repaymentPlans = ref<FinanceRepaymentVO[]>([])
const repaymentLoading = ref(false)
const loading = ref(false)
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  disbursementId: undefined as number | undefined
})

const loadExistingPlans = async () => {
  if (!props.disbursementId) {
    return
  }

  loading.value = true
  try {
    queryParams.disbursementId = props.disbursementId
    const data = await FinanceRepaymentApi.getFinanceRepaymentPage(queryParams)
    repaymentPlans.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载还款计划失败:', error)
  } finally {
    loading.value = false
  }
}

const canGenerate = computed(
  () =>
    !props.disbursementId ||
    repaymentPlans.value.length === 0 ||
    repaymentPlans.value.some((item) => item.temporaryFlag)
)

const generateRepaymentPlan = async (disbursementId: number | undefined = props.disbursementId) => {
  if (!canGenerate.value) {
    message.error('已有正式的还款计划，无法重新生成')
    return
  }

  if (!props.leaseAmount) {
    message.error('请先填写租赁本金')
    return
  }
  if (!props.leaseTerm) {
    message.error('请先填写承租租期')
    return
  }
  if (!props.interestRate) {
    message.error('请先填写年租息率')
    return
  }
  if (!props.repaymentMode) {
    message.error('请先选择还租方式')
    return
  }
  if (!props.leaseDate) {
    message.error('请先选择放款日期')
    return
  }
  if (!props.companyId) {
    message.error('企业信息不完整')
    return
  }

  repaymentLoading.value = true
  try {
    const repaymentData: GenerateRepaymentPlanReqVO = {
      disbursementId,
      companyId: props.companyId,
      deptId: props.deptId,
      leaseAmount: parseFloat(String(props.leaseAmount)),
      leaseTerm: parseInt(String(props.leaseTerm)),
      interestRate: parseFloat(String(props.interestRate)),
      repaymentMode: props.repaymentMode,
      leaseDate: props.leaseDate
    }

    const result = await FinanceRepaymentApi.generateRepaymentPlan(repaymentData)
    if (result) {
      repaymentPlans.value = result
      message.success('还款计划生成成功')
    }
  } catch (error) {
    console.error('生成还款计划失败:', error)
    message.error('生成还款计划失败')
  } finally {
    repaymentLoading.value = false
  }
}

const saveGeneratedPlans = async (disbursementId: number) => {
  if (!props.disbursementId && disbursementId && repaymentPlans.value.length)
    await generateRepaymentPlan(disbursementId)
}

const resetPlans = () => {
  repaymentPlans.value = []
  total.value = 0
  queryParams.pageNo = 1
  loadExistingPlans()
}

watch(
  () => props.disbursementId,
  (newDisbursementId) => {
    if (newDisbursementId) {
      queryParams.pageNo = 1
      loadExistingPlans()
    } else {
      repaymentPlans.value = []
      total.value = 0
    }
  },
  { immediate: true }
)

defineExpose({
  resetPlans,
  loadExistingPlans,
  saveGeneratedPlans
})
</script>
