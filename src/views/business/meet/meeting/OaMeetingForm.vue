<template>
  <MeetingFormContainer ref="meetingFormContainerRef" @success="handleSuccess" />
</template>

<script setup lang="ts">
import MeetingFormContainer from './components/MeetingFormContainer.vue'

/** 会议表单 - 新版本 */
defineOptions({ name: 'OaMeetingForm' })

const meetingFormContainerRef = ref<typeof MeetingFormContainer>()

/** 打开弹窗 */
const open = (type: string, id?: number) => {
  meetingFormContainerRef.value?.open(type, id)
}

/** 处理成功事件 */
const handleSuccess = () => {
  // 兼容原接口
}

defineExpose({ open })
</script>