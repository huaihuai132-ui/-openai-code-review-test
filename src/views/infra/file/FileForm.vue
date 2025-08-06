<template>
  <Dialog v-model="dialogVisible" title="上传文件" :close-on-click-modal="false">
    <el-upload ref="uploadRef" v-model:file-list="fileList" :action="uploadUrl" :auto-upload="false" :data="data"
      :disabled="formLoading" :limit="1" :on-change="handleFileChange" :on-error="submitFormError"
      :on-exceed="handleExceed" :on-success="submitFormSuccess" :on-progress="handleUploadProgress"
      :http-request="httpRequest" drag>
      <!-- accept=".jpg, .png, .gif, .xls, .xlsx, .doc, .docx, .ppt, .pptx, .pdf, .zip, .rar, .7z, .txt, .md, .mp4 , .mp3 , .avi , .m4a" -->
      <div v-if="!uploadProgress.show">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text"> 将文件拖到此处，或 <em>点击上传</em></div>
      </div>
      <template #tip>
        <!-- <div class="el-upload__tip" style="color: red">
          提示：仅允许导入 jpg、png、gif 格式文件！
        </div> -->
      </template>
    </el-upload>

    <!-- 上传进度显示 -->
    <div v-if="uploadProgress.show" class="upload-progress">
      <div class="progress-info">
        <span class="progress-text">{{ getProgressText() }}</span>
        <span class="progress-percentage">{{ uploadProgress.percentage }}%</span>
      </div>
      <el-progress :percentage="uploadProgress.percentage" :status="uploadProgress.status" :stroke-width="8"
        :show-text="false" />
      <div class="progress-details" v-if="uploadProgress.loaded && uploadProgress.total">
        <span>{{ formatFileSize(uploadProgress.loaded) }} / {{ formatFileSize(uploadProgress.total) }}</span>
        <span class="upload-speed" v-if="uploadProgress.speed">{{ formatSpeed(uploadProgress.speed) }}/s</span>
      </div>

      <!-- 估算剩余时间 -->
      <div v-if="uploadProgress.estimatedTime && uploadProgress.status === 'info'" class="estimated-time">
        预计剩余时间：{{ formatTime(uploadProgress.estimatedTime) }}
      </div>

      <!-- 取消上传按钮 -->
      <div v-if="uploadProgress.status === 'info'" class="progress-actions">
        <el-button size="small" @click="cancelUpload">取消上传</el-button>
      </div>
    </div>

    <template #footer>
      <el-button :disabled="formLoading || uploadProgress.show" type="primary" @click="submitFileForm">
        {{ uploadProgress.show ? '上传中...' : '确 定' }}
      </el-button>
      <el-button @click="dialogVisible = false" :disabled="uploadProgress.show && uploadProgress.status === 'info'">取
        消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { useUpload } from '@/components/UploadFile/src/useUpload'

