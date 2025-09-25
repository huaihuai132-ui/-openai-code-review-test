import request from '@/config/axios'

// 供应链金融付款申请 VO
export interface SupplychainRepaymentVO {
  id: number // 供应链金融付款申请主键
  userId: number // 申请人
  applyDept: number // 申请部门
  companyId: number // 企业id
  supplierId: number // 供应商id
  supplierAccountId: number // 供应商账户id
  applicationTime: Date // 申请时间
  fundSource: string // 资金来源
  metalId: string // 产品名称
  metalWeight: number // 数量
  metalPrice: number // 单价
  repaymentAmount: number // 总价
  remark: string // 备注
  filePath: string // 文件路径
  status: number // 单据状态
  processInstanceId: string // 流程实例的编号
  deptId: number // 部门id
}

// 供应链金融付款申请 API
export const SupplychainRepaymentApi = {
  // 查询供应链金融付款申请分页
  getSupplychainRepaymentPage: async (params: any) => {
    return await request.get({ url: `/business/supplychain-repayment/page`, params })
  },

  // 查询供应链金融付款申请详情
  getSupplychainRepayment: async (id: number) => {
    return await request.get({ url: `/business/supplychain-repayment/get?id=` + id })
  },

  // 新增供应链金融付款申请
  createSupplychainRepayment: async (data: SupplychainRepaymentVO) => {
    return await request.post({ url: `/business/supplychain-repayment/create`, data })
  },

  // 修改供应链金融付款申请
  updateSupplychainRepayment: async (data: SupplychainRepaymentVO) => {
    return await request.put({ url: `/business/supplychain-repayment/update`, data })
  },

  // 删除供应链金融付款申请
  deleteSupplychainRepayment: async (id: number) => {
    return await request.delete({ url: `/business/supplychain-repayment/delete?id=` + id })
  },

  // 导出供应链金融付款申请 Excel
  exportSupplychainRepayment: async (params) => {
    return await request.download({ url: `/business/supplychain-repayment/export-excel`, params })
  },
}
