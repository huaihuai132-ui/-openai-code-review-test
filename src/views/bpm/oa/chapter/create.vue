<template>
    <el-row :gutter="20">
        <el-col :span="16">
            <ContentWrap title="申请信息">
                <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
                    <el-form-item label="用章部门" prop="deptId">
                        <el-tree-select v-model="formData.deptId" :data="deptOptions"
                            :props="{ label: 'name', value: 'id', children: 'children' }" placeholder="请选择用章部门"
                            clearable @change="handleDeptChange" node-key="id" filterable :filter-method="filterDept"
                            class="w-full" />
                    </el-form-item>
                    <el-form-item label="资金" prop="fund">
                        <el-input-number v-model="formData.fund" :precision="2" :step="100" :min="0"
                            controls-position="right" />
                    </el-form-item>
                    <el-form-item label="用章事由" prop="reason">
                        <el-input v-model="formData.reason" placeholder="请输入用章事由" type="textarea" />
                    </el-form-item>
                    <el-form-item label="用章日期" prop="useDate">
                        <el-date-picker v-model="formData.useDate" clearable placeholder="请选择用章日期" type="date"
                            value-format="x" />
                    </el-form-item>
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
                    <el-form-item label="印章类型" prop="chapterName">
                        <el-select v-model="formData.chapterName" placeholder="请选择印章类型" clearable>
                            <el-option v-for="dict in getIntDictOptions('bpm_oa_chapter_type')" :key="dict.value"
                                :label="dict.label" :value="dict.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="是否外带" prop="isTakeOut">
                        <el-radio-group v-model="formData.isTakeOut">
                            <el-radio label="0">不外带</el-radio>
                            <el-radio label="1">外带</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="附件" prop="storagePath">
                        <el-upload action="#" :auto-upload="false" :on-change="handleFileChange" multiple
                            :file-list="fileList" :limit="5">
                            <el-button type="primary">选择文件</el-button>
                            <template #tip>
                                <div class="el-upload__tip">支持上传多个文件，每个文件不超过10MB</div>
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
import * as ChapterApi from '@/api/bpm/form/chapter'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { getIntDictOptions } from '@/utils/dict'
import * as DeptApi from '@/api/system/dept'
import { Delete, Plus } from '@element-plus/icons-vue'

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

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
    deptId: undefined,
    deptName: '',
    fund: 0,
    reason: '',
    useDate: new Date().getTime(), // 默认今天
    chapterFileName: '',
    chapterName: '',
    isTakeOut: '0',
    storagePath: ''
})
const formRules = reactive({
    deptId: [{ required: true, message: '用章部门不能为空', trigger: 'change' }],
    reason: [{ required: true, message: '用章事由不能为空', trigger: 'change' }],
    useDate: [{ required: true, message: '用章日期不能为空', trigger: 'change' }],
    chapterName: [{ required: true, message: '印章类型不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const fileList = ref<any[]>([]) // 文件列表
const deptOptions = ref<DeptApi.DeptVO[]>([]) // 部门选项
const fileNames = ref<string[]>(['']) // 用章文件名称列表

// 审批相关：变量
const processDefineKey = 'oa_form_chapter' // 流程定义 Key
const startUserSelectTasks = ref<any[]>([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref<Record<string, number[]>>({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref<Record<string, number[]>>({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 审批节点信息
const processDefinitionId = ref('')

/** 处理部门选择变更 */
const handleDeptChange = (deptId: number) => {
    if (!deptId) {
        formData.value.deptName = ''
        return
    }
    // 查找部门名称
    const findDeptName = (deptList: any[]): string => {
        for (const dept of deptList) {
            if (dept.id === deptId) {
                return dept.name
            }
            if (dept.children && dept.children.length > 0) {
                const name = findDeptName(dept.children)
                if (name) return name
            }
        }
        return ''
    }
    formData.value.deptName = findDeptName(deptOptions.value)
}

/** 部门筛选方法 */
const filterDept = (value: string, data: any) => {
    if (!value) return true
    return data.name.includes(value)
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

/** 处理文件上传 */
const handleFileChange = (_file: any, uploadFileList: any[]) => {
    // 保存文件列表
    fileList.value = [...uploadFileList]
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
        
        // 转换日期格式
        if (data.useDate) {
            // 将时间戳转换为YYYY-MM-DD格式
            const date = new Date(data.useDate)
            data.useDate = date
        }
        
        // 处理文件上传
        if (fileList.value.length > 0) {
            // 这里应该调用文件上传API，获取文件路径
            // 示例：将文件信息转换为JSON格式存储
            const fileInfos = fileList.value.map((file: any) => ({
                name: file.name,
                path: `/personal/${file.name}`, // 示例路径
                size: file.size,
                type: file.type
            }))
            data.storagePath = JSON.stringify(fileInfos)
        }

        // 审批相关：设置指定审批人
        if (startUserSelectTasks.value?.length > 0) {
            data.startUserSelectAssignees = startUserSelectAssignees.value
        }
        await ChapterApi.createChapter(data)
        message.success('发起成功')
        // 关闭当前 Tab
        delView(unref(currentRoute))
    } finally {
        formLoading.value = false
    }
}

/** 获取部门列表 */
const getDeptList = async () => {
    try {
        const result = await DeptApi.getSimpleDeptList()
        if (result && result.length > 0) {
            // 构建部门树形结构
            deptOptions.value = buildDeptTree(result)
        } else {
            deptOptions.value = []
        }
    } catch (error) {
        console.error('获取部门列表失败', error)
    }
}

/** 构建部门树形结构 */
const buildDeptTree = (deptList: DeptApi.DeptVO[]) => {
    // 创建一个映射表，用于快速查找部门
    const deptMap = new Map()
    deptList.forEach(dept => {
        deptMap.set(dept.id, { ...dept, children: [] })
    })

    // 构建树形结构
    const rootDepts: DeptApi.DeptVO[] = []
    deptList.forEach(dept => {
        const parentId = dept.parentId
        if (parentId === 0) {
            // 根部门
            rootDepts.push(deptMap.get(dept.id))
        } else {
            // 子部门
            const parentDept = deptMap.get(parentId)
            if (parentDept) {
                parentDept.children.push(deptMap.get(dept.id))
            } else {
                // 如果找不到父部门，则作为根部门
                rootDepts.push(deptMap.get(dept.id))
            }
        }
    })

    return rootDepts
}

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
    // 获取部门列表
    await getDeptList()

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
