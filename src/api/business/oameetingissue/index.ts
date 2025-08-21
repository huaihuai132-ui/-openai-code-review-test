import request from '@/config/axios'

// 文件附件 VO
export interface FileAttachmentVO {
  id?: number // 编号，数据库自增
  configId?: number // 配置编号
  name: string // 原文件名
  path: string // 路径，即文件名
  url: string // 访问地址
  type?: string // 文件的 MIME 类型
  size?: number // 文件大小
  businessCode?: string // 业务编码
}

// 会议议题 VO
export interface OaMeetingIssueVO {
  id: number // 议题ID
  userId: number // 议题发起人ID
  issueNo: string // 议题编号
  issueTitle: string // 议题标题
  issueType: number // 议题类型
  meetingType: number // 上会类型
  meetingOrder: string | null // 议题排序
  issueContent: string // 议题详细内容
  issueStatus: number | null // 议题状态
  description: string // 议题概述
  fileList: string // 议题附件对象列表
}

// 会议议题 API
export const OaMeetingIssueApi = {
  // 查询会议议题分页
  getOaMeetingIssuePage: async (params: any) => {
    return await request.get({ url: `/business/oa-meeting-issue/page`, params })
  },

  // 查询会议议题详情
  getOaMeetingIssue: async (id: number) => {
    return await request.get({ url: `/business/oa-meeting-issue/get?id=` + id })
  },

  // 新增会议议题
  createOaMeetingIssue: async (data: OaMeetingIssueVO) => {
    return await request.post({ url: `/business/oa-meeting-issue/create`, data })
  },

  // 修改会议议题
  updateOaMeetingIssue: async (data: OaMeetingIssueVO) => {
    return await request.put({ url: `/business/oa-meeting-issue/update`, data })
  },

  // 删除会议议题
  deleteOaMeetingIssue: async (id: number) => {
    return await request.delete({ url: `/business/oa-meeting-issue/delete?id=` + id })
  },

  // 导出会议议题 Excel
  exportOaMeetingIssue: async (params) => {
    return await request.download({ url: `/business/oa-meeting-issue/export-excel`, params })
  },

  // 议题送审
  sendApprove: async (id: number) => {
    return await request.post({ url: `/business/oa-meeting-issue/sendApprove?id=` + id })
  }
}
