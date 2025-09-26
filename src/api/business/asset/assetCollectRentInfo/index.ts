import request from '@/config/axios'

// 收租记录 VO
export interface AssetCollectRentInfoVO {
  id: number // 收租记录ID
  collectRentCode: string // 收租记录唯一code
  assetId: number // 资产ID，关联business_asset_basic_info.id
  rentalId: number // 租赁信息ID，business_asset_rental_info.id
  renterId: number // 承租人id
  handleManId: number // 办理人/收租人id
  rentBillName: string // 账单名称
  planRentCount: number // 预计收取租金(元)
  actualRentCount: number // 实际收取租金(元)
  filePath: string // 账单文件id列表
  sequenceCode: string // 文件序列编码
  planCollectDate: Date // 预计收租日期
  actualCollectDate: Date // 实际收租日期
}

// 收租记录 API
export const AssetCollectRentInfoApi = {
  // 查询收租记录分页
  getAssetCollectRentInfoPage: async (params: any) => {
    return await request.get({ url: `/business/asset-collect-rent-info/page`, params })
  },

  // 查询收租记录详情
  getAssetCollectRentInfo: async (id: number) => {
    return await request.get({ url: `/business/asset-collect-rent-info/get?id=` + id })
  },

  // 新增收租记录
  createAssetCollectRentInfo: async (data: AssetCollectRentInfoVO) => {
    return await request.post({ url: `/business/asset-collect-rent-info/create`, data })
  },

  // 修改收租记录
  updateAssetCollectRentInfo: async (data: AssetCollectRentInfoVO) => {
    return await request.put({ url: `/business/asset-collect-rent-info/update`, data })
  },

  // 删除收租记录
  deleteAssetCollectRentInfo: async (id: number) => {
    return await request.delete({ url: `/business/asset-collect-rent-info/delete?id=` + id })
  },

  // 导出收租记录 Excel
  exportAssetCollectRentInfo: async (params) => {
    return await request.download({ url: `/business/asset-collect-rent-info/export-excel`, params })
  }
}