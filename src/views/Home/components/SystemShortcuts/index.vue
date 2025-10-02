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
          <el-button 
            v-if="!isEditing" 
            type="info" 
            size="small" 
            @click="refreshShortcuts"
          >
            <Icon icon="ep:refresh" class="mr-1" />
            刷新
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
                    <Icon 
                      :icon="item.icon || 'ep:menu'" 
                      class="mr-8px" 
                      :style="{ color: item.color && item.color !== '#FFFFFF' ? item.color : '#409eff' }" 
                    />
                    {{ item.name }}
                  </div>
                  <!-- 编辑模式下显示排序序号 -->
                  <div v-if="isEditing" class="order-number">{{ index + 1 }}</div>
                  <!-- 编辑模式下的操作按钮 -->
                  <div v-if="isEditing" class="edit-actions">
                    <!-- 删除按钮 -->
                    <el-button
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
                      class="drag-handle cursor-move"
                      @mousedown="startDrag"
                    >
                      <Icon icon="ep:rank" />
                    </div>
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
      :delay-create="true"
      @success="handleAddSuccess" 
    />
  </el-card>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import draggable from 'vuedraggable'
import { useUserStore } from '@/store/modules/user'
import * as DeptApi from '@/api/system/dept'
import { getMenu, updateMenu } from '@/api/system/entrances/index'
import { UserCommonEntrancesApi } from '@/api/business/usercommonentrances'
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
const pendingDeletes = ref<Array<{ entranceId: number, userEntranceId: number, name: string }>>([]) // 待删除的项目
const pendingAdds = ref<Array<any>>([]) // 待新增的项目

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
    
    // 首先处理待删除的项目
    if (pendingDeletes.value.length > 0) {
      console.log('开始执行删除操作，待删除项目:', pendingDeletes.value)
      
      for (const deleteItem of pendingDeletes.value) {
        try {
          console.log('删除用户常用入口记录，ID:', deleteItem.userEntranceId)
          await UserCommonEntrancesApi.deleteUserCommonEntrances(deleteItem.userEntranceId)
          console.log(`成功删除"${deleteItem.name}"`)
        } catch (error) {
          console.error(`删除"${deleteItem.name}"失败:`, error)
          ElMessage.error(`删除"${deleteItem.name}"失败，请重试`)
          return // 如果删除失败，停止保存操作
        }
      }
      
      console.log('所有删除操作执行完成')
    }
    
    // 直接使用update-list接口，不单独创建新项目
    console.log('准备保存所有项目，包括新增项目')
    
    // 确保所有项目的必要字段存在，并更新排序
    const dataToSave = localShortcut.value.map((item, index) => {
      // 创建新对象，避免修改原对象
      const newItem = { ...item };
      
      // 确保customOrder字段是最新的
      newItem.customOrder = index + 1;
      
      // 强制设置userId字段，确保每个项目都有userId
      newItem.userId = currentUser.id;
      
      // 确保deptId字段存在
      if (!newItem.deptId) {
        newItem.deptId = currentUser.deptId;
      }
      
      // 确保hidden字段存在
      if (newItem.hidden === undefined) {
        newItem.hidden = false;
      }
      
      // 确保showType字段存在
      if (!newItem.showType) {
        newItem.showType = 'WEB';
      }
      
      // 确保entranceId字段存在（必需字段）
      if (!newItem.entranceId && newItem.id) {
        // 如果没有entranceId但有id，则使用id作为entranceId
        newItem.entranceId = newItem.id;
      }
      
      // 如果是临时ID（以temp_开头的字符串），则删除id字段，让数据库自动生成
      if (typeof newItem.id === 'string' && newItem.id.startsWith('temp_')) {
        delete newItem.id;
      }
      
      return newItem;
    });
    
    // 删除操作完成后，清空待删除列表
    pendingDeletes.value = []
    
    // 现在所有项目都有真实ID，可以安全地保存排序
    console.log('使用 update-list 接口保存排序数据:', dataToSave)
    // 注释掉直接调用updateMenu，改为通过事件让父组件处理
    // await updateMenu(dataToSave, currentUser.id)
    console.log('准备通过事件触发父组件保存数据')
    
    // 保存成功后，更新本地数据，但不重新请求
    // 将处理后的数据直接用于更新
    localShortcut.value = [...dataToSave]
    // 更新父组件数据，只触发一次事件
    // 注意：只使用shortcut-change事件，因为Home/Index.vue中会监听此事件并调用updateMenu接口
    // 不再调用update:shortcut，避免重复触发请求
    emit('shortcut-change', localShortcut.value)
    
    isEditing.value = false
    // 移除成功消息，让父组件处理
    // ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 取消编辑
