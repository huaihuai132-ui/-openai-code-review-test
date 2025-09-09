<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
<!--      <el-form-item label="议题发起人ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入议题发起人ID" />
      </el-form-item>
-->      
      <el-form-item label="议题标题" prop="issueTitle">
        <el-input v-model="formData.issueTitle" placeholder="请输入议题标题" />
      </el-form-item>
      <el-form-item label="上会类型" prop="meetingType">
        <el-select v-model="formData.meetingType" placeholder="请选择上会类型" @change="handleMeetingTypeChange">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MEET_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
      <el-form-item label="关联会议" prop="meetingId">
        <el-select 
          v-model="formData.meetingId" 
          :placeholder="meetingPlaceholder"
          clearable
          filterable
          remote
          :remote-method="searchMeetings"
          :loading="meetingLoading"
          :disabled="isMeetingSelectDisabled"
        >
          <el-option
            v-for="meeting in filteredMeetingList"
            :key="meeting.id"
            :label="meeting.meetName"
            :value="meeting.id"
          />
        </el-select>
      </el-form-item>


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
          <!-- <BatchFileUpload
            ref="batchUploadRef"
            v-model:fileList="batchFileList"
            :mode="formType === 'create' ? 'create' : 'edit'
            file-type="common"
            directory="documents"
            :max-files="5"
            tip="支持批量上传多个文件，最多5个"
          /> -->
          <BatchFileUpload 
          ref="fileUploadRef"
          v-model:fileList="formData.fileList"
          :mode="formType === 'create' ? 'create' : 'edit'"
          directory="business"
          :max-files="5" :concurrent="2" :drag="true" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {DICT_TYPE, getIntDictOptions} from '@/utils/dict'
import {OaMeetingIssueApi} from '@/api/business/oameetingissue'
import {BatchFileUpload} from '@/components/UploadFile'
import {nextTick} from 'vue'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import {handleTree} from '@/utils/tree'
import {OaMeetingApi} from '@/api/business/oameeting'

