<template>
  <div class="static-file-upload">
    <!-- 上传区域 -->
    <el-upload ref="uploadRef" v-model:file-list="fileList" :action="uploadUrl" :auto-upload="autoUpload"
      :before-upload="beforeUpload" :disabled="disabled || uploading" :drag="drag" :http-request="httpRequest"
      :limit="1" :multiple="false" :on-error="handleUploadError" :on-exceed="handleExceed" :on-remove="handleRemove"
      :on-success="handleUploadSuccess" :on-change="handleFileChange"
      :show-file-list="showFileList && !customFileDisplay" :accept="accept" :class="{ 'is-uploading': uploading }"
      list-type="picture-card" name="file">
      <!-- 拖拽上传区域 -->
      <div v-if="drag" class="upload-dragger-content">
        <div v-if="!uploading" class="upload-content">
          <el-icon class="upload-icon">
            <Plus />
          </el-icon>
          <div class="upload-text">
            将文件拖到此处，或<em>点击选择文件</em>
          </div>
          <div class="upload-hint">上传到 static 桶（匿名访问）</div>
        </div>
        <div v-else class="uploading-content">
          <el-icon class="upload-icon uploading">
            <Plus />
          </el-icon>
          <div class="upload-text">上传中...</div>
        </div>
      </div>
      <!-- 按钮上传区域 -->
      <div v-else class="upload-button-content">
        <el-icon class="upload-icon">
          <Plus />
        </el-icon>
        <div v-if="showUploadText" class="upload-text">
          {{ uploading ? '上传中...' : '选择文件' }}
        </div>
      </div>

      <!-- 提示信息 -->
      <template v-if="isShowTip" #tip>
        <div class="upload-tip">
          <!-- 注释掉文件大小和类型限制提示 -->
          <!-- <div v-if="fileSize" style="font-size: 12px">
            大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
          </div>
          <div v-if="fileType.length" style="font-size: 12px">
            格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b> 的文件
          </div> -->
          <div v-if="tip" style="font-size: 12px">{{ tip }}</div>
        </div>
      </template>

      <!-- 自定义文件显示 -->
      <template v-if="customFileDisplay" #file="{ file }">
        <div class="file-item">
          <div class="file-icon">
            <el-icon :size="32">
              <component :is="getFileIcon(file.name)" />
            </el-icon>
          </div>
          <div class="file-name" :title="file.name">{{ file.name }}</div>
          <div class="file-actions">
            <el-link :href="file.url" :underline="false" download target="_blank" type="primary" size="small">
              下载
            </el-link>
            <el-button v-if="!disabled" link type="danger" size="small" @click="handleRemove(file)">
              删除
            </el-button>
          </div>
        </div>
      </template>
    </el-upload>

    <!-- 文件名输入框 -->
    <div v-if="showCustomFileName && fileList.length > 0 && !uploading" class="file-name-input">
      <el-input v-model="customFileName" placeholder="请输入文件名（可选，默认使用原文件名）" :disabled="uploading" clearable>
        <template #prepend>文件名</template>
      </el-input>
    </div>

    <!-- 上传进度 -->
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

    <!-- 上传按钮 -->
    <div v-if="showUploadButton && fileList.length > 0 && !uploading && !autoUpload" class="upload-actions">
      <el-button type="primary" @click="startUpload" :disabled="uploading">
        <el-icon>
          <Upload />
        </el-icon>
        开始上传
      </el-button>
      <el-button @click="clearFiles">清空文件</el-button>
    </div>

    <!-- 禁用状态下的文件显示 -->
    <div v-if="disabled && fileList.length > 0" class="disabled-file-list">
      <div v-for="(file, index) in fileList" :key="index" class="file-item disabled">
        <div class="file-icon">
          <el-icon :size="32">
            <component :is="getFileIcon(file.name)" />
          </el-icon>
        </div>
        <div class="file-info">
          <div class="file-name" :title="file.name">{{ file.name }}</div>
          <div class="file-actions">
            <el-link :href="file.url" :underline="false" download target="_blank" type="primary" size="small">
              下载
            </el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import { propTypes } from '@/utils/propTypes'
