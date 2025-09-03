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
      <div v-show="activeCategory === 'waiting'" class="category-container" @scroll="handleScroll" ref="waitingContainer">
        <common-list :data="waitingList" category="waiting" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
        <div v-if="pageStates.waiting.loading" class="loading-more">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="!pageStates.waiting.hasMore && waitingList.length > 0" class="no-more">
          <span>没有更多数据了</span>
        </div>
      </div>
      <div v-show="activeCategory === 'done'" class="category-container" @scroll="handleScroll" ref="doneContainer">
        <common-list :data="doneList" category="done" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
        <div v-if="pageStates.done.loading" class="loading-more">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="!pageStates.done.hasMore && doneList.length > 0" class="no-more">
          <span>没有更多数据了</span>
        </div>
      </div>
      <div v-show="activeCategory === 'apply'" class="category-container" @scroll="handleScroll" ref="applyContainer">
        <common-list :data="applyList" category="apply" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
        <div v-if="pageStates.apply.loading" class="loading-more">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="!pageStates.apply.hasMore && applyList.length > 0" class="no-more">
          <span>没有更多数据了</span>
        </div>
      </div>
      <div v-show="activeCategory === 'copy'" class="category-container" @scroll="handleScroll" ref="copyContainer">
        <common-list :data="copyList" category="copy" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
        <div v-if="pageStates.copy.loading" class="loading-more">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="!pageStates.copy.hasMore && copyList.length > 0" class="no-more">
          <span>没有更多数据了</span>
        </div>
      </div>
      <div v-show="activeCategory === 'rejected'" class="category-container" @scroll="handleScroll" ref="rejectedContainer">
        <common-list :data="rejectedList" category="rejected" @select-card="handleSelectCard" @search="handleSearch"
          :show-category-tags="true" />
        <div v-if="pageStates.rejected.loading" class="loading-more">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="!pageStates.rejected.hasMore && rejectedList.length > 0" class="no-more">
          <span>没有更多数据了</span>
        </div>
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
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import CommonList from './category/CommonList.vue';
import ProcessInstanceDetail from '@/views/bpm/processInstance/detail/index.vue';
import { getTaskTodoPage, getTaskDonePage } from '@/api/bpm/task';
import { getProcessInstanceMyPage, getProcessInstanceCopyPage, getProcessInstanceRejectedPage } from '@/api/bpm/processInstance';
import { updateLastReadTime, getLastReadTime } from '@/utils/cache';
import { Clock, Check, Document, CopyDocument, CloseBold, Loading } from '@element-plus/icons-vue';
import DetailOverlay from '@/components/DetailOverlay/index.vue';
import { useRoute, useRouter } from 'vue-router'
import { useTagsView } from '@/hooks/web/useTagsView'
import { useTagsViewStoreWithOut } from '@/store/modules/tagsView'

const route = useRoute();
const router = useRouter();
const activeCategory = ref('');

// 定时器管理
const timers = ref<number[]>([]);
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
    pageSize: 20,
    createTime: []
  },
  done: {
    pageNo: 1,
    pageSize: 20,
    createTime: []
  },
  apply: {
    pageNo: 1,
    pageSize: 20,
    createTime: []
  },
  copy: {
    pageNo: 1,
    pageSize: 20,
    createTime: []
  },
  rejected: {
    pageNo: 1,
    pageSize: 20,
    createTime: []
  }
});

// 分页状态
const pageStates = reactive({
  waiting: { hasMore: true, loading: false },
  done: { hasMore: true, loading: false },
  apply: { hasMore: true, loading: false },
  copy: { hasMore: true, loading: false },
  rejected: { hasMore: true, loading: false }
});

