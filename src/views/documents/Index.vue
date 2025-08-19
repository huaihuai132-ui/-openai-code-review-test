<template>
  <div class="file-cabinet">
    <el-tabs v-model="activeTab" class="file-tabs">
      <!-- 个人文件柜 -->
      <el-tab-pane label="个人文件柜" name="personal">
        <ContentWrap>
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <el-button type="primary" @click="handleUpload">
                <Icon icon="ep:upload" class="mr-5px" /> 上传文件
              </el-button>
              <el-button @click="refreshPersonalFiles">
                <Icon icon="ep:refresh" class="mr-5px" /> 刷新
              </el-button>
              <el-button @click="toggleSelectMode" :type="isSelectMode ? 'primary' : ''">
                <Icon icon="ep:select" class="mr-5px" /> {{ isSelectMode ? '取消选择' : '批量选择' }}
              </el-button>
              <el-button @click="createFolder" v-if="false">
                <Icon icon="ep:folder-add" class="mr-5px" /> 新建文件夹
              </el-button>
            </div>
            <div class="toolbar-right">
              <!-- 搜索框 -->
              <div class="search-container">
                <el-autocomplete v-model="searchKeyword" :fetch-suggestions="searchFiles" placeholder="搜索文件..."
                  clearable @select="handleSearchSelect" @clear="handleSearchClear" class="search-input"
                  :trigger-on-focus="false">
                  <template #prefix>
                    <Icon icon="ep:search" class="search-icon" />
                  </template>
                  <template #default="{ item }">
                    <div class="search-item">
                      <div class="file-icon" style="font-size: 18px;">{{ getFileTypeIcon(item.name || '') }}</div>
                      <div class="file-info">
                        <div class="file-name">{{ item.name }}</div>
                        <div class="file-meta-row">
                          <span class="file-path">{{ item.dir || '/' }}</span>
                          <span class="file-size">{{ fileSizeFormatter(null, null, item.size) }}</span>
                          <span class="file-time">{{ dateFormatter(null, null, item.createTime) }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </el-autocomplete>

                <!-- 排序按钮 -->
                <div class="sort-buttons">
                  <el-button @click="toggleSort('time')" :type="sortBy === 'time' ? 'primary' : ''" size="small"
                    :title="sortBy === 'time' && sortOrder === 'desc' ? '按时间升序' : '按时间降序'">
                    <Icon :icon="sortBy === 'time' && sortOrder === 'desc' ? 'ep:sort-down' : 'ep:sort-up'" />
                  </el-button>
                  <el-button @click="toggleSort('name')" :type="sortBy === 'name' ? 'primary' : ''" size="small"
                    :title="sortBy === 'name' && sortOrder === 'desc' ? '按文件名升序' : '按文件名降序'">
                    <Icon icon="ep:sort" />
                  </el-button>
                </div>

              </div>
            </div>
          </div>

          <!-- 批量操作工具栏 -->
          <div v-if="isSelectMode && selectedFiles.length > 0" class="bulk-actions-bar">
            <div class="selected-count">
              已选择 {{ selectedFiles.length }} 个文件
            </div>
            <div class="bulk-actions">
              <el-button @click="selectAll" size="small">
                <Icon icon="ep:check" class="mr-5px" /> 全选
              </el-button>
              <el-button @click="clearSelection" size="small">
                <Icon icon="ep:close" class="mr-5px" /> 清空选择
              </el-button>
              <el-button @click="bulkDownload" type="primary" size="small">
                <Icon icon="ep:download" class="mr-5px" /> 批量下载
              </el-button>
              <el-button @click="bulkMove" size="small">
                <Icon icon="ep:folder" class="mr-5px" /> 批量移动
              </el-button>
              <el-button @click="bulkSetPublic" size="small">
                <Icon icon="ep:unlock" class="mr-5px" /> 设为公共
              </el-button>
              <el-button @click="bulkDelete" type="danger" size="small">
                <Icon icon="ep:delete" class="mr-5px" /> 批量删除
              </el-button>
            </div>
          </div>

          <!-- 面包屑导航 -->
          <div class="breadcrumb-nav">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item @click="navigateToFolder('')" class="breadcrumb-item">
                <Icon icon="ep:home-filled" class="mr-5px" />
                根目录
              </el-breadcrumb-item>
              <el-breadcrumb-item v-for="(folder, index) in breadcrumbFolders" :key="index"
                @click="navigateToFolder(folder.path)" class="breadcrumb-item">
                {{ folder.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <!-- 文件网格视图 -->
          <div v-loading="personalLoading" class="file-grid">
            <!-- 文件夹 -->
            <div v-for="folder in currentFolders" :key="'folder-' + folder.name" class="file-card folder-card"
              @dblclick="navigateToFolder(folder.path)"
              @contextmenu.prevent="showContextMenu($event, folder, 'folder')">
              <div class="file-icon-container">
                <div class="folder-icon"
                  style="font-size: 96px !important; display: flex !important; width: 96px !important; height: 96px !important; align-items: center !important; justify-content: center !important; line-height: 1;">
                  📁
                </div>
              </div>
              <div class="file-info">
                <div class="file-name" :title="folder.name">{{ folder.name }}</div>
                <div class="file-meta">文件夹</div>
              </div>
            </div>

            <!-- 文件 -->
            <div v-for="(file, index) in currentFiles" :key="'file-' + file.id" class="file-card"
              :class="{ selected: isFileSelected(file) }" @click="handleFileClick(file, index, $event)"
              @dblclick="previewFile(file)" @contextmenu.prevent="showContextMenu($event, file, 'file')"
              @mounted="console.log('文件:', file.name, '类型:', file.type, '配置ID:', file.configId)">
              <div class="file-icon-container">
                <!-- 选择复选框 -->
                <div v-if="isSelectMode" class="file-checkbox" @click.stop="toggleFileSelection(file)">
                  <el-checkbox :model-value="isFileSelected(file)" />
                </div>

                <el-image v-if="file.type && file.type.includes('image') && file.configId === 0" :src="file.url"
                  class="file-thumbnail" fit="cover" :preview-src-list="[file.url]" preview-teleported />
                <div v-else class="file-icon"
                  style="color: #409eff !important; font-size: 96px !important; display: flex !important; width: 96px !important; height: 96px !important; align-items: center !important; justify-content: center !important; line-height: 1;">
                  {{ getFileTypeIcon(file.name || '') }}
                </div>
              </div>
              <div class="file-info">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  <span>{{ fileSizeFormatter(null, null, file.size) }}</span>
                  <span class="file-date">{{ dateFormatter(null, null, file.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="!personalLoading && currentFiles.length === 0 && currentFolders.length === 0"
            description="当前文件夹为空" />
        </ContentWrap>
      </el-tab-pane>

      <!-- 公共文件柜 -->
      <el-tab-pane label="公共文件柜" name="public">
        <ContentWrap>
          <div class="toolbar">
            <el-button type="primary" @click="handlePublicUpload">
              <Icon icon="ep:upload" class="mr-5px" /> 上传公共文件
            </el-button>
            <el-button @click="refreshPublicFiles">
              <Icon icon="ep:refresh" class="mr-5px" /> 刷新
            </el-button>
          </div>

          <div v-loading="publicLoading" class="file-grid">
            <div v-for="file in publicFiles" :key="'public-' + file.id" class="file-card" @dblclick="previewFile(file)"
              @contextmenu.prevent="showContextMenu($event, file, 'public-file')">
              <div class="file-icon-container">
                <el-image v-if="file.type && file.type.includes('image') && file.configId === 0" :src="file.url"
                  class="file-thumbnail" fit="cover" :preview-src-list="[file.url]" preview-teleported />
                <div v-else class="file-icon"
                  style="color: #409eff !important; font-size: 96px !important; display: flex !important; width: 96px !important; height: 96px !important; align-items: center !important; justify-content: center !important; line-height: 1;">
                  {{ getFileTypeIcon(file.name || '') }}
                </div>
              </div>
              <div class="file-info">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  <span>{{ fileSizeFormatter(null, null, file.size) }}</span>
                  <span class="file-date">{{ dateFormatter(null, null, file.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>

          <el-empty v-if="!publicLoading && publicFiles.length === 0" description="暂无公共文件" />
        </ContentWrap>
      </el-tab-pane>
    </el-tabs>

    <!-- 右键菜单 -->
    <div v-show="contextMenuVisible" :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      class="context-menu" @click.stop>
      <div v-if="contextMenuType === 'file'" class="menu-items">
        <div class="menu-item" @click="previewFile(contextMenuTarget)">
          <Icon icon="ep:view" class="menu-icon" />
          预览
        </div>
        <div class="menu-item" @click="downloadFile(contextMenuTarget)">
          <Icon icon="ep:download" class="menu-icon" />
          下载
        </div>
        <div class="menu-item" @click="shareFile(contextMenuTarget)">
          <Icon icon="ep:share" class="menu-icon" />
          分享
        </div>
        <div class="menu-item" @click="showMoveDialog(contextMenuTarget)">
          <Icon icon="ep:folder" class="menu-icon" />
          移动
        </div>
        <div class="menu-item" @click="showRenameDialog(contextMenuTarget)">
          <Icon icon="ep:edit-pen" class="menu-icon" />
          重命名
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" @click="setFileAsPublic(contextMenuTarget)">
          <Icon icon="ep:unlock" class="menu-icon" />
          设为公共
        </div>
        <div class="menu-item danger" @click="deleteFile(contextMenuTarget)">
          <Icon icon="ep:delete" class="menu-icon" />
          删除
        </div>
      </div>
      <div v-else-if="contextMenuType === 'folder'" class="menu-items">
        <div class="menu-item" @click="navigateToFolder(contextMenuTarget.path)">
          <Icon icon="ep:folder-opened" class="menu-icon" />
          打开
        </div>
        <div class="menu-item" @click="showRenameFolderDialog(contextMenuTarget)">
          <Icon icon="ep:edit" class="menu-icon" />
          重命名
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item danger" @click="deleteFolder(contextMenuTarget)">
          <Icon icon="ep:delete" class="menu-icon" />
          删除文件夹
        </div>
      </div>
      <div v-else-if="contextMenuType === 'public-file'" class="menu-items">
        <div class="menu-item" @click="previewFile(contextMenuTarget)">
          <Icon icon="ep:view" class="menu-icon" />
          预览
        </div>
        <div class="menu-item" @click="downloadFile(contextMenuTarget)">
          <Icon icon="ep:download" class="menu-icon" />
          下载
        </div>
      </div>
    </div>

    <!-- 个人文件上传弹窗 -->
    <el-dialog v-model="uploadVisible" title="上传文件" width="600px">
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="上传目录">
          <el-select v-model="uploadForm.targetDir" placeholder="选择上传目录或输入新目录" filterable allow-create clearable
            style="width: 100%">
            <el-option label="根目录 (/)" value="">
              <div class="folder-option">
                <Icon icon="ep:home-filled" class="folder-icon" />
                <span>根目录</span>
              </div>
            </el-option>
            <el-option v-for="folder in allFolders" :key="folder.path" :label="folder.path" :value="folder.path">
              <div class="folder-option">
                <Icon icon="ep:folder" class="folder-icon" />
                <span>{{ folder.path }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <UploadFile ref="uploadFileRef" v-model="uploadFileUrl" :drag="true"
        :file-type="['jpg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar']" :file-size="50"
        :show-custom-file-name="true" :directory="'documents'" :dir="uploadForm.targetDir"
        @upload-success="handleUploadSuccess" @upload-error="handleUploadError" />
      <template #footer>
        <el-button @click="uploadVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 公共文件上传弹窗 -->
    <el-dialog v-model="publicUploadVisible" title="上传公共文件" width="600px">
      <UploadFile ref="publicUploadRef" v-model="publicUploadFileUrl" :drag="true"
        :file-type="['jpg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar']" :file-size="50"
        :show-custom-file-name="true" directory="public" @upload-success="handlePublicUploadSuccess"
        @upload-error="handlePublicUploadError" />
      <template #footer>
        <el-button @click="publicUploadVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 文件分享弹窗 -->
    <el-dialog v-model="shareVisible" title="分享文件" width="400px">
      <el-form :model="shareForm" label-width="80px">
        <el-form-item label="用户ID">
          <el-input v-model="shareForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select v-model="shareForm.permission" placeholder="请选择权限">
            <el-option label="只读" :value="1" />
            <el-option label="可写" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker v-model="shareForm.expiredTime" type="datetime" placeholder="选择到期时间，留空表示永久有效"
            format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shareVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShare">确认分享</el-button>
      </template>
    </el-dialog>

    <!-- 移动文件弹窗 -->
    <el-dialog v-model="moveDialogVisible" title="移动文件到目录" width="500px">
      <el-form :model="moveForm" label-width="80px">
        <el-form-item label="目标目录">
          <el-select v-model="moveForm.targetDir" placeholder="选择目标目录或输入新目录" filterable allow-create clearable
            style="width: 100%">
            <el-option label="根目录 (/)" value="">
              <div class="folder-option">
                <Icon icon="ep:home-filled" class="folder-icon" />
                <span>根目录</span>
              </div>
            </el-option>
            <el-option v-for="folder in allFolders" :key="folder.path" :label="folder.path" :value="folder.path">
              <div class="folder-option">
                <Icon icon="ep:folder" class="folder-icon" />
                <span>{{ folder.path }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="move-tips">
            <Icon icon="ep:info-filled" class="tip-icon" />
            <span>可以选择现有目录，也可以输入新的目录路径</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMove">确认移动</el-button>
      </template>
    </el-dialog>

    <!-- 重命名文件弹窗 -->
    <el-dialog v-model="renameDialogVisible" title="重命名文件" width="450px" @opened="focusFileNameInput">
      <el-form :model="renameForm" label-width="80px">
        <el-form-item label="文件名">
          <el-row :gutter="8">
            <el-col :span="16">
              <el-input ref="fileNameInputRef" v-model="renameForm.fileName" placeholder="请输入文件名"
                @keyup.enter="confirmRename" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="renameForm.fileExtension" placeholder="扩展名" @keyup.enter="confirmRename">
                <template #prepend>.</template>
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRename" :disabled="!renameForm.fileName.trim()">确认重命名</el-button>
      </template>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { UploadFile } from '@/components/UploadFile'
import { fileSizeFormatter } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import * as FileApi from '@/api/infra/file/index'
import { useUserStore } from '@/store/modules/user'
import { useMessage } from '@/hooks/web/useMessage'

defineOptions({ name: 'FileCabinet' })

const message = useMessage()
const userStore = useUserStore()

// 固定域名配置
const FIXED_DOMAIN = 'http://182.109.52.126:49090'

// Base64编码函数
const base64Encode = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  }))
}

// 标签页
const activeTab = ref('personal')

// 个人文件
const personalLoading = ref(false)
const personalFiles = ref<any[]>([])

// 公共文件
const publicLoading = ref(false)
const publicFiles = ref<any[]>([])

// 当前路径和文件夹结构
const currentPath = ref('')
const allFolders = ref<any[]>([])

// 搜索相关
const searchKeyword = ref('')
const searchResults = ref<any[]>([])

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuTarget = ref<any>(null)
const contextMenuType = ref('')

// 移动文件弹窗
const moveDialogVisible = ref(false)
const moveFileTarget = ref<any>(null)
const moveForm = ref({
  targetDir: ''
})

// 重命名文件弹窗
const renameDialogVisible = ref(false)
const renameFileTarget = ref<any>(null)
const renameForm = ref({
  fileName: '',
  fileExtension: ''
})
const fileNameInputRef = ref()





// 批量操作
const selectedFiles = ref<any[]>([])
const isSelectMode = ref(false)

// 排序相关
const sortBy = ref('time') // 'time' | 'name'
const sortOrder = ref('desc') // 'asc' | 'desc'

// 快捷键状态
const isCtrlPressed = ref(false)
const isShiftPressed = ref(false)
const lastSelectedIndex = ref(-1)

// 个人文件上传
const uploadVisible = ref(false)
const uploadFileUrl = ref('')
const uploadForm = ref({
  targetDir: ''
})
const uploadFileRef = ref()

// 公共文件上传
const publicUploadVisible = ref(false)
const publicUploadFileUrl = ref('')
const publicUploadRef = ref()

// 文件分享
const shareVisible = ref(false)
const shareForm = ref({
  fileId: 0,
  userId: '',
  permission: 1,
  expiredTime: ''
})

// 计算属性：面包屑导航
const breadcrumbFolders = computed(() => {
  if (!currentPath.value) return []
  const parts = currentPath.value.split('/').filter(Boolean)
  const folders: any[] = []
  let path = ''

  parts.forEach(part => {
    path += (path ? '/' : '') + part
    folders.push({
      name: part,
      path: path
    })
  })

  return folders
})

// 计算属性：当前文件夹下的文件夹
const currentFolders = computed(() => {
  const folders = new Set<string>()

  personalFiles.value.forEach(file => {
    const fileDir = file.dir || ''

    // 如果当前在根目录
    if (!currentPath.value) {
      if (fileDir && !fileDir.startsWith('/')) {
        const firstFolder = fileDir.split('/')[0]
        if (firstFolder) {
          folders.add(firstFolder)
        }
      }
    } else {
      // 如果当前在子目录
      if (fileDir.startsWith(currentPath.value + '/')) {
        const relativePath = fileDir.substring(currentPath.value.length + 1)
        const firstFolder = relativePath.split('/')[0]
        if (firstFolder) {
          folders.add(firstFolder)
        }
      }
    }
  })

  return Array.from(folders).map(name => ({
    name,
    path: currentPath.value ? `${currentPath.value}/${name}` : name
  }))
})

// 计算属性：当前文件夹下的文件
const currentFiles = computed(() => {
  let files = personalFiles.value.filter(file => {
    const fileDir = file.dir || ''

    // 如果当前在根目录，显示dir为空或者为'/'的文件
    if (!currentPath.value) {
      return !fileDir || fileDir === '/' || fileDir === ''
    }

    // 如果当前在子目录，显示dir完全匹配当前路径的文件
    return fileDir === currentPath.value
  })

  // 排序逻辑
  return files.sort((a, b) => {
    if (sortBy.value === 'time') {
      const timeA = new Date(a.createTime).getTime()
      const timeB = new Date(b.createTime).getTime()
      return sortOrder.value === 'desc' ? timeB - timeA : timeA - timeB
    } else if (sortBy.value === 'name') {
      const nameA = a.name.toLowerCase()
      const nameB = b.name.toLowerCase()
      if (sortOrder.value === 'desc') {
        return nameB.localeCompare(nameA)
      } else {
        return nameA.localeCompare(nameB)
      }
    }
    return 0
  })
})

// 获取个人文件列表
const getPersonalFiles = async () => {
  personalLoading.value = true
  try {
    const response = await FileApi.getUserVisibleFiles()

    // 处理API响应：检查是否直接返回数组还是标准格式
    if (Array.isArray(response)) {
      personalFiles.value = response
    } else if (response && response.code === 0 && response.data) {
      personalFiles.value = response.data
    } else {
      personalFiles.value = []
    }

    // 构建所有文件夹列表
    buildAllFolders()
  } catch (error) {
    console.error('获取个人文件失败:', error)
    message.error('获取个人文件失败')
    personalFiles.value = []
  } finally {
    personalLoading.value = false
  }
}

// 构建所有文件夹列表
const buildAllFolders = () => {
  const folders = new Set<string>()

  personalFiles.value.forEach(file => {
    const fileDir = file.dir || ''
    if (fileDir && fileDir !== '/') {
      // 添加所有层级的文件夹
      const parts = fileDir.split('/').filter(Boolean)
      let path = ''
      parts.forEach(part => {
        path += (path ? '/' : '') + part
        folders.add(path)
      })
    }
  })

  allFolders.value = Array.from(folders).map(path => ({
    name: path.split('/').pop() || path,
    path: path
  }))
}

// 获取公共文件列表
const getPublicFiles = async () => {
  publicLoading.value = true
  try {
    const response = await FileApi.getPublicFiles()

    // 处理API响应：检查是否直接返回数组还是标准格式
    if (Array.isArray(response)) {
      publicFiles.value = response
    } else if (response && response.code === 0 && response.data) {
      publicFiles.value = response.data
    } else {
      publicFiles.value = []
    }
  } catch (error) {
    console.error('获取公共文件失败:', error)
    message.error('获取公共文件失败')
    publicFiles.value = []
  } finally {
    publicLoading.value = false
  }
}

// 导航到指定文件夹
const navigateToFolder = (path: string) => {
  currentPath.value = path
  hideContextMenu()
}

// 搜索文件
const searchFiles = (queryString: string, callback: Function) => {
  if (!queryString) {
    callback([])
    return
  }

  // 在已有的文件列表中搜索
  const results = personalFiles.value.filter(file => {
    return file.name.toLowerCase().includes(queryString.toLowerCase())
  }).map(file => ({
    ...file,
    value: file.name, // 用于autocomplete显示
    label: file.name  // 用于autocomplete显示
  }))

  callback(results)
}



// 处理搜索选择
const handleSearchSelect = (item: any) => {
  // 跳转到文件所在目录
  if (item.dir) {
    navigateToFolder(item.dir)
  }
  // 清空搜索框
  searchKeyword.value = ''
}

// 清空搜索
const handleSearchClear = () => {
  searchResults.value = []
}

// 显示右键菜单
const showContextMenu = (event: MouseEvent, target: any, type: string) => {
  event.preventDefault()
  contextMenuTarget.value = target
  contextMenuType.value = type
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true

  // 点击其他地方隐藏菜单
  nextTick(() => {
    document.addEventListener('click', hideContextMenu)
  })
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenuVisible.value = false
  document.removeEventListener('click', hideContextMenu)
}

// 获取文件图标和颜色
const getFileIcon = (type: string) => {
  // 如果没有类型或类型为空，返回默认文档图标
  if (!type || type.trim() === '' || type === null || type === undefined) {
    return { icon: 'ep:document', color: '#718096' }
  }

  const lowerType = type.toLowerCase().trim()

  // 图片文件
  if (lowerType.includes('image') ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif)$/i.test(lowerType)) {
    if (lowerType.includes('svg')) {
      return { icon: 'ep:picture', color: '#FF6B35' }
    }
    return { icon: 'ep:picture', color: '#67C23A' }
  }

  // PDF文件
  if (lowerType.includes('pdf') || lowerType.endsWith('.pdf')) {
    return { icon: 'ep:document', color: '#E53E3E' }
  }

  // Microsoft Office 文档
  if (lowerType.includes('word') || /\.(doc|docx)$/i.test(lowerType)) {
    return { icon: 'ep:edit-pen', color: '#2B579A' }
  }

  if (lowerType.includes('excel') || lowerType.includes('sheet') ||
    /\.(xlsx|xls|xlsm|xlsb)$/i.test(lowerType)) {
    return { icon: 'ep:data-analysis', color: '#217346' }
  }

  if (lowerType.includes('powerpoint') || lowerType.includes('presentation') ||
    /\.(ppt|pptx|pps|ppsx)$/i.test(lowerType)) {
    return { icon: 'ep:monitor', color: '#D24726' }
  }

  // Google Docs 系列
  if (lowerType.includes('google') && lowerType.includes('doc')) {
    return { icon: 'ep:edit-pen', color: '#4285F4' }
  }
  if (lowerType.includes('google') && lowerType.includes('sheet')) {
    return { icon: 'ep:data-analysis', color: '#34A853' }
  }
  if (lowerType.includes('google') && lowerType.includes('slide')) {
    return { icon: 'ep:monitor', color: '#FBBC04' }
  }

  // 数据文件
  if (/\.(csv|tsv|dat)$/i.test(lowerType)) {
    return { icon: 'ep:data-board', color: '#38A169' }
  }

  // 文本和标记语言文件
  if (lowerType.includes('text') || /\.(txt|rtf)$/i.test(lowerType)) {
    return { icon: 'ep:document-copy', color: '#718096' }
  }

  if (/\.(md|markdown)$/i.test(lowerType)) {
    return { icon: 'ep:edit', color: '#319795' }
  }

  if (/\.(log|logs)$/i.test(lowerType)) {
    return { icon: 'ep:document-checked', color: '#A0AEC0' }
  }

  // 压缩文件
  if (/\.(zip|rar|7z|tar|gz|bz2|xz|dmg|iso)$/i.test(lowerType)) {
    return { icon: 'ep:files', color: '#D69E2E' }
  }

  // 视频文件
  if (lowerType.includes('video') ||
    /\.(mp4|avi|mov|wmv|flv|mkv|webm|m4v|3gp|f4v|asf|rm|rmvb)$/i.test(lowerType)) {
    return { icon: 'ep:video-play', color: '#E53E3E' }
  }

  // 音频文件
  if (lowerType.includes('audio') ||
    /\.(mp3|wav|flac|aac|ogg|wma|m4a|opus|ape|ac3|amr)$/i.test(lowerType)) {
    return { icon: 'ep:headphones', color: '#3182CE' }
  }

  // 代码文件
  if (/\.(js|jsx|ts|tsx)$/i.test(lowerType)) {
    return { icon: 'ep:document-checked', color: '#F7DF1E' }
  }

  if (/\.(html|htm|xhtml)$/i.test(lowerType)) {
    return { icon: 'ep:document-checked', color: '#E34F26' }
  }

  if (/\.(css|scss|sass|less|stylus)$/i.test(lowerType)) {
    return { icon: 'ep:document-checked', color: '#1572B6' }
  }

  if (/\.(json|xml|yml|yaml|toml)$/i.test(lowerType)) {
    return { icon: 'ep:data-line', color: '#805AD5' }
  }

  if (/\.(py|python)$/i.test(lowerType)) {
    return { icon: 'ep:document-checked', color: '#3776AB' }
  }

  if (/\.(java|jar)$/i.test(lowerType)) {
    return { icon: 'ep:document-checked', color: '#ED8B00' }
  }

  if (/\.(php|php3|php4|php5|phtml)$/i.test(lowerType)) {
    return { icon: 'ep:document-checked', color: '#777BB4' }
  }

  if (/\.(cpp|c\+\+|cc|cxx|c)$/i.test(lowerType)) {
    return { icon: 'ep:document-checked', color: '#00599C' }
  }

  if (/\.(sql|mysql|postgresql|sqlite)$/i.test(lowerType)) {
    return { icon: 'ep:coin', color: '#336791' }
  }

  if (/\.(sh|bash|zsh|fish|bat|cmd|ps1)$/i.test(lowerType)) {
    return { icon: 'ep:operation', color: '#4EAA25' }
  }

  // 设计文件
  if (/\.(psd|ai|sketch|xd|figma)$/i.test(lowerType)) {
    return { icon: 'ep:brush', color: '#FF61F6' }
  }

  // CAD 文件
  if (/\.(dwg|dxf|step|iges|stl)$/i.test(lowerType)) {
    return { icon: 'ep:setting', color: '#FF8C00' }
  }

  // 电子书
  if (/\.(epub|mobi|azw|azw3|fb2)$/i.test(lowerType)) {
    return { icon: 'ep:reading', color: '#8B4513' }
  }

  // 字体文件
  if (/\.(ttf|otf|woff|woff2|eot)$/i.test(lowerType)) {
    return { icon: 'ep:postcard', color: '#2D3748' }
  }

  // 可执行文件
  if (/\.(exe|msi|dmg|deb|rpm|appimage|app)$/i.test(lowerType)) {
    return { icon: 'ep:cpu', color: '#2D3748' }
  }

  // 配置文件
  if (/\.(ini|conf|config|cfg|env)$/i.test(lowerType)) {
    return { icon: 'ep:tools', color: '#4A5568' }
  }

  // 其他常见文件类型
  if (lowerType.includes('certificate') || /\.(crt|pem|p12|pfx)$/i.test(lowerType)) {
    return { icon: 'ep:lock', color: '#38A169' }
  }

  // 默认文档 - 确保有图标显示
  return { icon: 'ep:document', color: '#718096' }
}

// 确保获取图标函数永远不会返回空值
const getSafeFileIcon = (type: string) => {
  try {
    const result = getFileIcon(type)
    if (!result || !result.icon) {
      return { icon: 'ep:document', color: '#718096' }
    }
    return result
  } catch (error) {
    console.warn('获取文件图标失败:', error, 'type:', type)
    return { icon: 'ep:document', color: '#718096' }
  }
}

// 根据文件名获取对应的emoji图标
const getFileTypeIcon = (fileName: string) => {
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

// 刷新个人文件
const refreshPersonalFiles = () => {
  getPersonalFiles()
}

// 刷新公共文件
const refreshPublicFiles = () => {
  getPublicFiles()
}

// 切换排序方式
const toggleSort = (type: 'time' | 'name') => {
  if (sortBy.value === type) {
    // 如果是同一种排序方式，切换升序/降序
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    // 如果是不同排序方式，设置为新的排序方式，默认降序
    sortBy.value = type
    sortOrder.value = 'desc'
  }
}

// 获取静态图片URL
// const getStaticImageUrl = (path: string) => {
//   if (!path) return ''
//   // 拼接minio静态桶地址
//   return `http://182.109.52.126:49090/minio/static/${path}`
// }

// 处理个人文件上传
const handleUpload = () => {
  uploadForm.value.targetDir = currentPath.value
  uploadVisible.value = true
}

// 显示移动文件对话框
const showMoveDialog = (file: any) => {
  moveFileTarget.value = file
  moveForm.value.targetDir = ''
  moveDialogVisible.value = true
  hideContextMenu()
}

// 确认移动文件
const confirmMove = async () => {
  if (!moveFileTarget.value) return

  try {
    await FileApi.moveFile(moveFileTarget.value.id, moveForm.value.targetDir)
    message.success('文件移动成功！')
    moveDialogVisible.value = false
    refreshPersonalFiles()
  } catch (error) {
    console.error('移动文件失败:', error)
    message.error('移动文件失败')
  }
}

// 显示重命名文件对话框
const showRenameDialog = (file: any) => {
  renameFileTarget.value = file

  // 分离文件名和扩展名
  const fileName = file.name
  const lastDotIndex = fileName.lastIndexOf('.')

  if (lastDotIndex > 0 && lastDotIndex < fileName.length - 1) {
    // 有扩展名的情况
    renameForm.value.fileName = fileName.substring(0, lastDotIndex)
    renameForm.value.fileExtension = fileName.substring(lastDotIndex + 1)
  } else {
    // 没有扩展名的情况
    renameForm.value.fileName = fileName
    renameForm.value.fileExtension = ''
  }

  renameDialogVisible.value = true
  hideContextMenu()
}

// 确认重命名文件
const confirmRename = async () => {
  if (!renameFileTarget.value || !renameForm.value.fileName.trim()) {
    message.error('请输入有效的文件名')
    return
  }

  // 构建完整文件名
  const newFileName = renameForm.value.fileExtension.trim()
    ? `${renameForm.value.fileName.trim()}.${renameForm.value.fileExtension.trim()}`
    : renameForm.value.fileName.trim()

  try {
    await FileApi.renameFile(renameFileTarget.value.id, newFileName)
    message.success('文件重命名成功！')
    renameDialogVisible.value = false
    refreshPersonalFiles()
  } catch (error) {
    console.error('重命名文件失败:', error)
    message.error('重命名文件失败')
  }
}



// 聚焦文件名输入框
const focusFileNameInput = () => {
  nextTick(() => {
    if (fileNameInputRef.value) {
      fileNameInputRef.value.focus()
      // 选中所有文本，方便用户快速修改
      fileNameInputRef.value.select()
    }
  })
}

// 删除文件夹（实际上是删除该文件夹下的所有文件）
const deleteFolder = async (folder: any) => {
  try {
    await message.delConfirm(`确定要删除文件夹 "${folder.name}" 及其所有内容吗？`)

    // 找到该文件夹下的所有文件
    const filesToDelete = personalFiles.value.filter(file => {
      const fileDir = file.dir || ''
      return fileDir === folder.path || fileDir.startsWith(folder.path + '/')
    })

    // 批量删除文件
    for (const file of filesToDelete) {
      await FileApi.deleteFile(file.id)
    }

    message.success('文件夹删除成功！')
    refreshPersonalFiles()
    hideContextMenu()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件夹失败:', error)
      message.error('删除文件夹失败')
    }
  }
}

// 个人文件上传成功回调
const handleUploadSuccess = (result, file) => {
  console.log('文件上传成功:', result, file)
  message.success('文件上传成功！')

  // 重置上传组件，清空文件列表
  if (uploadFileRef.value && uploadFileRef.value.resetComponent) {
    uploadFileRef.value.resetComponent()
  }

  uploadVisible.value = false
  refreshPersonalFiles()
}

// 个人文件上传失败回调
const handleUploadError = (error, file) => {
  console.error('文件上传失败:', error, file)
  message.error('文件上传失败')
}

// 处理公共文件上传
const handlePublicUpload = () => {
  publicUploadVisible.value = true
}

// 公共文件上传成功回调
const handlePublicUploadSuccess = async (result, file) => {
  try {
    const fileId = result?.id
    if (fileId) {
      // 调用设置为公共文件的方法
      await FileApi.setFilePublic(fileId)

      // 标记文件为已保存状态，防止被自动删除
      if (publicUploadRef.value && publicUploadRef.value.markFilesAsSaved) {
        publicUploadRef.value.markFilesAsSaved()
      }

      message.success('公共文件上传并设置成功！')
      refreshPublicFiles() // 刷新公共文件列表
    } else {
      message.error('文件ID获取失败')
    }
  } catch (error) {
    console.error('设置公共文件失败:', error)
    message.error('设置公共文件失败')
  }

  // 重置上传组件，清空文件列表
  if (publicUploadRef.value && publicUploadRef.value.resetComponent) {
    publicUploadRef.value.resetComponent()
  }

  publicUploadVisible.value = false
}

// 公共文件上传失败回调
const handlePublicUploadError = (error, file) => {
  console.error('公共文件上传失败:', error, file)
  message.error('公共文件上传失败')
}

// 预览文件
const previewFile = async (file) => {
  try {
    console.log('预览文件:', file)
    hideContextMenu() // 隐藏右键菜单

    // 添加用户昵称参数
    const nickname = userStore.getUser?.nickname || ''
    // 判断是否为静态文件
    if (file.configId === 0) {
      // 静态文件预览
      if (file.type && file.type.includes('image')) {
        // 静态图片文件：使用现有的getStaticImageUrl方法（在模板中已处理）
        // 这里不需要额外处理，因为图片预览在模板中已经通过getStaticImageUrl处理了
        return
      } else {
        // 静态非图片文件：拼接预览地址
        const staticFileUrl = `${file.url}` + `?nickname=${nickname}`
        const encodedUrl = encodeURIComponent(base64Encode(staticFileUrl))
        const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
        window.open(previewUrl, '_blank')
      }
    } else {
      // 普通文件预览 - 不能修改签名URL的查询参数，否则会破坏签名
      const signedUrl = await FileApi.getDownloadUrl(file.id)
      // 构建文件访问URL，保持签名完整性
      const fileUrl = signedUrl + `&nickname=${nickname}`

      // 构建预览URL，将nickName作为预览服务的参数而不是文件URL的参数
      const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
      let previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
      window.open(previewUrl, '_blank')
    }
  } catch (error) {
    console.error('预览文件失败:', error)
    message.error('预览文件失败')
  }
}

// 下载文件
const downloadFile = async (file) => {
  try {
    console.log('下载文件:', file)
    hideContextMenu() // 隐藏右键菜单

    // 判断是否为静态文件
    if (file.configId === 0) {
      // 静态文件下载：
      const staticDownloadUrl = `${file.url}`
      window.open(staticDownloadUrl, '_blank')
    } else {
      // 普通文件下载：获取签名地址并替换域名，保持签名完整性
      const signedUrl = await FileApi.getDownloadUrl(file.id)
      const downloadUrl = `${signedUrl}`
      window.open(downloadUrl, '_blank')
    }
  } catch (error) {
    console.error('获取下载地址失败:', error)
    message.error('获取下载地址失败')
  }
}

// 分享文件
const shareFile = (file) => {
  hideContextMenu() // 隐藏右键菜单
  shareForm.value = {
    fileId: file.id,
    userId: '',
    permission: 1,
    expiredTime: ''
  }
  shareVisible.value = true
}

// 确认分享
const confirmShare = async () => {
  try {
    console.log('分享文件:', shareForm.value)
    await FileApi.shareFile(shareForm.value)
    message.success('文件分享成功！')
    shareVisible.value = false
  } catch (error) {
    console.error('文件分享失败:', error)
    message.error('文件分享失败')
  }
}

// 设置文件为公共文件
const setFileAsPublic = async (file) => {
  try {
    hideContextMenu() // 隐藏右键菜单
    await message.delConfirm('确定要将此文件设置为公共文件吗？')

    // 调用设置为公共文件的方法
    await FileApi.setFilePublic(file.id)
    message.success('文件已设置为公共文件！')

    // 刷新两个列表
    refreshPersonalFiles()
    refreshPublicFiles()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('设置公共文件失败:', error)
      message.error('设置公共文件失败')
    }
  }
}

// 删除文件
const deleteFile = async (file) => {
  try {
    hideContextMenu() // 隐藏右键菜单
    await message.delConfirm()
    console.log('删除文件:', file)
    await FileApi.deleteFile(file.id)
    message.success('文件删除成功！')
    refreshPersonalFiles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error)
      message.error('删除文件失败')
    }
  }
}

// 切换选择模式
const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) {
    selectedFiles.value = []
  }
}

// 检查文件是否被选中
const isFileSelected = (file: any) => {
  return selectedFiles.value.some(f => f.id === file.id)
}

// 切换文件选择状态
const toggleFileSelection = (file: any) => {
  const index = selectedFiles.value.findIndex(f => f.id === file.id)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(file)
  }
}

