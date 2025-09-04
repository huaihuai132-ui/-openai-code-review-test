<template>
    <el-row :gutter="20">
        <el-col :span="16">
            <ContentWrap title="申请信息">
                <!-- 申请人信息显示 -->
                <el-alert :title="`申请人：${userStore.getUser.nickname || '未知'} | 部门：${deptName || '未知'}`" type="info"
                    :closable="false" style="margin-bottom: 20px;" />
                    
                <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
                    <el-form-item label="交通方式" prop="trafficType">
                        <el-select v-model="formData.trafficType" placeholder="请选择交通方式" style="width: 100%">
                            <el-option
                                v-for="dict in getIntDictOptions(DICT_TYPE.TRAVEL_TRAFFIC_TYPE)"
                                :key="dict.value"
                                :label="dict.label"
                                :value="dict.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item v-if="formData.trafficType === 4" label="乘坐飞机原因" prop="airplaneReason">
                        <el-input v-model="formData.airplaneReason" placeholder="请输入乘坐飞机原因" type="textarea" />
                    </el-form-item>
                    <el-form-item label="出差时间" prop="startTime">
                        <el-date-picker
                            v-model="formData.startTime"
                            type="datetime"
                            placeholder="请选择出差时间"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="归来时间" prop="endTime">
                        <el-date-picker
                            v-model="formData.endTime"
                            type="datetime"
                            placeholder="请选择归来时间"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="出差地点" prop="address">
                        <el-input v-model="formData.address" placeholder="请输入出差地点" />
                    </el-form-item>
                    <el-form-item label="出差事由" prop="reason">
                        <el-input v-model="formData.reason" placeholder="请输入出差事由" type="textarea" />
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="formData.remark" placeholder="请输入备注" type="textarea" />
                    </el-form-item>
                    <el-form-item label="出差人员" prop="personList">
                        <div class="mb-10px">
                            <el-button type="primary" @click="openUserSelect">选择人员</el-button>
                            <el-button type="success" @click="showManualInput">手动添加</el-button>
                        </div>
                        <el-table :data="personList" border style="width: 100%">
                            <el-table-column label="姓名" prop="nickname" />
                            <el-table-column label="类型">
                                <template #default="{ row }">
                                    <el-tag :type="row.userId ? 'primary' : 'info'">
                                        {{ row.userId ? '内部人员' : '外部人员' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="100">
                                <template #default="{ $index }">
                                    <el-button type="danger" link @click="removePerson($index)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-form-item>
                    <el-form-item label="附件" prop="fileList">
                        <BatchFileUpload ref="fileUploadRef" v-model:fileList="formData.fileList" mode="create"
                            :max-files="10" directory="business" :file-size="10" tip="支持上传多个文件，每个文件不超过10MB" />
                    </el-form-item>
                    <el-form-item>
                        <el-button :disabled="formLoading" type="primary" @click="submitForm">
                            确 定
                        </el-button>
                        <el-button type="info" @click="showPrintPreview" :disabled="!canPreview">
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
    <PrintPreview v-model="printPreviewVisible" :travel-data="previewData" />
    
    <!-- 人员选择弹窗 -->
    <UserSelectForm ref="userSelectRef" @confirm="handleUserSelect" />
    
    <!-- 手动添加人员弹窗 -->
    <el-dialog v-model="manualInputVisible" title="手动添加人员" width="400px">
        <el-form :model="manualInputForm" :rules="manualInputRules" ref="manualInputFormRef" label-width="80px">
            <el-form-item label="姓名" prop="nickname">
                <el-input v-model="manualInputForm.nickname" placeholder="请输入姓名" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="manualInputVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmManualInput">确定</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import * as TravelApi from '@/api/bpm/form/travel'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { BatchFileUpload } from '@/components/UploadFile'
import PrintPreview from './components/PrintPreview.vue'
import { useUserStore } from '@/store/modules/user'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import UserSelectForm from '@/components/UserSelectForm/index.vue'
import * as DeptApi from '@/api/system/dept'

// 审批相关：import
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'

defineOptions({ name: 'BpmOATravelCreate' })

const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由
const userStore = useUserStore() // 用户信息
const deptName = ref('') // 部门名称

// 定义 emit 事件
const emit = defineEmits(['success'])

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
    deptId: undefined as number | undefined, // 部门ID
    trafficType: 1, // 默认火车
    airplaneReason: '',
    startTime: new Date(),
    endTime: new Date(),
    address: '',
    reason: '',
    remark: '',
    personList: [] as TravelApi.TravelPersonListVO[],
    fileList: [] as string[],
    sequenceCode: ''
})
const formRules = reactive({
    trafficType: [{ required: true, message: '交通方式不能为空', trigger: 'change' }],
    startTime: [{ required: true, message: '出差时间不能为空', trigger: 'change' }],
    endTime: [{ required: true, message: '归来时间不能为空', trigger: 'change' }],
    address: [{ required: true, message: '出差地点不能为空', trigger: 'blur' }],
    reason: [{ required: true, message: '出差事由不能为空', trigger: 'blur' }],
    airplaneReason: [
        {
            validator: (rule: any, value: any, callback: any) => {
                if (formData.value.trafficType === 4 && !value) {
                    callback(new Error('选择飞机时，乘坐飞机原因不能为空'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
})
const formRef = ref() // 表单 Ref
const fileUploadRef = ref() // 文件上传组件 Ref
const userSelectRef = ref() // 人员选择组件 Ref
const manualInputFormRef = ref() // 手动输入表单 Ref
const personList = ref<TravelApi.TravelPersonListVO[]>([]) // 出差人员列表
const printPreviewVisible = ref(false) // 打印预览弹窗显示状态
const previewData = ref({}) // 预览数据
const manualInputVisible = ref(false) // 手动输入弹窗显示状态
const manualInputForm = ref({
    nickname: ''
})
const manualInputRules = reactive({
    nickname: [{ required: true, message: '姓名不能为空', trigger: 'blur' }]
})

// 审批相关：变量
const processDefineKey = 'oa_form_travel' // 流程定义 Key
const startUserSelectTasks = ref<any[]>([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref<Record<string, number[]>>({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref<Record<string, number[]>>({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 审批节点信息
const processDefinitionId = ref('')

/** 获取部门名称 */
const getDeptName = async () => {
    const currentUser = userStore.getUser
    if (currentUser.deptId) {
        try {
            const dept = await DeptApi.getDept(currentUser.deptId)
            deptName.value = dept.name || ''
            formData.value.deptId = currentUser.deptId
        } catch (error) {
            console.error('获取部门信息失败', error)
            deptName.value = ''
        }
    }
}

/** 打开人员选择弹窗 */
const openUserSelect = () => {
    userSelectRef.value?.open('travel-person', personList.value.filter(p => p.userId))
}

/** 处理人员选择确认 */
const handleUserSelect = (id: string, userList: any[]) => {
    // 移除已选择的内部人员，保留外部人员
    personList.value = personList.value.filter(p => !p.userId)
    
    // 添加新选择的内部人员
    userList.forEach(user => {
        personList.value.push({
            nickname: user.nickname,
            userId: user.id
        })
    })
    
    updatePersonList()
}

/** 显示手动输入弹窗 */
const showManualInput = () => {
    manualInputForm.value.nickname = ''
    manualInputVisible.value = true
}

/** 确认手动输入 */
const confirmManualInput = async () => {
    if (!manualInputFormRef.value) return
    const valid = await manualInputFormRef.value.validate()
    if (!valid) return
    
    // 检查是否已存在同名人员
    const exists = personList.value.some(p => p.nickname === manualInputForm.value.nickname)
    if (exists) {
        message.warning('该人员已存在')
        return
    }
    
    // 添加外部人员
    personList.value.push({
        nickname: manualInputForm.value.nickname,
        userId: undefined
    })
    
    updatePersonList()
    manualInputVisible.value = false
}

/** 删除人员 */
const removePerson = (index: number) => {
    personList.value.splice(index, 1)
    updatePersonList()
}

/** 更新人员列表 */
const updatePersonList = () => {
    formData.value.personList = personList.value
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
        const data = { ...formData.value } as unknown as TravelApi.TravelVO

        // 设置用户ID和部门ID
        const currentUser = userStore.getUser
        data.userId = currentUser.id
        data.deptId = formData.value.deptId || currentUser.deptId

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
        await TravelApi.createTravelApi(data)
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
            activityId: NodeId.START_USER_NODE_ID,
            processVariablesStr: JSON.stringify({ 
                trafficType: formData.value.trafficType,
                address: formData.value.address 
            })
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
    // 获取部门信息
    await getDeptName()
    
    const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
        undefined,
        processDefineKey
    )

    if (!processDefinitionDetail) {
        message.error('OA 出差申请的流程模型未配置，请检查！')
        return
    }
    processDefinitionId.value = processDefinitionDetail.id
    startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

    // 审批相关：加载最新的审批详情，主要用于节点预测
    await getApprovalDetail()
})

/** 审批相关：预测流程节点会因为输入的参数值而产生新的预测结果值，所以需重新预测一次 */
watch(
    () => [formData.value.trafficType, formData.value.address],
    () => {
        // 记录之前的节点审批人
        tempStartUserSelectAssignees.value = startUserSelectAssignees.value
        startUserSelectAssignees.value = {}
        // 加载最新的审批详情,主要用于节点预测
        getApprovalDetail()
    }
)

/** 监听人员列表变化 */
watch(
    personList,
    () => {
        updatePersonList()
    },
    { deep: true }
)

// 计算属性：是否可以预览
const canPreview = computed(() => {
    return formData.value.reason && formData.value.address && personList.value.length > 0
})

/** 显示打印预览 */
const showPrintPreview = () => {
    // 准备预览数据
    previewData.value = {
        creator: userStore.getUser?.nickname || '当前用户',
        createTime: new Date(),
        trafficType: formData.value.trafficType,
        airplaneReason: formData.value.airplaneReason,
        startTime: formData.value.startTime,
        endTime: formData.value.endTime,
        address: formData.value.address,
        reason: formData.value.reason,
        remark: formData.value.remark,
        personList: personList.value,
        deptName: deptName.value
    }
    printPreviewVisible.value = true
}
</script>