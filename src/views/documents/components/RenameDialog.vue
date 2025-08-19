<template>
    <!-- 重命名文件弹窗 -->
    <el-dialog v-model="visible" title="重命名文件" width="450px" @opened="focusInput" @closed="handleClosed">
        <el-form :model="form" label-width="80px">
            <el-form-item label="文件名">
                <el-row :gutter="8">
                    <el-col :span="16">
                        <el-input ref="fileNameInputRef" v-model="form.fileName" placeholder="请输入文件名"
                            @keyup.enter="confirmRename" />
                    </el-col>
                    <el-col :span="8">
                        <el-input v-model="form.fileExtension" placeholder="扩展名" @keyup.enter="confirmRename">
                            <template #prepend>.</template>
                        </el-input>
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="confirmRename" :disabled="!form.fileName.trim()">确认重命名</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'

interface Props {
    modelValue: boolean
    fileName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'confirm': [newName: string]
}>()

const visible = ref(props.modelValue)
const fileNameInputRef = ref()

const form = reactive({
    fileName: '',
    fileExtension: ''
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    visible.value = newVal
    if (newVal && props.fileName) {
        parseFileName(props.fileName)
    }
})

// 监听 visible 变化
watch(visible, (newVal) => {
    emit('update:modelValue', newVal)
})

const parseFileName = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf('.')

    if (lastDotIndex > 0 && lastDotIndex < fileName.length - 1) {
        form.fileName = fileName.substring(0, lastDotIndex)
        form.fileExtension = fileName.substring(lastDotIndex + 1)
    } else {
        form.fileName = fileName
        form.fileExtension = ''
    }
}

const confirmRename = () => {
    if (!form.fileName.trim()) {
        return
    }

    const newFileName = form.fileExtension.trim()
        ? `${form.fileName.trim()}.${form.fileExtension.trim()}`
        : form.fileName.trim()

    emit('confirm', newFileName)
    visible.value = false
}

const focusInput = () => {
    nextTick(() => {
        if (fileNameInputRef.value) {
            fileNameInputRef.value.focus()
            fileNameInputRef.value.select()
        }
    })
}

const handleClosed = () => {
    form.fileName = ''
    form.fileExtension = ''
}
</script>
