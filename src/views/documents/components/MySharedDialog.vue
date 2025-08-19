<template>
    <!-- 我分享的文件弹窗 -->
    <el-dialog v-model="visible" title="我分享的文件" width="800px" @closed="handleClosed">
        <div v-loading="loading">
            <div v-if="files.length === 0" class="empty-state">
                <el-empty description="暂无分享的文件" />
            </div>
            <div v-else>
                <div v-for="file in files" :key="file.id" class="shared-file-item">
                    <div class="file-header">
                        <div class="file-basic-info">
                            <div class="file-icon" style="font-size: 24px; color: #409eff;">
                                {{ getFileTypeIcon(file.name || '') }}
                            </div>
                            <div class="file-details">
                                <div class="file-name">{{ file.name }}</div>
                                <div class="file-meta">
                                    <span>{{ fileSizeFormatter(null, null, file.size) }}</span>
                                    <span class="file-date">{{ dateFormatter(null, null, file.createTime) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="file-actions">
                            <el-button size="small" @click="$emit('preview-file', file)">
                                <Icon icon="ep:view" class="mr-5px" />
                                预览
                            </el-button>
                            <el-button size="small" @click="$emit('download-file', file)">
                                <Icon icon="ep:download" class="mr-5px" />
                                下载
                            </el-button>
                        </div>
                    </div>

                    <div class="shared-users-section">
                        <div class="section-title">
                            <Icon icon="ep:user" class="mr-5px" />
                            已分享给 {{ file.sharedToUsers.length }} 个用户
                        </div>
                        <div class="shared-users-list">
                            <div v-for="user in file.sharedToUsers" :key="user.userId" class="shared-user-item">
                                <div class="user-info">
                                    <Icon icon="ep:user" class="user-icon" />
                                    <span class="user-name">{{ user.nickname }}</span>
                                </div>
                                <div class="share-details">
                                    <el-tag v-if="user.permission === 1" type="info" size="small">
                                        <Icon icon="ep:view" class="mr-2px" />
                                        只读
                                    </el-tag>
                                    <el-tag v-else-if="user.permission === 2" type="success" size="small">
                                        <Icon icon="ep:edit" class="mr-2px" />
                                        可写
                                    </el-tag>
                                    <span class="share-time">{{ dateFormatter(null, null, user.shareTime) }}</span>
                                    <span v-if="user.expiredTime" class="expire-time">
                                        到期：{{ dateFormatter(null, null, user.expiredTime) }}
                                    </span>
                                    <span v-else class="expire-time permanent">永久有效</span>
                                    <el-button size="small" type="danger" plain class="unshare-btn"
                                        @click="$emit('unshare-user', file.id, user.userId)"
                                        :title="`取消对 ${user.nickname} 的分享`">
                                        <Icon icon="ep:close" class="mr-2px" />
                                        取消分享
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <el-button @click="visible = false">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { fileSizeFormatter } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import type { MySharedFileVO } from '@/api/infra/file/index'

interface Props {
    modelValue: boolean
    files: MySharedFileVO[]
    loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'preview-file': [file: MySharedFileVO]
    'download-file': [file: MySharedFileVO]
    'unshare-user': [fileId: number, userId: string]
}>()

const visible = ref(props.modelValue)

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    visible.value = newVal
})

// 监听 visible 变化
watch(visible, (newVal) => {
    emit('update:modelValue', newVal)
})

const handleClosed = () => {
    // 可以在这里处理关闭时的逻辑
}

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
</script>

<style scoped lang="scss">
// 我分享的文件弹窗样式
.shared-file-item {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;

    .file-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e4e7ed;

        .file-basic-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .file-details {
                .file-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #303133;
                    margin-bottom: 4px;
                }

                .file-meta {
                    display: flex;
                    gap: 12px;
                    font-size: 12px;
                    color: #909399;

                    .file-date {
                        color: #606266;
                    }
                }
            }
        }

        .file-actions {
            display: flex;
            gap: 8px;
        }
    }

    .shared-users-section {
        padding: 16px;

        .section-title {
            display: flex;
            align-items: center;
            font-size: 14px;
            font-weight: 600;
            color: #606266;
            margin-bottom: 12px;
        }

        .shared-users-list {
            .shared-user-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background-color: #f8f9fa;
                border-radius: 6px;
                margin-bottom: 8px;

                &:last-child {
                    margin-bottom: 0;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .user-icon {
                        color: #409eff;
                        font-size: 16px;
                    }

                    .user-name {
                        font-size: 14px;
                        font-weight: 500;
                        color: #303133;
                    }
                }

                .share-details {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 12px;

                    .share-time {
                        color: #909399;
                    }

                    .expire-time {
                        color: #f56c6c;

                        &.permanent {
                            color: #67c23a;
                        }
                    }

                    .unshare-btn {
                        margin-left: 8px;
                    }
                }
            }
        }
    }
}
</style>
