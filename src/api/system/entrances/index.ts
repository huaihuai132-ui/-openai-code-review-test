import request from '@/config/axios'
import type { Shortcut } from './types'

// 获取用户常用入口详情
export const getMenu = (id: number) => {
  return request.get({ url: '/business/user-common-entrances/get-list?userId=' + id })
}

// 更新用户常用入口详情
export const updateMenu = (shortcutList: Shortcut[], userId: number) => {
  return request.put({ 
    url: '/business/user-common-entrances/update-list?userId=' + userId, 
    data: shortcutList
  })
}