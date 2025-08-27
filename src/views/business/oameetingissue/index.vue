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
<!--      <el-form-item label="议题发起人ID" prop="userId">-->
<!--        <el-input-->
<!--          v-model="queryParams.userId"-->
<!--          placeholder="请输入议题发起人ID"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--          class="!w-240px"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item label="议题编号" prop="issueNo">
        <el-input
          v-model="queryParams.issueNo"
          placeholder="请输入议题编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="议题标题" prop="issueTitle">
        <el-input
          v-model="queryParams.issueTitle"
          placeholder="请输入议题标题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="议题类型" prop="issueType">
        <el-select
          v-model="queryParams.issueType"
          placeholder="请选择议题类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MEET_ISSUE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="上会类型" prop="meetingType">
        <el-select
          v-model="queryParams.meetingType"
          placeholder="请选择上会类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MEET_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="汇报人" prop="reporterId">
        <el-select
          v-model="queryParams.reporterId"
          placeholder="请选择汇报人"
          clearable
          filterable
          remote
          :remote-method="searchUsers"
          :loading="userLoading"
          class="!w-240px"
        >
          <el-option
            v-for="user in filteredUserList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="议题状态" prop="issueStatus">
        <el-select
          v-model="queryParams.issueStatus"
          placeholder="请选择议题状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ISSUE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择审核状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ISSUE_AUDIT_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
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
          v-hasPermi="['business:oa-meeting-issue:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:oa-meeting-issue:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
