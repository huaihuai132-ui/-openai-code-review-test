<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="128px"
    >
    <el-form-item label="融资租赁单编号" prop="leaseId" label-width="120px" >
        <el-select
        v-model="queryParams.leaseId"
        placeholder="请选择融资租赁单编号"
        clearable
        class="!w-240px"
        filterable>
          <el-option
            v-for="item in financeLeaseOptions"
            :key="item.id"
            :label="item.leasedCode || item.name || String(item.id)"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="企业名称" prop="companyId">
        <el-select
          v-model="queryParams.companyId"
          placeholder="请选择企业"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="item in companyList"
            :key="item.id"
            :label="item.enterpriseName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="检查日期" prop="manageDate">
        <el-date-picker
          v-model="queryParams.manageDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="单据状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择单据状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:finance-manage:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:finance-manage:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出Excel
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleDocExport"
          :loading="exportLoading"
          v-hasPermi="['business:finance-manage:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出检查登记表
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
<!--      <el-table-column label="编号" align="center" prop="id" />-->
      <el-table-column label="租后管理编码" align="center" prop="manageCode" />
      <el-table-column label="企业名称" align="center" prop="companyId" width="180">
        <template #default="scope">
          <span>{{ companyList.find((item) => item.id === scope.row.companyId)?.enterpriseName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="租赁总额" align="center" prop="leaseAmount" />
      <el-table-column label="租赁余额" align="center" prop="leaseAmountSurplus" />
      <el-table-column label="检查人的用户编号" align="center" prop="userId" />
      <el-table-column
        label="检查日期"
        align="center"
        prop="manageDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="单据状态" align="center" prop="status" >
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status || 0" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            v-if="isShowEdit(scope.row)"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:finance-application:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="info"
            v-if="isShowDetail(scope.row)"
            @click="openForm('detail', scope.row.id)"
            v-hasPermi="['business:finance-application:query']"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            v-if="isShowEdit(scope.row)"
            @click="sendApprove(scope.row.id)"
            v-hasPermi="['business:finance-application:sendApprove']"
          >
            送审
          </el-button>
          <el-button
            link
            type="danger"
            v-if="isShowEdit(scope.row)"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:finance-application:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <FinanceManageForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getBoolDictOptions, DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { FinanceManageApi, FinanceManageVO } from '@/api/business/finance/financemanage'
import FinanceManageForm from './FinanceManageForm.vue'
import {FinanceLeaseApi, FinanceLeaseVO} from "@/api/business/finance/financelease";
import {FinanceApplicationApi} from "@/api/business/finance/financeapplication";
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/finance/financecompany";
import {isShowEdit, isShowDetail} from "@/api/bpm/task";



const financeLeaseOptions = ref<any[]>([])
// 加载已审批的融资租赁列表作为下拉选项
const loadFinanceLeaseOptions = async () => {
  try {
    const list = await FinanceLeaseApi.getFinanceLeaseListApproved()
    financeLeaseOptions.value = Array.isArray(list) ? list : []
  } catch (e) {
    financeLeaseOptions.value = []
  }
}

/** 融资租赁租后管理 列表 */
defineOptions({ name: 'FinanceManage' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<FinanceManageVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  leaseId: undefined,
  companyId: undefined,
  leaseAmount: undefined,
  leaseAmountSurplus: undefined,
  manageDate: [],
  corpNameChanged: undefined,
  legalRepChanged: undefined,
  actualControllerChanged: undefined,
  mgmtTeamChanged: undefined,
  regCapitalChanged: undefined,
  licenseAnnualOk: undefined,
  bizAddrChanged: undefined,
  equityStructChanged: undefined,
  fundCircleInRelated: undefined,
  industryChanged: undefined,
  mainBizChanged: undefined,
  keyCustomersChanged: undefined,
  upstreamChanged: undefined,
  processTechChanged: undefined,
  utilityTaxDecline: undefined,
  startupNormal: undefined,
  officeDisorder: undefined,
  newProjectLaunched: undefined,
  newBadCredit: undefined,
  involvedLawsuit: undefined,
  involvedPenalty: undefined,
  taxPaymentNormal: undefined,
  salaryPaidOnTime: [],
  cooperatePostLoan: undefined,
  leaseInPlace: undefined,
  leaseNormal: undefined,
  otherDescriptions: undefined,
  totalAssets: undefined,
  totalAssetsRemark: undefined,
  inventory: undefined,
  inventoryRemark: undefined,
  accountsReceivable: undefined,
  accountsReceivableRemark: undefined,
  totalLiabilities: undefined,
  totalLiabilitiesRemark: undefined,
  bankLoans: undefined,
  bankLoansRemark: undefined,
  accountsPayable: undefined,
  accountsPayableRemark: undefined,
  mainBizIncome: undefined,
  mainBizIncomeRemark: undefined,
  netProfit: undefined,
  netProfitRemark: undefined,
  debtAssetRatio: undefined,
  debtAssetRatioRemark: undefined,
  fsObviouslyFalse: undefined,
  fsObviouslyFalseReason: undefined,
  arSharpRiseDelay: undefined,
  arSharpRiseDelayReason: undefined,
  inventorySurge: undefined,
  inventorySurgeReason: undefined,
  bankDebtRise: undefined,
  bankDebtRiseReason: undefined,
  debtStructChange: undefined,
  debtStructChangeReason: undefined,
  currentRatioLow: undefined,
  currentRatioLowReason: undefined,
  costUpProfitDown: undefined,
  costUpProfitDownReason: undefined,
  cashBalanceDecline: undefined,
  cashBalanceDeclineReason: undefined,
  paymentDelay: undefined,
  paymentDelayReason: undefined,
  financialSituation: undefined,
  overallRiskEval: undefined,
  overallLeaseEval: undefined,
  riskMgmtSuggestion: undefined,
  status: undefined,
  processInstanceId: undefined,
  createTime: [],
  deptId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

const selectedIds = ref<number[]>([]) // 表格的选中 ID 数组
const selectedRows = ref<FinanceManageVO[]>([]) // 表格的选中 数据 数组
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
/** 表格选中事件 */
const handleSelectionChange = (rows: FinanceManageVO[]) => {
  selectedIds.value = rows.map((row) => row.id)
  selectedRows.value = rows.map((row) => row)
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FinanceManageApi.getFinanceManagePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await FinanceManageApi.deleteFinanceManage(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await FinanceManageApi.exportFinanceManage(queryParams)
    download.excel(data, '融资租赁租后管理.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 送审按钮操作 */
const sendApprove = async (id: number) => {
  try {
    // 送审的二次确认
    await message.sendApproveConfirm()
    // 发起删除
    await FinanceManageApi.sendApprove(id)
    message.success(t('common.sendApproveSuccess'))
    // 刷新列表
    await getList()
  } catch {
  } finally {

  }
}

/** 导出融资租赁业务租后检查登记表操作 */
const handleDocExport = async () => {
  try {
    if (selectedIds.value.length === 0) {
      message.warning('请选择需要导出的数据')
      return
    }
    if (selectedIds.value.length > 1) {
      message.warning('仅能选择一条数据进行导出')
      return
    }
    let vo = selectedRows.value[0];
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await FinanceManageApi.exportFinanceManageDoc(vo.id)
    download.excel(data, '融资租赁业务租后检查登记表' + vo.id + '.docx')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  getList()
  const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
  companyList.value = response

  // 加载租赁单编号选项
  await loadFinanceLeaseOptions()
})
</script>
