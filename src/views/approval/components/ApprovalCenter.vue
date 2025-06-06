<template>
  <div class="approval-center">
    <div class="sidebar">
      <div class="search-container">
        <el-input v-model="searchText" placeholder="模糊搜索单据" prefix-icon="Search" class="w-100" />
      </div>

      <div class="category-section">
        <div class="category-header">
          <i class="el-icon-user-solid"></i>
          待审批
          <i class="el-icon-arrow-down"></i>
        </div>

        <div class="category-item active" @click="selectCategory('all')">
          <span>全部</span>
          <span v-if="activeCategory === 'all'" class="badge">13</span>
        </div>

        <div class="category-item" @click="selectCategory('baoxiao')">
          <span>报销</span>
        </div>

        <div class="category-item" @click="selectCategory('project')">
          <span>项目</span>
          <span class="badge">1</span>
        </div>

        <div class="category-item" @click="selectCategory('workhour')">
          <span>工时</span>
        </div>

        <div class="category-item" @click="selectCategory('duizhang')">
          <span>对账</span>
        </div>

        <div class="category-item" @click="selectCategory('invoice')">
          <span>发票</span>
        </div>

        <div class="category-item" @click="selectCategory('guozi')">
          <span>国资</span>
        </div>
      </div>

      <div class="category-section">
        <div class="category-header">
          <i class="el-icon-document-checked"></i>
          已审批
          <i class="el-icon-arrow-down"></i>
        </div>
      </div>

      <div class="category-section">
        <div class="category-header">
          <i class="el-icon-user"></i>
          我申请的
          <i class="el-icon-arrow-down"></i>
        </div>
      </div>
    </div>

    <div class="main-content" :class="{ 'has-active-card': activeCard !== null }">
      <div class="filter-bar">
        <div class="filter-item" @click="filterClick('time')">
          <span>所有时间</span>
          <i class="el-icon-arrow-down"></i>
        </div>
        <div class="filter-item" @click="filterClick('arrive')">
          <span>到达排</span>
          <i class="el-icon-arrow-down"></i>
        </div>
      </div>

      <div class="card-list">
        <div class="card-item" @click="selectCard(0)">
          <div class="card-header">
            <span>市内交通费</span>
            <span v-if="activeCard === 0" class="badge">2</span>
          </div>

          <div class="card-detail">
            <div class="detail-item">
              <span class="label">部门：</span>
              <span class="value">信息中心</span>
            </div>

            <div class="detail-item">
              <span class="label">所属项目：</span>
              <span class="value">报销系统2.0</span>
            </div>

            <div class="detail-item">
              <span class="label">申请时间：</span>
              <span class="value">2022年8月22日 18:00</span>
            </div>

            <div class="detail-item">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" class="avatar" />
              <span class="name">郭睿</span>
              <span class="time">26分钟前到达</span>
            </div>
          </div>
        </div>

        <div class="card-item" @click="selectCard(1)">
          <div class="card-header">
            <span>差旅报销单</span>
          </div>

          <div class="card-detail">
            <div class="detail-item">
              <span class="label">部门：</span>
              <span class="value">信息中心</span>
            </div>

            <div class="detail-item">
              <span class="label">所属项目：</span>
              <span class="value">报销系统2.0</span>
            </div>

            <div class="detail-item">
              <span class="label">申请时间：</span>
              <span class="value">2022年8月22日 18:00</span>
            </div>

            <div class="detail-item">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" class="avatar" />
              <span class="name">郭睿</span>
              <span class="time">26分钟前到达</span>
            </div>
          </div>
        </div>

        <div class="card-item" @click="selectCard(2)">
          <div class="card-header">
            <span>借款单</span>
          </div>

          <div class="card-detail">
            <div class="detail-item">
              <span class="label">部门：</span>
              <span class="value">信息中心</span>
            </div>

            <div class="detail-item">
              <span class="label">所属项目：</span>
              <span class="value">报销系统2.0</span>
            </div>

            <div class="detail-item">
              <span class="label">申请时间：</span>
              <span class="value">2022年8月22日 18:00</span>
            </div>

            <div class="detail-item">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" class="avatar" />
              <span class="name">郭睿</span>
              <span class="time">26分钟前到达</span>
            </div>
          </div>
        </div>

        <div class="card-item" @click="selectCard(3)">
          <div class="card-header">
            <span>支出单</span>
          </div>

          <div class="card-detail">
            <div class="detail-item">
              <span class="label">部门：</span>
              <span class="value">信息中心</span>
            </div>

            <div class="detail-item">
              <span class="label">所属项目：</span>
              <span class="value">报销系统2.0</span>
            </div>

            <div class="detail-item">
              <span class="label">申请时间：</span>
              <span class="value">2022年8月22日 18:00</span>
            </div>

            <div class="detail-item">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" class="avatar" />
              <span class="name">郭睿</span>
              <span class="time">26分钟前到达</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="overlay" v-if="activeCard !== null" @click="activeCard = null"></div>

    <div class="detail-panel" v-if="activeCard !== null">
      <div class="detail-header">
        <span class="title">{{ ['市内交通费', '差旅报销单', '借款单', '支出单'][activeCard] }}</span>
        <span class="status">审批中</span>
        <div class="actions">
          <span>编号：20220819039342</span>
          <i class="el-icon-close" @click="activeCard = null"></i>
        </div>
      </div>

      <div class="detail-content">
        <div class="info-section">
          <div class="info-group">
            <div class="info-item">
              <span class="info-label">员工编号</span>
              <el-input v-model="employeeId" placeholder="填写员工编号后自动关联" />
            </div>

            <div class="info-item">
              <span class="info-label">申请人</span>
              <el-input placeholder="郭睿" disabled />
            </div>

            <div class="info-item">
              <span class="info-label">所属部门</span>
              <el-input value="开发处" disabled />
            </div>

            <div class="info-item">
              <span class="info-label">项目编号</span>
              <el-input value="10432" disabled />
            </div>

            <div class="info-item">
              <span class="info-label">项目名称</span>
              <el-input value="OA项目" disabled />
            </div>

            <div class="info-item">
              <span class="info-label">项目类型</span>
              <el-input value="整包项目" disabled />
            </div>

            <div class="info-item">
              <span class="info-label">所属公司</span>
              <el-input value="北京联合利泰科技股份有限公司" disabled />
            </div>

            <div class="info-item">
              <span class="info-label">费用承担部门</span>
              <el-input value="信息中心" disabled />
            </div>
          </div>
        </div>

        <div class="cost-section">
          <div class="section-header">费用明细</div>

          <div class="cost-detail">
            <div class="cost-item">
              <div class="cost-label">费用明细1</div>

              <div class="cost-content">
                <div class="cost-row">
                  <div class="cost-col">
                    <span class="cost-label">费用金额（元）</span>
                    <el-input value="10000.00" disabled />
                  </div>

                  <div class="cost-col">
                    <span class="cost-label">电子行程单</span>
                    <el-radio-group v-model="ticketOption">
                      <el-radio label="1">能提供</el-radio>
                      <el-radio label="2">无法提供</el-radio>
                    </el-radio-group>
                  </div>
                </div>

                <div class="cost-row">
                  <div class="cost-col">
                    <span class="cost-label">附件</span>
                    <el-link type="primary">这是一个发票附件.pdf</el-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <el-button type="primary" @click="approve">同意</el-button>
          <el-button type="danger" @click="reject">驳回</el-button>

          <div class="more-actions">
            <el-button icon="el-icon-more-outline" />
            <div class="action-text">备注</div>
            <div class="action-text">修改申请类型</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const searchText = ref('');
