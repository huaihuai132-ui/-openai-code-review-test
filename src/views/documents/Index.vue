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
                      <div class="file-icon" style="font-size: 18px;">{{ getFileTypeIcon(item.name
                        || '') }}</div>
                      <div class="file-info">
                        <div class="file-name">{{ item.name }}</div>
                        <div class="file-meta-row">
                          <span class="file-path">{{ item.dir || '/' }}</span>
                          <span class="file-size">{{ fileSizeFormatter(null, null, item.size)
                            }}</span>
                          <span class="file-time">{{ dateFormatter(null, null,
                            item.createTime) }}</span>
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

          <!-- 文件网格 -->
          <FileGrid :files="currentFiles" :folders="currentFolders" :current-path="currentPath"
            :loading="personalLoading" :select-mode="isSelectMode" :selected-files="selectedFiles"
            @navigate-folder="navigateToFolder" @file-click="handleFileClick" @preview-file="fileOperations.previewFile"
            @context-menu="showContextMenu" @toggle-selection="toggleFileSelection" />
        </ContentWrap>
      </el-tab-pane>

      <!-- 共享文件柜 -->
      <el-tab-pane label="共享文件柜" name="shared">
        <ContentWrap>
          <div class="toolbar">
            <el-button @click="refreshSharedFiles">
              <Icon icon="ep:refresh" class="mr-5px" /> 刷新
            </el-button>
            <el-button @click="showMySharedFiles">
              <Icon icon="ep:share" class="mr-5px" /> 查看我分享的文件
            </el-button>
          </div>

          <FileGrid :files="sharedFiles" :folders="[]" :current-path="''" :loading="sharedLoading" :select-mode="false"
            :selected-files="[]" @preview-file="fileOperations.previewFile" @context-menu="showContextMenu" />
        </ContentWrap>
      </el-tab-pane>

      <!-- 公司文件柜 -->
      <el-tab-pane label="公司文件柜" name="public">
        <ContentWrap>
          <div class="toolbar">
            <el-button type="primary" @click="handlePublicUpload">
              <Icon icon="ep:upload" class="mr-5px" /> 上传公共文件
            </el-button>
            <el-button @click="refreshPublicFiles">
              <Icon icon="ep:refresh" class="mr-5px" /> 刷新
            </el-button>
          </div>

          <FileGrid :files="publicFiles" :folders="[]" :current-path="''" :loading="publicLoading" :select-mode="false"
            :selected-files="[]" @preview-file="fileOperations.previewFile" @context-menu="showContextMenu" />
        </ContentWrap>
      </el-tab-pane>
    </el-tabs>

    <!-- 右键菜单 -->
    <ContextMenu v-model:visible="contextMenuVisible" :x="contextMenuX" :y="contextMenuY" :target="contextMenuTarget"
      :type="contextMenuType" @preview="fileOperations.previewFile" @download="fileOperations.downloadFile"
      @share="shareFile" @move="showMoveDialog" @rename="showRenameDialog" @set-public="handleSetPublic"
      @delete="handleDeleteFile" @open-folder="navigateToFolder" @rename-folder="showRenameFolderDialog"
      @delete-folder="deleteFolder" @unshare-from-me="handleUnshareFromMe" />

    <!-- 上传对话框 -->
    <UploadDialog v-model="uploadVisible" :folders="allFolders" :current-path="currentPath"
      @upload-success="handleUploadSuccess" @upload-error="handleUploadError" />

    <!-- 公共文件上传对话框 -->
    <PublicUploadDialog v-model="publicUploadVisible" @upload-success="handlePublicUploadSuccess"
      @upload-error="handlePublicUploadError" />

    <!-- 分享对话框 -->
    <ShareDialog v-model="shareVisible" :file-id="shareForm.fileId" @share-success="handleShareSuccess" />

    <!-- 移动对话框 -->
    <MoveDialog v-model="moveDialogVisible" :folders="allFolders" @confirm="confirmMove" />

    <!-- 重命名对话框 -->
    <RenameDialog v-model="renameDialogVisible" :file-name="renameFileTarget?.name" @confirm="confirmRename" />

    <!-- 我分享的文件对话框 -->
    <MySharedDialog v-model="mySharedDialogVisible" :files="mySharedFiles" :loading="mySharedLoading"
      @preview-file="fileOperations.previewFile" @download-file="fileOperations.downloadFile"
      @unshare-user="handleUnshareUser" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { fileSizeFormatter } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import { useMessage } from '@/hooks/web/useMessage'

