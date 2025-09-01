<template>
  <Dialog title="联系我们详情" v-model="dialogVisible" width="600px" top="50px">
    <div v-loading="loading" class="py-6">
      <el-descriptions :column="2" border :size="'small'">
        <el-descriptions-item label="用户ID" :span="2">
          {{ formData.userId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人姓名" :span="2">
          {{ formData.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ formData.phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系邮箱">
          {{ formData.email || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <dict-tag :type="DICT_TYPE.OA_CONTACT_US_STATUS" :value="formData.status" />
        </el-descriptions-item>
        <el-descriptions-item label="部门编号">
          {{ formData.deptId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="留言内容" :span="2">
          <div class="whitespace-pre-wrap" v-html="formData.messageContent || '-'"></div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间"> 
          {{ (formData as any).createTime ? formatDate((formData as any).createTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ (formData as any).createBy || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="附件" :span="2">
          <div v-if="fileList.length > 0" class="flex flex-col gap-2">
            <div
              v-for="file in fileList"
              :key="file.id"
              class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
              @click="previewFile(file)"
            >
              <div class="flex items-center justify-center w-8 h-8 rounded bg-blue-100 text-blue-500">
                {{ getFileTypeIcon(file.name) }}
              </div>
              <span class="text-sm text-gray-700 truncate flex-1">{{ file.name }}</span>
              <el-icon class="text-gray-400"><View /></el-icon>
            </div>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import DictTag from '@/components/DictTag/src/DictTag.vue'
import { OaContactUsApi, OaContactUsVO } from '@/api/business/oacontactus'
import { View } from '@element-plus/icons-vue'
import * as FileApi from '@/api/infra/file'
import { base64Encode } from '@/utils'
import { useUserStore } from '@/store/modules/user'
import { openPreviewWindow } from '@/utils/previewWindow'

/** 联系我们详情 */
defineOptions({ name: 'OaContactUsDetail' })

const message = useMessage() // 消息弹窗
const userStore = useUserStore() // 用户信息

const dialogVisible = ref(false) // 弹窗的是否展示
const loading = ref(false) // 数据加载状态
const formData = ref<Partial<OaContactUsVO>>({}) // 表单数据
const fileList = ref<Array<{ id: number; name: string; url: string }>>([]) // 附件列表

// 固定域名，用于文件预览
const FIXED_DOMAIN = 'http://182.109.52.126:49090'

/** 获取文件类型图标 */
const getFileTypeIcon = (fileName: string) => {
  if (!fileName) return '📄'
  
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  
  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
    return '🖼️'
  }
  
  // PDF文档
  if (extension === 'pdf') {
    return '📕'
  }
  
  // Word文档
  if (['doc', 'docx', 'rtf'].includes(extension)) {
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

/** 预览文件 */
const previewFile = async (file: { id: number; name: string; url: string }) => {
  try {
    // 添加用户昵称参数
    const nickname = userStore.getUser?.nickname || ''

    // 获取文件下载URL
    const signedUrl = await FileApi.getDownloadUrl(file.id)
    // 构建文件访问URL，保持签名完整性
    const fileUrl = signedUrl + `&nickname=${nickname}`

    // 构建预览URL，使用utils中的base64Encode函数
    const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
    const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`

    console.log('预览URL:', previewUrl)

    // 使用预览工具类打开窗口
    openPreviewWindow(previewUrl, file.name)
  } catch (error) {
    console.error('预览文件失败:', error)
    message.error('预览文件失败')
  }
}

/** 打开详情弹窗 */
const open = async (id: number) => {
  loading.value = true
  try {
    const data = await OaContactUsApi.getOaContactUs(id)
    formData.value = data
    
    // 处理附件列表 - 安全地处理 fileList
    try {
      if (data.fileId) {
        let fileIds: (number | string)[] = []
        
        // 如果fileId是字符串，则按逗号分割并过滤空值
        if (typeof data.fileId === 'string') {
          const cleanFileList = data.fileId.replace(/^\[|\]$/g, '')
          fileIds = cleanFileList.split(',').map(id => id.trim()).filter(id => id !== '')
        } else if (Array.isArray(data.fileId)) {
          fileIds = data.fileId
        } else if (data.fileId) {
          // 如果是单个ID
          fileIds = [data.fileId]
        }
        
        // 如果有文件ID，则获取文件详情
        if (fileIds.length > 0) {
          const filesResponse = await FileApi.getFilesByIds(fileIds)
          const filesData = filesResponse.data || filesResponse
          
          if (Array.isArray(filesData)) {
            fileList.value = filesData.map(file => ({
              id: file.id,
              name: file.name,
              url: file.url
            }))
          }
        } else {
          fileList.value = []
        }
      } else {
        fileList.value = []
      }
    } catch (error) {
      console.warn('处理附件列表时出错:', error)
      fileList.value = []
    }
    
    dialogVisible.value = true
  } catch (error) {
    message.error('获取详情失败')
    console.error('获取联系我们详情失败:', error)
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>