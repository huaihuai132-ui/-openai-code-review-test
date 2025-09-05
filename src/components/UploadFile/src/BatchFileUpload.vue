<template>
  <div class="batch-upload-file-container">
    <!-- 文件全能框列表 -->
    <div class="file-boxes-container">
      <div v-for="(fileBox, index) in fileBoxes" :key="index"
        v-show="mode === 'create' || mode === 'edit' || fileBox.uploaded || fileBox.file" class="file-all-in-one-box" :class="{
          'is-empty': !fileBox.file,
          'is-selected': fileBox.file && !fileBox.uploading && !fileBox.uploaded,
          'is-uploading': fileBox.uploading,
          'is-uploaded': fileBox.uploaded,
          'is-error': fileBox.error,
          'is-hover': fileBox.isHover && !fileBox.uploading,
          'view-mode': mode === 'view'
        }" @mouseenter="fileBox.isHover = true" @mouseleave="fileBox.isHover = false" @click="handleBoxClick(index)"
        @drop="handleDrop($event, index)" @dragover.prevent @dragenter.prevent>
        <!-- 右上角删除按钮 -->
        <div v-if="(fileBox.file || fileBox.uploaded) && (mode === 'create' || mode === 'edit')" class="file-close-btn"
          @click.stop="deleteFile(index)">
          ❌
        </div>

        <!-- 空状态 -->
        <div v-if="!fileBox.file && !fileBox.uploaded" class="empty-state">
          <!-- 空文件框删除按钮 (只在批量模式且有多个文件框时显示) -->
          <div v-if="!sequenceCode && fileBoxes.length > 1 && (mode === 'create' || mode === 'edit')"
            class="empty-file-close-btn" @click.stop="deleteFile(index)">
            ❌
          </div>
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
            <div v-if="fileBox.isHover" class="preview-overlay">
              <div class="preview-icon">👁️</div>
              <span class="preview-text">预览</span>
            </div>
          </div>

          <!-- 文件名和编辑 -->
          <div class="file-name-section">
            <div v-if="!fileBox.editingName || mode === 'view'" class="file-name-display">
              <div class="file-name-text" :title="fileBox.displayName">{{ truncateFileName(fileBox.displayName) }}</div>
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

      <!-- 添加更多文件按钮 (批量模式，仅在创建和编辑模式下显示，且maxFiles大于1) -->
      <div v-if="fileBoxes.length < maxFiles && !sequenceCode && maxFiles > 1 && (mode === 'create' || mode === 'edit')"
        class="file-all-in-one-box add-more-box" @click="addNewFileBox">
        <div class="empty-state">
          <div class="plus-icon">
            ➕
          </div>
          <div class="upload-text">添加更多文件</div>
        </div>
      </div>
    </div>

    <!-- 没有附件提示 (仅在view模式且没有文件时显示) -->
    <div v-if="mode === 'view' && !hasAnyFiles" class="no-files-tip">
      <div class="no-files-text">没有附件</div>
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
import * as FileApi from '@/api/infra/file'
import { FileBusinessSequenceApi } from '@/api/infra/file/fileBusinessSequence'
import { base64Encode } from '@/utils'
import { openPreviewWindow } from '@/utils/previewWindow'


defineOptions({ name: 'BatchFileUpload' })

const message = useMessage() // 消息弹窗
const userStore = useUserStore() // 用户信息

// 导入域名配置工具
import { getDomainUrl } from '@/utils/domainConfig'

// 获取配置的域名
const FIXED_DOMAIN = getDomainUrl()

// 组件事件
const emit = defineEmits([
  'update:fileList',
  'delete'
])

// 组件属性
const props = withDefaults(defineProps<{
  fileList: (number | string)[] | string // 支持数字或字符串ID数组，或逗号分隔的字符串
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
  fileSource?: number
}>(), {
  fileList: () => [],
  mode: 'create',
  maxFiles: 999, // 不限制文件数量
  directory: 'business',
  dir: '/',
  accept: '',
  fileSize: 0, // 不限制文件大小
  maxFileSize: 0, // 不限制文件大小
  isShowTip: true,
  tip: '',
  fileSource: 0
})

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

// 判断是否有任何文件（已上传或待上传）
const hasAnyFiles = computed(() => {
  return fileBoxes.value.some(box => box.uploaded || box.file)
})

