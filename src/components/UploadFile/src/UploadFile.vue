<template>
  <div class="upload-file-container">
    <!-- 文件全能框列表 -->
    <div class="file-boxes-container">
      <div v-for="(fileBox, index) in fileBoxes" :key="index" class="file-all-in-one-box" :class="{
        'is-empty': !fileBox.file,
        'is-uploading': fileBox.uploading,
        'is-uploaded': fileBox.uploaded,
        'is-error': fileBox.error,
        'is-hover': fileBox.isHover && !fileBox.uploading
      }" @mouseenter="fileBox.isHover = true" @mouseleave="fileBox.isHover = false" @click="handleBoxClick(index)"
        @drop="handleDrop($event, index)" @dragover.prevent @dragenter.prevent>
        <!-- 右上角删除按钮 -->
        <div v-if="fileBox.file && (mode === 'create' || mode === 'edit')" class="file-close-btn"
          @click.stop="deleteFile(index)">
          <el-icon :size="14">
            <Close />
          </el-icon>
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
            <!-- 取消按钮（悬浮时显示） -->
            <div v-if="fileBox.isHover" class="progress-cancel-btn" @click.stop="cancelUpload(index)">
              <el-icon :size="16" color="#f56c6c">
                <Close />
              </el-icon>
            </div>
            <!-- 上传信息（非悬浮时显示） -->
            <div v-else class="progress-info">
              <div class="upload-speed">{{ formatSpeed(fileBox.speed) }}/s</div>
              <div class="remaining-time">{{ formatRemainingTime(fileBox.remainingTime) }}</div>
            </div>
          </div>
        </div>

        <!-- 上传完成状态 -->
        <div v-else-if="fileBox.uploaded" class="uploaded-state">
          <div class="file-icon-container" @click.stop="handlePreview(index)">
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

        <!-- 错误状态 -->
        <div v-else-if="fileBox.error" class="error-state">
          <div class="error-icon">❌</div>
          <div class="error-text">上传失败</div>
          <el-button size="small" type="primary" @click.stop="retryUpload(index)">
            重试
          </el-button>
        </div>

        <!-- 隐藏的文件输入 -->
        <input v-if="mode === 'create' || mode === 'edit'" :id="`${instanceId}-fileInput${index}`" type="file"
          style="display: none" :accept="accept" @change="handleFileSelect($event, index)" />
      </div>
    </div>

    <!-- 提示信息 -->
    <div v-if="isShowTip" class="upload-tip">
      <div v-if="fileSize" class="tip-item">
        大小不超过 <b>{{ fileSize }}MB</b>
      </div>
      <div v-if="acceptTypes.length" class="tip-item">
        格式为 <b>{{ acceptTypes.join('/') }}</b> 的文件
      </div>
      <div v-if="tip" class="tip-item">{{ tip }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, nextTick } from 'vue'

// 生成唯一实例ID
const instanceId = Math.random().toString(36).substring(2, 15)
import { propTypes } from '@/utils/propTypes'
import * as FileApi from '@/api/infra/file'
import { FileBusinessSequenceApi } from '@/api/infra/file/fileBusinessSequence'
import { base64Encode } from '@/utils'
import { useUserStore } from '@/store/modules/user'
import { openPreviewWindow } from '@/utils/previewWindow'
import {
  Close
} from '@element-plus/icons-vue'

defineOptions({ name: 'UploadFile' })

const message = useMessage() // 消息弹窗
const userStore = useUserStore() // 用户信息

// 固定域名配置
const FIXED_DOMAIN = 'http://182.109.52.126:49090'

// 组件事件
const emit = defineEmits([
  'update:fileList',
  'delete',
  'upload-success',
  'upload-error',
  'upload-progress'
])

// 组件属性
const props = defineProps({
  // v-model 绑定的文件 ID 列表
  fileList: propTypes.array.def([]),
  // 模式：create(新建)、view(查看)、edit(编辑)
  mode: propTypes.string.def('create'),
  // 序列编码，用于业务文件序列
  sequenceCode: propTypes.string.def(''),
  // 文件格式限制（已移除限制）
  acceptTypes: propTypes.array.def([]),
  // 文件大小限制（已移除限制）
  fileSize: propTypes.number.def(0),
  // 是否显示提示
  isShowTip: propTypes.bool.def(false),
  // 上传目录
  directory: propTypes.string.def('business'),
  // 虚拟目录
  dir: propTypes.string.def('/'),
  // 接受的文件类型
  accept: propTypes.string.def(''),
  // 提示文字
  tip: propTypes.string.def(''),
  // 最大文件数量（用于多文件模式）
  maxFiles: propTypes.number.def(1),
  // 文件来源（0=业务文件，1=个人文件）
  fileSource: propTypes.number.def(0)
})

// ========== 响应式数据 ==========
// 文件框列表
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

