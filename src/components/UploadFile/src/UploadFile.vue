<template>
  <div v-if="!disabled" class="upload-file">
    <!-- 上传区域 -->
    <div class="upload-area">
      <el-upload ref="uploadRef" v-model:file-list="fileList" :action="uploadUrl" :auto-upload="false"
        :before-upload="beforeUpload" :disabled="disabled || uploading" :drag="drag" :http-request="httpRequest"
        :limit="1" :multiple="false" :on-error="handleUploadError" :on-exceed="handleExceed" :on-remove="handleRemove"
        :on-success="handleUploadSuccess" :on-change="handleFileChange" :show-file-list="false" :accept="accept"
        :class="['upload-file-uploader', { 'is-uploading': uploading }]" list-type="picture-card" name="file">
        <!-- 拖拽上传区域 -->
        <div v-if="drag" class="upload-dragger">
          <div v-if="!uploading">
            <el-icon class="upload-icon">
              <Plus />
            </el-icon>
            <div class="upload-text">
              将文件拖到此处，或<em>点击选择文件</em>
            </div>
          </div>
        </div>
        <!-- 按钮上传区域 -->
        <div v-else class="upload-button">
          <el-icon>
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
      </el-upload>
    </div>

    <!-- 已选择的文件显示 -->
    <div v-if="selectedFiles.length > 0" class="selected-files">
      <div class="files-header">
        <span>已选择文件 ({{ selectedFiles.length }})</span>
        <el-button v-if="!uploading" size="small" type="danger" text @click="clearFiles">
          清空
        </el-button>
      </div>

      <div class="file-grid">
        <div v-for="(file, index) in selectedFiles" :key="file.uid || index" class="file-item"
          :class="{ 'is-uploading': file.uploading, 'is-success': file.uploaded, 'is-error': file.error }">

          <!-- 右上角删除按钮 -->
          <div v-if="file.uploaded && file.fileInfo" class="file-close-btn" @click="deleteUploadedFile(file, index)">
            <el-icon :size="16">
              <Close />
            </el-icon>
          </div>

          <!-- 文件图标区域 -->
          <div class="file-icon-area">
            <!-- 上传进度（圆形） -->
            <div v-if="file.uploading && file.progress" class="file-progress-circle">
              <el-progress type="circle" :percentage="file.progress.percentage" :width="60" :stroke-width="4"
                :show-text="false" />
              <div class="progress-text">{{ file.progress.percentage }}%</div>
            </div>

            <!-- 文件图标 -->
            <div v-else class="file-icon">
              <el-icon :size="48">
                <Picture v-if="getFileIcon(file) === 'Picture'" />
                <Folder v-else-if="getFileIcon(file) === 'Folder'" />
                <Document v-else />
              </el-icon>
            </div>
          </div>

          <!-- 文件信息 -->
          <div class="file-info-area">
            <div class="file-name" :title="file.name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size || 0) }}</div>
            <div v-if="file.fileInfo?.type" class="file-type">{{ file.fileInfo.type }}</div>
            <div v-if="file.uploaded && file.fileInfo" class="file-id">ID: {{ file.fileInfo.id }}</div>
          </div>

          <!-- 操作按钮 -->
          <div class="file-actions">
            <!-- 未上传时的操作 -->
            <template v-if="!file.uploaded && !file.uploading">
              <el-button size="small" type="danger" text @click="removeFile(index)">
                <el-icon>
                  <Delete />
                </el-icon>
                移除
              </el-button>
            </template>

            <!-- 已上传时的操作 -->
            <template v-if="file.uploaded && file.fileInfo">
              <el-button size="small" type="primary" text @click="previewUploadedFile(file)">
                <el-icon>
                  <View />
                </el-icon>
                预览
              </el-button>
              <el-button size="small" type="danger" text @click="deleteUploadedFile(file, index)">
                <el-icon>
                  <Delete />
                </el-icon>
                删除
              </el-button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传按钮 -->
    <div v-if="selectedFiles.length > 0 && !allFilesUploaded" class="upload-actions">
      <el-button type="primary" @click="startUpload" :disabled="uploading" :loading="uploading">
        {{ uploading ? '上传中...' : '开始上传' }}
      </el-button>
    </div>

    <!-- 上传结果详情 -->
    <div v-if="selectedFiles.length > 0 && allFilesUploaded" class="upload-result-details">
      <div class="result-header">
        <h4>上传结果详情</h4>
      </div>

      <div v-for="(file, index) in selectedFiles.filter(f => f.uploaded)" :key="file.uid || index" class="result-item">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="文件ID">{{ file.fileInfo?.id }}</el-descriptions-item>
          <el-descriptions-item label="配置ID">{{ file.fileInfo?.configId }}</el-descriptions-item>
          <el-descriptions-item label="文件名">{{ file.fileInfo?.name }}</el-descriptions-item>
          <el-descriptions-item label="文件类型">{{ file.fileInfo?.type }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(file.fileInfo?.size || 0) }}</el-descriptions-item>
          <el-descriptions-item label="上传时间">{{ formatTime(file.fileInfo?.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="文件路径" :span="2">{{ file.fileInfo?.path }}</el-descriptions-item>
          <el-descriptions-item label="访问URL" :span="2">
            <el-link type="primary" :href="file.fileInfo?.url" target="_blank">{{ file.fileInfo?.url }}</el-link>
          </el-descriptions-item>
        </el-descriptions>

        <div class="result-actions" style="margin-top: 12px;">
          <el-button type="primary" size="small" @click="previewUploadedFile(file)">
            <el-icon>
              <View />
            </el-icon>
            预览
          </el-button>
          <el-button type="danger" size="small" @click="deleteUploadedFile(file, index)">
            <el-icon>
              <Delete />
            </el-icon>
            删除
          </el-button>
        </div>

        <el-collapse style="margin-top: 12px;">
          <el-collapse-item title="查看完整响应数据" name="1">
            <pre>{{ JSON.stringify(file.fileInfo, null, 2) }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>

  <!-- 上传操作禁用时 -->
  <div v-if="disabled" class="upload-file disabled-view">
    <div class="file-grid">
      <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item disabled">
        <div class="file-icon">
          <el-icon :size="32">
            <Picture v-if="getFileIcon(file) === 'Picture'" />
            <Folder v-else-if="getFileIcon(file) === 'Folder'" />
            <Document v-else />
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
      预计剩余时间：{{ formatRemainingTime(uploadProgress.estimatedTime) }}
    </div>

    <!-- 取消上传按钮 -->
    <div v-if="uploadProgress.status === 'info'" class="progress-actions">
      <el-button size="small" @click="cancelUpload">取消上传</el-button>
    </div>
  </div>

  <!-- 上传按钮 -->
  <div v-if="showUploadButton && fileList.length > 0 && !uploading && !autoUpload" class="upload-actions">
    <el-button type="primary" @click="startUpload" :disabled="uploading">
      开始上传
    </el-button>
    <el-button @click="clearFiles">清空</el-button>
  </div>

  <!-- 禁用状态下的文件显示 -->
  <div v-if="disabled && fileList.length > 0" class="disabled-file-list">
    <div v-for="(file, index) in fileList" :key="index" class="file-item disabled">
      <div class="file-icon">
        <el-icon :size="32">
          <Picture v-if="getFileIcon(file) === 'Picture'" />
          <Folder v-else-if="getFileIcon(file) === 'Folder'" />
          <Document v-else />
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
</template>
<script lang="ts" setup>
import { ref, watch, computed, onBeforeUnmount, defineProps, defineEmits } from 'vue'
import { propTypes } from '@/utils/propTypes'
import type { UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from 'element-plus'
import { isString } from '@/utils/is'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import * as FileApi from '@/api/infra/file'
import { base64Encode } from '@/utils'
import { useUserStore } from '@/store/modules/user'
import {
  Document,
  Plus,
  Picture,
  Folder,
  View,
  Delete,
  Close
} from '@element-plus/icons-vue'

defineOptions({ name: 'SingleFileUpload' })

const message = useMessage() // 消息弹窗
const userStore = useUserStore() // 用户信息

// 固定域名配置
const FIXED_DOMAIN = 'http://182.109.52.126:49090'

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
  fileType: propTypes.array.def([]), // 文件类型限制，空数组表示不限制
  fileSize: propTypes.number.def(5), // 大小限制(MB)
  autoUpload: propTypes.bool.def(true), // 自动上传
  drag: propTypes.bool.def(false), // 拖拽上传
  isShowTip: propTypes.bool.def(true), // 是否显示提示
  disabled: propTypes.bool.def(false), // 是否禁用上传组件
  directory: propTypes.string.def(undefined), // 上传目录
  // 新增属性
  showFileList: propTypes.bool.def(true), // 是否显示文件列表
  showUploadButton: propTypes.bool.def(true), // 是否显示上传按钮
  showUploadText: propTypes.bool.def(true), // 是否显示上传文字
  showCustomFileName: propTypes.bool.def(false), // 是否显示自定义文件名输入框
  customFileDisplay: propTypes.bool.def(false), // 是否使用自定义文件显示
  accept: propTypes.string.def(''), // 接受的文件类型
  tip: propTypes.string.def('') // 提示文字
})

// ========== 响应式数据 ==========
const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadUserFile[]>([])
const selectedFiles = ref<any[]>([])
const uploadedFiles = ref<any[]>([])
const uploadedFileIds = ref<number[]>([]) // 存储已上传文件的ID，用于清理
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

const { uploadUrl, httpRequest: originalHttpRequest } = useUpload(props.directory)

// 计算属性
const allFilesUploaded = computed(() => {
  return selectedFiles.value.length > 0 && selectedFiles.value.every(file => file.uploaded)
})

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
      ElMessage.warning('上传已取消')
    } else {
      uploadProgress.value.status = 'exception'
      throw error
    }
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

  message.success('正在上传文件，请稍候...')
  return true
}
// 文件改变处理
const handleFileChange = (file, fileListParam) => {
  if (file && file.raw) {
    const newFile = {
      uid: file.uid,
      name: file.name,
      size: file.size,
      type: file.type,
      raw: file.raw,
      uploading: false,
      uploaded: false,
      error: false,
      progress: null,
      fileInfo: null
    }
    selectedFiles.value = [newFile] // 单个文件，替换

    // 如果没有自定义文件名，使用原文件名（去掉扩展名）
    if (!customFileName.value && file.name) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
      customFileName.value = nameWithoutExt
    }
  }

  emit('file-change', file, fileListParam)
}

