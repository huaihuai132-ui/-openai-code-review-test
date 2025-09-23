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
      <el-form-item label="企业全称" prop="enterpriseName">
        <el-input
          v-model="queryParams.enterpriseName"
          placeholder="请输入企业全称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="统一社会信用代码" prop="creditCode">
        <el-input
          v-model="queryParams.creditCode"
          placeholder="请输入统一社会信用代码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="企业联系电话" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入企业联系电话"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:supply-chain-cooperating-enterprise:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:supply-chain-cooperating-enterprise:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="企业全称" align="center" prop="enterpriseName" />
      <el-table-column label="统一社会信用代码" align="center" prop="creditCode" />
      <el-table-column label="地址" align="center" prop="address" />
      <el-table-column label="所属行业" align="center" prop="industry" />
      <el-table-column label="注册资本(万)" align="center" prop="registeredCapital" />
      <el-table-column label="企业联系电话" align="center" prop="phone" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:supply-chain-cooperating-enterprise:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:supply-chain-cooperating-enterprise:delete']"
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
  <SupplyChainCooperatingEnterpriseForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { FinanceCompanyApi, FinanceCompanyVO } from '@/api/business/finance/financecompany'
import SupplyChainCooperatingEnterpriseForm from './SupplyChainCooperatingEnterpriseForm.vue'
import { DICT_TYPE, getStrDictOptions, getDictLabel } from '@/utils/dict'

/** 供应链金融合作企业管理 列表 */
defineOptions({ name: 'SupplyChainCooperatingEnterprise' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<FinanceCompanyVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  enterpriseName: undefined,
  creditCode: undefined,
  shortName: undefined,
  address: undefined,
  legalRepresentative: undefined,
  industry: undefined,
  registeredCapital: undefined,
  companyNature: undefined,
  mainBusiness: undefined,
  mainProducts: undefined,
  remark: undefined,
  createTime: [],
  deptId: undefined,
  phone: undefined,
  supplyChainFinancePartner: true // 只查询供应链金融合作企业
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FinanceCompanyApi.getFinanceCompanyPage(queryParams)
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
  // 重置后仍然保持只查询供应链金融合作企业
  queryParams.supplyChainFinancePartner = true
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 - 将供应链金融合作企业标志设为0 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.confirm('确定要移除该企业的供应链金融合作企业标识吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 获取企业详情
    const companyData = await FinanceCompanyApi.getFinanceCompany(id)
    
    // 将供应链金融合作企业标志设为false
    const updateData = {
      ...companyData,
      supplyChainFinancePartner: false
    }
    
    // 更新企业信息
    await FinanceCompanyApi.updateFinanceCompany(updateData)
    message.success('移除成功')
    
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
    const data = await FinanceCompanyApi.exportFinanceCompany(queryParams)
    download.excel(data, '供应链金融合作企业.xls')
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