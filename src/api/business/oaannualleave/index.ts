import request from '@/config/axios'

// 年假 VO
export interface OaAnnualLeaveVO {
  id: number // 主键ID
  userId: number // 用户ID
  totalDays: number // 年假总天数
  usedDays: number // 已使用年假天数
  deptId: number // 部门编号
}

// 年假 API
export const OaAnnualLeaveApi = {
  // 查询年假分页
  getOaAnnualLeavePage: async (params: any) => {
    return await request.get({ url: `/business/oa-annual-leave/page`, params })
  },

  // 查询年假详情
  getOaAnnualLeave: async (id: number) => {
    return await request.get({ url: `/business/oa-annual-leave/get?id=` + id })
  },

  // 新增年假
  createOaAnnualLeave: async (data: OaAnnualLeaveVO) => {
    return await request.post({ url: `/business/oa-annual-leave/create`, data })
  },

  // 修改年假
  updateOaAnnualLeave: async (data: OaAnnualLeaveVO) => {
    return await request.put({ url: `/business/oa-annual-leave/update`, data })
  },

  // 删除年假
  deleteOaAnnualLeave: async (id: number) => {
    return await request.delete({ url: `/business/oa-annual-leave/delete?id=` + id })
  },

  // 导出年假 Excel
  exportOaAnnualLeave: async (params) => {
    return await request.download({ url: `/business/oa-annual-leave/export-excel`, params })
  },

// ==================== 子表（OA 请假申请表单） ====================

  // 获得OA 请假申请表单列表
  getOaFormLeaveListByUserId: async (userId) => {
    return await request.get({ url: `/business/oa-annual-leave/oa-form-leave/list-by-user-id?userId=` + userId })
  },

  // 查询我的剩余年假
  getMyOaAnnualLeave: async () => {
    return await request.get({ url: `/business/oa-annual-leave/get-my-annual` })
  },
}