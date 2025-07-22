import request from '@/config/axios'
import { EventItem } from '@/components/Calendar/src/types'

const baseUrl = '/business/todo/events'
// 日历事件相关API接口

/**
 * 获取事件列表
 * @returns Promise<EventItem[]>
 */
export const getEvents = (): Promise<EventItem[]> => {
  return request.post({
    url: baseUrl + "/getEvents"
  })
}

/**
 * 添加新事件
 * @param eventData 事件数据
 * @returns Promise<EventItem | boolean>
 */
export const createEvent = (eventData: EventItem): Promise<EventItem | boolean> => {
  return request.post({
    url: baseUrl + "/addEvents",
    data: eventData
  })
}

/**
 * 更新事件
 * @param eventData 事件数据
 * @returns Promise<EventItem | boolean>
 */
export const updateEvent = (eventData: EventItem): Promise<EventItem | boolean> => {
  return request.put({
    url: baseUrl + "/updateEvent",
    data: eventData
  })
}

/**
 * 删除事件
 * @param eventId 事件ID
 * @returns Promise<boolean>
 */
export const deleteEvent = (id: string): Promise<boolean> => {
  return request.delete({
    url: baseUrl + "/deleteEvent?id=" + id,
  })
}

/**
 * 批量删除事件
 * @param eventIds 事件ID数组
 * @returns Promise<boolean>
 */
export const batchDeleteEvents = (eventIds: number[]): Promise<boolean> => {
  return request.delete({
    url: baseUrl + "/deleteEventsList",
    data: { ids: eventIds }
  })
}