// ========== 初始化方法 ==========
// 初始化文件框
const initFileBoxes = async () => {
  if (props.sequenceCode) {
    // 序列模式：根据序列编码获取序列信息
    try {
      const response = await FileBusinessSequenceApi.getFileBusinessSequenceGroupListByCode(props.sequenceCode)
      const data = response.data || response

      // 数据结构是 [[ { sequenceFile: "商品清单1", sequenceValue: 1 } ]]
      // 需要展平嵌套数组
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
    // 普通模式：根据 maxFiles 创建文件框
    const boxCount = Math.max(1, props.maxFiles)
    fileBoxes.value = Array(boxCount).fill(null).map(() => createEmptyFileBox())
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
    const files = await FileApi.getFilesByIds(props.fileList as number[])

    files.forEach((fileInfo: any, index: number) => {
      if (index < fileBoxes.value.length) {
        fileBoxes.value[index] = {
          ...createEmptyFileBox(),
          uploaded: true,
          displayName: fileInfo.name,
          fileInfo: fileInfo,
          saved: true // 已有文件标记为已保存
        }
      }
    })
  } catch (error) {
    console.error('加载已有文件失败:', error)
    message.error('加载文件信息失败')
  }
}

// ========== 事件处理方法 ==========
// 处理文件框点击
const handleBoxClick = (index: number) => {
  if (props.mode === 'view') return

  const box = fileBoxes.value[index]
  if (!box.file && !box.uploading) {
    // 空状态，触发文件选择
    const fileInput = document.getElementById(`${instanceId}-fileInput${index}`) as HTMLInputElement
    fileInput?.click()
  }
}

// 处理文件选择
const handleFileSelect = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file && validateFile(file)) {
    const box = fileBoxes.value[index]
    box.file = file
    box.displayName = getFileNameWithoutExtension(file.name)
    box.tempName = box.displayName
    box.uploaded = false
    box.uploading = false
    box.error = false

    // 清空输入框，允许重新选择相同文件
    target.value = ''

    // 自动上传
    await uploadFile(index)
  }
}

// 处理拖拽文件
const handleDrop = async (event: DragEvent, index: number) => {
  if (props.mode === 'view') return

  event.preventDefault()
  const files = event.dataTransfer?.files
  const file = files?.[0]

  if (file && validateFile(file)) {
    const box = fileBoxes.value[index]
    box.file = file
    box.displayName = getFileNameWithoutExtension(file.name)
    box.tempName = box.displayName
    box.uploaded = false
    box.uploading = false
    box.error = false

    // 自动上传
    await uploadFile(index)
  }
}

// 开始编辑文件名
const startEditName = (index: number) => {
  const box = fileBoxes.value[index]
  box.editingName = true
  box.tempName = box.displayName

  nextTick(() => {
    const input = document.querySelector('.file-name-edit input') as HTMLInputElement
    input?.focus()
    input?.select()
  })
}

// 完成编辑文件名
const finishEditName = (index: number) => {
  const box = fileBoxes.value[index]
  if (box.tempName.trim()) {
    box.displayName = box.tempName.trim()
  } else {
    box.tempName = box.displayName
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
// 上传文件
const uploadFile = async (index: number) => {
  const box = fileBoxes.value[index]
  if (!box.file) return

  try {
    box.uploading = true
    box.error = false
    box.progress = 0
    box.speed = 0
    box.remainingTime = 0

    // 创建取消令牌
    const axios = (await import('axios')).default
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

    // 触发上传成功事件
    emit('upload-success', uploadResult, box.file)

    message.success(`${box.displayName} 上传成功`)

  } catch (error: any) {
    box.uploading = false
    box.error = true

    if (error.message !== '用户取消上传') {
      // 触发上传失败事件
      emit('upload-error', error, box.file)

      message.error(`${box.displayName} 上传失败`)
      console.error('文件上传失败:', error)
    }
  }
}

// 重试上传
const retryUpload = async (index: number) => {
  const box = fileBoxes.value[index]
  if (!box.file) return

  box.error = false
  await uploadFile(index)
}

// 上传普通文件
const uploadCommonFile = async (box: any) => {
  // 1. 获取预签名URL
  const presignedData = await FileApi.getFilePresignedUrl(box.file.name, props.directory)

  // 2. 直接上传到 MinIO
  const axios = (await import('axios')).default
  const startTime = Date.now()

  await axios.put(presignedData.uploadUrl, box.file, {
    headers: {
      'Content-Type': box.file.type
    },
    cancelToken: box.cancelTokenSource.token,
    onUploadProgress: (progressEvent: any) => {
      if (progressEvent.lengthComputable) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        const currentTime = Date.now()
        const timeElapsed = (currentTime - startTime) / 1000
        const speed = timeElapsed > 0 ? progressEvent.loaded / timeElapsed : 0
        const remainingBytes = progressEvent.total - progressEvent.loaded
        const remainingTime = speed > 0 ? remainingBytes / speed : 0

        box.progress = percentage
        box.speed = speed
        box.remainingTime = remainingTime
      }
    }
  })

  // 3. 创建文件记录
  const createFileData = {
    configId: presignedData.configId,
    name: box.displayName + getFileExtension(box.file.name),
    path: presignedData.path,
    url: presignedData.url,
    type: box.file.type,
    size: box.file.size,
    dir: props.dir,
    fileSource: props.fileSource
  }

  const response = await FileApi.createFile(createFileData) as any

  // 应该直接使用 response.data
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

  // 重置文件框为空状态
  if (props.sequenceCode) {
    // 序列模式：重置为空状态，保持序列结构
    Object.assign(box, createEmptyFileBox())
  } else if (props.maxFiles === 1 || fileBoxes.value.length === 1) {
    // 单文件模式或只剩一个框：重置为空状态
    Object.assign(box, createEmptyFileBox())
  } else {
    // 多文件模式：移除这个框
    fileBoxes.value.splice(index, 1)
  }

  // 更新文件ID列表
  updateUploadedFileIds()
}

// ========== 工具方法 ==========
// 验证文件（普通文件不限制类型和大小）
const validateFile = (_file: File): boolean => {
  // 普通文件上传不做任何限制
  return true
}

// 获取文件扩展名（包含点号）
const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex > -1 ? fileName.slice(lastDotIndex) : ''
}

