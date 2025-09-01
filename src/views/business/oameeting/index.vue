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
      <el-table-column label="开始时间" align="center" prop="startTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="结束时间" align="center" prop="endTime" :formatter="dateFormatter" width="180px" />
<!--      <el-table-column label="会议室ID" align="center" prop="meetRoomId" />-->
      <el-table-column label="会议事由" align="center" prop="reason" />
      <el-table-column label="会议概述" align="center" prop="description" />
      <el-table-column label="会议状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.MEET_STATUS" :value="scope.row.status || 0" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
<!--      <el-table-column label="文件id列表" align="center" prop="fileList" />-->
<!--      <el-table-column label="文件序列编码" align="center" prop="sequenceCode" />-->
      <el-table-column label="操作" align="center" min-width="300px">
        <template #default="scope">
          <el-button
            link
            type="info"
            @click="openDetail(scope.row.id)"
            v-hasPermi="['business:oa-meeting:query']"
            :disabled="sendApproveLoading[scope.row.id]"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:oa-meeting:update']"
            v-if="scope.row.status === -1"
            :disabled="sendApproveLoading[scope.row.id]"
          >
            编辑
          </el-button>
          <el-button
            link
            type="warning"
            @click="sendApprove(scope.row.id)"
            v-hasPermi="['business:oa-meeting:sendApprove']"
            :disabled="sendApproveLoading[scope.row.id]"
            :loading="sendApproveLoading[scope.row.id]"
            v-if="scope.row.status === -1"
          >
            送审
          </el-button>
          <el-button
            link
            type="success"
            @click="openNotificationDialog(scope.row)"
            v-hasPermi="['business:oa-meeting:notify']"
            v-if="scope.row.status === 2"
          >
            通知
          </el-button>
          <el-button
            link
            type="primary"
            @click="openSigninDialog(scope.row)"
            v-hasPermi="['business:oa-meeting:manage']"
            v-if="scope.row.status === 2"
          >
            会议签到
          </el-button>
          <el-button
            link
            type="primary"
            @click="openVoteDialog(scope.row)"
            v-hasPermi="['business:oa-meeting:manage']"
            v-if="scope.row.status === 8"
          >
            会议表决
          </el-button>
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
  <OaMeetingForm ref="formRef" @success="getList" />
  <!-- 详情弹窗 -->
  <OaMeetingDetail ref="detailRef" />
  
  <!-- 会议通知弹窗 -->
  <Dialog v-model="notificationDialogVisible" title="会议通知" width="600px">
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
            :value="attendee.id"
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
  <Dialog v-model="addAttendeeDialogVisible" title="新增参会人" width="600px">
    <UserSelectForm ref="userSelectFormRef" @confirm="handleAddAttendees" />
    
    <template #footer>
      <el-button @click="addAttendeeDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirmAddAttendees">确 定</el-button>
    </template>
  </Dialog>
  
  <!-- 会议签到弹窗 -->
  <Dialog v-model="signinDialogVisible" title="会议签到" width="800px">
    <div class="mb-4">
      <el-button type="primary" @click="openAddAttendeeDialog">
        <Icon icon="ep:plus" />
        新增参会人
      </el-button>
    </div>
    
    <el-table :data="currentMeetingAttendees" border>
      <el-table-column prop="userName" label="姓名" width="120" />
      <el-table-column prop="userDepartmentName" label="部门" width="150" />
      <el-table-column prop="position" label="职务" width="150" />
      <el-table-column label="签到状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.signed ? 'success' : 'info'">
            {{ row.signed ? '已签到' : '未签到' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            link 
            @click="signAttendance(row)"
            :disabled="row.signed"
          >
            签到
          </el-button>
          <el-button 
            type="danger" 
            link 
            @click="removeAttendee(row)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <template #footer>
      <el-button @click="signinDialogVisible = false">取 消</el-button>
      <el-button 
        type="primary" 
        @click="confirmSignin" 
        :loading="signinLoading"
      >
        确认签到并开始会议
      </el-button>
    </template>
  </Dialog>
  
  <!-- 会议表决弹窗 -->
  <Dialog v-model="voteDialogVisible" title="会议表决" width="800px">
<!--    <el-alert -->
<!--      v-if="!isAllSignedInVote" -->
<!--      title="请先完成所有参会人员签到，然后才能进行议题表决" -->
<!--      type="warning" -->
<!--      show-icon -->
<!--      class="mb-4"-->
<!--    />-->
    
    <el-table :data="currentMeetingIssues" border>
      <el-table-column prop="issueTitle" label="议题标题" min-width="200" />
      <el-table-column prop="issueType" label="议题类型" width="120">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="row.issueType" />
        </template>
      </el-table-column>
      <el-table-column prop="reporterName" label="汇报人" width="120" />
      <el-table-column label="表决结果" width="150">
        <template #default="{ row }">
          <el-tag :type="row.voted ? 'success' : 'info'">
            {{ row.voted ? '已表决' : '未表决' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewIssueDetail(row)">
            查看详情
          </el-button>
          <el-button 
            type="success" 
            link 
            @click="openIssueVoteDialog(row)"
            :disabled="row.voted"
          >
            表决
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <template #footer>
      <el-button @click="voteDialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
  
  <!-- 议题表决弹窗 -->
  <Dialog v-model="issueVoteDialogVisible" title="议题表决" width="600px">
    <el-form
      ref="issueVoteFormRef"
      :model="issueVoteForm"
      :rules="issueVoteRules"
      label-width="100px"
    >
      <el-form-item label="议题标题">
        <el-input v-model="currentVotingIssue.issueTitle" disabled />
      </el-form-item>
      
      <el-form-item label="表决结果" prop="voteResult" required>
        <el-radio-group v-model="issueVoteForm.voteResult">
          <el-radio :label="1">同意</el-radio>
          <el-radio :label="2">反对</el-radio>
          <el-radio :label="3">弃权</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="表决意见" prop="voteOpinion">
        <el-input
          v-model="issueVoteForm.voteOpinion"
          type="textarea"
          :rows="4"
          placeholder="请输入表决意见"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="issueVoteDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitIssueVote" :loading="issueVoteLoading">提 交</el-button>
    </template>
  </Dialog>
  
  <!-- 结束会议弹窗 -->
  <Dialog v-model="endMeetingDialogVisible" title="结束会议" width="600px">
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
  <Dialog v-model="archiveDialogVisible" title="会议归档" width="600px">
    <el-form
      ref="archiveFormRef"
      :model="archiveForm"
      :rules="archiveRules"
      label-width="120px"
    >
      <el-form-item label="会议纪要" prop="meetingMinutes">
        <BatchFileUpload
          ref="minutesUploadRef"
          v-model:fileList="archiveForm.meetingMinutes"
          mode="create"
          file-type="common"
          directory="meeting_minutes"
          :max-files="3"
          tip="支持上传多个文件，最多3个"
        />
      </el-form-item>
      
      <el-form-item label="归档说明" prop="archiveDescription">
        <el-input
          v-model="archiveForm.archiveDescription"
          type="textarea"
          :rows="4"
          placeholder="请输入归档说明"
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
  <OaMeetingIssueDetail ref="issueDetailRef" />
</template>

<script setup lang="ts">
import {DICT_TYPE, getStrDictOptions} from '@/utils/dict'
import {dateFormatter, formatDate} from '@/utils/formatTime'
import download from '@/utils/download'
import {OaMeetingApi, OaMeetingVO} from '@/api/business/oameeting'
import OaMeetingForm from './OaMeetingForm.vue'
import OaMeetingDetail from './OaMeetingDetail.vue'
import {Dialog} from '@/components/Dialog'
import UserSelectForm from '@/components/UserSelectForm/index.vue'
import OaMeetingIssueDetail from '@/views/business/oameetingissue/OaMeetingIssueDetail.vue'
import {BatchFileUpload} from '@/components/UploadFile'

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
const sendApproveLoading = ref<Record<number, boolean>>({}) // 送审的加载中状态

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
const voteDialogVisible = ref(false)
const activeManageTab = ref('attendees')
const currentMeetingIssues = ref<any[]>([])
const currentManageMeeting = ref<OaMeetingVO>({})

// 新增参会人相关
const addAttendeeDialogVisible = ref(false)
const userSelectFormRef = ref<typeof UserSelectForm>()
const selectedNewAttendees = ref<any[]>([])

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
const issueDetailRef = ref<typeof OaMeetingIssueDetail>()

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
const archiveForm = ref({
  meetingMinutes: [] as (number | string)[],
  archiveDescription: ''
})
const archiveRules = {
  meetingMinutes: [{ required: true, message: '请上传会议纪要', trigger: 'change' }]
}
const archiveLoading = ref(false)
const minutesUploadRef = ref<typeof BatchFileUpload>()
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
    await OaMeetingApi.deleteOaMeeting(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 送审按钮操作 */
const sendApprove = async (id: number) => {
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
    content: `会议通知：${row.meetName}将于${row.meetDate ? formatDate(new Date(row.meetDate), 'YYYY-MM-DD') : ''}召开，请准时参加。`
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
        ? currentMeetingAttendees.value.map(a => a.id) 
        : notificationForm.value.selectedAttendees,
      content: notificationForm.value.content
    }
    
    // 调用通知接口（这里假设有一个通知接口）
    // await OaMeetingApi.notifyAttendees(notifyData)
    
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
      signed: attendee.signed || false
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
      voted: issue.voted || false
    }))
    
    // 初始化参会人员数据，用于检查签到状态
    currentMeetingAttendees.value = (meetingDetail.attendeeList || []).map(attendee => ({
      ...attendee,
      signed: attendee.signed || false
    }))
  } catch (err) {
    console.error('获取会议详情失败:', err)
    message.error('获取会议详情失败')
    currentMeetingIssues.value = []
    currentMeetingAttendees.value = []
  }
  
  voteDialogVisible.value = true
}

