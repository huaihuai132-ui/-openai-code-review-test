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
      <el-form-item label="关联会议" prop="meetingId">
        <el-select
          v-model="queryParams.meetingId"
          placeholder="请选择关联会议"
          clearable
          filterable
          remote
          :remote-method="searchMeetings"
          :loading="meetingLoading"
          class="!w-240px"
        >
          <el-option
            v-for="meeting in filteredMeetingList"
            :key="meeting.id"
            :label="meeting.meetName"
            :value="meeting.id"
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
      <el-table-column label="关联会议" align="center" prop="meetingId">
        <template #default="scope">
          {{ getMeetingName(scope.row.meetingId) || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="议题状态" align="center" prop="issueStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ISSUE_STATUS" :value="scope.row.issueStatus || 0" />
        </template>
      </el-table-column>
      <!-- 隐藏汇报人、相关部门、议题概述等字段，新增会议关联确认状态 -->
      <el-table-column label="确认状态" align="center" prop="meetingConfirmStatus">
        <template #default="scope">
          <el-tag v-if="scope.row.meetingConfirmStatus" type="success">已确认</el-tag>
          <el-tag v-else type="info">未确认</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="260px">
        <template #default="scope">
          <el-button
            link
            type="info"
            @click="openDetail(scope.row.id)"
            v-hasPermi="['business:oa-meeting-issue:query']"
          >
            详情
          </el-button>
          <!-- 确认和取消按钮互斥显示 -->
          <el-button
            v-if="!scope.row.meetingConfirmStatus"
            link
            type="success"
            @click="confirmMeetingIssue(scope.row)"
            v-hasPermi="['business:oa-meeting-issue:confirm']"
            :disabled="!scope.row.meetingId"
          >
            确认
          </el-button>
          <el-button
            v-else
            link
            type="warning"
            @click="cancelMeetingIssue(scope.row)"
            v-hasPermi="['business:oa-meeting-issue:cancel']"
          >
            取消
          </el-button>
          <el-button
            link
            type="primary"
            v-if="!scope.row.meetingConfirmStatus"
            @click="openMeetingDialog(scope.row)"
            v-hasPermi="['business:oa-meeting-issue:assign']"
          >
            关联会议
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
  <OaMeetingIssueForm ref="formRef" @success="getList" />
  <!-- 详情弹窗 -->
  <OaMeetingIssueDetail ref="detailRef" />

  <!-- 关联会议弹窗 -->
  <Dialog v-model="meetingDialogVisible" title="关联会议" width="800">
    <el-form :model="meetingForm" label-width="100px">
      <el-form-item label="会议名称">
        <el-input
          v-model="meetingQuery.meetName"
          placeholder="请输入会议名称"
          clearable
          @input="handleMeetingSearch"
        />
      </el-form-item>
      <el-form-item label="会议列表">
        <el-table
          :data="filteredMeetings"
          height="300"
          highlight-current-row
          @current-change="handleMeetingSelect"
        >
          <el-table-column prop="meetName" label="会议名称" />
          <el-table-column prop="meetNo" label="会议编号" />
          <el-table-column prop="startTime" label="开始时间" :formatter="dateFormatter" />
          <el-table-column prop="endTime" label="结束时间" :formatter="dateFormatter" />
        </el-table>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="meetingDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="assignMeeting" :disabled="!selectedMeeting">确 定</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import {DICT_TYPE, getIntDictOptions} from '@/utils/dict'
import {dateFormatter} from '@/utils/formatTime'
import download from '@/utils/download'
import {OaMeetingIssueApi, OaMeetingIssueVO} from '@/api/business/meet/meetingIssue'
import {OaMeetingApi} from '@/api/business/meet/meeting'
// 引用 oameetingissue 模块中的表单和详情组件
import OaMeetingIssueForm from '@/views/business/meet/meetingIssue/OaMeetingIssueForm.vue'
import OaMeetingIssueDetail from '@/views/business/meet/meetingIssue/OaMeetingIssueDetail.vue'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import {handleTree} from '@/utils/tree'

/** 会议议题 列表 */
defineOptions({ name: 'OaMeetingIssue' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<OaMeetingIssueVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const userLoading = ref(false) // 用户列表加载状态
const meetingLoading = ref(false) // 会议列表加载状态
const userList = ref<any[]>([]) // 用户列表
const filteredUserList = ref<any[]>([]) // 筛选后的用户列表
const meetingList = ref<any[]>([]) // 会议列表
const filteredMeetingList = ref<any[]>([]) // 筛选后的会议列表
const deptList = ref<Tree[]>([]) // 部门列表
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100, // 修改为100
  userId: undefined,
  issueNo: undefined,
  issueTitle: undefined,
  issueType: undefined,
  meetingType: undefined,
  reporterId: undefined,
  meetingId: undefined, // 添加关联会议ID查询条件
  issueContent: undefined,
  description: undefined,
  issueStatus: undefined,
  status: 2, // 默认只显示已审核的议题
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 关联会议相关
const meetingDialogVisible = ref(false)
const currentIssue = ref<OaMeetingIssueVO | null>(null)
const selectedMeeting = ref<any>(null)
const meetingQuery = reactive({
  meetName: ''
})
const meetingForm = ref({})
const filteredMeetings = computed(() => {
  if (!meetingQuery.meetName) {
    return meetingList.value
  }
  return meetingList.value.filter(meeting =>
    meeting.meetName && meeting.meetName.includes(meetingQuery.meetName)
  )
})

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

/** 搜索会议 */
const searchMeetings = (query: string) => {
  if (query) {
    filteredMeetingList.value = meetingList.value.filter(meeting =>
      meeting.meetName && meeting.meetName.toLowerCase().includes(query.toLowerCase())
    )
  } else {
    filteredMeetingList.value = [...meetingList.value]
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

/** 获取会议列表 */
const getMeetingList = async () => {
  try {
    meetingLoading.value = true
    const data = await OaMeetingApi.getOaMeetingPage({
      pageNo: 1,
      pageSize: 100,
      status: 2 // 只获取进行中的会议
    })
    meetingList.value = data.list || []
    filteredMeetingList.value = [...meetingList.value]
  } catch (error) {
    console.error('获取会议列表失败:', error)
  } finally {
    meetingLoading.value = false
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
  const user = userList.value.find(u => u?.id === userId)
  return user?.nickname || ''
}

/** 根据会议ID获取会议名称 */
const getMeetingName = (meetingId: number | string | undefined) => {
  // 修复可能的类型问题和未定义访问问题
  if (!meetingId) return '-'

  // 确保转换为数字进行查找
  const id = Number(meetingId)
  if (isNaN(id)) return '-'

  // 安全查找会议，避免访问未定义对象的属性
  if (!meetingList.value || meetingList.value.length === 0) return '-'

  const meeting = meetingList.value.find(m => m && m.id == id)
  return meeting?.meetName || '-'
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
    if (!tree || tree.length === 0) return undefined
    for (const node of tree) {
      if (!node) continue
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
    return undefined
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
    // 确保始终只查询已审核的议题
    const params = {
      ...queryParams,
      status: 2,
      onlyUnEnd: true,
    }
    const data = await OaMeetingIssueApi.getOaMeetingIssuePage(params)
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
  // 重置时仍保持只显示已审核的议题
  queryParams.status = 2
  // 保持pageSize为100
  queryParams.pageSize = 100
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

/** 确认会议议题关联 */
const confirmMeetingIssue = async (row: OaMeetingIssueVO) => {
  try {
    await message.confirm('确定要确认该议题与会议的关联吗？')
    await OaMeetingIssueApi.confirmMeetingIssue(row.id)
    message.success('确认成功')
    await getList()
  } catch (err) {
    console.error(err)
  }
}

/** 取消会议议题关联 */
const cancelMeetingIssue = async (row: OaMeetingIssueVO) => {
  try {
    await message.confirm('确定要取消该议题与会议的关联吗？')
    await OaMeetingIssueApi.cancelMeetingIssue(row.id)
    message.success('取消关联成功')
    await getList()
  } catch (err) {
    console.error(err)
  }
}

/** 打开关联会议弹窗 */
const openMeetingDialog = (row: OaMeetingIssueVO) => {
  currentIssue.value = row
  meetingDialogVisible.value = true
  selectedMeeting.value = null
  meetingQuery.meetName = ''
}

/** 处理会议搜索 */
const handleMeetingSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

/** 选择会议 */
const handleMeetingSelect = (row: any) => {
  selectedMeeting.value = row
}

/** 关联会议 */
const assignMeeting = async () => {
  if (!currentIssue.value || !selectedMeeting.value) {
    message.warning('请选择要关联的会议')
    return
  }

  try {
    await OaMeetingIssueApi.assignMeeting(selectedMeeting.value.id,currentIssue.value.id)
    message.success('关联会议成功')
    meetingDialogVisible.value = false
    await getList()
  } catch (err) {
    console.error(err)
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    // 导出时也只导出已审核的议题
    const params = {
      ...queryParams,
      status: 2
    }
    const data = await OaMeetingIssueApi.exportOaMeetingIssue(params)
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
  getMeetingList()
  getDeptList()
})
</script>
