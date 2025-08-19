<template>
    <!-- 移动文件弹窗 -->
    <el-dialog v-model="visible" title="移动文件到目录" width="500px" @closed="handleClosed">
        <el-form :model="form" label-width="80px">
            <el-form-item label="目标目录">
                <el-select v-model="form.targetDir" placeholder="选择目标目录或输入新目录" filterable allow-create clearable
                    style="width: 100%">
                    <el-option label="根目录 (/)" value="">
                        <div class="folder-option">
                            <Icon icon="ep:home-filled" class="folder-icon" />
                            <span>根目录</span>
                        </div>
                    </el-option>
                    <el-option v-for="folder in folders" :key="folder.path" :label="folder.path" :value="folder.path">
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
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="confirmMove">确认移动</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface FolderItem {
    name: string
    path: string
}

interface Props {
    modelValue: boolean
    folders: FolderItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'confirm': [targetDir: string]
}>()

const visible = ref(props.modelValue)

const form = reactive({
    targetDir: ''
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    visible.value = newVal
})

// 监听 visible 变化
watch(visible, (newVal) => {
    emit('update:modelValue', newVal)
})

const confirmMove = () => {
    emit('confirm', form.targetDir)
    visible.value = false
}

const handleClosed = () => {
    form.targetDir = ''
}
</script>

<style scoped lang="scss">
.folder-option {
    display: flex;
    align-items: center;

    .folder-icon {
        margin-right: 8px;
        font-size: 16px;
        color: #409eff;
    }
}

.move-tips {
    display: flex;
    align-items: center;
    color: #909399;
    font-size: 12px;

    .tip-icon {
        margin-right: 4px;
        color: #409eff;
    }
}
</style>
