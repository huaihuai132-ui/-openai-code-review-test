<template>
    <div class="single-file-upload">
        <el-upload ref="uploadRef" v-model:file-list="fileList" :action="uploadUrl" :auto-upload="false"
            :disabled="uploading" :limit="1" :on-change="handleFileChange" :on-error="handleUploadError"
            :on-exceed="handleExceed" :on-success="handleUploadSuccess" :http-request="httpRequest"
            :show-file-list="showFileList" :drag="drag" :accept="accept" :class="{ 'is-uploading': uploading }">
            <div v-if="drag">
                <div v-if="!uploading">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
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

        <!-- 文件名输入框 -->
        <div v-if="showFileList && fileList.length > 0" class="file-name-input">
            <el-input v-model="customFileName" placeholder="请输入文件名（可选，默认使用原文件名）" :disabled="uploading" clearable>
                <template #prepend>文件名</template>
            </el-input>
        </div>

        <!-- 上传进度 -->
        <div v-if="uploadProgress.show" class="upload-progress">
            <div class="progress-info">
                <span class="progress-text">{{ getProgressText() }}</span>
                <span class="progress-percentage">{{ uploadProgress.percentage }}%</span>
            </div>
            <el-progress :percentage="uploadProgress.percentage" :status="uploadProgress.status" :stroke-width="8"
                :show-text="false" />
            <div class="progress-details" v-if="uploadProgress.loaded && uploadProgress.total">
                <span>{{ formatFileSize(uploadProgress.loaded) }} / {{ formatFileSize(uploadProgress.total) }}</span>
                <span class="upload-speed" v-if="uploadProgress.speed">{{ formatSpeed(uploadProgress.speed) }}/s</span>
            </div>

            <!-- 估算剩余时间 -->
            <div v-if="uploadProgress.estimatedTime && uploadProgress.status === 'info'" class="estimated-time">
                预计剩余时间：{{ formatTime(uploadProgress.estimatedTime) }}
            </div>

            <!-- 取消上传按钮 -->
            <div v-if="uploadProgress.status === 'info'" class="progress-actions">
                <el-button size="small" @click="cancelUpload">取消上传</el-button>
            </div>
        </div>

        <!-- 上传按钮 -->
        <div v-if="showUploadButton && fileList.length > 0 && !uploading" class="upload-actions">
            <el-button type="primary" @click="startUpload" :disabled="uploading">
                开始上传
            </el-button>
            <el-button @click="clearFiles">清空</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import { useUpload } from '@/components/UploadFile/src/useUpload'

// 组件属性
const props = defineProps({
    // 是否显示文件列表
    showFileList: {
        type: Boolean,
        default: true
    },
    // 是否显示上传按钮
    showUploadButton: {
        type: Boolean,
        default: true
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
    // 自动上传
    autoUpload: {
        type: Boolean,
        default: false
    }
})

// 组件事件
const emit = defineEmits([
    'upload-success',
    'upload-error',
    'upload-progress',
    'file-change'
])

// 响应式数据
const uploadRef = ref()
const fileList = ref([])
const customFileName = ref('')
const uploading = ref(false)
let cancelTokenSource = null

// 上传进度
const uploadProgress = ref({
    show: false,
    percentage: 0,
    status: 'info' as 'success' | 'exception' | 'warning' | 'info',
    loaded: 0,
    total: 0,
    speed: 0,
    startTime: 0,
    estimatedTime: 0
})

const { uploadUrl, httpRequest: originalHttpRequest } = useUpload(props.directory)

// 增强的httpRequest
const httpRequest = async (options) => {
    const axios = (await import('axios')).default

    cancelTokenSource = axios.CancelToken.source()

    uploadProgress.value = {
        show: true,
        percentage: 0,
        status: 'info',
        loaded: 0,
        total: 0,
        speed: 0,
        startTime: Date.now(),
        estimatedTime: 0
    }

    const enhancedOptions = {
        ...options,
        cancelToken: cancelTokenSource.token,
        onProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                const currentTime = Date.now()
                const timeElapsed = (currentTime - uploadProgress.value.startTime) / 1000
                const speed = timeElapsed > 0 ? progressEvent.loaded / timeElapsed : 0

                const remainingBytes = progressEvent.total - progressEvent.loaded
                const estimatedTime = speed > 0 ? remainingBytes / speed : 0

                uploadProgress.value = {
                    ...uploadProgress.value,
                    percentage,
                    loaded: progressEvent.loaded,
                    total: progressEvent.total,
                    speed,
                    estimatedTime,
                    status: percentage === 100 ? 'success' : 'info'
                }

                emit('upload-progress', {
                    percentage,
                    loaded: progressEvent.loaded,
                    total: progressEvent.total,
                    speed
                })
            }
        }
    }

    try {
        const result = await originalHttpRequest(enhancedOptions)
        uploadProgress.value.status = 'success'
        uploadProgress.value.percentage = 100
        uploadProgress.value.estimatedTime = 0
        return result
    } catch (error) {
        if (axios.isCancel(error)) {
            uploadProgress.value.status = 'warning'
            ElMessage.warning('上传已取消')
        } else {
            uploadProgress.value.status = 'exception'
            throw error
        }
    }
}

