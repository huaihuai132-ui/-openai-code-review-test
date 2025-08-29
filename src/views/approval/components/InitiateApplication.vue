<template>
  <div class="initiate-application">
    <div class="search-container">
      <el-input v-model="searchText" placeholder="输入申请名称查询" prefix-icon="Search" class="w-50" />
    </div>

    <div v-loading="loading" class="category-container">
      <!-- 动态生成分类卡片 -->
      <div v-for="(category, index) in displayCategories" :key="index" class="category-card">
        <div class="category-header">
          <h3 class="category-title">{{ category.name }}</h3>
          <div class="category-count">({{ category.modelList?.length || 0 }})</div>
        </div>

        <div class="card-grid">
          <div v-for="model in category.modelList" :key="model.id" class="card-item" @click="handleFlowClick(model)">
            <div class="flow-icon">
              <span>{{ model.name.substring(0, 2) }}</span>
            </div>
            <div class="card-text">{{ model.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情蒙层 -->
    <DetailOverlay v-model:visible="dialogVisible" title="表单详情">
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
const isLoading = ref(false);
const loading = ref(false);
const categoryGroup = ref<any[]>([]);
const rawCategoryList = ref<any[]>([]);
const rawModelList = ref<any[]>([]);

// 计算属性：用于显示的分类
const displayCategories = computed(() => {
  // 确保即使categoryGroup为空也返回一个数组
  return categoryGroup.value || [];
});

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
    const filtered = categoryGroup.value.map(category => {
      return {
        ...category,
        modelList: category.modelList.filter((model: any) =>
          model.name.toLowerCase().includes(newVal.toLowerCase()) &&
          model.visible === true  // 搜索结果也只显示visible为true的申请
        )
      };
    }).filter(category => category.modelList.length > 0);

    categoryGroup.value = filtered;
  } else {
    // 如果搜索框清空，重新加载数据
    getList();
  }
});

// 初始化数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.initiate-application {
  padding: 16px;
  background-color: #f5f7fa;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.search-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  align-items: stretch;
}

.category-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.category-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  margin-right: 8px;
}

.category-count {
  color: #606266;
  font-size: 16px;
}

.card-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.card-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
  text-align: left;
  min-height: 100px;
  justify-content: flex-start;
  gap: 12px;
}

.card-item:hover {
  box-shadow: 0 4px 16px 0 rgba(64, 158, 255, 0.12);
  border-color: #409EFF;
  transform: translateY(-2px) scale(1.02);
}

.flow-icon {
  display: flex;
  width: 56px;
  height: 56px;
  margin-bottom: 0;
  background-color: var(--el-color-primary);
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  flex-shrink: 0;
}

.card-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-all;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>