// 计算是否所有参会人员都已签到（用于表决弹窗）
const isAllSignedInVote = computed(() => {
  return currentMeetingAttendees.value.length > 0 && 
         currentMeetingAttendees.value.every(attendee => attendee.signed)
})

// /** 检查会议是否已完成签到 */
// const isMeetingSigned = (meetingId: number) => {
//   return meetingSigninStatus.value[meetingId] || false
// }

/** 签到 */
const signAttendance = (attendee: any) => {
  attendee.signed = true
  message.success(`${attendee.userName} 签到成功`)
  
  // 检查是否所有人员都已签到
  const allSigned = currentMeetingAttendees.value.every(a => a.signed)
  if (allSigned && currentMeetingId.value) {
    // 标记该会议已完成签到
    meetingSigninStatus.value[currentMeetingId.value] = true
  }
}

/** 打开新增参会人弹窗 */
const openAddAttendeeDialog = () => {
  selectedNewAttendees.value = []
  addAttendeeDialogVisible.value = true
  // 延迟打开用户选择弹窗
  nextTick(() => {
    userSelectFormRef.value?.open(0, [])
  })
}

/** 处理新增参会人确认 */
const handleAddAttendees = (_id: any, userList: any[]) => {
  selectedNewAttendees.value = userList
}

