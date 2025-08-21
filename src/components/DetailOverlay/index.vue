<template>
  <div v-if="visible" class="detail-overlay-container">
    <!-- 半透明背景蒙层 -->
    <div class="detail-overlay" @click="handleClose"></div>

    <!-- 详情面板 -->
    <div class="detail-panel">
      <div class="detail-header">
        <span class="detail-title">{{ title }}</span>
        <el-button link @click="handleClose">
          <el-icon>
            <Close />
          </el-icon>
        </el-button>
      </div>
      <div class="detail-content">
        <el-config-provider :z-index="10000" namespace="el">
          <slot></slot>
        </el-config-provider>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  title?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '详情'
})

const emit = defineEmits<Emits>()

const handleClose = () => {
  emit('close')
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.detail-overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 90%;
  height: 100%;
  background: #fff;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
  background: #f8f9fa;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.detail-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  background: #fff;
}

/* 确保Element Plus下拉组件在蒙层中正确显示 */
:deep(.el-popper) {
  z-index: 10000 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-panel {
    width: 100%;
  }

  .detail-header {
    padding: 16px 20px;
  }

  .detail-content {
    padding: 20px;
  }

  .detail-title {
    font-size: 16px;
  }
}
</style>
