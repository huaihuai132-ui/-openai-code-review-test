<template>
  <div class="batch-file-upload">
    <el-upload ref="uploadRef" v-model:file-list="fileList" :action="uploadUrl" :auto-upload="false"
      :disabled="uploading" :limit="maxFiles" :multiple="true" :on-change="handleFileChange"
      :on-error="handleUploadError" :on-exceed="handleExceed" :on-success="handleUploadSuccess"
      :http-request="httpRequest" :show-file-list="false" :drag="drag" :accept="accept"
      :class="{ 'is-uploading': uploading }">
      <div v-if="drag" class="upload-dragger">
        <div v-if="!uploading">
          <el-icon class="upload-icon">
            <Plus />
          </el-icon>
          <div class="upload-text">
            将文件拖到此处，或<em>点击选择文件</em>
          </div>
          <div class="upload-tip" v-if="maxFiles > 1">
            最多可选择 {{ maxFiles }} 个文件
          </div>
        </div>
      </div>
      <div v-else>
        <el-button :disabled="uploading" type="primary">
          <el-icon>
            <Plus />
          </el-icon>
          {{ uploading ? '上传中...' : '选择文件' }}
        </el-button>
      </div>

      <template v-if="tip" #tip>
        <div class="el-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>

    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="file-list">
      <div class="file-list-header">
        <span>已选择文件 ({{ fileList.length }}/{{ maxFiles }})</span>
        <el-button v-if="!uploading" size="small" type="danger" text @click="clearAllFiles">
          清空全部
        </el-button>
      </div>

      <div class="file-items">
        <div v-for="(file, index) in fileList" :key="file.uid || index" class="file-item"
          :class="{ 'is-uploading': file.uploading, 'is-success': file.status === 'success', 'is-error': file.status === 'error' }">
          <div class="file-info">
            <div class="file-name-section">
              <el-icon class="file-icon">
                <Document v-if="!isImageFile(file)" />
                <Picture v-else />
              </el-icon>
              <div class="file-details">
                <div class="original-name">{{ file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.size || 0) }}</div>
              </div>
            </div>

            <!-- 自定义文件名输入 -->
            <div class="custom-name-input">
              <el-input v-model="file.customName" placeholder="自定义文件名（可选）" :disabled="uploading || file.uploading"
                size="small" clearable>
                <template #prepend>别名</template>
              </el-input>
            </div>

            <!-- 操作按钮 -->
            <div class="file-actions">
              <el-button v-if="!uploading && !file.uploading && file.status !== 'success'" size="small" type="danger"
                text @click="removeFile(index)">
                移除
              </el-button>
              <el-button v-if="file.status === 'success' && file.uploadResult" size="small" type="danger" text
                @click="deleteUploadedFile(file, index)">
                删除
              </el-button>
              <el-link v-if="file.status === 'success' && file.uploadResult" :href="file.uploadResult.url"
                target="_blank" type="primary" size="small">
                查看
              </el-link>
              <el-tag v-if="file.status === 'success'" type="success" size="small">
                成功
              </el-tag>
              <el-tag v-else-if="file.status === 'error'" type="danger" size="small">
                失败
              </el-tag>
            </div>
          </div>

          <!-- 单个文件上传进度 -->
          <div v-if="file.progress && file.progress.show" class="file-progress">
            <el-progress :percentage="file.progress.percentage" :status="file.progress.status" :stroke-width="4"
              :show-text="false" />
            <div class="progress-text">
              <span>{{ file.progress.percentage }}%</span>
              <span v-if="file.progress.speed">{{ formatSpeed(file.progress.speed) }}/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 整体上传进度 -->
    <div v-if="overallProgress.show" class="overall-progress">
      <div class="progress-header">
        <span>整体上传进度</span>
        <span>{{ overallProgress.completed }}/{{ overallProgress.total }}</span>
      </div>
      <el-progress :percentage="overallProgress.percentage" :status="overallProgress.status" :stroke-width="8" />
      <div class="progress-details">
        <span>{{ getOverallProgressText() }}</span>
        <el-button v-if="overallProgress.status === 'info'" size="small" @click="cancelAllUploads">
          取消全部
        </el-button>
      </div>
    </div>

    <!-- 上传按钮 -->
    <div v-if="fileList.length > 0 && !uploading" class="upload-actions">
      <el-button type="primary" @click="startBatchUpload" :disabled="uploading">
        开始上传 ({{ fileList.length }} 个文件)
      </el-button>
      <el-button @click="clearAllFiles">清空全部</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, UploadFilled, Document, Picture } from '@element-plus/icons-vue'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import * as FileApi from '@/api/infra/file'

