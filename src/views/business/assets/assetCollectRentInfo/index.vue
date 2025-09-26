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
      <el-form-item label="收租记录唯一code" prop="collectRentCode">
        <el-input
          v-model="queryParams.collectRentCode"
          placeholder="请输入收租记录唯一code"
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
      <el-form-item label="租赁信息ID，business_asset_rental_info.id" prop="rentalId">
        <el-input
          v-model="queryParams.rentalId"
          placeholder="请输入租赁信息ID，business_asset_rental_info.id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="承租人id" prop="renterId">
        <el-input
          v-model="queryParams.renterId"
          placeholder="请输入承租人id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="办理人/收租人id" prop="handleManId">
        <el-input
          v-model="queryParams.handleManId"
          placeholder="请输入办理人/收租人id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="账单名称" prop="rentBillName">
        <el-input
          v-model="queryParams.rentBillName"
          placeholder="请输入账单名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="预计收取租金(元)" prop="planRentCount">
        <el-input
          v-model="queryParams.planRentCount"
          placeholder="请输入预计收取租金(元)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="实际收取租金(元)" prop="actualRentCount">
        <el-input
          v-model="queryParams.actualRentCount"
          placeholder="请输入实际收取租金(元)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="账单文件id列表" prop="filePath">
        <el-input
          v-model="queryParams.filePath"
          placeholder="请输入账单文件id列表"
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
      <el-form-item label="预计收租日期" prop="planCollectDate">
        <el-date-picker
          v-model="queryParams.planCollectDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="实际收租日期" prop="actualCollectDate">
        <el-date-picker
          v-model="queryParams.actualCollectDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
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
          v-hasPermi="['business:asset-collect-rent-info:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:asset-collect-rent-info:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="收租记录ID" align="center" prop="id" />
      <el-table-column label="收租记录唯一code" align="center" prop="collectRentCode" />
      <el-table-column label="资产ID，关联business_asset_basic_info.id" align="center" prop="assetId" />
      <el-table-column label="租赁信息ID，business_asset_rental_info.id" align="center" prop="rentalId" />
      <el-table-column label="承租人id" align="center" prop="renterId" />
      <el-table-column label="办理人/收租人id" align="center" prop="handleManId" />
      <el-table-column label="账单名称" align="center" prop="rentBillName" />
      <el-table-column label="预计收取租金(元)" align="center" prop="planRentCount" />
      <el-table-column label="实际收取租金(元)" align="center" prop="actualRentCount" />
      <el-table-column label="账单文件id列表" align="center" prop="filePath" />
      <el-table-column label="文件序列编码" align="center" prop="sequenceCode" />
      <el-table-column label="预计收租日期" align="center" prop="planCollectDate" />
      <el-table-column label="实际收租日期" align="center" prop="actualCollectDate" />
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
            v-hasPermi="['business:asset-collect-rent-info:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:asset-collect-rent-info:delete']"
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
  <AssetCollectRentInfoForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { AssetCollectRentInfoApi, AssetCollectRentInfoVO } from '@/api/business/asset/assetCollectRentInfo'
import AssetCollectRentInfoForm from './AssetCollectRentInfoForm.vue'

/** 收租记录 列表 */
defineOptions({ name: 'AssetCollectRentInfo' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<AssetCollectRentInfoVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  collectRentCode: undefined,
  assetId: undefined,
  rentalId: undefined,
  renterId: undefined,
  handleManId: undefined,
  rentBillName: undefined,
  planRentCount: undefined,
  actualRentCount: undefined,
  filePath: undefined,
  sequenceCode: undefined,
  planCollectDate: [],
  actualCollectDate: [],
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AssetCollectRentInfoApi.getAssetCollectRentInfoPage(queryParams)
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
    await AssetCollectRentInfoApi.deleteAssetCollectRentInfo(id)
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
    const data = await AssetCollectRentInfoApi.exportAssetCollectRentInfo(queryParams)
    download.excel(data, '收租记录.xls')
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