const cancelEdit = async () => {
  // 清空编辑状态
  pendingDeletes.value = [] // 清空待删除列表
  pendingAdds.value = [] // 清空待新增列表
  isEditing.value = false
  
  // 调用刷新函数获取最新数据
  await refreshShortcuts()
}

// 刷新常用系统入口
const refreshShortcuts = async () => {
  try {
    const currentUser = userStore.getUser
    const userId = currentUser.id
    
    // 使用 ElLoading 服务显示加载状态
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在刷新数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    try {
      // 重新获取最新数据
      const response = await getMenu(userId)
      
      // 无论是否有数据，都清空当前数据
      localShortcut.value = []
      originalShortcut.value = []
      
      if (response && Array.isArray(response) && response.length > 0) {
        // 确保所有必要字段都存在
        const processedData = response.map((item: any, index: number) => {
          // 创建新对象，避免修改原对象
          const newItem = { ...item };
          
          // 确保customOrder字段是最新的
          newItem.customOrder = index + 1;
          
          // 强制设置userId字段
          newItem.userId = currentUser.id;
          
          // 确保deptId字段存在
          if (!newItem.deptId) {
            newItem.deptId = currentUser.deptId || 0;
          }
          
          // 确保hidden字段存在
          if (newItem.hidden === undefined) {
            newItem.hidden = false;
          }
          
          // 确保showType字段存在
          if (!newItem.showType) {
            newItem.showType = 'WEB';
          }
          
          // 确保entranceId字段存在
          if (!newItem.entranceId && newItem.id) {
            newItem.entranceId = newItem.id;
          }
          
          return newItem;
        });
        
        const sortedData = processedData.sort((a: any, b: any) => a.customOrder - b.customOrder)
        localShortcut.value = sortedData
        originalShortcut.value = JSON.parse(JSON.stringify(sortedData))
        
        ElMessage.success('刷新成功')
      } else {
        // 数据为空时，确保显示为空
        ElMessage.info('暂无常用系统入口数据')
      }
      
      // 注释掉所有emit调用，避免重复触发API请求
      // 最后一次性更新父组件数据，避免多次触发更新
      // 使用update:shortcut事件更新数据，但不触发shortcut-change事件
      // 这样可以避免在Home/Index.vue中触发updateMenu API调用
      // emit('update:shortcut', [...localShortcut.value])
      // 不再发送shortcut-change事件，避免触发update-list请求
      // emit('shortcut-change', [...localShortcut.value])
    } finally {
      // 关闭加载提示
      loadingInstance.close()
    }
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新失败，请重试')
  }
}

