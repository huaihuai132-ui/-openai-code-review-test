<template>
  <div class="static-img-upload">
    <!-- 文件全能框列表 -->
    <div class="file-box-list" :class="{ 'single-mode': maxFiles === 1 }">
      <div v-for="(box, index) in fileBoxes" :key="box.id" class="file-box" :class="{
        'empty': box.status === 'empty',
        'selected': box.status === 'selected',
        'uploading': box.status === 'uploading',
        'uploaded': box.status === 'uploaded',
        'error': box.status === 'error'
      }" @click="handleBoxClick(index)" @drop="handleDrop(index, $event)" @dragover.prevent @dragenter.prevent>
        <!-- 隐藏的文件输入框 -->
        <input :id="`${instanceId}-fileInput${index}`" type="file" :accept="fileType.join(',')"
          @change="handleFileSelect(index, $event)" style="display: none" :multiple="false" />

        <!-- 空状态 -->
        <div v-if="box.status === 'empty'" class="empty-state">
          <div class="upload-icon" :class="{ 'hover': box.hover }">
            ➕
          </div>
          <div class="upload-text">
            <span v-if="sequenceCode && sequenceInfo[index]">
              请上传 {{ sequenceInfo[index].sequenceFile }}
            </span>
            <span v-else>拖动或点击选择图片</span>
          </div>
        </div>

        <!-- 已选择状态 -->
        <div v-else-if="box.status === 'selected'" class="selected-state">
          <!-- 预览图片 -->
          <div class="image-preview">
            <img :src="getImagePreviewUrl(box.file!)" alt="预览图片" />
          </div>

          <!-- 文件信息和操作 -->
          <div class="file-info">
            <!-- 文件名编辑 -->
            <div class="file-name-section">
              <div v-if="!box.editing" class="file-name" @click="startEditName(index)">
                <span class="name-text">{{ box.displayName }}</span>
                <div class="edit-icon">✏️</div>
              </div>
              <div v-else class="file-name-edit">
                <el-input v-model="box.editingName" size="small" @blur="finishEditName(index)"
                  @keyup.enter="finishEditName(index)" @keyup.esc="cancelEditName(index)" ref="nameInput" />
                <div class="confirm-icon" @click="finishEditName(index)">✅</div>
              </div>
            </div>

            <!-- 上传按钮 -->
            <el-button type="primary" size="small" @click.stop="uploadFile(index)" :loading="false">
              上传图片
            </el-button>
          </div>

          <!-- 删除按钮 -->
          <div class="delete-btn" @click.stop="deleteFile(index)">
            <Icon icon="ep:close" />
          </div>
        </div>

        <!-- 上传中状态 -->
        <div v-else-if="box.status === 'uploading'" class="uploading-state">
          <!-- 进度圆环 -->
          <div class="progress-container" @mouseenter="box.showCancel = true" @mouseleave="box.showCancel = false">
            <el-progress type="circle" :percentage="box.progress || 0" :width="80" :stroke-width="6" />
            <!-- 取消按钮 -->
            <div v-if="box.showCancel" class="cancel-btn" @click.stop="cancelUpload(index)">
              <Icon icon="ep:close" />
            </div>
          </div>

          <!-- 上传信息 -->
          <div class="upload-info">
            <div class="upload-speed">{{ formatSpeed(box.speed || 0) }}</div>
            <div class="upload-time">剩余 {{ formatTime(box.remainingTime || 0) }}</div>
          </div>
        </div>

        <!-- 上传完成状态 -->
        <div v-else-if="box.status === 'uploaded'" class="uploaded-state">
          <!-- 显示图片 -->
          <div class="uploaded-image" @mouseenter="box.showPreview = true" @mouseleave="box.showPreview = false">
            <img :src="box.fileInfo.url" :alt="box.fileInfo.name" />

            <!-- 预览按钮 -->
            <div v-if="box.showPreview" class="preview-btn" @click.stop="handlePreview(index)">
              👁️
            </div>
          </div>

          <!-- 文件信息 -->
          <div class="file-info-uploaded">
            <div class="file-name">{{ box.fileInfo.name }}</div>
            <div class="file-size">{{ formatFileSize(box.fileInfo.size) }}</div>
          </div>

          <!-- 删除按钮 -->
          <div class="delete-btn" @click.stop="deleteFile(index)">
            ❌
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="box.status === 'error'" class="error-state">
          <div class="error-icon">❌</div>
          <div class="error-text">上传失败</div>
          <el-button size="small" @click.stop="retryUpload(index)">重试</el-button>
        </div>
      </div>
    </div>



    <!-- 提示信息 -->
    <div v-if="tip" class="upload-tip">
      {{ tip }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch, type PropType } from 'vue'

