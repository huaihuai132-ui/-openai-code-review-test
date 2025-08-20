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
      <el-form-item label="融资租赁立项编号" prop="applicationId">
        <el-input
          v-model="queryParams.applicationId"
          placeholder="请输入融资租赁立项编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
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
      <el-form-item label="融资标的物名称" prop="leasedProperty">
        <el-input
          v-model="queryParams.leasedProperty"
          placeholder="请输入融资标的物名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="租赁模式" prop="leaseMode">
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
      <el-form-item label="担保方式" prop="lienMode">
        <el-select
          v-model="queryParams.lienMode"
          placeholder="请选择担保方式"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LIEN_MODE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['business:finance-lease:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:finance-lease:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出Excel
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleDocExport"
          :loading="exportLoading"
          v-hasPermi="['business:finance-lease:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出项目申请表
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleDeviceExport"
          :loading="exportLoading"
          v-hasPermi="['business:finance-device:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出项目设备清单
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
<!--      <el-table-column label="编号" align="center" prop="id" />-->
      <el-table-column label="项目申请编码" align="center" prop="leasedCode" />

      <el-table-column label="融资租赁立项编号" align="center" prop="applicationId" />
      <el-table-column label="企业" align="center" prop="companyId" />
      <el-table-column label="标的名称" align="center" prop="leasedProperty" />
      <el-table-column label="标的数量" align="center" prop="leasedPropertyNum" />
      <el-table-column label="标的净值" align="center" prop="leasedPropertyValue" />
      <el-table-column label="租赁模式" align="center" prop="leaseMode">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.LEASE_MODE" :value="scope.row.leaseMode" />
        </template>
      </el-table-column>
      <el-table-column label="担保方式" align="center" prop="lienMode">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.LIEN_MODE" :value="scope.row.lienMode" />
        </template>
      </el-table-column>
      <el-table-column label="申请额度" align="center" prop="leaseAmount" />
      <el-table-column
        label="承租时间"
        align="center"
        prop="leaseDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="承租租期" align="center" prop="leaseTerm" />
      <el-table-column label="利率" align="center" prop="interestRate" />
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
            v-hasPermi="['business:finance-lease:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="sendApprove(scope.row.id)"
            v-hasPermi="['business:finance-lease:sendApprove']"
          >
            送审
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:finance-lease:delete']"
          >
            删除
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:finance-device:query']"
          >
            查看设备清单
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
  <FinanceLeaseForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { FinanceLeaseApi, FinanceLeaseVO } from '@/api/business/financelease'
import FinanceLeaseForm from './FinanceLeaseForm.vue'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/financecompany";

/** 融资租赁 列表 */
defineOptions({ name: 'FinanceLease' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<FinanceLeaseVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  applicationId: undefined,
  companyId: undefined,
  leasedProperty: undefined,
  leasedPropertyNum: undefined,
  leasedPropertyValue: undefined,
  leaseMode: undefined,
  lienMode: undefined,
  leaseAmount: undefined,
  leaseDate: [],
  leaseTerm: undefined,
  interestRate: undefined,
  status: undefined,
  createTime: [],
  deptId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const selectedIds = ref<number[]>([]) // 表格的选中 ID 数组
const selectedRows = ref<FinanceLeaseVO[]>([]) // 表格的选中 数据 数组
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
/** 表格选中事件 */
const handleSelectionChange = (rows: FinanceLeaseVO[]) => {
  selectedIds.value = rows.map((row) => row.id)
  selectedRows.value = rows.map((row) => row)
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FinanceLeaseApi.getFinanceLeasePage(queryParams)
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
    await FinanceLeaseApi.deleteFinanceLease(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 送审按钮操作 */
const sendApprove = async (id: number) => {
  try {
    // 送审的二次确认
    await message.sendApproveConfirm()
    // 发起删除
    await FinanceLeaseApi.sendApprove(id)
    message.success(t('common.sendApproveSuccess'))
    // 刷新列表
    await getList()
  } catch {
  } finally {

  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await FinanceLeaseApi.exportFinanceLease(queryParams)
    download.excel(data, '融资租赁.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 导出项目申请表操作 */
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
    const data = await FinanceLeaseApi.exportFinanceLeaseDoc(vo.id)
    download.excel(data, '融资租赁项目申请表' + vo.id + '.docx')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 导出项目设备列表文档操作 */
const handleDeviceExport = async () => {
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
    const data = await FinanceLeaseApi.exportFinanceLeaseDeviceDoc(vo.id)
    download.excel(data, '融资租赁项目设备清单' + vo.id + '.docx')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  getList()
  const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
  companyList.value = response.data
})
</script>