// 获取不含扩展名的文件名
const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex > -1 ? fileName.slice(0, lastDotIndex) : fileName
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
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化上传速度
const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond)
}

// 格式化剩余时间
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



// ========== 生命周期 ==========
onMounted(() => {
  initFileBoxes()
})

// 监听 fileList 变化
watch(
  () => props.fileList,
  (newFileList, oldFileList) => {
    // 避免死循环：只有当fileList真正改变且不是由组件内部更新时才重新加载
    if (newFileList !== oldFileList &&
      (props.mode === 'view' || props.mode === 'edit') &&
      JSON.stringify(newFileList) !== JSON.stringify(uploadedFileIds.value)) {
      loadExistingFiles()
    }
  },
  { deep: true }
)

// 监听 sequenceCode 变化
watch(
  () => props.sequenceCode,
  (newCode, oldCode) => {
    // 避免死循环：只有当sequenceCode真正改变时才重新初始化
    if (newCode !== oldCode) {
      initFileBoxes()
    }
  }
)

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

// 暴露方法给父组件
defineExpose({
  getFileList,
  getFileDetails,
  // 检查上传文件数量
  validateFiles,
  resetComponent
})
</script>

<style scoped lang="scss">
.upload-file-container {
  width: 100%;
}

.file-boxes-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
}

.file-all-in-one-box {
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 8px 6px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
  overflow: hidden;
  width: 132px;
  height: 88px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    transition: transform 0.1s;
  }

  &.is-empty {
    border: 2px dashed #d9d9d9;

    &:hover,
    &.is-hover {
      border-color: #409eff;
      background: #f0f9ff;
    }
  }

  &.is-uploading {
    border-color: #409eff;
    background: #f0f9ff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }

  &.is-uploaded {
    border-color: #67c23a;
    background: #fff;
    box-shadow: 0 2px 8px rgba(103, 194, 58, 0.1);

    &:hover,
    &.is-hover {
      box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
      transform: translateY(-2px);
    }
  }

  &.is-error {
    border-color: #f56c6c;
    background: #fef0f0;
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.1);
  }

  // 右上角删除按钮
  .file-close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: rgba(245, 108, 108, 0.9);
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
      background: rgba(245, 108, 108, 1);
      transform: scale(1.1);
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    .plus-icon {
      font-size: 24px;
      color: #8c939d;
      margin-bottom: 4px;
      transition: all 0.3s ease;

      &.hover-blue {
        color: #409eff;
        transform: scale(1.1);
      }
    }

    .upload-text {
      color: #606266;
      font-size: 11px;
      text-align: center;
      line-height: 1.2;
      padding: 0 4px;
    }
  }



  // 上传中状态
  .uploading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

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
    padding: 16px 12px;

    .file-icon-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      margin-bottom: 8px;

      .file-thumbnail-container {
        .file-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
      }

      .file-icon {
        font-size: 32px !important;
        transition: transform 0.2s ease;
        color: #409eff !important;
        min-height: 32px;
        display: flex !important;
        align-items: center;
        justify-content: center;
        line-height: 1;
        width: 88px;
        opacity: 1 !important;
        visibility: visible !important;
      }

      .preview-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.5) 0%, rgba(103, 194, 58, 0.5) 100%);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
        backdrop-filter: blur(4px);

        &:hover {
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(64, 158, 255, 0.3);
        }

        .preview-icon {
          font-size: 18px;
          margin-bottom: 0;
        }

        .preview-text {
          font-size: 8px;
          font-weight: 500;
          opacity: 0.9;
        }
      }
    }

    &:hover .file-icon {
      transform: scale(1.1);
    }

    .file-name-section {
      width: 100%;
      text-align: center;

      .file-name-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        .file-name-text {
          font-size: 11px;
          font-weight: 500;
          color: #303133;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.3;
          min-height: 17px;
          flex: 1;
        }

        .edit-icon {
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
          opacity: 0.7;
          transition: opacity 0.2s ease;

          &:hover {
            opacity: 1;
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
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
        }
      }
    }
  }

  // 错误状态
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 16px;

    .error-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .error-text {
      font-size: 11px;
      color: #f56c6c;
      margin-bottom: 6px;
      text-align: center;
    }
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
</style>
