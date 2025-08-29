<template>
  <Dialog title="议题详情" v-model="dialogVisible" width="600px" top="50px">
    <div v-loading="loading" class="py-6">
      <el-descriptions :column="2" border :size="'small'">
        <el-descriptions-item label="议题编号" :span="2">
          {{ formData.issueNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="议题标题" :span="2">
          {{ formData.issueTitle || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="议题类型">
          <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="formData.issueType" />
        </el-descriptions-item>
        <el-descriptions-item label="上会类型">
          <dict-tag :type="DICT_TYPE.MEET_TYPE" :value="formData.meetingType" />
        </el-descriptions-item>
        <el-descriptions-item label="汇报人">
          {{ getUserName((formData as any).reporterId) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="相关部门">
          {{ getDeptNames((formData as any).relevantDept) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="议题状态">
          <dict-tag :type="DICT_TYPE.ISSUE_STATUS" :value="$attrs.issueStatus || formData.issueStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <dict-tag :type="DICT_TYPE.ISSUE_AUDIT_STATUS" :value="$attrs.status || formData.status" />
        </el-descriptions-item>
        <el-descriptions-item label="议题概述" :span="2">
          <div class="whitespace-pre-wrap">
            {{ formData.description || '-' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="议题详细内容" :span="2">
          <div class="whitespace-pre-wrap break-all">
            {{ formData.issueContent || '-' }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="创建时间"> 
          {{ (formData as any).createTime ? formatDate((formData as any).createTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ (formData as any).userName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="议题附件" :span="2">
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
        <!-- <el-descriptions-item label="更新时间">
          {{ formData.updateTime ? dateFormatter(formData.updateTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新人">
          {{ formData.updateBy || '-' }}
        </el-descriptions-item> -->
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {DICT_TYPE} from '@/utils/dict'
import DictTag from '@/components/DictTag/src/DictTag.vue'
import {OaMeetingIssueApi, OaMeetingIssueVO} from '@/api/business/oameetingissue'
import {formatDate} from '@/utils/formatTime'
import {View} from '@element-plus/icons-vue'
import * as FileApi from '@/api/infra/file'
import {base64Encode} from '@/utils'
import {useUserStore} from '@/store/modules/user'
import {openPreviewWindow} from '@/utils/previewWindow'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import {handleTree} from '@/utils/tree'
// 导入域名配置工具
import {getDomainUrl} from '@/utils/domainConfig'


/** 会议议题 详情 */
defineOptions({ name: 'OaMeetingIssueDetail' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const userStore = useUserStore() // 用户信息

const dialogVisible = ref(false) // 弹窗的是否展示
const loading = ref(false) // 数据加载状态
const formData = ref<Partial<OaMeetingIssueVO>>({}) // 表单数据
const fileList = ref<Array<{ id: number; name: string; url: string }>>([]) // 附件列表

// 用户列表
const userList = ref<any[]>([])

// 部门列表
const deptList = ref<Tree[]>([])

// 获取配置的域名
const FIXED_DOMAIN = getDomainUrl()

/** 获取用户列表 */
const getUserList = async () => {
  try {
    const data = await UserApi.getSimpleUserList()
    userList.value = data
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

/** 获取部门树 */
const getDeptList = async () => {
  try {
    const data = await DeptApi.getSimpleDeptList()
    deptList.value = handleTree(data)
    console.log(deptList.value)
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

/** 根据用户ID获取用户昵称 */
const getUserName = (userId: number | undefined) => {
  if (!userId) return ''
  const user = userList.value.find(u => u.id === userId)
  return user ? user.nickname : ''
}

/** 根据部门ID获取部门名称（支持多个部门） */
const getDeptNames = (deptIds: string | string[] | undefined) => {
  if (!deptIds) return '-'

  let ids: string[] = []

  // 统一处理输入为字符串或数组的情况
  if (typeof deptIds === 'string') {
    // 去除两边的方括号并按逗号分割
    ids = deptIds.replace(/[\[\]]/g, '').split(',').map(id => id.trim()).filter(Boolean)
  } else if (Array.isArray(deptIds)) {
    ids = deptIds.map(id => String(id))
  }

  if (ids.length === 0) return '-'

  // 递归查找树中的部门
  const findDeptInTree = (tree: Tree[], id: string): Tree | undefined => {
    for (const node of tree) {
      if (String(node.id) === id) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findDeptInTree(node.children, id)
        if (found) {
          return found
        }
      }
    }
    return undefined
  }

  const deptNames = ids.map(id => {
    const dept = findDeptInTree(deptList.value, id)
    return dept ? dept.name : `未知部门(${id})`
  })

  return deptNames.join(', ')
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

/** 打开详情弹窗 */
const open = async (id: number) => {
  loading.value = true
  try {
    // 获取用户列表和部门列表
    await Promise.all([getUserList(), getDeptList()])
    
    const data = await OaMeetingIssueApi.getOaMeetingIssue(id)
    formData.value = data
    
    // 处理附件列表 - 安全地处理 fileList
    try {
      if (data.fileList) {
        let fileIds: (number | string)[] = []
        
        // 如果fileList是字符串，则按逗号分割并过滤空值
        if (typeof data.fileList === 'string') {
          const cleanFileList = data.fileList.replace(/^\[|\]$/g, '')
          fileIds = cleanFileList.split(',').map(id => id.trim()).filter(id => id !== '')
        } else if (Array.isArray(data.fileList)) {
          fileIds = data.fileList
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
    console.error('获取议题详情失败:', error)
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
