<template>
  <el-row :gutter="20" class="mt-8px">
    <!-- 左侧区域：占 2/3 宽度 -->
    <el-col
      :xl="16"
      :lg="16"
      :md="24"
      :sm="24"
      :xs="24">
      <!-- 员工信息模块 -->
      <el-card shadow="never" class="mb-8px">
        <el-skeleton :loading="loading" animated>
          <el-row :gutter="16" justify="space-between">
            <!-- 员工信息左侧：占 1/3 宽度 -->
            <el-col
              :xl="12"
              :lg="12"
              :md="12"
              :sm="24"
              :xs="24">
              <div class="flex items-center">
                <el-avatar :src="avatar" :size="70" class="mr-30px" shape="square">
                  <img src="@/assets/imgs/avatar.gif" alt="" style="object-fit: cover;" />
                </el-avatar>
              <div>
                  <iframe width="250" height="80" src="https://i.tianqi.com/?c=code&a=getcode&id=35&site=34&icon=1" frameborder="0"></iframe>
                </div>
              </div>
            </el-col>
            <!-- 员工信息右侧：占 2/3 宽度 -->
            <el-col
          :xl="12"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24">
          <div class="h-70px flex items-center justify-end">
                  <el-col :span="6" class="text-center cursor-pointer" @click="goApproval('waiting')">
                  <div class="text-20px">{{ taskCenterTagsData.todo }}</div>
                  <div class="text-14px text-gray-500">待我审批</div>
                </el-col>
                <el-divider direction="vertical" border-style="dashed" class="h-40px" />
                <el-col :span="6" class="text-center cursor-pointer" @click="goApproval('apply')">
                  <div class="text-20px">{{ taskCenterTagsData.apply }}</div>
                  <div class="text-14px text-gray-500">我申请的</div>
                </el-col>
                <el-divider direction="vertical" border-style="dashed" class="h-40px" />
              <el-col :span="6" class="text-center cursor-pointer" @click="goApproval('rejected')">
                  <div class="text-20px">{{ taskCenterTagsData.reject }}</div>
                  <div class="text-14px text-gray-500">驳回我的</div>
                </el-col>
                  <el-divider direction="vertical" border-style="dashed" class="h-40px" />
              <el-col :span="6" class="text-center cursor-pointer" @click="goApproval('copy')">
                  <div class="text-20px">{{ taskCenterTagsData.copy }}</div>
                  <div class="text-14px text-gray-500">抄送我的</div>
                </el-col>
              </div>
        </el-col>
          </el-row>
        </el-skeleton>
      </el-card>
      <!-- 常用系统入口 -->
      <SystemShortcuts 
        :loading="loading"
        :shortcut="shortcut"
        @shortcut-change="handleShortcutChange"
      />
    </el-col>

    <!-- 右侧区域：占 1/3 宽度 -->
    <el-col
      :xl="8"
      :lg="8"
      :md="24"
      :sm="24"
      :xs="24">
      <div class="right-container">
        <!-- 横幅模块 - 自动轮播 -->
        <BannerCarousel 
          :banner-list="bannerList"
          :loading="loading"
          @banner-click="handleBannerClick"
        />

        <!-- 今日日程模块 - 15%高度
        <el-card shadow="never" class="schedule-module">
          <template #header>
            <div class="h-3 flex justify-between">
              <span>
                <Icon icon="ion:grid-outline" class="mr-8px" />今日日程 >
              </span>
              <el-link type="primary" :underline="false">更多</el-link>
            </div>
          </template>
          <el-skeleton :loading="loading" animated>
            <div class="mb-8px">
              <div class="flex items-center">
                <div class="w-4px h-4px bg-blue-500 rounded-full mr-8px"></div>
                <div class="text-14px">14:00 大会议室开产品评审会</div>
              </div>
            </div>
            <div>
              <div class="flex items-center">
                <div class="w-4px h-4px bg-blue-500 rounded-full mr-8px"></div>
                <div class="text-14px">16:30 快手大厦拜访客户</div>
              </div>
            </div>
          </el-skeleton>
        </el-card> -->

        <!-- 消息模块 - 余下全部高度，带滚动条 -->
        <MessageModule />
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { set } from 'lodash-es'
import { EChartsOption } from 'echarts'
import { ElMessage } from 'element-plus'