import type { UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from 'element-plus'
import { isString } from '@/utils/is'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import {
  Document,
  Grid,
  Files,
  DocumentCopy,
  Plus,
  UploadFilled,
  Upload,
  Document as PdfDocument
} from '@element-plus/icons-vue'

defineOptions({ name: 'StaticFileUpload' })

const message = useMessage() // 消息弹窗

// 组件事件
const emit = defineEmits([
  'update:modelValue',
  'upload-success',
  'upload-error',
  'upload-progress',
  'file-change'
])

// 组件属性
const props = defineProps({
  modelValue: propTypes.oneOfType<string | string[]>([String, Array<String>]).def(''),
  fileType: propTypes.array.def([]), // 文件类型
  fileSize: propTypes.number.def(5), // 大小限制(MB)
  autoUpload: propTypes.bool.def(true), // 自动上传
  drag: propTypes.bool.def(false), // 拖拽上传
  isShowTip: propTypes.bool.def(true), // 是否显示提示
  disabled: propTypes.bool.def(false), // 是否禁用上传组件
  directory: propTypes.string.def(undefined), // 上传目录（静态文件不使用）
  // 新增属性
  showFileList: propTypes.bool.def(true), // 是否显示文件列表
  showUploadButton: propTypes.bool.def(true), // 是否显示上传按钮
  showUploadText: propTypes.bool.def(true), // 是否显示上传文字
  showCustomFileName: propTypes.bool.def(false), // 是否显示自定义文件名输入框
  customFileDisplay: propTypes.bool.def(false), // 是否使用自定义文件显示
  accept: propTypes.string.def('.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md'), // 接受的文件类型
  tip: propTypes.string.def('') // 提示文字
})

// ========== 响应式数据 ==========
const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadUserFile[]>([])
const customFileName = ref('')
const uploading = ref(false)
let cancelTokenSource: any = null

// 上传进度
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

// 使用静态文件上传，传递特殊标识
const { uploadUrl, httpRequest: originalHttpRequest } = useUpload(props.directory, true)

// 增强的httpRequest
const httpRequest = async (options) => {
  const axios = (await import('axios')).default

  cancelTokenSource = axios.CancelToken.source()

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

  const enhancedOptions = {
    ...options,
    cancelToken: cancelTokenSource.token,
    onProgress: (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        const currentTime = Date.now()
        const timeElapsed = (currentTime - uploadProgress.value.startTime) / 1000
        const speed = timeElapsed > 0 ? progressEvent.loaded / timeElapsed : 0

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

        emit('upload-progress', {
          percentage,
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          speed
        })
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

// 根据文件扩展名获取对应的图标组件
const getFileIcon = (fileName: string) => {
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    case 'doc':
    case 'docx':
      return Document
    case 'xls':
    case 'xlsx':
      return Grid
    case 'ppt':
    case 'pptx':
      return Files
    case 'txt':
      return DocumentCopy
    case 'pdf':
      return PdfDocument
    default:
      return Document
  }
}

// 文件上传之前判断
const beforeUpload: UploadProps['beforeUpload'] = (file: UploadRawFile) => {
  // 单个文件上传，如果已有文件则先清空（替换模式）
  if (fileList.value.length > 0) {
    fileList.value = []
    customFileName.value = ''
  }

  let fileExtension = ''
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
  }

  // 检查文件类型
  if (props.fileType.length > 0) {
    const isValidType = props.fileType.some((type: string) => {
      if (file.type.indexOf(type) > -1) return true
      return !!(fileExtension && fileExtension.indexOf(type) > -1)
    })
    if (!isValidType) {
      message.error(`文件格式不正确, 请上传${props.fileType.join('/')}格式!`)
      return false
    }
  }

  // 检查文件大小
  const isLimit = file.size < props.fileSize * 1024 * 1024
  if (!isLimit) {
    message.error(`上传文件大小不能超过${props.fileSize}MB!`)
    return false
  }

  message.success('正在上传静态文件，请稍候...')
  return true
}

// 文件改变处理
const handleFileChange = (file, fileListParam) => {
  // 如果没有自定义文件名，使用原文件名（去掉扩展名）
  if (!customFileName.value && file.name) {
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
    customFileName.value = nameWithoutExt
  }

  emit('file-change', file, fileListParam)

  // 自动上传
  if (props.autoUpload && fileListParam.length > 0) {
    startUpload()
  }
}

// 开始上传
const startUpload = () => {
  if (fileList.value.length === 0) {
    message.warning('请先选择文件')
    return
  }

  uploading.value = true
  uploadRef.value?.submit()
}

// 上传成功处理
const handleUploadSuccess: UploadProps['onSuccess'] = (response, file) => {
  uploading.value = false

  // 延迟一下让用户看到上传完成状态
  setTimeout(() => {
    uploadProgress.value.show = false

    // 构造返回数据：{ 文件名: URL }
    const fileName = customFileName.value || file.name
    const result = {
      [fileName]: response.data
    }

    emit('upload-success', result, file)
    message.success('静态文件上传成功')

    // 更新modelValue
    emitUpdateModelValue(response.data)
  }, 1000)
}

// 上传错误处理
const handleUploadError: UploadProps['onError'] = (error, file) => {
  uploading.value = false
  uploadProgress.value.status = 'exception'
  emit('upload-error', error, file)
  message.error('静态文件上传失败')
}

// 文件数量超出限制
const handleExceed: UploadProps['onExceed'] = (): void => {
  message.error('只能上传一个文件!')
}

// 删除上传文件
const handleRemove = (file) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    customFileName.value = ''
    emitUpdateModelValue()
  }
}

