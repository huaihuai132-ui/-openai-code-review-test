import request from '@/config/axios'

// 融资租赁租后管理 VO
export interface FinanceManageVO {
  id: number // 融资租赁租后管理表单主键
  manageCode: string // 租后管理编码
  leaseId: number // 融资租赁单编号
  companyId: number // 企业id
  leaseAmount: number // 租赁总额
  leaseAmountSurplus: number // 租赁余额
  userId: number // 检查人的用户编号
  manageDate: Date // 检查日期
  corpNameChanged: boolean // 企业名称是否发生变更
  legalRepChanged: boolean // 法人代表是否发生变更
  actualControllerChanged: boolean // 实际控制人是否发生变更
  mgmtTeamChanged: boolean // 企业主要管理层是否发生变动
  regCapitalChanged: boolean // 企业注册资本是否发生变化
  licenseAnnualOk: boolean // 企业营业执照是否通过年检
  bizAddrChanged: boolean // 企业经营场所是否发生变化
  equityStructChanged: boolean // 企业股权结构是否发生变化
  fundCircleInRelated: boolean // 资金是否存在在关联方流转
  industryChanged: boolean // 所在行业是否发生变化
  mainBizChanged: boolean // 主营业务和主要产品是否发生变化
  keyCustomersChanged: boolean // 主要客户是否发生变化
  upstreamChanged: boolean // 上游企业是否发生变化
  processTechChanged: boolean // 生产工艺及技术是否发生变化
  utilityTaxDecline: boolean // 生产用电量、用水量及纳税数额是否显著下降
  startupNormal: boolean // 近期开工情况是否正常
  officeDisorder: boolean // 办公秩序是否混乱，人员稀少
  newProjectLaunched: boolean // 是否实施新项目
  newBadCredit: boolean // 企业是否有新增征信不良记录
  involvedLawsuit: boolean // 企业是否涉及司法诉讼
  involvedPenalty: boolean // 企业是否涉及行政处罚
  taxPaymentNormal: boolean // 企业是否正常缴纳税金
  salaryPaidOnTime: boolean // 企业是否按期支付员工工资
  cooperatePostLoan: boolean // 企业是否配合贷后管理工作
  leaseInPlace: boolean // 租赁物件是否在约定使用场所
  leaseNormal: boolean // 租赁物件情况是否正常
  otherDescriptions: string // 其他检查情况说明
  totalAssets: number // 总资产
  totalAssetsRemark: string // 总资产备注
  inventory: number // 存货
  inventoryRemark: string // 存货备注
  accountsReceivable: number // 应收账款
  accountsReceivableRemark: string // 应收账款备注
  totalLiabilities: number // 总负债
  totalLiabilitiesRemark: string // 总负债备注
  bankLoans: number // 银行借款
  bankLoansRemark: string // 银行借款备注
  accountsPayable: number // 应付账款
  accountsPayableRemark: string // 应付账款备注
  mainBizIncome: number // 主营业务收入
  mainBizIncomeRemark: string // 主营业务收入备注
  netProfit: number // 净利润
  netProfitRemark: string // 净利润备注
  debtAssetRatio: number // 资产负债率(%)
  debtAssetRatioRemark: string // 资产负债率(%)备注
  fsObviouslyFalse: boolean // 财务报表是否明显不实
  fsObviouslyFalseReason: string // 财务报表是否明显不实原因
  arSharpRiseDelay: boolean // 应收账款有无大幅增加，收回拖延
  arSharpRiseDelayReason: string // 应收账款有无大幅增加，收回拖延原因
  inventorySurge: boolean // 存货是否较大，有无突然增加
  inventorySurgeReason: string // 存货是否较大，有无突然增加原因
  bankDebtRise: boolean // 银行债务有无大量增加
  bankDebtRiseReason: string // 银行债务有无大量增加原因
  debtStructChange: boolean // 资产负债结构有无重大变化
  debtStructChangeReason: string // 资产负债结构有无重大变化原因
  currentRatioLow: boolean // 流动比远低于正常值
  currentRatioLowReason: string // 流动比远低于正常值原因
  costUpProfitDown: boolean // 成本上升或利润下降
  costUpProfitDownReason: string // 成本上升或利润下降原因
  cashBalanceDecline: boolean // 货币资金余额是否不断下降
  cashBalanceDeclineReason: string // 货币资金余额是否不断下降原因
  paymentDelay: boolean // 是否拖延支付用款费用
  paymentDelayReason: string // 是否拖延支付用款费用原因
  financialSituation: string // 财务其他风险
  overallRiskEval: string // 对项目风险状况的总体评价
  overallLeaseEval: string // 对租赁物件状况的总体评价
  riskMgmtSuggestion: number // 对该项目的风险管理策略建议
  filePath: string // 文件路径
  status: number // 单据状态
  processInstanceId: string // 流程实例的编号
  deptId: number // 部门id
}

// 融资租赁租后管理 API
export const FinanceManageApi = {
  // 查询融资租赁租后管理分页
  getFinanceManagePage: async (params: any) => {
    return await request.get({ url: `/business/finance-manage/page`, params })
  },

  // 查询融资租赁租后管理详情
  getFinanceManage: async (id: number) => {
    return await request.get({ url: `/business/finance-manage/get?id=` + id })
  },

  // 新增融资租赁租后管理
  createFinanceManage: async (data: FinanceManageVO) => {
    return await request.post({ url: `/business/finance-manage/create`, data })
  },

  // 修改融资租赁租后管理
  updateFinanceManage: async (data: FinanceManageVO) => {
    return await request.put({ url: `/business/finance-manage/update`, data })
  },

  // 删除融资租赁租后管理
  deleteFinanceManage: async (id: number) => {
    return await request.delete({ url: `/business/finance-manage/delete?id=` + id })
  },

  // 导出融资租赁租后管理 Excel
  exportFinanceManage: async (params) => {
    return await request.download({ url: `/business/finance-manage/export-excel`, params })
  },


  // 融资租赁租后管理送审
  sendApprove: async (id: number) => {
    return await request.post({ url: `/business/finance-manage/sendApprove?id=` + id })
  },

  // 导出融资租赁租后管理 Excel
  exportFinanceManageDoc: async (id: number) => {
    return await request.download({ url: `/business/finance-manage/fill-word-template?id=` + id })
  },
}
