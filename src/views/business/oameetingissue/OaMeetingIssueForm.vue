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
          ref="batchUploadRef"
          v-model:fileList="batchFileList"
          :mode="formType === 'create' ? 'create' : 'edit'"
          :max-files="5" :concurrent="2" :drag="true" directory="test-batch" />
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
import { OaMeetingIssueApi, OaMeetingIssueVO, FileAttachmentVO } from '@/api/business/oameetingissue/index.ts'
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
  fileList: [] as number[],  // Long类型数组
  sequenceCode: undefined,
})

// 创建中间对象，用于传递给BatchFileUpload组件
const batchFileList = ref<number[]>([])
const formRules = reactive({
  // userId: [{ required: true, message: '议题发起人ID不能为空', trigger: 'blur' }],
  // issueNo: [{ required: true, message: '议题编号不能为空', trigger: 'blur' }],
  issueTitle: [{ required: true, message: '议题标题不能为空', trigger: 'blur' }],
  issueType: [{ required: true, message: '议题类型不能为空', trigger: 'change' }],
  meetingType: [{ required: true, message: '上会类型不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

// 上传组件引用
const batchUploadRef = ref<typeof BatchFileUpload | null>(null)

// 监听文件 URL 变化，转换为 FileAttachmentVO 对象
// watch(uploadFileUrls, (newUrls: string[]) => {
//   formData.value.issueAttachment = newUrls.map(url => {
//     // 从 URL 中提取文件名
//     const fileName = url.substring(url.lastIndexOf('/') + 1)
//     const originalFileName = fileName.split('_').slice(1).join('_') || fileName // 去掉时间戳前缀
//
//     return {
//       name: originalFileName,
//       path: fileName,
//       url: url,
//       businessCode: 'MEETING_ISSUE'
//     } as FileAttachmentVO
//   })
//   console.log('转换后的附件对象:', formData.value.issueAttachment)
// }, { deep: true })
//
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogTitle.value = t('action.' + type)
  formType.value = type
  console.log('open called', type, id)
  console.log(formType.value)
  resetForm()
  
  // 延迟显示弹窗，确保数据已完全加载和处理
  dialogVisible.value = false
  
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const response = await OaMeetingIssueApi.getOaMeetingIssue(id)
      
      // 创建新数据对象
      const newData = { ...response }
      
      // 确保fileList是正确的number[]类型
      // 处理可能的字符串格式："[1,3,2]" -> [1,3,2]
      let validFileList: number[] = []
      if (newData.fileList) {
        if (typeof newData.fileList === 'string') {
          try {
            // 尝试解析字符串形式的数组
            const parsedArray = JSON.parse(newData.fileList)
            if (Array.isArray(parsedArray)) {
              // 确保数组中的每个元素都是数字
              validFileList = parsedArray.filter(item => typeof item === 'number' && !isNaN(item))
            }
          } catch (error) {
            console.warn('解析fileList字符串失败:', error)
            validFileList = []
          }
        } else if (Array.isArray(newData.fileList)) {
          // 确保数组中的每个元素都是数字
          validFileList = newData.fileList.filter(item => typeof item === 'number' && !isNaN(item))
        }
      }
      
      newData.fileList = validFileList
      
      // 避免直接替换整个formData，特别是fileList数组，以防止触发重复请求
      // 逐个更新字段，保留fileList数组引用
      const currentFileList = formData.value.fileList;
      
      // 移除fileList属性，以便后续手动处理
      const { fileList: _, ...restData } = newData;
      
      // 更新其他属性
      Object.assign(formData.value, restData);
      
      // 等待Vue的响应式系统处理完数据更新
      await nextTick()
      
      // 只在fileList内容确实有变化时才更新数组内容（不替换数组引用）
      if (JSON.stringify(currentFileList) !== JSON.stringify(validFileList)) {
        // 清空并填充数组，保持原数组引用
        formData.value.fileList.splice(0, formData.value.fileList.length, ...validFileList);
        
        // 同步更新中间对象
        batchFileList.value.splice(0, batchFileList.value.length, ...validFileList);
      }
      
      // 确保BatchFileUpload组件已经接收到正确的fileList值
      await nextTick()
    } finally {
      formLoading.value = false
    }
  }
  
  // 等待所有数据处理完成后再显示弹窗
  setTimeout(() => {
    dialogVisible.value = true
  }, 100)
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 监听中间对象变化，同步到formData中 
// watch(batchFileList, (newFileList) => {
//   // 只在内容发生变化时更新，避免不必要的响应式更新 
//   if (JSON.stringify(formData.value.fileList) !== JSON.stringify(newFileList)) {
//     formData.value.fileList.splice(0, formData.value.fileList.length, ...newFileList);
//   }
// }, { deep: true })

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
    
    // 创建一个新的数据对象，将fileList转换为字符串格式
    const submitData = {
      ...data,
      fileList: batchFileList.value && batchFileList.value.length > 0 
        ? `[${batchFileList.value.join(',')}]` 
        : '[]'
    }
    
    if (formType.value === 'create') {
      await OaMeetingIssueApi.createOaMeetingIssue(submitData)
      message.success('发起成功')
      console.log('发起成功后执行关闭操作')
    } else {
      await OaMeetingIssueApi.updateOaMeetingIssue(submitData)
      message.success(t('common.updateSuccess'))
    }
    
    // 标记文件为已保存，避免组件重新请求文件列表
    if (batchUploadRef.value) {
      batchUploadRef.value.markFilesAsSaved?.()
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
    fileList: [] as number[],  // 重置为Long类型数组
    sequenceCode: undefined,
  }
  
  // 清空中间对象
  batchFileList.value = []

  // 清理未保存的文件
  if (batchUploadRef.value) {
    await batchUploadRef.value.clearUnsavedFiles?.()
    batchUploadRef.value.resetComponent?.()
  }

  // 重置表单数据
  formRef.value?.resetFields()
}


</script>
