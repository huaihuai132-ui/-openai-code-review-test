<template>
    <!-- 右键菜单 -->
    <div v-show="visible" :style="{ left: x + 'px', top: y + 'px' }" class="context-menu" @click.stop>
        <div v-if="type === 'file'" class="menu-items">
            <div class="menu-item" @click="handleMenuClick('preview', target)">
                <Icon icon="ep:view" class="menu-icon" />
                预览
            </div>
            <div class="menu-item" @click="handleMenuClick('download', target)">
                <Icon icon="ep:download" class="menu-icon" />
                下载
            </div>
            <div class="menu-item" @click="handleMenuClick('share', target)">
                <Icon icon="ep:share" class="menu-icon" />
                分享
            </div>
            <div class="menu-item" @click="handleMenuClick('move', target)">
                <Icon icon="ep:folder" class="menu-icon" />
                移动
            </div>
            <div class="menu-item" @click="handleMenuClick('rename', target)">
                <Icon icon="ep:edit-pen" class="menu-icon" />
                重命名
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" @click="handleMenuClick('set-public', target)">
                <Icon icon="ep:unlock" class="menu-icon" />
                设为公共
            </div>
            <div class="menu-item danger" @click="handleMenuClick('delete', target)">
                <Icon icon="ep:delete" class="menu-icon" />
                删除
            </div>
        </div>
        <div v-else-if="type === 'folder'" class="menu-items">
            <div class="menu-item" @click="handleFolderClick('open-folder', target.path)">
                <Icon icon="ep:folder-opened" class="menu-icon" />
                打开
            </div>
            <div class="menu-item" @click="handleMenuClick('rename-folder', target)">
                <Icon icon="ep:edit" class="menu-icon" />
                重命名
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item danger" @click="handleMenuClick('delete-folder', target)">
                <Icon icon="ep:delete" class="menu-icon" />
                删除文件夹
            </div>
        </div>
        <div v-else-if="type === 'shared-file'" class="menu-items">
            <div class="menu-item" @click="handleMenuClick('preview', target)">
                <Icon icon="ep:view" class="menu-icon" />
                预览
            </div>
            <div class="menu-item" @click="handleMenuClick('download', target)">
                <Icon icon="ep:download" class="menu-icon" />
                下载
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" @click="handleMenuClick('unshare-from-me', target)">
                <Icon icon="ep:close" class="menu-icon" />
                取消订阅
            </div>
        </div>
        <div v-else-if="type === 'public-file'" class="menu-items">
            <div class="menu-item" @click="handleMenuClick('preview', target)">
                <Icon icon="ep:view" class="menu-icon" />
                预览
            </div>
            <div class="menu-item" @click="handleMenuClick('download', target)">
                <Icon icon="ep:download" class="menu-icon" />
                下载
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, nextTick } from 'vue'

interface Props {
    visible: boolean
    x: number
    y: number
    target: any
    type: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
    'preview': [target: any]
    'download': [target: any]
    'share': [target: any]
    'move': [target: any]
    'rename': [target: any]
    'set-public': [target: any]
    'delete': [target: any]
    'open-folder': [path: string]
    'rename-folder': [target: any]
    'delete-folder': [target: any]
    'unshare-from-me': [target: any]
}>()

// 监听visible变化，添加/移除点击事件监听
watch(() => props.visible, (newVal) => {
    if (newVal) {
        nextTick(() => {
            document.addEventListener('click', hideMenu)
        })
    } else {
        document.removeEventListener('click', hideMenu)
    }
})

const hideMenu = () => {
    emit('update:visible', false)
}

// 处理菜单项点击，先隐藏菜单再触发事件
const handleMenuClick = (eventName: string, target: any) => {
    hideMenu()
    emit(eventName as any, target)
}

// 处理文件夹特殊情况（open-folder需要传path）
const handleFolderClick = (eventName: string, path: string) => {
    hideMenu()
    emit(eventName as any, path)
}

// 组件卸载时清理事件监听
import { onUnmounted } from 'vue'
onUnmounted(() => {
    document.removeEventListener('click', hideMenu)
})
</script>

<style scoped lang="scss">
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
</style>
