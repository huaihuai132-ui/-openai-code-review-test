import request from '@/config/axios'
import { OaMeetingAttendeeVO } from '../oameetingattendee'
import { OaMeetingIssueVO } from '../oameetingissue'

// 会议 VO
export interface OaMeetingVO {
  id: number // 会议ID
  userId: number // 会议发起人ID
  meetName: string // 会议名称
  meetType: string // 会议类型
  meetDate: Date // 会议日期
  startTime: string // 开始时间
  endTime: string // 结束时间
  meetRoomId: number // 会议室ID
  reason: string // 会议事由
  description: string // 会议概述
  status: number // 会议状态
  fileList: string // 文件id列表
  sequenceCode: string // 文件序列编码
  attendeeList?: OaMeetingAttendeeVO[] // 参会人员列表
  issueList?: OaMeetingIssueVO[] // 会议议题列表
}

// 会议 API
export const OaMeetingApi = {
  // 查询会议分页
  getOaMeetingPage: async (params: any) => {
    return await request.get({ url: `/business/oa-meeting/page`, params })
  },

  // 查询会议详情
  getOaMeeting: async (id: number) => {
    return await request.get({ url: `/business/oa-meeting/get?id=` + id })
  },

  // 新增会议
  createOaMeeting: async (data: OaMeetingVO) => {
    return await request.post({ url: `/business/oa-meeting/create`, data })
  },

  // 修改会议
  updateOaMeeting: async (data: OaMeetingVO) => {
    return await request.put({ url: `/business/oa-meeting/update`, data })
  },

  // 删除会议
  deleteOaMeeting: async (id: number) => {
    return await request.delete({ url: `/business/oa-meeting/delete?id=` + id })
  },

  // 导出会议 Excel
  exportOaMeeting: async (params) => {
    return await request.download({ url: `/business/oa-meeting/export-excel`, params })
  }
}