// 生成唯一实例ID
const instanceId = Math.random().toString(36).substring(2, 15)
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { generateUUID } from '@/utils'
import * as StaticFileApi from '@/api/infra/file/staticFile'
import { FileBusinessSequenceApi } from '@/api/infra/file/fileBusinessSequence'
import { createImageViewer } from '@/components/ImageViewer'

defineOptions({ name: 'StaticImgUpload' })

// 定义Props
const props = defineProps({
  fileList: {
    type: Array as PropType<number[]>,
    default: () => []
  },
  mode: {
    type: String as PropType<'create' | 'view' | 'edit'>,
    default: 'create'
  },
  sequenceCode: {
    type: String,
    default: ''
  },
  maxFiles: {
    type: Number,
    default: 1
  },
  directory: {
    type: String,
    default: 'images'
  },
  dir: {
    type: String,
    default: '/'
  },
  fileSize: {
    type: Number,
    default: 5 // MB
  },
  maxFileSize: {
    type: Number,
    default: 5 // MB
  },
  fileType: {
    type: Array as PropType<string[]>,
    default: () => ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  tip: {
    type: String,
    default: ''
  }
})

// 定义Emits
const emit = defineEmits(['update:fileList', 'delete'])

// 文件框状态类型
interface FileBox {
  id: string
  status: 'empty' | 'selected' | 'uploading' | 'uploaded' | 'error'
  file?: File
  displayName?: string
  editingName?: string
  editing?: boolean
  hover?: boolean
  progress?: number
  speed?: number
  remainingTime?: number
  showCancel?: boolean
  showPreview?: boolean
  fileInfo?: any
  uploadController?: AbortController
  isNewFile?: boolean
}

// 响应式数据
const fileBoxes = ref<FileBox[]>([])
const sequenceInfo = ref<any[]>([])





// 创建空的文件框
const createEmptyFileBox = (): FileBox => ({
  id: generateUUID(),
  status: 'empty',
  hover: false,
  progress: 0,
  speed: 0,
  remainingTime: 0,
  showCancel: false,
  showPreview: false,
  editing: false
})

// 初始化文件框
const initFileBoxes = async () => {
  console.log('初始化文件框, sequenceCode:', props.sequenceCode, 'fileList:', props.fileList)

  try {
    if (props.sequenceCode) {
      // 序列模式：根据序列配置创建固定数量的文件框
      console.log('使用序列模式，查询序列配置...')
      const response = await FileBusinessSequenceApi.getFileBusinessSequenceGroupListByCode(props.sequenceCode)
      console.log('序列查询响应:', response)

      let sequences = response.data || response
      console.log('序列数据 (处理前):', sequences)

      // 处理嵌套数组的情况
      if (Array.isArray(sequences) && sequences.length > 0 && Array.isArray(sequences[0])) {
        sequences = sequences[0]
        console.log('展开嵌套数组后的序列数据:', sequences)
      }

      sequenceInfo.value = sequences || []
      console.log('最终序列信息:', sequenceInfo.value)

      // 根据序列长度创建文件框
      const sequenceLength = sequenceInfo.value.length || 1
      console.log('创建', sequenceLength, '个序列文件框')

      fileBoxes.value = Array.from({ length: sequenceLength }, () => createEmptyFileBox())
    } else {
      // 普通模式：静态图片上传只支持单张图片
      console.log('使用普通模式，创建1个文件框（单图片模式）')
      fileBoxes.value = [createEmptyFileBox()]
    }

    // 如果有现有的文件列表，加载文件信息
    if (props.fileList && props.fileList.length > 0) {
      console.log('加载现有文件:', props.fileList)
      await loadExistingFiles()
    }

    console.log('文件框初始化完成:', fileBoxes.value)
  } catch (error) {
    console.error('初始化文件框失败:', error)
    ElMessage.error('初始化失败')
    // 出错时至少创建一个空文件框
    fileBoxes.value = [createEmptyFileBox()]
  }
}

// 加载现有文件
const loadExistingFiles = async () => {
  if (!props.fileList || props.fileList.length === 0) return

  try {
    console.log('加载现有文件，ID列表:', props.fileList)
    const response = await StaticFileApi.getStaticFilesByIds(props.fileList)
    console.log('文件详情响应:', response)

    const files = (response as any).data || response
    console.log('获取到的文件列表:', files)

    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        if (index < fileBoxes.value.length && file && typeof file.id === 'number') {
          fileBoxes.value[index] = {
            ...fileBoxes.value[index],
            status: 'uploaded',
            fileInfo: file,
            showPreview: false
          }
          console.log(`文件 ${index} 已加载:`, file)
        }
      })
    }
  } catch (error) {
    console.error('加载现有文件失败:', error)
    ElMessage.error('加载文件信息失败')
  }
}

