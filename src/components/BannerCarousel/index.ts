// 轮播图组件数据接口定义
export interface BannerItem {
  imageUrl: string
  link?: string
  title?: string
  [key: string]: any
}

// 轮播图组件属性接口
export interface BannerCarouselProps {
  bannerList: BannerItem[]
  loading?: boolean
  height?: string
  interval?: number
  arrow?: 'always' | 'hover' | 'never'
  indicatorPosition?: 'none' | 'outside'
  autoplay?: boolean
  loop?: boolean
  showTitle?: boolean
}

// 轮播图组件事件接口
export interface BannerCarouselEmits {
  bannerClick: (item: BannerItem) => void
}

// 默认属性值
export const defaultBannerCarouselProps: Partial<BannerCarouselProps> = {
  loading: false,
  height: '120px',
  interval: 5000,
  arrow: 'always',
  indicatorPosition: 'outside',
  autoplay: true,
  loop: true,
  showTitle: true
}

// 导出组件
export { default as BannerCarousel } from './BannerCarousel.vue'
