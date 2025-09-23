import request from '@/config/axios'

// 供应链金融供应商 VO
export interface SupplychainSupplierVO {
  id: number // 供应链金融供应商主键
  supplierName: string // 供应商名称
  deptId: number // 部门id
}

export interface SupplychainSupplierAccountVO {
  id: number // 供应链金融供应商主键
  supplierName: string // 供应商名称
  accountName: string
  accountNum: string
  accountBanklocation: string
}

// 供应链金融供应商 API
export const SupplychainSupplierApi = {
  // 查询供应链金融供应商分页
  getSupplychainSupplierPage: async (params: any) => {
    return await request.get({ url: `/business/supplychain-supplier/page`, params })
  },

  // 查询供应链金融供应商详情
  getSupplychainSupplier: async (id: number) => {
    return await request.get({ url: `/business/supplychain-supplier/get?id=` + id })
  },

  // 新增供应链金融供应商
  createSupplychainSupplier: async (data: SupplychainSupplierVO) => {
    return await request.post({ url: `/business/supplychain-supplier/create`, data })
  },

  // 修改供应链金融供应商
  updateSupplychainSupplier: async (data: SupplychainSupplierVO) => {
    return await request.put({ url: `/business/supplychain-supplier/update`, data })
  },

  // 删除供应链金融供应商
  deleteSupplychainSupplier: async (id: number) => {
    return await request.delete({ url: `/business/supplychain-supplier/delete?id=` + id })
  },

  // 导出供应链金融供应商 Excel
  exportSupplychainSupplier: async (params) => {
    return await request.download({ url: `/business/supplychain-supplier/export-excel`, params })
  },

  getSimpleSupplychainSupplierList: async (): Promise<SupplychainSupplierVO[]> => {
    return await request.get({ url: `/business/supplychain-supplier/list-all-simple` })
  },
// ==================== 子表（供应链金融供应商账户） ====================

  // 获得供应链金融供应商账户列表
  getSupplychainSupplierAccountListBySupplierId: async (supplierId) => {
    return await request.get({ url: `/business/supplychain-supplier/supplychain-supplier-account/list-by-supplier-id?supplierId=` + supplierId })
  },
  getSupplychainSupplierAccount: async (accountId) => {
    return await request.get({ url: `/business/supplychain-supplier/supplychain-supplier-account/by-account-id?accountId=` + accountId })
  },
}