// 删除快捷入口
const removeShortcut = async (index: number) => {
  try {
    const itemToDelete = localShortcut.value[index]
    
    console.log('准备删除的项目数据:', itemToDelete)
    
    await ElMessageBox.confirm(
      `确定要删除"${itemToDelete.name}"吗？删除操作将在保存时生效。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    try {
      // 由于/business/user-common-entrances/get-list接口返回的是系统表数据
      // 缺少用户表的主键ID，我们需要通过entranceId查找对应的用户表记录
      const entranceId = itemToDelete.id // 这是system_common_entrances表的主键
      const userId = userStore.getUser.id
      
      console.log('查找用户常用入口记录 - entranceId:', entranceId, 'userId:', userId)
      
      // 通过分页接口查找对应的用户表记录
      const pageData = await UserCommonEntrancesApi.getUserCommonEntrancesPage({
        pageNo: 1,
        pageSize: 100,
        userId: userId,
        entranceId: entranceId
      })
      
      if (!pageData.list || pageData.list.length === 0) {
        console.error('未找到对应的用户常用入口记录')
        ElMessage.warning('未找到对应的用户常用入口记录，无法删除')
        return
      }
      
      // 获取用户表的主键ID
      const userEntranceRecord = pageData.list[0]
      const userEntranceId = userEntranceRecord.id
      
      console.log('找到用户常用入口记录，主键ID:', userEntranceId)
      
      // 将删除操作添加到待删除列表，而不是立即执行
      pendingDeletes.value.push({
        entranceId: entranceId,
        userEntranceId: userEntranceId,
        name: itemToDelete.name
      })
      
      console.log('已添加到待删除列表，将在保存时执行删除')
      ElMessage.success(`"${itemToDelete.name}"已标记为删除，将在保存时生效`)
      
      // 从本地数组中移除（仅UI显示）
      localShortcut.value.splice(index, 1)
      
      // 删除操作不立即触发API调用，只在点击保存时才执行
      // 注释掉所有事件触发，避免立即发送请求
      // emit('update:shortcut', localShortcut.value)
      // emit('shortcut-change', localShortcut.value)
      
      console.log('删除操作已标记，等待保存时执行')
      
    } catch (error) {
      console.error('准备删除失败:', error)
      ElMessage.error('准备删除失败，请重试')
    }
    
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
  
  // 仅更新本地数据，不触发父组件更新和保存
  // 注释掉emit('update:shortcut')调用，避免触发不必要的请求
  // 当用户点击保存按钮时才会触发一次update-list请求
  // emit('update:shortcut', [...localShortcut.value])
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
const handleAddSuccess = async (newItemData?: any) => {
  console.log('新增表单提交成功，接收到的数据:', newItemData)
  
  if (newItemData) {
    try {
      // 从系统常用入口获取完整的显示信息
      const { SystemCommonEntrancesApi } = await import('@/api/business/systemcommonentrances')
      const entranceInfo = await SystemCommonEntrancesApi.getSystemCommonEntrances(newItemData.entranceId)
      
      console.log('获取到的系统常用入口信息:', entranceInfo)
      
      // 确保部门ID正确设置
      const currentUser = userStore.getUser
      if (!newItemData.deptId && currentUser.deptId) {
        newItemData.deptId = currentUser.deptId
        console.log('补充设置部门ID:', currentUser.deptId)
      }
      
      // 确保userId字段存在
      if (!newItemData.userId) {
        newItemData.userId = currentUser.id
      }
      
      // 确保hidden字段存在
      if (newItemData.hidden === undefined || newItemData.hidden === 'false') {
        newItemData.hidden = false
      }
      
      // 构建完整的快捷入口数据，包含显示所需的所有字段
      const completeShortcutData = {
        id: newItemData.id || `temp_${Date.now()}`, // 临时ID，保存后会被后端返回的真实ID替换
        userId: newItemData.userId,
        deptId: newItemData.deptId,
        entranceId: newItemData.entranceId,
        customOrder: newItemData.customOrder || localShortcut.value.length + 1,
        hidden: newItemData.hidden,
        // 从系统常用入口获取显示相关字段
        name: entranceInfo.name,
        icon: entranceInfo.icon,
        url: entranceInfo.url,
        color: entranceInfo.color,
        order: newItemData.customOrder || localShortcut.value.length + 1,
        // 兼容字段
        defaultOrder: newItemData.customOrder || localShortcut.value.length + 1
      }
      
      console.log('构建的完整快捷入口数据:', completeShortcutData)
      
      // 根据指定的序号插入卡片
      const targetOrder = completeShortcutData.customOrder
      
      // 如果指定了序号，则按序号插入，否则添加到末尾
      if (targetOrder && targetOrder <= localShortcut.value.length) {
        console.log(`按指定序号 ${targetOrder} 插入卡片`)
        
        // 先将新卡片插入到指定位置
        localShortcut.value.splice(targetOrder - 1, 0, completeShortcutData)
        
        // 更新所有卡片的序号
        localShortcut.value.forEach((item, index) => {
          item.customOrder = index + 1
          item.order = index + 1
          item.defaultOrder = index + 1
        })
      } else {
        // 如果序号超出范围或未指定，则添加到末尾
        localShortcut.value.push(completeShortcutData)
      }
      
      // 仅更新本地数据，不触发父组件更新和保存
      // 注释掉emit('update:shortcut')调用，避免重复触发update-list请求
      // 当用户点击保存按钮时才会触发一次update-list请求
      
      console.log('已立即显示新增的卡片，等待用户手动保存')
      ElMessage.success('新增成功，请点击保存按钮保存更改')
    } catch (error) {
      console.error('获取系统常用入口信息失败:', error)
      ElMessage.error('获取入口信息失败，请重试')
    }
  } else {
    // 如果没有传递数据，显示提示信息
    ElMessage.success('新增成功')
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
}

.drag-handle {
  opacity: 0;
  transition: opacity 0.3s ease;
  margin-left: 8px;
  color: #909399;
}

.edit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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
    opacity: 1 !important;
  }
}

// 确保编辑模式下的元素始终可见
.editing {
  .delete-btn,
  .drag-handle,
  .order-number {
    opacity: 1 !important;
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