// 切换分类 - 修复版本
const changeCategory = (category) => {
  console.log('=== changeCategory 被调用 ===');
  console.log('目标分类:', category);
  console.log('当前分类:', activeCategory.value);
  console.log('当前URL参数:', route.query.category);
  
  // 防止重复点击同一个分类
  if (activeCategory.value === category && route.query.category === category) {
    console.log('重复点击同一分类，忽略:', category);
    return;
  }
  
  console.log('开始切换分类:', category);
  
  // 更新URL参数，确保路由状态同步
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      category: category
    }
  }).then(() => {
    console.log('URL参数更新完成:', category);
  }).catch(err => {
    console.error('URL参数更新失败:', err);
  });
  
  // 直接更新activeCategory
  activeCategory.value = category;
  
  // 重置分页参数
  queryParams[category].pageNo = 1;
  pageStates[category].hasMore = true;
  
  // 清空当前列表
  console.log('清空列表:', category);
  switch (category) {
    case 'waiting':
      waitingList.value = [];
      break;
    case 'done':
      doneList.value = [];
      break;
    case 'apply':
      applyList.value = [];
      break;
    case 'copy':
      copyList.value = [];
      break;
    case 'rejected':
      rejectedList.value = [];
      break;
  }
  
  console.log('开始加载数据:', category);
  // 重新加载数据
  loadCategoryData(category);
  
  // 计算新数据数量
  calculateNewItems();
  
  // 内部切换分类时不更新标签页标题，避免重复标签
  // updateTagTitle(category); // 移除此调用
  
  // 更新最后阅读时间
  updateLastReadTime(`approval_${category}_last_read`);
  
  console.log('分类切换完成:', category);
};

// 加载分类数据
const loadCategoryData = async (category, isLoadMore = false) => {
  try {
    switch (category) {
      case 'waiting':
        await loadWaitingList(isLoadMore);
        break;
      case 'done':
        await loadDoneList(isLoadMore);
        break;
      case 'apply':
        await loadApplyList(isLoadMore);
        break;
      case 'copy':
        await loadCopyList(isLoadMore);
        break;
      case 'rejected':
        await loadRejectedList(isLoadMore);
        break;
    }
  } catch (error) {
    console.error(`加载${category}数据失败`, error);
  }
};