import { useUserStore } from '@/store/modules/user'
import MessageModule from './components/MessageModule/index.vue'
import { BannerCarousel } from '@/components/BannerCarousel'
import SystemShortcuts from './components/SystemShortcuts/index.vue'
import type { Shortcut } from '@/api/system/entrances/types'
import { pieOptions, barOptions } from './echarts-data'
import { useRouter } from 'vue-router'
import { getTaskCenterTags } from '@/api/bpm/task'
import { getEnabledCarouselList } from '@/api/business/carousel/index'
import { getMenu, updateMenu } from '@/api/system/entrances/index'

defineOptions({ name: 'Index' })

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
// 头像
const avatar = userStore.getUser.avatar

// 导入图片
import banner from '@/assets/imgs/banner.png'

// 轮播图数据类型定义
interface BannerItem {
  imageUrl: string
  link: string
  title: string
  id?: number
}

// 轮播图数据
const bannerList = ref<BannerItem[]>([])
// 后续通过接口获取用户的这些信息
const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption

// 获取快捷入口
const shortcut = ref<Shortcut[]>([])

const getShortcut = async () => {
  try {
    // 获取当前用户ID
    const userId = userStore.getUser.id
    console.log('当前用户ID:', userId)
    
    // 调用getMenu接口获取数据
    const response = await getMenu(userId)
    console.log('getMenu接口返回数据:', response)
    
    if (response && Array.isArray(response) && response.length > 0) {
      console.log('API返回数据缺少用户表主键ID，需要后端修复接口返回结构')
      console.log('当前返回的是系统表数据，缺少business_user_common_entrances表的主键ID')
      // 按照order字段排序
      const sortedData = response.sort((a: any, b: any) => a.order - b.order)
      console.log('排序后的数据:', sortedData)
      shortcut.value = sortedData
    } else {
      console.log('getMenu返回的数据不是数组或为空，显示空状态')
      // 如果接口返回的数据为空，保持空状态，不使用默认数据
      shortcut.value = []
    }
  } catch (error) {
    console.error('调用getMenu接口失败:', error)
    // 如果接口调用失败，也保持空状态，不使用默认数据
    shortcut.value = []
  }
}

// 用户来源
const getUserAccessSource = async () => {
  const data = [
    { value: 335, name: 'analysis.directAccess' },
    { value: 310, name: 'analysis.mailMarketing' },
    { value: 234, name: 'analysis.allianceAdvertising' },
    { value: 135, name: 'analysis.videoAdvertising' },
    { value: 1548, name: 'analysis.searchEngines' }
  ]
  set(
    pieOptionsData,
    'legend.data',
    data.map((v) => t(v.name))
  )
  pieOptionsData!.series![0].data = data.map((v) => {
    return {
      name: t(v.name),
      value: v.value
    }
  })
}
const barOptionsData = reactive<EChartsOption>(barOptions) as EChartsOption

// 周活跃量
const getWeeklyUserActivity = async () => {
  const data = [
    { value: 13253, name: 'analysis.monday' },
    { value: 34235, name: 'analysis.tuesday' },
    { value: 26321, name: 'analysis.wednesday' },
    { value: 12340, name: 'analysis.thursday' },
    { value: 24643, name: 'analysis.friday' },
    { value: 1322, name: 'analysis.saturday' },
    { value: 1324, name: 'analysis.sunday' }
  ]
  set(
    barOptionsData,
    'xAxis.data',
    data.map((v) => t(v.name))
  )
  set(barOptionsData, 'series', [
    {
      name: t('analysis.activeQuantity'),
      data: data.map((v) => v.value),
      type: 'bar'
    }
  ])
}

