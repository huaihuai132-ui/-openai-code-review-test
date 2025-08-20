import request from '@/config/axios'

// 企业名单管理 VO
export interface FinanceCompanyVO {
  id: number // 主键ID
  enterpriseName: string // 企业全称
  creditCode: string // 统一社会信用代码
  shortName: string // 企业简称
  address: string // 地址
  legalRepresentative: string // 法定代表人
  industry: string // 所属行业
  registeredCapital: number // 注册资本
  companyNature: string // 企业性质
  mainBusiness: string // 主营业务
  mainProducts: string // 主要产品
  remark: string // 备注信息
  deptId: number // 部门编号
  filePath: string // 文件路径
  phone: string // 企业联系电话（手机号）
}

// 企业名单管理 API
export const FinanceCompanyApi = {
  // 查询企业名单管理分页
  getFinanceCompanyPage: async (params: any) => {
    return await request.get({ url: `/business/finance-company/page`, params })
  },

  // 查询企业名单管理详情
  getFinanceCompany: async (id: number) => {
    return await request.get({ url: `/business/finance-company/get?id=` + id })
  },

  // 新增企业名单管理
  createFinanceCompany: async (data: FinanceCompanyVO) => {
    return await request.post({ url: `/business/finance-company/create`, data })
  },

  // 修改企业名单管理
  updateFinanceCompany: async (data: FinanceCompanyVO) => {
    return await request.put({ url: `/business/finance-company/update`, data })
  },

  // 删除企业名单管理
  deleteFinanceCompany: async (id: number) => {
    return await request.delete({ url: `/business/finance-company/delete?id=` + id })
  },

  // 导出企业名单管理 Excel
  exportFinanceCompany: async (params) => {
    return await request.download({ url: `/business/finance-company/export-excel`, params })
  },

  getSimpleFinanceCompanyList: async (): Promise<FinanceCompanyVO[]> => {
    return await request.download({ url: `/business/finance-company/list-all-simple` })
  }

}
