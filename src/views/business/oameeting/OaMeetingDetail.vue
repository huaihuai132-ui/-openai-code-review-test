<template>
  <Dialog title="会议详情" v-model="dialogVisible" width="800px">
    <div v-loading="loading" class="py-10">
      <el-descriptions :column="2" border :size="'small'">
        <el-descriptions-item label="会议编号" :span="2">
          {{ formData.meetNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="会议名称" :span="2">
          {{ formData.meetName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="会议类型">
          <dict-tag :type="DICT_TYPE.MEET_TYPE" :value="formData.meetType" />
        </el-descriptions-item>
        <el-descriptions-item label="会议日期">
          {{ formData.meetDate ? formatDate(new Date(formData.meetDate)) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ formData.startTime ? formatDate(new Date(formData.startTime)) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ formData.endTime ? formatDate(new Date(formData.endTime)) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="会议室">
          {{ getMeetingRoomName(formData.meetRoomId) }}
        </el-descriptions-item>
        <el-descriptions-item label="会议事由" :span="2">
          <div class="whitespace-pre-wrap">
            {{ formData.reason || '-' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="会议概述" :span="2">
          <div class="whitespace-pre-wrap break-all">
            {{ formData.description || '-' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="会议状态">
          <dict-tag :type="DICT_TYPE.MEET_STATUS" :value="formData.status || 0" />
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ (formData as any).createTime ? formatDate(new Date((formData as any).createTime)) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="办会人">
          {{ (formData as any).userName || (formData as any).creator || '-' }}
        </el-descriptions-item>
        
        <!-- 参会人员 -->
        <el-descriptions-item label="参会人员" :span="2">
          <div v-if="attendeeList.length > 0" class="flex flex-wrap gap-2">
            <el-tag v-for="attendee in attendeeList" :key="attendee.id" type="info">
              {{ attendee.userName || attendee.name || '-' }}{{ (attendee.deptName || attendee.departmentName) ? `(${attendee.deptName || attendee.departmentName})` : '' }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <!-- 附件列表 -->
        <el-descriptions-item label="会议附件" :span="2">
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
        <!-- 会议议题 -->
        <el-descriptions-item label="会议议题" :span="2">
          <div v-if="issueList.length > 0" class="flex flex-col gap-2">
            <div 
              v-for="issue in issueList" 
              :key="issue.id"
              class="p-3 border rounded hover:bg-gray-50 cursor-pointer"
              @click="openIssueDetail(issue.id)"
            >
              <div class="font-medium">{{ issue.issueTitle || issue.title || '-' }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ issue.description || '-' }}</div>
            </div>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        

      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </Dialog>
  
  <!-- 议题详情弹窗 -->
  <OaMeetingIssueDetail ref="issueDetailRef" />
</template>

<script setup lang="ts">
import {DICT_TYPE} from '@/utils/dict'
import DictTag from '@/components/DictTag/src/DictTag.vue'
import {OaMeetingApi, OaMeetingVO} from '@/api/business/oameeting'
import {OaMeetingRoomApi} from '@/api/business/oameetingroom'
import {formatDate} from '@/utils/formatTime'
import {View} from '@element-plus/icons-vue'
import * as FileApi from '@/api/infra/file'
import {base64Encode} from '@/utils'
import {useUserStore} from '@/store/modules/user'
import {openPreviewWindow} from '@/utils/previewWindow'
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import OaMeetingIssueDetail from '@/views/business/oameetingissue/OaMeetingIssueDetail.vue'

/** 会议详情 */
defineOptions({ name: 'OaMeetingDetail' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const userStore = useUserStore() // 用户信息
const router = useRouter() // 路由实例

const dialogVisible = ref(false) // 弹窗的是否展示
const loading = ref(false) // 数据加载状态
const formData = ref<Partial<OaMeetingVO>>({}) // 表单数据
const fileList = ref<Array<{ id: number; name: string; url: string }>>([]) // 附件列表
const attendeeList = ref<any[]>([]) // 参会人员列表
const issueList = ref<any[]>([]) // 会议议题列表
const meetingRooms = ref<any[]>([]) // 会议室列表
const issueDetailRef = ref<InstanceType<typeof OaMeetingIssueDetail>>()

// 固定域名配置
const FIXED_DOMAIN = 'http://182.109.52.126:49090'

/** 获取会议室名称 */
const getMeetingRoomName = (roomId?: number) => {
  if (!roomId) return '-'
  const room = meetingRooms.value.find(item => item.id === roomId)
  return room ? `${room.roomName} - ${room.location}` : '-'
}

/** 获取文件类型图标 */
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

/** 预览文件 */
const previewFile = async (file: { id: number; name: string; url: string }) => {
  try {
    // 添加用户昵称参数
    const nickname = userStore.getUser?.nickname || ''

    // 获取文件下载URL
    const signedUrl = await FileApi.getDownloadUrl(file.id)
    // 构建文件访问URL，保持签名完整性
    const fileUrl = signedUrl + `&nickname=${nickname}`

    // 构建预览URL
    const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
    const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`

    // 使用预览工具类打开窗口
    openPreviewWindow(previewUrl, file.name)
  } catch (error) {
    console.error('预览文件失败:', error)
    message.error('预览文件失败')
  }
}

/** 打开议题详情 */
const openIssueDetail = (issueId: number) => {
  // 使用弹窗打开议题详情
  issueDetailRef.value?.open(issueId)
}

/** 获取会议室列表 */
const getMeetingRooms = async () => {
  try {
    const data = await OaMeetingRoomApi.getOaMeetingRoomPage({
      pageNo: 1,
      pageSize: 100
    })
    meetingRooms.value = data.list || []
  } catch (error) {
    console.error('获取会议室列表失败:', error)
  }
}

/** 打开详情弹窗 */
const open = async (id: number) => {
  loading.value = true
  try {
    // 并行获取数据 
    await Promise.all([
      getMeetingRooms(),
      OaMeetingApi.getOaMeeting(id)
    ]).then(async ([_, meetingData]) => {
      const processedData = { ...meetingData }
      
      // 处理日期和时间字段
      const processTimestamp = (value: any) => {
        if (value && value !== 0) {
          return typeof value === 'string' ? parseInt(value) : value
        }
        return undefined
      }
      
      processedData.meetDate = processTimestamp(processedData.meetDate)
      processedData.startTime = processTimestamp(processedData.startTime)
      processedData.endTime = processTimestamp(processedData.endTime)
      formData.value = processedData
      
      // 处理参会人员
      attendeeList.value = processedData.attendeeList || []
      
      // 处理会议议题
      issueList.value = processedData.issueList || []
      
      // 处理附件列表 - 安全地处理 fileList
      try {
        if (processedData.fileList) {
          let fileIds: (number | string)[] = []
          
          // 如果fileList是字符串，则按逗号分割并过滤空值
          if (typeof processedData.fileList === 'string') {
            // 处理类似 "[1958425949626216449]" 这样的格式
            let cleanFileList = processedData.fileList.trim()
            
            // 去除首尾的方括号
            if (cleanFileList.startsWith('[') && cleanFileList.endsWith(']')) {
              cleanFileList = cleanFileList.substring(1, cleanFileList.length - 1)
            }
            
            // 按逗号分割并处理每个ID
            if (cleanFileList) {
              fileIds = cleanFileList
                .split(',')
                .map(id => {
                  // 去除每个ID的首尾空格和引号
                  return id.trim().replace(/^["']|["']$/g, '')
                })
                .filter(id => id !== '') // 过滤空值
            }
          } else if (Array.isArray(processedData.fileList)) {
            fileIds = processedData.fileList
          }
          
          console.log('处理后的fileIds:', fileIds) // 调试信息
          
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
    })
    
    dialogVisible.value = true
  } catch (error) {
    message.error('获取详情失败')
    console.error('获取会议详情失败:', error)
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
