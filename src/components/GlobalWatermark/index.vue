<script lang="ts" setup>
import { useWatermark } from '@/hooks/web/useWatermark'
import { useUserStore } from '@/store/modules/user'
import { onMounted, ref, watch } from 'vue'

defineOptions({ name: 'GlobalWatermark' })

// 水印开关，可以通过修改此变量来控制是否显示水印
const enableWatermark = ref(true)

// 获取用户信息
const userStore = useUserStore()
const { setWatermark, clear } = useWatermark()

// 设置水印的函数
const updateWatermark = () => {
  if (enableWatermark.value) {
    // 使用用户昵称作为水印内容
    const nickname = userStore.user.nickname || ''
    if (nickname) {
      setWatermark(nickname)
    }
  } else {
    clear()
  }
}

// 监听用户信息变化
watch(
  () => userStore.user.nickname,
  (newVal) => {
    if (newVal && enableWatermark.value) {
      setWatermark(newVal)
    }
  }
)

// 监听水印开关变化
watch(
  () => enableWatermark.value,
  (newVal) => {
    if (newVal) {
      updateWatermark()
    } else {
      clear()
    }
  }
)

onMounted(() => {
  updateWatermark()
})

// 提供清除水印的方法，以便需要时调用
defineExpose({
  setWatermark,
  clear,
  enableWatermark
})
</script>

<template>
  <div></div>
</template>