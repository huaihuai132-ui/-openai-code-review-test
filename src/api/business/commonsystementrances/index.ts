import request from '@/config/axios'

// 常用系统入口 VO
export interface CommonSystemEntrancesVO {
  id: number // 主键ID
  userId: number // 用户ID
  username?: string // 用户名称
  name: string // 入口名称
  icon: string // 图标标识（如：ep:box）
  url: string // 跳转链接
  color: string // 显示颜色（如：#F56C6C）
  order: number // 排序，值越小越靠前
  deptId: number // 部门编号
  deptname?: string // 部门名称
}

// 常用系统入口 API
export const CommonSystemEntrancesApi = {
  // 查询常用系统入口分页
  getCommonSystemEntrancesPage: async (params: any) => {
    return await request.get({ url: `/business/common-system-entrances/page`, params })
  },

  // 查询常用系统入口详情
  getCommonSystemEntrances: async (id: number) => {
    return await request.get({ url: `/business/common-system-entrances/get?id=` + id })
  },

  // 新增常用系统入口
  createCommonSystemEntrances: async (data: CommonSystemEntrancesVO) => {
    return await request.post({ url: `/business/common-system-entrances/create`, data })
  },

  // 修改常用系统入口
  updateCommonSystemEntrances: async (data: CommonSystemEntrancesVO) => {
    return await request.put({ url: `/business/common-system-entrances/update`, data })
  },

  // 删除常用系统入口
  deleteCommonSystemEntrances: async (id: number) => {
    return await request.delete({ url: `/business/common-system-entrances/delete?id=` + id })
  },

  // 导出常用系统入口 Excel
  exportCommonSystemEntrances: async (params) => {
    return await request.download({ url: `/business/common-system-entrances/export-excel`, params })
  },
  
  // 给所有人添加常用入口
  addListAll: async (data: CommonSystemEntrancesVO) => {
    return await request.post({ url: `/business/common-system-entrances/add-listAll`, data })
  },
}