// 取消上传
const cancelUpload = () => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('用户取消上传')
    uploading.value = false
    setTimeout(() => {
      uploadProgress.value.show = false
    }, 1000)
  }
}

// 清空文件
const clearFiles = () => {
  fileList.value = []
  customFileName.value = ''
  uploadProgress.value.show = false
  uploading.value = false
  uploadRef.value?.clearFiles()
  if (cancelTokenSource) {
    cancelTokenSource = null
  }
  emitUpdateModelValue()
}

// 获取进度文本
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

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化上传速度
const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond)
}

// 格式化时间
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

// 监听模型绑定值变动
watch(
  () => props.modelValue,
  (val: string | string[]) => {
    if (!val) {
      fileList.value = [] // fix：处理掉缓存，表单重置后上传组件的内容并没有重置
      return
    }

    fileList.value = [] // 保障数据为空
    // 情况1：字符串
    if (isString(val)) {
      fileList.value.push(
        ...val.split(',').map((url) => ({ name: url.substring(url.lastIndexOf('/') + 1), url }))
      )
      return
    }
    // 情况2：数组
    fileList.value.push(
      ...(val as string[]).map((url) => ({ name: url.substring(url.lastIndexOf('/') + 1), url }))
    )
  },
  { immediate: true, deep: true }
)

// 发送文件链接列表更新
const emitUpdateModelValue = (url?: string) => {
  if (url) {
    // 直接设置URL
    emit('update:modelValue', url)
  } else {
    // 从文件列表获取URL
    const result = fileList.value.length > 0 ? fileList.value[0].url || '' : ''
    emit('update:modelValue', result)
  }
}

// 暴露方法给父组件
defineExpose({
  startUpload,
  clearFiles,
  cancelUpload
})
</script>

<style scoped lang="scss">
.static-file-upload {
  .file-name-input {
    margin-top: 12px;
  }

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

  .upload-actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }

  .upload-tip {
    margin-top: 8px;
    text-align: center;
  }

  .upload-text {
    margin-top: 8px;
    font-size: 14px;
    color: #606266;
  }

  .upload-hint {
    font-size: 12px;
    color: #67c23a;
    margin-top: 4px;
  }

  &.is-uploading {
    :deep(.el-upload) {
      cursor: not-allowed;
    }
  }
}

// 上传区域样式改进
:deep(.el-upload--picture-card) {
  width: 100% !important;
  height: 120px !important;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409eff;
    background-color: #f0f9ff;
  }
}

:deep(.el-upload-dragger) {
  border: none !important;
  background: transparent !important;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 拖拽区域内容样式
.upload-dragger-content,
.upload-button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;

  .upload-content,
  .uploading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .upload-icon {
    font-size: 32px;
    color: #8c939d;
    margin-bottom: 12px;
    transition: color 0.3s ease;

    &.uploading {
      color: #409eff;
      animation: rotate 1s linear infinite;
    }
  }

  .upload-text {
    color: #606266;
    font-size: 14px;
    text-align: center;
    line-height: 1.4;
    margin-bottom: 4px;

    em {
      color: #409eff;
      font-style: normal;
      font-weight: 500;
    }
  }

  .upload-hint {
    font-size: 12px;
    color: #67c23a;
    text-align: center;
    font-weight: 500;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 文件项样式
.file-item {
  display: grid;
  grid-template-rows: 48px 1fr auto;
  justify-items: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  }

  &.disabled {
    background: #f5f7fa;
    border-color: #dcdfe6;

    &:hover {
      border-color: #dcdfe6;
      box-shadow: none;
    }
  }
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 6px;
  color: #409eff;
  background: #ecf5ff;
  border-radius: 6px;
  flex-shrink: 0;
}

.file-name {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 4px 0 6px;
  padding: 0 6px;
  box-sizing: border-box;
}

.file-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;

  .el-link,
  .el-button {
    padding: 0;
    line-height: 1;
    font-size: 12px;
  }
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

// 禁用状态下的文件列表
.disabled-file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 12px;
  padding: 8px 0;
  margin-top: 12px;
}
</style>
