<template>
    <!-- 公共文件上传弹窗 -->
    <el-dialog v-model="visible" title="上传公共文件" width="600px" @closed="handleClosed">
        <UploadFile ref="uploadFileRef" v-model="fileUrl" :drag="true"
            :file-type="['jpg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar']" :file-size="50"
            :show-custom-file-name="true" directory="public" @upload-success="handleUploadSuccess"
            @upload-error="handleUploadError" />
        <template #footer>
            <el-button @click="visible = false">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UploadFile } from '@/components/UploadFile'
import { useMessage } from '@/hooks/web/useMessage'
import * as FileApi from '@/api/infra/file/index'

interface Props {
    modelValue: boolean
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

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    visible.value = newVal
})

// 监听 visible 变化
watch(visible, (newVal) => {
    emit('update:modelValue', newVal)
})

const handleUploadSuccess = async (result: any, file: any) => {
    try {
        const fileId = result?.id
        if (fileId) {
            await FileApi.setFilePublic(fileId)

            if (uploadFileRef.value && uploadFileRef.value.markFilesAsSaved) {
                uploadFileRef.value.markFilesAsSaved()
            }

            message.success('公共文件上传并设置成功！')
            emit('upload-success', result, file)
        } else {
            message.error('文件ID获取失败')
        }
    } catch (error) {
        console.error('设置公共文件失败:', error)
        message.error('设置公共文件失败')
    }

    if (uploadFileRef.value && uploadFileRef.value.resetComponent) {
        uploadFileRef.value.resetComponent()
    }

    visible.value = false
}

const handleUploadError = (error: any, file: any) => {
    console.error('公共文件上传失败:', error, file)
    message.error('公共文件上传失败')
    emit('upload-error', error, file)
}

const handleClosed = () => {
    fileUrl.value = ''
}
</script>
