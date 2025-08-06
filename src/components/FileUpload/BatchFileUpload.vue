<template>
    <div class="batch-file-upload">
        <el-upload ref="uploadRef" v-model:file-list="fileList" :action="uploadUrl" :auto-upload="false"
            :disabled="uploading" :limit="maxFiles" :multiple="true" :on-change="handleFileChange"
            :on-error="handleUploadError" :on-exceed="handleExceed" :on-success="handleUploadSuccess"
            :http-request="httpRequest" :show-file-list="false" :drag="drag" :accept="accept"
            :class="{ 'is-uploading': uploading }">
            <div v-if="drag">
                <div v-if="!uploading">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                    </div>
                    <div class="el-upload__tip" v-if="maxFiles > 1">
                        最多可选择 {{ maxFiles }} 个文件
                    </div>
                </div>
            </div>
            <div v-else>
                <el-button :disabled="uploading" type="primary">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    {{ uploading ? '上传中...' : '选择文件' }}
                </el-button>
            </div>

            <template #tip v-if="tip">
                <div class="el-upload__tip">{{ tip }}</div>
            </template>
        </el-upload>

        <!-- 文件列表 -->
        <div v-if="fileList.length > 0" class="file-list">
            <div class="file-list-header">
                <span>已选择文件 ({{ fileList.length }}/{{ maxFiles }})</span>
                <el-button v-if="!uploading" size="small" type="danger" text @click="clearAllFiles">
                    清空全部
                </el-button>
            </div>

            <div class="file-items">
                <div v-for="(file, index) in fileList" :key="file.uid || index" class="file-item"
                    :class="{ 'is-uploading': file.uploading, 'is-success': file.status === 'success', 'is-error': file.status === 'error' }">
                    <div class="file-info">
                        <div class="file-name-section">
                            <el-icon class="file-icon">
                                <Document v-if="!isImageFile(file)" />
                                <Picture v-else />
                            </el-icon>
                            <div class="file-details">
                                <div class="original-name">{{ file.name }}</div>
                                <div class="file-size">{{ formatFileSize(file.size || 0) }}</div>
                            </div>
                        </div>

                        <!-- 自定义文件名输入 -->
                        <div class="custom-name-input">
                            <el-input v-model="file.customName" placeholder="自定义文件名（可选）"
                                :disabled="uploading || file.uploading" size="small" clearable>
                                <template #prepend>别名</template>
                            </el-input>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="file-actions">
                            <el-button v-if="!uploading && !file.uploading && file.status !== 'success'" size="small"
                                type="danger" text @click="removeFile(index)">
                                移除
                            </el-button>
                            <el-tag v-if="file.status === 'success'" type="success" size="small">
                                成功
                            </el-tag>
                            <el-tag v-else-if="file.status === 'error'" type="danger" size="small">
                                失败
                            </el-tag>
                        </div>
                    </div>

                    <!-- 单个文件上传进度 -->
                    <div v-if="file.progress && file.progress.show" class="file-progress">
                        <el-progress :percentage="file.progress.percentage" :status="file.progress.status"
                            :stroke-width="4" :show-text="false" />
                        <div class="progress-text">
                            <span>{{ file.progress.percentage }}%</span>
                            <span v-if="file.progress.speed">{{ formatSpeed(file.progress.speed) }}/s</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 整体上传进度 -->
        <div v-if="overallProgress.show" class="overall-progress">
            <div class="progress-header">
                <span>整体上传进度</span>
                <span>{{ overallProgress.completed }}/{{ overallProgress.total }}</span>
            </div>
            <el-progress :percentage="overallProgress.percentage" :status="overallProgress.status" :stroke-width="8" />
            <div class="progress-details">
                <span>{{ getOverallProgressText() }}</span>
                <el-button v-if="overallProgress.status === 'info'" size="small" @click="cancelAllUploads">
                    取消全部
                </el-button>
            </div>
        </div>

        <!-- 上传按钮 -->
        <div v-if="fileList.length > 0 && !uploading" class="upload-actions">
            <el-button type="primary" @click="startBatchUpload" :disabled="uploading">
                开始上传 ({{ fileList.length }} 个文件)
            </el-button>
            <el-button @click="clearAllFiles">清空全部</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, UploadFilled, Document, Picture } from '@element-plus/icons-vue'
