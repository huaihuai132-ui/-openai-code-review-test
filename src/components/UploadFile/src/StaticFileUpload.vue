<template>
  <div class="static-upload-file-container">
    <!-- 文件全能框列表 -->
    <div class="file-boxes-container">
      <div v-for="(fileBox, index) in fileBoxes" :key="index" class="file-all-in-one-box" :class="{
        'is-empty': !fileBox.file,
        'is-selected': fileBox.file && !fileBox.uploading && !fileBox.uploaded,
        'is-uploading': fileBox.uploading,
        'is-uploaded': fileBox.uploaded,
        'is-error': fileBox.error,
        'is-hover': fileBox.isHover && !fileBox.uploading
      }" @mouseenter="fileBox.isHover = true" @mouseleave="fileBox.isHover = false" @click="handleBoxClick(index)"
        @drop="handleDrop($event, index)" @dragover.prevent @dragenter.prevent>
        <!-- 右上角删除按钮 -->
        <div v-if="fileBox.file && (mode === 'create' || mode === 'edit')" class="file-close-btn"
          @click.stop="deleteFile(index)">
          ❌
        </div>

        <!-- 空状态 -->
        <div v-if="!fileBox.file && !fileBox.uploaded" class="empty-state">
          <div class="plus-icon" :class="{ 'hover-blue': fileBox.isHover }">
            ➕
          </div>
          <div class="upload-text">
            {{ getEmptyStateText(index) }}
          </div>
        </div>



        <!-- 上传中状态 -->
        <div v-else-if="fileBox.uploading" class="uploading-state">
          <!-- 圆形进度条 -->
          <div class="progress-circle-container">
            <el-progress type="circle" :percentage="fileBox.progress" :width="80" :stroke-width="6" :show-text="false"
              color="#409eff" />

            <!-- 取消按钮 (悬停显示) -->
            <div v-if="fileBox.isHover" class="progress-cancel-btn" @click.stop="cancelUpload(index)">
              ❌
            </div>

            <!-- 进度信息 (非悬停显示) -->
            <div v-else class="progress-info">
              <div class="upload-speed">{{ formatSpeed(fileBox.speed) }}</div>
              <div class="remaining-time">剩余 {{ formatRemainingTime(fileBox.remainingTime) }}</div>
            </div>
          </div>
        </div>

        <!-- 上传完成状态 -->
        <div v-else-if="fileBox.uploaded" class="uploaded-state">
          <div class="file-icon-container" @click="handlePreview(index)">
            <!-- 文件图标 -->
            <div class="file-icon">
              {{ getFileTypeIcon(fileBox.file?.name || fileBox.fileInfo?.name || '') }}
            </div>
            <!-- 预览悬浮层 -->
            <div v-if="fileBox.isHover && mode !== 'view'" class="preview-overlay">
              <div class="preview-icon">👁️</div>
              <span class="preview-text">预览</span>
            </div>
          </div>

          <!-- 文件名和编辑 -->
          <div class="file-name-section">
            <div v-if="!fileBox.editingName || mode === 'view'" class="file-name-display">
              <div class="file-name-text" :title="fileBox.displayName">{{ fileBox.displayName }}</div>
              <div v-if="mode !== 'view'" class="edit-icon" @click.stop="startEditName(index)">
                ✏️
              </div>
            </div>
            <div v-else class="file-name-edit">
              <el-input v-model="fileBox.tempName" size="small" @keyup.enter="finishEditName(index)"
                @keyup.esc="cancelEditName(index)" ref="nameInput" />
              <div class="confirm-icon" @click.stop="finishEditName(index)">
                ✅
              </div>
            </div>
          </div>
        </div>

        <!-- 隐藏的文件输入框 -->
        <input type="file" :id="`${instanceId}-fileInput${index}`" :accept="accept" :multiple="false"
          style="display: none" @change="handleFileSelect($event, index)" />
      </div>

      <!-- 添加更多文件按钮 (批量模式) -->
      <div v-if="fileBoxes.length < maxFiles && !sequenceCode" class="file-all-in-one-box add-more-box"
        @click="addNewFileBox">
        <div class="empty-state">
          <div class="plus-icon">
            ➕
          </div>
          <div class="upload-text">添加更多文件</div>
        </div>
      </div>
    </div>



    <!-- 提示信息 -->
    <div v-if="isShowTip && tip" class="upload-tip">
      <div class="tip-item">{{ tip }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'

// 生成唯一实例ID
const instanceId = Math.random().toString(36).substring(2, 15)
import { useMessage } from '@/hooks/web/useMessage'
import { useUserStore } from '@/store/modules/user'
import axios from 'axios'
import * as StaticFileApi from '@/api/infra/file/staticFile'
import { FileBusinessSequenceApi } from '@/api/infra/file/fileBusinessSequence'
import { base64Encode } from '@/utils'
import { createImageViewer } from '@/components/ImageViewer'


defineOptions({ name: 'StaticFileUpload' })

const message = useMessage() // 消息弹窗
const userStore = useUserStore() // 用户信息

// 固定域名配置
const FIXED_DOMAIN = 'http://182.109.52.126:49090'

// 组件事件
const emit = defineEmits([
  'update:fileList',
  'delete'
])

// 组件属性
const props = withDefaults(defineProps<{
  fileList: number[]
  mode?: 'create' | 'view' | 'edit'
  sequenceCode?: string
  maxFiles?: number
  directory?: string
  dir?: string
  acceptTypes?: string[]
  accept?: string
  fileSize?: number
  maxFileSize?: number
  isShowTip?: boolean
  tip?: string
}>(), {
  fileList: () => [],
  mode: 'create',
  maxFiles: 999, // 不限制文件数量
  directory: 'static',
  dir: '/',
  accept: '',
  fileSize: 0, // 不限制文件大小
  maxFileSize: 0, // 不限制文件大小
  isShowTip: true,
  tip: ''
})

// ========== 响应式数据 ==========
// 文件框状态
const fileBoxes = ref<Array<{
  file: File | null
  displayName: string
  tempName: string
  editingName: boolean
  uploading: boolean
  uploaded: boolean
  error: boolean
  progress: number
  speed: number
  remainingTime: number
  isHover: boolean
  fileInfo: any // 上传成功后的文件信息
  cancelTokenSource: any // 用于取消上传
  saved: boolean // 是否已保存到业务表单
}>>([])

// 业务序列信息
const sequenceInfo = ref<Array<{
  sequenceFile: string
  sequenceValue: number
}>>([])

// 已上传的文件ID列表
const uploadedFileIds = ref<number[]>([])

// ========== 计算属性 ==========
const isUploading = computed(() => {
  return fileBoxes.value.some(box => box.uploading)
})

// ========== 初始化方法 ==========
// 初始化文件框
const initFileBoxes = async () => {
  if (props.sequenceCode) {
    // 序列模式：根据序列编码获取序列信息
    try {
      const response = await FileBusinessSequenceApi.getFileBusinessSequenceGroupListByCode(props.sequenceCode)
      console.log('静态文件上传-序列API返回结果:', response)

      const data = response.data || response
      console.log('静态文件上传-解析后的data:', data)

      // 数据结构是 [[ { sequenceFile: "商品清单1", sequenceValue: 1 } ]]
      let sequences: any[] = []
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        sequences = data[0] // 取第一个数组
      } else if (Array.isArray(data)) {
        sequences = data
      }

      console.log('静态文件上传-处理后的sequences:', sequences)

      sequenceInfo.value = sequences.map((item: any) => ({
        sequenceFile: item.sequenceFile,
        sequenceValue: item.sequenceValue
      }))

      console.log('静态文件上传-最终sequenceInfo:', sequenceInfo.value)

      // 根据序列长度创建文件框
      fileBoxes.value = sequences.map(() => createEmptyFileBox())
    } catch (error) {
      console.error('获取业务序列失败:', error)
      // 如果获取失败，创建单个文件框
      fileBoxes.value = [createEmptyFileBox()]
    }
  } else {
    // 普通模式：根据maxFiles创建初始文件框
    fileBoxes.value = [createEmptyFileBox()]
  }

  // 如果是查看或编辑模式，加载已有文件
  if ((props.mode === 'view' || props.mode === 'edit') && props.fileList.length > 0) {
    await loadExistingFiles()
  }
}

