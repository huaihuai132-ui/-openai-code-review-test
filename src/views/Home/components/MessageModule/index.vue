<template>
  <el-card shadow="never" class="flex-1 flex flex-col">
    <template #header>
      <div class="h-3 flex justify-between">
        <span>
          <Icon icon="ion:grid-outline" class="mr-8px" />消息 >
        </span>
        <div class="flex items-center gap-2">
          <!-- 手动刷新按钮 -->
          <el-button 
            :loading="refreshing" 
            :disabled="loading"
            size="small" 
            text 
            type="primary"
            @click="manualRefresh"
            title="手动刷新消息"
          >
            <Icon icon="ion:refresh-outline" :class="{ 'animate-spin': refreshing }" />
          </el-button>
          <el-link type="primary" :underline="false" @click="goMyList">{{ t('action.more') }}</el-link>
        </div>
      </div>
    </template>
    <div class="message-list-container">
      <!-- 错误提示 -->
      <div v-if="error" class="error-message mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-center text-red-600">
          <Icon icon="ion:warning-outline" class="mr-2" />
          <span class="text-13px">{{ error }}</span>
          <el-button 
            size="small" 
            text 
            type="danger" 
            @click="manualRefresh"
            class="ml-auto"
          >
            重试
          </el-button>
        </div>
      </div>
      
      <el-skeleton :loading="loading" animated>
                <div v-for="(item, index) in notice" :key="`dynamics-${index}`" class="message-item" @click="handleMessageClick(item)" :class="{ clickable: item.templateType === 3 && item.templateParams?.detailUrl }">
          <div class="flex items-start">
                          <!-- 左侧头像和发件人名称区域 -->
              <div class="sender-info flex-shrink-0">
                <el-avatar :src="item.avatar" :size="50" class="mb-2" shape="square">
                  <img src="@/assets/imgs/avatar.gif" alt="" style="object-fit: cover;" />
                </el-avatar>
                <div class="sender-name text-12px text-center text-gray-600">
                  {{ item.sendNickname || '系统通知' }}
                </div>
              </div>
              <!-- 右侧消息内容区域 -->
              <div class="message-content flex-1 min-w-0 ml-4">
                <!-- 标题 -->
                <div class="message-title text-14px font-medium text-gray-800 mb-2">
                  {{ item.title || '消息标题' }}
                </div>
                <!-- 正文 -->
                <div class="message-body text-13px text-gray-600 leading-5 mb-2">
                  <span v-html="formatContentWithEmphasis(item.content, item.emphasisWord)"></span>
                </div>
                <!-- 时间 -->
                <div class="message-time text-11px text-gray-400">
                  {{ formatTime(item.createTime || item.date, 'yyyy-MM-dd HH:mm') }}
                </div>
              </div>
          </div>
          <el-divider />
        </div>
      </el-skeleton>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatTime } from '@/utils'
import { useUserStore } from '@/store/modules/user'
import * as NotifyMessageApi from '@/api/system/notify/message'
import { useRouter } from 'vue-router'


defineOptions({ name: 'MessageModule' })

const { t } = useI18n()
const { push } = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const refreshing = ref(false) // 手动刷新状态
const error = ref('') // 错误信息
const pollingTimer = ref<NodeJS.Timeout | null>(null) // 轮询定时器
const isPageVisible = ref(true) // 页面可见性状态
const lastDataHash = ref('') // 上次数据的hash值，用于检测变化
// const avatar = userStore.getUser.avatar
// const name = userStore.getUser.nickname

let notice = reactive<any[]>([])

// 跳转我的站内信
const goMyList = () => {
  push('/user/notify-message')
}

// 生成数据hash，用于检测数据是否发生变化
const generateDataHash = (data: any[]) => {
  if (!Array.isArray(data) || data.length === 0) return ''
  return JSON.stringify(data.map(item => ({
    id: item.id,
    title: item.title,
    createTime: item.createTime,
    readStatus: item.readStatus
  }))
  .sort((a, b) => (b.createTime || 0) - (a.createTime || 0)))
}

