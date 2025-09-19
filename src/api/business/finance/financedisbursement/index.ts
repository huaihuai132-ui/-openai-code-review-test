import request from '@/config/axios'

// 融资租赁放款 VO
export interface FinanceDisbursementVO {
  id: number // 融资租赁放款表单主键
  leaseId: number // 融资租赁单编号
  userId: number // 申请人的用户编号
  companyId: number // 企业id
  disbursementCode: string // 放款申请编码
  projectName: string // 项目名称
  leaseMode: string // 租赁模式
  propertyMain: string // 主要租赁物名称
  propertyOriginalValue: number // 标的物原值
  propertyAssessmentValue: number // 标的物估值
  usefulLife: number // 平均使用年限
  leaseAmount: number // 租赁本金
  leaseTerm: number // 承租租期
  depositAmount: number // 保证金
  putNumbers: number // 投放期数
  interestRate: number // 年租息率
  serveRate: number // 服务费比率
  repaymentMode: number // 还租方式
  thistimeAmount: number // 本次金额
  accruedAmount: number // 累计金额
  beneficiaryName: string // 收款单位账户名称
  beneficiaryBanklocation: string // 收款单位账开户行
  beneficiaryAccount: string // 收款单位账号
  fileList: string // 文件id列表
  sequenceCode: string // 文件序列编码
  status: number // 单据状态
  processInstanceId: string // 流程实例的编号
  deptId: number // 部门id
}

// 融资租赁放款 API
export const FinanceDisbursementApi = {
  // 查询融资租赁放款分页
  getFinanceDisbursementPage: async (params: any) => {
    return await request.get({ url: `/business/finance-disbursement/page`, params })
  },

  // 查询融资租赁放款详情
  getFinanceDisbursement: async (id: number) => {
    return await request.get({ url: `/business/finance-disbursement/get?id=` + id })
  },

  // 新增融资租赁放款
  createFinanceDisbursement: async (data: FinanceDisbursementVO) => {
    return await request.post({ url: `/business/finance-disbursement/create`, data })
  },

  // 修改融资租赁放款
  updateFinanceDisbursement: async (data: FinanceDisbursementVO) => {
    return await request.put({ url: `/business/finance-disbursement/update`, data })
  },

  // 删除融资租赁放款
  deleteFinanceDisbursement: async (id: number) => {
    return await request.delete({ url: `/business/finance-disbursement/delete?id=` + id })
  },

  // 导出融资租赁放款 Excel
  exportFinanceDisbursement: async (id: number) => {
    return await request.download({ url: `/business/finance-disbursement/fill-word-template?id=`+ id })
  },

   // 融资租赁放款送审
  sendApprove: async (id: number) => {
    return await request.post({ url: `/business/finance-disbursement/sendApprove?id=` + id })
  },

    // 融资租赁申请送审
    sendApprove: async (id: number) => {
      return await request.post({ url: `/business/finance-disbursement/sendApprove?id=` + id })
    },
}