// 创建空的文件框
const createEmptyFileBox = () => ({
  file: null,
  displayName: '',
  tempName: '',
  editingName: false,
  uploading: false,
  uploaded: false,
  error: false,
  progress: 0,
  speed: 0,
  remainingTime: 0,
  isHover: false,
  fileInfo: null,
  cancelTokenSource: null,
  saved: false
})

// 加载已有文件
const loadExistingFiles = async () => {
  try {
    const files = await StaticFileApi.getStaticFilesByIds(props.fileList as number[])
    const fileData = files.data || files

    // 为每个已有文件创建文件框
    fileData.forEach((file: any, index: number) => {
      if (fileBoxes.value[index]) {
        fileBoxes.value[index].uploaded = true
        fileBoxes.value[index].fileInfo = file
        fileBoxes.value[index].displayName = file.name
        fileBoxes.value[index].saved = true // 已有文件标记为已保存
      }
    })

    updateUploadedFileIds()
  } catch (error) {
    console.error('加载已有文件失败:', error)
  }
}

// ========== 事件处理 ==========
// 点击文件框
const handleBoxClick = (index: number) => {
  const box = fileBoxes.value[index]
  if (props.mode === 'view' || box.uploaded) return

  const input = document.getElementById(`${instanceId}-fileInput${index}`)
  input?.click()
}

