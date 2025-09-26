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
      <el-form-item label="资产编码" prop="assetCode">
        <el-input
          v-model="queryParams.assetCode"
          placeholder="请输入资产编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="资产名称" prop="assetName">
        <el-input
          v-model="queryParams.assetName"
          placeholder="请输入资产名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="地址12位编码，只用到9位，2省 4市 6区县 9街道 " prop="addressCode">
        <el-input
          v-model="queryParams.addressCode"
          placeholder="请输入地址12位编码，只用到9位，2省 4市 6区县 9街道 "
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="请输入详细地址"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="原产权单位" prop="originalOwnershipUnit">
        <el-input
          v-model="queryParams.originalOwnershipUnit"
          placeholder="请输入原产权单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="移交单位" prop="transferUnit">
        <el-input
          v-model="queryParams.transferUnit"
          placeholder="请输入移交单位"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="建筑面积(平方米)" prop="buildingArea">
        <el-input
          v-model="queryParams.buildingArea"
          placeholder="请输入建筑面积(平方米)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="土地面积(平方米)" prop="landArea">
        <el-input
          v-model="queryParams.landArea"
          placeholder="请输入土地面积(平方米)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="产权证号" prop="propertyNumber">
        <el-input
          v-model="queryParams.propertyNumber"
          placeholder="请输入产权证号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否办证过户: 0-未过户, 1-已过户，字典键business_assets_is_transferred" prop="isTransferred">
        <el-input
          v-model="queryParams.isTransferred"
          placeholder="请输入是否办证过户: 0-未过户, 1-已过户，字典键business_assets_is_transferred"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="产权证到期时间" prop="transferredDate">
        <el-date-picker
          v-model="queryParams.transferredDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="办证过程中遇到的问题" prop="transferIssues">
        <el-input
          v-model="queryParams.transferIssues"
          placeholder="请输入办证过程中遇到的问题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="使用情况：0-闲置,1-出租,2-自用，字典键business_assets_usage" prop="usage">
        <el-input
          v-model="queryParams.usage"
          placeholder="请输入使用情况：0-闲置,1-出租,2-自用，字典键business_assets_usage"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="出租方式：0-整租,1-分租,2-自用，字典键business_assets_rental_method" prop="rentalMethod">
        <el-input
          v-model="queryParams.rentalMethod"
          placeholder="请输入出租方式：0-整租,1-分租,2-自用，字典键business_assets_rental_method"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="资产价值(万元)" prop="assetValue">
        <el-input
          v-model="queryParams.assetValue"
          placeholder="请输入资产价值(万元)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="资产类型: 0-经营性资产, 1-非经营性资产，字典键business_assets_type" prop="assetType">
        <el-select
          v-model="queryParams.assetType"
          placeholder="请选择资产类型: 0-经营性资产, 1-非经营性资产，字典键business_assets_type"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="划拨文件id列表" prop="filePath">
        <el-input
          v-model="queryParams.filePath"
          placeholder="请输入划拨文件id列表"
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
      <el-form-item label="经度坐标" prop="longitude">
        <el-input
          v-model="queryParams.longitude"
          placeholder="请输入经度坐标"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="纬度坐标" prop="latitude">
        <el-input
          v-model="queryParams.latitude"
          placeholder="请输入纬度坐标"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="资产状态: 0-停用, 1-正常，字典键business_assets_status" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择资产状态: 0-停用, 1-正常，字典键business_assets_status"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
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
          v-hasPermi="['business:asset-basic-info:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:asset-basic-info:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="资产ID，主键" align="center" prop="id" />
      <el-table-column label="资产编码" align="center" prop="assetCode" />
      <el-table-column label="资产名称" align="center" prop="assetName" />
      <el-table-column label="地址12位编码，只用到9位，2省 4市 6区县 9街道 " align="center" prop="addressCode" />
      <el-table-column label="详细地址" align="center" prop="address" />
      <el-table-column label="原产权单位" align="center" prop="originalOwnershipUnit" />
      <el-table-column label="移交单位" align="center" prop="transferUnit" />
      <el-table-column label="建筑面积(平方米)" align="center" prop="buildingArea" />
      <el-table-column label="土地面积(平方米)" align="center" prop="landArea" />
      <el-table-column label="产权证号" align="center" prop="propertyNumber" />
      <el-table-column label="是否办证过户: 0-未过户, 1-已过户，字典键business_assets_is_transferred" align="center" prop="isTransferred" />
      <el-table-column
        label="产权证到期时间"
        align="center"
        prop="transferredDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="办证过程中遇到的问题" align="center" prop="transferIssues" />
      <el-table-column label="使用情况：0-闲置,1-出租,2-自用，字典键business_assets_usage" align="center" prop="usage" />
      <el-table-column label="出租方式：0-整租,1-分租,2-自用，字典键business_assets_rental_method" align="center" prop="rentalMethod" />
      <el-table-column label="资产价值(万元)" align="center" prop="assetValue" />
      <el-table-column label="资产类型: 0-经营性资产, 1-非经营性资产，字典键business_assets_type" align="center" prop="assetType" />
      <el-table-column label="划拨文件id列表" align="center" prop="filePath" />
      <el-table-column label="文件序列编码" align="center" prop="sequenceCode" />
      <el-table-column label="经度坐标" align="center" prop="longitude" />
      <el-table-column label="纬度坐标" align="center" prop="latitude" />
      <el-table-column label="资产状态: 0-停用, 1-正常，字典键business_assets_status" align="center" prop="status" />
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
            v-hasPermi="['business:asset-basic-info:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:asset-basic-info:delete']"
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
  <AssetBasicInfoForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { AssetBasicInfoApi, AssetBasicInfoVO } from 'src/api/business/asset/assetBasicInfo'
import AssetBasicInfoForm from './AssetBasicInfoForm.vue'

/** 资产基本信息 列表 */
defineOptions({ name: 'AssetBasicInfo' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<AssetBasicInfoVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  assetCode: undefined,
  assetName: undefined,
  addressCode: undefined,
  address: undefined,
  originalOwnershipUnit: undefined,
  transferUnit: undefined,
  buildingArea: undefined,
  landArea: undefined,
  propertyNumber: undefined,
  isTransferred: undefined,
  transferredDate: [],
  transferIssues: undefined,
  usage: undefined,
  rentalMethod: undefined,
  assetValue: undefined,
  assetType: undefined,
  filePath: undefined,
  sequenceCode: undefined,
  longitude: undefined,
  latitude: undefined,
  status: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AssetBasicInfoApi.getAssetBasicInfoPage(queryParams)
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
    await AssetBasicInfoApi.deleteAssetBasicInfo(id)
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
    const data = await AssetBasicInfoApi.exportAssetBasicInfo(queryParams)
    download.excel(data, '资产基本信息.xls')
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
