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
      <el-form-item label="用户名称" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="系统常用入口" prop="entranceId">
        <el-input
          v-model="queryParams.entranceId"
          placeholder="请输入系统常用入口名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <!-- <el-form-item label="用户自定义排序，值越小越靠前" prop="customOrder">
        <el-input
          v-model="queryParams.customOrder"
          placeholder="请输入用户自定义排序，值越小越靠前"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="是否隐藏该入口" prop="hidden">
        <el-select
          v-model="queryParams.hidden"
          placeholder="请选择是否隐藏该入口"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item> -->
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
      <el-form-item label="部门编号" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入部门编号"
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
          v-hasPermi="['business:user-common-entrances:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:user-common-entrances:export']"
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
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="系统常用入口" align="center" prop="entranceName" />
      <el-table-column label="用户自定义排序，值越小越靠前" align="center" prop="customOrder" />
      <!-- <el-table-column label="是否隐藏该入口" align="center" prop="hidden" /> -->
      <!-- <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      /> -->
      <el-table-column label="部门编号" align="center" prop="deptId" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:user-common-entrances:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:user-common-entrances:delete']"
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
  <UserCommonEntrancesForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { UserCommonEntrancesApi, UserCommonEntrancesVO } from '@/api/business/usercommonentrances'
import { SystemCommonEntrancesApi, SystemCommonEntrancesVO } from '@/api/business/systemcommonentrances'
import { getSimpleUserList, UserVO } from '@/api/system/user'
import UserCommonEntrancesForm from './UserCommonEntrancesForm.vue'

/** 用户常用入口维护表（个性化配置） 列表 */
defineOptions({ name: 'UserCommonEntrances' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserCommonEntrancesVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const userMap = ref(new Map()) // 用户ID到用户名的映射
const entranceMap = ref(new Map()) // 入口ID到入口名称的映射
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  entranceId: undefined,
  customOrder: undefined,
  hidden: undefined,
  createTime: [],
  deptId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 获取用户映射关系 */
const getUserMap = async () => {
  try {
    const users = await getSimpleUserList()
    const map = new Map()
    users.forEach(user => {
      map.set(user.id, user.nickname || user.username)
    })
    userMap.value = map
  } catch (error) {
    console.error('获取用户映射关系失败:', error)
  }
}

/** 获取系统常用入口映射关系 */
const getEntranceMap = async () => {
  try {
    const data = await SystemCommonEntrancesApi.getSystemCommonEntrancesPage({ pageNo: 1, pageSize: 100 })
    const map = new Map()
    data.list.forEach(entrance => {
      map.set(entrance.id, entrance.name)
    })
    entranceMap.value = map
  } catch (error) {
    console.error('获取系统常用入口映射关系失败:', error)
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserCommonEntrancesApi.getUserCommonEntrancesPage(queryParams)
    // 为每个记录添加用户名称和入口名称
    list.value = data.list.map(item => ({
      ...item,
      userName: userMap.value.get(item.userId) || `用户ID: ${item.userId}`,
      entranceName: entranceMap.value.get(item.entranceId) || `入口ID: ${item.entranceId}`
    }))
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
    await UserCommonEntrancesApi.deleteUserCommonEntrances(id)
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
    const data = await UserCommonEntrancesApi.exportUserCommonEntrances(queryParams)
    download.excel(data, '用户常用入口维护表（个性化配置）.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  await Promise.all([getUserMap(), getEntranceMap()])
  getList()
})
</script>