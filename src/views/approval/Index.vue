<template>
  <div class="approval-system">
    <div class="tab-container">
      <el-tabs v-model="activeTab" class="demo-tabs" type="card">
        <el-tab-pane label="发起申请" name="initiate" />
        <el-tab-pane label="审批中心" name="approval" />
      </el-tabs>
    </div>

    <div class="main-card">
      <div v-if="activeTab === 'initiate'" class="content-container">
        <InitiateApplication />
      </div>

      <div v-else class="content-container">
        <ApprovalCenter />
      </div>
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
  height: 81vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e9eff7 100%);
}

.tab-container {
  padding: 0 20px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  background: #fff;
  border-radius: 8px 8px 0 0;
}

.main-card {
  flex: 1;
  margin: 0 20px 20px 20px;
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-container {
  flex: 1;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 0 0 12px 12px;
}
</style>