/** 会议议题 表单 */  
defineOptions({ name: 'OaMeetingIssueForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗 

const dialogVisible = ref(false) // 弹窗的是否展示 
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const userLoading = ref(false) // 用户列表加载状态
const meetingLoading = ref(false) // 会议列表加载状态

// 用户列表
const userList = ref<any[]>([])
const filteredUserList = ref<any[]>([])

// 会议列表
const meetingList = ref<any[]>([])
const filteredMeetingList = ref<any[]>([])

// 部门相关
const deptList = ref<Tree[]>([]) // 树形结构

const formData = ref({
  id: undefined,
  userId: undefined,
  issueNo: undefined,
  issueTitle: undefined,
  issueType: undefined,
  meetingType: undefined,
  reporterId: undefined,
  meetingId: undefined, // 添加关联会议ID字段
  relevantDept: [] as number[], // 使用number数组类型
  issueContent: undefined,
  description: undefined,
  // issueAttachment: [] as FileAttachmentVO[],
  fileList: [] as (number | string)[], // 修改为支持数字或字符串ID的数组
  sequenceCode: undefined,
})

// 计算属性：判断会议选择器是否禁用
const isMeetingSelectDisabled = computed(() => {
  return !formData.value.meetingType
})

// 计算属性：会议选择器的占位符文本
const meetingPlaceholder = computed(() => {
  if (!formData.value.meetingType) {
    return '请先选择上会类型'
  }
  if (filteredMeetingList.value.length === 0) {
    return '当前无会议安排'
  }
  return '请选择关联会议'
})

const formRules = reactive({
  // userId: [{ required: true, message: '议题发起人ID不能为空', trigger: 'blur' }],
  // issueNo: [{ required: true, message: '议题编号不能为空', trigger: 'blur' }],
  issueTitle: [{ required: true, message: '议题标题不能为空', trigger: 'blur' }],
  meetingId: [{ required: false, message: '关联会议选择有误', trigger: 'change' }],
  issueType: [{ required: true, message: '议题类型不能为空', trigger: 'change' }],
  meetingType: [{ required: true, message: '上会类型不能为空', trigger: 'change' }],
  reporterId: [{ required: true, message: '汇报人不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

// 上传组件引用
const fileUploadRef = ref()

/** 处理上会类型变更 */
const handleMeetingTypeChange = () => {
  // 清空已选择的会议
  formData.value.meetingId = undefined
  // 重新获取会议列表
  getMeetingList()
}

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

/** 搜索会议 */
const searchMeetings = (query: string) => {
  if (query) {
    filteredMeetingList.value = meetingList.value.filter(meeting => 
      meeting.meetName && meeting.meetName.toLowerCase().includes(query.toLowerCase())
    )
  } else {
    filteredMeetingList.value = [...meetingList.value]
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
  const data = await DeptApi.getSimpleDeptList()
  deptList.value = handleTree(data)
}

/** 获取会议列表 */
const getMeetingList = async () => {
  // 如果没有选择上会类型，则不加载会议列表
  if (!formData.value.meetingType) {
    meetingList.value = []
    filteredMeetingList.value = []
    return
  }

  try {
    meetingLoading.value = true
    // 获取会议列表，使用和页面中一样的参数，但设置较大的pageSize
    const params = { 
      pageSize: 100,
      pageNo: 1,
      status: 2, // 只获取状态为"待开始"的会议
      meetType: formData.value.meetingType // 根据上会类型筛选会议
    }
    const data = await OaMeetingApi.getOaMeetingPage(params)
    meetingList.value = data.list
    filteredMeetingList.value = [...data.list]
  } catch (error) {
    console.error('获取会议列表失败:', error)
    message.error('获取会议列表失败')
  } finally {
    meetingLoading.value = false
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  
  // 获取用户列表和部门列表
  await Promise.all([getUserList(), getDeptList()])
  
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const response = await OaMeetingIssueApi.getOaMeetingIssue(id)
      
      // 处理 fileList 数据，根据API定义是字符串类型
      let processedFileList: (number | string)[] = []
      if (response.fileList) {
        // 如果fileList是字符串，则按逗号分割并过滤空值
        if (typeof response.fileList === 'string') {
          // 先去除可能存在的方括号
          const cleanFileList = response.fileList.replace(/^\[|\]$/g, '');
          processedFileList = cleanFileList.split(',').map(id => id.trim()).filter(id => id !== '')
        } else {
          processedFileList = [response.fileList]
        }
      }
      
      // 处理部门数据，确保是数组格式
      let processedRelevantDept: number[] = []
      if (response.relevantDept) {
        if (typeof response.relevantDept === 'string') {
          // 如果是逗号分隔的字符串，按逗号分割并转换为数字
          processedRelevantDept = response.relevantDept.split(',')
            .map(id => id.trim())
            .filter(id => id !== '')
            .map(id => Number(id))
            .filter(id => !isNaN(id))
        } else if (Array.isArray(response.relevantDept)) {
          // 如果已经是数组，确保每个元素是数字
          processedRelevantDept = response.relevantDept.map(item => {
            if (typeof item === 'string') {
              const num = Number(item)
              return isNaN(num) ? 0 : num
            }
            return Number(item)
          }).filter(id => !isNaN(id))
        } else {
          // 如果是其他类型（如单个数字），转换为数字数组
          const num = Number(response.relevantDept)
          processedRelevantDept = isNaN(num) ? [] : [num]
        }
      }
      
      formData.value = {
        ...response,
        fileList: processedFileList,
        relevantDept: processedRelevantDept
      }
      
      // 等待Vue的响应式系统处理完数据更新
      await nextTick()
      
      // 如果有上会类型，则加载对应的会议列表
      if (formData.value.meetingType) {
        await getMeetingList()
      }
    } finally {
      formLoading.value = false
    }
  }
  
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    // 创建一个新的数据对象，将fileList转换为字符串格式
    const submitData = {
      ...formData.value,
      fileList: Array.isArray(formData.value.fileList) && formData.value.fileList.length > 0
        ? formData.value.fileList.join(',')  // 直接使用字符串避免精度丢失
        : '',
      // 将部门数组转换为逗号分隔的字符串
      relevantDept: Array.isArray(formData.value.relevantDept) && formData.value.relevantDept.length > 0
        ? formData.value.relevantDept.join(',')
        : ''
    }
    
    if (formType.value === 'create') {
      await OaMeetingIssueApi.createOaMeetingIssue(submitData)
      message.success('发起成功')
    } else {
      await OaMeetingIssueApi.updateOaMeetingIssue(submitData)
      message.success(t('common.updateSuccess'))
    }

    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false 
  }
}

/** 重置表单 */
const resetForm = async () => {
  formData.value = {
    id: undefined,
    userId: undefined,
    issueNo: undefined,
    issueTitle: undefined,
    issueType: undefined,
    meetingType: undefined,
    reporterId: undefined,
    relevantDept: [],  // 重置为数组格式
    issueContent: undefined,
    description: undefined,
    fileList: [],  // 重置为正确类型
    sequenceCode: undefined,
    meetingId: undefined, // 重置会议ID
  }
  // 重置表单数据
  formRef.value?.resetFields()
  // 重置用户筛选列表
  filteredUserList.value = [...userList.value]
  // 重置会议列表
  meetingList.value = []
  filteredMeetingList.value = []
}
</script>