// 加载更多数据
const loadMoreData = async () => {
  if (!activeCategory.value || !pageStates[activeCategory.value].hasMore || pageStates[activeCategory.value].loading) {
    return;
  }
  await loadCategoryData(activeCategory.value, true);
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
const loadWaitingList = async (isLoadMore = false) => {
  if (pageStates.waiting.loading) return;

  pageStates.waiting.loading = true;
  try {
    const params = {
      ...queryParams.waiting
    };
    const result = await getTaskTodoPage(params);
    const newList = result.list || [];

    if (isLoadMore) {
      // 加载更多时，追加到现有列表
      waitingList.value = [...waitingList.value, ...newList];
    } else {
      // 首次加载或刷新时，替换列表
      waitingList.value = newList;
    }

    // 检查是否还有更多数据
    pageStates.waiting.hasMore = newList.length === queryParams.waiting.pageSize;

    // 如果有更多数据，准备下一页
    if (pageStates.waiting.hasMore) {
      queryParams.waiting.pageNo++;
    }

    // 如果是加载更多，需要重新计算新消息数量
    if (isLoadMore) {
      calculateNewItems();
    }
  } finally {
    pageStates.waiting.loading = false;
  }
};

// 加载已审批列表
const loadDoneList = async (isLoadMore = false) => {
  if (pageStates.done.loading) return;

  pageStates.done.loading = true;
  try {
    const params = {
      ...queryParams.done
    };
    const result = await getTaskDonePage(params);
    const newList = result.list || [];

    if (isLoadMore) {
      doneList.value = [...doneList.value, ...newList];
    } else {
      doneList.value = newList;
    }

    pageStates.done.hasMore = newList.length === queryParams.done.pageSize;

    if (pageStates.done.hasMore) {
      queryParams.done.pageNo++;
    }

    if (isLoadMore) {
      calculateNewItems();
    }
  } finally {
    pageStates.done.loading = false;
  }
};

// 加载我申请的列表
const loadApplyList = async (isLoadMore = false) => {
  if (pageStates.apply.loading) return;

  pageStates.apply.loading = true;
  try {
    const params = {
      ...queryParams.apply
    };
    const result = await getProcessInstanceMyPage(params);
    const newList = result.list || [];

    if (isLoadMore) {
      applyList.value = [...applyList.value, ...newList];
    } else {
      applyList.value = newList;
    }

    pageStates.apply.hasMore = newList.length === queryParams.apply.pageSize;

    if (pageStates.apply.hasMore) {
      queryParams.apply.pageNo++;
    }

    if (isLoadMore) {
      calculateNewItems();
    }
  } finally {
    pageStates.apply.loading = false;
  }
};

// 加载抄送我的列表
const loadCopyList = async (isLoadMore = false) => {
  if (pageStates.copy.loading) return;

  pageStates.copy.loading = true;
  try {
    const params = {
      ...queryParams.copy
    };
    const result = await getProcessInstanceCopyPage(params);
    const newList = result.list || [];

    if (isLoadMore) {
      copyList.value = [...copyList.value, ...newList];
    } else {
      copyList.value = newList;
    }

    pageStates.copy.hasMore = newList.length === queryParams.copy.pageSize;

    if (pageStates.copy.hasMore) {
      queryParams.copy.pageNo++;
    }

    // 计算新数据数量
    calculateNewItems();
  } finally {
    pageStates.copy.loading = false;
  }
};

// 加载被驳回的列表
const loadRejectedList = async (isLoadMore = false) => {
  if (pageStates.rejected.loading) return;

  pageStates.rejected.loading = true;
  try {
    const params = {
      ...queryParams.rejected
    };
    const result = await getProcessInstanceRejectedPage(params);
    const newList = result.list || [];

    if (isLoadMore) {
      rejectedList.value = [...rejectedList.value, ...newList];
    } else {
      rejectedList.value = newList;
    }

    pageStates.rejected.hasMore = newList.length === queryParams.rejected.pageSize;

    if (pageStates.rejected.hasMore) {
      queryParams.rejected.pageNo++;
    }

    if (isLoadMore) {
      calculateNewItems();
    }
  } finally {
    pageStates.rejected.loading = false;
  }
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

// 处理滚动事件，实现无限滚动
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target || !activeCategory.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = target;
  
  // 当滚动到距离底部100px时触发加载更多
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMoreData();
  }
};

// 监听分类变化（合并两个监听器）
watch(activeCategory, (newCategory) => {
  // 关闭详情面板
  showDetail.value = false;
  selectedItemId.value = '';
  
  // 内部切换分类时不更新标签页标题，避免重复标签
  // updateTagTitle(newCategory); // 移除此调用
});

// 移除复杂的路由监听器，改为在mounted中处理初始路由参数

// 引入标签视图钩子
const { setTitle } = useTagsView();

// 分类标题映射
const categoryTitleMap = {
  'waiting': '待审批',
  'done': '已审批',
  'apply': '我申请的',
  'copy': '抄送我的',
  'rejected': '被驳回的'
};

// 更新标签标题函数
const updateTagTitle = (category: string, isFromExternalNavigation = false) => {
  if (!categoryTitleMap[category]) return;
  
  const newTitle = `审批中心 - ${categoryTitleMap[category]}`;
  console.log('更新标题:', newTitle, '分类:', category, '是否外部导航:', isFromExternalNavigation);
  
  // 更新当前路由的meta.title
  if (route.meta) {
    route.meta.title = newTitle;
  }
  
  // 只在从外部导航时更新TagsView中的标签标题
  // 内部切换分类时不更新已存在的标签页标题，避免重复标签
  if (isFromExternalNavigation) {
    const tagsViewStore = useTagsViewStoreWithOut();
    const visitedViews = tagsViewStore.getVisitedViews;
    
    for (const view of visitedViews) {
      if (view.fullPath === route.fullPath) {
        view.meta.title = newTitle;
        console.log('更新标签页标题:', newTitle);
        break;
      }
    }
  } else {
    console.log('内部切换分类，跳过标签页标题更新');
  }
  
  // 更新浏览器标题
  document.title = newTitle;
};