// 开始上传
const startUpload = async () => {
  if (selectedFiles.value.length === 0) {
    message.warning('请先选择文件')
    return
  }

  uploading.value = true

  for (const file of selectedFiles.value) {
    if (!file.uploaded) {
      await uploadSingleFile(file)
    }
  }

  uploading.value = false

  // 检查是否所有文件都上传成功
  const successFiles = selectedFiles.value.filter(f => f.uploaded)
  if (successFiles.length > 0) {
    // 构造返回数据
    const results = successFiles.map(f => f.fileInfo)
    emit('upload-success', results)
    emit('update:modelValue', results.map(r => r.url).join(','))
    message.success('文件上传成功')
  }
}

// 上传单个文件
const uploadSingleFile = async (file: any) => {
  file.uploading = true
  file.progress = { percentage: 0, status: 'info' }

  try {
    const options = {
      file: file.raw,
      onProgress: (progressEvent: any) => {
        if (progressEvent.lengthComputable) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          file.progress = {
            percentage,
            status: percentage === 100 ? 'success' : 'info'
          }
        }
      }
    }

    const result = await originalHttpRequest(options)
    file.uploading = false
    file.uploaded = true
    file.fileInfo = result.data

    // 记录文件ID用于后续清理
    if (result.data && result.data.id) {
      uploadedFileIds.value.push(result.data.id)
    }

  } catch (error) {
    file.uploading = false
    file.error = true
    file.progress = { percentage: 0, status: 'exception' }
    message.error(`文件 ${file.name} 上传失败`)
  }
}

