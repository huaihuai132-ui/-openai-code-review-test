<template>
  <div class="py-4">
    <el-form-item label="会议附件" prop="fileList">
      <BatchFileUpload
        ref="batchUploadRef"
        v-model:fileList="files"
        mode="create"
        file-type="common"
        directory="meeting"
        :max-files="5"
        tip="支持批量上传多个文件，最多5个"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { BatchFileUpload } from '@/components/UploadFile'
import { computed, ref } from 'vue'

interface Props {
  fileList: string[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:fileList'])

const batchUploadRef = ref<typeof BatchFileUpload>()

const files = computed({
  get: () => props.fileList,
  set: (value) => emit('update:fileList', value)
})

// 暴露方法给父组件
const validateFiles = () => {
  return batchUploadRef.value?.validateFiles?.()
}

const markFilesAsSaved = () => {
  batchUploadRef.value?.markFilesAsSaved?.()
}

const clearUnsavedFiles = async () => {
  if (batchUploadRef.value) {
    await batchUploadRef.value.clearUnsavedFiles?.()
    batchUploadRef.value.resetComponent?.()
  }
}

const resetComponent = () => {
  batchUploadRef.value?.resetComponent?.()
}

defineExpose({
  validateFiles,
  markFilesAsSaved,
  clearUnsavedFiles,
  resetComponent,
  batchUploadRef
})
</script>