// 组件导入
import FileGrid from './components/FileGrid.vue'
import ContextMenu from './components/ContextMenu.vue'
import UploadDialog from './components/UploadDialog.vue'
import PublicUploadDialog from './components/PublicUploadDialog.vue'
import ShareDialog from './components/ShareDialog.vue'
import MoveDialog from './components/MoveDialog.vue'
import RenameDialog from './components/RenameDialog.vue'
import MySharedDialog from './components/MySharedDialog.vue'

// Hooks 导入
import { useFileData } from './hooks/useFileData'
import { useFileOperations } from './hooks/useFileOperations'

defineOptions({ name: 'FileCabinet' })

const message = useMessage()

// 使用 hooks
const fileData = useFileData()
const fileOperations = useFileOperations()

// 从 fileData 中解构需要的状态和方法
const {
  personalLoading,
  personalFiles,
  publicLoading,
  publicFiles,
  sharedLoading,
  sharedFiles,
  mySharedLoading,
  mySharedFiles,
  currentPath,
  allFolders,
  sortBy,
  sortOrder,
  currentFolders,
  currentFiles,
  getPersonalFiles,
  getPublicFiles,
  getSharedFiles,
  getMySharedFiles,
  navigateToFolder,
  toggleSort,
  refreshPersonalFiles,
  refreshPublicFiles,
  refreshSharedFiles
} = fileData

// ==================== 响应式状态 ====================
// 标签页
const activeTab = ref('personal')

// 搜索相关
const searchKeyword = ref('')

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuTarget = ref<any>(null)
const contextMenuType = ref('')

// 弹窗状态
const uploadVisible = ref(false)
const publicUploadVisible = ref(false)
const shareVisible = ref(false)
const shareForm = ref({ fileId: 0 })
const moveDialogVisible = ref(false)
const moveFileTarget = ref<any>(null)
const renameDialogVisible = ref(false)
const renameFileTarget = ref<any>(null)
const mySharedDialogVisible = ref(false)

// 批量操作
const selectedFiles = ref<any[]>([])
const isSelectMode = ref(false)
const lastSelectedIndex = ref(-1)

// ==================== 搜索相关 ====================
const searchFiles = (queryString: string, callback: Function) => {
  if (!queryString) {
    callback([])
    return
  }

  const results = personalFiles.value.filter(file => {
    return file.name.toLowerCase().includes(queryString.toLowerCase())
  }).map(file => ({
    ...file,
    value: file.name,
    label: file.name
  }))

  callback(results)
}

const handleSearchSelect = (item: any) => {
  if (item.dir) {
    navigateToFolder(item.dir)
  }
  searchKeyword.value = ''
}

const handleSearchClear = () => {
  // 搜索清空时的处理
}

// ==================== 右键菜单 ====================
const showContextMenu = (event: MouseEvent, target: any, type: string) => {
  event.preventDefault()
  contextMenuTarget.value = target
  contextMenuType.value = type
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
}

// ==================== 文件图标 ====================
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

// ==================== 上传处理 ====================
const handleUpload = () => {
  uploadVisible.value = true
}

const handleUploadSuccess = () => {
  refreshPersonalFiles()
}

const handleUploadError = () => {
  // 上传错误处理
}

const handlePublicUpload = () => {
  publicUploadVisible.value = true
}

const handlePublicUploadSuccess = () => {
  refreshPublicFiles()
}

const handlePublicUploadError = () => {
  // 公共文件上传错误处理
}

// ==================== 文件操作 ====================
const shareFile = (file: any) => {
  shareForm.value.fileId = file.id
  shareVisible.value = true
}

const handleShareSuccess = () => {
  // 分享成功后刷新相关数据
  refreshSharedFiles()
}

const showMoveDialog = (file: any) => {
  moveFileTarget.value = file
  moveDialogVisible.value = true
}

const confirmMove = async (targetDir: string) => {
  if (!moveFileTarget.value) return

  try {
    // 处理批量移动
    if (moveFileTarget.value.id === 'bulk' && moveFileTarget.value.files) {
      let successCount = 0
      for (const file of moveFileTarget.value.files) {
        const success = await fileOperations.moveFile(file.id, targetDir)
        if (success) successCount++
      }

      if (successCount > 0) {
        message.success(`成功移动 ${successCount} 个文件`)
        refreshPersonalFiles()
        clearSelection()
      }
    } else {
      // 处理单个文件移动
      const success = await fileOperations.moveFile(moveFileTarget.value.id, targetDir)
      if (success) {
        refreshPersonalFiles()
      }
    }
  } catch (error) {
    console.error('移动文件失败:', error)
    message.error('移动文件失败')
  }
}

