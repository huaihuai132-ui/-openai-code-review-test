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
      <el-form-item label="租赁信息唯一code" prop="rentalCode">
        <el-input
          v-model="queryParams.rentalCode"
          placeholder="请输入租赁信息唯一code"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="承租户id，关联business_assets_renter.id" prop="renterId">
        <el-input
          v-model="queryParams.renterId"
          placeholder="请输入承租户id，关联business_assets_renter.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="押金(元)" prop="deposit">
        <el-input
          v-model="queryParams.deposit"
          placeholder="请输入押金(元)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="年租金(元)" prop="annualRent">
        <el-input
          v-model="queryParams.annualRent"
          placeholder="请输入年租金(元)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="收租方式：0-年租，1-月租，2-季度租，3-半年租，字典键business_asset_rent_type" prop="rentType">
        <el-select
          v-model="queryParams.rentType"
          placeholder="请选择收租方式：0-年租，1-月租，2-季度租，3-半年租，字典键business_asset_rent_type"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="合同开始日期" prop="contractStartDate">
        <el-date-picker
          v-model="queryParams.contractStartDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="合同结束日期" prop="contractEndDate">
        <el-date-picker
          v-model="queryParams.contractEndDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="收租截止期限" prop="rentEndDate">
        <el-date-picker
          v-model="queryParams.rentEndDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="经营用途" prop="businessPurpose">
        <el-input
          v-model="queryParams.businessPurpose"
          placeholder="请输入经营用途"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="资产ID，关联business_asset_basic_info.id" prop="assetId">
        <el-input
          v-model="queryParams.assetId"
          placeholder="请输入资产ID，关联business_asset_basic_info.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="外部资产名称" prop="assetName">
        <el-input
          v-model="queryParams.assetName"
          placeholder="请输入外部资产名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="合同状态：0-草稿，1-生效中，2-失效，3-自动过期，4-完结，字典键business_assets_contract_status" prop="contractStatus">
        <el-select
          v-model="queryParams.contractStatus"
          placeholder="请选择合同状态：0-草稿，1-生效中，2-失效，3-自动过期，4-完结，字典键business_assets_contract_status"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="合同文件id列表" prop="filePath">
        <el-input
          v-model="queryParams.filePath"
          placeholder="请输入合同文件id列表"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="文件序列编码" prop="sequenceCode">
        <el-input
          v-model="queryParams.sequenceCode"
          placeholder="请输入文件序列编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="备注信息" prop="remarks">
        <el-input
          v-model="queryParams.remarks"
          placeholder="请输入备注信息"
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
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:asset-rental-info:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:asset-rental-info:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="租赁信息ID" align="center" prop="id" />
      <el-table-column label="租赁信息唯一code" align="center" prop="rentalCode" />
      <el-table-column label="承租户id，关联business_assets_renter.id" align="center" prop="renterId" />
      <el-table-column label="押金(元)" align="center" prop="deposit" />
      <el-table-column label="年租金(元)" align="center" prop="annualRent" />
      <el-table-column label="收租方式：0-年租，1-月租，2-季度租，3-半年租，字典键business_asset_rent_type" align="center" prop="rentType" />
      <el-table-column label="合同开始日期" align="center" prop="contractStartDate" />
      <el-table-column label="合同结束日期" align="center" prop="contractEndDate" />
      <el-table-column label="收租截止期限" align="center" prop="rentEndDate" />
      <el-table-column label="经营用途" align="center" prop="businessPurpose" />
      <el-table-column label="资产ID，关联business_asset_basic_info.id" align="center" prop="assetId" />
      <el-table-column label="外部资产名称" align="center" prop="assetName" />
      <el-table-column label="合同状态：0-草稿，1-生效中，2-失效，3-自动过期，4-完结，字典键business_assets_contract_status" align="center" prop="contractStatus" />
      <el-table-column label="合同文件id列表" align="center" prop="filePath" />
      <el-table-column label="文件序列编码" align="center" prop="sequenceCode" />
      <el-table-column label="备注信息" align="center" prop="remarks" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:asset-rental-info:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:asset-rental-info:delete']"
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
  <AssetRentalInfoForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { AssetRentalInfoApi, AssetRentalInfoVO } from '@/api/business/asset/assetRentalInfo'
import AssetRentalInfoForm from './AssetRentalInfoForm.vue'

/** 资产租赁信息 列表 */
defineOptions({ name: 'AssetRentalInfo' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<AssetRentalInfoVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  rentalCode: undefined,
  renterId: undefined,
  deposit: undefined,
  annualRent: undefined,
  rentType: undefined,
  contractStartDate: [],
  contractEndDate: [],
  rentEndDate: [],
  businessPurpose: undefined,
  assetId: undefined,
  assetName: undefined,
  contractStatus: undefined,
  filePath: undefined,
  sequenceCode: undefined,
  remarks: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AssetRentalInfoApi.getAssetRentalInfoPage(queryParams)
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
    await AssetRentalInfoApi.deleteAssetRentalInfo(id)
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
    const data = await AssetRentalInfoApi.exportAssetRentalInfo(queryParams)
    download.excel(data, '资产租赁信息.xls')
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