import { useUpload } from '@/components/UploadFile/src/useUpload'

// 组件属性
const props = defineProps({
    // 最大文件数量
    maxFiles: {
        type: Number,
        default: 10
    },
    // 是否拖拽上传
    drag: {
        type: Boolean,
        default: false
    },
    // 接受的文件类型
    accept: {
        type: String,
        default: ''
    },
    // 提示文字
    tip: {
        type: String,
        default: ''
    },
    // 上传目录
    directory: {
        type: String,
        default: ''
    },
    // 并发上传数量
    concurrent: {
        type: Number,
        default: 3
    }
})

// 组件事件
const emit = defineEmits([
    'upload-success',
    'upload-error',
    'upload-progress',
    'file-change',
    'upload-complete'
])

// 响应式数据
const uploadRef = ref()
const fileList = ref([])
const uploading = ref(false)
const uploadQueue = ref([])
const uploadResults = ref([])
let cancelTokenSources = new Map()

// 整体上传进度
const overallProgress = ref({
    show: false,
    percentage: 0,
    status: 'info' as 'success' | 'exception' | 'warning' | 'info',
    completed: 0,
    total: 0
})

const { uploadUrl, httpRequest: originalHttpRequest } = useUpload(props.directory)

// 增强的httpRequest（支持单个文件进度）
const httpRequest = async (options) => {
    const axios = (await import('axios')).default

    // 找到对应的文件对象
    const file = fileList.value.find(f => f.uid === options.file.uid)
    if (!file) return

    // 创建取消令牌
    const cancelTokenSource = axios.CancelToken.source()
    cancelTokenSources.set(file.uid, cancelTokenSource)

    // 初始化文件进度
    file.progress = {
        show: true,
        percentage: 0,
        status: 'info',
        speed: 0,
        startTime: Date.now()
    }
    file.uploading = true

    // 构造增强的options对象
    const enhancedOptions = {
        ...options,
        cancelToken: cancelTokenSource.token,
        onProgress: (progressEvent) => {
            if (progressEvent.lengthComputable && file.progress) {
                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                const currentTime = Date.now()
                const timeElapsed = (currentTime - file.progress.startTime) / 1000
                const speed = timeElapsed > 0 ? progressEvent.loaded / timeElapsed : 0

                file.progress = {
                    ...file.progress,
                    percentage,
                    speed,
                    status: percentage === 100 ? 'success' : 'info'
                }

                // 更新整体进度
                updateOverallProgress()
            }
        }
    }

    try {
        const result = await originalHttpRequest(enhancedOptions)
        file.uploading = false
        file.status = 'success'
        file.progress.status = 'success'
        file.uploadResult = result.data

        // 记录上传结果
        const fileName = file.customName || file.name
        uploadResults.value.push({
            [fileName]: result.data
        })

        return result
    } catch (error) {
        file.uploading = false
        if (axios.isCancel(error)) {
            file.status = 'cancelled'
            file.progress.status = 'warning'
        } else {
            file.status = 'error'
            file.progress.status = 'exception'
            throw error
        }
    } finally {
        cancelTokenSources.delete(file.uid)
        updateOverallProgress()
    }
}

