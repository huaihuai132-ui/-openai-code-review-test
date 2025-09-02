<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="110px"
    >
      <el-form-item label="用户名称" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
            <el-form-item label="已使用年假天数" prop="usedDays">
        <el-input
          v-model="queryParams.usedDays"
          placeholder="请输入已使用年假天数"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="年假总天数" prop="totalDays">
        <el-input
          v-model="queryParams.totalDays"
          placeholder="请输入年假总天数"
          clearable
          @keyup.enter="handleQuery"
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
      <el-form-item label="部门名称" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入部门名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:oa-annual-leave:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:oa-annual-leave:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <!-- 子表的列表 -->
      <el-table-column type="expand">
        <template #default="scope">
          <el-tabs model-value="oaFormLeave">
            <el-tab-pane label="OA 请假申请表单" name="oaFormLeave">
              <OaFormLeaveList :user-id="scope.row.userId" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-table-column>
      <!-- <el-table-column label="主键ID" align="center" prop="id" /> -->
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="已使用年假天数" align="center" prop="usedDays" />
      <el-table-column label="年假总天数" align="center" prop="totalDays" />
      <!-- <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      /> -->
      <el-table-column label="部门名称" align="center" prop="deptName" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:oa-annual-leave:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:oa-annual-leave:delete']"
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
  <OaAnnualLeaveForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { OaAnnualLeaveApi, OaAnnualLeaveVO } from '@/api/business/oaannualleave'
import OaAnnualLeaveForm from './OaAnnualLeaveForm.vue'
import OaFormLeaveList from './components/OaFormLeaveList.vue'

/** 年假 列表 */
defineOptions({ name: 'OaAnnualLeave' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<OaAnnualLeaveVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  totalDays: undefined,
  usedDays: undefined,
  createTime: [],
  deptId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OaAnnualLeaveApi.getOaAnnualLeavePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false 
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  // 处理用户名称到userId的转换
  if (queryParams.userId && isNaN(Number(queryParams.userId))) {
    // 如果输入的不是数字，则认为是用户名称，需要转换为userId
    const userName = queryParams.userId
    
    // 如果当前列表为空，先获取数据
    if (list.value.length === 0) {
      message.info('正在获取用户数据，请稍后再试...')
      getList().then(() => {
        // 数据加载完成后重新执行搜索
        setTimeout(() => handleQuery(), 100)
      })
      return
    }
    
    // 支持模糊匹配
    const user = list.value.find(item => 
      item.userName === userName || item.userName.includes(userName)
    )
    if (user) {
      queryParams.userId = user.userId
      if (user.userName !== userName) {
        message.success(`已匹配到用户：${user.userName}`)
      }
    } else {
      // 提供可能的匹配建议
      const suggestions = list.value
        .filter(item => item.userName.includes(userName))
        .map(item => item.userName)
        .slice(0, 3)
      
      if (suggestions.length > 0) {
        message.warning(`未找到完全匹配的用户"${userName}"，您是否要找：${suggestions.join('、')}？`)
      } else {
        message.warning(`未找到用户名称包含"${userName}"的用户`)
      }
      return
    }
  }
  
  // 处理部门名称到deptId的转换
  if (queryParams.deptId && isNaN(Number(queryParams.deptId))) {
    // 如果输入的不是数字，则认为是部门名称，需要转换为deptId
    const deptName = queryParams.deptId
    
    // 如果当前列表为空，先获取数据
    if (list.value.length === 0) {
      message.info('正在获取部门数据，请稍后再试...')
      getList().then(() => {
        // 数据加载完成后重新执行搜索
        setTimeout(() => handleQuery(), 100)
      })
      return
    }
    
    // 支持模糊匹配
    const dept = list.value.find(item => 
      item.deptName === deptName || item.deptName.includes(deptName)
    )
    if (dept) {
      queryParams.deptId = dept.deptId
      if (dept.deptName !== deptName) {
        message.success(`已匹配到部门：${dept.deptName}`)
      }
    } else {
      // 提供可能的匹配建议
      const suggestions = list.value
        .filter(item => item.deptName.includes(deptName))
        .map(item => item.deptName)
        .slice(0, 3)
      
      if (suggestions.length > 0) {
        message.warning(`未找到完全匹配的部门"${deptName}"，您是否要找：${suggestions.join('、')}？`)
      } else {
        message.warning(`未找到部门名称包含"${deptName}"的部门`)
      }
      return
    }
  }
  
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
    await OaAnnualLeaveApi.deleteOaAnnualLeave(id)
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
    const data = await OaAnnualLeaveApi.exportOaAnnualLeave(queryParams)
    download.excel(data, '年假.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 激活时 */
onActivated(async () => {
  await getList()
})

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>