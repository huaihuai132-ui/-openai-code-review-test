<template>
    <el-row :gutter="20">
        <el-col :span="16">
            <ContentWrap title="申请信息">
                <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
                    <el-form-item label="采购事由" prop="reason">
                        <el-input v-model="formData.reason" placeholder="请输入采购事由" type="textarea" />
                    </el-form-item>
                    <el-form-item label="物品清单" prop="itemList">
                        <div class="mb-10px">
                            <el-button type="primary" @click="addItem">添加物品</el-button>
                        </div>
                        <el-table :data="items" border style="width: 100%">
                            <el-table-column label="类别">
                                <template #default="{ row }">
                                    <el-input v-model="row.type" placeholder="请输入类别" />
                                </template>
                            </el-table-column>
                            <el-table-column label="名称">
                                <template #default="{ row }">
                                    <el-input v-model="row.itemName" placeholder="请输入名称" />
                                </template>
                            </el-table-column>
                            <el-table-column label="型号">
                                <template #default="{ row }">
                                    <el-input v-model="row.specification" placeholder="请输入型号" />
                                </template>
                            </el-table-column>
                            <el-table-column label="数量">
                                <template #default="{ row }">
                                    <el-input-number v-model="row.number" :min="1" :precision="0" />
                                </template>
                            </el-table-column>
                            <el-table-column label="用途">
                                <template #default="{ row }">
                                    <el-input v-model="row.usage" placeholder="请输入用途" />
                                </template>
                            </el-table-column>
                            <el-table-column label="预计金额">
                                <template #default="{ row }">
                                    <el-input-number v-model="row.estimatedAmount" :min="0" :precision="2" />
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="100">
                                <template #default="{ $index }">
                                    <el-button type="danger" link @click="removeItem($index)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-form-item>
                    <el-form-item label="总价" prop="totalPrice">
                        <el-input-number v-model="formData.totalPrice" :precision="2" :step="100" :min="0"
                            controls-position="right" />
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
    <PrintPreview v-model="printPreviewVisible" :purchase-data="previewData" />
</template>
<script lang="ts" setup>
import * as PurchaseApi from '@/api/bpm/form/purchase'
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

defineOptions({ name: 'BpmOAPurchaseCreate' })

const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由
const userStore = useUserStore() // 用户信息

// 定义 emit 事件
const emit = defineEmits(['success'])

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
    reason: '',
    purchaseDate: new Date().toISOString().split('T')[0], // 默认当前日期
    itemList: [] as PurchaseApi.ItemListVO[],
    totalPrice: 0,
    fileList: [] as string[],
    sequenceCode: ''
})
const formRules = reactive({
    reason: [{ required: true, message: '采购事由不能为空', trigger: 'change' }],
    totalPrice: [{ required: true, message: '总价不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const fileUploadRef = ref() // 文件上传组件 Ref
const items = ref<PurchaseApi.ItemListVO[]>([]) // 物品清单
const printPreviewVisible = ref(false) // 打印预览弹窗显示状态
const previewData = ref({}) // 预览数据

// 审批相关：变量
const processDefineKey = 'oa_form_purchase' // 流程定义 Key
const startUserSelectTasks = ref<any[]>([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref<Record<string, number[]>>({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref<Record<string, number[]>>({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 审批节点信息
const processDefinitionId = ref('')

/** 添加物品 */
const addItem = () => {
    items.value.push({
        type: '',
        itemName: '',
        specification: '',
        number: 1,
        usage: '',
        estimatedAmount: 0
    })
    updateItemList()
}

/** 删除物品 */
const removeItem = (index: number) => {
    items.value.splice(index, 1)
    updateItemList()
}

/** 更新物品清单和总价 */
const updateItemList = () => {
    formData.value.itemList = items.value
    // 计算总价
    formData.value.totalPrice = items.value.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0)
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
        const data = { ...formData.value } as unknown as PurchaseApi.PurchaseVO

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
        await PurchaseApi.createPurchase(data)
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
            processVariablesStr: JSON.stringify({ totalPrice: formData.value.totalPrice })
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
        message.error('OA 采购申请的流程模型未配置，请检查！')
        return
    }
    processDefinitionId.value = processDefinitionDetail.id
    startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

    // 审批相关：加载最新的审批详情，主要用于节点预测
    await getApprovalDetail()
})

/** 审批相关：预测流程节点会因为输入的参数值而产生新的预测结果值，所以需重新预测一次 */
watch(
    () => formData.value.totalPrice,
    () => {
        // 记录之前的节点审批人
        tempStartUserSelectAssignees.value = startUserSelectAssignees.value
        startUserSelectAssignees.value = {}
        // 加载最新的审批详情,主要用于节点预测
        getApprovalDetail()
    }
)

/** 监听物品清单变化 */
watch(
    items,
    () => {
        updateItemList()
    },
    { deep: true }
)

// 计算属性：是否可以预览
const canPreview = computed(() => {
    return formData.value.reason && items.value.length > 0
})

/** 显示打印预览 */
const showPrintPreview = () => {
    // 准备预览数据
    previewData.value = {
        creator: userStore.getUser?.nickname || '当前用户',
        createTime: new Date(),
        purchaseDate: formData.value.purchaseDate,
        reason: formData.value.reason,
        itemList: items.value,
        totalPrice: formData.value.totalPrice
    }
    printPreviewVisible.value = true
}
</script>
