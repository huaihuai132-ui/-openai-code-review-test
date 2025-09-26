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
      <el-form-item label="企业名" prop="companyId">
        <el-select
          v-model="queryParams.companyId"
          clearable
          filterable
          remote
          :remote-method="fetchCompanies"
          :loading="companyLoading"
          placeholder="请选择企业"
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
      <el-form-item label="供应商名称" prop="supplierId">
        <el-select
          v-model="queryParams.supplierId"
          clearable
          filterable
          remote
          :remote-method="fetchSuppliers"
          :loading="supplierLoading"
          placeholder="请选择供应商"
          class="!w-240px"
        >
          <el-option
            v-for="item in supplierList"
            :key="item.id"
            :label="item.supplierName"
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
      <el-table-column label="申请人" align="center" prop="userId">
        <template #default="scope">
          <span>{{ getUserNickName(scope.row.userId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="企业" align="center" prop="companyId">
        <template #default="scope">
          <span>{{ getCompanyName(scope.row.companyId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="供应商" align="center" prop="supplierId">
        <template #default="scope">
          <span>{{ getSupplierName(scope.row.supplierId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="供应商账户" align="center" prop="supplierAccountId">
        <template #default="scope">
          <span>{{ getSupplierAccountName(scope.row.supplierAccountId) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="申请时间"
        align="center"
        prop="applicationTime"
        :formatter="dateYmdFormatter"
        width="180px"
      />
      <el-table-column label="资金来源" align="center" prop="fundSource" />
      <el-table-column label="产品名称" align="center" prop="metalId">
        <template #default="scope">
          <span>{{ getMaterialName(scope.row.metalId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" prop="metalWeight" />
      <el-table-column label="单价" align="center" prop="metalPrice" />
      <el-table-column label="总价" align="center" prop="repaymentAmount" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="单据状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status || 0" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="150px">
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
            type="success"
            @click="handleSendApprove(scope.row.id)"
            v-hasPermi="['business:supplychain-repayment:sendApprove']"
            :disabled="scope.row.status !== -1"
          >
            送审
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
import {dateFormatter} from '@/utils/formatTime'
import download from '@/utils/download'
import {SupplychainRepaymentApi, SupplychainRepaymentVO} from '@/api/business/supplychainrepayment'
import SupplychainRepaymentForm from './SupplychainRepaymentForm.vue'
import * as UserApi from '@/api/system/user'
import {DICT_TYPE} from '@/utils/dict'
import {FinanceCompanyApi, FinanceCompanyVO} from '@/api/business/finance/financecompany'
import {SupplychainMaterialsApi, SupplychainMaterialsVO} from '@/api/business/supplychainmaterials'
import {
  SupplychainSupplierAccountVO,
  SupplychainSupplierApi,
  SupplychainSupplierVO
} from '@/api/business/supplychainsupplier'

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

// 企业列表
const companyList = ref<FinanceCompanyVO[]>([])
// 供应商列表
const supplierList = ref<SupplychainSupplierVO[]>([])
// 材料列表
const materialsList = ref<SupplychainMaterialsVO[]>([])
// 供应商账户列表
const supplierAccountList = ref<SupplychainSupplierAccountVO[]>([])
// 用户列表
const userList = ref<UserApi.UserVO[]>([])

// 加载状态
const companyLoading = ref(false)
const supplierLoading = ref(false)

/** 获取用户昵称 */
const getUserNickName = (userId: number) => {
  const user = userList.value.find(user => user.id === userId)
  return user ? user.nickname : userId
}

/** 获取企业名称 */
const getCompanyName = (companyId: number) => {
  const company = companyList.value.find(company => company.id === companyId)
  return company ? company.enterpriseName : companyId
}

/** 获取材料名称 */
const getMaterialName = (materialId: string) => {
  const material = materialsList.value.find(material => material.id == materialId)
  return material ? material.materialsName : materialId
}

/** 获取供应商名称 */
const getSupplierName = (supplierId: number) => {
  const supplier = supplierList.value.find(supplier => supplier.id === supplierId)
  return supplier ? supplier.supplierName : supplierId
}

/** 获取供应商账户名称 */
const getSupplierAccountName = (accountId: number) => {
  const account = supplierAccountList.value.find(account => account.id === accountId)
  return account ? account.accountName : accountId
}

/** 日期格式化为 YYYY-MM-DD */
const dateYmdFormatter = (row: any, column: any, cellValue: any) => {
  if (!cellValue) return ''
  // 使用dateFormatter格式化日期，然后只取日期部分
  const formatted = dateFormatter(row, column, cellValue)
  return formatted.split(' ')[0] // 只返回日期部分 YYYY-MM-DD
}

/** 获取企业列表（支持模糊搜索） */
const fetchCompanies = async (query: string) => {
  companyLoading.value = true
  try {
    const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
    if (query) {
      companyList.value = response.filter(company => 
        company.enterpriseName.toLowerCase().includes(query.toLowerCase())
      )
    } else {
      companyList.value = response
    }
  } catch (error) {
    console.error('获取企业列表失败:', error)
    companyList.value = []
  } finally {
    companyLoading.value = false
  }
}

/** 获取供应商列表（支持模糊搜索） */
const fetchSuppliers = async (query: string) => {
  supplierLoading.value = true
  try {
    const response = await SupplychainSupplierApi.getSimpleSupplychainSupplierList()
    if (query) {
      supplierList.value = response.filter(supplier => 
        supplier.supplierName.toLowerCase().includes(query.toLowerCase())
      )
    } else {
      supplierList.value = response
    }
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    supplierList.value = []
  } finally {
    supplierLoading.value = false
  }
}

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

/** 送审按钮操作 */
const handleSendApprove = async (id: number) => {
  try {
    // 送审的二次确认
    await message.confirm('确定要送审该申请吗？')
    // 发起送审
    await SupplychainRepaymentApi.sendApprove(id)
    message.success(t('送审成功'))
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
onMounted(async () => {
  await getList()
  // 获取用户列表
  userList.value = await UserApi.getSimpleUserList()
  // 获取企业列表
  await fetchCompanies('')
  // 获取供应商列表
  await fetchSuppliers('')
  // 获取材料列表
  materialsList.value = await SupplychainMaterialsApi.getSimpleList()
  // 获取供应商账户列表
  supplierAccountList.value = await SupplychainSupplierApi.getSimpleSupplychainSupplierAccountList()
})
</script>
