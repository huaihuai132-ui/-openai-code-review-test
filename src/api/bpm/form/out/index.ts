import request from '@/config/axios'

export type OutVO = {
  id: number
  status: number
  type: number
  reason: string
  processInstanceId: string
  startTime: string
  endTime: string
  day: number
  createTime: string
  fileList: string
  sequenceCode: string
  startUserSelectAssignees?: Record<string, number[]>
}

// 创建外出申请
export const createOut = async (data: OutVO) => {
  return await request.post({ url: '/bpm/oa/form/out/create', data: data })
}

// 获得外出申请
export const getOut = async (id: number) => {
  return await request.get({ url: '/bpm/oa/form/out/get?id=' + id })
}

// 获得外出申请分页
export const getOutPage = async (params: PageParam) => {
  return await request.get({ url: '/bpm/oa/form/out/page', params })
}
