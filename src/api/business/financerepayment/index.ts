import request from '@/config/axios'

// 融资租赁放款 VO
export interface FinanceRepaymentVO {
  id: number // 融资租赁还款表单主键
  disbursementId: number // 融资租赁放款表编号
  companyId: number // 企业id
  repaymentDate: Date // 还款时间
  rent: number // 租金
  interestRate: number // 利率
  capital: Date // 还款本金
  interest: Date // 还款利息
  repaymentStatus: number // 还款状态
  fileList: string // 文件id列表
  sequenceCode: string // 文件序列编码
  deptId: number // 部门id
}

// 融资租赁放款 API
export const FinanceRepaymentApi = {
  // 查询融资租赁放款分页
  getFinanceRepaymentPage: async (params: any) => {
    return await request.get({ url: `/business/finance-repayment/page`, params })
  },

  // 查询融资租赁放款详情
  getFinanceRepayment: async (id: number) => {
    return await request.get({ url: `/business/finance-repayment/get?id=` + id })
  },

  // 新增融资租赁放款
  createFinanceRepayment: async (data: FinanceRepaymentVO) => {
    return await request.post({ url: `/business/finance-repayment/create`, data })
  },

  // 修改融资租赁放款
  updateFinanceRepayment: async (data: FinanceRepaymentVO) => {
    return await request.put({ url: `/business/finance-repayment/update`, data })
  },

  // 删除融资租赁放款
  deleteFinanceRepayment: async (id: number) => {
    return await request.delete({ url: `/business/finance-repayment/delete?id=` + id })
  },

  // 导出融资租赁放款 Excel
  exportFinanceRepayment: async (params) => {
    return await request.download({ url: `/business/finance-repayment/export-excel`, params })
  },
}
