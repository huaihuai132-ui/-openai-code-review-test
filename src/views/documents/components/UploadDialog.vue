<template>
    <!-- 个人文件上传弹窗 -->
    <el-dialog v-model="visible" title="上传文件" width="600px" @closed="handleClosed">
        <el-form :model="form" label-width="80px">
            <el-form-item label="上传目录">
                <el-select v-model="form.targetDir" placeholder="选择上传目录或输入新目录" filterable allow-create clearable
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
        </el-form>
        <UploadFile ref="uploadFileRef" v-model="fileUrl" :drag="true"
            :file-type="['jpg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar']" :file-size="50"
            :show-custom-file-name="true" :directory="'documents'" :dir="form.targetDir"
            @upload-success="handleUploadSuccess" @upload-error="handleUploadError" />
        <template #footer>
            <el-button @click="visible = false">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { UploadFile } from '@/components/UploadFile'
import { useMessage } from '@/hooks/web/useMessage'

interface FolderItem {
    name: string
    path: string
}

interface Props {
    modelValue: boolean
    folders: FolderItem[]
    currentPath?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'upload-success': [result: any, file: any]
    'upload-error': [error: any, file: any]
}>()

const message = useMessage()

const visible = ref(props.modelValue)
const fileUrl = ref('')
const uploadFileRef = ref()

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

// 监听当前路径变化，设置默认上传目录
watch(() => props.currentPath, (newPath) => {
    if (newPath !== undefined) {
        form.targetDir = newPath
    }
}, { immediate: true })

const handleUploadSuccess = (result: any, file: any) => {
    console.log('文件上传成功:', result, file)
    message.success('文件上传成功！')

    if (uploadFileRef.value && uploadFileRef.value.resetComponent) {
        uploadFileRef.value.resetComponent()
    }

    visible.value = false
    emit('upload-success', result, file)
}

const handleUploadError = (error: any, file: any) => {
    console.error('文件上传失败:', error, file)
    message.error('文件上传失败')
    emit('upload-error', error, file)
}

const handleClosed = () => {
    // 重置表单
    form.targetDir = props.currentPath || ''
    fileUrl.value = ''
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
</style>