// 处理文件点击
const handleFileClick = (file: any, index: number, event: MouseEvent) => {
  if (!isSelectMode.value) return

  if (event.ctrlKey || event.metaKey) {
    // Ctrl/Cmd + 点击：切换选中状态
    toggleFileSelection(file)
    lastSelectedIndex.value = index
  } else if (event.shiftKey && lastSelectedIndex.value !== -1) {
    // Shift + 点击：范围选择
    const start = Math.min(lastSelectedIndex.value, index)
    const end = Math.max(lastSelectedIndex.value, index)
    const filesToSelect = currentFiles.value.slice(start, end + 1)

    // 清空当前选择
    selectedFiles.value = []
    // 添加范围内的文件
    filesToSelect.forEach(f => {
      if (!isFileSelected(f)) {
        selectedFiles.value.push(f)
      }
    })
  } else {
    // 普通点击：单选
    selectedFiles.value = [file]
    lastSelectedIndex.value = index
  }
}

// 全选
const selectAll = () => {
  selectedFiles.value = [...currentFiles.value]
}

// 清空选择
const clearSelection = () => {
  selectedFiles.value = []
}

// 批量下载
const bulkDownload = async () => {
  try {
    for (const file of selectedFiles.value) {
      await downloadFile(file)
    }
    message.success(`开始下载 ${selectedFiles.value.length} 个文件`)
  } catch (error) {
    message.error('批量下载失败')
  }
}

