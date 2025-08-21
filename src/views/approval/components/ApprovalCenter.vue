<template>
  <div class="approval-center">
    <div class="left-menu">
      <div class="menu-item" :class="{ active: activeCategory === 'waiting' }" @click="changeCategory('waiting')">
        <div class="menu-icon">
          <el-icon>
            <Clock />
          </el-icon>
          <span v-if="waitingCount > 0" class="badge">{{ waitingCount }}</span>
        </div>
        <span class="menu-text">待审批</span>
      </div>
      <div class="menu-item" :class="{ active: activeCategory === 'done' }" @click="changeCategory('done')">
        <div class="menu-icon">
          <el-icon>
            <Check />
          </el-icon>
          <span v-if="doneCount > 0" class="badge">{{ doneCount }}</span>
        </div>
        <span class="menu-text">已审批</span>
      </div>
      <div class="menu-item" :class="{ active: activeCategory === 'apply' }" @click="changeCategory('apply')">
        <div class="menu-icon">
          <el-icon>
            <Document />
          </el-icon>
          <span v-if="applyCount > 0" class="badge">{{ applyCount }}</span>
        </div>
        <span class="menu-text">我申请的</span>
      </div>
      <div class="menu-item" :class="{ active: activeCategory === 'copy' }" @click="changeCategory('copy')">
        <div class="menu-icon">
          <el-icon>
            <CopyDocument />
          </el-icon>
          <span v-if="copyCount > 0" class="badge">{{ copyCount }}</span>
        </div>
        <span class="menu-text">抄送我的</span>
      </div>
      <div class="menu-item" :class="{ active: activeCategory === 'rejected' }" @click="changeCategory('rejected')">
        <div class="menu-icon">
          <el-icon>
            <CloseBold />
          </el-icon>
          <span v-if="rejectedCount > 0" class="badge">{{ rejectedCount }}</span>
        </div>
        <span class="menu-text">被驳回的</span>
      </div>
    </div>

    <div class="content" v-if="activeCategory">
      <div v-show="activeCategory === 'waiting'" class="category-container">
        <common-list :data="waitingList" category="waiting" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
      </div>
      <div v-show="activeCategory === 'done'" class="category-container">
        <common-list :data="doneList" category="done" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
      </div>
      <div v-show="activeCategory === 'apply'" class="category-container">
        <common-list :data="applyList" category="apply" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
      </div>
      <div v-show="activeCategory === 'copy'" class="category-container">
        <common-list :data="copyList" category="copy" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
      </div>
      <div v-show="activeCategory === 'rejected'" class="category-container">
        <common-list :data="rejectedList" category="rejected" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
      </div>
    </div>
    <div class="content" v-else>
      <div class="welcome-container">
        <el-empty description="请选择左侧菜单查看内容" />
      </div>
    </div>

    <!-- 详情蒙层 -->
    <DetailOverlay v-model:visible="showDetail" title="流程详情" @close="closeDetail">
      <process-instance-detail :id="selectedItemId" @close="closeDetail" />
    </DetailOverlay>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import CommonList from './category/CommonList.vue';
import ProcessInstanceDetail from '@/views/bpm/processInstance/detail/index.vue';
import { getTaskTodoPage, getTaskDonePage } from '@/api/bpm/task';
import { getProcessInstanceMyPage, getProcessInstanceCopyPage, getProcessInstanceRejectedPage } from '@/api/bpm/processInstance';
import { updateLastReadTime, getLastReadTime } from '@/utils/cache';
import { Clock, Check, Document, CopyDocument, CloseBold } from '@element-plus/icons-vue';
import DetailOverlay from '@/components/DetailOverlay/index.vue';
import { useRoute } from 'vue-router'

const activeCategory = ref('');
const waitingList = ref([]);
const doneList = ref([]);
const applyList = ref([]);
const copyList = ref([]);
const rejectedList = ref([]);
const waitingCount = ref(0);
const copyCount = ref(0);
const applyCount = ref(0);
const doneCount = ref(0);
const rejectedCount = ref(0);
const showDetail = ref(false);
const selectedItemId = ref('');
const selectedCategory = ref('');

