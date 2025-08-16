<template>
  <div class="static-img-upload">
    <el-upload :id="uuid" :accept="fileType.join(',')" :action="uploadUrl" :before-upload="beforeUpload"
      :class="['upload', drag ? 'no-border' : '', { 'is-uploading': uploading }]" :disabled="disabled || uploading"
      :drag="drag" :http-request="httpRequest" :multiple="false" :on-error="uploadError" :on-success="uploadSuccess"
      :on-change="handleFileChange" :show-file-list="false">
      <template v-if="modelValue && !uploading">
        <img :src="modelValue" class="upload-image" />
        <div class="upload-handle" @click.stop>
          <div v-if="!disabled" class="handle-icon" @click="editImg">
            <Icon icon="ep:edit" />
            <span v-if="showBtnText">{{ t('action.edit') }}</span>
          </div>
          <div class="handle-icon" @click="imagePreview(modelValue)">
            <Icon icon="ep:zoom-in" />
            <span v-if="showBtnText">{{ t('action.detail') }}</span>
          </div>
          <div v-if="showDelete && !disabled" class="handle-icon" @click="deleteImg">
            <Icon icon="ep:delete" />
            <span v-if="showBtnText">{{ t('action.del') }}</span>
          </div>
        </div>
      </template>
      <template v-else-if="uploading">
        <div class="upload-progress">
          <el-progress type="circle" :percentage="uploadProgress.percentage" :status="uploadProgress.status"
            :width="60" />
          <div class="progress-text">{{ getProgressText() }}</div>
          <el-button v-if="uploadProgress.status === 'info'" size="small" @click="cancelUpload">
            取消
          </el-button>
        </div>
      </template>
      <template v-else>
        <div class="upload-empty">
          <slot name="empty">
            <Icon icon="ep:plus" />
            <span>请选择图片</span>
          </slot>
          <div class="upload-hint">上传到 static 桶（匿名访问）</div>
        </div>
      </template>
    </el-upload>

    <!-- 文件名输入框 -->
    <div v-if="showCustomFileName && selectedFile && !uploading" class="file-name-input">
      <el-input v-model="customFileName" placeholder="请输入图片名称（可选，默认使用原文件名）" :disabled="uploading" clearable
        size="small">
        <template #prepend>图片名称</template>
      </el-input>
    </div>

    <div class="el-upload__tip">
      <slot name="tip">
        <div style="display: inline-block">
          <div style="font-size: 12px">
            大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
          </div>
          <div style="font-size: 12px">
            格式为 <b style="color: #f56c6c">jpg/png/gif/jpeg/webp</b> 的文件
          </div>
          <div v-if="tip" style="font-size: 12px">{{ tip }}</div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { UploadProps } from 'element-plus'
import { generateUUID } from '@/utils'
import { propTypes } from '@/utils/propTypes'
import { createImageViewer } from '@/components/ImageViewer'
import { useUpload } from '@/components/UploadFile/src/useUpload'

defineOptions({ name: 'StaticImgUpload' })

type FileTypes =
  | 'image/apng'
  | 'image/bmp'
  | 'image/gif'
  | 'image/jpeg'
  | 'image/pjpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/tiff'
  | 'image/webp'
  | 'image/x-icon'

// 接受父组件参数
const props = defineProps({
  modelValue: propTypes.string.def(''),
  drag: propTypes.bool.def(true), // 是否支持拖拽上传
  disabled: propTypes.bool.def(false), // 是否禁用上传组件
  fileSize: propTypes.number.def(5), // 图片大小限制
  fileType: propTypes.array.def(['.jpg', '.jpeg', '.png', '.gif', '.webp']), // 图片类型限制
  height: propTypes.string.def('150px'), // 组件高度
  width: propTypes.string.def('150px'), // 组件宽度
  borderradius: propTypes.string.def('8px'), // 组件边框圆角
  showDelete: propTypes.bool.def(true), // 是否显示删除按钮
  showBtnText: propTypes.bool.def(true), // 是否显示按钮文字
  showCustomFileName: propTypes.bool.def(false), // 是否显示自定义文件名输入框
  directory: propTypes.string.def(undefined), // 上传目录（静态文件不使用）
  tip: propTypes.string.def('') // 提示文字
})

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

// 生成组件唯一id
const uuid = ref('id-' + generateUUID())

// 响应式数据
const uploading = ref(false)
const selectedFile = ref(null)
const customFileName = ref('')
let cancelTokenSource: any = null

// 上传进度
const uploadProgress = ref({
  percentage: 0,
  status: 'info' as 'success' | 'exception' | 'warning' | 'info'
})