// 文件选择处理
const handleFileSelect = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  const file = files[0]
  const box = fileBoxes.value[index]

  // 验证文件
  if (!validateFile(file)) return

  // 设置文件信息
  box.file = file
  box.displayName = getFileNameWithoutExtension(file.name)
  box.tempName = box.displayName
  box.uploaded = false
  box.uploading = false
  box.error = false
  box.progress = 0
  box.fileInfo = null

  // 清空input值，允许选择同一文件
  target.value = ''

  // 自动上传
  await uploadFile(index)
}

// 拖拽处理
const handleDrop = async (event: DragEvent, index: number) => {
  event.preventDefault()
  const box = fileBoxes.value[index]
  if (props.mode === 'view' || box.uploaded) return

  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]

  // 验证文件
  if (!validateFile(file)) return

  // 设置文件信息
  box.file = file
  box.displayName = getFileNameWithoutExtension(file.name)
  box.tempName = box.displayName
  box.uploaded = false
  box.uploading = false
  box.error = false
  box.progress = 0
  box.fileInfo = null

  // 自动上传
  await uploadFile(index)
}

// 开始编辑文件名
const startEditName = async (index: number) => {
  const box = fileBoxes.value[index]
  box.editingName = true
  box.tempName = box.displayName

  await nextTick()
  const input = document.querySelector('.file-name-edit input') as HTMLInputElement
  input?.focus()
  input?.select()
}

// 完成编辑文件名
const finishEditName = (index: number) => {
  const box = fileBoxes.value[index]
  if (box.tempName.trim()) {
    box.displayName = box.tempName.trim()
  }
  box.editingName = false
}

// 取消编辑文件名
const cancelEditName = (index: number) => {
  const box = fileBoxes.value[index]
  box.tempName = box.displayName
  box.editingName = false
}

// 根据文件扩展名获取对应的图标组件
const getFileIcon = (file: File | null): string => {
  if (!file) return 'Document'

  const type = file.type
  if (type.startsWith('image/')) return 'Picture'
  if (type.startsWith('video/')) return 'Video'
  if (type.startsWith('audio/')) return 'Audio'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'Folder'

  return 'Document'
}

// 获取文件类型图标（emoji）
const getFileTypeIcon = (fileName: string): string => {
  if (!fileName) return '📄'

  const extension = fileName.toLowerCase().split('.').pop() || ''

  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'].includes(extension)) {
    return '🖼️'
  }

  // PDF文件
  if (extension === 'pdf') {
    return '📕'
  }

  // Word文档
  if (['doc', 'docx'].includes(extension)) {
    return '📘'
  }

  // Excel文档
  if (['xls', 'xlsx', 'xlsm', 'xlsb'].includes(extension)) {
    return '📗'
  }

  // PowerPoint文档
  if (['ppt', 'pptx', 'pps', 'ppsx'].includes(extension)) {
    return '📙'
  }

  // 压缩文件
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return '🗜️'
  }

  // 视频文件
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp'].includes(extension)) {
    return '🎬'
  }

  // 音频文件
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(extension)) {
    return '🎵'
  }

  // 代码文件
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'php', 'py', 'java', 'cpp', 'c', 'go', 'rs'].includes(extension)) {
    return '💻'
  }

  // 文本文件
  if (['txt', 'md', 'log', 'rtf'].includes(extension)) {
    return '📝'
  }

  // 数据文件
  if (['json', 'xml', 'csv', 'sql', 'yaml', 'yml'].includes(extension)) {
    return '📊'
  }

  // 字体文件
  if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(extension)) {
    return '🔤'
  }

  // 可执行文件
  if (['exe', 'msi', 'dmg', 'deb', 'rpm', 'app'].includes(extension)) {
    return '⚙️'
  }

  // 默认文档图标
  return '📄'
}