// 检测数据是否发生变化
const hasDataChanged = (newData: any[]) => {
  const newHash = generateDataHash(newData)
  const changed = newHash !== lastDataHash.value
  lastDataHash.value = newHash
  return changed
}

// 页面可见性变化处理
const handleVisibilityChange = () => {
  isPageVisible.value = !document.hidden
  
  if (isPageVisible.value) {
    // 页面变为可见时，立即刷新一次数据
    console.log('页面变为可见，刷新消息列表')
    getNotice()
    startPolling()
  } else {
    // 页面不可见时，停止轮询
    console.log('页面不可见，暂停轮询')
    stopPolling()
  }
}

// 开始轮询
const startPolling = () => {
  // 清除之前的定时器
  stopPolling()
  
  // 只在页面可见时启动轮询
  if (!isPageVisible.value) return
  
  pollingTimer.value = setInterval(() => {
    if (isPageVisible.value && !loading.value) {
      getNotice(false) // false表示不是首次加载
    }
  }, 2 * 60 * 1000) // 2分钟轮询一次
  
  console.log('开始消息轮询，间隔2分钟')
}

// 停止轮询
const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
    console.log('停止消息轮询')
  }
}

// 手动刷新
const manualRefresh = async () => {
  if (refreshing.value) return
  
  refreshing.value = true
  error.value = ''
  
  try {
    await getNotice(false)
  } finally {
    refreshing.value = false
  }
}

// 处理消息点击事件
const handleMessageClick = async (item: any) => {
  // 如果templateType=3且存在detailUrl，则跳转
  if (item.templateType === 3 && item.tab) {
    try {
      // 先进行路由跳转
      await push({
        path: item.linkPath,
        query: {
          category: item.tab,
          processInstanceId: item.processInstanceId
        }
      })
      
      // 路由跳转成功后，调用updateNotifyMessageRead接口标记消息为已读
      await NotifyMessageApi.updateNotifyMessageRead([item.id])
      console.log('消息已标记为已读:', item.id)
      
      // 标记已读后，延迟1秒刷新消息列表，让用户看到变化
      setTimeout(() => {
        getNotice(false)
      }, 1000)
      
    } catch (error) {
      console.error('处理消息点击失败:', error)
    }
  }
}

