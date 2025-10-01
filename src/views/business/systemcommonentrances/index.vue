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
      <el-form-item label="入口名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入入口名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="图标标识（如：ep:box）" prop="icon">
        <el-input
          v-model="queryParams.icon"
          placeholder="请输入图标标识（如：ep:box）"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="跳转链接" prop="url">
        <el-input
          v-model="queryParams.url"
          placeholder="请输入跳转链接"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="显示颜色（如：#F56C6C）" prop="color">
        <el-input
          v-model="queryParams.color"
          placeholder="请输入显示颜色（如：#F56C6C）"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="默认排序，值越小越靠前" prop="defaultOrder">
        <el-input
          v-model="queryParams.defaultOrder"
          placeholder="请输入默认排序，值越小越靠前"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <!-- <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="部门编号" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入部门编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <el-form-item label="显示端：WEB、APP、ALL（都显示）" prop="platform">
        <el-input
          v-model="queryParams.platform"
          placeholder="请输入显示端：WEB、APP、ALL（都显示）"
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
          v-hasPermi="['business:system-common-entrances:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:system-common-entrances:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <!-- <el-table-column label="主键ID" align="center" prop="id" /> -->
      <el-table-column label="入口名称" align="center" prop="name" />
      <el-table-column label="图标标识（如：ep:box）" align="center" prop="icon">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <Icon :icon="scope.row.icon" class="mr-2" v-if="scope.row.icon" />
            <span>{{ scope.row.icon }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="跳转链接" align="center" prop="url" />
      <el-table-column label="显示颜色（如：#F56C6C）" align="center" prop="color">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <div 
              class="w-4 h-4 rounded mr-2 border border-gray-300" 
              :style="{ backgroundColor: scope.row.color }"
              v-if="scope.row.color"
            ></div>
            <span>{{ scope.row.color }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="默认排序，值越小越靠前" align="center" prop="defaultOrder" />
      <!-- <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      /> -->
      <!-- <el-table-column label="部门编号" align="center" prop="deptId" /> -->
      <el-table-column label="显示端：WEB、APP、ALL（都显示）" align="center" prop="platform" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:system-common-entrances:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:system-common-entrances:delete']"
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
  <SystemCommonEntrancesForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { SystemCommonEntrancesApi, SystemCommonEntrancesVO } from '@/api/business/systemcommonentrances'
import SystemCommonEntrancesForm from './SystemCommonEntrancesForm.vue'

/** 系统常用入口（全局配置） 列表 */
defineOptions({ name: 'SystemCommonEntrances' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<SystemCommonEntrancesVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  icon: undefined,
  url: undefined,
  color: undefined,
  defaultOrder: undefined,
  createTime: [],
  deptId: undefined,
  platform: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SystemCommonEntrancesApi.getSystemCommonEntrancesPage(queryParams)
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
    await SystemCommonEntrancesApi.deleteSystemCommonEntrances(id)
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
    const data = await SystemCommonEntrancesApi.exportSystemCommonEntrances(queryParams)
    download.excel(data, '系统常用入口（全局配置）.xls')
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