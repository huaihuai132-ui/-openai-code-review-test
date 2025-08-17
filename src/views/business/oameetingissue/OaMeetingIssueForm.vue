<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
<!--      <el-form-item label="议题发起人ID" prop="userId">-->
<!--        <el-input v-model="formData.userId" placeholder="请输入议题发起人ID" />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="议题编号" prop="issueNo">-->
<!--        <el-input v-model="formData.issueNo" placeholder="请输入议题编号" />-->
<!--      </el-form-item>-->
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
      <el-form-item label="议题附件" prop="issueAttachment">
        <UploadFile
          v-model="uploadFileUrls"
          :limit="10"
          :file-type="['jpg', 'png', 'pdf', 'doc', 'docx']"
          :file-size="10"
          :drag="true"
          directory="uploads"
        />
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
import { OaMeetingIssueApi, OaMeetingIssueVO, FileAttachmentVO } from 'src/api/business/oameetingissue/index.ts'
import { UploadFile } from '@/components/UploadFile'


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
  issueAttachment: [] as FileAttachmentVO[],
})
const formRules = reactive({
  // userId: [{ required: true, message: '议题发起人ID不能为空', trigger: 'blur' }],
  // issueNo: [{ required: true, message: '议题编号不能为空', trigger: 'blur' }],
  issueTitle: [{ required: true, message: '议题标题不能为空', trigger: 'blur' }],
  issueType: [{ required: true, message: '议题类型不能为空', trigger: 'change' }],
  meetingType: [{ required: true, message: '上会类型不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

// 上传文件 URL 数组，用于与 UploadFile 组件绑定
const uploadFileUrls = ref<string[]>([])

// 监听文件 URL 变化，转换为 FileAttachmentVO 对象
watch(uploadFileUrls, (newUrls: string[]) => {
  formData.value.issueAttachment = newUrls.map(url => {
    // 从 URL 中提取文件名
    const fileName = url.substring(url.lastIndexOf('/') + 1)
    const originalFileName = fileName.split('_').slice(1).join('_') || fileName // 去掉时间戳前缀
    
    return {
      name: originalFileName,
      path: fileName,
      url: url,
      businessCode: 'MEETING_ISSUE'
    } as FileAttachmentVO
  })
  console.log('转换后的附件对象:', formData.value.issueAttachment)
}, { deep: true })

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await OaMeetingIssueApi.getOaMeetingIssue(id)
      // 将 FileAttachmentVO[] 转换为 string[] 用于 UploadFile 组件显示
      if (formData.value.issueAttachment && formData.value.issueAttachment.length > 0) {
        uploadFileUrls.value = formData.value.issueAttachment.map(attachment => attachment.url)
      }
    } finally {
      formLoading.value = false
    }
  }
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
    const data = formData.value as unknown as OaMeetingIssueVO
    // 确保 issueAttachment 参数被正确包含
    console.log('提交的表单数据:', data)
    console.log('附件地址列表:', data.issueAttachment)
    
    if (formType.value === 'create') {
      await OaMeetingIssueApi.createOaMeetingIssue(data)
      message.success('发起成功')
      console.log('发起成功后执行关闭操作')
    } else {
      await OaMeetingIssueApi.updateOaMeetingIssue(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    console.log('弹窗已关闭')
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    userId: undefined,
    issueNo: undefined,
    issueTitle: undefined,
    issueType: undefined,
    meetingType: undefined,
    issueContent: undefined,
    description: undefined,
    issueAttachment: [] as FileAttachmentVO[],
  }
  uploadFileUrls.value = [] // 重置上传文件 URL 数组
  formRef.value?.resetFields()
}


</script>