// ========== 初始化方法 ==========
// 初始化文件框
const initFileBoxes = async () => {
  if (props.sequenceCode) {
    // 序列模式：根据序列编码获取序列信息
    try {
      const response = await FileBusinessSequenceApi.getFileBusinessSequenceGroupListByCode(props.sequenceCode)
      const data = response.data || response

      // 数据结构是 [[ { sequenceFile: "商品清单1", sequenceValue: 1 } ]]
      let sequences: any[] = []
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        sequences = data[0] // 取第一个数组
      } else if (Array.isArray(data)) {
        sequences = data
      }

      sequenceInfo.value = sequences.map((item: any) => ({
        sequenceFile: item.sequenceFile,
        sequenceValue: item.sequenceValue
      }))

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
    // debugger;
    // 将文件ID转换为合适的格式传递给后端


    // 处理fileList，可能是数组或逗号分隔的字符串
    let fileIds: (number | string)[] = []
    if (typeof props.fileList === 'string') {
      // 如果是字符串，按逗号分割
      fileIds = props.fileList.split(',').filter(id => id.trim() !== '')
    } else if (Array.isArray(props.fileList)) {
      // 如果是数组，直接使用
      fileIds = props.fileList
    } else {
      // 如果都不是，返回空数组
      fileIds = []
    }



    if (fileIds.length === 0) {
      return
    }

    const files = await FileApi.getFilesByIds(fileIds as any)
    const fileData = Array.isArray(files) ? files : (Array.isArray(files?.data) ? files.data : [])

    // 确保有足够的文件框来显示所有文件
    while (fileBoxes.value.length < fileData.length) {
      fileBoxes.value.push(createEmptyFileBox())
    }

    // 为每个已有文件创建文件框
    fileData.forEach((file: any, index: number) => {
      if (fileBoxes.value[index]) {
        fileBoxes.value[index].uploaded = true
        fileBoxes.value[index].fileInfo = file
        fileBoxes.value[index].displayName = file.name
        fileBoxes.value[index].saved = true // 已有文件标记为已保存
      }
    })

    // 加载已有文件时不触发emit，避免循环
    const ids = fileBoxes.value
      .filter(box => box.uploaded && box.fileInfo?.id)
      .map(box => box.fileInfo.id)
    uploadedFileIds.value = ids

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
const handleDrop = (event: DragEvent, index: number) => {
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

    // 上传普通文件
    const uploadResult = await uploadCommonFile(box)

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

// 上传普通文件
const uploadCommonFile = async (box: any) => {
  // 1. 获取预签名URL
  const presignedData = await FileApi.getFilePresignedUrl(box.file.name, props.directory)

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

  // 3. 创建文件记录
  const createFileData = {
    configId: presignedData.configId,
    name: box.displayName + '.' + getFileExtension(box.file.name),
    path: presignedData.path,
    url: presignedData.url,
    type: box.file.type,
    size: box.file.size,
    dir: props.directory,
    fileSource: props.fileSource
  }

  const response = await FileApi.createFile(createFileData) as any

  // 根据用户描述，后端返回格式：{code: 0, data: {id: 80, configId: 28, ...}, msg: ""}
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

  // 如果是已上传的文件，需要先删除服务器上的文件
  if (box.uploaded && box.fileInfo?.id) {
    try {
      const confirmMessage = props.mode === 'edit'
        ? '确定要永久删除这个文件吗？删除后无法恢复！'
        : '确定要删除这个文件吗？'
      await message.delConfirm(confirmMessage)

      const fileId = box.fileInfo.id

      // 确保fileId是数字类型
      if (!fileId || typeof fileId === 'object') {
        console.error('文件ID无效:', fileId)
        message.error('文件ID无效，无法删除')
        return
      }

      // 删除普通文件
      await FileApi.deleteFile(fileId)
      message.success('文件删除成功')

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
    // 普通批量模式：移除这个框（但至少保留一个）
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
    // 添加用户昵称参数
    const nickname = userStore.getUser?.nickname || ''
    const fileInfo = box.fileInfo

    // 普通文件预览 - 不能修改签名URL的查询参数，否则会破坏签名
    const signedUrl = await FileApi.getDownloadUrl(fileInfo.id)
    // 构建文件访问URL，保持签名完整性
    const fileUrl = signedUrl + `&nickname=${nickname}`

    // 构建预览URL
    const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
    const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`

    // 使用预览工具类打开窗口
    const fileName = box.file?.name || box.fileInfo?.name || '未知文件'
    openPreviewWindow(previewUrl, fileName)
  } catch (error) {
    console.error('预览文件失败:', error)
    message.error('预览文件失败')
  }
}



// ========== 工具方法 ==========
// 验证文件（批量文件上传不限制类型和大小）
const validateFile = (_file: File): boolean => {
  // 批量文件上传不做任何限制
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

// 截断文件名用于显示
const truncateFileName = (filename: string, maxLength: number = 12): string => {
  if (filename.length <= maxLength) {
    return filename
  }

  // 如果文件名太长，显示前面部分 + ... + 扩展名
  const extension = getFileExtension(filename)
  const nameWithoutExt = getFileNameWithoutExtension(filename)

  if (extension) {
    const availableLength = maxLength - extension.length - 4 // 4 for "..." and "."
    if (availableLength > 0) {
      return nameWithoutExt.substring(0, availableLength) + '...' + '.' + extension
    }
  }

  // 如果没有扩展名或者太短，直接截断
  return filename.substring(0, maxLength - 3) + '...'
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
  if (props.sequenceCode && sequenceInfo.value[index]) {
    return `请上传 ${sequenceInfo.value[index].sequenceFile}`
  }
  return '点击上传'
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
onMounted(async () => {
  initFileBoxes()

  if ((props.mode === 'view' || props.mode === 'edit') && props.fileList && props.fileList.length > 0) {
    await loadExistingFiles()
  }
})

// ========== 监听器 ==========
// 添加一个标志来防止重复加载
const isLoadingFiles = ref(false)

watch(
  () => props.fileList,
  async (newFileList, oldFileList) => {
    // 防止重复加载
    if (isLoadingFiles.value) {
      return
    }

    // 深度比较数组内容，如果内容相同则不处理
    if (oldFileList && newFileList && Array.isArray(oldFileList) && Array.isArray(newFileList) &&
        oldFileList.length === newFileList.length &&
        oldFileList.every((item, index) => item === newFileList[index])) {
      return
    }

    if ((props.mode === 'view' || props.mode === 'edit') && newFileList && newFileList.length > 0) {
      isLoadingFiles.value = true
      try {
        await loadExistingFiles()
      } finally {
        isLoadingFiles.value = false
      }
    }
  },
  { immediate: true }
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
.batch-upload-file-container {
  width: 100%;

  .file-boxes-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  .file-all-in-one-box {
    width: 100%;
    height: 120px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fafafa;
    overflow: hidden;

    /* view模式下的样式调整 */
    &.view-mode {
      cursor: default;

      .file-icon-container .file-icon:hover {
        transform: none;
        box-shadow: none;
      }
    }

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
    padding: 8px;
    position: relative;
    box-sizing: border-box;

    .empty-file-close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      z-index: 10;
      transition: all 0.2s ease;
      font-size: 12px;

      &:hover {
        background: rgba(245, 108, 108, 0.8);
        transform: scale(1.1);
      }
    }

    .plus-icon {
      font-size: 24px;
      color: #c0c4cc;
      margin-bottom: 4px;
      transition: color 0.3s ease;

      &.hover-blue {
        color: #409eff;
      }
    }

    .upload-text {
      font-size: 11px;
      color: #606266;
      text-align: center;
      line-height: 1.2;
      word-break: break-all;
      line-height: 1.2;
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
      flex-shrink: 1;
      width: 100%;
      margin-bottom: 4px;
      min-height: 0;

      .file-name-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        width: 100%;
        max-width: 120px;
        flex-wrap: nowrap;
        border: 1px solid red; /* 临时调试 */
        background: rgba(255, 0, 0, 0.1); /* 临时调试 */

        .file-name-text {
          font-size: 13px;
          color: #333;
          text-align: center;
          line-height: 1.2;
          flex: 1;
          min-width: 0;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border: 1px solid blue; /* 临时调试 */
          background: rgba(0, 0, 255, 0.1); /* 临时调试 */
        }

        .edit-icon {
          font-size: 11px;
          color: #409eff;
          cursor: pointer;
          flex-shrink: 0;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid green; /* 临时调试 */
          background: rgba(0, 255, 0, 0.1); /* 临时调试 */

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
    justify-content: space-between;
    height: 100%;
    padding: 8px;
    box-sizing: border-box;

    .file-icon-container {
      position: relative;
      margin-bottom: 8px;
      flex-shrink: 0;

      .file-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        color: #67c23a;
        background: #f0f9f0;
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
        font-size: 20px;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(103, 194, 58, 0.2);
        }
      }

      .preview-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.3) 0%, rgba(103, 194, 58, 0.3) 100%);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        transition: all 0.3s ease;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
        backdrop-filter: blur(4px);

        &:hover {
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(64, 158, 255, 0.3);
        }

        .preview-icon {
          font-size: 14px;
          margin-bottom: 0;
        }

        .preview-text {
          font-size: 7px;
          font-weight: 500;
          opacity: 0.9;
        }
      }
    }

    .file-name {
      font-size: 11px;
      color: #333;
      text-align: center;
      padding: 0 4px;
      max-width: 100%;
      word-break: break-all;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 1;
      min-height: 0;
      max-height: 14px;
    }
  }

  // 没有附件提示
  .no-files-tip {
    margin-top: 8px;
    text-align: center;
    padding: 20px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    background-color: #fafafa;

    .no-files-text {
      font-size: 14px;
      color: #999;
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
