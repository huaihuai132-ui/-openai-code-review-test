<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="88px"
    >
      <el-form-item label="企业" prop="companyId">
        <el-select
          v-model="queryParams.companyId"
          placeholder="请选择企业"
          clearable
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
      <el-form-item label="标的名称" prop="leasedProperty">
        <el-input
          v-model="queryParams.leasedProperty"
          placeholder="请输入标的名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
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
      <el-form-item >
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:finance-application:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:finance-application:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出Excel
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleDocExport"
          :loading="exportLoading"
          v-hasPermi="['business:finance-application:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出立项审批表
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
<!--      <el-table-column label="编号" align="center" prop="id" />-->
      <el-table-column label="编号" align="center" prop="applicationCode" />
      <el-table-column label="企业" align="center" prop="companyId" />
      <el-table-column label="标的名称" align="center" prop="leasedProperty" />
      <el-table-column label="标的数量" align="center" prop="leasedPropertyNum" />
      <el-table-column label="标的净值" align="center" prop="leasedPropertyValue" />
      <el-table-column label="申请额度" align="center" prop="leaseAmount" />
      <el-table-column label="承租租期" align="center" prop="leaseTerm" />
      <el-table-column label="单据状态" align="center" prop="status" >
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:finance-application:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="sendApprove(scope.row.id)"
            v-hasPermi="['business:finance-application:sendApprove']"
          >
            送审
          </el-button>
          <el-button
            link
            type="danger"
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
  <FinanceApplicationForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getBoolDictOptions, DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { FinanceApplicationApi, FinanceApplicationVO } from '@/api/business/financeapplication'
import FinanceApplicationForm from './FinanceApplicationForm.vue'
import {FinanceLeaseApi} from "@/api/business/financelease";
import {FinanceManageVO} from "@/api/business/financemanage";
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/financecompany";
import * as UserApi from "@/api/system/user";

/** 融资租赁立项 列表 */
defineOptions({ name: 'FinanceApplication' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<FinanceApplicationVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  companyId: undefined,
  leasedProperty: undefined,
  leasedPropertyNum: undefined,
  leasedPropertyValue: undefined,
  leaseAmount: undefined,
  leaseTerm: undefined,
  restrictedByPolicy: undefined,
  advancedTechEquip: undefined,
  obsoleteOrOverdep: undefined,
  taxFraudRisk: undefined,
  landPermitOk: undefined,
  ehsCompliance: undefined,
  licenseAnnualOk: undefined,
  badCreditRecord: undefined,
  status: undefined,
  deptId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const selectedIds = ref<number[]>([]) // 表格的选中 ID 数组
const selectedRows = ref<FinanceApplicationVO[]>([]) // 表格的选中 数据 数组
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表

/** 表格选中事件 */
const handleSelectionChange = (rows: FinanceApplicationVO[]) => {
  selectedIds.value = rows.map((row) => row.id)
  selectedRows.value = rows.map((row) => row)
}
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FinanceApplicationApi.getFinanceApplicationPage(queryParams)
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
    await FinanceApplicationApi.deleteFinanceApplication(id)
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
    const data = await FinanceApplicationApi.exportFinanceApplication(queryParams)
    download.excel(data, '融资租赁立项.xls')
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
    await FinanceApplicationApi.sendApprove(id)
    message.success(t('common.sendApproveSuccess'))
    // 刷新列表
    await getList()
  } catch {
  } finally {

  }
}

/** 导出融资租赁立项申请表操作 */
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
    const data = await FinanceApplicationApi.exportFinanceApplicationDoc(vo.id)
    download.excel(data, '融资租赁项目立项审批表' + vo.id + '.docx')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  getList()
  // 加载岗位列表
  companyList.value = await FinanceCompanyApi.getSimpleFinanceCompanyList()
})
</script>
