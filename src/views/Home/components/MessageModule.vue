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
    <div class="flex-1 overflow-y-auto max-h-[calc(100%-60px)] pr-8px scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-rounded-3px scrollbar-thumb-rounded-3px scrollbar-w-6px">
      <el-skeleton :loading="loading" animated>
        <div v-for="(item, index) in notice" :key="`dynamics-${index}`">
          <div class="flex items-center">
            <el-avatar :src="avatar" :size="35" class="mr-16px" shape="square">
              <img src="@/assets/imgs/avatar.gif" alt="" style="object-fit: cover;" />
            </el-avatar>
            <div>
              <div class="text-14px">
                <Highlight :keys="item.keys?.map((v: string) => t(v)) || []">
                  {{ item.templateNickname || item.type }} : {{ item.templateContent || item.title }}
                </Highlight>
              </div>
              <div class="mt-16px text-12px text-gray-400">
                {{ formatTime(item.createTime || item.date, 'yyyy-MM-dd') }}
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
import { formatTime } from '@/utils'
import { useUserStore } from '@/store/modules/user'
import * as NotifyMessageApi from '@/api/system/notify/message'
import { useRouter } from 'vue-router'

defineOptions({ name: 'MessageModule' })

const { t } = useI18n()
const { push } = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const avatar = userStore.getUser.avatar

let notice = reactive<any[]>([])

// 跳转我的站内信
const goMyList = () => {
  push('/user/notify-message')
}

const getNotice = async () => {
  try {
    const data = await NotifyMessageApi.getUnreadNotifyMessageList()
    notice = Object.assign(notice, data.slice(0, 6)) // 只显示前6条
  } catch (error) {
    console.error('Failed to fetch notice:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getNotice()
})
</script>
