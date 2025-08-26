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
      <el-form-item label="议题附件" prop="fileList">
          <!-- <BatchFileUpload
            ref="batchUploadRef"
            v-model:fileList="batchFileList"
            :mode="formType === 'create' ? 'create' : 'edit'"
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
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { OaMeetingIssueApi, OaMeetingIssueVO } from '@/api/business/oameetingissue'
import { BatchFileUpload } from '@/components/UploadFile'
import { nextTick } from 'vue'


/** 会议议题 表单 */  
defineOptions({ name: 'OaMeetingIssueForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗 

const dialogVisible = ref(false) // 弹窗的是否展示 
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  issueNo: undefined,
  issueTitle: undefined,
  issueType: undefined,
  meetingType: undefined,
  issueContent: undefined,
  description: undefined,
  // issueAttachment: [] as FileAttachmentVO[],
  fileList: [] as (number | string)[], // 修改为支持数字或字符串ID的数组
  sequenceCode: undefined,
})

const formRules = reactive({
  // userId: [{ required: true, message: '议题发起人ID不能为空', trigger: 'blur' }],
  // issueNo: [{ required: true, message: '议题编号不能为空', trigger: 'blur' }],
  issueTitle: [{ required: true, message: '议题标题不能为空', trigger: 'blur' }],
  issueType: [{ required: true, message: '议题类型不能为空', trigger: 'change' }],
  meetingType: [{ required: true, message: '上会类型不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

// 上传组件引用
const fileUploadRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  
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
      
      formData.value = {
        ...response,
        fileList: processedFileList
      }
      
      // 等待Vue的响应式系统处理完数据更新
      await nextTick()
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
    issueContent: undefined,
    description: undefined,
    fileList: [],  // 重置为正确类型
    sequenceCode: undefined,
  }
  // 重置表单数据
  formRef.value?.resetFields()
}
</script>