// 文件框点击处理
const handleBoxClick = (index: number) => {
  if (props.mode === 'view') return

  const box = fileBoxes.value[index]
  if (box.status === 'empty') {
    // 触发文件选择
    const fileInput = document.getElementById(`${instanceId}-fileInput${index}`) as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }
}

// 拖拽处理
const handleDrop = (index: number, event: DragEvent) => {
  if (props.mode === 'view') return

  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileSelect(index, { target: { files } } as any)
  }
}

// 文件选择处理
const handleFileSelect = async (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  const file = files[0]
  console.log(`文件 ${index} 选择:`, file)

  // 验证文件
  if (!validateFile(file)) return

  // 更新文件框状态
  const box = fileBoxes.value[index]
  box.status = 'selected'
  box.file = file
  box.displayName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
  box.editingName = box.displayName
  box.editing = false
  box.isNewFile = true // 标记为新文件

  console.log(`文件框 ${index} 状态更新:`, box)

  // 自动上传
  await uploadFile(index)
}

// 文件验证
const validateFile = (file: File): boolean => {
  // 检查文件类型
  const isValidType = props.fileType.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase())
    }
    return file.type === type
  })

  if (!isValidType) {
    ElMessage.error(`只能上传 ${props.fileType.join(', ')} 格式的图片文件`)
    return false
  }

  // 检查文件大小
  const isValidSize = file.size / 1024 / 1024 <= props.fileSize
  if (!isValidSize) {
    ElMessage.error(`图片大小不能超过 ${props.fileSize}MB`)
    return false
  }

  return true
}

// 开始编辑名称
const startEditName = (index: number) => {
  const box = fileBoxes.value[index]
  box.editing = true
  nextTick(() => {
    const inputs = document.querySelectorAll(`[ref="nameInput"]`) as NodeListOf<HTMLInputElement>
    const input = inputs[index]
    if (input) {
      input.focus()
    }
  })
}

// 完成编辑名称
const finishEditName = (index: number) => {
  const box = fileBoxes.value[index]
  if (box.editingName && box.editingName.trim()) {
    box.displayName = box.editingName.trim()
  }
  box.editing = false
}

// 取消编辑名称
const cancelEditName = (index: number) => {
  const box = fileBoxes.value[index]
  box.editingName = box.displayName
  box.editing = false
}

