<template>
    <el-row :gutter="20">
        <el-col :span="16">
            <ContentWrap title="申请信息">
                <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
                    <el-form-item label="采购事由" prop="reason">
                        <el-input v-model="formData.reason" placeholder="请输入采购事由" type="textarea" />
                    </el-form-item>
                    <el-form-item label="采购日期" prop="purchaseDate">
                        <el-date-picker v-model="formData.purchaseDate" clearable placeholder="请选择采购日期" type="date"
                            value-format="x" />
                    </el-form-item>
                    <el-form-item label="物品清单" prop="itemList">
                        <div class="mb-10px">
                            <el-button type="primary" @click="addItem">添加物品</el-button>
                        </div>
                        <el-table :data="items" border style="width: 100%">
                            <el-table-column label="类别">
                                <template #default="{ row }">
                                    <el-input v-model="row.category" placeholder="请输入类别" />
                                </template>
                            </el-table-column>
                            <el-table-column label="名称">
                                <template #default="{ row }">
                                    <el-input v-model="row.name" placeholder="请输入名称" />
                                </template>
                            </el-table-column>
                            <el-table-column label="型号">
                                <template #default="{ row }">
                                    <el-input v-model="row.model" placeholder="请输入型号" />
                                </template>
                            </el-table-column>
                            <el-table-column label="数量">
                                <template #default="{ row }">
                                    <el-input-number v-model="row.quantity" :min="1" :precision="0" />
                                </template>
                            </el-table-column>
                            <el-table-column label="用途">
                                <template #default="{ row }">
                                    <el-input v-model="row.purpose" placeholder="请输入用途" />
                                </template>
                            </el-table-column>
                            <el-table-column label="预计金额">
                                <template #default="{ row }">
                                    <el-input-number v-model="row.estimatedPrice" :min="0" :precision="2" />
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
                    <el-form-item label="附件" prop="storagePath">
                        <el-upload action="#" :auto-upload="false" :on-change="handleFileChange" :limit="1"
                            :file-list="fileList">
                            <el-button type="primary">选择文件</el-button>
                            <template #tip>
                                <div class="el-upload__tip">支持上传PDF、Word、Excel等文件</div>
                            </template>
                        </el-upload>
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
import * as PurchaseApi from '@/api/bpm/form/purchase'
import { useTagsViewStore } from '@/store/modules/tagsView'

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

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
    reason: '',
    purchaseDate: undefined,
    itemList: '',
    totalPrice: 0,
    storagePath: ''
})
const formRules = reactive({
    reason: [{ required: true, message: '采购事由不能为空', trigger: 'change' }],
    purchaseDate: [{ required: true, message: '采购日期不能为空', trigger: 'change' }],
    totalPrice: [{ required: true, message: '总价不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const fileList = ref([]) // 文件列表
const items = ref<any[]>([]) // 物品清单

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
        category: '',
        name: '',
        model: '',
        quantity: 1,
        purpose: '',
        estimatedPrice: 0
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
    formData.value.itemList = JSON.stringify(items.value)
    // 计算总价
    formData.value.totalPrice = items.value.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)
}

/** 处理文件上传 */
const handleFileChange = (file: any) => {
    // 这里只是简单示例，实际项目中可能需要调用上传API
    fileList.value = [file]
    // 模拟上传后的路径
    formData.value.storagePath = file.name
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
        // 审批相关：设置指定审批人
        if (startUserSelectTasks.value?.length > 0) {
            data.startUserSelectAssignees = startUserSelectAssignees.value
        }
        await PurchaseApi.createPurchase(data)
        message.success('发起成功')
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
</script>
