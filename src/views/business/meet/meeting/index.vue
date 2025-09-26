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
<!--      <el-form-item label="会议发起人ID" prop="userId">-->
<!--        <el-input-->
<!--          v-model="queryParams.userId"-->
<!--          placeholder="请输入会议发起人ID"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--          class="!w-240px"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item label="会议名称" prop="meetName">
        <el-input
          v-model="queryParams.meetName"
          placeholder="请输入会议名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会议类型" prop="meetType">
        <el-select
          v-model="queryParams.meetType"
          placeholder="请选择会议类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.MEET_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="会议日期" prop="meetDate">
        <el-date-picker
          v-model="queryParams.meetDate"
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
          v-hasPermi="['business:oa-meeting:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:oa-meeting:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
<!--      <el-table-column label="会议ID" align="center" prop="id" />-->
<!--      <el-table-column label="会议发起人ID" align="center" prop="userId" />-->
<!--      <el-table-column label="会议编号" align="center" prop="meetNo" />-->
      <el-table-column label="会议名称" align="center" prop="meetName" />
      <el-table-column label="会议类型" align="center" prop="meetType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.MEET_TYPE" :value="scope.row.meetType" />
        </template>
      </el-table-column>
      <el-table-column label="会议日期" align="center" prop="meetDate" width="180px">
        <template #default="scope">
          {{ formatDate(scope.row.meetDate, 'YYYY-MM-DD') }}
        </template>
      </el-table-column>
<!--      <el-table-column label="开始时间" align="center" prop="startTime" :formatter="dateFormatter" width="180px" />-->
<!--      <el-table-column label="结束时间" align="center" prop="endTime" :formatter="dateFormatter" width="180px" />-->
<!--      <el-table-column label="会议室ID" align="center" prop="meetRoomId" />-->
      <el-table-column label="会议事由" align="center" prop="reason" />
      <el-table-column label="提醒状态" align="center" prop="reminderStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.REMINDER_STATUS" :value="scope.row.reminderStatus || '-'" />
        </template>
      </el-table-column>
<!--      <el-table-column label="会议概述" align="center" prop="description" />-->
      <el-table-column label="会议状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.MEET_STATUS" :value="scope.row.status || 0" />
        </template>
      </el-table-column>
<!--      <el-table-column-->
<!--        label="创建时间"-->
<!--        align="center"-->
<!--        prop="createTime"-->
<!--        :formatter="dateFormatter"-->
<!--        width="180px"-->
<!--      />-->
<!--      <el-table-column label="文件id列表" align="center" prop="fileList" />-->
<!--      <el-table-column label="文件序列编码" align="center" prop="sequenceCode" />-->
      <el-table-column label="操作" align="center" min-width="300px">
        <template #default="scope">
          <el-button
            link
            type="info"
            @click="openDetail(scope.row.id)"
            v-hasPermi="['business:oa-meeting:query']"
            :disabled="sendApproveLoading[scope.row.id] || startMeetingLoading[scope.row.id]"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:oa-meeting:update']"
            v-if="scope.row.status === 2"
            :disabled="sendApproveLoading[scope.row.id]"
          >
            编辑
          </el-button>
<!--          <el-button-->
<!--            link-->
<!--            type="warning"-->
<!--            @click="sendApprove(scope.row.id)"-->
<!--            v-hasPermi="['business:oa-meeting:sendApprove']"-->
<!--            :disabled="sendApproveLoading[scope.row.id]"-->
<!--            :loading="sendApproveLoading[scope.row.id]"-->
<!--            v-if="scope.row.status === -1"-->
<!--          >-->
<!--            送审-->
<!--          </el-button>-->
          <el-button
            link
            type="success"
            @click="openNotificationDialog(scope.row)"
            v-hasPermi="['business:oa-meeting:notify']"
            v-if="scope.row.status === 2"
            :disabled="startMeetingLoading[scope.row.id]"
          >
            通知参会人
          </el-button>
          <el-button
            link
            type="warning"
            @click="handleNotifyRelevantDepts(scope.row.id)"
            v-if="scope.row.status === 2 && scope.row.reminderStatus == 0"
            v-hasPermi="['business:oa-meeting:notify']"
          >
            议题申报提醒
          </el-button>
          <el-button
            link
            type="primary"
            @click="startMeeting(scope.row.id)"
            v-hasPermi="['business:oa-meeting:start']"
            v-if="scope.row.status === 2"
            :loading="startMeetingLoading[scope.row.id]"
          >
            开始会议
          </el-button>
