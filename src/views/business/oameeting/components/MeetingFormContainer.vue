<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" class="right-full-dia">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- 基础信息表单 -->
      <BasicMeetingForm v-model:form-data="formData" :meeting-rooms="meetingRooms" />

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="form-tabs">
        <el-tab-pane label="附件上传" name="file">
          <AttachmentManager 
            v-model:file-list="formData.fileList" 
            ref="attachmentManagerRef"
            :mode="formType === 'update' ? 'edit' : formType" />
        </el-tab-pane>
        <el-tab-pane label="参会人员" name="participant">
          <AttendeeManager v-model:attendees="formData.attendeeList" ref="attendeeManagerRef" />
        </el-tab-pane>
        <el-tab-pane label="会议议题" name="issue">
          <IssueManager 
            v-model:issues="formData.issueList" 
            @add-attendee="handleAddAttendee"
          />
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
<!--      <el-button @click="submitForApproval" type="warning" :disabled="formLoading">送 审</el-button>-->
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import {OaMeetingApi, OaMeetingVO} from '@/api/business/oameeting'
import {OaMeetingRoomApi} from '@/api/business/oameetingroom'
import BasicMeetingForm from './BasicMeetingForm.vue'
import AttendeeManager from './AttendeeManager.vue'
import IssueManager from './IssueManager.vue'
import AttachmentManager from './AttachmentManager.vue'
import type {MeetingFormData, MeetingRoom} from './types'
import {reactive, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useMessage} from '@/hooks/web/useMessage'
import {ElMessageBox} from 'element-plus'