// 处理强调词高亮显示
const formatContentWithEmphasis = (content: string, emphasisWord?: string | string[]) => {

  if (!content) return '消息内容'
  if (!emphasisWord) return content

  let formattedContent = content

  try {
    // 如果emphasisWord是数组，处理多个强调词
    if (Array.isArray(emphasisWord)) {
      emphasisWord.forEach(word => {
        if (word && typeof word === 'string') {
          // 转义特殊字符，避免正则表达式错误
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(`(${escapedWord})`, 'gi')
          formattedContent = formattedContent.replace(regex, '<span class="emphasis-word">$1</span>')
        }
      })
    } else if (typeof emphasisWord === 'string') {
      // 如果emphasisWord是单个字符串
      // 转义特殊字符，避免正则表达式错误
      const escapedWord = emphasisWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escapedWord})`, 'gi')
      formattedContent = formattedContent.replace(regex, '<span class="emphasis-word">$1</span>')
    }
  } catch (error) {
    console.error('强调词处理错误:', error)
    return content
  }

  return formattedContent
}

const getNotice = async (isInitialLoad = true) => {
  // 首次加载显示loading，轮询时不显示
  if (isInitialLoad) {
    loading.value = true
  }
  
  // 清除之前的错误信息
  error.value = ''
  
  try {
    const data = await NotifyMessageApi.getUnreadNotifyMessageList()
    console.log("获取消息数据:", data)
    
    // 确保数据是数组
    const messageList = Array.isArray(data) ? data : []
    const slicedData = messageList.slice(0, 6)
    
    // 检查数据是否发生变化
    if (hasDataChanged(slicedData)) {
      console.log('检测到消息数据变化，更新UI')
      
      if (slicedData.length > 0) {
        // 清空原数组并添加新数据
        notice.length = 0
        notice.push(...slicedData)
      } else {
        // 如果没有数据，使用模拟数据来测试布局和强调词功能
        notice.length = 0
        notice.push({
          name: '系统通知',
          title: '欢迎',
          content: '欢迎来到工控通，请及时修改默认密码。',
          emphasisWord: ['重要信息', '强调显示'],
          createTime: new Date().getTime()
        })
      }
    } else {
      console.log('消息数据无变化，跳过UI更新')
    }
    
  } catch (err: any) {
    console.error('获取消息列表失败:', err)
    error.value = err?.message || '获取消息失败，请稍后重试'
    
    // 如果是首次加载且API调用失败，显示错误提示的模拟数据
    if (isInitialLoad && notice.length === 0) {
      notice.push({
        name: '系统通知',
        title: '网络错误',
        content: 'API调用失败，请检查网络连接后重试。',
        emphasisWord: 'API调用失败',
        createTime: new Date().getTime()
      })
    }
  } finally {
    if (isInitialLoad) {
      loading.value = false
    }
  }
}

onMounted(() => {
  // 初始化页面可见性状态
  isPageVisible.value = !document.hidden
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 初始化加载数据
  getNotice(true)
  
  // 开始轮询
  startPolling()
})

onUnmounted(() => {
  // 清理资源
  stopPolling()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style lang="scss" scoped>
.message-item {
  padding: 20px 0; // 增加上下间距
  cursor: pointer;
  transition: all 0.2s ease;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:hover {
    background-color: #f5f7fa;
    transform: translateX(2px);
  }

  // 如果消息有templateType=3且有detailUrl，显示特殊样式
  &.clickable {
    cursor: pointer;

    &:hover {
      background-color: #e6f7ff;
      border-left: 3px solid #1890ff;
    }
  }
}

.sender-info {
  width: 70px; // 固定宽度，确保头像和名称完全显示
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px; // 增加顶部间距
  min-height: 80px; // 设置最小高度，确保每个消息项有足够的可视空间
}

.sender-name {
  line-height: 1.3;
  word-break: break-all; // 防止长名称溢出
  max-width: 100%;
}

.message-content {
  padding-left: 8px;

  .message-title {
    line-height: 1.4;
    word-break: break-word; // 防止长标题溢出
    font-weight: 500;
  }

  .message-body {
    line-height: 1.5;
    word-break: break-word; // 防止长正文溢出
    display: -webkit-box;
    -webkit-line-clamp: 2; // 限制正文最多显示2行
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .message-time {
    line-height: 1.3;
  }
}

// 确保头像图片完全显示
:deep(.el-avatar) {
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}

// 强调词高亮样式
:deep(.emphasis-word) {
  background-color: #ffeb3b !important;
  color: #333 !important;
  padding: 2px 4px !important;
  border-radius: 3px !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
  display: inline-block !important;
}

// 修复滚动问题的关键样式
.message-list-container {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 300px); // 使用更合理的高度计算
  padding-right: 8px;

  // 自定义滚动条样式
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f7fafc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;

    &:hover {
      background: #a0aec0;
    }
  }
}

// 确保消息列表能够正常滚动
:deep(.el-skeleton) {
  .el-skeleton__item {
    margin-bottom: 0;
  }
}



// 刷新按钮动画
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 错误提示样式
.error-message {
  transition: all 0.3s ease;
  border-radius: 8px;
  
  .text-red-600 {
    color: #dc2626;
  }
  
  .bg-red-50 {
    background-color: #fef2f2;
  }
  
  .border-red-200 {
    border-color: #fecaca;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .sender-info {
    width: 60px;
  }

  .message-content {
    padding-left: 6px;
  }

  .sender-name {
    font-size: 11px;
  }

  .message-title {
    font-size: 13px;
  }

  .message-body {
    font-size: 12px;
  }

  .message-list-container {
    max-height: calc(100vh - 250px);
  }
}
</style>
