<template>
  <div class="initiate-application">
    <!-- 左侧区域 -->
    <div class="sidebar">
      <!-- 搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchText"
          placeholder="输入申请名称查询"
          prefix-icon="Search"
          class="search-input"
          clearable
        />
      </div>

      <!-- 导航菜单 -->
      <div class="sidebar-menu">
        <div class="menu-item"
             v-for="(category, index) in displayCategories"
             :key="index"
             :class="{ active: selectedCategoryIndex === index }"
             @click="selectCategory(index)">
          <!-- <el-icon class="menu-icon">
            <component :is="getCategoryIcon(category.name)" />
          </el-icon> -->
          <span class="menu-text">{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧主要内容区域 -->
    <div class="main-content">

      <!-- 内容区域 -->
      <div v-loading="loading" class="content-area">
        <!-- 当前选中分类的内容 -->
        <div v-if="currentCategory" class="category-section">
          <h2 class="section-title">{{ currentCategory.name }}</h2>

          <div class="application-grid">
            <div
              v-for="model in currentCategory.modelList"
              :key="model.id"
              class="application-item"
              @click="handleFlowClick(model)"
            >
              <div class="app-icon">
                <span class="icon-text">{{ getIconText(model.name) }}</span>
              </div>
              <span class="app-name">{{ model.name }}</span>
            </div>
          </div>
        </div>

        <!-- 搜索结果显示所有分类 -->
        <div v-else class="search-results">
          <div v-for="(category, index) in displayCategories" :key="index" class="category-section">
            <h2 class="section-title">{{ category.name }}</h2>

            <div class="application-grid">
              <div
                v-for="model in category.modelList"
                :key="model.id"
                class="application-item"
                @click="handleFlowClick(model)"
              >
                <div class="app-icon">
                  <span class="icon-text">{{ getIconText(model.name) }}</span>
                </div>
                <span class="app-name">{{ model.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情蒙层 -->
    <DetailOverlay v-model:visible="dialogVisible" :title="dialogTitle">
      <component :is="formComponent" v-if="formComponent" :preview-mode="true" :readonly="true"
        :model-info="currentFlow" @success="handleFormSuccess" />
      <div v-else class="flex items-center justify-center h-100px">
        <el-empty description="组件加载失败" />
      </div>
    </DetailOverlay>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, watch, computed } from 'vue';
import { registerComponent } from '@/utils/routerHelper';
import { useMessage } from '@/hooks/web/useMessage';
import * as ModelApi from '@/api/bpm/model';
import { CategoryApi } from '@/api/bpm/category';
import { BpmModelFormType } from '@/utils/constants';
import DetailOverlay from '@/components/DetailOverlay/index.vue';
import {
  Right
} from '@element-plus/icons-vue';

// 定义类型
interface ModelInfo {
  id: number;
  name: string;
  categoryId?: number;
  categoryName?: string;
  formType?: number;
  formCustomCreatePath?: string;
  [key: string]: any;
}

interface CategoryInfo {
  id: number;
  name: string;
  modelList?: ModelInfo[];
  [key: string]: any;
}

const message = useMessage();
const searchText = ref('');
const dialogVisible = ref(false);
const currentFlow = ref<any>(null);
const formComponent = shallowRef<any>(null);
const dialogTitle = ref('表单详情'); // 弹窗标题
const isLoading = ref(false);
const loading = ref(false);
const categoryGroup = ref<any[]>([]);
const rawCategoryList = ref<any[]>([]);
const rawModelList = ref<any[]>([]);
const selectedCategoryIndex = ref(0);

// 计算属性：用于显示的分类
const displayCategories = computed(() => {
  // 确保即使categoryGroup为空也返回一个数组
  return categoryGroup.value || [];
});

// 计算属性：当前选中的分类
const currentCategory = computed(() => {
  if (searchText.value) {
    return null; // 搜索时显示所有分类
  }
  return displayCategories.value[selectedCategoryIndex.value] || null;
});

// 选择分类
const selectCategory = (index: number) => {
  selectedCategoryIndex.value = index;
};

// 获取分类图标 - 统一使用右箭头图标
const getCategoryIcon = (categoryName: string) => {
  return Right;
};

// 获取应用图标文字
const getIconText = (name: string) => {
  return name.substring(0, 2);
};

// 获取分类和流程数据
const getList = async () => {
  loading.value = true;
  try {
    // 查询模型列表
    const modelListResult = await ModelApi.getModelList("");
    // 确保我们获取到的是数组
    const modelList = Array.isArray(modelListResult) ? modelListResult : (modelListResult.list || []);
    rawModelList.value = modelList;

    // 查询分类列表
    const categoryList = await CategoryApi.getCategorySimpleList();
    rawCategoryList.value = categoryList;

    // 修复模型与分类的关联 - 检查模型是否使用了name而不是id来关联
    const result: CategoryInfo[] = [];

    // 尝试按照分类名称匹配
    for (const category of categoryList) {
      const categoryModels = modelList.filter(model =>
        (model.categoryId === category.id ||
        model.categoryName === category.name) &&
        model.visible === true  // 只显示visible为true的申请
      );

      if (categoryModels && categoryModels.length > 0) {
        result.push({
          ...category,
          modelList: categoryModels
        });
      }
    }

    // 如果没有找到任何匹配，则将所有可见模型放入第一个分类
    if (result.length === 0 && categoryList.length > 0 && modelList.length > 0) {
      const visibleModels = modelList.filter(model => model.visible === true);
      if (visibleModels.length > 0) {
        result.push({
          ...categoryList[0],
          modelList: visibleModels
        });
      }
    }

    // 直接赋值
    categoryGroup.value = result;
  } catch (error) {
    console.error('获取流程数据失败:', error);
    message.error('获取流程数据失败');
  } finally {
    loading.value = false;
  }
};

// 处理流程点击
function handleFlowClick(model: any) {
  currentFlow.value = model;
  dialogTitle.value = model.name; // 设置弹窗标题为审批名称

  // 根据模型类型加载不同的组件
  if (model.formType === BpmModelFormType.CUSTOM) { // 自定义表单
    loadDynamicComponent(model.formCustomCreatePath);
    dialogVisible.value = true;
  } else if (model.formType === BpmModelFormType.NORMAL) {
    message.warning('普通表单暂不支持在此处发起');
    return;
  } else {
    message.warning('不支持的表单类型');
    return;
  }
}

// 加载动态组件
function loadDynamicComponent(path: string) {
  if (!path) {
    message.error('表单路径未定义');
    return;
  }

  isLoading.value = true;
  formComponent.value = null;

  try {
    // 使用 registerComponent 函数加载组件
    formComponent.value = registerComponent(path);
    isLoading.value = false;
  } catch (error) {
    console.error('加载组件失败:', error);
    isLoading.value = false;
    message.error(`无法加载组件: ${path}`);
  }
}

// 处理表单提交成功
function handleFormSuccess() {
  dialogVisible.value = false;
  message.success('提交成功');
}

// 监听搜索文本变化
watch(searchText, (newVal) => {
  if (newVal) {
    // 过滤已加载的数据，同时确保只显示可见的申请
    const filtered = rawCategoryList.value.map(category => {
      const filteredModels = rawModelList.value.filter((model: any) =>
        model.name.toLowerCase().includes(newVal.toLowerCase()) &&
        model.visible === true &&
        (model.categoryId === category.id || model.categoryName === category.name)
      );

      return {
        ...category,
        modelList: filteredModels
      };
    }).filter(category => category.modelList.length > 0);

    categoryGroup.value = filtered;
  } else {
    // 如果搜索框清空，重新加载数据
    getList();
  }
});

// 监听分类变化，确保选中的索引有效
watch(displayCategories, (newCategories) => {
  if (newCategories.length > 0 && selectedCategoryIndex.value >= newCategories.length) {
    selectedCategoryIndex.value = 0;
  }
});

// 初始化数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.initiate-application {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
  overflow: hidden;
}

// 左侧区域
.sidebar {
  width: 240px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

// 搜索容器
.search-container {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.search-input {
  width: 100%;

  :deep(.el-input__inner) {
    height: 40px;
    font-size: 14px;
  }
}

// 左侧导航菜单
.sidebar-menu {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
  margin: 4px 0;

  &:hover {
    background-color: #f5f7fa;
  }

  &.active {
    background-color: #ecf5ff;
    border-left-color: #409eff;
    color: #409eff;

    .menu-icon {
      color: #409eff;
    }
  }
}

.menu-icon {
  font-size: 20px;
  margin-right: 16px;
  color: #606266;
}

.menu-text {
  font-size: 16px;
  font-weight: 500;
}

// 右侧主要内容区域
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-area {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  background-color: #fafbfc;
}

.category-section {
  margin-bottom: 50px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 30px 0;
  padding-bottom: 15px;
  border-bottom: 3px solid #409eff;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #409eff, #66b3ff);
  }
}

.application-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 30px;
}

.application-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  min-height: 80px;
  border: 1px solid #f0f0f0;
  transform-origin: center;

  &:hover {
    transform: translateY(-2px) rotateX(-2deg) rotateY(2deg);
    box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
    border-color: #409eff;
  }
}

.app-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.icon-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.app-name {
  font-size: 15px;
  color: #303133;
  line-height: 1.5;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
  flex: 1;
}

.search-results {
  .category-section {
    background-color: #fff;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .initiate-application {
    flex-direction: column;
    height: auto;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .sidebar-menu {
    display: flex;
    overflow-x: auto;
    padding: 10px 0;
  }

  .menu-item {
    flex-shrink: 0;
    border-left: none;
    border-bottom: 3px solid transparent;

    &.active {
      border-left: none;
      border-bottom-color: #409eff;
    }
  }

  .application-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
}
</style>
