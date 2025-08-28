<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="报修信息">
        <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">
          <el-form-item label="报修详情" prop="reason">
            <el-input v-model="formData.reason" placeholder="请输入报修详情" type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item label="附件" prop="fileList">
            <BatchFileUpload ref="fileUploadRef" v-model:fileList="formData.fileList" mode="create"
                :max-files="10" directory="business" :file-size="10" tip="支持上传多个文件，每个文件不超过10MB" />
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
        <ProcessInstanceTimeline ref="timelineRef" :activity-nodes="activityNodes" :show-status-icon="false"
          @select-user-confirm="selectUserConfirm" />
      </ContentWrap>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import * as MaintenanceApi from '@/api/bpm/form/maintenance'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { BatchFileUpload } from '@/components/UploadFile'

// 审批相关：import
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'

defineOptions({ name: 'BpmOAMaintenanceCreate' })

const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { currentRoute } = useRouter() // 路由

// 定义 emit 事件
const emit = defineEmits(['success'])

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  reason: undefined,
  fileList: [] as string[],
  sequenceCode: ''
})
const formRules = reactive({
  reason: [{ required: true, message: '报修详情不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const fileUploadRef = ref() // 文件上传组件 Ref

// 审批相关：变量
const processDefineKey = 'oa_form_maintenance' // 流程定义 Key
const startUserSelectTasks = ref<any[]>([]) // 添加类型
const startUserSelectAssignees = ref<Record<string, number[]>>({}) // 添加类型
const tempStartUserSelectAssignees = ref<Record<string, number[]>>({}) // 添加类型
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 已有类型
const processDefinitionId = ref('')

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
    const data = { ...formData.value } as unknown as MaintenanceApi.MaintenanceVO

    // 处理文件列表 - 将文件ID数组转换为逗号分隔的字符串
    if (formData.value.fileList && formData.value.fileList.length > 0) {
      data.fileList = formData.value.fileList.join(',')
    } else {
      data.fileList = ''
    }

    // 审批相关：设置指定审批人
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }
    await MaintenanceApi.createMaintenance(data)
    message.success('发起成功')
    // 发送成功事件
    emit('success')
    // 关闭当前 Tab
    delView(unref(currentRoute))
  } finally {
    formLoading.value = false
  }
}

/** 审批相关：获取审批详情 */
const getApprovalDetail = async () => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      // TODO 小北：可以支持 processDefinitionKey 查询
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({}) // 报修申请相对简单，无需传递特殊变量
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

/** 初始化流程定义 */
const initProcessDefinition = async () => {
  // TODO @小北：这里可以简化，统一通过 getApprovalDetail 处理么？
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )

  if (!processDefinitionDetail) {
    message.error('OA 报修的流程模型未配置，请检查！')
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  // 审批相关：加载最新的审批详情，主要用于节点预测
  await getApprovalDetail()
}

// 在组件挂载后初始化流程定义
onMounted(async () => {
  await initProcessDefinition()
})

/** 审批相关：预测流程节点会因为输入的参数值而产生新的预测结果值，所以需重新预测一次, formData.value可改成实际业务中的特定字段 */
watch(
  formData.value,
  (newValue, oldValue) => {
    if (!oldValue) {
      return
    }
    if (newValue && Object.keys(newValue).length > 0) {
      // 记录之前的节点审批人
      tempStartUserSelectAssignees.value = startUserSelectAssignees.value
      startUserSelectAssignees.value = {}
      // 加载最新的审批详情,主要用于节点预测
      getApprovalDetail()
    }
  },
  {
    immediate: true
  }
)
</script>