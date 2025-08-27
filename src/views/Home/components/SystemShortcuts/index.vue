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
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center flex-1">
                  <Icon :icon="item.icon" class="mr-8px" :style="{ color: item.color }" />
                  <el-link 
                    type="default" 
                    :underline="false" 
                    @click="handleShortcutClick(item.url)"
                    :disabled="isEditing"
                  >
                    {{ item.name }}
                  </el-link>
                </div>
                <!-- 编辑模式下的删除按钮 -->
                <el-button
                  v-if="isEditing"
                  type="danger"
                  size="small"
                  circle
                  @click="removeShortcut(index)"
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
      
      <!-- 查看全部按钮 -->
      <div class="view-all-item">
        <el-card shadow="hover" class="cursor-pointer">
          <div class="flex items-center">
            <Icon icon="ion:grid-outline" class="mr-8px" />
            <el-link type="default" :underline="false">查看全部</el-link>
          </div>
        </el-card>
      </div>
    </el-skeleton>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import type { Shortcut } from './types'

defineOptions({ name: 'SystemShortcuts' })

const router = useRouter()

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

// 监听props变化，同步到本地数据
watch(() => props.shortcut, (newVal) => {
  // 按照order字段排序
  const sortedShortcuts = [...newVal].sort((a, b) => a.order - b.order)
  localShortcut.value = sortedShortcuts
  originalShortcut.value = sortedShortcuts
}, { immediate: true, deep: true })

// 计算属性：按order排序的快捷入口
const sortedShortcuts = computed(() => {
  return [...localShortcut.value].sort((a, b) => a.order - b.order)
})

// 开始编辑模式
const startEdit = () => {
  isEditing.value = true
  originalShortcut.value = [...localShortcut.value]
}

// 保存排序
const saveOrder = async () => {
  try {
    // 确保order字段是最新的
    localShortcut.value.forEach((item, index) => {
      item.order = index + 1
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
  // 更新每个项目的order字段，根据当前顺序
  localShortcut.value.forEach((item, index) => {
    item.order = index + 1
  })
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
    
    &:hover {
      border-color: #67c23a;
      background-color: #f0f9ff;
    }
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.3s ease;
  transform: scale(0.8); // 稍微缩小删除按钮
  
  .shortcut-card:hover & {
    opacity: 1;
  }
}

.drag-handle {
  color: #909399;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #409eff;
    background-color: #f0f9ff;
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
