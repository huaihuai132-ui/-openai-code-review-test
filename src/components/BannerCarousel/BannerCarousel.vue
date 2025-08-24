<template>
  <el-card shadow="never" class="banner-module">
    <el-skeleton :loading="loading" animated>
      <el-carousel 
        :height="height" 
        :interval="interval" 
        :arrow="arrow" 
        :indicator-position="indicatorPosition"
        :autoplay="autoplay"
        :loop="loop"
      >
        <el-carousel-item v-for="(item, index) in bannerList" :key="index">
          <div class="relative w-full h-full">
            <img 
              :src="item.imageUrl" 
              :alt="item.title || ''" 
              class="w-full h-full object-cover" 
              @click="handleBannerClick(item)"
            />
            <div 
              v-if="showTitle" 
              class="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white px-4 py-2"
            >
              {{ item.title }}
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </el-skeleton>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { BannerItem, BannerCarouselProps } from './index'

// 使用 index.ts 中定义的接口
const props = withDefaults(defineProps<BannerCarouselProps>(), {
  loading: false,
  height: '120px',
  interval: 5000,
  arrow: 'always',
  indicatorPosition: 'outside',
  autoplay: true,
  loop: true,
  showTitle: true
})

// 使用 index.ts 中定义的事件接口
const emit = defineEmits<{
  bannerClick: [item: BannerItem]
}>()

// 处理轮播图点击事件
const handleBannerClick = (item: BannerItem) => {
  if (item.link && item.link !== '#') {
    // 如果有链接且不是占位符，触发点击事件
    emit('bannerClick', item)
  }
}

// 暴露组件方法
defineExpose({
  // 可以在这里暴露一些方法，比如手动切换轮播图等
})
</script>

<style lang="scss" scoped>
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
    cursor: pointer;

    &:hover {
      transform: scale(1.05);
    }
  }

  :deep(.el-carousel__indicators) {
    .el-carousel__indicator {
      .el-carousel__button {
        background-color: rgba(255, 255, 255, 0.6);
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.8);
        }
      }
      
      &.is-active .el-carousel__button {
        background-color: #fff;
      }
    }
  }
}
</style>
