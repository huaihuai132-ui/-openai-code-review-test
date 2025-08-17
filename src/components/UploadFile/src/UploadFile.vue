<template>
  <div class="upload-file-container">
    <!-- 文件全能框列表 -->
    <div class="file-boxes-container">
      <div 
        v-for="(fileBox, index) in fileBoxes" 
        :key="index" 
        class="file-all-in-one-box"
        :class="{
          'is-empty': !fileBox.file,
          'is-selected': fileBox.file && !fileBox.uploading && !fileBox.uploaded,
          'is-uploading': fileBox.uploading,
          'is-uploaded': fileBox.uploaded,
          'is-error': fileBox.error,
          'is-hover': fileBox.isHover && !fileBox.uploading
        }"
        @mouseenter="fileBox.isHover = true"
        @mouseleave="fileBox.isHover = false"
        @click="handleBoxClick(index)"
        @drop="handleDrop($event, index)"
        @dragover.prevent
        @dragenter.prevent
      >
        <!-- 右上角删除按钮 -->
        <div 
          v-if="fileBox.file && (mode === 'create' || mode === 'edit')" 
          class="file-close-btn" 
          @click.stop="deleteFile(index)"
        >
          <el-icon :size="14">
            <Close />
          </el-icon>
        </div>

        <!-- 空状态 -->
        <div v-if="!fileBox.file" class="empty-state">
          <el-icon 
            class="plus-icon" 
            :class="{ 'hover-blue': fileBox.isHover }"
          >
              <Plus />
            </el-icon>
            <div class="upload-text">
            {{ getEmptyStateText(index) }}
            </div>
          </div>

        <!-- 已选择文件状态 -->
        <div v-else-if="fileBox.file && !fileBox.uploading && !fileBox.uploaded" class="selected-state">
          <!-- 文件图标 -->
          <div class="file-icon">
            <el-icon :size="48">
              <Picture v-if="getFileIcon(fileBox.file) === 'Picture'" />
              <VideoPlay v-else-if="getFileIcon(fileBox.file) === 'Video'" />
              <Microphone v-else-if="getFileIcon(fileBox.file) === 'Audio'" />
              <Folder v-else-if="getFileIcon(fileBox.file) === 'Folder'" />
              <Document v-else />
            </el-icon>
          </div>
          
          <!-- 文件名和编辑 -->
          <div class="file-name-section">
            <div v-if="!fileBox.editingName" class="file-name-display">
              <div class="file-name-text" :title="fileBox.displayName">{{ fileBox.displayName }}</div>
              <el-icon class="edit-icon" @click.stop="startEditName(index)">
                <Edit />
              </el-icon>
        </div>
            <div v-else class="file-name-edit">
              <el-input 
                v-model="fileBox.tempName" 
                size="small" 
                @keyup.enter="finishEditName(index)"
                @keyup.esc="cancelEditName(index)"
                ref="nameInput"
              />
              <el-icon class="confirm-icon" @click.stop="finishEditName(index)">
                <Check />
          </el-icon>
          </div>
        </div>

          <!-- 上传按钮 -->
          <div class="upload-button-section">
            <el-button type="primary" size="small" @click.stop="uploadFile(index)">
              上传文件
            </el-button>
            </div>
    </div>

        <!-- 上传中状态 -->
        <div v-else-if="fileBox.uploading" class="uploading-state">
          <!-- 圆形进度条 -->
          <div class="progress-circle-container">
          <el-progress 
            type="circle" 
              :percentage="fileBox.progress" 
              :width="80" 
              :stroke-width="6"
            :show-text="false" 
              color="#409eff" 
            />
            <!-- 取消按钮（悬浮时显示） -->
            <div 
              v-if="fileBox.isHover" 
              class="progress-cancel-btn" 
              @click.stop="cancelUpload(index)"
            >
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
          <div 
            class="file-icon-container"
            @click.stop="handlePreview(index)"
          >
        <!-- 文件图标 -->
            <div class="file-icon">
          <el-icon :size="48">
                <Picture v-if="getFileIcon(fileBox.file) === 'Picture'" />
                <VideoPlay v-else-if="getFileIcon(fileBox.file) === 'Video'" />
                <Microphone v-else-if="getFileIcon(fileBox.file) === 'Audio'" />
                <Folder v-else-if="getFileIcon(fileBox.file) === 'Folder'" />
            <Document v-else />
          </el-icon>
            </div>
            <!-- 预览悬浮层 -->
            <div v-if="fileBox.isHover && mode !== 'view'" class="preview-overlay">
            <el-icon :size="20">
              <View />
            </el-icon>
            <span class="preview-text">预览</span>
        </div>
      </div>

          <!-- 文件名 -->
          <div class="file-name">
            {{ fileBox.displayName }}
    </div>
  </div>

        <!-- 隐藏的文件输入 -->
        <input 
          v-if="mode === 'create' || mode === 'edit'"
          :id="`fileInput${index}`"
          type="file" 
          style="display: none" 
          :accept="accept"
          @change="handleFileSelect($event, index)"
        />
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
import { ref, watch, defineProps, defineEmits, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { propTypes } from '@/utils/propTypes'
// import { useUpload } from '@/components/UploadFile/src/useUpload'
import * as FileApi from '@/api/infra/file'
import * as StaticFileApi from '@/api/infra/file/staticFile'
import { FileBusinessSequenceApi } from '@/api/infra/file/fileBusinessSequence'
import { base64Encode } from '@/utils'
import { useUserStore } from '@/store/modules/user'
import {
  Document,
  Plus,
  Picture,
  Folder,
  View,
  Close,
  VideoPlay,
  Microphone,
  Edit,
  Check
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
  // 文件类型：common(普通文件) 或 static(静态文件)
  fileType: propTypes.string.def('common'),
  // 文件格式限制
  acceptTypes: propTypes.array.def([]),
  // 文件大小限制(MB)
  fileSize: propTypes.number.def(10),
  // 是否显示提示
  isShowTip: propTypes.bool.def(true),
  // 上传目录
  directory: propTypes.string.def(''),
  // 接受的文件类型
  accept: propTypes.string.def(''),
  // 提示文字
  tip: propTypes.string.def(''),
  // 最大文件数量（用于多文件模式）
  maxFiles: propTypes.number.def(1)
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

// const { uploadUrl, httpRequest: originalHttpRequest } = useUpload(props.directory)

// ========== 初始化方法 ==========
// 初始化文件框
const initFileBoxes = async () => {
  if (props.sequenceCode) {
    // 序列模式：根据序列编码获取序列信息
    try {
      const response = await FileBusinessSequenceApi.getFileBusinessSequenceGroupListByCode(props.sequenceCode)
      console.log('序列API返回结果:', response)
      
      const data = response.data || response
      console.log('解析后的data:', data)
      
      // 数据结构是 [[ { sequenceFile: "商品清单1", sequenceValue: 1 } ]]
      // 需要展平嵌套数组
      let sequences: any[] = []
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        sequences = data[0] // 取第一个数组
      } else if (Array.isArray(data)) {
        sequences = data
      }
      
      console.log('处理后的sequences:', sequences)
      
      sequenceInfo.value = sequences.map((item: any) => ({
        sequenceFile: item.sequenceFile,
        sequenceValue: item.sequenceValue
      }))
      
      console.log('最终sequenceInfo:', sequenceInfo.value)
      
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
          fileInfo: fileInfo
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
    const fileInput = document.getElementById(`fileInput${index}`) as HTMLInputElement
    fileInput?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event: Event, index: number) => {
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
  }
}

// 处理拖拽文件
const handleDrop = (event: DragEvent, index: number) => {
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
    
    // 根据文件类型选择上传方式
    let uploadResult
    if (props.fileType === 'static') {
      uploadResult = await uploadStaticFile(box)
    } else {
      uploadResult = await uploadCommonFile(box)
    }
    
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
    
    if (error.message !== '用户取消上传') {
      message.error(`${box.displayName} 上传失败`)
      console.error('文件上传失败:', error)
    }
  }
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
    dir: props.directory
  }
  
  const response = await FileApi.createFile(createFileData) as any
  console.log('FileApi.createFile 返回结果:', response)
  
  // 根据用户描述，后端返回格式：{code: 0, data: {id: 80, configId: 28, ...}, msg: ""}
  // 应该直接使用 response.data
  if (response && response.data) {
    return response.data
  }
  
  // 兜底：如果没有data字段，直接返回response
  return response
}

