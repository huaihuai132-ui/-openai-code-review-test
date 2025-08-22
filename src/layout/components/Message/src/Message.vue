<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import * as NotifyMessageApi from '@/api/system/notify/message'
import { useUserStoreWithOut } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'

defineOptions({ name: 'Message' })

const { push } = useRouter()
const userStore = useUserStoreWithOut()
const activeName = ref('notice')
const unreadCount = ref(0) // 未读消息数量
const list = ref<any[]>([]) // 消息列表
const notificationQueue = ref<any[]>([]) // 通知队列

// 获得消息列表
const getList = async () => {
  const newList = await NotifyMessageApi.getUnreadNotifyMessageList()

  // 检查新消息并显示通知
  if (list.value.length > 0) {
    const newMessages = newList.filter(
      (newItem) => !list.value.find((oldItem) => oldItem.id === newItem.id)
    )
    if (newMessages.length > 0) {
      handleNewMessages(newMessages)
    }
  }

  list.value = newList
  // 强制设置 unreadCount 为 0，避免小红点因为轮询太慢，不消除
  unreadCount.value = 0
}

// 获得未读消息数
const getUnreadCount = async () => {
  NotifyMessageApi.getUnreadNotifyMessageCount().then((data) => {
    unreadCount.value = data
  })
}

// 跳转我的站内信
const goMyList = () => {
  push('/user/notify-message')
}

// 检查是否为审批通知且包含流程信息
const isApprovalNotification = (item: any) => {
  if (item.templateType !== 3) return false
  const params = item.templateParams
  return params.processInstanceId && params.processId
}

// 跳转到审批页面
const goToApproval = (item: any) => {
  const params = item.templateParams
  if (params.processInstanceId && params.processId) {
    push({
      path: '/bpm/process-instance/detail',
      query: { id: params.processInstanceId }
    })
  }
}

// 显示右下角通知
const showNotification = (item: any) => {
  const isApproval = isApprovalNotification(item)

  const notification = ElNotification({
    title: item.templateNickname || '新消息',
    message: h('div', [
      h('p', { style: { marginBottom: '10px' } }, item.templateContent),
      isApproval
        ? h('div', { style: { textAlign: 'right' } }, [
            h(
              'button',
              {
                style: {
                  background: '#409EFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '12px'
                },
                onClick: () => {
                  goToApproval(item)
                  notification.close()
                }
              },
              '去审核'
            )
          ])
        : null
    ]),
    position: 'bottom-right',
    duration: isApproval ? 0 : 4500, // 审批通知不自动关闭
    type: isApproval ? 'warning' : 'info'
  })
}

// 处理新消息通知
const handleNewMessages = (newMessages: any[]) => {
  newMessages.forEach((item) => {
    // 检查是否已经通知过
    if (!notificationQueue.value.find((n) => n.id === item.id)) {
      notificationQueue.value.push(item)
      showNotification(item)
    }
  })
}

// ========== 初始化 =========
onMounted(() => {
  // 首次加载消息列表和小红点
  getList()
  getUnreadCount()

  // 轮询刷新小红点和检查新消息
  setInterval(
    () => {
      if (userStore.getIsSetUser) {
        getUnreadCount()
        // 每2分钟检查一次新消息
        getList()
      } else {
        unreadCount.value = 0
      }
    },
    1000 * 60 * 2
  )
})
</script>
<template>
  <div class="message">
    <ElPopover :width="400" placement="bottom" trigger="click">
      <template #reference>
        <ElBadge :is-dot="unreadCount > 0" class="item">
          <Icon :size="18" class="cursor-pointer" icon="ep:bell" @click="getList" />
        </ElBadge>
      </template>
      <ElTabs v-model="activeName">
        <ElTabPane label="我的站内信" name="notice">
          <el-scrollbar class="message-list">
            <template v-for="item in list" :key="item.id">
              <div class="message-item">
                <img alt="" class="message-icon" src="@/assets/imgs/avatar.gif" />
                <div class="message-content">
                  <span class="message-title">
                    {{ item.templateNickname }}：{{ item.templateContent }}
                  </span>
                  <span class="message-date">
                    {{ formatDate(item.createTime) }}
                  </span>
                  <div v-if="isApprovalNotification(item)" class="message-actions">
                    <el-button size="small" type="primary" @click="goToApproval(item)">
                      去审核
                    </el-button>
                  </div>
                </div>
              </div>
            </template>
          </el-scrollbar>
        </ElTabPane>
      </ElTabs>
      <!-- 更多 -->
      <div style="margin-top: 10px; text-align: right">
        <XButton preIcon="ep:view" title="查看全部" type="primary" @click="goMyList" />
      </div>
    </ElPopover>
  </div>
</template>
<style lang="scss" scoped>
.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 260px;
  line-height: 45px;
}

.message-list {
  display: flex;
  height: 400px;
  flex-direction: column;

  .message-item {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--el-border-color-light);

    &:last-child {
      border: none;
    }

    .message-icon {
      width: 40px;
      height: 40px;
      margin: 0 20px 0 5px;
    }

    .message-content {
      display: flex;
      flex-direction: column;
      flex: 1;

      .message-title {
        margin-bottom: 5px;
      }

      .message-date {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
      }

      .message-actions {
        margin-top: 8px;

        .el-button {
          padding: 4px 12px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
