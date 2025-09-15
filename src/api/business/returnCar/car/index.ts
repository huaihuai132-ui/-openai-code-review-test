import request from '@/config/axios'

// 公司车辆 VO
export interface CarVO {
  id: number // 主键
  carNo: number // 车编号
  type: boolean // 车辆类别：0-电车，1-油车
  licensePlateNumber: string // 车牌号码
  useStatus: boolean // 使用状态: 0-闲置, 1-被使用, 2-被占用申请
}

// 公司车辆 API
export const CarApi = {
  // 查询公司车辆分页
  getCarPage: async (params: any) => {
    return await request.get({ url: `/company/car/page`, params })
  },

  // 查询公司车辆详情
  getCar: async (id: number) => {
    return await request.get({ url: `/company/car/get?id=` + id })
  },

  // 新增公司车辆
  createCar: async (data: CarVO) => {
    return await request.post({ url: `/company/car/create`, data })
  },

  // 修改公司车辆
  updateCar: async (data: CarVO) => {
    return await request.put({ url: `/company/car/update`, data })
  },

  // 删除公司车辆
  deleteCar: async (id: number) => {
    return await request.delete({ url: `/company/car/delete?id=` + id })
  },

  // 导出公司车辆 Excel
  exportCar: async (params) => {
    return await request.download({ url: `/company/car/export-excel`, params })
  }
}