// 上传文件
const uploadFile = async (index: number) => {
  const box = fileBoxes.value[index]
  if (!box.file) return

  console.log(`开始上传文件 ${index}:`, box.file)

  try {
    box.status = 'uploading'
    box.progress = 0
    box.showCancel = false
    box.uploadController = new AbortController()

    const startTime = Date.now()
    let lastTime = startTime
    let lastLoaded = 0

    // 获取预签名URL
    console.log('获取静态文件预签名URL...')
    const urlResponse = await StaticFileApi.getStaticFilePresignedUrl(box.file.name, props.directory)
    console.log('预签名URL响应:', urlResponse)

    const urlData = (urlResponse as any).data || urlResponse
    const presignedUrl = urlData.uploadUrl || urlData.url
    console.log('预签名URL:', presignedUrl)

    // 直接上传到MinIO
    console.log('上传文件到MinIO...')
    await axios.put(presignedUrl, box.file, {
      headers: {
        'Content-Type': box.file.type
      },
      signal: box.uploadController.signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          box.progress = percentage

          // 计算上传速度和剩余时间
          const currentTime = Date.now()
          const timeElapsed = (currentTime - lastTime) / 1000
          const bytesUploaded = progressEvent.loaded - lastLoaded

          if (timeElapsed > 0) {
            box.speed = bytesUploaded / timeElapsed
            const remainingBytes = progressEvent.total - progressEvent.loaded
            box.remainingTime = remainingBytes / box.speed

            lastTime = currentTime
            lastLoaded = progressEvent.loaded
          }
        }
      }
    })

    console.log('MinIO上传完成，保存文件记录...')

    // 调用后端保存文件记录
    const createResponse = await StaticFileApi.createStaticFile({
      configId: urlData.configId || 0, // 使用预签名响应中的configId
      name: box.displayName + (box.file.name.includes('.') ? box.file.name.substring(box.file.name.lastIndexOf('.')) : ''),
      path: urlData.path,
      url: urlData.url,
      type: box.file.type,
      size: box.file.size,
      dir: props.directory
    })

    console.log('保存文件记录响应:', createResponse)
    const fileInfo = (createResponse as any).data || createResponse
    console.log('文件信息:', fileInfo)

    // 验证文件ID
    const fileId = fileInfo.id
    if (!fileId || typeof fileId !== 'number') {
      console.error('文件ID无效:', fileId, typeof fileId)
      throw new Error('文件保存失败，未获取到有效的文件ID')
    }

    // 更新文件框状态
    box.status = 'uploaded'
    box.fileInfo = fileInfo
    box.progress = 100
    box.showPreview = false

    // 更新fileList并发出事件
    updateFileList()

    console.log(`文件 ${index} 上传成功，文件ID:`, fileId)
    ElMessage.success('图片上传成功')

  } catch (error) {
    console.error(`文件 ${index} 上传失败:`, error)

    if (axios.isCancel(error)) {
      box.status = 'selected'
      ElMessage.warning('上传已取消')
    } else {
      box.status = 'error'
      ElMessage.error('图片上传失败: ' + ((error as any).message || '未知错误'))
    }

    box.progress = 0
    box.speed = 0
    box.remainingTime = 0
  }
}

// 取消上传
const cancelUpload = (index: number) => {
  const box = fileBoxes.value[index]
  if (box.uploadController) {
    box.uploadController.abort()
  }
  box.status = 'selected'
  box.progress = 0
  box.speed = 0
  box.remainingTime = 0
  box.showCancel = false
}

// 重试上传
const retryUpload = (index: number) => {
  uploadFile(index)
}

// 删除文件
const deleteFile = async (index: number) => {
  const box = fileBoxes.value[index]
  console.log(`删除文件 ${index}, 状态:`, box.status, '文件信息:', box.fileInfo)

  try {
    if (box.status === 'uploaded' && box.fileInfo) {
      // 已上传的文件，需要调用删除接口
      const fileId = box.fileInfo.id
      console.log('调用静态文件删除接口，文件ID:', fileId, '类型:', typeof fileId)

      if (!fileId || typeof fileId !== 'number') {
        console.error('文件ID无效:', fileId)
        ElMessage.error('删除失败: 文件ID无效')
        return
      }

      await StaticFileApi.deleteStaticFile(fileId)
      console.log('静态文件删除成功')

      // 发出删除事件
      emit('delete', fileId)
    }

    // 静态图片上传是单图片模式，删除后重置为空状态
    Object.assign(box, createEmptyFileBox())
    console.log('重置文件框为空状态')

    // 更新fileList
    updateFileList()

    ElMessage.success('文件删除成功')
  } catch (error) {
    console.error('删除文件失败:', error)
    ElMessage.error('删除文件失败: ' + ((error as any).message || '未知错误'))
  }
}

// 预览文件
const handlePreview = (index: number) => {
  const box = fileBoxes.value[index]
  if (!box.fileInfo) return

  try {
    console.log('预览静态图片:', box.fileInfo)

    // 构建静态图片URL，使用fileInfo.url
    const imageUrl = box.fileInfo.url
    console.log('图片预览URL:', imageUrl)

    // 使用图片查看器预览
    createImageViewer({
      zIndex: 9999999,
      urlList: [imageUrl]
    })
  } catch (error) {
    console.error('预览图片失败:', error)
    ElMessage.error('预览图片失败')
  }
}



// 获取图片预览URL（用于选择后的预览）
const getImagePreviewUrl = (file: File) => {
  return URL.createObjectURL(file)
}



// 更新fileList
const updateFileList = () => {
  const fileList = fileBoxes.value
    .filter(box => box.status === 'uploaded' && box.fileInfo)
    .map(box => box.fileInfo.id)
    .filter(id => typeof id === 'number')

  console.log('更新fileList:', fileList)
  emit('update:fileList', fileList)
}