<!--          <el-button-->
<!--            link-->
<!--            type="primary"-->
<!--            @click="openSigninDialog(scope.row)"-->
<!--            v-hasPermi="['business:oa-meeting:manage']"-->
<!--            v-if="scope.row.status === 2"-->
<!--          >-->
<!--            会议签到-->
<!--          </el-button>-->
<!--          <el-button-->
<!--            link-->
<!--            type="primary"-->
<!--            @click="openVoteDialog(scope.row)"-->
<!--            v-hasPermi="['business:oa-meeting:manage']"-->
<!--            v-if="scope.row.status === 8"-->
<!--          >-->
<!--            会议表决-->
<!--          </el-button>-->
<!--          -->
          <el-button
            link
            type="danger"
            @click="openEndMeetingDialog(scope.row)"
            v-hasPermi="['business:oa-meeting:end']"
            v-if="scope.row.status === 8"
          >
            结束会议
          </el-button>
          <el-button
            link
            type="warning"
            @click="openArchiveDialog(scope.row)"
            v-hasPermi="['business:oa-meeting:archive']"
            v-if="scope.row.status === 9"
          >
            会议归档
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:oa-meeting:delete']"
            v-if="scope.row.status === -1"
            :disabled="sendApproveLoading[scope.row.id]"
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
  <MeetingForm ref="formRef" @success="getList" />
  <!-- 详情弹窗 -->
  <MeetingDetail ref="detailRef" />

  <!-- 会议通知弹窗 -->
  <Dialog v-model="notificationDialogVisible" title="会议通知" width="600px" @closed="handleNotificationDialogClosed">
    <el-form
      ref="notificationFormRef"
      :model="notificationForm"
      :rules="notificationRules"
      label-width="100px"
    >
      <el-form-item label="通知方式" prop="notifyType" required>
        <el-radio-group v-model="notificationForm.notifyType">
          <el-radio :label="1">通知全部参会人</el-radio>
          <el-radio :label="2">通知指定参会人</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="notificationForm.notifyType === 2"
        label="选择参会人"
        prop="selectedAttendees"
        required
      >
        <el-select
          v-model="notificationForm.selectedAttendees"
          multiple
          placeholder="请选择参会人"
          style="width: 100%"
        >
          <el-option
            v-for="attendee in currentMeetingAttendees"
            :key="attendee.id"
            :label="attendee.userName"
            :value="attendee.userId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="通知内容" prop="content">
        <el-input
          v-model="notificationForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入通知内容"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="notificationDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitNotification" :loading="notificationLoading">
        发 送
      </el-button>
    </template>
  </Dialog>

  <!-- 新增参会人弹窗 -->
  <Dialog v-model="addAttendeeDialogVisible" title="新增参会人" width="800px" @closed="handleAddAttendeeDialogClosed">
    <AttendeeSelect
      v-model="selectedAttendeeIds"
      :existing-attendees="currentMeetingAttendees"
      @confirm="handleAddAttendees"
      @cancel="addAttendeeDialogVisible = false"
    />
  </Dialog>

  <!-- 会议签到弹窗 -->
  <Dialog v-model="signinDialogVisible" title="会议签到" width="800px" @closed="handleSigninDialogClosed">
    <SigninManager
      ref="signinManagerRef"
      :meeting-attendees="currentMeetingAttendees"
      :meeting-id="currentMeetingId"
      @add-attendees="handleAddAttendees"
      @sign-attendance="signAttendance"
      @remove-attendee="removeAttendee"
      @confirm-signin="confirmSignin"
    />

    <template #footer>
      <el-button @click="signinDialogVisible = false">取 消</el-button>
      <el-button
        type="primary"
        @click="handleConfirmSignin"
        :loading="signinLoading"
      >
        确认签到并开始会议
      </el-button>
    </template>
  </Dialog>

  <!-- 会议表决弹窗 -->
  <Dialog v-model="voteDialogVisible" title="会议表决" width="800px" @closed="handleVoteDialogClosed">
    <VoteManager
      :meeting-issues="currentMeetingIssues"
      :meeting-id="currentMeetingId"
      :meeting-attendees="currentMeetingAttendees"
      @vote-success="handleVoteSuccess"
    />

    <template #footer>
      <el-button @click="voteDialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>

  <!-- 结束会议弹窗 -->
  <Dialog v-model="endMeetingDialogVisible" title="结束会议" width="600px" @closed="handleEndMeetingDialogClosed">
    <el-form
      ref="endMeetingFormRef"
      :model="endMeetingForm"
      :rules="endMeetingRules"
      label-width="120px"
    >
      <el-form-item label="实际开始时间" prop="actualStartTime" required>
        <el-date-picker
          v-model="endMeetingForm.actualStartTime"
          type="datetime"
          value-format="x"
          placeholder="请选择实际开始时间"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="实际结束时间" prop="actualEndTime" required>
        <el-date-picker
          v-model="endMeetingForm.actualEndTime"
          type="datetime"
          value-format="x"
          placeholder="请选择实际结束时间"
          style="width: 100%"
        />
      </el-form-item>