/** 会议表单容器 */
defineOptions({ name: 'MeetingFormContainer' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const activeTab = ref('file')

const formRef = ref()
const attachmentManagerRef = ref<typeof AttachmentManager>()

// 表单数据
const formData = ref<MeetingFormData>({
  id: undefined,
  userId: undefined,
  meetName: undefined,
  meetType: undefined,
  meetDate: undefined,
  startTime: undefined,
  endTime: undefined,
  meetRoomId: undefined,
  reason: undefined,
  description: undefined,
  status: undefined,
  fileList: [] as string[], // 明确指定为字符串数组
  sequenceCode: undefined,
  attendeeList: [],
  issueList: []
})

const attendeeManagerRef = ref<typeof AttendeeManager>()

// 会议室列表
const meetingRooms = ref<MeetingRoom[]>([])

// 表单验证规则
const formRules = reactive({
  meetName: [{ required: true, message: '会议名称不能为空', trigger: 'blur' }],
  meetType: [{ required: true, message: '会议类型不能为空', trigger: 'change' }],
  meetRoomId: [{ required: true, message: '请选择会议室', trigger: 'change' }],
  fileList: [{ required: false, message: '请上传会议附件', trigger: 'change' }]
})

/** 获取会议室列表 */
const getMeetingRooms = async () => {
  try {
    const data = await OaMeetingRoomApi.getOaMeetingRoomPage({
      pageNo: 1,
      pageSize: 100,
      meetingRoomStatus: 1
    })
    meetingRooms.value = data.list
  } catch (error) {
    console.error('获取会议室列表失败:', error)
    message.error('获取会议室列表失败')
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  formType.value = type
  dialogTitle.value = t('action.' + type)

  await resetForm()
  await getMeetingRooms()

  dialogVisible.value = true

  if (id) {
    formLoading.value = true
    try {
      const meetingData = await OaMeetingApi.getOaMeeting(id)
      const processedData = { ...meetingData }

      // 处理日期和时间字段
      const processTimestamp = (value: any) => {
        if (value && value !== 0) {
          return typeof value === 'string' ? parseInt(value) : value
        }
        return undefined
      }

      processedData.meetDate = processTimestamp(processedData.meetDate)
      processedData.startTime = processTimestamp(processedData.startTime)
      processedData.endTime = processTimestamp(processedData.endTime)
      
      // 处理文件列表字段
      if (processedData.fileList) {
        if (typeof processedData.fileList === 'string') {
          // 处理字符串格式的文件列表
          let cleanFileList = processedData.fileList.trim();
          
          // 移除可能存在的方括号和引号
          cleanFileList = cleanFileList
            .replace(/^\[["']?/, '')  // 移除开头的 [ 和可能的引号
            .replace(/["']?]$/, ''); // 移除结尾的引号和 ]

          // 分割并处理每个文件ID
          if (cleanFileList) {
            processedData.fileList = cleanFileList
              .split(',')
              .map(id => id.trim().replace(/^["']|["']$/g, '')) // 移除每个ID的首尾空格和引号
              .filter(Boolean); // 过滤空值
          } else {
            processedData.fileList = [];
          }
        } else if (Array.isArray(processedData.fileList)) {
          // 如果已经是数组，清理无效值
          processedData.fileList = processedData.fileList
            .map(id => (typeof id === 'string' ? id.trim().replace(/^["']|["']$/g, '') : id))
            .filter(Boolean);
        } else {
          // 其他情况初始化为空数组
          processedData.fileList = [];
        }
      } else {
        processedData.fileList = [];
      }
      
      processedData.participants = processedData.participants || []
      processedData.agendaTopics = processedData.agendaTopics || []

      formData.value = processedData
    } finally {
      formLoading.value = false
    }
  }
}

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()

  console.log('formData', formData.value)

  // 验证文件上传
  const hasFiles = formData.value.fileList && formData.value.fileList.length > 0
  if (hasFiles && attachmentManagerRef.value) {
    const fileValidation = attachmentManagerRef.value.validateFiles?.()
    if (fileValidation && !fileValidation.valid) {
      message.error(fileValidation.message)
      return
    }
  }

  formLoading.value = true
  try {
    const data = {
      ...formData.value,
      attendeeList: formData.value.attendeeList.map((v) => ({ ...v, id: undefined })),
    } as unknown as OaMeetingVO

    // 修复文件列表字段处理逻辑
    // 确保fileList是数组格式，并正确转换为字符串格式传递给后端
    if (data.fileList && Array.isArray(data.fileList) && data.fileList.length > 0) {
      // 直接使用数组的join方法，避免JSON.stringify可能带来的格式问题
      data.fileList = data.fileList.join(',') as any
    } else {
      data.fileList = '' as any
    }

    if (formType.value === 'create') {
      await OaMeetingApi.createOaMeeting(data)
      message.success(t('common.createSuccess'))
    } else {
      await OaMeetingApi.updateOaMeeting(data)
      message.success(t('common.updateSuccess'))
    }

    // 标记文件为已保存
    if (hasFiles && attachmentManagerRef.value) {
      attachmentManagerRef.value.markFilesAsSaved?.()
    }

    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 送审表单 */
const submitForApproval = async () => {
  try {
    await ElMessageBox.confirm('确定要送审该会议吗？送审后将进入审批流程。', '确认送审', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await formRef.value.validate()

    formLoading.value = true
    try {
      const data = {
        ...formData.value,
        needApproval: true
      } as unknown as OaMeetingVO

      if (data.fileList && Array.isArray(data.fileList) && data.fileList.length > 0) {
        data.fileList = JSON.stringify(data.fileList) as any
      } else {
        data.fileList = '[]' as any
      }

      if (formType.value === 'create') {
        await OaMeetingApi.createOaMeeting(data)
      } else {
        await OaMeetingApi.updateOaMeeting(data)
      }

      message.success('送审成功！')
      dialogVisible.value = false
      emit('success')
    } finally {
      formLoading.value = false
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('送审失败:', error)
      message.error('送审失败，请重试')
    }
  }
}

/** 重置表单 */
const resetForm = async () => {
  formData.value = {
    id: undefined,
    userId: undefined,
    meetName: undefined,
    meetType: undefined,
    meetDate: undefined,
    startTime: undefined,
    endTime: undefined,
    meetRoomId: undefined,
    reason: undefined,
    description: undefined,
    status: undefined,
    fileList: [],
    sequenceCode: undefined,
    attendeeList: [],
    issueList: []
  }

  activeTab.value = 'file'

  if (attachmentManagerRef.value) {
    await attachmentManagerRef.value.clearUnsavedFiles?.()
    attachmentManagerRef.value.resetComponent?.()
  }

  formRef.value?.resetFields()
}

/** 处理添加参会人员事件 */
const handleAddAttendee = (attendee: any) => {
  // 检查该参会人是否已存在于列表中
  const exists = formData.value.attendeeList.some(item => item.userId === attendee.userId);
  
  // 如果不存在，则添加到参会人员列表
  if (!exists) {
    formData.value.attendeeList.push(attendee);
  }
}

defineExpose({ open })
</script>

<style scoped>
.form-tabs {
  margin-top: 20px;
}
</style>