defineOptions({ name: 'BatchFileUpload' })

// 组件属性
const props = defineProps({
  // 最大文件数量
  maxFiles: {
    type: Number,
    default: 10
  },
  // 是否拖拽上传
  drag: {
    type: Boolean,
    default: false
  },
  // 接受的文件类型
  accept: {
    type: String,
    default: ''
  },
  // 提示文字
  tip: {
    type: String,
    default: ''
  },
  // 上传目录
  directory: {
    type: String,
    default: ''
  },
  // 并发上传数量
  concurrent: {
    type: Number,
    default: 3
  }
})

// 组件事件
const emit = defineEmits([
  'upload-success',
  'upload-error',
  'upload-progress',
  'file-change',
  'upload-complete'
])

// 响应式数据
const uploadRef = ref()
const fileList = ref([])
const uploading = ref(false)
const uploadResults = ref([])
const uploadedFileIds = ref<number[]>([]) // 存储已上传文件的ID，用于清理
let cancelTokenSources = new Map()

// 整体上传进度
const overallProgress = ref({
  show: false,
  percentage: 0,
  status: 'info' as 'success' | 'exception' | 'warning' | 'info',
  completed: 0,
  total: 0
})

const { uploadUrl, httpRequest: originalHttpRequest } = useUpload(props.directory)

// 增强的httpRequest（支持单个文件进度）
const httpRequest = async (options) => {
  const axios = (await import('axios')).default

  // 找到对应的文件对象
  const file = fileList.value.find(f => f.uid === options.file.uid)
  if (!file) return

  // 创建取消令牌
  const cancelTokenSource = axios.CancelToken.source()
  cancelTokenSources.set(file.uid, cancelTokenSource)

  // 初始化文件进度
  file.progress = {
    show: true,
    percentage: 0,
    status: 'info',
    speed: 0,
    startTime: Date.now()
  }
  file.uploading = true

  // 构造增强的options对象
  const enhancedOptions = {
    ...options,
    cancelToken: cancelTokenSource.token,
    onProgress: (progressEvent) => {
      if (progressEvent.lengthComputable && file.progress) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        const currentTime = Date.now()
        const timeElapsed = (currentTime - file.progress.startTime) / 1000
        const speed = timeElapsed > 0 ? progressEvent.loaded / timeElapsed : 0

        file.progress = {
          ...file.progress,
          percentage,
          speed,
          status: percentage === 100 ? 'success' : 'info'
        }

        // 更新整体进度
        updateOverallProgress()
      }
    }
  }

  try {
    const result = await originalHttpRequest(enhancedOptions)
    file.uploading = false
    file.status = 'success'
    file.progress.status = 'success'
    file.uploadResult = result.data

    // 记录文件ID用于后续清理
    if (result.data && result.data.id) {
      uploadedFileIds.value.push(result.data.id)
    }

    // 记录上传结果
    const fileName = file.customName || file.name
    uploadResults.value.push({
      [fileName]: result.data
    })

    return result
  } catch (error) {
    file.uploading = false
    if (axios.isCancel(error)) {
      file.status = 'cancelled'
      file.progress.status = 'warning'
    } else {
      file.status = 'error'
      file.progress.status = 'exception'
      throw error
    }
  } finally {
    cancelTokenSources.delete(file.uid)
    updateOverallProgress()
  }
}

