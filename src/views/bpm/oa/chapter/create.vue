<template>
    <el-row :gutter="20">
        <el-col :span="16">
            <ContentWrap title="申请信息">
                <!-- 申请人信息显示 -->
                <el-alert :title="`申请人：${userStore.getUser.nickname || '未知'} | 部门：${deptName || '未知'}`" type="info"
                    :closable="false" style="margin-bottom: 20px;" />

                <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
                    <!-- 用章部门字段已隐藏，由后端自动获取当前用户的部门信息 -->
                    <el-form-item label="用章事由" prop="reason">
                        <el-input v-model="formData.reason" placeholder="请输入用章事由" type="textarea" />
                    </el-form-item>
                    <el-form-item label="资金" prop="fund">
                        <el-input-number v-model="formData.fund" :precision="2" :step="100" :min="0"
                            controls-position="right" />
                    </el-form-item>
                    <!-- 用章日期字段已隐藏，由后端自动设置为当前日期 -->
                    <el-form-item label="用章文件" prop="chapterFileNames">
                        <div v-for="(_, index) in fileNames" :key="index" class="mb-10px">
                            <div class="file-input-container">
                                <el-input v-model="fileNames[index]" placeholder="请输入用章文件">
                                    <template #append>
                                        <el-button @click="removeFileName(index)" type="danger" :icon="Delete" />
                                    </template>
                                </el-input>

                                <el-button v-if="index === fileNames.length - 1" @click="addFileName"
                                    class="add-file-btn" type="primary" circle>
                                    <el-icon>
                                        <Plus />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item label="用章企业" prop="sealEnterprise">
                        <el-select 
                            v-model="formData.sealEnterprise" 
                            placeholder="请选择或输入用章企业" 
                            filterable 
                            allow-create 
                            clearable
                            :loading="enterpriseLoading"
                            @change="handleEnterpriseChange"
                            @visible-change="handleEnterpriseDropdownVisible"
                        >
                            <el-option 
                                v-for="option in enterpriseOptions" 
                                :key="option.value" 
                                :label="option.label" 
                                :value="option.value" 
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="印章类型" prop="chapterName">
                        <el-select v-model="formData.chapterName" placeholder="请选择印章类型" clearable>
                            <el-option v-for="dict in getIntDictOptions('bpm_oa_chapter_type')" :key="dict.value"
                                :label="dict.label" :value="dict.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="是否外带" prop="isTakeOut">
                        <el-radio-group v-model="formData.isTakeOut">
                            <el-radio value="0">不外带</el-radio>
                            <el-radio value="1">外带</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="附件" prop="fileList">
                        <BatchFileUpload ref="fileUploadRef" v-model:fileList="formData.fileList" mode="create"
                            :max-files="10" directory="chapter" :file-size="10" tip="支持上传多个文件，每个文件不超过10MB" />
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
import * as ChapterApi from '@/api/bpm/form/chapter'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { Delete, Plus } from '@element-plus/icons-vue'
import { BatchFileUpload } from '@/components/UploadFile'
import { useUserStore } from '@/store/modules/user'
import * as DeptApi from '@/api/system/dept'
import * as DictDataApi from '@/api/system/dict/dict.data'

// 审批相关：import
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'

defineOptions({ name: 'BpmOAChapterCreate' })

const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由