// 文件改变处理
const handleFileChange = (file, fileListParam) => {
    // 为新文件添加自定义属性
    const newFiles = fileListParam.filter(f => !fileList.value.find(existing => existing.uid === f.uid))

    newFiles.forEach(newFile => {
        // 添加自定义文件名（默认为原文件名去掉扩展名）
        const nameWithoutExt = newFile.name.substring(0, newFile.name.lastIndexOf('.')) || newFile.name
        newFile.customName = nameWithoutExt
        newFile.uploading = false
        newFile.status = 'ready'
        newFile.progress = null
    })

    fileList.value = fileListParam
    emit('file-change', file, fileListParam)
}

// 开始批量上传
const startBatchUpload = async () => {
    if (fileList.value.length === 0) {
        ElMessage.warning('请先选择文件')
        return
    }

    uploading.value = true
    uploadResults.value = []

    // 初始化整体进度
    overallProgress.value = {
        show: true,
        percentage: 0,
        status: 'info',
        completed: 0,
        total: fileList.value.length
    }

    // 使用Element Plus的submit方法触发上传
    uploadRef.value?.submit()
}

// 更新整体进度
const updateOverallProgress = () => {
    if (!overallProgress.value.show) return

    const completedFiles = fileList.value.filter(f => f.status === 'success' || f.status === 'error' || f.status === 'cancelled').length
    const totalFiles = fileList.value.length

    if (totalFiles > 0) {
        overallProgress.value.percentage = Math.round((completedFiles / totalFiles) * 100)
        overallProgress.value.completed = completedFiles
        overallProgress.value.total = totalFiles
    }
}

// 上传成功处理（单个文件）
const handleUploadSuccess = (response, file) => {
    // 检查是否所有文件都上传完成
    const allCompleted = fileList.value.every(f =>
        f.status === 'success' || f.status === 'error' || f.status === 'cancelled'
    )

    if (allCompleted) {
        uploading.value = false

        // 统计上传结果
        const successCount = uploadResults.value.length
        const totalCount = fileList.value.length

        if (successCount === totalCount) {
            overallProgress.value.status = 'success'
            ElMessage.success(`全部文件上传成功 (${successCount}/${totalCount})`)

            // 合并所有上传结果
            const finalResult = uploadResults.value.reduce((acc, curr) => ({ ...acc, ...curr }), {})
            emit('upload-success', finalResult)
        } else {
            overallProgress.value.status = 'warning'
            ElMessage.warning(`部分文件上传成功 (${successCount}/${totalCount})`)

            if (successCount > 0) {
                const finalResult = uploadResults.value.reduce((acc, curr) => ({ ...acc, ...curr }), {})
                emit('upload-success', finalResult)
            }
        }

        emit('upload-complete', {
            success: successCount,
            total: totalCount,
            results: uploadResults.value
        })

        // 延迟隐藏进度条
        setTimeout(() => {
            overallProgress.value.show = false
        }, 3000)
    }
}

// 上传错误处理（单个文件）
const handleUploadError = (error, file) => {
    const fileIndex = fileList.value.findIndex(f => f.uid === file.uid)
    if (fileIndex !== -1) {
        fileList.value[fileIndex].status = 'error'
        fileList.value[fileIndex].uploading = false
    }

    // 检查是否所有文件都上传完成（包括失败的）
    const allCompleted = fileList.value.every(f =>
        f.status === 'success' || f.status === 'error' || f.status === 'cancelled'
    )

    if (allCompleted) {
        uploading.value = false

        // 统计上传结果
        const successCount = uploadResults.value.length
        const totalCount = fileList.value.length

        if (successCount === 0) {
            overallProgress.value.status = 'exception'
            ElMessage.error('所有文件上传失败')
            emit('upload-error', error)
        } else {
            overallProgress.value.status = 'warning'
            ElMessage.warning(`部分文件上传成功 (${successCount}/${totalCount})`)

            const finalResult = uploadResults.value.reduce((acc, curr) => ({ ...acc, ...curr }), {})
            emit('upload-success', finalResult)
        }

        emit('upload-complete', {
            success: successCount,
            total: totalCount,
            results: uploadResults.value
        })

        // 延迟隐藏进度条
        setTimeout(() => {
            overallProgress.value.show = false
        }, 3000)
    }
}

