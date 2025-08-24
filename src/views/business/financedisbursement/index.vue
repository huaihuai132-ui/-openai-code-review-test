<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="false"
      label-width="68px"
    >
      <!-- 第一行：三个字段 -->
      <div class="form-row">
        <el-form-item  label-width="120px"  label="融资租赁单编号" prop="leaseId" >
          <el-input
            v-model="queryParams.leaseId"
            placeholder="请输入融资租赁单编号"
            clearable
            @keyup.enter="handleQuery"
            class="!w-240px"
          />
        </el-form-item>

      <el-form-item  label-width="120px"  label="企业名称" prop="companyId"  >
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
      <el-form-item  label-width="120px"  label="放款申请编码" prop="disbursementCode" >
        <el-input
          v-model="queryParams.disbursementCode"
          placeholder="请输入放款申请编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      </div>

      <!-- 第二行：三个字段 -->
      <div class="form-row">
      <el-form-item  label-width="120px"  label="项目名称" prop="projectName" >
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item  label-width="120px"  label="单据状态" prop="status">
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
        <el-form-item  label-width="120px"  label="租赁模式" prop="leaseMode">
          <el-select
            v-model="queryParams.leaseMode"
            placeholder="请选择租赁模式"
            clearable
            class="!w-240px"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.LEASE_MODE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 第三行：操作按钮 -->
      <div class="form-row">
        <el-form-item  label-width="120px"  label="主要租赁物名称" prop="propertyMain" >
          <el-input
            v-model="queryParams.propertyMain"
            placeholder="请输入主要租赁物名称"
            clearable
            @keyup.enter="handleQuery"
            class="!w-240px"
          />
        </el-form-item>

        <el-form-item  label-width="170px"  label="承租租期" prop="leaseTerm">
          <el-input
            v-model="queryParams.leaseTerm"
            placeholder="请输入承租租期"
            clearable
            @keyup.enter="handleQuery"
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item label-width="120px">
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
          <el-button
            type="primary"
            plain
            @click="openForm('create')"
            v-hasPermi="['business:finance-disbursement:create']"
          >
            <Icon icon="ep:plus" class="mr-5px" /> 新增
          </el-button>
          <el-button
            type="success"
            plain
            @click="handleExport"
            :loading="exportLoading"
            v-hasPermi="['business:finance-disbursement:export']"
          >
            <Icon icon="ep:download" class="mr-5px" /> 导出
          </el-button>
        </el-form-item>
      </div>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
<!--      <el-table-column label="融资租赁放款表单主键" align="center" prop="id" />-->
      <el-table-column label="融资租赁单编号" align="center" prop="leaseId"  />
      <el-table-column label="企业名称" align="center" prop="companyId" width="180">
        <template #default="scope">
          <span>{{ companyList.find((item) => item.id === scope.row.companyId)?.enterpriseName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="放款申请编码" align="center" prop="disbursementCode" />
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="租赁模式" align="center" prop="leaseMode">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.LEASE_MODE" :value="scope.row.leaseMode" />
        </template>
      </el-table-column>
      <el-table-column label="主要租赁物名称" align="center" prop="propertyMain"  />
      <el-table-column label="承租租期" align="center" prop="leaseTerm" />
      <el-table-column label="本次金额" align="center" prop="thistimeAmount" />
      <el-table-column label="累计金额" align="center" prop="accruedAmount" />
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
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:finance-disbursement:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:finance-disbursement:delete']"
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
  <FinanceDisbursementForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/utils/download'
import { FinanceDisbursementApi, FinanceDisbursementVO } from '@/api/business/financedisbursement'
import FinanceDisbursementForm from './FinanceDisbursementForm.vue'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/financecompany";
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表

/** 融资租赁放款 列表 */
defineOptions({ name: 'FinanceDisbursement' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<FinanceDisbursementVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  leaseId: undefined,
  userId: undefined,
  companyId: undefined,
  disbursementCode: undefined,
  projectName: undefined,
  leaseMode: undefined,
  propertyMain: undefined,
  propertyOriginalValue: undefined,
  propertyAssessmentValue: undefined,
  usefulLife: undefined,
  leaseAmount: undefined,
  leaseTerm: undefined,
  depositAmount: undefined,
  putNumbers: undefined,
  interestRate: undefined,
  serveRate: undefined,
  repaymentMode: undefined,
  thistimeAmount: undefined,
  accruedAmount: undefined,
  beneficiaryName: undefined,
  beneficiaryBanklocation: undefined,
  beneficiaryAccount: undefined,
  fileList: undefined,
  status: undefined,
  processInstanceId: undefined,
  createTime: [],
  deptId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FinanceDisbursementApi.getFinanceDisbursementPage(queryParams)
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
    await FinanceDisbursementApi.deleteFinanceDisbursement(id)
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
    const data = await FinanceDisbursementApi.exportFinanceDisbursement(queryParams)
    download.excel(data, '融资租赁放款.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  getList()
  // 加载岗位列表
  const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
  companyList.value = response
})
</script>

<style scoped>
/* 表单行样式 */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
  min-width: 0;
}

/* 第三行按钮组样式 */
.form-row:last-child .el-form-item {
  flex: none;
}

.form-row:last-child .el-form-item .el-button {
  margin-right: 10px;
}

.form-row:last-child .el-form-item .el-button:last-child {
  margin-right: 0;
}
</style>