// ========== 上传相关方法 ==========
// 单个文件上传
const uploadFile = async (index: number) => {
  const box = fileBoxes.value[index]
  if (!box.file || box.uploading || box.uploaded) return

  try {
    box.uploading = true
    box.error = false
    box.progress = 0
    box.speed = 0
    box.remainingTime = 0

    // 创建取消令牌
    box.cancelTokenSource = axios.CancelToken.source()

    // 上传静态文件
    const uploadResult = await uploadStaticFile(box)

    // 上传成功
    box.uploading = false
    box.uploaded = true
    box.fileInfo = uploadResult
    box.progress = 100

    // 更新已上传文件ID列表
    updateUploadedFileIds()

    message.success(`${box.displayName} 上传成功`)

  } catch (error: any) {
    box.uploading = false
    box.error = true
    box.progress = 0

    if (axios.isCancel(error)) {
      message.info(`${box.displayName} 上传已取消`)
    } else {
      console.error('文件上传失败:', error)
      message.error(`${box.displayName} 上传失败`)
    }
  }
}

// 上传静态文件
const uploadStaticFile = async (box: any) => {
  // 1. 获取静态文件预签名URL
  const presignedData = await StaticFileApi.getStaticFilePresignedUrl(box.file.name, props.directory)

  // 2. 直传到MinIO
  const startTime = Date.now()
  await axios.put(presignedData.uploadUrl, box.file, {
    headers: {
      'Content-Type': box.file.type
    },
    cancelToken: box.cancelTokenSource.token,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        box.progress = progress

        // 计算速度和剩余时间
        const elapsed = (Date.now() - startTime) / 1000
        if (elapsed > 0) {
          box.speed = progressEvent.loaded / elapsed
          const remaining = (progressEvent.total - progressEvent.loaded) / box.speed
          box.remainingTime = remaining
        }
      }
    }
  })

  // 3. 创建静态文件记录
  const createFileData = {
    configId: presignedData.configId,
    name: box.displayName + '.' + getFileExtension(box.file.name),
    path: presignedData.path,
    url: presignedData.url,
    type: box.file.type,
    size: box.file.size,
    dir: props.directory
  }

  const response = await StaticFileApi.createStaticFile(createFileData) as any
  console.log('静态文件上传-StaticFileApi.createStaticFile 返回结果:', response)

  // 根据用户描述，后端返回格式：{code: 0, data: {id: 80, configId: 0, ...}, msg: ""}
  if (response && response.data) {
    return response.data
  }

  // 兜底：如果没有data字段，直接返回response
  return response
}



// 取消上传
const cancelUpload = (index: number) => {
  const box = fileBoxes.value[index]
  if (box.cancelTokenSource) {
    box.cancelTokenSource.cancel('用户取消上传')
    box.uploading = false
    box.progress = 0
    box.speed = 0
    box.remainingTime = 0
  }
}

// 添加新的文件框
const addNewFileBox = () => {
  if (fileBoxes.value.length >= props.maxFiles) {
    message.warning(`最多只能上传 ${props.maxFiles} 个文件`)
    return
  }

  fileBoxes.value.push(createEmptyFileBox())
}

// 删除文件
const deleteFile = async (index: number) => {
  const box = fileBoxes.value[index]

  if (box.uploaded && box.fileInfo?.id) {
    // 删除已上传的文件
    try {
      const confirmMessage = props.mode === 'edit'
        ? '确定要永久删除这个文件吗？删除后无法恢复！'
        : '确定要删除这个文件吗？'
      await message.delConfirm(confirmMessage)

      console.log('静态文件上传-删除文件 - fileInfo:', box.fileInfo)
      const fileId = box.fileInfo.id
      console.log('静态文件上传-删除文件 - fileId:', fileId, 'type:', typeof fileId)

      // 确保fileId是数字类型
      if (!fileId || typeof fileId === 'object') {
        console.error('文件ID无效:', fileId)
        message.error('文件ID无效，无法删除')
        return
      }

      // 删除静态文件
      await StaticFileApi.deleteStaticFile(fileId)
      message.success('静态文件删除成功')

      // 触发删除事件
      emit('delete', fileId)

    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除文件失败:', error)
        message.error('删除文件失败')
      }
      return
    }
  }

  // 序列模式：重置为空状态，保持序列结构
  if (props.sequenceCode) {
    Object.assign(box, createEmptyFileBox())
  } else {
    // 普通批量模式：移除这个框
    if (fileBoxes.value.length > 1) {
      fileBoxes.value.splice(index, 1)
    } else {
      // 只有一个框时：重置为空状态
      Object.assign(box, createEmptyFileBox())
    }
  }

  // 更新文件ID列表
  updateUploadedFileIds()
}



