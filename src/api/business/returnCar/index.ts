import request from '@/config/axios'

// 还车申请表单 VO
export interface ReturnCarVO {
  id: number // 用车申请表单主键
  userId: number // 申请人的用户编号
  useCarProcessInstanceId: number // 用车申请流程实例的编号
  carNo: number // 车编号
  mileage: number // 里程数
  destination: string // 目的地
  useTime: Date // 用车时间
  returnTime: Date // 还车时间
  sequenceCode: string // 文件序列编码
  fileList: string // 文件id列表
  status: number // 审批状态
  processInstanceId: string // 流程实例的编号
}

// 还车申请表单 API
export const ReturnCarApi = {
  // 查询还车申请表单分页
  getReturnCarPage: async (params: any) => {
    return await request.get({ url: `/business/return-car/page`, params })
  },

  // 查询还车申请表单详情
  getReturnCar: async (id: number) => {
    return await request.get({ url: `/business/return-car/get?id=` + id })
  },

  // 新增还车申请表单
  createReturnCar: async (data: ReturnCarVO) => {
    return await request.post({ url: `/business/return-car/create`, data })
  },

  // 修改还车申请表单
  updateReturnCar: async (data: ReturnCarVO) => {
    return await request.put({ url: `/business/return-car/update`, data })
  },

  // 删除还车申请表单
  deleteReturnCar: async (id: number) => {
    return await request.delete({ url: `/business/return-car/delete?id=` + id })
  },

  // 导出还车申请表单 Excel
  exportReturnCar: async (params) => {
    return await request.download({ url: `/business/return-car/export-excel`, params })
  }
}