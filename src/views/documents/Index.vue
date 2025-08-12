<template>
  <div class="file-cabinet">
    <el-tabs v-model="activeTab" class="file-tabs">
      <!-- 个人文件柜 -->
      <el-tab-pane label="个人文件柜" name="personal">
        <ContentWrap>
          <div class="toolbar">
            <el-button type="primary" @click="handleUpload">
              <Icon icon="ep:upload" class="mr-5px" /> 上传文件
            </el-button>
            <el-button @click="refreshPersonalFiles">
              <Icon icon="ep:refresh" class="mr-5px" /> 刷新
            </el-button>
          </div>

          <el-table v-loading="personalLoading" :data="personalFiles" class="file-table" empty-text="暂无数据">
            <el-table-column label="文件名" prop="name" :show-overflow-tooltip="true" min-width="200" />
            <el-table-column label="文件大小" prop="size" width="120" :formatter="fileSizeFormatter" />
            <el-table-column label="文件类型" prop="type" width="140" />
            <el-table-column label="文件内容" width="110">
              <template #default="{ row }">
                <el-image v-if="row.type && row.type.includes('image') && row.configId === 0" class="h-60px w-60px"
                  :src="getStaticImageUrl(row.path)" :preview-src-list="[getStaticImageUrl(row.path)]"
                  preview-teleported fit="cover" />
                <el-link v-else type="primary" @click="previewFile(row)" :underline="false">
                  预览
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="上传时间" prop="createTime" width="180" :formatter="dateFormatter" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="downloadFile(row)">下载</el-button>
                <el-button link type="success" @click="shareFile(row)">分享</el-button>
                <el-button link type="danger" @click="deleteFile(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </ContentWrap>
      </el-tab-pane>

      <!-- 公共文件柜 -->
      <el-tab-pane label="公共文件柜" name="public">
        <ContentWrap>
          <div class="toolbar">
            <el-button @click="refreshPublicFiles">
              <Icon icon="ep:refresh" class="mr-5px" /> 刷新
            </el-button>
          </div>

          <el-table v-loading="publicLoading" :data="publicFiles" class="file-table" empty-text="暂无数据">
            <el-table-column label="文件名" prop="name" :show-overflow-tooltip="true" min-width="200" />
            <el-table-column label="文件大小" prop="size" width="120" :formatter="fileSizeFormatter" />
            <el-table-column label="文件类型" prop="type" width="140" />
            <el-table-column label="文件内容" width="110">
              <template #default="{ row }">
                <el-image v-if="row.type && row.type.includes('image') && row.configId === 0" class="h-60px w-60px"
                  :src="getStaticImageUrl(row.path)" :preview-src-list="[getStaticImageUrl(row.path)]"
                  preview-teleported fit="cover" />
                <el-link v-else type="primary" @click="previewFile(row)" :underline="false">
                  预览
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="上传时间" prop="createTime" width="180" :formatter="dateFormatter" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="downloadFile(row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </ContentWrap>
      </el-tab-pane>
    </el-tabs>

    <!-- 文件上传弹窗 -->
    <el-dialog v-model="uploadVisible" title="上传文件" width="600px">
      <SingleFileUpload :drag="true" accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" tip="支持常见文件格式，最大50MB"
        @upload-success="handleUploadSuccess" @upload-error="handleUploadError" />
      <template #footer>
        <el-button @click="uploadVisible = false">关闭</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SingleFileUpload } from '@/components/FileUpload'
import { fileSizeFormatter } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import * as FileApi from '@/api/infra/file/index'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'FileCabinet' })

const message = useMessage()
const userStore = useUserStore()

// 固定域名配置
const FIXED_DOMAIN = 'http://182.109.52.126:49090'
// const currentDomain = `${window.location.protocol}//${window.location.host}`

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

// 文件上传
const uploadVisible = ref(false)

// 文件分享
const shareVisible = ref(false)
const shareForm = ref({
  fileId: 0,
  userId: '',
  permission: 1,
  expiredTime: ''
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
  } catch (error) {
    console.error('获取个人文件失败:', error)
    message.error('获取个人文件失败')
    personalFiles.value = []
  } finally {
    personalLoading.value = false
  }
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

// 刷新个人文件
const refreshPersonalFiles = () => {
  getPersonalFiles()
}

// 刷新公共文件
const refreshPublicFiles = () => {
  getPublicFiles()
}

// 获取静态图片URL
const getStaticImageUrl = (path: string) => {
  if (!path) return ''
  // 拼接minio静态桶地址
  return `http://182.109.52.126:49090/minio/static/${path}`
}

// 处理文件上传
const handleUpload = () => {
  uploadVisible.value = true
}

// 上传成功回调
const handleUploadSuccess = (result, file) => {
  console.log('文件上传成功:', result, file)
  message.success('文件上传成功！')
  uploadVisible.value = false
  refreshPersonalFiles()
}

// 上传失败回调
const handleUploadError = (error, file) => {
  console.error('文件上传失败:', error, file)
  message.error('文件上传失败')
}

// 预览文件
const previewFile = async (file) => {
  try {
    console.log('预览文件:', file)

    // 判断是否为静态文件
    if (file.configId === 0) {
      // 静态文件预览
      if (file.type && file.type.includes('image')) {
        // 静态图片文件：使用现有的getStaticImageUrl方法（在模板中已处理）
        // 这里不需要额外处理，因为图片预览在模板中已经通过getStaticImageUrl处理了
        return
      } else {
        // 静态非图片文件：拼接预览地址
        const staticFileUrl = `${FIXED_DOMAIN}/minio/static/${file.path}`
        const encodedUrl = encodeURIComponent(base64Encode(staticFileUrl))
        const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
        window.open(previewUrl, '_blank')
      }
    } else {
      // 普通文件预览
      const signedUrl = await FileApi.getDownloadUrl(file.id)

      // 解析原始URL并替换域名
      const urlObj = new URL(signedUrl)
      const pathAndQuery = urlObj.pathname + urlObj.search

      // 构建文件访问URL
      let fileUrl = `${FIXED_DOMAIN}/minio${pathAndQuery}`

      // 添加用户昵称参数
      const nickname = userStore.getUser?.nickname || ''
      if (nickname) {
        const separator = fileUrl.includes('?') ? '&' : '?'
        fileUrl += `${separator}nickName=${encodeURIComponent(nickname)}`
      }

      // 构建预览URL
      const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
      const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
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

    // 判断是否为静态文件
    if (file.configId === 0) {
      // 静态文件下载：直接拼接静态文件下载地址
      const staticDownloadUrl = `${FIXED_DOMAIN}/minio/static/${file.path}`
      window.open(staticDownloadUrl, '_blank')
    } else {
      // 普通文件下载：获取签名地址并替换域名
      const signedUrl = await FileApi.getDownloadUrl(file.id)

      // 解析原始URL并替换域名
      const urlObj = new URL(signedUrl)
      const pathAndQuery = urlObj.pathname + urlObj.search

      // 构建新的下载URL：当前域名 + /minio/ + 原路径和查询参数
      const downloadUrl = `${FIXED_DOMAIN}/minio${pathAndQuery}`
      window.open(downloadUrl, '_blank')
    }
  } catch (error) {
    console.error('获取下载地址失败:', error)
    message.error('获取下载地址失败')
  }
}

// 分享文件
const shareFile = (file) => {
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

// 删除文件
const deleteFile = async (file) => {
  try {
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
    gap: 12px;
  }

  .file-table {
    .el-image {
      border-radius: 4px;
      border: 1px solid #dcdfe6;
    }
  }
}
</style>
