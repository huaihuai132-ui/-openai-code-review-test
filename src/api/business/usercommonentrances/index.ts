import request from '@/config/axios'

// 用户常用入口维护表（个性化配置） VO
export interface UserCommonEntrancesVO {
  id: number // 主键ID
  userId: number // 用户ID
  entranceId: number // 关联 system_common_entrances.id
  customOrder: number // 用户自定义排序，值越小越靠前
  hidden: boolean // 是否隐藏该入口
  deptId: number // 部门编号
}

// 用户常用入口维护表（个性化配置） API
export const UserCommonEntrancesApi = {
  // 查询用户常用入口维护表（个性化配置）分页
  getUserCommonEntrancesPage: async (params: any) => {
    return await request.get({ url: `/business/user-common-entrances/page`, params })
  },

  // 查询用户常用入口维护表（个性化配置）详情
  getUserCommonEntrances: async (id: number) => {
    return await request.get({ url: `/business/user-common-entrances/get?id=` + id })
  },

  // 新增用户常用入口维护表（个性化配置）
  createUserCommonEntrances: async (data: UserCommonEntrancesVO) => {
    return await request.post({ url: `/business/user-common-entrances/create`, data })
  },

  // 修改用户常用入口维护表（个性化配置）
  updateUserCommonEntrances: async (data: UserCommonEntrancesVO) => {
    return await request.put({ url: `/business/user-common-entrances/update`, data })
  },

  // 删除用户常用入口维护表（个性化配置）
  deleteUserCommonEntrances: async (id: number) => {
    return await request.delete({ url: `/business/user-common-entrances/delete?id=` + id })
  },

  // 导出用户常用入口维护表（个性化配置） Excel
  exportUserCommonEntrances: async (params) => {
    return await request.download({ url: `/business/user-common-entrances/export-excel`, params })
  },
}