// 批量移动
const bulkMove = () => {
  if (selectedFiles.value.length === 0) return

  // 使用第一个文件作为目标，显示移动对话框
  moveFileTarget.value = {
    id: 'bulk',
    files: selectedFiles.value,
    name: `${selectedFiles.value.length} 个文件`
  }
  moveForm.value.targetDir = ''
  moveDialogVisible.value = true
}

// 批量设为公共
const bulkSetPublic = async () => {
  try {
    await message.delConfirm(`确定要将选中的 ${selectedFiles.value.length} 个文件设置为公共文件吗？`)

    for (const file of selectedFiles.value) {
      await FileApi.setFilePublic(file.id)
    }

    message.success('批量设为公共文件成功！')
    refreshPersonalFiles()
    refreshPublicFiles()
    clearSelection()
  } catch (error) {
    if (error !== 'cancel') {
      message.error('批量设为公共文件失败')
    }
  }
}

// 批量删除
const bulkDelete = async () => {
  try {
    await message.delConfirm(`确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`)

    for (const file of selectedFiles.value) {
      await FileApi.deleteFile(file.id)
    }

    message.success('批量删除成功！')
    refreshPersonalFiles()
    clearSelection()
  } catch (error) {
    if (error !== 'cancel') {
      message.error('批量删除失败')
    }
  }
}