const showRenameDialog = (file: any) => {
  renameFileTarget.value = file
  renameDialogVisible.value = true
}

const confirmRename = async (newName: string) => {
  if (!renameFileTarget.value) return

  const success = await fileOperations.renameFile(renameFileTarget.value.id, newName)
  if (success) {
    refreshPersonalFiles()
  }
}

const handleSetPublic = async (file: any) => {
  const success = await fileOperations.setFileAsPublic(file)
  if (success) {
    refreshPersonalFiles()
    refreshPublicFiles()
  }
}

const handleDeleteFile = async (file: any) => {
  const success = await fileOperations.deleteFile(file)
  if (success) {
    refreshPersonalFiles()
  }
}

const handleUnshareFromMe = async (file: any) => {
  const success = await fileOperations.unshareFromMe(file)
  if (success) {
    refreshSharedFiles()
  }
}

const handleUnshareUser = async (fileId: number, userId: string) => {
  const success = await fileOperations.unshareFile(fileId, userId)
  if (success) {
    await getMySharedFiles()
  }
}

const showMySharedFiles = async () => {
  mySharedDialogVisible.value = true
  await getMySharedFiles()
}

const deleteFolder = async (folder: any) => {
  try {
    await message.delConfirm(`确定要删除文件夹 "${folder.name}" 及其所有内容吗？`)

    const filesToDelete = personalFiles.value.filter(file => {
      const fileDir = file.dir || ''
      return fileDir === folder.path || fileDir.startsWith(folder.path + '/')
    })

    for (const file of filesToDelete) {
      await fileOperations.deleteFile(file)
    }

    message.success('文件夹删除成功！')
    refreshPersonalFiles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件夹失败:', error)
      message.error('删除文件夹失败')
    }
  }
}

const showRenameFolderDialog = (folder: any) => {
  // TODO: 实现文件夹重命名
  message.info('文件夹重命名功能待实现')
}

// ==================== 批量操作 ====================
const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) {
    selectedFiles.value = []
  }
}

const isFileSelected = (file: any) => {
  return selectedFiles.value.some(f => f.id === file.id)
}

const toggleFileSelection = (file: any) => {
  const index = selectedFiles.value.findIndex(f => f.id === file.id)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(file)
  }
}

const handleFileClick = (file: any, index: number, event: MouseEvent) => {
  if (!isSelectMode.value) return

  if (event.ctrlKey || event.metaKey) {
    toggleFileSelection(file)
    lastSelectedIndex.value = index
  } else if (event.shiftKey && lastSelectedIndex.value !== -1) {
    const start = Math.min(lastSelectedIndex.value, index)
    const end = Math.max(lastSelectedIndex.value, index)
    const filesToSelect = currentFiles.value.slice(start, end + 1)

    selectedFiles.value = []
    filesToSelect.forEach(f => {
      if (!isFileSelected(f)) {
        selectedFiles.value.push(f)
      }
    })
  } else {
    selectedFiles.value = [file]
    lastSelectedIndex.value = index
  }
}

const selectAll = () => {
  selectedFiles.value = [...currentFiles.value]
}

const clearSelection = () => {
  selectedFiles.value = []
}

const bulkDownload = async () => {
  const success = await fileOperations.bulkDownloadFiles(selectedFiles.value)
  if (success) {
    // 下载成功处理
  }
}

const bulkMove = () => {
  if (selectedFiles.value.length === 0) return

  moveFileTarget.value = {
    id: 'bulk',
    files: selectedFiles.value,
    name: `${selectedFiles.value.length} 个文件`
  }
  moveDialogVisible.value = true
}

const bulkSetPublic = async () => {
  const success = await fileOperations.bulkSetPublic(selectedFiles.value)
  if (success) {
    refreshPersonalFiles()
    refreshPublicFiles()
    clearSelection()
  }
}

const bulkDelete = async () => {
  const success = await fileOperations.bulkDeleteFiles(selectedFiles.value)
  if (success) {
    refreshPersonalFiles()
    clearSelection()
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  getPersonalFiles()
  getSharedFiles()
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

  .search-item {
    display: flex;
    align-items: center;
    padding: 10px 0;

    .file-icon {
      font-size: 18px !important;
      margin-right: 12px;
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
</style>
