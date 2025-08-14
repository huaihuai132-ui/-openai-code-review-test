<template>
  <div v-if="!disabled" class="upload-file">
        <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="uploadUrl"
      :auto-upload="autoUpload"
      :before-upload="beforeUpload"
      :disabled="disabled"
      :drag="drag"
      :http-request="httpRequest"
      :limit="props.limit"
      :multiple="props.limit > 1"
      :on-error="excelUploadError"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleFileSuccess"
      :class="`upload-file-uploader`"
      list-type="picture-card"
      name="file"
    >
      <!-- :show-file-list="true" -->
      <el-icon><Plus /></el-icon>
      <template v-if="isShowTip" #tip>
        <div style="font-size: 8px">
          大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
        </div>
        <div style="font-size: 8px">
          格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b> 的文件
        </div>
      </template>
        <template #file="row">
          <div class="file-item">
            <div class="file-icon">
              <el-icon :size="32">
                <component :is="getFileIcon(row.file.name)" />
              </el-icon>
            </div>
            <div class="file-name" :title="row.file.name">{{ row.file.name }}</div>
            <div class="file-actions">
              <el-link
                :href="row.file.url"
                :underline="false"
                download
                target="_blank"
                type="primary"
                size="small"
              >
                下载
              </el-link>
              <el-button link type="danger" size="small" @click="handleRemove(row.file)">
                删除
              </el-button>
            </div>
          </div>
        </template>
    </el-upload>
  </div>

            <!-- 上传操作禁用时 -->
    <div v-if="disabled" class="upload-file" :class="`layout-${layout}`">
      <div class="file-grid">
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
<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import type { UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from 'element-plus'
import { isString } from '@/utils/is'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { UploadFile } from 'element-plus/es/components/upload/src/upload'
import { 
  Document, 
  Grid, 
  Files, 
  DocumentCopy,
  Plus, 
  Document as PdfDocument 
} from '@element-plus/icons-vue'

defineOptions({ name: 'UploadFile' })

const message = useMessage() // 消息弹窗
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: propTypes.oneOfType<string | string[]>([String, Array<String>]).isRequired,
  fileType: propTypes.array.def(['doc', 'xls', 'ppt', 'txt', 'pdf']), // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileSize: propTypes.number.def(5), // 大小限制(MB)
  limit: propTypes.number.def(20), // 数量限制
  autoUpload: propTypes.bool.def(true), // 自动上传
  drag: propTypes.bool.def(false), // 拖拽上传
  isShowTip: propTypes.bool.def(true), // 是否显示提示
  disabled: propTypes.bool.def(false), // 是否禁用上传组件 ==> 非必传（默认为 false）
  directory: propTypes.string.def(undefined), // 上传目录 ==> 非必传（默认为 undefined）
  layout: propTypes.string.def('vertical-down') // 文件列表布局方向：vertical-down(垂直向下)、vertical-left(竖直向左)、vertical-right(竖直向右)
})

// ========== 上传相关 ==========
const uploadRef = ref<UploadInstance>()
const uploadList = ref<UploadUserFile[]>([])
const fileList = ref<UploadUserFile[]>([])
const uploadNumber = ref<number>(0)
const { uploadUrl, httpRequest } = useUpload(props.directory)

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
  if (fileList.value.length >= props.limit) {
    message.error(`上传文件数量不能超过${props.limit}个!`)
    return false
  }
  let fileExtension = ''
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
  }
  const isImg = props.fileType.some((type: string) => {
    if (file.type.indexOf(type) > -1) return true
    return !!(fileExtension && fileExtension.indexOf(type) > -1)
  })
  const isLimit = file.size < props.fileSize * 1024 * 1024
  if (!isImg) {
    message.error(`文件格式不正确, 请上传${props.fileType.join('/')}格式!`)
    return false
  }
  if (!isLimit) {
    message.error(`上传文件大小不能超过${props.fileSize}MB!`)
    return false
  }
  message.success('正在上传文件，请稍候...')
  uploadNumber.value++
}
// 文件上传成功
const handleFileSuccess: UploadProps['onSuccess'] = (res: any): void => {
  message.success('上传成功')
  // 删除自身
  const index = fileList.value.findIndex((item) => (item.response as any)?.data === (res as any).data)
  fileList.value.splice(index, 1)
  uploadList.value.push({ name: (res as any).data as string, url: (res as any).data as string })
  if (uploadList.value.length == uploadNumber.value) {
    fileList.value.push(...uploadList.value)
    uploadList.value = []
    uploadNumber.value = 0
    emitUpdateModelValue()
  }
}
// 文件数超出提示
const handleExceed: UploadProps['onExceed'] = (): void => {
  message.error(`上传文件数量不能超过${props.limit}个!`)
}
// 上传错误提示
const excelUploadError: UploadProps['onError'] = (): void => {
  message.error('导入数据失败，请您重新上传！')
}
// 删除上传文件
const handleRemove = (file: UploadFile) => {
  const index = fileList.value.map((f) => f.name).indexOf(file.name)
  if (index > -1) {
    fileList.value.splice(index, 1)
    emitUpdateModelValue()
  }
}
const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile)
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
const emitUpdateModelValue = () => {
  // 情况1：数组结果
  let result: string | string[] = fileList.value.map((file) => file.url!)
  // 情况2：逗号分隔的字符串
  if (props.limit === 1 || isString(props.modelValue)) {
    result = result.join(',')
  }
  emit('update:modelValue', result)
}
</script>
<style lang="scss" scoped>
.upload-file-uploader {
  margin-bottom: 5px;
}

// 统一卡片尺寸为 148x148
:deep(.el-upload--picture-card),
:deep(.el-upload-list__item) {
  width: 148px !important;
  height: 148px !important;
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

// 文件网格布局（禁用状态）
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 12px;
  padding: 8px 0;
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
            justify-content: center;
        }

        .file-btn {
            padding: 4px 8px;
            font-size: 11px;
            border-radius: 3px;
            border: none;
            cursor: pointer;
        }

        .download-btn {
            background-color: #e6f7ff;
            color: #1890ff;
        }

        .delete-btn {
            background-color: #fff1f0;
            color: #ff4d4f;
        }
</style>
