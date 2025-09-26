import request from '@/config/axios'

// 资产承租人信息 VO
export interface AssetRenterVO {
  id: number // 承租户ID
  renterName: string // 承租户名称
  renterPhone: string // 承租户联系电话
  renterContact: string // 承租户其他联系方式
  renterIdCard: string // 承租户身份证号
  renterContactAddress: string // 承租户联系地址
  remarks: string // 备注信息
}

// 资产承租人信息 API
export const AssetRenterApi = {
  // 查询资产承租人信息分页
  getAssetRenterPage: async (params: any) => {
    return await request.get({ url: `/business/asset-renter/page`, params })
  },

  // 查询资产承租人信息详情
  getAssetRenter: async (id: number) => {
    return await request.get({ url: `/business/asset-renter/get?id=` + id })
  },

  // 新增资产承租人信息
  createAssetRenter: async (data: AssetRenterVO) => {
    return await request.post({ url: `/business/asset-renter/create`, data })
  },

  // 修改资产承租人信息
  updateAssetRenter: async (data: AssetRenterVO) => {
    return await request.put({ url: `/business/asset-renter/update`, data })
  },

  // 删除资产承租人信息
  deleteAssetRenter: async (id: number) => {
    return await request.delete({ url: `/business/asset-renter/delete?id=` + id })
  },

  // 导出资产承租人信息 Excel
  exportAssetRenter: async (params) => {
    return await request.download({ url: `/business/asset-renter/export-excel`, params })
  }
}