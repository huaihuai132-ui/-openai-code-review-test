<template>
  <div class="approval-system">
    <div class="tab-container">
      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane label="发起申请" name="initiate"/>
        <el-tab-pane label="审批中心" name="approval"/>
      </el-tabs>
    </div>

    <div v-if="activeTab === 'initiate'" class="content-container">
      <InitiateApplication />
    </div>

    <div v-else class="content-container">
      <ApprovalCenter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ApprovalCenter from './components/ApprovalCenter.vue';
import InitiateApplication from './components/InitiateApplication.vue';

const activeTab = ref('approval');
</script>

<style scoped lang="scss">
.approval-system {
  display: flex;
  flex-direction: column;
  height: 83vh;
  overflow: hidden;
}

.tab-container {
  padding: 0 20px;
  margin-bottom: 10px;
}

.content-container {
  flex: 1;
  overflow: hidden;
  background-color: #f5f7fa;
}
</style>
