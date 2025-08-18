import request from '@/config/axios'

// 会议参会人员 VO
export interface OaMeetingAttendeeVO {
  id: number // id
  meetingId: number // 会议ID
  userId: number // 参会用户ID
  confirmStatus: number // 确认状态
  confirmTime: Date // 确认时间
  confirmReason: string // 拒绝/取消理由
  notifyStatus: number // 通知状态
  notifyTime: Date // 通知时间
}

// 会议参会人员 API
export const OaMeetingAttendeeApi = {
  // 查询会议参会人员分页
  getOaMeetingAttendeePage: async (params: any) => {
    return await request.get({ url: `/business/oa-meeting-attendee/page`, params })
  },

  // 查询会议参会人员详情
  getOaMeetingAttendee: async (id: number) => {
    return await request.get({ url: `/business/oa-meeting-attendee/get?id=` + id })
  },

  // 新增会议参会人员
  createOaMeetingAttendee: async (data: OaMeetingAttendeeVO) => {
    return await request.post({ url: `/business/oa-meeting-attendee/create`, data })
  },

  // 修改会议参会人员
  updateOaMeetingAttendee: async (data: OaMeetingAttendeeVO) => {
    return await request.put({ url: `/business/oa-meeting-attendee/update`, data })
  },

  // 删除会议参会人员
  deleteOaMeetingAttendee: async (id: number) => {
    return await request.delete({ url: `/business/oa-meeting-attendee/delete?id=` + id })
  },

  // 导出会议参会人员 Excel
  exportOaMeetingAttendee: async (params) => {
    return await request.download({ url: `/business/oa-meeting-attendee/export-excel`, params })
  },
}