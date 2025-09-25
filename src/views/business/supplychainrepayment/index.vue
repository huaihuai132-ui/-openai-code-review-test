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
      <el-form-item label="企业id" prop="companyId">
        <el-input
          v-model="queryParams.companyId"
          placeholder="请输入企业id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="供应商id" prop="supplierId">
        <el-input
          v-model="queryParams.supplierId"
          placeholder="请输入供应商id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
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
          v-hasPermi="['business:supplychain-repayment:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:supplychain-repayment:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="申请人" align="center" prop="userId" />
      <el-table-column label="企业" align="center" prop="companyId" />
      <el-table-column label="供应商" align="center" prop="supplierId" />
      <el-table-column label="供应商账户" align="center" prop="supplierAccountId" />
      <el-table-column
        label="申请时间"
        align="center"
        prop="applicationTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="资金来源" align="center" prop="fundSource" />
      <el-table-column label="产品名称" align="center" prop="metalId" />
      <el-table-column label="数量" align="center" prop="metalWeight" />
      <el-table-column label="单价" align="center" prop="metalPrice" />
      <el-table-column label="总价" align="center" prop="repaymentAmount" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="单据状态" align="center" prop="status" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:supplychain-repayment:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:supplychain-repayment:delete']"
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
  <SupplychainRepaymentForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { SupplychainRepaymentApi, SupplychainRepaymentVO } from '@/api/business/supplychainrepayment'
import SupplychainRepaymentForm from './SupplychainRepaymentForm.vue'

/** 供应链金融付款申请 列表 */
defineOptions({ name: 'SupplychainRepayment' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<SupplychainRepaymentVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  applyDept: undefined,
  companyId: undefined,
  supplierId: undefined,
  supplierAccountId: undefined,
  applicationTime: [],
  fundSource: undefined,
  metalId: undefined,
  metalWeight: undefined,
  metalPrice: undefined,
  repaymentAmount: undefined,
  remark: undefined,
  filePath: undefined,
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
    const data = await SupplychainRepaymentApi.getSupplychainRepaymentPage(queryParams)
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
    await SupplychainRepaymentApi.deleteSupplychainRepayment(id)
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
    const data = await SupplychainRepaymentApi.exportSupplychainRepayment(queryParams)
    download.excel(data, '供应链金融付款申请.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
