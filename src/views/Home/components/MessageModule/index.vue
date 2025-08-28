<template>
  <el-card shadow="never" class="flex-1 flex flex-col">
    <template #header>
      <div class="h-3 flex justify-between">
        <span>
          <Icon icon="ion:grid-outline" class="mr-8px" />消息 >
        </span>
        <el-link type="primary" :underline="false" @click="goMyList">{{ t('action.more') }}</el-link>
      </div>
    </template>
    <div class="message-list-container">
      <el-skeleton :loading="loading" animated>
                <div v-for="(item, index) in notice" :key="`dynamics-${index}`" class="message-item">
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
                  <span v-html="formatContentWithEmphasis(item.templateContent, item.emphasisWord)"></span>
                  <div class="text-10px text-gray-400 mt-1">
                    强调词: {{ JSON.stringify(item.emphasisWord) }}
                  </div>
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
import { ref, reactive, onMounted } from 'vue'
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
// const avatar = userStore.getUser.avatar
// const name = userStore.getUser.nickname

let notice = reactive<any[]>([])

// 跳转我的站内信
const goMyList = () => {
  push('/user/notify-message')
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

const getNotice = async () => {
  try {
    const data = await NotifyMessageApi.getUnreadNotifyMessageList()
    console.log("data",data)
    // const data = []       
    // 确保数据是数组并且有内容
    if (Array.isArray(data) && data.length > 0) {
      const slicedData = data.slice(0, 6)
      notice = Object.assign(notice, slicedData)
    } else {
              // 如果没有数据，使用模拟数据来测试布局和强调词功能
        notice = Object.assign(notice, [
          {
            name: '系统通知',
            title: '测试消息1',
            content: '这是一条测试消息内容，包含重要信息需要强调显示。',
            emphasisWord: ['重要信息', '强调显示'],
            createTime: new Date().getTime()
          },
          {
            name: '管理员',
            title: '测试消息2',
            content: '这是第二条测试消息，包含更多的内容来测试滚动功能。',
            emphasisWord: '滚动功能',
            createTime: new Date().getTime() - 3600000
          },
          {
            name: '系统通知',
            title: '测试消息3',
            content: '第三条测试消息，继续测试滚动和显示功能。',
            emphasisWord: ['测试', '功能'],
            createTime: new Date().getTime() - 7200000
          },
          {
            name: '用户反馈',
            title: '测试消息4',
            content: '第四条测试消息，测试长文本的显示效果和换行。',
            emphasisWord: '长文本',
            createTime: new Date().getTime() - 10800000
          },
          {
            name: '系统通知',
            title: '测试消息5',
            content: '第五条测试消息，验证所有消息都能正确显示。',
            emphasisWord: ['验证', '正确显示'],
            createTime: new Date().getTime() - 14400000
          },
          {
            name: '管理员',
            title: '测试消息6',
            content: '第六条测试消息，这是最后一条，用于测试完整的滚动功能。',
            emphasisWord: '完整',
            createTime: new Date().getTime() - 18000000
          }
        ])
    }
  } catch (error) {
    console.error('Failed to fetch notice:', error)
    // 如果API调用失败，也使用模拟数据
    notice = Object.assign(notice, [
      {
        name: '系统通知',
        title: '错误状态下的测试消息',
        content: 'API调用失败，显示模拟数据用于测试布局。',
        emphasisWord: 'API调用失败',
        createTime: new Date().getTime()
      }
    ])
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getNotice()
})
</script>

<style lang="scss" scoped>
.message-item {
  padding: 20px 0; // 增加上下间距
  
  &:first-child {
    padding-top: 0;
  }
  
  &:last-child {
    padding-bottom: 0;
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
