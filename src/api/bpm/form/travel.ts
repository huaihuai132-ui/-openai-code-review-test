import request from '@/config/axios'

export interface TravelPersonListVO {
  id?: number
  userId?: number
  nickname: string
}

export interface TravelVO {
  id?: number
  userId?: number
  deptId?: number
  trafficType: number
  airplaneReason?: string
  startTime: Date
  endTime: Date
  address: string
  reason: string
  remark?: string
  fileList?: string
  sequenceCode?: string
  editStatus?: string
  status?: number
  processInstanceId?: string
  createTime?: Date
  personList?: TravelPersonListVO[]
  nickname?: string
  deptName?: string
}

export interface TravelPageReqVO extends PageParam {
  trafficType?: number
  address?: string
  reason?: string
  startTime?: Date[]
  endTime?: Date[]
  status?: number
  createTime?: Date[]
}

// 创建出差申请
export const createTravelApi = (data: TravelVO) => {
  return request.post({ url: `/bpm/oa/form/travel/create`, data })
}

// 获得出差申请
export const getTravelApi = (id: number) => {
  return request.get({ url: `/bpm/oa/form/travel/get?id=` + id })
}

// 获得出差申请分页
export const getTravelPageApi = (params: TravelPageReqVO) => {
  return request.get({ url: `/bpm/oa/form/travel/page`, params })
}