// 验证文件
const validateFiles = () => {
  const uploadedFile = fileBoxes.value.find(box => box.status === 'uploaded')
  if (!uploadedFile) {
    ElMessage.warning('请上传一张图片')
    return false
  }
  return true
}

// 工具函数
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond: number): string => {
  if (!bytesPerSecond) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '-- --'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// 暴露方法给父组件
defineExpose({
  validateFiles
})

// 生命周期
onMounted(() => {
  initFileBoxes()
})



// 监听fileList变化
watch(() => props.fileList, () => {
  if (props.mode !== 'create') {
    initFileBoxes()
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.static-img-upload {
  width: 100%;

  .file-box-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;

    &.single-mode {
      grid-template-columns: 1fr;
      max-width: 300px;
    }
  }

  .file-box {
    position: relative;
    width: 100%;
    min-height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    background-color: #fafbfc;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      border-color: #409eff;
      background-color: #f0f9ff;
    }

    &.empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    &.selected,
    &.uploading,
    &.uploaded {
      border-style: solid;
      background-color: #fff;
    }

    &.uploaded {
      border-color: #67c23a;
    }

    &.error {
      border-color: #f56c6c;
      background-color: #fef0f0;
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;

    .upload-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: #f0f0f0;
      color: #bbb;
      font-size: 24px;
      margin-bottom: 12px;
      transition: all 0.3s ease;

      &.hover {
        background-color: #409eff;
        color: white;
      }
    }

    .upload-text {
      font-size: 14px;
      color: #666;
      text-align: center;
      line-height: 1.4;
    }
  }

  // 已选择状态
  .selected-state {
    display: flex;
    flex-direction: column;
    height: 100%;

    .image-preview {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;

      img {
        max-width: 100%;
        max-height: 120px;
        object-fit: contain;
        border-radius: 4px;
      }
    }

    .file-info {
      padding: 12px;
      border-top: 1px solid #ebeef5;
      background-color: #f8f9fa;

      .file-name-section {
        margin-bottom: 8px;

        .file-name {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.3s ease;

          &:hover {
            background-color: #f0f0f0;
          }

          .name-text {
            flex: 1;
            font-size: 12px;
            color: #606266;
            word-break: break-all;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .edit-icon {
            margin-left: 4px;
            font-size: 12px;
            color: #909399;
          }
        }

        .file-name-edit {
          display: flex;
          align-items: center;
          gap: 4px;

          .el-input {
            flex: 1;
          }

          .confirm-icon {
            cursor: pointer;
            color: #67c23a;
            font-size: 14px;

            &:hover {
              color: #529b2e;
            }
          }
        }
      }
    }

    .delete-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #f56c6c;
      }
    }
  }

  // 上传中状态
  .uploading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;

    .progress-container {
      position: relative;
      margin-bottom: 16px;

      .cancel-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 30px;
        height: 30px;
        background-color: rgba(244, 67, 54, 0.8);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;

        &:hover {
          background-color: rgba(244, 67, 54, 1);
        }
      }
    }

    .upload-info {
      text-align: center;
      font-size: 12px;
      color: #666;

      .upload-speed,
      .upload-time {
        margin: 2px 0;
      }
    }
  }

  // 上传完成状态
  .uploaded-state {
    display: flex;
    flex-direction: column;
    height: 100%;

    .uploaded-image {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;

      img {
        max-width: 100%;
        max-height: 140px;
        object-fit: contain;
        border-radius: 4px;
      }

      .preview-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(0, 0, 0, 0.8);
          transform: translate(-50%, -50%) scale(1.1);
        }
      }
    }

    .file-info-uploaded {
      padding: 8px 12px;
      border-top: 1px solid #ebeef5;
      background-color: #f8f9fa;

      .file-name {
        font-size: 12px;
        color: #303133;
        font-weight: 500;
        margin-bottom: 2px;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-size {
        font-size: 11px;
        color: #909399;
      }
    }

    .delete-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #f56c6c;
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
    padding: 20px;

    .error-icon {
      font-size: 48px;
      color: #f56c6c;
      margin-bottom: 12px;
    }

    .error-text {
      font-size: 14px;
      color: #f56c6c;
      margin-bottom: 12px;
    }
  }



  // 提示信息
  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
    text-align: center;
  }
}
</style>
