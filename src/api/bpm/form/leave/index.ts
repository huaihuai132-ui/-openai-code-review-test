import request from '@/config/axios'

export type LeaveVO = {
  id: number
  status: number
  type: number
  reason: string
  processInstanceId: string
  startTime: string
  endTime: string
  createTime: string
  fileList: string
  sequenceCode: string
  startUserSelectAssignees?: Record<string, number[]> // 发起人自选审批人
}

// 创建请假申请
export const createLeave = async (data: LeaveVO) => {
  return await request.post({ url: '/bpm/oa/form/leave/create', data: data })
}

// 获得请假申请
export const getLeave = async (id: number) => {
  return await request.get({ url: '/bpm/oa/form/leave/get?id=' + id })
}

// 获得请假申请分页
export const getLeavePage = async (params: PageParam) => {
  return await request.get({ url: '/bpm/oa/form/leave/page', params })
}