// 监听路由参数变化
watch(() => route.query.category, (newCategory, oldCategory) => {
  console.log('=== 路由参数变化监听器触发 ===');
  console.log('新分类:', newCategory);
  console.log('旧分类:', oldCategory);
  console.log('当前activeCategory:', activeCategory.value);
  
  if (newCategory && typeof newCategory === 'string') {
    const validCategories = ['waiting', 'done', 'apply', 'copy', 'rejected'];
    if (validCategories.includes(newCategory)) {
      // 只有当URL参数与当前activeCategory不一致时才更新
      if (activeCategory.value !== newCategory) {
        console.log('路由参数与组件状态不同步，更新组件状态:', newCategory);
        activeCategory.value = newCategory;
        
        // 重置分页参数
        queryParams[newCategory].pageNo = 1;
        pageStates[newCategory].hasMore = true;
        
        // 清空当前列表
        switch (newCategory) {
          case 'waiting':
            waitingList.value = [];
            break;
          case 'done':
            doneList.value = [];
            break;
          case 'apply':
            applyList.value = [];
            break;
          case 'copy':
            copyList.value = [];
            break;
          case 'rejected':
            rejectedList.value = [];
            break;
        }
        
        // 重新加载数据
        loadCategoryData(newCategory);
        
        // 计算新数据数量
        calculateNewItems();
        
        // 更新最后阅读时间
        updateLastReadTime(`approval_${newCategory}_last_read`);
      } else {
        console.log('路由参数与组件状态已同步，无需更新');
      }
      
      // 从外部导航时更新标题，确保标签栏显示正确
      updateTagTitle(newCategory, true);
    }
  }
}, { immediate: true });

// 初始化
onMounted(async () => {
  console.log('=== ApprovalCenter 组件挂载 ===');
  console.log('当前路由:', route.path);
  console.log('路由参数:', route.query);
  
  // 处理初始路由参数
  let initialCategory = 'waiting'; // 默认分类
  
  if (route.query.category) {
    const category = route.query.category as string;
    console.log('从路由获取分类:', category);
    if (['waiting', 'done', 'apply', 'copy', 'rejected'].includes(category)) {
      initialCategory = category;
      console.log('使用路由分类:', initialCategory);
    } else {
      console.log('路由分类无效，使用默认分类:', initialCategory);
    }
  } else {
    console.log('无路由参数，使用默认分类:', initialCategory);
  }
  
  // 设置初始分类
  activeCategory.value = initialCategory;
  console.log('设置初始分类:', activeCategory.value);
  
  // 设置页面标题（组件初始挂载算作外部导航）
  updateTagTitle(activeCategory.value, true);

  // 加载所有分类数据
  console.log('开始加载所有分类数据');
  await Promise.all([
    loadWaitingList(),
    loadDoneList(),
    loadApplyList(),
    loadCopyList(),
    loadRejectedList()
  ]);
  console.log('所有分类数据加载完成');

  // 计算新数据数量
  calculateNewItems();
  
  console.log('=== ApprovalCenter 组件挂载完成 ===');
});

// 组件卸载时清理定时器
onUnmounted(() => {
  console.log('=== ApprovalCenter 组件卸载，清理定时器 ===');
  timers.value.forEach(timer => {
    clearTimeout(timer);
  });
  timers.value = [];
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
  overflow-y: auto;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
  gap: 8px;
}

.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #c0c4cc;
  font-size: 14px;
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
