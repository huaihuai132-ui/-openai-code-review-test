<template>
  <div class="avatar-upload-container">
    <!-- 圆形头像上传区域 -->
    <div class="avatar-upload-box" :class="{ 'has-image': modelValue, 'uploading': uploading }" @click="handleClick"
      @drop="handleDrop" @dragover.prevent @dragenter.prevent>
      <!-- 已有头像显示 -->
      <div v-if="modelValue && !uploading" class="avatar-display">
        <img :src="modelValue" class="avatar-image" alt="头像" />
        <div class="avatar-overlay">
          <div class="overlay-icons">
            <div class="icon-btn" @click.stop="handlePreview">
              👁️
            </div>
            <div v-if="!disabled" class="icon-btn" @click.stop="handleEdit">
              ✏️
            </div>
            <div v-if="!disabled && showDelete" class="icon-btn" @click.stop="handleDelete">
              🗑️
            </div>
          </div>
        </div>
      </div>

      <!-- 上传中状态 -->
      <div v-else-if="uploading" class="avatar-uploading">
        <div class="upload-progress">
          <el-progress type="circle" :percentage="progress" :width="60" :stroke-width="4" />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="avatar-empty">
        <div class="empty-icon">📷</div>
        <div class="empty-text">上传头像</div>
      </div>

      <!-- 隐藏的文件输入 -->
      <input ref="fileInputRef" type="file" :accept="fileType.join(',')" style="display: none"
        @change="handleFileSelect" />
    </div>

    <!-- 提示信息 -->
    <div v-if="tip" class="upload-tip">{{ tip }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { createImageViewer } from '@/components/ImageViewer'
import * as StaticFileApi from '@/api/infra/file/staticFile'

defineOptions({ name: 'UploadImg' })

// 组件属性
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fileSize: {
    type: Number,
    default: 5 // MB
  },
  fileType: {
    type: Array as PropType<string[]>,
    default: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  size: {
    type: Number,
    default: 88 // 头像大小（像素）
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  directory: {
    type: String,
    default: 'avatars'
  },
  dir: {
    type: String,
    default: '/'
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  tip: {
    type: String,
    default: ''
  },
  maxFileSize: {
    type: Number,
    default: 5 // MB
  }
})
// 组件事件
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const fileInputRef = ref<HTMLInputElement>()
const uploading = ref(false)
const progress = ref(0)

// 处理点击事件
const handleClick = () => {
  if (props.disabled || uploading.value) return
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 验证文件
  if (!validateFile(file)) {
    target.value = '' // 清空输入
    return
  }

  // 开始上传
  uploadFile(file)
  target.value = '' // 清空输入，允许重新选择同一文件
}

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  if (props.disabled || uploading.value) return

  event.preventDefault()
  const files = event.dataTransfer?.files
  const file = files?.[0]

  if (!file) return

  if (!validateFile(file)) return

  uploadFile(file)
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

// 上传文件
const uploadFile = async (file: File) => {
  try {
    uploading.value = true
    progress.value = 0

    // 1. 获取静态文件预签名URL
    const presignedData = await StaticFileApi.getStaticFilePresignedUrl(file.name, props.directory)
    const urlData = (presignedData as any).data || presignedData

    // 2. 直传到MinIO
    const startTime = Date.now()
    await axios.put(urlData.uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })

    // 3. 创建静态文件记录
    const createFileData = {
      configId: urlData.configId || 0,
      name: file.name,
      path: urlData.path,
      url: urlData.url,
      type: file.type,
      size: file.size,
      dir: props.directory,
      fileSource: 1 // 个人文件（头像等）
    }

    const response = await StaticFileApi.createStaticFile(createFileData) as any
    console.log('头像上传-StaticFileApi.createStaticFile 返回结果:', response)

    // 4. 上传成功，直接返回文件URL
    uploading.value = false
    progress.value = 100

    // 直接使用文件URL，不返回文件ID
    emit('update:modelValue', urlData.url)
    ElMessage.success('头像上传成功')

  } catch (error) {
    console.error('头像上传失败:', error)
    uploading.value = false
    progress.value = 0
    ElMessage.error('头像上传失败，请重试')
  }
}

// 预览图片
const handlePreview = () => {
  if (!props.modelValue) return

  createImageViewer({
    zIndex: 9999999,
    urlList: [props.modelValue]
  })
}

// 编辑图片（重新选择）
const handleEdit = () => {
  fileInputRef.value?.click()
}

// 删除图片
const handleDelete = () => {
  emit('update:modelValue', '')
  ElMessage.success('头像已删除')
}
</script>

<style lang="scss" scoped>
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-upload-box {
  position: relative;
  width: v-bind('props.size + "px"');
  height: v-bind('props.size + "px"');
  border-radius: 50%;
  border: 2px dashed #d9d9d9;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;


  &:hover {
    border-color: #409eff;
    background-color: #f0f9ff;
  }

  &.has-image {
    border: none;
    background: none;
  }

  &.uploading {
    border-color: #409eff;
    cursor: not-allowed;
  }
}

.avatar-display {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }

    .overlay-icons {
      display: flex;
      gap: 8px;

      .icon-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;

        &:hover {
          background: white;
          transform: scale(1.1);
        }
      }
    }
  }
}

.avatar-uploading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .upload-progress {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.avatar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;

  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .empty-text {
    font-size: 12px;
    color: #666;
  }
}

.upload-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 4px;
}
</style>
