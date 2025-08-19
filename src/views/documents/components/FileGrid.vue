<template>
    <div>
        <!-- 面包屑导航 -->
        <div class="breadcrumb-nav">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item @click="$emit('navigate-folder', '')" class="breadcrumb-item">
                    <Icon icon="ep:home-filled" class="mr-5px" />
                    根目录
                </el-breadcrumb-item>
                <el-breadcrumb-item v-for="(folder, index) in breadcrumbFolders" :key="index"
                    @click="$emit('navigate-folder', folder.path)" class="breadcrumb-item">
                    {{ folder.name }}
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <!-- 文件网格视图 -->
        <div v-loading="loading" class="file-grid">
            <!-- 文件夹 -->
            <div v-for="folder in folders" :key="'folder-' + folder.name" class="file-card folder-card"
                @dblclick="$emit('navigate-folder', folder.path)"
                @contextmenu.prevent="$emit('context-menu', $event, folder, 'folder')">
                <div class="file-icon-container">
                    <div class="folder-icon">📁</div>
                </div>
                <div class="file-info">
                    <div class="file-name" :title="folder.name">{{ folder.name }}</div>
                    <div class="file-meta">文件夹</div>
                </div>
            </div>

            <!-- 文件 -->
            <div v-for="(file, index) in files" :key="'file-' + file.id" class="file-card"
                :class="{ selected: isFileSelected(file) }" @click="$emit('file-click', file, index, $event)"
                @dblclick="$emit('preview-file', file)"
                @contextmenu.prevent="$emit('context-menu', $event, file, 'file')">
                <div class="file-icon-container">
                    <!-- 选择复选框 -->
                    <div v-if="selectMode" class="file-checkbox" @click.stop="$emit('toggle-selection', file)">
                        <el-checkbox :model-value="isFileSelected(file)" />
                    </div>

                    <el-image v-if="file.type && file.type.includes('image') && file.configId === 0" :src="file.url"
                        class="file-thumbnail" fit="cover" :preview-src-list="[file.url]" preview-teleported />
                    <div v-else class="file-icon">
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
        <el-empty v-if="!loading && files.length === 0 && folders.length === 0" description="当前文件夹为空" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fileSizeFormatter } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'

interface FileItem {
    id: number
    name: string
    type?: string
    size: number
    createTime: string
    configId: number
    url: string
    dir?: string
}

interface FolderItem {
    name: string
    path: string
}

interface Props {
    files: FileItem[]
    folders: FolderItem[]
    currentPath: string
    loading: boolean
    selectMode: boolean
    selectedFiles: FileItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'navigate-folder': [path: string]
    'file-click': [file: FileItem, index: number, event: MouseEvent]
    'preview-file': [file: FileItem]
    'context-menu': [event: MouseEvent, target: any, type: string]
    'toggle-selection': [file: FileItem]
}>()

const breadcrumbFolders = computed(() => {
    if (!props.currentPath) return []
    const parts = props.currentPath.split('/').filter(Boolean)
    const folders: any[] = []
    let path = ''

    parts.forEach(part => {
        path += (path ? '/' : '') + part
        folders.push({ name: part, path: path })
    })

    return folders
})

const isFileSelected = (file: FileItem) => {
    return props.selectedFiles.some(f => f.id === file.id)
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
</style>