<!--      <el-form-item label="会议总结" prop="summary">-->
<!--        <el-input-->
<!--          v-model="endMeetingForm.summary"-->
<!--          type="textarea"-->
<!--          :rows="4"-->
<!--          placeholder="请输入会议总结"-->
<!--        />-->
<!--      </el-form-item>-->
    </el-form>

    <template #footer>
      <el-button @click="endMeetingDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitEndMeeting" :loading="endMeetingLoading">
        确 定
      </el-button>
    </template>
  </Dialog>

  <!-- 会议归档弹窗 -->
  <Dialog v-model="archiveDialogVisible" title="会议归档" width="800px" @closed="handleArchiveDialogClosed">
    <el-form
      ref="archiveFormRef"
      :model="archiveForm"
      :rules="archiveRules"
      label-width="120px"
    >
      <el-form-item label="议题结果" v-if="currentArchiveMeeting.issueList && currentArchiveMeeting.issueList.length > 0">
        <el-table :data="currentArchiveMeeting.issueList" border stripe>
          <el-table-column prop="issueTitle" label="议题标题" min-width="200">
            <template #default="{ row }">
              <div class="font-bold">{{ row?.issueTitle || row?.title || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="issueType" label="上会类型" width="120" align="center">
            <template #default="{ row }">
              <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="row?.issueType" />
            </template>
          </el-table-column>
          <el-table-column label="最终决议" width="200" align="center">
            <template #default="{ row }">
              <div class="flex justify-center space-x-2">
                <el-button
                  :type="archiveIssueResults[row.id!] === 3 ? 'success' : 'default'"
                  @click="archiveIssueResults[row.id!] = 3"
                  :plain="archiveIssueResults[row.id!] !== 3"
                  size="small"
                  :disabled="!row.id"
                >
                  通过
                </el-button>
                <el-button
                  :type="archiveIssueResults[row.id!] === 4 ? 'danger' : 'default'"
                  @click="archiveIssueResults[row.id!] = 4"
                  :plain="archiveIssueResults[row.id!] !== 4"
                  size="small"
                  :disabled="!row.id"
                >
                  否决
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-alert
        v-else
        title="该会议没有关联的议题"
        type="info"
        show-icon
        class="mb-20px"
      />

      <el-form-item label="会议纪要" prop="archiveFileList">
        <BatchFileUpload
          ref="minutesUploadRef"
          v-model:fileList="archiveForm.archiveFileList"
          mode="create"
          file-type="common"
          directory="meeting_minutes"
          :max-files="3"
          tip="支持上传多个文件，最多3个"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="archiveDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitArchive" :loading="archiveLoading">
        归 档
      </el-button>
    </template>
  </Dialog>

  <!-- 议题详情弹窗 -->
  <MeetingIssueDetail ref="issueDetailRef" @closed="handleIssueDetailClosed"/>
</template>

<script setup lang="ts">
import {DICT_TYPE, getStrDictOptions} from '@/utils/dict'
import {formatDate} from '@/utils/formatTime'
import download from '@/utils/download'
import {OaMeetingApi, OaMeetingVO} from '@/api/business/meet/meeting'
import MeetingForm from './MeetingForm.vue'
import MeetingDetail from './MeetingDetail.vue'
import {Dialog} from '@/components/Dialog'
import AttendeeSelect from './components/AttendeeSelect.vue'
import {BatchFileUpload} from '@/components/UploadFile'
import SigninManager from './components/SigninManager.vue'
import VoteManager from './components/VoteManager.vue'
import MeetingIssueDetail from '@/views/business/meet/meetingIssue/MeetingIssueDetail.vue'

/** 会议 列表 */
defineOptions({ name: 'OaMeeting' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<OaMeetingVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  meetName: undefined,
  meetType: undefined,
  meetDate: [],
  startTime: [],
  endTime: [],
  meetRoomId: undefined,
  reason: undefined,
  description: undefined,
  status: undefined,
  createTime: [],
  fileList: undefined,
  sequenceCode: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const sendApproveLoading = ref<Record<string | number, boolean>>({}) // 送审的加载中状态
const startMeetingLoading = ref<Record<string | number, boolean>>({}) // 开始会议的加载中状态

// 通知相关
const notificationDialogVisible = ref(false)
const notificationFormRef = ref()
const notificationForm = ref({
  notifyType: 1, // 1: 全部参会人, 2: 指定参会人
  selectedAttendees: [] as number[],
  content: ''
})
const notificationRules = {
  content: [{ required: true, message: '通知内容不能为空', trigger: 'blur' }]
}
const currentMeetingAttendees = ref<any[]>([])
const currentMeetingId = ref<number>()
const notificationLoading = ref(false)

// 办会相关
const signinDialogVisible = ref(false)
const signinManagerRef = ref()
const voteDialogVisible = ref(false)
const activeManageTab = ref('attendees')
const currentMeetingIssues = ref<any[]>([])
const currentManageMeeting = ref<OaMeetingVO>({})

// 新增参会人相关
const addAttendeeDialogVisible = ref(false)
const selectedAttendeeIds = ref<any[]>([]) // 新增用于存储已选择参会人ID的引用

// 表决相关
const issueVoteDialogVisible = ref(false)
const issueVoteFormRef = ref()
const issueVoteForm = ref({
  voteResult: undefined as number | undefined,
  voteOpinion: ''
})
const issueVoteRules = {
  voteResult: [{ required: true, message: '请选择表决结果', trigger: 'change' }]
}
const currentVotingIssue = ref<any>({})
const issueVoteLoading = ref(false)
const issueDetailRef = ref<typeof MeetingIssueDetail>()

// 签到状态管理
const meetingSigninStatus = ref<Record<number, boolean>>({})
const signinLoading = ref(false)

// 结束会议相关
const endMeetingDialogVisible = ref(false)
const endMeetingFormRef = ref()
const endMeetingForm = ref({
  actualStartTime: undefined as number | undefined,
  actualEndTime: undefined as number | undefined,
  // summary: ''
})
const endMeetingRules = {
  actualStartTime: [{ required: true, message: '请选择实际开始时间', trigger: 'change' }],
  actualEndTime: [{ required: true, message: '请选择实际结束时间', trigger: 'change' }]
}
const endMeetingLoading = ref(false)
const currentEndMeeting = ref<OaMeetingVO>({})

// 会议归档相关
const archiveDialogVisible = ref(false)
const archiveFormRef = ref()
const archiveIssueResults = ref<Record<string | number, number>>({})
const archiveForm = ref({
  archiveFileList: [] as (number | string)[],
  archiveDescription: ''
})
const archiveRules = {
  archiveFileList: [{ required: true, message: '请上传会议纪要', trigger: 'change' }]
}
const archiveLoading = ref(false)
const minutesUploadRef = ref<typeof BatchFileUpload | null>(null)
const currentArchiveMeeting = ref<OaMeetingVO>({})

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OaMeetingApi.getOaMeetingPage(queryParams)
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
const formRef = ref<InstanceType<typeof MeetingForm>>()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 详情操作 */
const detailRef = ref<InstanceType<typeof MeetingDetail>>()
const openDetail = (id: number) => {
  detailRef.value.open(id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await OaMeetingApi.deleteOaMeeting(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 送审按钮操作 */
const sendApprove = async (id: number | string) => {
  try {
    // 送审的二次确认
    await message.sendApproveConfirm()
    // 发起送审
    sendApproveLoading.value[id] = true
    await OaMeetingApi.sendApprove(id)
    message.success(t('common.sendApproveSuccess'))
    // 刷新列表
    await getList()
  } catch {
  } finally {
    sendApproveLoading.value[id] = false
  }
}

/** 通知部门负责人按钮操作 */
const handleNotifyRelevantDepts = async (id) => {
  try {
    // 通知的二次确认
    await message.confirm('确定要通知全部部门负责人吗？')
    // 发起通知
    await OaMeetingApi.notifyRelevantDepts(id)
    message.success('已通知全部部门负责人')
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
    const data = await OaMeetingApi.exportOaMeeting(queryParams)
    download.excel(data, '会议.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 打开通知弹窗 */
const openNotificationDialog = async (row: OaMeetingVO) => {
  currentMeetingId.value = row.id
  notificationForm.value = {
    notifyType: 1,
    selectedAttendees: [],
    content: `${row.meetName}将于${row.meetDate ? formatDate(new Date(row.meetDate), 'YYYY-MM-DD') : ''}召开，请准时参加。`
  }

  // 获取参会人员列表
  try {
    const meetingDetail = await OaMeetingApi.getOaMeeting(row.id!)
    currentMeetingAttendees.value = meetingDetail.attendeeList || []
  } catch (err) {
    console.error('获取参会人员列表失败:', err)
    message.error('获取参会人员列表失败')
    currentMeetingAttendees.value = []
  }

  notificationDialogVisible.value = true
}

/** 提交通知 */
const submitNotification = async () => {
  if (!notificationFormRef.value) return

  try {
    await notificationFormRef.value.validate()

    notificationLoading.value = true

    // 准备通知数据
    const notifyData = {
      meetingId: currentMeetingId.value,
      notifyType: notificationForm.value.notifyType,
      attendeeIds: notificationForm.value.notifyType === 1
        ? currentMeetingAttendees.value.map(a => a.userId)
        : notificationForm.value.selectedAttendees,
      content: notificationForm.value.content
    }

    // 调用通知接口
    await OaMeetingApi.notifyAttendees(notifyData)

    message.success('通知发送成功')
    notificationDialogVisible.value = false
  } catch (err) {
    console.error('发送通知失败:', err)
    message.error('发送通知失败')
  } finally {
    notificationLoading.value = false
  }
}

/** 打开会议签到弹窗 */
const openSigninDialog = async (row: OaMeetingVO) => {
  currentManageMeeting.value = row
  currentMeetingId.value = row.id

  try {
    // 获取会议详情
    const meetingDetail = await OaMeetingApi.getOaMeeting(row.id!)

    // 初始化参会人员数据，添加签到状态
    currentMeetingAttendees.value = (meetingDetail.attendeeList || []).map(attendee => ({
      ...attendee,
      id: attendee.id || attendee.userId, // 确保ID存在
      userId: attendee.userId || attendee.id, // 确保userId存在
      userName: attendee.userName || attendee.nickname || attendee.name || attendee.username, // 兼容不同字段名
      userDepartmentName: attendee.userDepartmentName || attendee.department || '-', // 兼容部门字段
      position: attendee.position || attendee.postName || '-', // 兼容职务字段
      signed: attendee.signed !== undefined ? attendee.signed : false // 确保signed属性存在
    }))
  } catch (err) {
    console.error('获取会议详情失败:', err)
    message.error('获取会议详情失败')
    currentMeetingAttendees.value = []
  }

  signinDialogVisible.value = true
}

/** 打开会议表决弹窗 */
const openVoteDialog = async (row: OaMeetingVO) => {
  currentManageMeeting.value = row
  currentMeetingId.value = row.id

  try {
    // 获取会议详情
    const meetingDetail = await OaMeetingApi.getOaMeeting(row.id!)

    // 初始化议题数据，添加表决状态
    currentMeetingIssues.value = (meetingDetail.issueList || []).map(issue => ({
      ...issue,
      voted: issue.voted !== undefined ? issue.voted : false // 确保voted属性存在
    }))

    // 初始化参会人员数据，用于检查签到状态
    currentMeetingAttendees.value = (meetingDetail.attendeeList || []).map(attendee => ({
      ...attendee,
      id: attendee.id || attendee.userId, // 确保ID存在
      userId: attendee.userId || attendee.id, // 确保userId存在
      userName: attendee.userName || attendee.nickname || attendee.name || attendee.username, // 兼容不同字段名
      userDepartmentName: attendee.userDepartmentName || attendee.department || '-', // 兼容部门字段
      position: attendee.position || attendee.postName || '-', // 兼容职务字段
      signed: attendee.signed !== undefined ? attendee.signed : false, // 确保signed属性存在
      voted: attendee.voted !== undefined ? attendee.voted : false // 确保voted属性存在
    }))
  } catch (err) {
    console.error('获取会议详情失败:', err)
    message.error('获取会议详情失败')
    currentMeetingIssues.value = []
    currentMeetingAttendees.value = []
  }

  voteDialogVisible.value = true
}


/** 签到 */
const signAttendance = (attendee: any) => {
  // 检查是否所有人员都已签到
  const allSigned = currentMeetingAttendees.value.every((a: any) => a.signed)
  if (allSigned && currentMeetingId.value) {
    // 标记该会议已完成签到
    meetingSigninStatus.value[currentMeetingId.value] = true
  }
}

/** 打开新增参会人弹窗 */
const openAddAttendeeDialog = () => {
  // 重置选择
  selectedAttendeeIds.value = []
  addAttendeeDialogVisible.value = true
}

/** 处理新增参会人 */
const handleAddAttendees = (updatedAttendees: any[]) => {
  currentMeetingAttendees.value = updatedAttendees
}

/** 确认添加参会人 */
const confirmAddAttendees = async () => {
  // 由于UserSelectForm的确认已经处理了添加逻辑，这里只需要关闭弹窗
  addAttendeeDialogVisible.value = false
}

/** 移除参会人 */
const removeAttendee = (index: number) => {
  currentMeetingAttendees.value.splice(index, 1)
}

/** 查看议题详情 */
const viewIssueDetail = (issue: any) => {
  issueDetailRef.value?.open(issue.id)
}

/** 打开议题表决弹窗 */
const openIssueVoteDialog = (issue: any) => {
  currentVotingIssue.value = issue
  issueVoteForm.value = {
    voteResult: undefined,
    voteOpinion: ''
  }
  issueVoteDialogVisible.value = true
}

/** 提交议题表决 */
const submitIssueVote = async () => {
  if (!issueVoteFormRef.value) return

  try {
    await issueVoteFormRef.value.validate()

    issueVoteLoading.value = true

    // 更新本地数据
    currentVotingIssue.value.voted = true
    currentVotingIssue.value.voteResult = issueVoteForm.value.voteResult
    currentVotingIssue.value.voteOpinion = issueVoteForm.value.voteOpinion

    // 这里应该调用API提交表决结果
    // await OaMeetingApi.submitVote({
    //   meetingId: currentMeetingId.value,
    //   issueId: currentVotingIssue.value.id,
    //   voteResult: issueVoteForm.value.voteResult,
    //   voteOpinion: issueVoteForm.value.voteOpinion
    // })

    message.success('表决提交成功')
    issueVoteDialogVisible.value = false
  } catch (err) {
    console.error('提交表决失败:', err)
    message.error('提交表决失败')
  } finally {
    issueVoteLoading.value = false
  }
}

/** 打开结束会议弹窗 */
const openEndMeetingDialog = (row: OaMeetingVO) => {
  currentEndMeeting.value = row
  endMeetingForm.value = {
    actualStartTime: row.startTime,
    actualEndTime: row.endTime,
    // summary: ''
  }
  endMeetingDialogVisible.value = true
}

/** 提交结束会议 */
const submitEndMeeting = async () => {
  if (!endMeetingFormRef.value) return

  try {
    await endMeetingFormRef.value.validate()

    endMeetingLoading.value = true

    // 准备结束会议数据，确保类型与接口要求一致
    const endData: OaMeetingVO = {
      id: currentEndMeeting.value.id!,
      status: 3, // 结束状态
      actualStartTime: endMeetingForm.value.actualStartTime,
      actualEndTime: endMeetingForm.value.actualEndTime,
      // summary: endMeetingForm.value.summary
    }

    // 调用结束会议接口
    await OaMeetingApi.endMeeting(endData)

    message.success('会议结束成功')
    endMeetingDialogVisible.value = false
    // 刷新列表
    await getList()
  } catch (err) {
    console.error('结束会议失败:', err)
    message.error('结束会议失败')
  } finally {
    endMeetingLoading.value = false
  }
}

/** 打开会议归档弹窗 */
const openArchiveDialog = async (row: OaMeetingVO) => {
  try {
    // 显示加载状态
    archiveLoading.value = true

    // 从API获取完整的会议详情，包括议题列表
    const meetingDetail = await OaMeetingApi.getOaMeeting(row.id!)
    currentArchiveMeeting.value = meetingDetail

    // 默认为每个议题设置决议为通过（3表示通过）
    if (meetingDetail.issueList && meetingDetail.issueList.length > 0) {
      meetingDetail.issueList.forEach(issue => {
        if (issue.id) {
          archiveIssueResults.value[issue.id] = 3
        }
      })
    }

    archiveForm.value = {
      archiveFileList: [],
      archiveDescription: ''
    }
    archiveDialogVisible.value = true
  } catch (err) {
    console.error('获取会议详情失败:', err)
    message.error('获取会议详情失败')
  } finally {
    archiveLoading.value = false
  }
}

/** 提交会议归档 */
const submitArchive = async () => {
  if (!archiveFormRef.value) return

  try {
    await archiveFormRef.value.validate()

    // 验证文件上传
    const hasFiles = archiveForm.value.archiveFileList && archiveForm.value.archiveFileList.length > 0
    if (hasFiles && minutesUploadRef.value) {
      const fileValidation = minutesUploadRef.value.validateFiles?.()
      if (fileValidation && !fileValidation.valid) {
        message.error(fileValidation.message)
        return
      }
    }

    archiveLoading.value = true

    // 准备归档数据，确保类型与接口要求一致
    const archiveData: OaMeetingVO = {
      id: currentArchiveMeeting.value.id!,
      status: 4, // 归档状态
      fileList: currentArchiveMeeting.value.fileList as string,
      sequenceCode: currentArchiveMeeting.value.sequenceCode!,
      archiveFileList: archiveForm.value.archiveFileList.join(','),
      archiveDescription: archiveForm.value.archiveDescription
    }

    // 添加议题决议结果
    if (currentArchiveMeeting.value.issueList && currentArchiveMeeting.value.issueList.length > 0) {
      const issueList = currentArchiveMeeting.value.issueList.map(issue => {
        return {
          id: issue.id,
          issueStatus: issue.id ? (archiveIssueResults.value[issue.id] || 3) : 3 // 默认通过
        }
      })
      // 将议题决议结果添加到归档数据中
      archiveData.issueList = issueList
    }

    // 调用归档接口
    await OaMeetingApi.archiveMeeting(archiveData)

    // 标记文件为已保存
    if (hasFiles && minutesUploadRef.value) {
      minutesUploadRef.value.markFilesAsSaved?.()
    }

    message.success('会议归档成功')
    archiveDialogVisible.value = false
    // 刷新列表
    await getList()
  } catch (err) {
    console.error('会议归档失败:', err)
    message.error('会议归档失败')
  } finally {
    archiveLoading.value = false
  }
}

/** 处理归档弹窗关闭 */
const handleArchiveDialogClosed = () => {
  // 清理状态
  currentArchiveMeeting.value = {}
  archiveIssueResults.value = {}
  archiveForm.value = {
    archiveFileList: [],
    archiveDescription: ''
  }
  // 重置上传组件引用
  minutesUploadRef.value = null
}

/** 处理签到弹窗关闭 */
const handleSigninDialogClosed = () => {
  // 清理签到相关状态
  currentManageMeeting.value = {}
  currentMeetingAttendees.value = []
  currentMeetingId.value = undefined
}

/** 处理表决弹窗关闭 */
const handleVoteDialogClosed = () => {
  // 清理表决相关状态
  currentManageMeeting.value = {}
  currentMeetingIssues.value = []
  currentMeetingAttendees.value = []
  currentMeetingId.value = undefined
}

/** 处理通知弹窗关闭 */
const handleNotificationDialogClosed = () => {
  // 清理通知相关状态
  currentMeetingAttendees.value = []
  currentMeetingId.value = undefined
  notificationForm.value = {
    notifyType: 1,
    selectedAttendees: [],
    content: ''
  }
}

/** 处理结束会议弹窗关闭 */
const handleEndMeetingDialogClosed = () => {
  // 清理结束会议相关状态
  currentEndMeeting.value = {}
  endMeetingForm.value = {
    actualStartTime: undefined,
    actualEndTime: undefined
  }
}

/** 处理新增参会人弹窗关闭 */
const handleAddAttendeeDialogClosed = () => {
  // 清理新增参会人相关状态
  selectedAttendeeIds.value = []
}

/** 处理议题详情弹窗关闭 */
const handleIssueDetailClosed = () => {
  // 议题详情弹窗关闭处理
  // 这里可以添加任何需要的清理逻辑
}

/** 处理表决成功事件 */
const handleVoteSuccess = (data: any) => {
  // 可以在这里处理表决成功后的逻辑
  console.log('表决成功:', data)
  message.success('表决提交成功')
}

/** 开始钮操作 */
const startMeeting = async (id: number | string) => {
  try {
    startMeetingLoading.value[id] = true
    await OaMeetingApi.startMeeting(id);
    await getList()
  } finally {
    startMeetingLoading.value[id] = false
  }
}

/** 确认签到 */
const handleConfirmSignin = () => {
  signinManagerRef.value?.confirmSignin()
}

/** 确认签到 */
const confirmSignin = async () => {
  try {
    signinLoading.value = true

    // 调用签到接口，只传递会议ID
    await OaMeetingApi.confirmSignin(currentMeetingId.value!)

    message.success('签到确认成功')
    signinDialogVisible.value = false

    // 标记该会议已完成签到
    if (currentMeetingId.value) {
      meetingSigninStatus.value[currentMeetingId.value] = true
    }

    // 在接口响应后刷新列表数据
    await getList()
  } catch (err) {
    console.error('签到确认失败:', err)
    message.error('签到确认失败')
  } finally {
    signinLoading.value = false
  }
}


/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