// 查看图片
const imagePreview = (imgUrl: string) => {
  createImageViewer({
    zIndex: 9999999,
    urlList: [imgUrl]
  })
}

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error', 'upload-progress'])

// 使用静态文件上传
const { uploadUrl, httpRequest: originalHttpRequest } = useUpload(props.directory, true)

// 增强的httpRequest
const httpRequest = async (options) => {
  const axios = (await import('axios')).default

  cancelTokenSource = axios.CancelToken.source()
  uploading.value = true

  uploadProgress.value = {
    percentage: 0,
    status: 'info'
  }

  const enhancedOptions = {
    ...options,
    cancelToken: cancelTokenSource.token,
    onProgress: (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        uploadProgress.value = {
          percentage,
          status: percentage === 100 ? 'success' : 'info'
        }

        emit('upload-progress', {
          percentage,
          loaded: progressEvent.loaded,
          total: progressEvent.total
        })
      }
    }
  }

  try {
    const result = await originalHttpRequest(enhancedOptions)
    uploadProgress.value.status = 'success'
    uploadProgress.value.percentage = 100
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

// 文件改变处理
const handleFileChange = (file) => {
  selectedFile.value = file

  // 如果没有自定义文件名，使用原文件名（去掉扩展名）
  if (!customFileName.value && file.name) {
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
    customFileName.value = nameWithoutExt
  }
}

// 删除图片
const deleteImg = () => {
  emit('update:modelValue', '')
  selectedFile.value = null
  customFileName.value = ''
  uploading.value = false
  uploadProgress.value = { percentage: 0, status: 'info' }
}

// 编辑图片
const editImg = () => {
  const uploadElement = document.getElementById(uuid.value)
  if (uploadElement) {
    const input = uploadElement.querySelector('input[type="file"]') as HTMLInputElement
    if (input) {
      input.click()
    }
  }
}

// 取消上传
const cancelUpload = () => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('用户取消上传')
    uploading.value = false
    uploadProgress.value = { percentage: 0, status: 'info' }
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

// 上传之前的钩子
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isValidType = props.fileType.includes(rawFile.type as FileTypes)
  const isValidSize = rawFile.size / 1024 / 1024 < props.fileSize

  if (!isValidType) {
    message.error('图片格式不正确!')
    return false
  }
  if (!isValidSize) {
    message.error(`图片大小不能超过${props.fileSize}MB!`)
    return false
  }

  message.success('正在上传静态图片，请稍候...')
  return true
}

// 上传成功的钩子
const uploadSuccess: UploadProps['onSuccess'] = (response) => {
  uploading.value = false

  setTimeout(() => {
    // 构造返回数据：{ 文件名: URL }
    const fileName = customFileName.value || selectedFile.value?.name || 'image'
    const result = {
      [fileName]: response.data
    }

    emit('upload-success', result)
    emit('update:modelValue', response.data)
    message.success('静态图片上传成功')

    // 重置状态
    selectedFile.value = null
    customFileName.value = ''
    uploadProgress.value = { percentage: 0, status: 'info' }
  }, 1000)
}

// 上传失败的钩子
const uploadError: UploadProps['onError'] = (error) => {
  uploading.value = false
  uploadProgress.value.status = 'exception'
  emit('upload-error', error)
  message.error('静态图片上传失败')
}
</script>

<style scoped lang="scss">
.static-img-upload {
  .file-name-input {
    margin-top: 12px;
  }

  .upload-hint {
    font-size: 12px;
    color: #67c23a;
    margin-top: 4px;
  }

  .upload-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;

    .progress-text {
      font-size: 12px;
      color: #606266;
    }
  }

  &.is-uploading {
    :deep(.el-upload) {
      cursor: not-allowed;
    }
  }
}

:deep(.upload) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: v-bind(width);
  height: v-bind(height);
  border: 1px dashed var(--el-border-color-darker);
  border-radius: v-bind(borderradius);
  cursor: pointer;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary);
  }

  &.no-border {
    border: none !important;
  }

  .upload-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-empty {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 30px;
    color: var(--el-color-info);

    .el-icon {
      font-size: 28px;
      color: var(--el-text-color-secondary);
    }
  }

  .upload-handle {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 60%);
    opacity: 0;
    transition: var(--el-transition-duration-fast);

    .handle-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      color: aliceblue;
      cursor: pointer;

      .el-icon {
        margin-bottom: 40%;
        font-size: 130%;
        line-height: 130%;
      }

      span {
        font-size: 85%;
        line-height: 85%;
      }
    }
  }

  &:hover .upload-handle {
    opacity: 1;
  }
}

.el-upload__tip {
  margin-top: 8px;
  text-align: center;
}
</style>
