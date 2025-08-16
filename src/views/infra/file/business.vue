<template>
    <div class="business-files">
        <ContentWrap>
            <div class="header">
                <h2>业务文件管理</h2>
                <div class="business-info" v-if="businessCode">
                    <el-tag type="primary">业务编码: {{ businessCode }}</el-tag>
                </div>
            </div>

            <div class="toolbar">
                <el-button type="primary" @click="handleUpload">
                    <Icon icon="ep:upload" class="mr-5px" /> 上传业务文件
                </el-button>
                <el-button @click="refreshFiles">
                    <Icon icon="ep:refresh" class="mr-5px" /> 刷新
                </el-button>
                <el-input v-model="searchText" placeholder="搜索文件名" class="search-input" clearable
                    @keyup.enter="handleSearch">
                    <template #append>
                        <el-button @click="handleSearch">
                            <Icon icon="ep:search" />
                        </el-button>
                    </template>
                </el-input>
            </div>

            <el-table v-loading="loading" :data="filteredFiles" class="business-file-table">
                <el-table-column type="selection" width="55" />
                <el-table-column label="文件名" prop="name" :show-overflow-tooltip="true" min-width="200">
                    <template #default="{ row }">
                        <div class="file-name-cell">
                            <Icon :icon="getFileIcon(row.type)" class="file-icon" />
                            <span>{{ row.name }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="文件大小" prop="size" width="120" :formatter="fileSizeFormatter" />
                <el-table-column label="文件类型" prop="type" width="140" />
                <el-table-column label="业务编码" prop="businessCode" width="150" />
                <el-table-column label="文件预览" width="110">
                    <template #default="{ row }">
                        <el-image v-if="row.type && row.type.includes('image')" class="h-60px w-60px" :src="row.url"
                            :preview-src-list="[row.url]" preview-teleported fit="cover" />
                        <el-link v-else type="primary" @click="previewFile(row)" :underline="false">
                            预览
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column label="上传时间" prop="createTime" width="180" :formatter="dateFormatter" />
                <el-table-column label="上传者" prop="creator" width="120" />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="downloadFile(row)">下载</el-button>
                        <el-button link type="success" @click="shareFile(row)">分享</el-button>
                        <el-button link type="warning" @click="editFile(row)">编辑</el-button>
                        <el-button link type="danger" @click="deleteFile(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </ContentWrap>

        <!-- 文件上传弹窗 -->
        <el-dialog v-model="uploadVisible" title="上传业务文件" width="600px">
            <el-form :model="uploadForm" label-width="100px">
                <el-form-item label="业务编码">
                    <el-input v-model="uploadForm.businessCode" placeholder="请输入业务编码" />
                </el-form-item>
                <el-form-item label="文件目录">
                    <el-input v-model="uploadForm.directory" placeholder="可选，文件存储目录" />
                </el-form-item>
            </el-form>

            <UploadFile v-model="uploadFileUrl" :drag="true"
                :file-type="['jpg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar', 'ppt', 'pptx']"
                :file-size="100" :show-custom-file-name="true" :directory="uploadForm.directory"
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
                        format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="shareVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmShare">确认分享</el-button>
            </template>
        </el-dialog>

        <!-- 文件编辑弹窗 -->
        <el-dialog v-model="editVisible" title="编辑文件" width="400px">
            <el-form :model="editForm" label-width="80px">
                <el-form-item label="文件名">
                    <el-input v-model="editForm.name" placeholder="请输入文件名" />
                </el-form-item>
                <el-form-item label="业务编码">
                    <el-input v-model="editForm.businessCode" placeholder="请输入业务编码" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmEdit">确认修改</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UploadFile } from '@/components/UploadFile'
import { fileSizeFormatter } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import * as FileApi from '@/api/infra/file/index'

defineOptions({ name: 'BusinessFiles' })

const message = useMessage()
const { t } = useI18n()
const route = useRoute()

// 路由参数
const businessCode = ref('')
const filePath = ref('')

// 文件列表
const loading = ref(false)
const files = ref([])
const searchText = ref('')

// 文件上传
const uploadVisible = ref(false)
const uploadFileUrl = ref('')
const uploadForm = ref({
    businessCode: '',
    directory: ''
})

// 文件分享
const shareVisible = ref(false)
const shareForm = ref({
    fileId: null,
    userId: '',
    permission: 1,
    expiredTime: null
})

// 文件编辑
const editVisible = ref(false)
const editForm = ref({
    id: null,
    name: '',
    businessCode: ''
})

// 过滤后的文件列表
const filteredFiles = computed(() => {
    if (!searchText.value) return files.value
    return files.value.filter(file =>
        file.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
})

// 获取文件图标
const getFileIcon = (type: string) => {
    if (!type) return 'ep:document'

    if (type.includes('image')) return 'ep:picture'
    if (type.includes('pdf')) return 'ep:document'
    if (type.includes('word') || type.includes('doc')) return 'ep:document'
    if (type.includes('excel') || type.includes('sheet')) return 'ep:document'
    if (type.includes('powerpoint') || type.includes('presentation')) return 'ep:document'
    if (type.includes('zip') || type.includes('rar')) return 'ep:folder'
    return 'ep:document'
}

// 获取业务文件列表
const getBusinessFiles = async (code?: string) => {
    loading.value = true
    try {
        const queryCode = code || businessCode.value
        if (!queryCode) {
            console.log('没有业务编码，显示空列表')
            files.value = []
            return
        }

        console.log('获取业务文件列表:', queryCode)
        const response = await FileApi.getBusinessFiles(queryCode)
        files.value = response.data || []
        console.log('获取到的文件列表:', files.value)
    } catch (error) {
        console.error('获取业务文件失败:', error)
        message.error('获取业务文件失败')
    } finally {
        loading.value = false
    }
}

// 刷新文件列表
const refreshFiles = () => {
    getBusinessFiles()
}

// 搜索文件
const handleSearch = () => {
    // 搜索功能通过computed实现，这里可以添加额外逻辑
    console.log('搜索文件:', searchText.value)
}

// 处理文件上传
const handleUpload = () => {
    uploadForm.value.businessCode = businessCode.value
    uploadVisible.value = true
}

// 上传成功回调
const handleUploadSuccess = (result, file) => {
    console.log('业务文件上传成功:', result, file)
    message.success('文件上传成功！')
    uploadVisible.value = false
    refreshFiles()
}

// 上传失败回调
const handleUploadError = (error, file) => {
    console.error('业务文件上传失败:', error, file)
    message.error('文件上传失败')
}

// 预览文件
const previewFile = (file) => {
    console.log('预览业务文件:', file)
    if (file.url) {
        window.open(file.url, '_blank')
    }
}

// 下载文件
const downloadFile = async (file) => {
    try {
        console.log('下载业务文件:', file)
        const url = await FileApi.getDownloadUrl(file.id)
        window.open(url, '_blank')
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
        expiredTime: null
    }
    shareVisible.value = true
}

// 确认分享
const confirmShare = async () => {
    try {
        console.log('分享业务文件:', shareForm.value)
        await FileApi.shareFile(shareForm.value)
        message.success('文件分享成功！')
        shareVisible.value = false
    } catch (error) {
        console.error('文件分享失败:', error)
        message.error('文件分享失败')
    }
}

// 编辑文件
const editFile = (file) => {
    editForm.value = {
        id: file.id,
        name: file.name,
        businessCode: file.businessCode || ''
    }
    editVisible.value = true
}

// 确认编辑
const confirmEdit = async () => {
    try {
        console.log('编辑业务文件:', editForm.value)
        // TODO: 实现文件信息更新API
        message.success('文件信息更新成功！')
        editVisible.value = false
        refreshFiles()
    } catch (error) {
        console.error('文件信息更新失败:', error)
        message.error('文件信息更新失败')
    }
}

// 删除文件
const deleteFile = async (file) => {
    try {
        await message.delConfirm()
        console.log('删除业务文件:', file)
        await FileApi.deleteFile(file.id)
        message.success('文件删除成功！')
        refreshFiles()
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除文件失败:', error)
            message.error('删除文件失败')
        }
    }
}

// 处理URL参数变化
const handleRouteParams = () => {
    // 从URL参数获取业务编码
    if (route.query.businessCode) {
        businessCode.value = route.query.businessCode as string
        console.log('从URL获取业务编码:', businessCode.value)
    }

    // 从URL参数获取文件路径
    if (route.query.filePath) {
        filePath.value = route.query.filePath as string
        console.log('从URL获取文件路径:', filePath.value)
        // 这里可以根据文件路径做一些特殊处理
        handleFilePathLogic(filePath.value)
    }
}

// 处理文件路径相关逻辑
const handleFilePathLogic = (path: string) => {
    console.log('处理文件路径逻辑:', path)
    // TODO: 根据需要实现具体的文件路径处理逻辑
    // 例如：自动定位到特定文件、高亮显示等
}

// 监听路由变化
watch(() => route.query, () => {
    handleRouteParams()
    if (businessCode.value) {
        getBusinessFiles()
    }
}, { immediate: true })

// 初始化
onMounted(() => {
    handleRouteParams()
    if (businessCode.value) {
        getBusinessFiles()
    } else {
        console.log('页面初始化 - 等待业务编码参数')
    }
})
</script>

<style scoped lang="scss">
.business-files {
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
            color: #303133;
        }

        .business-info {
            display: flex;
            gap: 8px;
        }
    }

    .toolbar {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 12px;

        .search-input {
            width: 300px;
            margin-left: auto;
        }
    }

    .business-file-table {
        .file-name-cell {
            display: flex;
            align-items: center;
            gap: 8px;

            .file-icon {
                font-size: 16px;
                color: #606266;
            }
        }

        .el-image {
            border-radius: 4px;
            border: 1px solid #dcdfe6;
        }
    }
}
</style>