// 初始化
onMounted(() => {
  getPersonalFiles()
  getPublicFiles()
})
</script>

<style scoped lang="scss">
.file-cabinet {
  .file-tabs {
    :deep(.el-tabs__content) {
      padding: 0;
    }
  }

  .toolbar {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }

    .toolbar-right {
      .search-container {
        display: flex;
        align-items: center;
        gap: 8px;

        .search-input {
          width: 300px;

          .search-icon {
            color: #909399;
          }
        }

        .sort-buttons {
          display: flex;
          gap: 4px;
          margin-left: 8px;

          .el-button {
            padding: 6px 8px;
            border-radius: 4px;
            min-width: 32px;

            &.is-active,
            &--primary {
              background: #409eff;
              border-color: #409eff;
              color: #fff;
            }
          }
        }

      }
    }
  }

  .bulk-actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;

    .selected-count {
      font-size: 14px;
      color: #0369a1;
      font-weight: 500;
    }

    .bulk-actions {
      display: flex;
      gap: 8px;
    }
  }

  .breadcrumb-nav {
    margin-bottom: 16px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;

    .breadcrumb-item {
      cursor: pointer;
      color: #409eff;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    padding: 20px 0;

    // 响应式设计
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

  .file-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px 12px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    background: #fff;
    position: relative;
    overflow: hidden;
    aspect-ratio: 1;
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

    &.folder-card {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd;

      &:hover {
        background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
        border-color: #0ea5e9;
        box-shadow: 0 4px 20px rgba(14, 165, 233, 0.2);
      }
    }

    // 文件选中状态
    &.selected {
      border-color: #409eff;
      background: #f0f9ff;

      &.folder-card {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      }
    }

    .file-icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      margin-bottom: 8px;
      position: relative;

      .file-checkbox {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 10;

        .el-checkbox {
          margin: 0;

          :deep(.el-checkbox__input) {
            .el-checkbox__inner {
              width: 20px;
              height: 20px;
              background: rgba(255, 255, 255, 0.9);
              border: 2px solid #409eff;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
              transition: all 0.2s ease;

              &:hover {
                background: #fff;
                border-color: #409eff;
                transform: scale(1.1);
              }

              &::after {
                width: 6px;
                height: 10px;
                border: 2px solid #fff;
                border-left: 0;
                border-top: 0;
                left: 6px;
                top: 2px;
              }
            }

            &.is-checked {
              .el-checkbox__inner {
                background: #409eff;
                border-color: #409eff;
              }
            }

            &.is-indeterminate {
              .el-checkbox__inner {
                background: #409eff;
                border-color: #409eff;
              }
            }
          }
        }
      }

      .file-icon {
        font-size: 88px !important;
        transition: transform 0.2s ease;
        color: #409eff !important;
        min-height: 88px;
        display: flex !important;
        align-items: center;
        justify-content: center;
        line-height: 1;
        width: 88px;
        opacity: 1 !important;
        visibility: visible !important;
      }

      .folder-icon {
        font-size: 88px;
        color: #0ea5e9;
        transition: all 0.2s ease;
        min-height: 88px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 88px;
      }

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

    &:hover .file-icon {
      transform: scale(1.1);
    }

    &:hover .folder-icon {
      transform: scale(1.1);
      color: #0284c7;
    }

    .file-info {
      text-align: center;

      .file-name {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.3;
        min-height: 17px;

        // 文件名过长时显示 tooltip
        &:hover {
          position: relative;
          z-index: 10;
        }
      }

      .file-meta {
        font-size: 11px;
        color: #909399;
        line-height: 1.3;
        min-height: 14px;

        .file-date {
          display: block;
          margin-top: 2px;
          font-size: 10px;
          opacity: 0.8;
        }
      }
    }
  }

  .search-item {
    display: flex;
    align-items: center;
    padding: 10px 0;

    .file-icon {
      font-size: 18px !important;
      margin-right: 12px;
      /* 颜色由内联样式控制 */
    }

    .file-info {
      flex: 1;

      .file-name {
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .file-meta-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 11px;

        .file-path {
          color: #909399;
        }

        .file-size {
          color: #c0c4cc;
        }

        .file-time {
          color: #a8abb2;
        }
      }
    }
  }
}

.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 160px;
  backdrop-filter: blur(10px);

  .menu-items {
    .menu-item {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      cursor: pointer;
      font-size: 14px;
      color: #303133;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background: #f0f9ff;
        color: #409eff;

        .menu-icon {
          transform: scale(1.1);
        }
      }

      &.danger {
        color: #f56c6c;

        &:hover {
          background: #fef0f0;
          color: #f56c6c;
        }
      }

      .menu-icon {
        margin-right: 12px;
        font-size: 16px;
        transition: transform 0.2s ease;
        width: 16px;
        display: flex;
        justify-content: center;
      }
    }

    .menu-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e4e7ed, transparent);
      margin: 6px 12px;
    }
  }
}

.folder-option {
  display: flex;
  align-items: center;

  .folder-icon {
    margin-right: 8px;
    font-size: 16px;
    color: #409eff;
  }
}

.move-tips,
.rename-tips {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;

  .tip-icon {
    margin-right: 4px;
    color: #409eff;
  }
}



.upload-info {
  margin-bottom: 16px;

  .current-path-info {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 4px;
    color: #0369a1;
    font-size: 14px;

    .path-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
}
</style>