// 查询参数
const queryParams = reactive({
  waiting: {
    pageNo: 1,
    pageSize: 100,
    createTime: []
  },
  done: {
    pageNo: 1,
    pageSize: 100,
    createTime: []
  },
  apply: {
    pageNo: 1,
    pageSize: 100,
    createTime: []
  },
  copy: {
    pageNo: 1,
    pageSize: 100,
    createTime: []
  },
  rejected: {
    pageNo: 1,
    pageSize: 100,
    createTime: []
  }
});

// 切换分类
const changeCategory = (category) => {
  activeCategory.value = category;
  // 重新加载数据
  loadCategoryData(category);
  // 计算新数据数量
  calculateNewItems();
  // 更新最后阅读时间
  updateLastReadTime(`approval_${category}_last_read`);
};

// 加载分类数据
const loadCategoryData = async (category) => {
  try {
    switch (category) {
      case 'waiting':
        await loadWaitingList();
        break;
      case 'done':
        await loadDoneList();
        break;
      case 'apply':
        await loadApplyList();
        break;
      case 'copy':
        await loadCopyList();
        break;
      case 'rejected':
        await loadRejectedList();
        break;
    }
  } catch (error) {
    console.error(`加载${category}数据失败`, error);
  }
};

// 计算新数据数量
const calculateNewItems = () => {
  try {
    // 计算待审批新数据
    const waitingLastRead = getLastReadTime(`approval_waiting_last_read`);
    waitingCount.value = waitingList.value.filter((item: any) => {
      if (!item) return false;
      try {
        const createTime = new Date(item.processInstance?.createTime || item.createTime).getTime();
        return createTime > waitingLastRead;
      } catch (e) {
        console.error('Error calculating waiting item time:', e);
        return false;
      }
    }).length;

    // 计算抄送我的新数据
    const copyLastRead = getLastReadTime(`approval_copy_last_read`);
    copyCount.value = copyList.value.filter((item: any) => {
      if (!item || !item.createTime) return false;
      try {
        const createTime = new Date(item.createTime).getTime();
        return createTime > copyLastRead;
      } catch (e) {
        console.error('Error calculating copy item time:', e);
        return false;
      }
    }).length;

    // 计算我的审批新数据
    const applyLastRead = getLastReadTime(`approval_apply_last_read`);
    applyCount.value = applyList.value.filter((item: any) => {
      if (!item) return false;
      try {
        const createTime = new Date(item.processInstance?.createTime || item.createTime || item.startTime).getTime();
        return createTime > applyLastRead;
      } catch (e) {
        console.error('Error calculating waiting item time:', e);
        return false;
      }
    }).length;

    // 计算已审批的新数据
    const doneLastRead = getLastReadTime(`approval_done_last_read`);
    doneCount.value = doneList.value.filter((item: any) => {
      if (!item) return false;
      try {
        const createTime = new Date(item.processInstance?.createTime || item.createTime).getTime();
        return createTime > doneLastRead;
      } catch (e) {
        console.error('Error calculating done item time:', e);
        return false;
      }
    }).length;

    // 计算被驳回的新数据
    const rejectedLastRead = getLastReadTime(`approval_rejected_last_read`);
    rejectedCount.value = rejectedList.value.filter((item: any) => {
      if (!item) return false;
      try {
        const createTime = new Date(item.startTime || item.createTime).getTime();
        return createTime > rejectedLastRead;
      } catch (e) {
        console.error('Error calculating rejected item time:', e);
        return false;
      }
    }).length;

  } catch (error) {
    console.error('Error calculating new items:', error);
  }
};

// 加载待审批列表
const loadWaitingList = async () => {
  const params = {
    ...queryParams.waiting
  };
  const result = await getTaskTodoPage(params);
  waitingList.value = result.list || [];
};

