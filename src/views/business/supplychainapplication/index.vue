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
      <el-form-item label="申请时间" prop="applicationTime">
        <el-date-picker
          v-model="queryParams.applicationTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:supplychain-application:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:supplychain-application:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
<!--      <el-table-column label="供应链金融立项表单主键" align="center" prop="id" />-->
<!--      <el-table-column label="申请人的用户编号" align="center" prop="userId" />-->
      <el-table-column label="企业名称" align="center" prop="companyId" width="180">
        <template #default="scope">
          <span>{{ companyList.find((item) => item.id === scope.row.companyId)?.enterpriseName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请产品类型" align="center" prop="applicationType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SUPPLYCHAIN_PRODUCT" :value="scope.row.applicationType" />
        </template>
      </el-table-column>
      <el-table-column label="立项申请名称" align="center" prop="applicationName" />
      <el-table-column label="单据状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="申请状态" align="center" prop="applicationStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SUPPLYCHAIN_APPLYSTATUS" :value="scope.row.applicationStatus" />
        </template>
      </el-table-column>
      <el-table-column
        label="申请时间"
        align="center"
        prop="applicationTime"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            v-if="isShowEdit(scope.row)"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:supplychain-application:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            v-if="isShowEdit(scope.row)"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:supplychain-application:delete']"
          >
            删除
          </el-button>
          <el-button
            link
            type="primary"
            v-if="isShowEdit(scope.row)"
            @click="sendApprove(scope.row.id)"
            v-hasPermi="['business:supplychain-application:sendApprove']"
          >
            送审
          </el-button>
          <el-button
            link
            type="info"
            v-if="isShowDetail(scope.row)"
            @click="openForm('detail', scope.row.id)"
            v-hasPermi="['business:supplychain-application:query']"
          >
            详情
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
  <SupplychainApplicationForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import {dateFormatter, dateFormatter2} from '@/utils/formatTime'
import download from '@/utils/download'
import { SupplychainApplicationApi, SupplychainApplicationVO } from '@/api/business/supplychainapplication'
import SupplychainApplicationForm from './SupplychainApplicationForm.vue'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/finance/financecompany";
import {FinanceLeaseApi} from "@/api/business/finance/financelease";
import {isShowDetail, isShowEdit} from "@/api/bpm/task";

/** 供应链金融立项 列表 */
defineOptions({ name: 'SupplychainApplication' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<SupplychainApplicationVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  companyId: undefined,
  applicationType: undefined,
  applicationName: undefined,
  applicationTime: [],
  applicationStatus: undefined,
  filePath: undefined,
  status: undefined,
  processInstanceId: undefined,
  createTime: [],
  deptId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SupplychainApplicationApi.getSupplychainApplicationPage(queryParams)
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
    await SupplychainApplicationApi.deleteSupplychainApplication(id)
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
    await SupplychainApplicationApi.sendApprove(id)
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
    const data = await SupplychainApplicationApi.exportSupplychainApplication(queryParams)
    download.excel(data, '供应链金融立项.xls')
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
})
</script>
