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
                <el-col :span="6" class="text-center cursor-pointer" @click="goApproval('done')">
                  <div class="text-20px">{{ taskCenterTagsData.apply }}</div>
                  <div class="text-14px text-gray-500">我申请的</div>
                </el-col>
                <el-divider direction="vertical" border-style="dashed" class="h-40px" />
              <el-col :span="6" class="text-center cursor-pointer" @click="goApproval('apply')">
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
      <el-card shadow="never">
        <template #header>
          <div class="h-3 flex justify-between">
            <span>
              <Icon icon="ion:grid-outline" class="mr-8px" />常用系统入口
            </span>
          </div>
        </template>
        <el-skeleton :loading="loading" animated>
          <el-row :gutter="16">
            <el-col
              v-for="item in shortcut"
              :key="`team-${item.name}`"
              :xl="8"
              :lg="8"
              :md="12"
              :sm="24"
              :xs="24"
              class="mb-8px">
              <el-card shadow="hover" class="cursor-pointer">
                <div class="flex items-center">
                  <Icon :icon="item.icon" class="mr-8px" :style="{ color: item.color }" />
                  <el-link type="default" :underline="false" @click="handleShortcutClick(item.url)">
                    {{ item.name }}
                  </el-link>
                </div>
              </el-card>
            </el-col>
            <el-col
              :xl="8"
              :lg="8"
              :md="12"
              :sm="24"
              :xs="24"
              class="mb-8px">
              <el-card shadow="hover" class="cursor-pointer">
                <div class="flex items-center">
                  <Icon icon="ion:grid-outline" class="mr-8px" />
                  <el-link type="default" :underline="false">查看全部</el-link>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-skeleton>
      </el-card>
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

import { useUserStore } from '@/store/modules/user'
import MessageModule from './components/MessageModule.vue'
import { BannerCarousel } from '@/components/BannerCarousel'
import type { Shortcut } from './types'
import { pieOptions, barOptions } from './echarts-data'
import { useRouter } from 'vue-router'
import { getTaskCenterTags } from '@/api/bpm/task'
import { getEnabledCarouselList } from '@/api/business/carousel/index'

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
let shortcut = reactive<Shortcut[]>([])

const getShortcut = async () => {
  const data = [
    {
      name: '项目管理',
      icon: 'ep:document',
      url: '/project/manage',
      color: '#409EFF'
    },
    {
      name: '客户管理',
      icon: 'ep:office-building',
      url: '/beisen/system',
      color: '#67C23A'
    },
    {
      name: '审批中心',
      icon: 'ep:message',
      url: '/timesheet/manage',
      color: '#E6A23C'
    },
    {
      name: '邮箱',
      icon: 'ep:message',
      url: '/mail/box',
      color: '#F56C6C'
    },
    {
      name: '报销系统',
      icon: 'ep:money',
      url: '/expense/system',
      color: '#909399'
    },
    {
      name: '档案系统',
      icon: 'ep:folder',
      url: '/archive/system',
      color: '#409EFF'
    },
    {
      name: 'HR系统',
      icon: 'ep:user',
      url: '/hr/system',
      color: '#67C23A'
    },
    {
      name: '考勤系统',
      icon: 'ep:calendar',
      url: '/attendance/system',
      color: '#E6A23C'
    },
    {
      name: '资产管理',
      icon: 'ep:box',
      url: '/asset/manage',
      color: '#F56C6C'
    }
  ]
  shortcut = Object.assign(shortcut, data)
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
const getTaskCenterTagsData = async () => {
  const data = await getTaskCenterTags()
  taskCenterTagsData.apply = data.apply ||0
  taskCenterTagsData.copy = data.copy||0
  taskCenterTagsData.reject = data.reject||0
  taskCenterTagsData.todo = data.todo||0
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
    getTaskCenterTagsData(),
    getBannerData()
  ])
  loading.value = false
}

const handleShortcutClick = (url: string) => {
  router.push(url)
}

  const goApproval = (category: 'waiting' | 'done' | 'apply' | 'copy') => {
  // 根据首页的分类名称映射到审批页面的分类
  const categoryMap = {
    'waiting': 'waiting',    // 待我审批 -> 待审批
    'done': 'done',          // 我申请的 -> 已审批  
    'apply': 'apply',        // 驳回我的 -> 我申请的
    'copy': 'copy'           // 抄送我的 -> 抄送我的
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
  // 这里可以添加具体的点击处理逻辑
  // 比如跳转到详情页、打开弹窗等
  if (item.link && item.link !== '#') {
    // 如果有有效链接，可以在这里处理
    console.log('跳转链接:', item.link)
  }
}

getAllApi()
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
