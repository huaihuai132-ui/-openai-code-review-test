import request from '@/config/axios'

export type MaintenanceVO = {
  id: number
  status: number
  reason: string
  processInstanceId: string
  createTime: string
  fileList: string
  sequenceCode: string
  startUserSelectAssignees?: Record<string, number[]> // 发起人自选审批人
}

// 创建报修申请
export const createMaintenance = async (data: MaintenanceVO) => {
  return await request.post({ url: '/bpm/oa/form/maintenance/create', data: data })
}

// 获得报修申请
export const getMaintenance = async (id: number | string) => {
  return await request.get({ url: '/bpm/oa/form/maintenance/get?id=' + id })
}

// 获得报修申请分页
export const getMaintenancePage = async (params: PageParam) => {
  return await request.get({ url: '/bpm/oa/form/maintenance/page', params })
}