// 移除未上传的文件
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

// 删除已上传的文件
const deleteUploadedFile = async (file: any, index: number) => {
  if (file.fileInfo && file.fileInfo.id) {
    try {
      await FileApi.deleteFile(file.fileInfo.id)
      selectedFiles.value.splice(index, 1)

      // 从已上传文件ID列表中移除
      const idIndex = uploadedFileIds.value.indexOf(file.fileInfo.id)
      if (idIndex > -1) {
        uploadedFileIds.value.splice(idIndex, 1)
      }

      message.success('文件删除成功')

      // 更新modelValue
      const remainingFiles = selectedFiles.value.filter(f => f.uploaded)
      emit('update:modelValue', remainingFiles.map(f => f.fileInfo.url).join(','))
    } catch (error) {
      message.error('文件删除失败')
    }
  }
}

// 预览已上传的文件
const previewUploadedFile = async (file: any) => {
  // 获取文件信息，支持直接传入文件信息或包含fileInfo的对象
  const fileData = file.fileInfo || file

  if (!fileData || !fileData.id) {
    message.error('文件信息不完整，无法预览')
    console.error('文件信息:', file)
    return
  }

  try {
    console.log('预览文件:', fileData)

    // 添加用户昵称参数
    const nickname = userStore.getUser?.nickname || ''

    // 判断是否为静态文件
    if (fileData.configId === 0) {
      // 静态文件预览
      if (fileData.type && fileData.type.includes('image')) {
        // 静态图片文件：直接使用URL预览
        const staticImageUrl = `${FIXED_DOMAIN}/minio/static/${fileData.path}`
        window.open(staticImageUrl, '_blank')
        return
      } else {
        // 静态非图片文件：拼接预览地址
        const staticFileUrl = `${FIXED_DOMAIN}/minio/static/${fileData.path}` + `?nickname=${nickname}`
        const encodedUrl = encodeURIComponent(base64Encode(staticFileUrl))
        const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
        window.open(previewUrl, '_blank')
      }
    } else {
      // 普通文件预览 - 不能修改签名URL的查询参数，否则会破坏签名
      const signedUrl = await FileApi.getDownloadUrl(fileData.id)

      // 解析原始URL并替换域名，但保持查询参数不变
      const urlObj = new URL(signedUrl)
      const pathAndQuery = urlObj.pathname + urlObj.search

      // 构建文件访问URL，保持签名完整性
      const fileUrl = `${FIXED_DOMAIN}/minio${pathAndQuery}` + `&nickname=${nickname}`

      // 构建预览URL，将nickName作为预览服务的参数而不是文件URL的参数
      const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
      let previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`

      // 将用户昵称作为预览服务的参数传递，而不是文件URL的参数
      if (nickname) {
        previewUrl += `&nickname=${encodeURIComponent(nickname)}`
      }

      window.open(previewUrl, '_blank')
    }
  } catch (error) {
    console.error('预览文件失败:', error)
    message.error('预览文件失败')
  }
}

// 清空所有文件
const clearFiles = async () => {
  // 删除所有已上传的文件
  for (const file of selectedFiles.value) {
    if (file.uploaded && file.fileInfo && file.fileInfo.id) {
      try {
        await FileApi.deleteFile(file.fileInfo.id)
      } catch (error) {
        console.error('删除文件失败:', error)
      }
    }
  }

  selectedFiles.value = []
  uploadedFileIds.value = []
  fileList.value = []
  uploadRef.value?.clearFiles()
  emit('update:modelValue', '')
}

// 根据文件扩展名或类型获取对应的图标组件
const getFileIcon = (file: any) => {
  const fileName = file.name || ''
  // 优先使用上传后返回的文件类型，如果没有则使用原始文件类型
  const fileType = file.fileInfo?.type || file.type || ''

  // 根据MIME类型判断
  if (fileType.includes('image/')) {
    return 'Picture' // 图片文件
  }
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z') || fileType.includes('tar')) {
    return 'Folder'
  }

  // 根据文件扩展名判断
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return 'Picture'
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
      return 'Folder'
    default:
      return 'Document'
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

// 上传成功处理
const handleUploadSuccess: UploadProps['onSuccess'] = (response, file) => {
  uploading.value = false

  // 延迟一下让用户看到上传完成状态
  setTimeout(() => {
    uploadProgress.value.show = false

    console.log('上传成功，完整响应:', response)

    // 正确处理响应数据结构
    const fileData = response.data || response

    // 更新selectedFiles中对应文件的信息
    const selectedFile = selectedFiles.value.find(f => f.uid === file.uid)
    if (selectedFile) {
      selectedFile.uploading = false
      selectedFile.uploaded = true
      selectedFile.fileInfo = fileData
      selectedFile.error = false
      selectedFile.progress = { percentage: 100, status: 'success' }

      // 记录文件ID用于后续清理
      if (fileData && fileData.id) {
        uploadedFileIds.value.push(fileData.id)
      }
    }

    // 构造返回数据：{ 文件名: 完整文件信息 }
    const fileName = customFileName.value || file.name
    const result = {
      [fileName]: fileData
    }

    emit('upload-success', result, file)
    message.success('文件上传成功')

    // 更新modelValue
    emitUpdateModelValue(fileData.url)
  }, 1000)
}

// 上传错误处理
const handleUploadError: UploadProps['onError'] = (error, file) => {
  uploading.value = false
  uploadProgress.value.status = 'exception'
  emit('upload-error', error, file)
  message.error('文件上传失败')
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



// 格式化上传速度
const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond)
}

// 格式化剩余时间（秒数转可读格式）
const formatRemainingTime = (seconds: number): string => {
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

// 格式化时间戳为可读日期
const formatTime = (timestamp: number): string => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
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
  startUpload,
  clearFiles,
  cancelUpload
})
</script>
<style scoped lang="scss">
.single-file-upload {
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

  &.is-uploading {
    :deep(.el-upload) {
      cursor: not-allowed;
    }
  }
}

// 上传区域样式改进
.upload-area {
  margin-bottom: 16px;

  .upload-file-uploader {
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
  }
}

// 已选择文件显示样式
.selected-files {
  margin-top: 16px;

  .files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #e4e7ed;

    span {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
    }
  }
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  background: #fff;
  transition: all 0.3s ease;
  position: relative;
  min-height: 180px;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
  }

  &.is-uploading {
    background-color: #f0f9ff;
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
  }

  &.is-success {
    background-color: #f0f9f0;
    border-color: #67c23a;
    box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.1);
  }

  &.is-error {
    background-color: #fef0f0;
    border-color: #f56c6c;
    box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.1);
  }

  &.disabled {
    background: #f5f7fa;
    border-color: #dcdfe6;

    &:hover {
      border-color: #dcdfe6;
      box-shadow: none;
      transform: none;
    }
  }

  // 右上角关闭按钮
  .file-close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    opacity: 0.8;
    transition: all 0.2s ease;
    z-index: 10;

    &:hover {
      opacity: 1;
      background: rgba(245, 108, 108, 0.8);
      transform: scale(1.1);
    }
  }

  // 文件图标区域
  .file-icon-area {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin-bottom: 12px;
    position: relative;

    .file-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #409eff;
      background: #ecf5ff;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
      }
    }

    .file-progress-circle {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      .progress-text {
        position: absolute;
        font-size: 12px;
        font-weight: 600;
        color: #409eff;
      }
    }
  }

  // 文件信息区域
  .file-info-area {
    flex: 1;
    width: 100%;
    text-align: center;
    margin-bottom: 12px;

    .file-name {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 8px;
    }

    .file-size {
      font-size: 11px;
      color: #909399;
      margin-bottom: 2px;
    }

    .file-type {
      font-size: 10px;
      color: #67c23a;
      background: #f0f9f0;
      padding: 2px 6px;
      border-radius: 10px;
      display: inline-block;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  // 操作按钮区域
  .file-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;

    .el-button {
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 6px;

      .el-icon {
        margin-right: 2px;
      }
    }
  }

  .file-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
}

.upload-actions {
  margin-top: 16px;
  text-align: center;
}

// 上传结果详情样式
.upload-result-details {
  margin-top: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  .result-header {
    margin-bottom: 16px;

    h4 {
      color: #303133;
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .result-item {
    margin-bottom: 20px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e4e7ed;

    &:last-child {
      margin-bottom: 0;
    }

    .result-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    pre {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
      max-height: 200px;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .file-id {
    font-size: 10px;
    color: #909399;
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 10px;
    display: inline-block;
    margin-top: 4px;
  }
}

.disabled-view {
  .file-grid {
    opacity: 0.8;
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

    em {
      color: #409eff;
      font-style: normal;
      font-weight: 500;
    }
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

:deep(.el-upload-dragger) {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &:hover {
    border-color: #409eff;
  }
}
</style>
