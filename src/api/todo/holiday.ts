import request from '@/config/axios'
import { HolidayItem } from '@/components/Calendar/src/types'

const baseUrl = '/business/todo/holidays'

// 后端返回的假期数据结构
export interface BackendHolidayItem {
  id?: number;
  userId?: number;
  des: string;
  date: string | number | [number, number, number]; // 支持多种日期格式
  type?: number;
  ref: string;
  createTime?: number;
}

// 假期相关API接口

/**
 * 获取假期列表（包含管理员假期和个人假期）
 * @returns Promise<BackendHolidayItem[]>
 */
export const getHolidays = (): Promise<BackendHolidayItem[]> => {
  return request.post({
    url: baseUrl + "/getHolidays"
  })
}

/**
 * 创建新假期
 * @param holidayData 假期数据列表
 * @returns Promise<HolidayItem[]>
 */
export const createHoliday = (holidayData: HolidayItem[]): Promise<HolidayItem[]> => {
  return request.post({
    url: baseUrl + "/addHolidays",
    data: holidayData
  })
}

/**
 * 更新假期
 * @param holidayData 假期数据
 * @returns Promise<HolidayItem>
 */
export const updateHoliday = (holidayData: Partial<HolidayItem>): Promise<HolidayItem> => {
  return request.put({
    url: baseUrl + "/updateHoliday",
    data: holidayData
  })
}

/**
 * 删除假期
 * @param holidayId 假期ID
 * @param delRef 是否删除关联的假期
 * @returns Promise<void>
 */
export const deleteHoliday = (holidayId: number, delRef: string = 'false'): Promise<void> => {
  return request.delete({
    url: baseUrl + "/deleteHoliday?holidayId=" + holidayId + "&delRef=" + delRef
  })
}
