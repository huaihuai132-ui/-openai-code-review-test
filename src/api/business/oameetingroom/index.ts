import request from '@/config/axios'

// 会议室信息 VO
export interface OaMeetingRoomVO {
  id: number // 会议室ID
  roomName: string // 会议室名称
  location: string // 会议室位置
  meetingRoomStatus: number // 状态
}

// 会议室信息 API
export const OaMeetingRoomApi = {
  // 查询会议室信息分页
  getOaMeetingRoomPage: async (params: any) => {
    return await request.get({ url: `/business/oa-meeting-room/page`, params })
  },

  // 查询会议室信息详情
  getOaMeetingRoom: async (id: number) => {
    return await request.get({ url: `/business/oa-meeting-room/get?id=` + id })
  },

  // 新增会议室信息
  createOaMeetingRoom: async (data: OaMeetingRoomVO) => {
    return await request.post({ url: `/business/oa-meeting-room/create`, data })
  },

  // 修改会议室信息
  updateOaMeetingRoom: async (data: OaMeetingRoomVO) => {
    return await request.put({ url: `/business/oa-meeting-room/update`, data })
  },

  // 删除会议室信息
  deleteOaMeetingRoom: async (id: number) => {
    return await request.delete({ url: `/business/oa-meeting-room/delete?id=` + id })
  },

  // 导出会议室信息 Excel
  exportOaMeetingRoom: async (params) => {
    return await request.download({ url: `/business/oa-meeting-room/export-excel`, params })
  },
}