// 上传静态文件
const uploadStaticFile = async (box: any) => {
  // 1. 获取静态文件预签名URL
  const presignedData = await StaticFileApi.getStaticFilePresignedUrl(box.file.name, props.directory)
  
  // 2. 直接上传到 MinIO static 桶
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
  
  // 3. 创建静态文件记录
  const createFileData = {
    configId: presignedData.configId,
    name: box.displayName + getFileExtension(box.file.name),
    path: presignedData.path,
    url: presignedData.url,
    type: box.file.type,
    size: box.file.size,
    dir: props.directory
  }
  
  const response = await StaticFileApi.createStaticFile(createFileData) as any
  console.log('StaticFileApi.createStaticFile 返回结果:', response)
  
  // 根据用户描述，后端返回格式：{code: 0, data: {id: 80, configId: 0, ...}, msg: ""}
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
      await message.delConfirm('确定要删除这个文件吗？')
      
      console.log('删除文件 - fileInfo:', box.fileInfo)
      const fileId = box.fileInfo.id
      console.log('删除文件 - fileId:', fileId, 'type:', typeof fileId)
      
      // 确保fileId是数字类型
      if (!fileId || typeof fileId === 'object') {
        console.error('文件ID无效:', fileId)
        message.error('文件ID无效，无法删除')
        return
      }
      
      // 查找要删除的文件信息（参考index.vue的handleDelete方法）
      const fileToDelete = box.fileInfo
      
      // 判断是否为静态文件（通过configId是否为0来判断）
      const isStaticFile = fileToDelete && fileToDelete.configId === 0
      
      if (isStaticFile) {
        // 删除静态文件
        await StaticFileApi.deleteStaticFile(fileId)
        message.success('静态文件删除成功')
    } else {
        // 删除普通文件
        await FileApi.deleteFile(fileId)
        message.success('文件删除成功')
      }
      
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
  if (props.maxFiles === 1 || fileBoxes.value.length === 1) {
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
// 验证文件
const validateFile = (file: File): boolean => {
  // 检查文件类型
  if (props.acceptTypes.length > 0) {
    const fileExtension = getFileExtension(file.name).toLowerCase()
    const isValidType = props.acceptTypes.some((type: string) => {
      return file.type.includes(type) || fileExtension.includes(type.replace('.', ''))
    })
    if (!isValidType) {
      message.error(`文件格式不正确，请上传 ${props.acceptTypes.join('/')} 格式的文件`)
      return false
    }
  }
  
  // 检查文件大小
  const isValidSize = file.size <= props.fileSize * 1024 * 1024
  if (!isValidSize) {
    message.error(`文件大小不能超过 ${props.fileSize}MB`)
    return false
  }
  
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

// 根据文件类型获取图标
const getFileIcon = (file: File | any): string => {
  const fileName = file.name || ''
  const fileType = file.type || ''
  
  // 根据 MIME 类型判断
  if (fileType.includes('image/')) return 'Picture'
  if (fileType.includes('video/')) return 'Video'
  if (fileType.includes('audio/')) return 'Audio'
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return 'Folder'

  // 根据文件扩展名判断
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
    case 'bmp':
      return 'Picture'
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'mkv':
      return 'Video'
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
    case 'm4a':
      return 'Audio'
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
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
  console.log('getEmptyStateText - index:', index)
  console.log('getEmptyStateText - sequenceCode:', props.sequenceCode)
  console.log('getEmptyStateText - sequenceInfo:', sequenceInfo.value)
  console.log('getEmptyStateText - sequenceInfo[index]:', sequenceInfo.value[index])
  
  if (props.sequenceCode && sequenceInfo.value[index]) {
    const text = `请上传 ${sequenceInfo.value[index].sequenceFile}`
    console.log('getEmptyStateText - 返回文本:', text)
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

// 处理预览
const handlePreview = async (index: number) => {
  const box = fileBoxes.value[index]
  if (!box.uploaded || !box.fileInfo) return
  
  try {
    const nickname = userStore.getUser?.nickname || ''
    const fileInfo = box.fileInfo
    
    console.log('预览文件 - fileInfo:', fileInfo)
    console.log('预览文件 - fileId:', fileInfo.id, 'type:', typeof fileInfo.id)
    
    // 确保fileId是有效的
    if (!fileInfo.id || typeof fileInfo.id === 'object') {
      console.error('文件ID无效:', fileInfo.id)
      message.error('文件ID无效，无法预览')
      return
    }
    
    // 判断是否为静态文件（通过configId是否为0来判断）
    if (fileInfo.configId === 0) {
      // 静态文件预览
      if (fileInfo.type && fileInfo.type.includes('image')) {
        // 静态图片文件：直接显示
        return
      } else {
        // 静态非图片文件：拼接预览地址
        const staticFileUrl = `${FIXED_DOMAIN}/minio/static/${fileInfo.path}` + `?nickname=${nickname}`
        const encodedUrl = encodeURIComponent(base64Encode(staticFileUrl))
        const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
        window.open(previewUrl, '_blank')
      }
    } else {
      // 普通文件预览 - 不能修改签名URL的查询参数，否则会破坏签名
      const signedUrl = await FileApi.getDownloadUrl(fileInfo.id)

      // 解析原始URL并替换域名，但保持查询参数不变
      const urlObj = new URL(signedUrl)
      const pathAndQuery = urlObj.pathname + urlObj.search

      // 构建文件访问URL，保持签名完整性
      const fileUrl = `${FIXED_DOMAIN}/minio${pathAndQuery}` + `&nickname=${nickname}`

      // 构建预览URL，将nickname作为预览服务的参数而不是文件URL的参数
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

// 清空所有未保存的文件
const clearUnsavedFiles = async () => {
  // 只清理已上传但未保存的文件
  const unsavedFiles = fileBoxes.value.filter(box => 
    box.uploaded && box.fileInfo?.id && !box.saved
  )
  
  console.log('准备清理未保存的文件:', unsavedFiles.length, '个')
  
  for (const box of unsavedFiles) {
    try {
      const fileId = box.fileInfo.id
      
      // 确保fileId是有效的数字类型
      if (!fileId || typeof fileId === 'object') {
        console.error('清理文件时发现无效ID:', fileId)
        continue
      }
      
      console.log('清理文件:', fileId, box.fileInfo.name)
      
      // 判断是否为静态文件（通过configId是否为0来判断）
      const isStaticFile = box.fileInfo.configId === 0
      
      if (isStaticFile) {
        await StaticFileApi.deleteStaticFile(fileId)
      } else {
        await FileApi.deleteFile(fileId)
      }
      
      console.log('文件清理成功:', fileId)
    } catch (error) {
      console.error('清理文件失败:', error)
    }
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  initFileBoxes()
  
  // 监听页面刷新和关闭事件
  window.addEventListener('beforeunload', clearUnsavedFiles)
})

onBeforeUnmount(() => {
  // 清理事件监听
  window.removeEventListener('beforeunload', clearUnsavedFiles)
})

// 监听 fileList 变化
watch(
  () => props.fileList,
  () => {
    if (props.mode === 'view' || props.mode === 'edit') {
      loadExistingFiles()
    }
  },
  { deep: true }
)

// 监听 sequenceCode 变化
watch(
  () => props.sequenceCode,
  () => {
    initFileBoxes()
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

// 标记文件为已保存（表单提交成功后调用，避免被清理）
const markFilesAsSaved = () => {
  fileBoxes.value.forEach(box => {
    if (box.uploaded && box.fileInfo) {
      box.saved = true
    }
  })
}

// 暴露方法给父组件
defineExpose({
  clearUnsavedFiles,
  getFileList,
  getFileDetails,
  validateFiles,
  resetComponent,
  markFilesAsSaved
})
</script>

<style scoped lang="scss">
.upload-file-container {
  width: 100%;
}

.file-boxes-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.file-all-in-one-box {
  position: relative;
  width: 200px;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;

  &.is-empty {
    &:hover, &.is-hover {
    border-color: #409eff;
      background: #f0f9ff;
    }
  }
  
  &.is-selected {
    border-color: #409eff;
    border-style: solid;
    background: #fff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  }

  &.is-uploading {
    border-color: #409eff;
    border-style: solid;
    background: #f0f9ff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }

  &.is-uploaded {
    border-color: #67c23a;
    border-style: solid;
    background: #fff;
    box-shadow: 0 2px 8px rgba(103, 194, 58, 0.1);
    
    &:hover, &.is-hover {
      box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
      transform: translateY(-2px);
    }
  }

  &.is-error {
    border-color: #f56c6c;
    border-style: solid;
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
      font-size: 32px;
      color: #8c939d;
    margin-bottom: 12px;
      transition: color 0.3s ease;
      
      &.hover-blue {
      color: #409eff;
      }
    }
    
    .upload-text {
      color: #606266;
      font-size: 14px;
      text-align: center;
      line-height: 1.4;
      padding: 0 16px;
    }
  }

  // 已选择文件状态
  .selected-state {
      display: flex;
    flex-direction: column;
      align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 16px;
    
    .file-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
        color: #409eff;
      background: #ecf5ff;
      border-radius: 12px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
      max-width: 100%;
      padding: 0 8px;
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
