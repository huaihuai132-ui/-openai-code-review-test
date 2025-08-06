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
              :xl="9"
              :lg="9"
              :md="12"
              :sm="24"
              :xs="24">
              <div class="flex items-center">
                <el-avatar :src="avatar" :size="70" class="mr-20px" shape="square">
                  <img src="@/assets/imgs/avatar.gif" alt="" style="object-fit: cover;" />
                </el-avatar>
                <div>
                  <div class="text-20px font-bold">
                    {{ userName }}
                  </div>
                  <div class="text-16px mt-5px">
                    工号：{{ workerCode }}
                  </div>
                  <div class="mt-10px text-14px text-gray-500">
                    已加入3年2个月
                  </div>
                </div>
              </div>
            </el-col>
            <!-- 员工信息右侧：占 2/3 宽度 -->
            <el-col
              :xl="15"
              :lg="15"
              :md="12"
              :sm="24"
              :xs="24">
              <div class="h-70px flex items-center justify-end lt-sm:mt-10px">
                <div class="px-15px text-center">
                  <div class="text-16px font-medium">部门</div>
                  <div class="mt-8px text-15px text-gray-500">信息中心</div>
                </div>
                <el-divider direction="vertical" border-style="dashed" class="h-40px" />
                <div class="px-15px text-center">
                  <div class="text-16px font-medium">岗位</div>
                  <div class="mt-8px text-15px text-gray-500">产品经理</div>
                </div>
                <el-divider direction="vertical" border-style="dashed" class="h-40px" />
                <div class="px-15px text-center">
                  <div class="text-16px font-medium">级别</div>
                  <div class="mt-8px text-15px text-gray-500">{{ rank }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-skeleton>
      </el-card>

      <!-- 任务中心和审批中心 -->
      <el-row :gutter="8" class="mb-8px">
        <el-col
          :xl="12"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24">
          <el-card shadow="never">
            <template #header>
              <div class="h-3 flex justify-between">
                <span>
                  <Icon icon="ion:grid-outline" class="mr-8px" />任务中心 >
                </span>
              </div>
            </template>
            <el-skeleton :loading="loading" animated>
              <el-row>
                <el-col :span="8" class="text-center">
                  <div class="text-20px">2</div>
                  <div class="text-14px text-gray-500">今日任务</div>
                </el-col>
                <el-col :span="8" class="text-center">
                  <div class="text-20px">6</div>
                  <div class="text-14px text-gray-500">未来7天</div>
                </el-col>
                <el-col :span="8" class="text-center">
                  <div class="text-20px">2</div>
                  <div class="text-14px text-gray-500">已超期</div>
                </el-col>
              </el-row>
            </el-skeleton>
          </el-card>
        </el-col>
        <el-col
          :xl="12"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24">
          <el-card shadow="never">
            <template #header>
              <div class="h-3 flex justify-between">
                <span>
                  <Icon icon="ion:grid-outline" class="mr-8px" />审批中心 >
                </span>
                <div class="text-12px text-gray-400">*此处仅展示近30天数据</div>
              </div>
            </template>
            <el-skeleton :loading="loading" animated>
              <el-row>
                <el-col :span="8" class="text-center">
                  <div class="text-20px">2</div>
                  <div class="text-14px text-gray-500">待我审批</div>
                </el-col>
                <el-col :span="8" class="text-center">
                  <div class="text-20px">6</div>
                  <div class="text-14px text-gray-500">我申请的</div>
                </el-col>
                <el-col :span="8" class="text-center">
                  <div class="text-20px">2</div>
                  <div class="text-14px text-gray-500">驳回我的</div>
                </el-col>
              </el-row>
            </el-skeleton>
          </el-card>
        </el-col>
      </el-row>

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
        <el-card shadow="never" class="banner-module">
          <el-skeleton :loading="loading" animated>
            <el-carousel height="120px" :interval="5000" arrow="always" indicator-position="outside">
              <el-carousel-item v-for="(item, index) in bannerList" :key="index">
                <div class="relative w-full h-full">
                  <img :src="item.imageUrl" alt="" class="w-full h-full object-cover" />
                  <div class="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white px-4 py-2">
                    {{ item.title }}
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </el-skeleton>
        </el-card>

        <!-- 今日日程模块 - 15%高度 -->
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
        </el-card>

        <!-- 消息模块 - 余下全部高度，带滚动条 -->
        <el-card shadow="never" class="message-module">
          <template #header>
            <div class="h-3 flex justify-between">
              <span>
                <Icon icon="ion:grid-outline" class="mr-8px" />消息 >
              </span>
              <el-link type="primary" :underline="false">{{ t('action.more') }}</el-link>
            </div>
          </template>
          <div class="message-content">
            <el-skeleton :loading="loading" animated>
              <div v-for="(item, index) in notice" :key="`dynamics-${index}`">
                <div class="flex items-center">
                  <el-avatar :src="avatar" :size="35" class="mr-16px" shape="square">
                    <img src="@/assets/imgs/avatar.gif" alt="" style="object-fit: cover;" />
                  </el-avatar>
                  <div>
                    <div class="text-14px">
                      <Highlight :keys="item.keys.map((v) => t(v))">
                        {{ item.type }} : {{ item.title }}
                      </Highlight>
                    </div>
                    <div class="mt-16px text-12px text-gray-400">
                      {{ formatTime(item.date, 'yyyy-MM-dd') }}
                    </div>
                  </div>
                </div>
                <el-divider />
              </div>
            </el-skeleton>
          </div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { set } from 'lodash-es'
import { EChartsOption } from 'echarts'
import { formatTime } from '@/utils'

import { useUserStore } from '@/store/modules/user'
// import { useWatermark } from '@/hooks/web/useWatermark'
import type { Notice, Shortcut } from './types'
import { pieOptions, barOptions } from './echarts-data'
import { useRouter } from 'vue-router'

defineOptions({ name: 'Index' })

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
// 头像
const avatar = userStore.getUser.avatar
// 用户名
const userName = userStore.getUser.nickname
// 工号
const workerCode = userStore.getUser.workerCode
// 职级
const rank = userStore.getUser.rank

// 导入图片
import banner from '@/assets/imgs/banner.png'

// 轮播图数据
const bannerList = ref([
  {
    imageUrl: banner,
    link: '#',
    title: '公司新闻'
  },
  {
    imageUrl: banner,
    link: '#',
    title: '企业文化'
  },
  {
    imageUrl: banner,
    link: '#',
    title: '通知公告'
  }
])
// 后续通过接口获取用户的这些信息
const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption

// 获取通知公告
let notice = reactive<Notice[]>([])
const getNotice = async () => {
  const data = [
    {
      title: '小赵发来了一条待审批通知',
      type: '病假审批',
      keys: ['日常', '病假'],
      date: new Date()
    },
    {
      title: '小王发来了一条待审批通知',
      type: '用章申请',
      keys: ['行政', '用章'],
      date: new Date()
    },
    {
      title: '小李发来了一条待审批通知',
      type: '用车申请',
      keys: ['用车'],
      date: new Date()
    },
    {
      title: '小张发来了一条待审批通知',
      type: '团建申请',
      keys: ['团建', '活动'],
      date: new Date()
    }
  ]
  notice = Object.assign(notice, data)
}

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

const getAllApi = async () => {
  await Promise.all([
    getNotice(),
    getShortcut(),
    getUserAccessSource(),
    getWeeklyUserActivity()
  ])
  loading.value = false
}

const handleShortcutClick = (url: string) => {
  router.push(url)
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

.banner-module {
  height: auto;
  min-height: 120px;
  overflow: hidden;

  :deep(.el-carousel) {
    border-radius: 4px;
    overflow: hidden;
  }

  :deep(.el-carousel__arrow) {
    background-color: rgba(0, 0, 0, 0.3);

    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  :deep(.el-carousel__item img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.schedule-module {
  height: auto;
  min-height: 120px;
}

.message-module {
  flex: 1; // 占据剩余空间
  display: flex;
  flex-direction: column;

  .message-content {
    flex: 1;
    overflow-y: auto;
    max-height: calc(100% - 60px); // 减去header高度
    padding-right: 8px;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }
}
</style>
