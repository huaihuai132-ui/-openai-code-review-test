import request from '@/config/axios'

// 融资租赁立项 VO
export interface FinanceApplicationVO {
  id: number // 融资租赁立项表单主键
  applicationCode: string // 融资租赁立项申请编码
  userId: number // 申请人的用户编号
  companyId: number // 企业id
  leasedProperty: string // 融资标的物名称
  leasedPropertyNum: number // 融资标的物数量
  leasedPropertyValue: number // 拟融资标的物净值
  leaseAmount: number // 申请额度
  leaseTerm: number // 承租租期
  restrictedByPolicy: boolean // 是否列为国家产业政策限制/淘汰的高能耗、高水耗、高污染企业	
  advancedTechEquip: boolean // 租赁物是否为行业先进技术设备	
  obsoleteOrOverdep: boolean // 租赁物是否为濒临淘汰或折旧严重的设备
  taxFraudRisk: boolean // 是否涉嫌走私、偷逃税款或骗取出口退税
  landPermitOk: boolean // 企业（项目）立项、生产经营用地批文是否齐全
  ehsCompliance: boolean // 环评、能耗、安全消防是否达标
  licenseAnnualOk: boolean // 营业执照等证件是否经过当地年检
  badCreditRecord: boolean // 申请人及其法定代表人是否有不良信用记录
  filePath: string // 文件路径
  status: number // 单据状态
  processInstanceId: string // 流程实例的编号
  deptId: number // 部门id
}

// 融资租赁立项 API
export const FinanceApplicationApi = {
  // 查询融资租赁立项分页
  getFinanceApplicationPage: async (params: any) => {
    return await request.get({ url: `/business/finance-application/page`, params })
  },

  // 查询融资租赁立项详情
  getFinanceApplication: async (id: number) => {
    return await request.get({ url: `/business/finance-application/get?id=` + id })
  },

  // 新增融资租赁立项
  createFinanceApplication: async (data: FinanceApplicationVO) => {
    return await request.post({ url: `/business/finance-application/create`, data })
  },

  // 修改融资租赁立项
  updateFinanceApplication: async (data: FinanceApplicationVO) => {
    return await request.put({ url: `/business/finance-application/update`, data })
  },

  // 删除融资租赁立项
  deleteFinanceApplication: async (id: number) => {
    return await request.delete({ url: `/business/finance-application/delete?id=` + id })
  },

  // 导出融资租赁立项 Excel
  exportFinanceApplication: async (params) => {
    return await request.download({ url: `/business/finance-application/export-excel`, params })
  },

  // 融资租赁立项送审
  sendApprove: async (id: number) => {
    return await request.post({ url: `/business/finance-application/sendApprove?id=` + id })
  },

  // 导出融资租赁立项申请表
  exportFinanceApplicationDoc: async (id: number) => {
    return await request.download({ url: `/business/finance-application/export-doc?id=` + id })
  },
}
