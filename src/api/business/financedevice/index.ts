import request from '@/config/axios'

// 融资租赁设备 VO
export interface FinanceDeviceVO {
  id: number // 融资租赁设备表主键
  leaseId: number // 融资租赁单编号
  deviceName: string // 设备名称
  deviceSpecification: string // 规格型号
  deviceManufacturers: string // 生产厂家
  buyDate: Date // 购买日期
  quantity: number // 数量
  originalWorth: number // 原值
  netWorth: number // 净值
  deviceStatus: number // 设备状态
  deptId: number // 部门id
}

// 融资租赁设备 API
export const FinanceDeviceApi = {
  // 查询融资租赁设备分页
  getFinanceDevicePage: async (params: any) => {
    return await request.get({ url: `/business/finance-device/page`, params })
  },

  // 查询融资租赁设备详情
  getFinanceDevice: async (id: number) => {
    return await request.get({ url: `/business/finance-device/get?id=` + id })
  },

  // 新增融资租赁设备
  createFinanceDevice: async (data: FinanceDeviceVO) => {
    return await request.post({ url: `/business/finance-device/create`, data })
  },

  // 修改融资租赁设备
  updateFinanceDevice: async (data: FinanceDeviceVO) => {
    return await request.put({ url: `/business/finance-device/update`, data })
  },

  // 删除融资租赁设备
  deleteFinanceDevice: async (id: number) => {
    return await request.delete({ url: `/business/finance-device/delete?id=` + id })
  },

  // 导出融资租赁设备 Excel
  exportFinanceDevice: async (params) => {
    return await request.download({ url: `/business/finance-device/export-excel`, params })
  },
}