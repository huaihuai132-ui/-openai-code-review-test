<template>
  <div class="home">
    <!-- 运营数据卡片组件 -->
    <OperationCards />

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 预警消息组件 -->
      <el-col :span="12">
        <WarningMessages />
      </el-col>

      <!-- 出租公示情况组件 -->
      <el-col :span="12">
        <RentalPublicity />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import OperationCards from './components/OperationCards.vue'
import WarningMessages from './components/WarningMessages.vue'
import RentalPublicity from './components/RentalPublicity.vue'
</script>

<style scoped>
.home {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home {
    padding: 16px;
  }
}
</style>
