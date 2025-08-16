import request from '@/config/axios'

// 融资租赁 VO
export interface FinanceLeaseVO {
  id: number // 融资租赁表单主键
  applicationId: number // 融资租赁立项编号
  userId: number // 申请人的用户编号
  companyId: number // 企业id
  leasedProperty: string // 融资标的物名称
  leasedPropertyNum: number // 融资标的物数量
  leasedPropertyValue: number // 拟融资标的物净值
  leaseMode: number // 租赁模式
  lienMode: number // 担保方式
  leaseAmount: number // 申请额度
  leaseDate: Date // 承租时间
  leaseTerm: number // 承租租期
  interestRate: number // 利率
  filePath: string // 文件路径
  status: number // 单据状态
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

  // 融资租赁送审
  sendApprove: async (id: number) => {
    return await request.post({ url: `/business/finance-lease/sendApprove?id=` + id })
  },
}