const taskCenterTagsData = reactive({
  apply: 0,
  copy: 0,
  reject: 0,
  todo: 0
})
// 原始的获取任务数据方法（保留兼容性）
const getTaskCenterTagsData = async () => {
  const data = await getTaskCenterTags()
  taskCenterTagsData.apply = data.apply || 0
  taskCenterTagsData.copy = data.copy || 0
  taskCenterTagsData.reject = data.reject || 0
  taskCenterTagsData.todo = data.todo || 0
  console.log('[TaskCenterPolling-Legacy]', new Date().toISOString(), {
    apply: taskCenterTagsData.apply,
    copy: taskCenterTagsData.copy,
    reject: taskCenterTagsData.reject,
    todo: taskCenterTagsData.todo
  })
}

// 获取启用的轮播图数据
const getBannerData = async () => {
  try {
    const data = await getEnabledCarouselList()
    // 将接口返回的数据转换为轮播组件需要的格式
    bannerList.value = data.map((item: any) => ({
      imageUrl: item.bannerImage,
      link: item.jumpLink,
      title: item.title,
      id: item.id
    }))
  } catch (error) {
    console.error('获取轮播图数据失败:', error)
    // 如果获取失败，使用默认数据
    bannerList.value = [
      {
        imageUrl: banner,
        link: '#',
        title: '默认轮播图'
      }
    ]
  }
}

const getAllApi = async () => {
  await Promise.all([
    getShortcut(),
    getUserAccessSource(),
    getWeeklyUserActivity(),
    getTaskCenterTagsDataOptimized(true), // 首次加载传入true
    getBannerData()
  ])
  loading.value = false
}


// ============ 动态刷新「任务中心各状态数量」============ //
const pollingTimer = ref<number | null>(null)
const isPageVisible = ref(true) // 页面可见性状态
const lastTaskDataHash = ref('') // 上次数据的hash值，用于检测变化

// 生成任务数据hash，用于检测数据是否发生变化
const generateTaskDataHash = (data: any) => {
  return JSON.stringify({
    apply: data.apply || 0,
    copy: data.copy || 0,
    reject: data.reject || 0,
    todo: data.todo || 0
  })
}

// 检测任务数据是否发生变化
const hasTaskDataChanged = (newData: any) => {
  const newHash = generateTaskDataHash(newData)
  const changed = newHash !== lastTaskDataHash.value
  lastTaskDataHash.value = newHash
  return changed
}

// 获取任务中心数据（优化版）
const getTaskCenterTagsDataOptimized = async (isInitialLoad = false) => {
  try {
    const data = await getTaskCenterTags()
    
    // 检查数据是否发生变化
    if (hasTaskDataChanged(data) || isInitialLoad) {
      taskCenterTagsData.apply = data.apply || 0
      taskCenterTagsData.copy = data.copy || 0
      taskCenterTagsData.reject = data.reject || 0
      taskCenterTagsData.todo = data.todo || 0
      
      console.log('[TaskCenterPolling]', new Date().toISOString(), '数据已更新:', {
        apply: taskCenterTagsData.apply,
        copy: taskCenterTagsData.copy,
        reject: taskCenterTagsData.reject,
        todo: taskCenterTagsData.todo
      })
    } else {
      console.log('[TaskCenterPolling]', new Date().toISOString(), '数据无变化，跳过UI更新')
    }
  } catch (error) {
    console.error('[TaskCenterPolling] 获取任务中心数据失败:', error)
  }
}

// 开始轮询（只在页面可见时）
const startPolling = () => {
  // 清除之前的定时器
  stopPolling()
  
  // 只在页面可见时启动轮询
  if (!isPageVisible.value) {
    console.log('[TaskCenterPolling] 页面不可见，跳过启动轮询')
    return
  }
  
  pollingTimer.value = setInterval(() => {
    if (isPageVisible.value) {
      getTaskCenterTagsDataOptimized(false)
    } else {
      console.log('[TaskCenterPolling] 页面不可见，跳过本次轮询')
    }
  }, 15000) as unknown as number // 15s
  
  console.log('[TaskCenterPolling] 开始任务中心轮询，间隔15秒')
}

