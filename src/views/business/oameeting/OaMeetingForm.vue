<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
<!--      <el-form-item label="会议发起人ID" prop="userId">-->
<!--        <el-input v-model="formData.userId" placeholder="请输入会议发起人ID" />-->

      <el-form-item label="会议名称" prop="meetName">
        <el-input v-model="formData.meetName" placeholder="请输入会议名称" />
      </el-form-item>
      <el-form-item label="会议类型" prop="meetType">
        <el-select v-model="formData.meetType" placeholder="请选择会议类型">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.MEET_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="会议日期" prop="meetDate">
        <el-date-picker
          v-model="formData.meetDate"
          type="date"
          value-format="x"
          placeholder="选择会议日期"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="date"
          value-format="x"
          placeholder="选择开始时间"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="date"
          value-format="x"
          placeholder="选择结束时间"
        />
      </el-form-item>
      <el-form-item label="会议室" prop="meetRoomId">
        <el-select v-model="formData.meetRoomId" placeholder="请选择会议室" style="width: 100%;">
          <el-option
            v-for="room in meetingRooms"
            :key="room.id"
            :label="room.roomName + ' - ' + room.location"
            :value="room.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="会议事由" prop="reason">
        <el-input v-model="formData.reason" placeholder="请输入会议事由" />
      </el-form-item>
      <el-form-item label="会议概述" prop="description">
        <el-input 
          v-model="formData.description" 
          type="textarea" 
          :rows="3"
          placeholder="请输入会议概述"
          style="width: 500px;"
        />
      </el-form-item>
      <el-form-item label="会议状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.MEET_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="会议附件" prop="fileList">
          <BatchFileUpload
            ref="batchUploadRef"
            v-model:fileList="formData.fileList"
            mode="create"
            file-type="common"
            directory="meeting"
            :max-files="5"
            tip="支持批量上传多个文件，最多5个"
          />
      </el-form-item>

<!--      <el-form-item label="文件id列表" prop="fileList">-->
<!--        <el-input v-model="formData.fileList" placeholder="请输入文件id列表" />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="文件序列编码" prop="sequenceCode">-->
<!--        <el-input v-model="formData.sequenceCode" placeholder="请输入文件序列编码" />-->
<!--      </el-form-item>-->
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="submitForApproval" type="warning" :disabled="formLoading">送 审</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { OaMeetingApi, OaMeetingVO } from '@/api/business/oameeting'
import { OaMeetingRoomApi } from 'src/api/business/oameetingroom'
import { BatchFileUpload } from '@/components/UploadFile'

/** 会议 表单 */
defineOptions({ name: 'OaMeetingForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  meetName: undefined,
  meetType: undefined,
  meetDate: undefined,
  startTime: undefined,
  endTime: undefined,
  meetRoomId: undefined,
  reason: undefined,
  description: undefined,
  status: undefined,
  fileList: [] as number[],  // Long类型数组
  sequenceCode: undefined,
})

// 会议室列表数据
const meetingRooms = ref<any[]>([])

/** 获取会议室列表 */
const getMeetingRooms = async () => {
  try {
    const data = await OaMeetingRoomApi.getOaMeetingRoomPage({
      pageNo: 1,
      pageSize: 100, // 获取足够多的会议室数据
      meetingRoomStatus: 1 // 只获取启用状态的会议室
    })
    meetingRooms.value = data.list
  } catch (error) {
    console.error('获取会议室列表失败:', error)
    message.error('获取会议室列表失败')
  }
}
const formRules = reactive({
    // userId: [{ required: true, message: '会议发起人ID不能为空', trigger: 'blur' }],
    meetName: [{ required: true, message: '会议名称不能为空', trigger: 'blur' }],
    meetType: [{ required: true, message: '会议类型不能为空', trigger: 'change' }],
    meetRoomId: [{ required: true, message: '请选择会议室', trigger: 'change' }],
    fileList: [{ required: false, message: '请上传会议附件', trigger: 'change' }], // 可选，但如果上传则必须有效
  })
const formRef = ref() // 表单 Ref

// 上传组件引用
const batchUploadRef = ref<typeof BatchFileUpload | null>(null)

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  
  // 加载会议室列表
  await getMeetingRooms()
  
  await resetForm() // 确保异步重置完成
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await OaMeetingApi.getOaMeeting(id)
      // 确保fileList是数组类型
      if (!Array.isArray(formData.value.fileList)) {
        formData.value.fileList = [] as number[]
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
  
  // 验证文件上传（如果有上传文件）
  const hasFiles = formData.value.fileList && formData.value.fileList.length > 0
  if (hasFiles && batchUploadRef.value) {
    const fileValidation = batchUploadRef.value.validateFiles?.()
    if (fileValidation && !fileValidation.valid) {
      message.error(fileValidation.message)
      return
    }
  }
  
  // 提交请求
  formLoading.value = true
  try {
    const data = { ...formData.value } as unknown as OaMeetingVO
    // 将fileList数组转换为字符串格式
    if (data.fileList && Array.isArray(data.fileList) && data.fileList.length > 0) {
      data.fileList = JSON.stringify(data.fileList) as any
    } else {
      data.fileList = '[]' as any
    }
    
    if (formType.value === 'create') {
      await OaMeetingApi.createOaMeeting(data)
      message.success(t('common.createSuccess'))
    } else {
      await OaMeetingApi.updateOaMeeting(data)
      message.success(t('common.updateSuccess'))
    }
    
    // 标记文件为已保存
    if (hasFiles && batchUploadRef.value) {
      batchUploadRef.value.markFilesAsSaved?.()
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
    meetName: undefined,
    meetType: undefined,
    meetDate: undefined,
    startTime: undefined,
    endTime: undefined,
    meetRoomId: undefined,
    reason: undefined,
    description: undefined,
    status: undefined,
    fileList: [] as number[],  // 重置为Long类型数组
    sequenceCode: undefined,
  }

  // 清理未保存的文件
  if (batchUploadRef.value) {
    await batchUploadRef.value.clearUnsavedFiles?.()
    batchUploadRef.value.resetComponent?.()
  }

  formRef.value?.resetFields()
}

/** 送审表单 */
const submitForApproval = async () => {
  try {
    // 确认送审
    await ElMessageBox.confirm(
      '确定要送审该会议吗？送审后将进入审批流程。',
      '确认送审',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 校验表单
    await formRef.value.validate()
    
    // 提交请求（这里假设API有送审方法）
      formLoading.value = true
      try {
        const data = {
          ...formData.value,
          needApproval: true // 标记为需要审批
        } as unknown as OaMeetingVO
        
        // 将fileList数组转换为字符串格式
        if (data.fileList && Array.isArray(data.fileList) && data.fileList.length > 0) {
          data.fileList = JSON.stringify(data.fileList) as any
        } else {
          data.fileList = '[]' as any
        }
        
        if (formType.value === 'create') {
          await OaMeetingApi.createOaMeeting(data)
        } else {
          await OaMeetingApi.updateOaMeeting(data)
        }
      
      // 如果有送审专用API，可以调用该API
      // await OaMeetingApi.submitForApproval(formData.value.id)
      
      message.success('送审成功！')
      dialogVisible.value = false
      emit('success')
    } finally {
      formLoading.value = false
    }
  } catch (error) {
    // 用户取消操作不会显示错误
    if (error !== 'cancel') {
      console.error('送审失败:', error)
      message.error('送审失败，请重试')
    }
  }
}

import { ElMessageBox } from 'element-plus'
</script>
