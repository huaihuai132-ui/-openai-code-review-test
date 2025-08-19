<template>
    <!-- 文件分享弹窗 -->
    <el-dialog v-model="visible" title="分享文件" width="600px" @closed="handleClosed">
        <el-form :model="form" label-width="80px">
            <el-form-item label="分享给">
                <div class="share-users-container">
                    <div v-if="selectedUsers.length === 0" class="no-users-selected">
                        <Icon icon="ep:user-filled" class="user-icon" />
                        <span class="placeholder-text">请选择要分享的用户</span>
                        <el-button type="text" @click="openUserSelect" class="select-user-btn">
                            <Icon icon="ep:plus" class="mr-5px" />
                            选择用户
                        </el-button>
                    </div>
                    <div v-else class="selected-users-container">
                        <div class="selected-users-header">
                            <span class="users-count">已选择 {{ selectedUsers.length }} 个用户</span>
                            <el-button type="text" @click="openUserSelect" class="add-more-btn">
                                <Icon icon="ep:plus" class="mr-5px" />
                                添加更多
                            </el-button>
                        </div>
                        <div class="selected-users-list">
                            <el-tag v-for="user in selectedUsers" :key="user.id" closable @close="removeUser(user.id)"
                                class="user-tag" type="info" effect="plain">
                                <Icon icon="ep:user" class="mr-5px" />
                                {{ user.nickname }}
                            </el-tag>
                        </div>
                    </div>
                </div>
            </el-form-item>
            <el-form-item label="到期时间">
                <el-date-picker v-model="form.expiredTime" type="datetime" placeholder="选择到期时间，留空表示永久有效"
                    format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" clearable style="width: 100%" />
                <div class="time-tip">
                    <Icon icon="ep:info-filled" class="tip-icon" />
                    <span>不设置到期时间表示永久有效</span>
                </div>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="confirmShare" :disabled="selectedUsers.length === 0">确认分享</el-button>
        </template>

        <!-- 用户选择组件 -->
        <UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelect" />
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useMessage } from '@/hooks/web/useMessage'
import UserSelectForm from '@/components/UserSelectForm/index.vue'
import * as FileApi from '@/api/infra/file/index'

interface UserItem {
    id: string
    nickname: string
}

interface Props {
    modelValue: boolean
    fileId?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'share-success': []
}>()

const message = useMessage()

const visible = ref(props.modelValue)
const selectedUsers = ref<UserItem[]>([])
const userSelectFormRef = ref()

const form = reactive({
    fileId: 0,
    userId: '',
    permission: 1,
    expiredTime: ''
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    visible.value = newVal
})

// 监听 visible 变化
watch(visible, (newVal) => {
    emit('update:modelValue', newVal)
})

// 监听 fileId 变化
watch(() => props.fileId, (newFileId) => {
    if (newFileId) {
        form.fileId = newFileId
    }
}, { immediate: true })

const openUserSelect = () => {
    userSelectFormRef.value?.open(form.fileId, selectedUsers.value)
}

const handleUserSelect = (fileId: number, userList: UserItem[]) => {
    selectedUsers.value = userList
}

const removeUser = (userId: string) => {
    selectedUsers.value = selectedUsers.value.filter(user => user.id !== userId)
}

const confirmShare = async () => {
    try {
        if (selectedUsers.value.length === 0) {
            message.error('请选择要分享的用户')
            return
        }

        const userIds = selectedUsers.value.map(user => user.id)

        let expiredTime = form.expiredTime
        if (!expiredTime || expiredTime === '' || expiredTime === 'Invalid Date') {
            expiredTime = null
        }

        const shareData = {
            fileId: form.fileId,
            userIds: userIds,
            permission: form.permission,
            expiredTime: expiredTime
        }

        console.log('批量分享文件:', shareData)
        await FileApi.shareFileBatch(shareData)
        message.success(`文件分享成功！已分享给${selectedUsers.value.length}个用户`)

        visible.value = false
        emit('share-success')
    } catch (error) {
        console.error('文件分享失败:', error)
        message.error('文件分享失败')
    }
}

const handleClosed = () => {
    // 重置表单
    selectedUsers.value = []
    form.fileId = 0
    form.userId = ''
    form.permission = 1
    form.expiredTime = ''
}
</script>

<style scoped lang="scss">
.share-users-container {
    .no-users-selected {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        background: #f8f9fa;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
            border-color: #409eff;
            background: #f0f9ff;
        }

        .user-icon {
            font-size: 20px;
            color: #9ca3af;
            margin-right: 12px;
        }

        .placeholder-text {
            flex: 1;
            color: #6b7280;
            font-size: 14px;
        }

        .select-user-btn {
            color: #409eff;
            font-weight: 500;

            &:hover {
                color: #337ecc;
            }
        }
    }

    .selected-users-container {
        .selected-users-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;

            .users-count {
                font-size: 14px;
                color: #374151;
                font-weight: 500;
            }

            .add-more-btn {
                color: #409eff;
                font-size: 13px;

                &:hover {
                    color: #337ecc;
                }
            }
        }

        .selected-users-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .user-tag {
                margin: 0;
                border-radius: 20px;
                padding: 6px 12px;
                font-size: 13px;

                &:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
                }
            }
        }
    }
}

.time-tip {
    display: flex;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
    color: #6b7280;

    .tip-icon {
        margin-right: 4px;
        color: #409eff;
        font-size: 14px;
    }
}
</style>