// 文件改变处理
const handleFileChange = (file, fileListParam) => {
  // 为新文件添加自定义属性
  const newFiles = fileListParam.filter(f => !fileList.value.find(existing => existing.uid === f.uid))

  newFiles.forEach(newFile => {
    // 添加自定义文件名（默认为原文件名去掉扩展名）
    const nameWithoutExt = newFile.name.substring(0, newFile.name.lastIndexOf('.')) || newFile.name
    newFile.customName = nameWithoutExt
    newFile.uploading = false
    newFile.status = 'ready'
    newFile.progress = null
  })

  fileList.value = fileListParam
  emit('file-change', file, fileListParam)
}

// 开始批量上传
const startBatchUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  uploading.value = true
  uploadResults.value = []

  // 初始化整体进度
  overallProgress.value = {
    show: true,
    percentage: 0,
    status: 'info',
    completed: 0,
    total: fileList.value.length
  }

  // 使用Element Plus的submit方法触发上传
  uploadRef.value?.submit()
}

// 上传成功处理
const handleUploadSuccess = (response, file) => {
  // 单个文件上传成功的处理已在httpRequest中完成
  // 这里检查是否所有文件都上传完成
  checkUploadComplete()
}

// 上传错误处理
const handleUploadError = (error, file) => {
  const fileItem = fileList.value.find(f => f.uid === file.uid)
  if (fileItem) {
    fileItem.uploading = false
    fileItem.status = 'error'
    if (fileItem.progress) {
      fileItem.progress.status = 'exception'
    }
  }

  emit('upload-error', error, file)
  ElMessage.error(`文件 ${file.name} 上传失败`)

  updateOverallProgress()
  checkUploadComplete()
}

// 文件数量超出限制
const handleExceed = () => {
  ElMessage.warning(`最多只能选择 ${props.maxFiles} 个文件`)
}

// 移除文件
const removeFile = (index) => {
  const file = fileList.value[index]
  if (file && cancelTokenSources.has(file.uid)) {
    cancelTokenSources.get(file.uid).cancel('用户移除文件')
    cancelTokenSources.delete(file.uid)
  }
  fileList.value.splice(index, 1)
  updateOverallProgress()
}

// 清空所有文件
const clearAllFiles = () => {
  // 取消所有上传
  cancelTokenSources.forEach(source => {
    source.cancel('用户清空文件')
  })
  cancelTokenSources.clear()

  fileList.value = []
  uploadResults.value = []
  uploading.value = false
  overallProgress.value.show = false
  uploadRef.value?.clearFiles()
}

// 取消所有上传
const cancelAllUploads = () => {
  cancelTokenSources.forEach(source => {
    source.cancel('用户取消上传')
  })
  cancelTokenSources.clear()

  uploading.value = false
  overallProgress.value.status = 'warning'

  // 更新文件状态
  fileList.value.forEach(file => {
    if (file.uploading) {
      file.uploading = false
      file.status = 'cancelled'
      if (file.progress) {
        file.progress.status = 'warning'
      }
    }
  })

  ElMessage.warning('已取消所有上传')
}

// 更新整体进度
const updateOverallProgress = () => {
  if (!overallProgress.value.show) return

  const completed = fileList.value.filter(file =>
    file.status === 'success' || file.status === 'error' || file.status === 'cancelled'
  ).length

  const total = fileList.value.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  overallProgress.value.completed = completed
  overallProgress.value.percentage = percentage

  if (completed === total) {
    overallProgress.value.status = 'success'
  } else if (fileList.value.some(file => file.status === 'error')) {
    overallProgress.value.status = 'exception'
  }
}

