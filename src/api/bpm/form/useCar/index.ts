import request from '@/config/axios'

export type UseCarVO = {
  id: number
  status: number
  carNo: number
  reason: string
  useTime: string
  processInstanceId: string
  createTime: string
  fileList: string
  sequenceCode: string
  startUserSelectAssignees?: Record<string, number[]> // 发起人自选审批人
}

// 创建用车申请
export const createUseCar = async (data: UseCarVO) => {
  return await request.post({ url: '/bpm/oa/form/useCar/create', data: data })
}

// 获得用车申请
export const getUseCar = async (id: number) => {
  return await request.get({ url: '/bpm/oa/form/useCar/get?id=' + id })
}

// 获得用车申请分页
export const getUseCarPage = async (params: PageParam) => {
  return await request.get({ url: '/bpm/oa/form/useCar/page', params })
}