defineOptions({ name: 'InfraFileForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const fileList = ref([]) // 文件列表
const data = ref({ path: '' })
const uploadRef = ref()
let cancelTokenSource = null // 用于取消上传请求

// 上传进度相关
const uploadProgress = ref({
  show: false,
  percentage: 0,
  status: 'info' as 'success' | 'exception' | 'warning' | 'info',
  loaded: 0,
  total: 0,
  speed: 0,
  startTime: 0,
  estimatedTime: 0
})

const { uploadUrl, httpRequest: originalHttpRequest } = useUpload()

// 增强的httpRequest，添加进度回调
const httpRequest = async (options) => {
  // 导入axios用于取消功能
  const axios = (await import('axios')).default

  // 创建取消令牌
  cancelTokenSource = axios.CancelToken.source()

  // 重置进度状态
  uploadProgress.value = {
    show: true,
    percentage: 0,
    status: 'info',
    loaded: 0,
    total: 0,
    speed: 0,
    startTime: Date.now(),
    estimatedTime: 0
  }

  // 添加进度回调到options
  const enhancedOptions = {
    ...options,
    cancelToken: cancelTokenSource.token,
    onProgress: (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        const currentTime = Date.now()
        const timeElapsed = (currentTime - uploadProgress.value.startTime) / 1000 // 秒
        const speed = timeElapsed > 0 ? progressEvent.loaded / timeElapsed : 0

        // 计算预估剩余时间
        const remainingBytes = progressEvent.total - progressEvent.loaded
        const estimatedTime = speed > 0 ? remainingBytes / speed : 0

        uploadProgress.value = {
          ...uploadProgress.value,
          percentage,
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          speed,
          estimatedTime,
          status: percentage === 100 ? 'success' : 'info'
        }

        // 调用Element Plus的进度回调
        if (options.onProgress) {
          options.onProgress(progressEvent)
        }
      }
    }
  }

  try {
    const result = await originalHttpRequest(enhancedOptions)
    uploadProgress.value.status = 'success'
    uploadProgress.value.percentage = 100
    uploadProgress.value.estimatedTime = 0
    return result
  } catch (error) {
    if (axios.isCancel(error)) {
      uploadProgress.value.status = 'warning'
      message.warning('上传已取消')
    } else {
      uploadProgress.value.status = 'exception'
      throw error
    }
  }
}

/** 获取进度文本 */
const getProgressText = () => {
  switch (uploadProgress.value.status) {
    case 'success':
      return '上传完成'
    case 'exception':
      return '上传失败'
    case 'warning':
      return '上传已取消'
    default:
      return '正在上传'
  }
}

/** 取消上传 */
const cancelUpload = () => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('用户取消上传')
    formLoading.value = false
    setTimeout(() => {
      uploadProgress.value.show = false
    }, 1000)
  }
}

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
  resetForm()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 处理上传的文件发生变化 */
const handleFileChange = (file) => {
  data.value.path = file.name
  // 重置进度状态
  uploadProgress.value.show = false
}

/** 处理上传进度 */
const handleUploadProgress = (event, file) => {
  // Element Plus的进度回调，这里可以做额外处理
  console.log('Upload progress:', event)
}

/** 提交表单 */
const submitFileForm = () => {
  if (fileList.value.length == 0) {
    message.error('请上传文件')
    return
  }
  formLoading.value = true
  unref(uploadRef)?.submit()
}

/** 文件上传成功处理 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitFormSuccess = () => {
  // 延迟一下关闭，让用户看到上传完成状态
  setTimeout(() => {
    // 清理
    dialogVisible.value = false
    formLoading.value = false
    uploadProgress.value.show = false
    unref(uploadRef)?.clearFiles()
    // 提示成功，并刷新
    message.success(t('common.createSuccess'))
    emit('success')
  }, 1000)
}

/** 上传错误提示 */
const submitFormError = (): void => {
  message.error('上传失败，请您重新上传！')
  formLoading.value = false
  uploadProgress.value.status = 'exception'
}

/** 重置表单 */
const resetForm = () => {
  // 重置上传状态和文件
  formLoading.value = false
  uploadProgress.value.show = false
  uploadRef.value?.clearFiles()
  if (cancelTokenSource) {
    cancelTokenSource = null
  }
}

/** 文件数超出提示 */
const handleExceed = (): void => {
  message.error('最多只能上传一个文件！')
}

/** 格式化文件大小 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/** 格式化上传速度 */
const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond)
}

/** 格式化时间 */
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}分${remainingSeconds}秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
}
</script>

<style scoped lang="scss">
.upload-progress {
  margin: 20px 0;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .progress-text {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }

    .progress-percentage {
      font-size: 14px;
      color: #409eff;
      font-weight: bold;
    }
  }

  .progress-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;

    .upload-speed {
      color: #67c23a;
      font-weight: 500;
    }
  }

  .estimated-time {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    text-align: center;
  }

  .progress-actions {
    margin-top: 12px;
    text-align: center;
  }
}

// 隐藏上传区域图标和文字在上传时
:deep(.el-upload-dragger) {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}
</style>