const activeCategory = ref('all');
const activeCard = ref<number | null>(null);
const employeeId = ref('');
const ticketOption = ref('1');

function selectCard(idx: number) {
  activeCard.value = idx;
  console.log('点击了卡片', idx);
}

function selectCategory(cat: string) {
  activeCategory.value = cat;
  console.log('点击了分类', cat);
}

function filterClick(type: string) {
  console.log('点击了筛选', type);
}

const approve = () => {
  console.log('Approve clicked');
};

const reject = () => {
  console.log('Reject clicked');
};
</script>

<style scoped lang="scss">
.approval-center {
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.sidebar {
  width: 220px;
  background-color: #fff;
  border-right: 1px solid #ebeef5;
  padding: 20px 0;
}

.search-container {
  padding: 0 15px 15px;
}

.category-section {
  margin-bottom: 20px;
}

.category-header {
  padding: 10px 15px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.category-header i {
  margin-right: 5px;
}

.category-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.category-item.active {
  background-color: #f5f7fa;
}

.badge {
  background-color: #FFB800;
  color: white;
  border-radius: 50%;
  padding: 1px 6px;
  font-size: 12px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

.main-content.has-active-card {
  filter: blur(2px);
  pointer-events: none;
}

.filter-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.filter-item i {
  margin-left: 5px;
}

.card-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
}

.card-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.08);
  margin-bottom: 20px;
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.3s;
}

.card-item:hover {
  box-shadow: 0 8px 24px 0 rgba(64, 158, 255, 0.18);
  transform: translateY(-2px) scale(1.03);
}

.card-header {
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
}

.card-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.label {
  color: #909399;
  margin-right: 5px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.time {
  color: #FFB800;
  font-size: 12px;
}

.detail-item:last-child {
  display: flex;
  align-items: center;
}

.detail-panel {
  width: 70%;
  background-color: #fff;
  border-left: 1px solid #ebeef5;
  padding: 20px;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.05);
  z-index: 10;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
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
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.status {
  background-color: #FFB800;
  color: white;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.actions i.el-icon-close {
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
}

.actions i.el-icon-close:hover {
  background-color: #f0f0f0;
  color: #409EFF;
}

.info-section {
  background-color: #f5f7fa;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-label {
  color: #909399;
}

.cost-section {
  margin-bottom: 20px;
}

.section-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.cost-detail {
  background-color: #f5f7fa;
  border-radius: 5px;
  padding: 20px;
}

.cost-label {
  font-weight: bold;
  margin-bottom: 15px;
}

.cost-content {
  background-color: white;
  border-radius: 5px;
  padding: 20px;
}

.cost-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.cost-col {
  flex: 1;
}

.action-bar {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.more-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.action-text {
  color: #606266;
  cursor: pointer;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 5;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
