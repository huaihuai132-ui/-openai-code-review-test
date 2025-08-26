<template>
    <el-row :gutter="20">
        <el-col :span="16">
            <ContentWrap title="议题信息">
                <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
                    <el-form-item label="议题标题" prop="issueTitle">
                        <el-input v-model="formData.issueTitle" placeholder="请输入议题标题" />
                    </el-form-item>
                    <el-form-item label="议题类型" prop="issueType">
                        <el-select v-model="formData.issueType" placeholder="请选择议题类型">
                            <el-option
                                v-for="dict in getIntDictOptions(DICT_TYPE.MEET_ISSUE_TYPE)"
                                :key="dict.value"
                                :label="dict.label"
                                :value="dict.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="上会类型" prop="meetingType">
                        <el-select v-model="formData.meetingType" placeholder="请选择上会类型">
                            <el-option
                                v-for="dict in getIntDictOptions(DICT_TYPE.MEET_TYPE)"
                                :key="dict.value"
                                :label="dict.label"
                                :value="dict.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="议题概述" prop="description">
                        <el-input 
                            v-model="formData.description" 
                            type="textarea" 
                            :rows="3"
                            placeholder="请输入议题概述"
                            style="width: 500px;"
                        />
                    </el-form-item>
                    <el-form-item label="议题详细内容" prop="issueContent">
                        <el-input 
                            v-model="formData.issueContent" 
                            type="textarea" 
                            :rows="6"
                            placeholder="请输入议题详细内容"
                            style="width: 500px;" 
                        />
                    </el-form-item>
                    <el-form-item label="议题附件" prop="issueAttachment">
                        <UploadFile
                            v-model="uploadFileUrls"
                            :limit="10"
                            :file-type="['jpg', 'png', 'pdf', 'doc', 'docx']"
                            :file-size="10"
                            :drag="true"
                            directory="uploads"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button :disabled="formLoading" type="primary" @click="submitForm">
                            确 定
                        </el-button>
                    </el-form-item>
                </el-form>
            </ContentWrap>
        </el-col>

        <!-- 审批相关：流程信息 -->
        <el-col :span="8">
            <ContentWrap title="审批流程" :bodyStyle="{ padding: '0 20px 0' }">
                <ProcessInstanceTimeline
ref="timelineRef" :activity-nodes="activityNodes" :show-status-icon="false"
                    @select-user-confirm="selectUserConfirm" />
            </ContentWrap>
        </el-col>
    </el-row>
</template>
<script lang="ts" setup>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { OaMeetingIssueApi, OaMeetingIssueVO, FileAttachmentVO } from 'src/api/business/oameetingissue/index.ts'
import { UploadFile } from '@/components/UploadFile'
import { useTagsViewStore } from '@/store/modules/tagsView'

// 审批相关：import
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'

defineOptions({ name: 'BpmOAMeetingIssueCreate' })

// 定义组件发出的事件
const emit = defineEmits(['success'])

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  id: undefined,
  userId: undefined,
  issueNo: undefined,
  issueTitle: undefined,
  issueType: undefined,
  meetingType: undefined,
  issueContent: undefined,
  description: undefined,
  issueAttachment: [] as FileAttachmentVO[],
})
const formRules = reactive({
  issueTitle: [{ required: true, message: '议题标题不能为空', trigger: 'blur' }],
  issueType: [{ required: true, message: '议题类型不能为空', trigger: 'change' }],
  meetingType: [{ required: true, message: '上会类型不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

// 上传文件 URL 数组，用于与 UploadFile 组件绑定
const uploadFileUrls = ref<string[]>([])

// 审批相关：变量
const processDefineKey = 'oa_meet_issue' // 流程定义 Key
const startUserSelectTasks = ref<any[]>([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref<Record<string, number[]>>({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref<Record<string, number[]>>({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 审批节点信息
const processDefinitionId = ref('')

// 监听文件 URL 变化，转换为 FileAttachmentVO 对象
watch(uploadFileUrls, (newUrls: string[]) => {
  formData.value.issueAttachment = newUrls.map(url => {
    // 从 URL 中提取文件名
    const fileName = url.substring(url.lastIndexOf('/') + 1)
    const originalFileName = fileName.split('_').slice(1).join('_') || fileName // 去掉时间戳前缀
    
    return {
      name: originalFileName,
      path: fileName,
      url: url,
      businessCode: 'MEETING_ISSUE'
    } as FileAttachmentVO
  })
}, { deep: true })

/** 提交表单 */
const submitForm = async () => {
  // 1.1 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 1.2 审批相关：校验指定审批人
  if (startUserSelectTasks.value?.length > 0) {
    for (const userTask of startUserSelectTasks.value) {
      if (
        Array.isArray(startUserSelectAssignees.value[userTask.id]) &&
        startUserSelectAssignees.value[userTask.id].length === 0
      ) {
        return message.warning(`请选择${userTask.name}的审批人`)
      }
    }
  }

  // 2. 提交请求
  formLoading.value = true
  try {
    const data = { ...formData.value } as unknown as OaMeetingIssueVO
    // 审批相关：设置指定审批人
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }
    await OaMeetingIssueApi.createOaMeetingIssue(data)
    message.success('发起成功')
    // 发送成功事件
    emit('success')
    // 关闭当前 Tab
    delView(unref(currentRoute))
  } finally {
    formLoading.value = false
  }
}

/** 关闭弹窗 */
const close = () => {
  // 触发关闭事件
  emit('close')
}

defineExpose({
  close
})

/** 审批相关：获取审批详情 */
const getApprovalDetail = async () => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({}) // 可根据实际需求添加变量
    })

    if (!data) {
      message.error('查询不到审批详情信息！')
      return
    }
    // 获取审批节点，显示 Timeline 的数据
    activityNodes.value = data.activityNodes

    // 获取发起人自选的任务
    startUserSelectTasks.value = data.activityNodes?.filter(
      (node: ApprovalNodeInfo) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
    // 恢复之前的选择审批人
    if (startUserSelectTasks.value?.length > 0) {
      for (const node of startUserSelectTasks.value) {
        if (
          tempStartUserSelectAssignees.value[node.id] &&
          tempStartUserSelectAssignees.value[node.id].length > 0
        ) {
          startUserSelectAssignees.value[node.id] = tempStartUserSelectAssignees.value[node.id]
        } else {
          startUserSelectAssignees.value[node.id] = []
        }
      }
    }
  } finally {
  }
}

/** 审批相关：选择发起人 */
const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
}

/** 初始化 */
onMounted(async () => {
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )

  if (!processDefinitionDetail) {
    message.error('OA 会议议题的流程模型未配置，请检查！')
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  // 审批相关：加载最新的审批详情，主要用于节点预测
  await getApprovalDetail()
})
</script>