// 处理预览
const handlePreview = async (index: number) => {
  const box = fileBoxes.value[index]
  if (!box.uploaded || !box.fileInfo) return

  try {
    console.log('静态文件上传-预览文件 - fileInfo:', box.fileInfo)
    // 添加用户昵称参数
    const nickname = userStore.getUser?.nickname || ''
    const fileInfo = box.fileInfo

    // 静态文件预览
    if (fileInfo.type && fileInfo.type.includes('image')) {
      // 静态图片文件：使用图片查看器预览
      console.log('预览静态图片:', fileInfo.url)
      createImageViewer({
        zIndex: 9999999,
        urlList: [fileInfo.url]
      })
    } else {
      // 静态非图片文件：拼接预览地址
      const staticFileUrl = `${fileInfo.url}` + `?nickname=${nickname}`
      const encodedUrl = encodeURIComponent(base64Encode(staticFileUrl))
      const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
      window.open(previewUrl, '_blank')
    }
  } catch (error) {
    console.error('预览文件失败:', error)
    message.error('预览文件失败')
  }
}



// ========== 工具方法 ==========
// 验证文件（静态文件上传不限制类型和大小）
const validateFile = (_file: File): boolean => {
  // 静态文件上传不做任何限制
  return true
}

// 获取文件扩展名
const getFileExtension = (filename: string): string => {
  return filename.split('.').pop() || ''
}

// 获取不带扩展名的文件名
const getFileNameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化速度
const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond) + '/s'
}

// 格式化剩余时间
const formatRemainingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
}

// 获取空状态文本
const getEmptyStateText = (index: number): string => {
  console.log('静态文件上传-getEmptyStateText - index:', index)
  console.log('静态文件上传-getEmptyStateText - sequenceCode:', props.sequenceCode)
  console.log('静态文件上传-getEmptyStateText - sequenceInfo:', sequenceInfo.value)
  console.log('静态文件上传-getEmptyStateText - sequenceInfo[index]:', sequenceInfo.value[index])

  if (props.sequenceCode && sequenceInfo.value[index]) {
    const text = `请上传 ${sequenceInfo.value[index].sequenceFile}`
    console.log('静态文件上传-getEmptyStateText - 返回文本:', text)
    return text
  }
  return '拖动或点击选择文件'
}

// 更新已上传文件ID列表
const updateUploadedFileIds = () => {
  const ids = fileBoxes.value
    .filter(box => box.uploaded && box.fileInfo?.id)
    .map(box => box.fileInfo.id)

  uploadedFileIds.value = ids
  emit('update:fileList', ids)
}

// ========== 对外暴露的方法 ==========
// 获取当前已上传的文件ID列表
const getFileList = (): number[] => {
  return uploadedFileIds.value
}

// 获取文件详细信息列表
const getFileDetails = () => {
  return fileBoxes.value
    .filter(box => box.uploaded && box.fileInfo)
    .map(box => box.fileInfo)
}

// 验证是否所有必需的文件都已上传
const validateFiles = (): { valid: boolean; message?: string } => {
  if (props.sequenceCode) {
    // 序列模式：检查是否所有序列位置都有文件
    const requiredCount = sequenceInfo.value.length
    const uploadedCount = fileBoxes.value.filter(box => box.uploaded).length

    if (uploadedCount < requiredCount) {
      const missingFiles = sequenceInfo.value
        .filter((_, index) => !fileBoxes.value[index]?.uploaded)
        .map(seq => seq.sequenceFile)

      return {
        valid: false,
        message: `还有${requiredCount - uploadedCount}个文件未上传：${missingFiles.join(', ')}`
      }
    }
  } else {
    // 普通模式：检查是否至少有一个文件
    const uploadedCount = fileBoxes.value.filter(box => box.uploaded).length
    if (uploadedCount === 0) {
      return {
        valid: false,
        message: '请至少上传一个文件'
      }
    }
  }

  return { valid: true }
}