// 定义 emit 事件
const emit = defineEmits(['success'])

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
    fund: 0,
    reason: '',
    useDate: new Date(), // 默认当前日期
    chapterFileName: '',
    chapterName: '',
    sealEnterprise: '', // 用章企业
    isTakeOut: '0',
    fileList: [] as number[], // 文件ID列表
    sequenceCode: '' // 文件序列编码（可选）
})
const formRules = reactive({
    reason: [{ required: true, message: '用章事由不能为空', trigger: 'change' }],
    chapterName: [{ required: true, message: '印章类型不能为空', trigger: 'change' }],
    sealEnterprise: [{ required: true, message: '用章企业不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const fileUploadRef = ref() // 文件上传组件 Ref
const fileNames = ref<string[]>(['']) // 用章文件名称列表
const userStore = useUserStore() // 用户Store
const deptName = ref('') // 部门名称
const enterpriseOptions = ref([]) // 企业选项列表
const enterpriseLoading = ref(false) // 企业选项加载状态

// 审批相关：变量
const processDefineKey = 'oa_form_chapter' // 流程定义 Key
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
        } catch (error) {
            console.error('获取部门信息失败', error)
            deptName.value = ''
        }
    }
}

/** 添加用章文件名称 */
const addFileName = () => {
    fileNames.value.push('')
    updateChapterFileName()
}

/** 删除用章文件名称 */
const removeFileName = (index: number) => {
    fileNames.value.splice(index, 1)
    if (fileNames.value.length === 0) {
        fileNames.value.push('')
    }
    updateChapterFileName()
}

/** 更新用章文件名称 */
const updateChapterFileName = () => {
    // 过滤空值并转为JSON字符串
    const validFileNames = fileNames.value.filter(name => name.trim() !== '')
    formData.value.chapterFileName = JSON.stringify(validFileNames)
}

/** 加载企业选项列表 */
const loadEnterpriseOptions = async () => {
    try {
        enterpriseLoading.value = true
        // 直接调用API获取完整的字典数据列表
        const response = await DictDataApi.getDictDataPage({
            dictType: 'seal_enterprise',
            pageNo: 1,
            pageSize: 100, // 符合后端最大限制
            status: 0 // 只获取启用状态的数据
        })
        
        const dictList = response.list || []
        // 转换为选项格式
        enterpriseOptions.value = dictList.map(item => ({
            label: item.label,
            value: item.value
        }))
    } catch (error) {
        console.error('加载企业选项失败:', error)
        message.error('加载企业选项失败')
    } finally {
        enterpriseLoading.value = false
    }
}

/** 处理企业下拉框显示/隐藏 */
const handleEnterpriseDropdownVisible = (visible: boolean) => {
    if (visible) {
        loadEnterpriseOptions()
    }
}

/** 处理企业选择变更 */
const handleEnterpriseChange = (value: string) => {
    // 只更新表单数据，不立即创建企业
    // 企业创建将在流程创建成功后进行
}

/** 创建新的企业字典项 */
const createNewEnterprise = async (enterpriseName: string) => {
    try {
        // 先查询现有的用章企业字典数据
        const response = await DictDataApi.getDictDataPage({
            dictType: 'seal_enterprise',
            pageNo: 1,
            pageSize: 100 // 符合后端最大限制
        })
        
        const existingData = response.list || []
        
        // 计算自增的value值
        let maxValue = 0
        if (existingData.length > 0) {
            // 获取现有数据中value的最大值
            const values = existingData
                .map(item => parseInt(item.value) || 0)
                .filter(val => !isNaN(val))
            maxValue = values.length > 0 ? Math.max(...values) : 0
        }
        
        const newValue = (maxValue + 1).toString()
        
        // 获取当前最大排序号
        const maxSort = existingData.length > 0 
            ? Math.max(...existingData.map(item => item.sort || 0)) 
            : 0
        
        const dictData = {
            label: enterpriseName,
            value: newValue, // 使用自增的value值
            dictType: 'seal_enterprise',
            sort: maxSort + 1,
            status: 0, // 启用状态
            colorType: 'default',
            cssClass: '',
            remark: '用印申请自动创建'
        }
        
        await DictDataApi.createDictData(dictData)
        console.log(`企业"${enterpriseName}"已自动添加到字典，value值为: ${newValue}`)
        
        // 重新加载企业选项
        await loadEnterpriseOptions()
    } catch (error) {
        console.error('创建企业字典项失败:', error)
        // 不显示错误提示，避免影响用户体验
    }
}

/** 流程创建成功后处理新企业 */
const handleNewEnterpriseAfterSubmit = async () => {
    const selectedEnterprise = formData.value.sealEnterprise
    if (!selectedEnterprise) return
    
    // 检查是否为新创建的企业（不在现有选项中）
    const existingOption = enterpriseOptions.value.find(option => option.value === selectedEnterprise)
    if (!existingOption) {
        // 创建新的企业字典项
        await createNewEnterprise(selectedEnterprise)
    }
}



/** 提交表单 */
const submitForm = async () => {
    // 更新用章文件名称
    updateChapterFileName()

    // 1.1 校验表单
    if (!formRef) return
    const valid = await formRef.value.validate()
    if (!valid) return

    // 2. 提交请求
    formLoading.value = true
    try {
        const data = { ...formData.value } as unknown as ChapterApi.ChapterVO

        // 添加用户信息
        const currentUser = userStore.getUser
        data.userId = currentUser.id
        data.deptId = currentUser.deptId
        data.deptName = deptName.value

        // 转换日期格式 - 确保传递正确的日期格式
        if (formData.value.useDate) {
            data.useDate = formData.value.useDate
        }

        // 处理文件列表 - 确保始终转换为字符串格式，避免后端JSON反序列化错误
        data.fileList = formData.value.fileList && formData.value.fileList.length > 0 
            ? formData.value.fileList.join(',') 
            : ''

        // 审批相关：设置指定审批人
        if (startUserSelectTasks.value?.length > 0) {
            data.startUserSelectAssignees = startUserSelectAssignees.value
        }
        await ChapterApi.createChapter(data)
        
        // 流程创建成功后，检查是否需要创建新的企业
        await handleNewEnterpriseAfterSubmit()
        
        message.success('发起成功')
        // 发送成功事件
        emit('success')
        // 关闭当前 Tab
        delView(unref(currentRoute))
    } finally {
        formLoading.value = false
    }
}

// 部门相关方法已移除，由后端自动处理

/** 审批相关：获取审批详情 */
const getApprovalDetail = async () => {
    try {
        const data = await ProcessInstanceApi.getApprovalDetail({
            processDefinitionId: processDefinitionId.value,
            activityId: NodeId.START_USER_NODE_ID,
            processVariablesStr: JSON.stringify({ fund: formData.value.fund, isTakeOut: formData.value.isTakeOut })
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
    // 获取部门名称
    await getDeptName()
    
    // 加载企业选项
    await loadEnterpriseOptions()

    const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
        undefined,
        processDefineKey
    )

    if (!processDefinitionDetail) {
        message.error('OA 用章申请的流程模型未配置，请检查！')
        return
    }
    processDefinitionId.value = processDefinitionDetail.id
    startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

    // 审批相关：加载最新的审批详情，主要用于节点预测
    await getApprovalDetail()
})

/** 审批相关：预测流程节点会因为输入的参数值而产生新的预测结果值，所以需重新预测一次 */
watch(
    [() => formData.value.fund, () => formData.value.isTakeOut],
    () => {
        // 记录之前的节点审批人
        tempStartUserSelectAssignees.value = startUserSelectAssignees.value
        startUserSelectAssignees.value = {}
        // 加载最新的审批详情,主要用于节点预测
        getApprovalDetail()
    },
    { deep: true }
)

/** 监听用章文件名称变化 */
watch(
    fileNames,
    () => {
        updateChapterFileName()
    },
    { deep: true }
)
</script>
<style scoped>
.mb-10px {
    margin-bottom: 10px;
}

.mt-10px {
    margin-top: 10px;
}

.mt-5px {
    margin-top: 5px;
}

.ml-10px {
    margin-left: 10px;
}

.flex {
    display: flex;
}

.items-center {
    align-items: center;
}

.file-input-container {
    display: flex;
    align-items: center;
}

.add-file-btn {
    margin-left: 10px;
    padding: 7px;
    font-size: 12px;
    color: #fff;
    background-color: #409EFF;
    border-color: #409EFF;
}
</style>