// 停止轮询
const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
    console.log('[TaskCenterPolling] 停止任务中心轮询')
  }
}

// 页面可见性变化处理
const onVisibilityChange = () => {
  isPageVisible.value = !document.hidden
  
  if (isPageVisible.value) {
    // 页面变为可见时，立即刷新一次数据并重新开始轮询
    console.log('[TaskCenterPolling] 页面变为可见，立即刷新任务数据')
    getTaskCenterTagsDataOptimized(false)
    startPolling()
  } else {
    // 页面不可见时，停止轮询
    console.log('[TaskCenterPolling] 页面不可见，暂停任务轮询')
    stopPolling()
  }
}



  const goApproval = (category: 'waiting' | 'done' | 'apply' | 'copy' | 'rejected') => {
  // 根据首页的分类名称映射到审批页面的分类
  const categoryMap = {
    'waiting': 'waiting',    // 待我审批 -> 待审批
    'done': 'done',          // 已审批 -> 已审批  
    'apply': 'apply',        // 我申请的 -> 我申请的
    'copy': 'copy',          // 抄送我的 -> 抄送我的
    'rejected': 'rejected'   // 驳回我的 -> 被驳回的
  }
  
  const targetCategory = categoryMap[category]
  router.push({ 
    path: '/approval', 
    query: { category: targetCategory }
  })
}

// 处理轮播图点击事件
const handleBannerClick = (item: any) => {
  console.log('轮播图被点击:', item)
  if (item.link && item.link !== '#') {
    // 判断链接类型
    if (item.link.startsWith('http://') || item.link.startsWith('https://')) {
      // 外部链接，在新窗口打开
      window.open(item.link, '_blank')
    } else {
      // 内部路由链接，使用 router.push 导航
      router.push(item.link)
    }
  }
}

// 处理快捷入口变化
const handleShortcutChange = async (newShortcuts: Shortcut[]) => {
  console.log('🔥 handleShortcutChange 被调用了！', new Date().toISOString())
  console.log('🔥 调用堆栈:', new Error().stack)
  console.log('🔥 传入的数据:', newShortcuts)
  
  try {
    // 按照order字段排序
    const sortedShortcuts = newShortcuts.sort((a, b) => a.order - b.order)
    
    // 完全替换shortcut数据，而不是合并
    shortcut.value = sortedShortcuts
    
    // 调用API保存新的排序到后端
    console.log('🔥 准备调用 updateMenu API')
    console.log('🔥 准备保存到后端的快捷入口数据:', shortcut.value)
    
    // 获取当前用户ID
    const userId = userStore.getUser.id
    console.log('🔥 当前用户ID:', userId)
    
    console.log('🔥 发送给后端的数据结构:', shortcut.value)
    
    // 调用updateMenu接口保存数据，userId通过URL传递
    console.log('🔥 正在调用 updateMenu API...')
    const response = await updateMenu(shortcut.value, userId)
    console.log('🔥 updateMenu API 调用完成，返回结果:', response)
    
    console.log('🔥 快捷入口顺序已更新并保存到后端:', shortcut.value)
    ElMessage.success('快捷入口顺序保存成功')
  } catch (error) {
    console.error('🔥 保存快捷入口顺序失败:', error)
    // 如果保存失败，可以显示错误提示
    ElMessage.error('保存失败，请重试')
  }
}

onMounted(() => {
  // 初始化页面可见性状态
  isPageVisible.value = !document.hidden
  
  getAllApi()
  
  // 启动轮询与可见性刷新
  startPolling()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style lang="scss" scoped>
.el-avatar {
  :deep(img) {
    object-fit: cover;
  }
}

.right-container {
  height: calc(100vh - 200px); // 根据实际需要调整总高度
  display: flex;
  flex-direction: column;
  gap: 12px;
}



.schedule-module {
  height: auto;
  min-height: 120px;
}

</style>
