import request from '@/config/axios'

// 融资租赁设备 VO
export interface FinanceDeviceVO {
  id: number // 融资租赁设备表主键
  leaseId: number // 融资租赁单编号
  deviceName: string // 设备名称
  deviceSpecification: string // 规格型号
  deviceManufacturers: string // 生产厂家
  buyDate: Date // 购买日期
  quantity: number // 数量
  originalWorth: number // 原值
  netWorth: number // 净值
  deviceStatus: number // 设备状态
  deptId: number // 部门id
}

// 融资租赁设备 API
export const FinanceDeviceApi = {
  // 查询融资租赁设备分页
  getFinanceDevicePage: async (params: any) => {
    return await request.get({ url: `/business/finance-device/page`, params })
  },

  //查询去重过滤后的融资租赁设备分页
  getFinancDistincteDevicePage: async (params: any) => {
    return await request.get({ url: `/business/finance-device/get-distinct`, params })
  },

  // 查询融资租赁设备详情
  getFinanceDevice: async (id: number) => {
    return await request.get({ url: `/business/finance-device/get?id=` + id })
  },

  // 新增融资租赁设备
  createFinanceDevice: async (data: FinanceDeviceVO) => {
    return await request.post({ url: `/business/finance-device/create`, data })
  },

  // 修改融资租赁设备
  updateFinanceDevice: async (data: FinanceDeviceVO) => {
    return await request.put({ url: `/business/finance-device/update`, data })
  },

  // 删除融资租赁设备
  deleteFinanceDevice: async (id: number) => {
    return await request.delete({ url: `/business/finance-device/delete?id=` + id })
  },

  // 导出融资租赁设备 Excel
  exportFinanceDevice: async (params) => {
    return await request.download({ url: `/business/finance-device/export-excel`, params })
  },

  // 批量保存融资租赁设备
  batchSaveFinanceDevice: async (leaseId: number, deviceList: any[]) => {
    try {
      console.log('开始批量保存设备，租赁ID:', leaseId, '设备数量:', deviceList.length);
      
      // 辅助函数：检查是否是临时ID
      const isTemporaryId = (id: any): boolean => {
        if (!id) return false;
        const currentTime = Date.now();
        const oneHourAgo = currentTime - 3600000;
        return id > oneHourAgo && id <= currentTime;
      };
      
      // 数据验证
      if (!leaseId || leaseId <= 0) {
        throw new Error('租赁ID无效');
      }
      
      if (!deviceList || deviceList.length === 0) {
        throw new Error('设备列表为空');
      }
      
      // 分离删除的设备和需要保存/更新的设备
      const deletedDevices = deviceList.filter(device => device._deleted && device.id && !isTemporaryId(device.id));
      const activeDevices = deviceList.filter(device => !device._deleted);
      
      console.log('需要删除的设备数量:', deletedDevices.length);
      console.log('需要保存/更新的设备数量:', activeDevices.length);
      
      // 处理删除操作
      const deletePromises = deletedDevices.map(async (device, index) => {
        try {
          console.log(`开始删除第${index+1}个设备:`, {
            id: device.id,
            deviceName: device.deviceName
          });
          
          const result = await FinanceDeviceApi.deleteFinanceDevice(device.id);
          console.log(`第${index+1}个设备删除成功:`, result);
          return result;
        } catch (error) {
          console.error(`删除第${index+1}个设备失败:`, {
            device: device,
            error: error,
            errorMessage: error?.message,
            errorResponse: error?.response?.data
          });
          
          // 提取更详细的错误信息
          let errorMessage = '未知错误';
          if (error?.response?.data?.msg) {
            errorMessage = error.response.data.msg;
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          throw new Error(`删除第${index+1}个设备失败: ${errorMessage}`);
        }
      });
      
      // 等待所有删除操作完成
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log('所有设备删除操作完成');
      }
      
      // 如果没有需要保存/更新的设备，直接返回
      if (activeDevices.length === 0) {
        console.log('没有需要保存/更新的设备，操作完成');
        return [];
      }
      
      // 验证每个需要保存/更新的设备的必需字段
      activeDevices.forEach((device, index) => {
        // 检查设备名称
        if (!device.deviceName || device.deviceName.trim() === '') {
          throw new Error(`第${index+1}个设备的设备名称不能为空`);
        }
        if (device.deviceName.trim().length < 2) {
          throw new Error(`第${index+1}个设备的设备名称至少需要2个字符，当前为: "${device.deviceName}"`);
        }
        
        // 检查规格型号
        if (!device.deviceSpecification || device.deviceSpecification.trim() === '') {
          throw new Error(`第${index+1}个设备的规格型号不能为空`);
        }
        
        // 检查生产厂家
        if (!device.deviceManufacturers || device.deviceManufacturers.trim() === '') {
          throw new Error(`第${index+1}个设备的生产厂家不能为空`);
        }
        
        // 检查数量
        if (!device.quantity || device.quantity <= 0) {
          throw new Error(`第${index+1}个设备的数量必须大于0`);
        }
        
        // 检查净值
        if (device.netWorth === undefined || device.netWorth === null || device.netWorth < 0) {
          throw new Error(`第${index+1}个设备的净值不能为空且不能小于0`);
        }
        
        // 检查原值
        if (device.originalWorth === undefined || device.originalWorth === null || device.originalWorth < 0) {
          throw new Error(`第${index+1}个设备的原值不能为空且不能小于0`);
        }
        
        // 检查设备状态
        if (!device.deviceStatus || ![1, 2, 3, 4].includes(device.deviceStatus)) {
          throw new Error(`第${index+1}个设备的设备状态无效，必须是1-4之间的数字`);
        }
        
        // 特殊处理：只有当ID是最近生成的时间戳时才当作临时ID处理
        // 只处理最近1小时内生成的时间戳ID（3600000毫秒 = 1小时）
        const currentTime = Date.now();
        const oneHourAgo = currentTime - 3600000;
        if (device.id && device.id > oneHourAgo && device.id <= currentTime) {
          console.warn(`检测到第${index+1}个设备使用临时ID: ${device.id}，将作为新增设备处理`);
          // 对于临时ID的设备，移除ID让其作为新增处理
          delete device.id;
        }
      });
      
      // 使用Promise.all来并行处理所有设备的保存/更新
      const promises = activeDevices.map(async (device, index) => {
        try {
          console.log(`开始处理第${index+1}个设备:`, {
            id: device.id,
            deviceName: device.deviceName,
            operation: device.id ? '更新' : '创建'
          });
          
          // 确保设备关联到正确的租赁ID
          device.leaseId = leaseId;
          
          let result;
          // 根据设备是否有ID决定是创建还是更新
          if (device.id) {
            result = await FinanceDeviceApi.updateFinanceDevice(device);
          } else {
            result = await FinanceDeviceApi.createFinanceDevice(device);
          }
          
          console.log(`第${index+1}个设备处理成功:`, result);
          return result;
        } catch (error) {
          console.error(`保存第${index+1}个设备失败:`, {
            device: device,
            error: error,
            errorMessage: error?.message,
            errorResponse: error?.response?.data
          });
          
          // 提取更详细的错误信息
          let errorMessage = '未知错误';
          if (error?.response?.data?.msg) {
            errorMessage = error.response.data.msg;
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          throw new Error(`保存第${index+1}个设备失败: ${errorMessage}`);
        }
      });
      
      // 等待所有设备保存/更新完成
      const results = await Promise.all(promises);
      console.log('批量保存设备完成，成功数量:', results.length);
      return results;
    } catch (error) {
      console.error('批量保存设备失败:', {
        error: error,
        errorMessage: error?.message,
        leaseId: leaseId,
        deviceCount: deviceList?.length
      });
      throw error; // 重新抛出错误，让调用者处理
    }
  },
}
