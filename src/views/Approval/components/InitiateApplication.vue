<template>
  <div class="initiate-application">
    <div class="search-container">
      <el-input
        v-model="searchText"
        placeholder="输入申请名称查询"
        prefix-icon="Search"
        class="w-50"
      />
    </div>

    <div class="category-container">
      <div class="category-card">
        <div class="category-header">
          <i class="el-icon-wallet"></i>
          财务
        </div>

        <div class="card-grid">
          <div class="card-item" @click="navigateTo('expenseDaily')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-coin"></i>
            </div>
            <div class="card-text">日常费用报销</div>
          </div>

          <div class="card-item" @click="navigateTo('expenseTravel')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-trip"></i>
            </div>
            <div class="card-text">差旅报销单</div>
          </div>

          <div class="card-item" @click="navigateTo('loan')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-bank-card"></i>
            </div>
            <div class="card-text">借款单</div>
          </div>

          <div class="card-item" @click="navigateTo('expensePayment')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-s-fold"></i>
            </div>
            <div class="card-text">支出单</div>
          </div>

          <div class="card-item" @click="navigateTo('expenseTrip')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-trip"></i>
            </div>
            <div class="card-text">出差申请</div>
          </div>

          <div class="card-item" @click="navigateTo('invoice')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-coin"></i>
            </div>
            <div class="card-text">开票申请</div>
          </div>
        </div>
      </div>

      <div class="category-card">
        <div class="category-header">
          <i class="el-icon-user-solid"></i>
          考勤
        </div>

        <div class="card-grid">
          <div class="card-item" @click="navigateTo('leave')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-coin"></i>
            </div>
            <div class="card-text">请假</div>
          </div>

          <div class="card-item" @click="navigateTo('compensate')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-coin"></i>
            </div>
            <div class="card-text">补卡</div>
          </div>
        </div>
      </div>

      <div class="category-card">
        <div class="category-header">
          <i class="el-icon-user"></i>
          人力
        </div>

        <div class="card-grid">
          <div class="card-item" @click="navigateTo('convert')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-refresh-left"></i>
            </div>
            <div class="card-text">转正申请</div>
          </div>

          <div class="card-item" @click="navigateTo('resign')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-refresh-left"></i>
            </div>
            <div class="card-text">离职申请</div>
          </div>

          <div class="card-item" @click="navigateTo('transfer')">
            <div class="card-icon" style="background-color: #409EFF;">
              <i class="el-icon-refresh-left"></i>
            </div>
            <div class="card-text">调岗申请</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const searchText = ref('');
</script>

<style scoped lang="scss">
.initiate-application {
  padding: 20px;
  background-color: #f5f7fa;
}

.search-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.category-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-card {
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
}

.category-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.category-header i {
  margin-right: 10px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card-item {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 5px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.card-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
}

.card-text {
  color: #606266;
}
</style>
