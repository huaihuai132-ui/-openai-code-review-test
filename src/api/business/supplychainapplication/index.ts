import request from '@/config/axios'

// 供应链金融立项 VO
export interface SupplychainApplicationVO {
  id: number // 供应链金融立项表单主键
  userId: number // 申请人的用户编号
  companyId: number // 企业id
  applicationType: number // 申请产品类型
  applicationName: string // 立项申请名称
  applicationTime: Date // 申请时间
  applicationStatus: number // 申请状态
  filePath: string // 文件路径
  status: number // 单据状态
  processInstanceId: string // 流程实例的编号
  deptId: number // 部门id
}

// 供应链金融立项 API
export const SupplychainApplicationApi = {
  // 查询供应链金融立项分页
  getSupplychainApplicationPage: async (params: any) => {
    return await request.get({ url: `/business/supplychain-application/page`, params })
  },

  // 查询供应链金融立项详情
  getSupplychainApplication: async (id: number) => {
    return await request.get({ url: `/business/supplychain-application/get?id=` + id })
  },

  // 新增供应链金融立项
  createSupplychainApplication: async (data: SupplychainApplicationVO) => {
    return await request.post({ url: `/business/supplychain-application/create`, data })
  },

  // 修改供应链金融立项
  updateSupplychainApplication: async (data: SupplychainApplicationVO) => {
    return await request.put({ url: `/business/supplychain-application/update`, data })
  },

  // 删除供应链金融立项
  deleteSupplychainApplication: async (id: number) => {
    return await request.delete({ url: `/business/supplychain-application/delete?id=` + id })
  },

  // 导出供应链金融立项 Excel
  exportSupplychainApplication: async (params) => {
    return await request.download({ url: `/business/supplychain-application/export-excel`, params })
  },
  // 供应链金融立项送审
  sendApprove: async (id: number) => {
    return await request.post({ url: `/business/supplychain-application/sendApprove?id=` + id })
  },
}