/** 确认添加参会人 */
const confirmAddAttendees = async () => {
  if (selectedNewAttendees.value.length === 0) {
    message.warning('请至少选择一个参会人')
    return
  }
  
  try {
    // 过滤掉已存在的参会人
    const existingAttendeeIds = currentMeetingAttendees.value.map(a => a.id)
    const newAttendees = selectedNewAttendees.value.filter(
      attendee => !existingAttendeeIds.includes(attendee.id)
    )
    
    if (newAttendees.length === 0) {
      message.warning('选择的参会人已存在')
      return
    }
    
    // 添加新参会人（这里需要调用API更新会议信息）
    const updatedAttendees = [
      ...currentMeetingAttendees.value,
      ...newAttendees.map(attendee => ({
        ...attendee,
        signed: false,
        voted: false
      }))
    ]
    
    currentMeetingAttendees.value = updatedAttendees
    addAttendeeDialogVisible.value = false
    message.success('参会人添加成功')
  } catch (err) {
    console.error('添加参会人失败:', err)
    message.error('添加参会人失败')
  }
}

/** 移除参会人 */
const removeAttendee = (attendee: any) => {
  const index = currentMeetingAttendees.value.findIndex(a => a.id === attendee.id)
  if (index > -1) {
    currentMeetingAttendees.value.splice(index, 1)
    message.success('参会人移除成功')
  }
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
const openArchiveDialog = (row: OaMeetingVO) => {
  currentArchiveMeeting.value = row
  archiveForm.value = {
    meetingMinutes: [],
    archiveDescription: ''
  }
  archiveDialogVisible.value = true
}

/** 提交会议归档 */
const submitArchive = async () => {
  if (!archiveFormRef.value) return
  
  try {
    await archiveFormRef.value.validate()
    
    // 验证文件上传
    const hasFiles = archiveForm.value.meetingMinutes && archiveForm.value.meetingMinutes.length > 0
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
      meetingMinutes: archiveForm.value.meetingMinutes.join(','),
      archiveDescription: archiveForm.value.archiveDescription
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
  } catch (err) {
    console.error('签到确认失败:', err)
    message.error('签到确认失败')
  } finally {
    signinLoading.value = false
  }
}

/** 监听通知方式变化 */
watch(() => notificationForm.value.notifyType, (newVal) => {
  if (newVal === 1) {
    // 全部参会人时清空已选择的参会人
    notificationForm.value.selectedAttendees = []
  }
})

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