// 检查上传是否完成
const checkUploadComplete = () => {
  const allCompleted = fileList.value.every(file =>
    file.status === 'success' || file.status === 'error' || file.status === 'cancelled'
  )

  if (allCompleted) {
    uploading.value = false

    // 构造结果对象
    const results = {}
    uploadResults.value.forEach(result => {
      Object.assign(results, result)
    })

    // 统计信息
    const successCount = fileList.value.filter(file => file.status === 'success').length
    const summary = {
      success: successCount,
      total: fileList.value.length,
      results
    }

    emit('upload-success', results)
    emit('upload-complete', summary)

    if (successCount === fileList.value.length) {
      ElMessage.success(`所有文件上传成功 (${successCount}/${fileList.value.length})`)
    } else {
      ElMessage.warning(`部分文件上传成功 (${successCount}/${fileList.value.length})`)
    }
  }
}

// 获取整体进度文本
const getOverallProgressText = () => {
  switch (overallProgress.value.status) {
    case 'success':
      return '上传完成'
    case 'exception':
      return '部分文件上传失败'
    case 'warning':
      return '上传已取消'
    default:
      return '正在上传'
  }
}

// 判断是否为图片文件
const isImageFile = (file) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  return imageTypes.includes(file.type) || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
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

// 删除已上传的文件
const deleteUploadedFile = async (file: any, index: number) => {
  if (file.uploadResult && file.uploadResult.id) {
    try {
      await FileApi.deleteFile(file.uploadResult.id)
      fileList.value.splice(index, 1)

      // 从已上传文件ID列表中移除
      const idIndex = uploadedFileIds.value.indexOf(file.uploadResult.id)
      if (idIndex > -1) {
        uploadedFileIds.value.splice(idIndex, 1)
      }

      ElMessage.success('文件删除成功')
      updateOverallProgress()
    } catch (error) {
      ElMessage.error('文件删除失败')
    }
  }
}

// 清理所有已上传的文件（页面销毁时调用）
const cleanupUploadedFiles = async () => {
  for (const fileId of uploadedFileIds.value) {
    try {
      await FileApi.deleteFile(fileId)
    } catch (error) {
      console.error('清理文件失败:', error)
    }
  }
  uploadedFileIds.value = []
}

// 页面销毁前清理未保存的文件
onBeforeUnmount(() => {
  if (uploadedFileIds.value.length > 0) {
    cleanupUploadedFiles()
  }
})

// 暴露方法给父组件
defineExpose({
  startBatchUpload,
  clearAllFiles,
  cancelAllUploads,
  cleanupUploadedFiles
})
</script>

<style scoped lang="scss">
.batch-file-upload {
  .file-list {
    margin-top: 16px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    overflow: hidden;

    .file-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      font-size: 14px;
      font-weight: 500;
      color: #606266;
    }

    .file-items {
      max-height: 400px;
      overflow-y: auto;
    }
  }

  .file-item {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f9f9f9;
    }

    &.is-uploading {
      background-color: #f0f9ff;
    }

    &.is-success {
      background-color: #f0f9f0;
    }

    &.is-error {
      background-color: #fef0f0;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .file-name-section {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;

        .file-icon {
          font-size: 24px;
          color: #409eff;
          flex-shrink: 0;
        }

        .file-details {
          flex: 1;
          min-width: 0;

          .original-name {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .file-size {
            font-size: 12px;
            color: #909399;
            margin-top: 2px;
          }
        }
      }

      .custom-name-input {
        flex: 1;
        max-width: 300px;
      }

      .file-actions {
        flex-shrink: 0;
      }
    }

    .file-progress {
      margin-top: 12px;

      .progress-text {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 4px;
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .overall-progress {
    margin: 20px 0;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
      color: #606266;
    }

    .progress-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      font-size: 12px;
      color: #909399;
    }
  }

  .upload-actions {
    margin-top: 16px;
    display: flex;
    gap: 12px;
  }

  &.is-uploading {
    :deep(.el-upload) {
      cursor: not-allowed;
    }
  }
}

:deep(.el-upload) {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;

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
.upload-dragger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;

  .upload-icon {
    font-size: 32px;
    color: #8c939d;
    margin-bottom: 12px;
    transition: color 0.3s ease;
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

  .upload-tip {
    font-size: 12px;
    color: #909399;
  }
}
</style>
