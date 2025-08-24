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
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="isEnabled">
        <el-select
          v-model="queryParams.isEnabled"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:carousel:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:carousel:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出Excel
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="标题" align="center" prop="title" min-width="120" />
      <el-table-column label="Banner图片" align="center" prop="bannerImage" width="120">
        <template #default="scope">
          <el-image
            :src="scope.row.bannerImage"
            :preview-src-list="[scope.row.bannerImage]"
            fit="cover"
            style="width: 80px; height: 50px; border-radius: 4px;"
          />
        </template>
      </el-table-column>
      <el-table-column label="跳转链接" align="center" prop="jumpLink" min-width="150" show-overflow-tooltip />
      <el-table-column label="启用状态" align="center" prop="isEnabled" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isEnabled === 1 ? 'success' : 'danger'">
            {{ scope.row.isEnabled === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="顺序" align="center" prop="sortOrder" width="80" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" min-width="200px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:carousel:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="success"
            @click="handleStatusChange(scope.row)"
            v-hasPermi="['business:carousel:update']"
          >
            {{ scope.row.isEnabled === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:carousel:delete']"
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
  <CarouselForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { CarouselApi, CarouselVO } from '@/api/business/carousel/index'
import CarouselForm from './CarouselForm.vue'
import download from '@/utils/download'

/** 轮播图管理 列表 */
defineOptions({ name: 'Carousel' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<CarouselVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  title: undefined,
  isEnabled: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const selectedIds = ref<number[]>([]) // 表格的选中 ID 数组
const selectedRows = ref<CarouselVO[]>([]) // 表格的选中 数据 数组

/** 表格选中事件 */
const handleSelectionChange = (rows: CarouselVO[]) => {
  selectedIds.value = rows.map((row) => row.id)
  selectedRows.value = rows.map((row) => row)
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CarouselApi.getCarouselPage(queryParams)
    console.log("----",data)
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
    await CarouselApi.deleteCarousel(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 状态变更操作 */
const handleStatusChange = async (row: CarouselVO) => {
  try {
    const newStatus = row.isEnabled === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'
    
    // 状态变更的二次确认
    await message.confirm(`确认要${statusText}该轮播图吗？`)
    
    // 发起状态变更 - 使用 updateCarousel 方法
    await CarouselApi.updateCarousel({
      ...row,
      isEnabled: newStatus
    })
    message.success(`${statusText}成功`)
    
    // 立即更新本地数据，确保界面立即响应
    row.isEnabled = newStatus
    
    // 刷新列表以确保数据同步
    await getList()
  } catch (error) {
    console.error('状态变更失败:', error)
    message.error('状态变更失败')
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CarouselApi.exportCarousel(queryParams)
    download.excel(data, '轮播图管理.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  getList()
})
</script>