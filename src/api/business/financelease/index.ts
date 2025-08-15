import request from '@/config/axios'

// 融资租赁 VO
export interface FinanceLeaseVO {
  id: number // 融资租赁表单主键
  userId: number // 申请人的用户编号
  companyId: number // 企业id
  leaseMode: string // 租赁模式
  leaseDate: Date // 承租时间
  rent: number // 租金
  interestRate: number // 利率
  leasedProperty: string // 租赁物
  lienMode: string // 担保方式
  status: number // 单据状态
  filePath: string // 文件路径
  processInstanceId: string // 流程实例的编号
  deptId: number // 部门id
}

// 融资租赁 API
export const FinanceLeaseApi = {
  // 查询融资租赁分页
  getFinanceLeasePage: async (params: any) => {
    return await request.get({ url: `/business/finance-lease/page`, params })
  },

  // 查询融资租赁详情
  getFinanceLease: async (id: number) => {
    return await request.get({ url: `/business/finance-lease/get?id=` + id })
  },

  // 新增融资租赁
  createFinanceLease: async (data: FinanceLeaseVO) => {
    return await request.post({ url: `/business/finance-lease/create`, data })
  },

  // 修改融资租赁
  updateFinanceLease: async (data: FinanceLeaseVO) => {
    return await request.put({ url: `/business/finance-lease/update`, data })
  },

  // 删除融资租赁
  deleteFinanceLease: async (id: number) => {
    return await request.delete({ url: `/business/finance-lease/delete?id=` + id })
  },

  // 导出融资租赁 Excel
  exportFinanceLease: async (params) => {
    return await request.download({ url: `/business/finance-lease/export-excel`, params })
  },

  // 删除融资租赁
  sendApprove: async (id: number) => {
    return await request.post({ url: `/business/finance-lease/sendApprove?id=` + id })
  },
}