// 重置组件状态
const resetComponent = () => {
  fileBoxes.value = []
  uploadedFileIds.value = []
  initFileBoxes()
}

// ========== 生命周期 ==========
onMounted(() => {
  initFileBoxes()
})

// ========== 监听器 ==========
watch(
  () => props.fileList,
  () => {
    if (props.mode === 'view' || props.mode === 'edit') {
      loadExistingFiles()
    }
  }
)

watch(
  () => props.sequenceCode,
  () => {
    initFileBoxes()
  }
)

// 暴露方法给父组件
defineExpose({
  getFileList,
  getFileDetails,
  validateFiles,
  resetComponent
})
</script>

<style scoped lang="scss">
.static-upload-file-container {
  width: 100%;

  .file-boxes-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .file-all-in-one-box {
    width: 100%;
    height: 200px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fafafa;

    &.is-hover:not(.is-uploading) {
      border-color: #409eff;
      background: #f0f8ff;
    }

    &.is-selected {
      border-color: #409eff;
      background: #f0f8ff;
    }

    &.is-uploading {
      border-color: #409eff;
      background: #f0f8ff;
      cursor: default;
    }

    &.is-uploaded {
      border-color: #67c23a;
      background: #f0f9f0;
    }

    &.is-error {
      border-color: #f56c6c;
      background: #fef0f0;
    }

    &.add-more-box {
      border-style: dashed;
      border-color: #c0c4cc;
      background: #f9f9f9;

      &:hover {
        border-color: #409eff;
        background: #f0f8ff;
      }
    }

    .file-close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      z-index: 10;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(245, 108, 108, 0.8);
        transform: scale(1.1);
      }
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 16px;

    .plus-icon {
      font-size: 48px;
      color: #c0c4cc;
      margin-bottom: 12px;
      transition: color 0.3s ease;

      &.hover-blue {
        color: #409eff;
      }
    }

    .upload-text {
      font-size: 14px;
      color: #606266;
      text-align: center;
      line-height: 1.4;
    }
  }

  // 已选择状态
  .selected-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 16px;

    .file-icon {
      color: #409eff;
      margin-bottom: 12px;
    }

    .file-name-section {
      flex: 1;
      width: 100%;
      margin-bottom: 12px;

      .file-name-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        .file-name-text {
          font-size: 14px;
          color: #333;
          text-align: center;
          word-break: break-all;
          line-height: 1.4;
          max-width: 160px;
          min-height: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .edit-icon {
          font-size: 16px;
          color: #409eff;
          cursor: pointer;
          flex-shrink: 0;

          &:hover {
            color: #66b1ff;
          }
        }
      }

      .file-name-edit {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;

        .el-input {
          flex: 1;
        }

        .confirm-icon {
          font-size: 16px;
          color: #67c23a;
          cursor: pointer;
          flex-shrink: 0;

          &:hover {
            color: #85ce61;
          }
        }
      }
    }

    .upload-button-section {
      width: 100%;
    }
  }

  // 上传中状态
  .uploading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 16px;

    .progress-circle-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      .progress-cancel-btn {
        position: absolute;
        width: 24px;
        height: 24px;
        background: rgba(245, 108, 108, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: all 0.2s ease;
        z-index: 10;

        &:hover {
          background: rgba(245, 108, 108, 1);
          transform: scale(1.1);
        }
      }

      .progress-info {
        position: absolute;
        text-align: center;

        .upload-speed {
          font-size: 12px;
          color: #409eff;
          margin-bottom: 4px;
        }

        .remaining-time {
          font-size: 10px;
          color: #909399;
        }
      }
    }
  }

  // 上传完成状态
  .uploaded-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 16px;

    .file-icon-container {
      position: relative;
      margin-bottom: 16px;

      .file-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        color: #67c23a;
        background: #f0f9f0;
        border-radius: 12px;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(103, 194, 58, 0.2);
        }
      }

      .preview-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        transition: all 0.3s ease;
        cursor: pointer;

        .preview-text {
          font-size: 12px;
          margin-top: 4px;
        }
      }
    }

    .file-name {
      font-size: 14px;
      color: #333;
      text-align: center;
      padding: 0 8px;
      max-width: 100%;
      word-break: break-all;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }



  // 提示信息
  .upload-tip {
    margin-top: 8px;
    text-align: center;

    .tip-item {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;

      b {
        color: #f56c6c;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
