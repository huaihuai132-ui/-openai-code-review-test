import request from '@/config/axios'
import type { Shortcut } from './types'

// 获取用户常用入口详情
export const getMenu = (id: number) => {
  return request.get({ url: '/business/common-system-entrances/get-list?userId=' + id })
}

// 更新用户常用入口详情
export const updateMenu = (shortcutList: Shortcut[]) => {
  return request.put({ 
    url: '/business/common-system-entrances/update-list', 
    data: shortcutList
    
  })
}