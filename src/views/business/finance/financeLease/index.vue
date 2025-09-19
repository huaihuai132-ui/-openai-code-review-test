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
      <el-form-item label="立项编号" prop="applicationId">
        <el-select
          v-model="queryParams.applicationId"
          placeholder="请选择立项编号"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="item in applicationList"
            :key="item.id"
            :label="item.applicationCode"
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

      <el-table-column label="立项编号" align="center" prop="applicationId" />
      <el-table-column label="企业名称" align="center" prop="companyId" width="180">
        <template #default="scope">
          <span>{{ companyList.find((item) => item.id === scope.row.companyId)?.enterpriseName }}</span>
        </template>
      </el-table-column>
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
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status || 0" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="280px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            v-if="isShowEdit(scope.row)"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:finance-application:update']"
            :disabled="approveLoading[scope.row.id]"
          >
            编辑
          </el-button>
          <el-button
            link
            type="info"
            v-if="isShowDetail(scope.row)"
            @click="openForm('detail', scope.row.id)"
            v-hasPermi="['business:finance-application:query']"
            :disabled="approveLoading[scope.row.id]"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            v-if="isShowEdit(scope.row)"
            @click="sendApprove(scope.row.id)"
            v-hasPermi="['business:finance-application:sendApprove']"
            :disabled="approveLoading[scope.row.id]"
            :loading="approveLoading[scope.row.id]"
          >
            送审
          </el-button>
          <el-button
            link
            type="danger"
            v-if="isShowEdit(scope.row)"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:finance-application:delete']"
            :disabled="approveLoading[scope.row.id]"
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

  <!-- 设备清单对话框 -->
  <el-dialog
    v-model="deviceDialogVisible"
    title="设备清单"
    width="80%"
    :close-on-click-modal="true"
  >
    <DeviceListDisplay :device-list="deviceList" :loading="deviceLoading" />
  </el-dialog>

  <!-- 表单弹窗：添加/修改 -->
  <FinanceLeaseForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { FinanceLeaseApi, FinanceLeaseVO } from '@/api/business/finance/financelease'
import { FinanceDeviceApi } from '@/api/business/finance/financedevice'
import FinanceLeaseForm from './FinanceLeaseForm.vue'
import DeviceListDisplay from './components/DeviceListDisplay.vue'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/finance/financecompany";
import { status } from 'nprogress'
const approveLoading = ref<Record<number, boolean>>({}) // 送审按钮的加载状态，按ID管理
import {isShowEdit, isShowDetail} from "@/api/bpm/task";
import {
  FinanceApplicationApi,
  FinanceApplicationVO
} from "@/api/business/finance/financeapplication";

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
const applicationList = ref<FinanceApplicationVO[]>([]) // 融资租赁立项列表

// 设备清单相关变量
const deviceDialogVisible = ref(false)
const deviceList = ref<any[]>([])
const deviceLoading = ref(false)
const currentLeaseId = ref(0)
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

/** 查看设备清单按钮操作 */
const queryDeviceList = async (id: number) => {
  currentLeaseId.value = id
  deviceDialogVisible.value = true
  deviceLoading.value = true

  try {
    const data = await FinanceLeaseApi.getFinanceDeviceList(id)
    if (data && Array.isArray(data)) {
      deviceList.value = data
    } else {
      deviceList.value = []
    }
  } catch (error) {
    console.error('获取设备清单失败', error)
    deviceList.value = []
    message.error('获取设备清单失败')
  } finally {
    deviceLoading.value = false
  }
}



/** 送审按钮操作 */
const sendApprove = async (id: number) => {
  try {
    // 送审的二次确认
    await message.sendApproveConfirm()
    // 设置加载状态
    approveLoading.value[id] = true
    // 发起送审
    await FinanceLeaseApi.sendApprove(id)
    message.success(t('common.sendApproveSuccess'))
    // 刷新列表
    await getList()
  } catch {
  } finally {
    // 清除加载状态
    approveLoading.value[id] = false
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

    // 前端校验：检查该租赁项目是否有设备信息
    try {
      const deviceData = await FinanceLeaseApi.getFinanceDeviceList(vo.id)
      if (!deviceData || !Array.isArray(deviceData) || deviceData.length === 0) {
        message.warning('该租赁项目下没有设备信息，无法导出设备清单')
        return
      }
    } catch (error) {
      console.error('检查设备信息失败:', error)
      message.error('检查设备信息失败，请稍后重试')
      return
    }

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
  companyList.value = response
  const applicationListResponse = await FinanceApplicationApi.getSimpleFinanceApplicationList()
  applicationList.value = applicationListResponse

})
</script>
