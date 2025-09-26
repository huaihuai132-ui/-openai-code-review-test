import request from '@/config/axios'

// 资产租赁信息 VO
export interface AssetRentalInfoVO {
  id: number // 租赁信息ID
  rentalCode: string // 租赁信息唯一code
  renterId: number // 承租户id，关联business_assets_renter.id
  deposit: number // 押金(元)
  annualRent: number // 年租金(元)
  rentType: number // 收租方式：0-年租，1-月租，2-季度租，3-半年租，字典键business_asset_rent_type
  contractStartDate: Date // 合同开始日期
  contractEndDate: Date // 合同结束日期
  rentEndDate: Date // 收租截止期限
  businessPurpose: string // 经营用途
  assetId: number // 资产ID，关联business_asset_basic_info.id
  assetName: string // 外部资产名称
  contractStatus: number // 合同状态：0-草稿，1-生效中，2-失效，3-自动过期，4-完结，字典键business_assets_contract_status
  filePath: string // 合同文件id列表
  sequenceCode: string // 文件序列编码
  remarks: string // 备注信息
}

// 资产租赁信息 API
export const AssetRentalInfoApi = {
  // 查询资产租赁信息分页
  getAssetRentalInfoPage: async (params: any) => {
    return await request.get({ url: `/business/asset-rental-info/page`, params })
  },

  // 查询资产租赁信息详情
  getAssetRentalInfo: async (id: number) => {
    return await request.get({ url: `/business/asset-rental-info/get?id=` + id })
  },

  // 新增资产租赁信息
  createAssetRentalInfo: async (data: AssetRentalInfoVO) => {
    return await request.post({ url: `/business/asset-rental-info/create`, data })
  },

  // 修改资产租赁信息
  updateAssetRentalInfo: async (data: AssetRentalInfoVO) => {
    return await request.put({ url: `/business/asset-rental-info/update`, data })
  },

  // 删除资产租赁信息
  deleteAssetRentalInfo: async (id: number) => {
    return await request.delete({ url: `/business/asset-rental-info/delete?id=` + id })
  },

  // 导出资产租赁信息 Excel
  exportAssetRentalInfo: async (params) => {
    return await request.download({ url: `/business/asset-rental-info/export-excel`, params })
  }
}