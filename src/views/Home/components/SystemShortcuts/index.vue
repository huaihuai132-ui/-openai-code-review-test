<template>
  <el-card shadow="never">
    <template #header>
      <div class="h-3 flex justify-between">
        <span>
          <Icon icon="ion:grid-outline" class="mr-8px" />常用系统入口
        </span>
        <div class="flex items-center gap-2">
          <el-button 
            v-if="!isEditing" 
            type="primary" 
            size="small" 
            @click="startEdit"
          >
            <Icon icon="ep:edit" class="mr-1" />
            编辑
          </el-button>
          <template v-else>
            <el-button 
              type="primary" 
              size="small" 
              @click="openAddForm"
            >
              <Icon icon="ep:plus" class="mr-1" />
              新增
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="saveOrder"
            >
              <Icon icon="ep:check" class="mr-1" />
              保存
            </el-button>
            <el-button 
              type="info" 
              size="small" 
              @click="cancelEdit"
            >
              <Icon icon="ep:close" class="mr-1" />
              取消
            </el-button>
          </template>
        </div>
      </div>
    </template>
    <el-skeleton :loading="loading" animated>
      <!-- 当有数据时才显示卡片 -->
      <template v-if="localShortcut.length > 0">
        <draggable
          :list="localShortcut"
          :group="{ name: 'shortcuts' }"
          :animation="200"
          :disabled="!isEditing"
          item-key="id"
          class="shortcuts-grid"
          @start="dragStart"
          @end="dragEnd"
        >
          <template #item="{ element: item, index }">
            <div class="shortcut-item">
              <el-card 
                shadow="hover" 
                class="cursor-pointer shortcut-card"
                :class="{ 'editing': isEditing }"
                @click="!isEditing && handleShortcutClick(item.url)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center flex-1">
                    <Icon :icon="item.icon" class="mr-8px" :style="{ color: item.color }" />
                    {{ item.name }}
                  </div>
                  <!-- 编辑模式下显示排序序号 -->
                  <div v-if="isEditing" class="order-number">{{ index + 1 }}</div>
                  <!-- 编辑模式下的删除按钮 -->
                  <el-button
                    v-if="isEditing"
                    type="danger"
                    size="small"
                    circle
                    @click.stop="removeShortcut(index)"
                    class="delete-btn"
                  >
                    <Icon icon="ep:delete" />
                  </el-button>
                  <!-- 拖拽手柄 -->
                  <div 
                    v-if="isEditing" 
                    class="drag-handle cursor-move"
                    @mousedown="startDrag"
                  >
                    <Icon icon="ep:rank" />
                  </div>
                </div>
              </el-card>
            </div>
          </template>
        </draggable>
      </template>
      <!-- 没有数据时显示空状态 -->
      <template v-else>
        <div class="empty-state">
          <el-empty description="暂无常用系统入口" :image-size="100">
            <el-button v-if="isEditing" type="primary" @click="openAddForm">
              <Icon icon="ep:plus" class="mr-1" />
              添加入口
            </el-button>
          </el-empty>
        </div>
      </template>
      
      <!-- 查看全部按钮 -->
      <!-- <div class="view-all-item">
        <el-card shadow="hover" class="cursor-pointer">
          <div class="flex items-center">
            <Icon icon="ion:grid-outline" class="mr-8px" />
            <el-link type="default" :underline="false">查看全部</el-link>
          </div>
        </el-card>
      </div> -->
    </el-skeleton>
    
    <!-- 用户常用入口新增表单 -->
    <UserCommonEntrancesForm 
      ref="formRef" 
      :preset-user-id="userStore.getUser.id"
      :preset-user-name="userStore.getUser.nickname"
      :preset-dept-id="userStore.getUser.deptId"
      :preset-dept-name="currentUserDeptName"
      @success="handleAddSuccess" 
    />
  </el-card>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import { useUserStore } from '@/store/modules/user'
import * as DeptApi from '@/api/system/dept'
import { getMenu } from '@/api/system/entrances/index'
import UserCommonEntrancesForm from '@/views/business/usercommonentrances/UserCommonEntrancesForm.vue'
import type { Shortcut } from './types'

defineOptions({ name: 'SystemShortcuts' })

const router = useRouter()
const userStore = useUserStore()

// 定义props
interface Props {
  loading?: boolean
  shortcut?: Shortcut[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  shortcut: () => []
})

// 定义emits
const emit = defineEmits<{
  'update:shortcut': [value: Shortcut[]]
  'shortcut-change': [value: Shortcut[]]
}>()

// 响应式数据
const isEditing = ref(false)
const localShortcut = ref<Shortcut[]>([])
const originalShortcut = ref<Shortcut[]>([])
const formRef = ref()
const currentUserDeptName = ref('')

// 获取当前用户部门名称
const getCurrentUserDeptName = async () => {
  try {
    const currentUser = userStore.getUser
    if (currentUser.deptId) {
      const dept = await DeptApi.getDept(currentUser.deptId)
      currentUserDeptName.value = dept.name || ''
    } else {
      currentUserDeptName.value = '未设置部门'
    }
  } catch (error) {
    console.error('获取部门信息失败:', error)
    currentUserDeptName.value = '获取部门信息失败'
  }
}