// 文件改变处理
const handleFileChange = (file, fileList) => {
    // 如果没有自定义文件名，使用原文件名（去掉扩展名）
    if (!customFileName.value && file.name) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
        customFileName.value = nameWithoutExt
    }

    emit('file-change', file, fileList)

    // 自动上传
    if (props.autoUpload && fileList.length > 0) {
        startUpload()
    }
}

// 开始上传
const startUpload = () => {
    if (fileList.value.length === 0) {
        ElMessage.warning('请先选择文件')
        return
    }

    uploading.value = true
    uploadRef.value?.submit()
}

// 上传成功处理
const handleUploadSuccess = (response, file) => {
    uploading.value = false

    // 延迟一下让用户看到上传完成状态
    setTimeout(() => {
        uploadProgress.value.show = false

        // 构造返回数据：{ 文件名: URL }
        const fileName = customFileName.value || file.name
        const result = {
            [fileName]: response.data
        }

        emit('upload-success', result, file)
        ElMessage.success('文件上传成功')

        // 清空文件列表
        clearFiles()
    }, 1000)
}

// 上传错误处理
const handleUploadError = (error, file) => {
    uploading.value = false
    uploadProgress.value.status = 'exception'
    emit('upload-error', error, file)
    ElMessage.error('文件上传失败')
}

// 文件数量超出限制
const handleExceed = () => {
    ElMessage.warning('只能上传一个文件')
}

// 取消上传
const cancelUpload = () => {
    if (cancelTokenSource) {
        cancelTokenSource.cancel('用户取消上传')
        uploading.value = false
        setTimeout(() => {
            uploadProgress.value.show = false
        }, 1000)
    }
}

// 清空文件
const clearFiles = () => {
    fileList.value = []
    customFileName.value = ''
    uploadProgress.value.show = false
    uploading.value = false
    uploadRef.value?.clearFiles()
    if (cancelTokenSource) {
        cancelTokenSource = null
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

// 格式化时间
const formatTime = (seconds: number): string => {
    if (seconds < 60) {
        return `${Math.round(seconds)}秒`
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.round(seconds % 60)
        return `${minutes}分${remainingSeconds}秒`
    } else {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}小时${minutes}分钟`
    }
}

// 暴露方法给父组件
defineExpose({
    startUpload,
    clearFiles,
    cancelUpload
})
</script>

<style scoped lang="scss">
.single-file-upload {
    .file-name-input {
        margin-top: 12px;
    }

    .upload-progress {
        margin: 20px 0;
        padding: 16px;
        background-color: #f5f7fa;
        border-radius: 6px;
        border: 1px solid #e4e7ed;

        .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .progress-text {
                font-size: 14px;
                color: #606266;
                font-weight: 500;
            }

            .progress-percentage {
                font-size: 14px;
                color: #409eff;
                font-weight: bold;
            }
        }

        .progress-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
            font-size: 12px;
            color: #909399;

            .upload-speed {
                color: #67c23a;
                font-weight: 500;
            }
        }

        .estimated-time {
            margin-top: 8px;
            font-size: 12px;
            color: #909399;
            text-align: center;
        }

        .progress-actions {
            margin-top: 12px;
            text-align: center;
        }
    }

    .upload-actions {
        margin-top: 12px;
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