<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="融资租赁放款表编号" prop="disbursementId">
        <el-input
          v-model="queryParams.disbursementId"
          placeholder="请输入融资租赁放款表编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
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
      <el-form-item label="还款时间" prop="repaymentDate">
        <el-date-picker
          v-model="queryParams.repaymentDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="还款状态" prop="repaymentStatus">
        <el-select
          v-model="queryParams.repaymentStatus"
          placeholder="请选择还款状态"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:finance-repayment:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:finance-repayment:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
<!--      <el-table-column label="融资租赁还款表单主键" align="center" prop="id" />-->
      <el-table-column label="融资租赁放款表编号" align="center" prop="disbursementId" />
      <el-table-column label="企业名称" align="center" prop="companyId" width="180">
        <template #default="scope">
          <span>{{ companyList.find((item) => item.id === scope.row.companyId)?.enterpriseName }}</span>
        </template>
      </el-table-column>      <el-table-column
        label="还款时间"
        align="center"
        prop="repaymentDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="租金" align="center" prop="rent" />
      <el-table-column label="利率" align="center" prop="interestRate" />
      <el-table-column
        label="还款本金"
        align="center"
        prop="capital"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="还款利息"
        align="center"
        prop="interest"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="还款状态" align="center" prop="repaymentStatus" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:finance-repayment:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:finance-repayment:delete']"
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
  <FinanceRepaymentForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { FinanceRepaymentApi, FinanceRepaymentVO } from '@/api/business/financerepayment'
import FinanceRepaymentForm from './FinanceRepaymentForm.vue'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/financecompany";

/** 融资租赁放款 列表 */
defineOptions({ name: 'FinanceRepayment' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<FinanceRepaymentVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  disbursementId: undefined,
  companyId: undefined,
  temporaryFlag: undefined,
  repaymentDate: [],
  rent: undefined,
  interestRate: undefined,
  capital: undefined,
  capital: [],
  interest: undefined,
  interest: [],
  repaymentStatus: undefined,
  filePath: undefined,
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
    const data = await FinanceRepaymentApi.getFinanceRepaymentPage(queryParams)
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
    await FinanceRepaymentApi.deleteFinanceRepayment(id)
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
    const data = await FinanceRepaymentApi.exportFinanceRepayment(queryParams)
    download.excel(data, '融资租赁放款.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
  const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
  companyList.value = response.data
})
</script>
