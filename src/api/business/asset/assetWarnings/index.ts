import request from '@/config/axios'

// 资产预警信息 VO
export interface AssetWarningsVO {
  id: number // 预警ID
  assetId: number // 资产ID，关联business_asset_basic_info.id
  rentalId: number // 租赁信息ID，business_asset_rental_info.id
  warningLevel: number // 预警级别：0低，1-中，2-高,字典键business_asset_warnings_level
  warningDate: Date // 预警日期
  warningTitle: string // 预警标题
  warningContent: string // 预警消息
  notifyIds: number // 短信通知明细id列表
}

// 资产预警信息 API
export const AssetWarningsApi = {
  // 查询资产预警信息分页
  getAssetWarningsPage: async (params: any) => {
    return await request.get({ url: `/business/asset-warnings/page`, params })
  },

  // 查询资产预警信息详情
  getAssetWarnings: async (id: number) => {
    return await request.get({ url: `/business/asset-warnings/get?id=` + id })
  },

  // 新增资产预警信息
  createAssetWarnings: async (data: AssetWarningsVO) => {
    return await request.post({ url: `/business/asset-warnings/create`, data })
  },

  // 修改资产预警信息
  updateAssetWarnings: async (data: AssetWarningsVO) => {
    return await request.put({ url: `/business/asset-warnings/update`, data })
  },

  // 删除资产预警信息
  deleteAssetWarnings: async (id: number) => {
    return await request.delete({ url: `/business/asset-warnings/delete?id=` + id })
  },

  // 导出资产预警信息 Excel
  exportAssetWarnings: async (params) => {
    return await request.download({ url: `/business/asset-warnings/export-excel`, params })
  }
}