// 文件数量超出限制
const handleExceed = () => {
    ElMessage.warning(`最多只能选择 ${props.maxFiles} 个文件`)
}

// 移除单个文件
const removeFile = (index) => {
    fileList.value.splice(index, 1)
    uploadRef.value?.handleRemove(fileList.value[index])
}

// 清空所有文件
const clearAllFiles = () => {
    fileList.value = []
    uploadResults.value = []
    overallProgress.value.show = false
    uploading.value = false
    uploadRef.value?.clearFiles()
    cancelTokenSources.clear()
}

// 取消所有上传
const cancelAllUploads = () => {
    // 取消所有正在进行的上传
    cancelTokenSources.forEach((source) => {
        source.cancel('用户取消上传')
    })

    uploading.value = false
    overallProgress.value.status = 'warning'

    setTimeout(() => {
        overallProgress.value.show = false
    }, 1000)
}

// 获取整体进度文本
const getOverallProgressText = () => {
    switch (overallProgress.value.status) {
        case 'success':
            return '全部上传完成'
        case 'exception':
            return '上传失败'
        case 'warning':
            return '上传已取消'
        default:
            return `正在上传 ${overallProgress.value.completed}/${overallProgress.value.total}`
    }
}

// 判断是否为图片文件
const isImageFile = (file) => {
    return file.type && file.type.startsWith('image/')
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化上传速度
const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond)
}

// 暴露方法给父组件
defineExpose({
    startBatchUpload,
    clearAllFiles,
    cancelAllUploads
})
</script>

<style scoped lang="scss">
.batch-file-upload {
    .file-list {
        margin-top: 16px;
        border: 1px solid #e4e7ed;
        border-radius: 6px;

        .file-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background-color: #f5f7fa;
            border-bottom: 1px solid #e4e7ed;
            font-size: 14px;
            font-weight: 500;
        }

        .file-items {
            max-height: 400px;
            overflow-y: auto;
        }

        .file-item {
            padding: 12px 16px;
            border-bottom: 1px solid #f0f0f0;
            transition: background-color 0.2s;

            &:last-child {
                border-bottom: none;
            }

            &:hover {
                background-color: #f9f9f9;
            }

            &.is-uploading {
                background-color: #f0f9ff;
            }

            &.is-success {
                background-color: #f0f9f0;
            }

            &.is-error {
                background-color: #fef0f0;
            }

            .file-info {
                display: flex;
                align-items: center;
                gap: 12px;

                .file-name-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    min-width: 0;

                    .file-icon {
                        font-size: 20px;
                        color: #606266;
                    }

                    .file-details {
                        flex: 1;
                        min-width: 0;

                        .original-name {
                            font-size: 14px;
                            color: #303133;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        .file-size {
                            font-size: 12px;
                            color: #909399;
                            margin-top: 2px;
                        }
                    }
                }

                .custom-name-input {
                    flex: 1;
                    max-width: 200px;
                }

                .file-actions {
                    flex-shrink: 0;
                }
            }

            .file-progress {
                margin-top: 8px;

                .progress-text {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 4px;
                    font-size: 12px;
                    color: #606266;
                }
            }
        }
    }

    .overall-progress {
        margin: 20px 0;
        padding: 16px;
        background-color: #f5f7fa;
        border-radius: 6px;
        border: 1px solid #e4e7ed;

        .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #606266;
        }

        .progress-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
            font-size: 12px;
            color: #909399;
        }
    }

    .upload-actions {
        margin-top: 16px;
        display: flex;
        gap: 8px;
    }

    &.is-uploading {
        :deep(.el-upload) {
            cursor: not-allowed;
        }
    }
}

:deep(.el-upload-dragger) {
    border: 2px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

    &:hover {
        border-color: #409eff;
    }
}
</style>