// 加载已审批列表
const loadDoneList = async () => {
  const params = {
    ...queryParams.done
  };
  const result = await getTaskDonePage(params);
  doneList.value = result.list || [];
};

// 加载我申请的列表
const loadApplyList = async () => {
  const params = {
    ...queryParams.apply
  };
  const result = await getProcessInstanceMyPage(params);
  applyList.value = result.list || [];
};

// 加载抄送我的列表
const loadCopyList = async () => {
  const params = {
    ...queryParams.copy
  };
  // 使用正确的API获取抄送数据
  const result = await getProcessInstanceCopyPage(params);
  copyList.value = result.list || [];

  // 计算新数据数量
  calculateNewItems();
};

// 加载被驳回的列表
const loadRejectedList = async () => {
  const params = {
    ...queryParams.rejected
  };
  // 使用被驳回的API获取数据
  const result = await getProcessInstanceRejectedPage(params);
  rejectedList.value = result.list || [];
};

// 处理卡片选择
const handleSelectCard = (item) => {
  selectedCategory.value = activeCategory.value;

  // 根据不同分类获取流程实例ID
  switch (activeCategory.value) {
    case 'waiting':
      selectedItemId.value = item.processInstance?.id;
      break;
    case 'done':
      selectedItemId.value = item.processInstance?.id;
      break;
    case 'apply':
      selectedItemId.value = item.id;
      break;
    case 'copy':
      selectedItemId.value = item.processInstanceId;
      break;
    case 'rejected':
      selectedItemId.value = item.id;
      break;
  }

  showDetail.value = true;
};

// 处理搜索
const handleSearch = (params) => {
  // 更新对应分类的查询参数
  Object.assign(queryParams[activeCategory.value], params);

  // 重新加载数据
  loadCategoryData(activeCategory.value);
};

// 关闭详情面板
const closeDetail = () => {
  showDetail.value = false;
  selectedItemId.value = '';

  // 重新加载当前分类数据
  if (selectedCategory.value) {
    loadCategoryData(selectedCategory.value);
  }
};

// 监听分类变化
watch(activeCategory, () => {
  // 关闭详情面板
  showDetail.value = false;
  selectedItemId.value = '';
});

// 获取路由参数
const route = useRoute();

// 初始化
onMounted(async () => {
  // 检查路由参数，如果有category参数则设置对应的分类
  if (route.query.category) {
    const category = route.query.category as string;
    if (['waiting', 'done', 'apply', 'copy', 'rejected'].includes(category)) {
      activeCategory.value = category;
    }
  }

  // 加载所有分类数据
  await Promise.all([
    loadWaitingList(),
    loadDoneList(),
    loadApplyList(),
    loadCopyList(),
    loadRejectedList()
  ]);

  // 计算新数据数量
  calculateNewItems();
});
</script>

<style scoped lang="scss">
.approval-center {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f5f7fa;
}

.left-menu {
  width: 160px;
  padding: 20px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
}

.menu-item {
  width: 100%;
  padding: 15px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item.active {
  background-color: #ecf5ff;
  border-left: 3px solid #409EFF;
}

.menu-text {
  font-size: 14px;
  color: #606266;
}

.active .menu-text {
  color: #409EFF;
  font-weight: 500;
}

.menu-icon {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  margin-bottom: 5px;
  color: #606266;
}

.active .menu-icon {
  color: #409EFF;
}

.menu-icon i {
  font-size: 24px;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #F56C6C;
  color: white;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  padding: 0 4px;
}

.content {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.category-container {
  width: 100%;
  height: 100%;
  padding: 0;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 详情面板样式已移至 DetailOverlay 组件 */

@media (max-width: 768px) {
  .left-menu {
    width: 100px;
  }

  .menu-text {
    display: none;
  }

  .menu-icon {
    margin-right: 0;
  }
}
</style>
