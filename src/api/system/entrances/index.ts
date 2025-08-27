import request from '@/config/axios'

// 获取用户常用入口详情
export const getMenu = (id: number) => {
  return request.get({ url: '/business/common-system-entrances/get-list?userId=' + id })
}