<!--      <el-table-column label="议题ID" align="center" prop="id" />-->
<!--      <el-table-column label="议题发起人ID" align="center" prop="userId" />-->
      <el-table-column label="议题编号" align="center" prop="issueNo" />
      <el-table-column label="议题标题" align="center" prop="issueTitle" />
      <el-table-column label="议题类型" align="center" prop="issueType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="scope.row.issueType" />
        </template>
      </el-table-column>
      <el-table-column label="上会类型" align="center" prop="meetingType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.MEET_TYPE" :value="scope.row.meetingType" />
        </template>
      </el-table-column>
      <el-table-column label="汇报人" align="center" prop="reporterId">
        <template #default="scope">
          {{ getUserName(scope.row.reporterId) || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="相关部门" align="center" prop="relevantDept">
        <template #default="scope">
          {{ getDeptNames(scope.row.relevantDept) }}
        </template>
      </el-table-column>
<!--      <el-table-column label="议题详细内容" align="center" prop="issueContent" />-->
      <el-table-column label="议题概述" align="center" prop="description" />
      <el-table-column label="议题状态" align="center" prop="issueStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ISSUE_STATUS" :value="scope.row.issueStatus || 0" />
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ISSUE_AUDIT_STATUS" :value="scope.row.status || 0" />
        </template>
      </el-table-column>
<!--      <el-table-column-->
<!--        label="创建时间"-->
<!--        align="center"-->
<!--        prop="createTime"-->
<!--        :formatter="dateFormatter"-->
<!--        width="180px"-->
<!--      />-->
      <el-table-column label="操作" align="center" min-width="180px">
        <template #default="scope">
          <el-button
            link
            type="info"
            @click="openDetail(scope.row.id)"
            v-hasPermi="['business:oa-meeting-issue:query']"
            :disabled="sendApproveLoading[scope.row.id]"
          >
            详情
          </el-button>
          <template v-if="scope.row.status === -1">
            <el-button
              link
              type="primary"
              @click="openForm('update', scope.row.id)"
              v-hasPermi="['business:oa-meeting-issue:update']"
              :disabled="sendApproveLoading[scope.row.id]"
            >
              编辑
            </el-button>
            <el-button
              link
              type="warning"
              :loading="sendApproveLoading[scope.row.id]"
              @click="sendApprove(scope.row.id)"
              v-hasPermi="['business:oa-meeting-issue:sendApprove']"
            >
              送审
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDelete(scope.row.id)"
              v-hasPermi="['business:oa-meeting-issue:delete']"
              :disabled="sendApproveLoading[scope.row.id]"
            >
              删除
            </el-button>
          </template>
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
  <OaMeetingIssueForm ref="formRef" @success="getList" />
  <!-- 详情弹窗 -->
  <OaMeetingIssueDetail ref="detailRef" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { OaMeetingIssueApi, OaMeetingIssueVO } from '@/api/business/oameetingissue'
import OaMeetingIssueForm from './OaMeetingIssueForm.vue'
import OaMeetingIssueDetail from './OaMeetingIssueDetail.vue'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import { handleTree } from '@/utils/tree'

/** 会议议题 列表 */
defineOptions({ name: 'OaMeetingIssue' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<OaMeetingIssueVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const userLoading = ref(false) // 用户列表加载状态
const userList = ref<any[]>([]) // 用户列表
const filteredUserList = ref<any[]>([]) // 筛选后的用户列表
const deptList = ref<Tree[]>([]) // 部门列表
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  issueNo: undefined,
  issueTitle: undefined,
  issueType: undefined,
  meetingType: undefined,
  reporterId: undefined,
  issueContent: undefined,
  description: undefined,
  issueStatus: undefined,
  status: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const sendApproveLoading = ref<Record<number, boolean>>({}) // 送审的加载中状态

/** 搜索用户 */
const searchUsers = (query: string) => {
  if (query) {
    filteredUserList.value = userList.value.filter(user => 
      user.nickname && user.nickname.toLowerCase().includes(query.toLowerCase())
    )
  } else {
    filteredUserList.value = [...userList.value]
  }
}

/** 获取用户列表 */
const getUserList = async () => {
  try {
    userLoading.value = true
    const data = await UserApi.getSimpleUserList()
    userList.value = data
    filteredUserList.value = [...data]
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    userLoading.value = false
  }
}

/** 获取部门列表 */
const getDeptList = async () => {
  try {
    const data = await DeptApi.getSimpleDeptList()
    deptList.value = handleTree(data)
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

/** 根据用户ID获取用户名称 */
const getUserName = (userId: number | undefined) => {
  if (!userId) return ''
  const user = userList.value.find(u => u.id === userId)
  return user ? user.nickname : ''
}

/** 根据部门ID获取部门名称（支持多个部门） */
const getDeptNames = (deptIds: string | string[] | undefined) => {
  if (!deptIds) return '-'

  let ids: string[] = []

  // 统一处理输入为字符串或数组的情况
  if (typeof deptIds === 'string') {
    // 去除两边的方括号并按逗号分割
    ids = deptIds.replace(/[\[\]]/g, '').split(',').map(id => id.trim()).filter(Boolean)
  } else if (Array.isArray(deptIds)) {
    ids = deptIds.map(id => String(id))
  }

  if (ids.length === 0) return '-'

  // 递归查找树中的部门
  const findDeptInTree = (tree: Tree[], id: string): Tree | undefined => {
    for (const node of tree) {
      if (String(node.id) === id) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findDeptInTree(node.children, id)
        if (found) {
          return found
        }
      }
    }
  }

  const deptNames = ids.map(id => {
    // 在树形结构中查找部门
    const dept = findDeptInTree(deptList.value, id)
    return dept ? dept.name : `未知部门(${id})`
  })

  return deptNames.join(', ')
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OaMeetingIssueApi.getOaMeetingIssuePage(queryParams)
    // 检查数据结构是否正确
    if (data && typeof data === 'object') {
      // 适配不同的数据结构
      if (data.list !== undefined) {
        list.value = data.list
        total.value = data.total || 0
      } else {
        // 如果返回的直接是数组
        list.value = data || []
        total.value = data ? data.length : 0
      }
    }
  } catch (error) {
    console.error('获取议题列表失败:', error)
    message.error('获取列表失败，请稍后重试')
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

/** 详情操作 */
const detailRef = ref()
const openDetail = (id: number) => {
  detailRef.value.open(id)
}

/** 送审按钮操作 */
const sendApprove = async (id: number) => {
  try {
    // 送审的二次确认
    await message.sendApproveConfirm()
    // 发起删除
    sendApproveLoading.value[id] = true
    await OaMeetingIssueApi.sendApprove(id)
    message.success(t('common.sendApproveSuccess'))
    // 刷新列表
    await getList()
  } catch {
  } finally {
    sendApproveLoading.value[id] = false
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await OaMeetingIssueApi.deleteOaMeetingIssue(id)
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
    const data = await OaMeetingIssueApi.exportOaMeetingIssue(queryParams)
    download.excel(data, '会议议题.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
  getUserList()
  getDeptList()
})
</script>
