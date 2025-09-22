<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="申请信息">
        <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">
          <el-form-item label="外出类型" prop="type">
            <el-select v-model="formData.type" clearable placeholder="请选择外出类型">
              <el-option v-for="dict in getIntDictOptions(DICT_TYPE.BPM_OA_OUT_TYPE)" :key="dict.value"
                :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker v-model="formData.startTime" clearable placeholder="请选择开始时间" type="datetime"
              value-format="x" />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker v-model="formData.endTime" clearable placeholder="请选择结束时间" type="datetime"
              value-format="x" />
          </el-form-item>
          <el-form-item label="详细原因" prop="reason">
            <el-input v-model="formData.reason" placeholder="请输入外出详细原因" type="textarea" />
          </el-form-item>
          <el-form-item label="附件" prop="fileList">
            <BatchFileUpload ref="fileUploadRef" v-model:fileList="formData.fileList" mode="create"
                :max-files="10" directory="business" :file-size="10" tip="支持上传多个文件，每个文件不超过10MB" />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="submitForm">
              确 定
            </el-button>
            <el-button type="info" @click="showPrintPreview">
              <Icon icon="ep:view" class="mr-5px" />
              打印预览
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
  <!-- 打印预览弹窗 -->
  <PrintPreview v-model="printPreviewVisible" :out-data="previewData" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as OutApi from '@/api/bpm/form/out'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { BatchFileUpload } from '@/components/UploadFile'
import PrintPreview from './components/PrintPreview.vue'
import { useUserStore } from '@/store/modules/user'

// 审批相关：import
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'

defineOptions({ name: 'BpmOAOutCreate' })

const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由
const userStore = useUserStore() // 用户信息

// 定义 emit 事件
const emit = defineEmits(['success'])

const printPreviewVisible = ref(false) // 打印预览弹窗显示状态
const previewData = ref({}) // 预览数据

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  type: undefined,
  reason: undefined,
  startTime: undefined,
  endTime: undefined,
  fileList: [] as string[],
  sequenceCode: ''
})
const formRules = reactive({
  type: [{ required: true, message: '外出类型不能为空', trigger: 'blur' }],
  reason: [{ required: true, message: '外出原因不能为空', trigger: 'change' }],
  startTime: [{ required: true, message: '外出开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '外出结束时间不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const fileUploadRef = ref() // 文件上传组件 Ref

// 审批相关：变量
const processDefineKey = 'oa_form_out' // 流程定义 Key
const startUserSelectTasks = ref<any[]>([]) // 添加类型
const startUserSelectAssignees = ref<Record<string, number[]>>({}) // 添加类型
const tempStartUserSelectAssignees = ref<Record<string, number[]>>({}) // 添加类型
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 已有类型
const processDefinitionId = ref('')

/** 显示打印预览 */
const showPrintPreview = () => {
  // 准备预览数据
  previewData.value = {
    creator: userStore.getUser?.nickname || '当前用户',
    createTime: new Date(),
    type: formData.value.type,
    startTime: formData.value.startTime,
    endTime: formData.value.endTime,
    reason: formData.value.reason,
    day: calculateDays()
  }
  printPreviewVisible.value = true
}

// 计算天数差
const calculateDays = () => {
  if (!formData.value.startTime || !formData.value.endTime) {
    return 0
  }
  
  try {
    // 处理时间戳（毫秒或秒）
    let startTimestamp = Number(formData.value.startTime)
    let endTimestamp = Number(formData.value.endTime)
    
    // 如果是秒级时间戳，转换为毫秒
    if (startTimestamp.toString().length === 10) {
      startTimestamp = startTimestamp * 1000
    }
    if (endTimestamp.toString().length === 10) {
      endTimestamp = endTimestamp * 1000
    }
    
    const diffTime = Math.abs(endTimestamp - startTimestamp)
    if (diffTime === 0) {
      return 0
    }
    
    // 计算小时数
    const hours = diffTime / (60 * 60 * 1000)
    if (hours < 4) {
      return 0.5
    }
    
    // 大于等于4小时，向上取整算一天
    const oneDay = 24 * 60 * 60 * 1000 // 一天的毫秒数
    return Math.ceil(diffTime / oneDay)
  } catch (error) {
    return 0
  }
}

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
    const data = { ...formData.value } as unknown as OutApi.OutVO

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
    await OutApi.createOut(data)
    message.success('发起成功')
    // 发送成功事件
    emit('success')
    // 关闭当前 Tab
    delView(unref(currentRoute))
  } finally {
    formLoading.value = false
  }
}

// 审批相关：方法
const selectUserConfirm = (userList: any[], node: ApprovalNodeInfo) => {
  startUserSelectAssignees.value[node.id] = userList.map((item) => item.id)
}

/** 获得审批详情 */
const getApprovalDetail = async () => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({}) // 外出申请暂时不需要特殊变量
    })

    if (!data) {
      message.error('查询不到审批详情信息！')
      return
    }
    // 获取审批节点，显示 Timeline 的数据
    activityNodes.value = data.activityNodes

    // 获取发起人自选的任务
    startUserSelectTasks.value = data.activityNodes?.filter(
      (item: any) => item.candidateStrategy === CandidateStrategy.START_USER_SELECT
    )
  } catch (error) {
    console.error(error)
  }
}

/** 初始化 */
onMounted(async () => {
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )

  if (!processDefinitionDetail) {
    message.error('OA 外出申请的流程模型未配置，请检查！')
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  // 审批相关：加载最新的审批详情，主要用于节点预测
  await getApprovalDetail()
})
</script>
