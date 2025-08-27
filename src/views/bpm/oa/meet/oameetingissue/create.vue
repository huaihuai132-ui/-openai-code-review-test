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
                    <!-- 添加汇报人字段 -->
                    <el-form-item label="汇报人" prop="reporterId">
                        <el-select 
                            v-model="formData.reporterId" 
                            placeholder="请选择汇报人" 
                            clearable
                            filterable
                            remote
                            :remote-method="searchUsers"
                            :loading="userLoading"
                        >
                            <el-option
                                v-for="user in filteredUserList"
                                :key="user.id"
                                :label="user.nickname"
                                :value="user.id"
                            />
                        </el-select>
                    </el-form-item>
                    <!-- 添加相关部门字段 -->
                    <el-form-item label="相关部门" prop="relevantDept">
                        <el-tree-select
                            v-model="formData.relevantDept"
                            :data="deptList"
                            :props="{ 
                                value: 'id',
                                label: 'name',
                                children: 'children',
                                disabled: 'disabled'
                            }"
                            value-key="id"
                            check-strictly
                            node-key="id"
                            placeholder="请选择相关部门"
                            clearable
                            filterable
                            multiple
                            :default-expand-all="true"
                        />
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
                    <el-form-item label="议题附件" prop="fileList">
                        <BatchFileUpload 
                            ref="fileUploadRef"
                            v-model:fileList="formData.fileList"
                            mode="create"
                            directory="business"
                            :max-files="5" 
                            :concurrent="2" 
                            :drag="true" 
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
import { BatchFileUpload } from '@/components/UploadFile'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import { handleTree } from '@/utils/tree'

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
const userLoading = ref(false) // 用户列表加载状态

// 用户列表
const userList = ref<any[]>([])
const filteredUserList = ref<any[]>([])

// 部门相关
const deptList = ref<Tree[]>([]) // 树形结构

const formData = ref({
  id: undefined,
  userId: undefined,
  issueNo: undefined,
  issueTitle: undefined,
  issueType: undefined,
  meetingType: undefined,
  reporterId: undefined, // 添加汇报人字段
  relevantDept: [] as number[], // 添加相关部门字段，使用number数组类型
  issueContent: undefined,
  description: undefined,
  fileList: [] as (number | string)[], // 修改为支持数字或字符串ID的数组
})
const formRules = reactive({
  issueTitle: [{ required: true, message: '议题标题不能为空', trigger: 'blur' }],
  issueType: [{ required: true, message: '议题类型不能为空', trigger: 'change' }],
  meetingType: [{ required: true, message: '上会类型不能为空', trigger: 'change' }],
  reporterId: [{ required: true, message: '汇报人不能为空', trigger: 'change' }], // 添加汇报人校验规则
})
const formRef = ref() // 表单 Ref

// 上传组件引用
const fileUploadRef = ref()

// 审批相关：变量
const processDefineKey = 'oa_meet_issue' // 流程定义 Key
const startUserSelectTasks = ref<any[]>([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref<Record<string, number[]>>({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref<Record<string, number[]>>({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 审批节点信息
const processDefinitionId = ref('')

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
    message.error('获取用户列表失败')
  } finally {
    userLoading.value = false
  }
}

/** 获取部门树 */
const getDeptList = async () => {
  try {
    const data = await DeptApi.getSimpleDeptList()
    deptList.value = handleTree(data)
  } catch (error) {
    console.error('获取部门列表失败:', error)
    message.error('获取部门列表失败')
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
    // 创建一个新的数据对象，将fileList转换为字符串格式
    const data = {
      ...formData.value,
      fileList: Array.isArray(formData.value.fileList) && formData.value.fileList.length > 0
        ? formData.value.fileList.join(',')  // 直接使用字符串避免精度丢失
        : '',
      // 处理相关部门数据，转换为逗号分隔的字符串
      relevantDept: Array.isArray(formData.value.relevantDept) && formData.value.relevantDept.length > 0
        ? formData.value.relevantDept.join(',')
        : ''
    } as unknown as OaMeetingIssueVO
    
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
  // 获取用户列表和部门列表
  await Promise.all([getUserList(), getDeptList()])
  
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