// 监听props变化，同步到本地数据
watch(() => props.shortcut, (newVal) => {
  // 按照customOrder字段排序
  const sortedShortcuts = [...newVal].sort((a, b) => a.customOrder - b.customOrder)
  localShortcut.value = sortedShortcuts
  originalShortcut.value = sortedShortcuts
}, { immediate: true, deep: true })

// 计算属性：按customOrder排序的快捷入口
const sortedShortcuts = computed(() => {
  return [...localShortcut.value].sort((a, b) => a.customOrder - b.customOrder)
})

// 开始编辑模式
const startEdit = () => {
  isEditing.value = true
  originalShortcut.value = [...localShortcut.value]
}

// 保存排序
const saveOrder = async () => {
  try {
    const currentUser = userStore.getUser
    
    // 确保必要字段存在
    localShortcut.value.forEach((item, index) => {
      // 确保customOrder字段是最新的
      item.customOrder = index + 1
      
      // 确保userId字段存在
      if (!item.userId) {
        item.userId = currentUser.id
      }
      
      // 确保deptId字段存在
      if (!item.deptId) {
        item.deptId = currentUser.deptId
      }
      
      // 确保hidden字段存在
      if (item.hidden === undefined) {
        item.hidden = false
      }
    })
    
    // 这里可以调用API保存新的排序
    // await saveShortcutOrder(localShortcut.value)
    
    // 更新父组件数据
    emit('update:shortcut', localShortcut.value)
    emit('shortcut-change', localShortcut.value)
    
    isEditing.value = false
    ElMessage.success('排序保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  }
}

// 取消编辑
const cancelEdit = () => {
  localShortcut.value = [...originalShortcut.value]
  isEditing.value = false
}

// 删除快捷入口
const removeShortcut = async (index: number) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${localShortcut.value[index].name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    localShortcut.value.splice(index, 1)
    
    // 更新父组件数据
    emit('update:shortcut', localShortcut.value)
    
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 拖拽开始
const dragStart = () => {
  console.log('开始拖拽')
}

// 拖拽结束
const dragEnd = () => {
  console.log('拖拽结束')
  // 更新每个项目的排序字段，根据当前顺序
  localShortcut.value.forEach((item, index) => {
    // 同时更新customOrder和defaultOrder字段
    item.customOrder = index + 1
    item.defaultOrder = index + 1
    // 同时更新order字段，确保与Home/Index.vue中使用的字段一致
    item.order = index + 1
  })
  
  // 实时更新父组件数据，确保拖拽后的顺序被记录
  emit('update:shortcut', [...localShortcut.value])
}

// 开始拖拽（拖拽手柄）
const startDrag = (event: MouseEvent) => {
  event.preventDefault()
}

// 处理快捷入口点击
const handleShortcutClick = (url: string) => {
  if (!isEditing.value) {
    router.push(url)
  }
}

// 打开新增表单
const openAddForm = async () => {
  // 先获取当前用户的部门名称
  await getCurrentUserDeptName()
  formRef.value?.open('create')
}

// 处理新增成功
const handleAddSuccess = async () => {
  ElMessage.success('新增成功')
  // 重新获取最新数据，确保包含新增的项目
  try {
    const userId = userStore.getUser.id
    const response = await getMenu(userId)
    if (response && Array.isArray(response) && response.length > 0) {
      const sortedData = response.sort((a: any, b: any) => a.order - b.order)
      localShortcut.value = sortedData
      // 更新父组件数据
      emit('update:shortcut', localShortcut.value)
    }
  } catch (error) {
    console.error('重新获取数据失败:', error)
    // 如果获取失败，仍然发送当前数据
    emit('update:shortcut', localShortcut.value)
  }
}
</script>

<style lang="scss" scoped>
.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 固定三列
  gap: 12px; // 减小间距
  margin-bottom: 16px;
}

.shortcut-item {
  min-height: 70px; // 减小最小高度
}

.shortcut-card {
  height: 100%;
  transition: all 0.3s ease;
  padding: 12px; // 减小内边距
  
  &.editing {
    border: 2px dashed #409eff;
    background-color: #f0f9ff;
    cursor: default; // 编辑模式下改为默认光标
    
    &:hover {
      border-color: #67c23a;
      background-color: #f0f9ff;
      transform: none; // 编辑模式下禁用悬停动画
    }
  }
  
  &:not(.editing):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.3s ease;
  margin-left: 8px;
}

.drag-handle {
  opacity: 0;
  transition: opacity 0.3s ease;
  margin-left: 8px;
  color: #909399;
}

// 添加排序序号样式
.order-number {
  background-color: #409eff;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.shortcut-card.editing {
  .delete-btn,
  .drag-handle,
  .order-number {
    opacity: 1;
  }
}

.view-all-item {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: 16px;
}

// 拖拽时的样式
.sortable-ghost {
  opacity: 0.5;
  background: #f0f9ff;
}

.sortable-chosen {
  background: #e6f7ff;
}

.sortable-drag {
  opacity: 0.8;
  transform: rotate(5deg);
}

// 空状态样式
.empty-state {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
}

// 响应式设计
@media (max-width: 1200px) {
  .shortcuts-grid {
    grid-template-columns: repeat(2, 1fr); // 中等屏幕显示两列
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .shortcuts-grid {
    grid-template-columns: 1fr; // 小屏幕显示单列
    gap: 10px;
  }
  
  .shortcut-card {
    .flex {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
}
</style>
