import request from '@/config/axios'

// 轮播管理 VO
export interface CarouselVO {
  id: number // 编号
  title: string // 标题
  jumpLink: string // 跳转链接
  bannerImage: string // Banner图片URL
  isEnabled: number // 启用状态 (1: 启用, 0: 禁用)
  sortOrder: number // 顺序
}

// 轮播管理 API
export const CarouselApi = {
  // 查询轮播管理分页
  getCarouselPage: async (params: any) => {
    return await request.get({ url: `/business/carousel/page`, params })
  },

  // 查询轮播管理详情
  getCarousel: async (id: number) => {
    return await request.get({ url: `/business/carousel/get?id=` + id })
  },

  // 新增轮播管理
  createCarousel: async (data: CarouselVO) => {
    return await request.post({ url: `/business/carousel/create`, data })
  },

  // 修改轮播管理
  updateCarousel: async (data: CarouselVO) => {
    return await request.put({ url: `/business/carousel/update`, data })
  },

  // 删除轮播管理
  deleteCarousel: async (id: number) => {
    return await request.delete({ url: `/business/carousel/delete?id=` + id })
  },

  // 导出轮播管理 Excel
  exportCarousel: async (params) => {
    return await request.download({ url: `/business/carousel/export-excel`, params })
  },
}
// 获取启用的轮播图列表（用于前端展示）
export const getEnabledCarouselList = () => {
  return request.get({ url: '/business/carousel/enabled-list' })
}

