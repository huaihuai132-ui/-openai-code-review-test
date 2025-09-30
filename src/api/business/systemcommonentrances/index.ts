import request from '@/config/axios'

// 系统常用入口（全局配置） VO
export interface SystemCommonEntrancesVO {
  id: number // 主键ID
  name: string // 入口名称
  icon: string // 图标标识（如：ep:box）
  url: string // 跳转链接
  color: string // 显示颜色（如：#F56C6C）
  defaultOrder: number // 默认排序，值越小越靠前
  deptId: number // 部门编号
  platform: string // 显示端：WEB、APP、ALL（都显示）
}

// 系统常用入口（全局配置） API
export const SystemCommonEntrancesApi = {
  // 查询系统常用入口（全局配置）分页
  getSystemCommonEntrancesPage: async (params: any) => {
    return await request.get({ url: `/business/system-common-entrances/page`, params })
  },

  // 查询系统常用入口（全局配置）详情
  getSystemCommonEntrances: async (id: number) => {
    return await request.get({ url: `/business/system-common-entrances/get?id=` + id })
  },

  // 新增系统常用入口（全局配置）
  createSystemCommonEntrances: async (data: SystemCommonEntrancesVO) => {
    return await request.post({ url: `/business/system-common-entrances/create`, data })
  },

  // 修改系统常用入口（全局配置）
  updateSystemCommonEntrances: async (data: SystemCommonEntrancesVO) => {
    return await request.put({ url: `/business/system-common-entrances/update`, data })
  },

  // 删除系统常用入口（全局配置）
  deleteSystemCommonEntrances: async (id: number) => {
    return await request.delete({ url: `/business/system-common-entrances/delete?id=` + id })
  },

  // 导出系统常用入口（全局配置） Excel
  exportSystemCommonEntrances: async (params) => {
    return await request.download({ url: `/business/system-common-entrances/export-excel`, params })
  },
}