import { useCache } from '@/hooks/web/useCache'

const { wsCache } = useCache()
/**
 * 获取当前时间戳并保存到缓存中
 * @param key 缓存键名
 * @returns 当前时间戳
 */
export function setCurrentTimestamp(key: string): number {
  const timestamp = Date.now()
  wsCache.set(key, timestamp)
  return timestamp
}

/**
 * 从缓存中获取时间戳
 * @param key 缓存键名
 * @param defaultValue 默认值，如果缓存中不存在该键
 * @returns 缓存的时间戳或默认值
 */
export function getTimestamp(key: string, defaultValue: number = 0): number {
  const value = wsCache.get(key)
  return value ? parseInt(value) : defaultValue
}

/**
 * 获取最后阅读时间
 * @param key 缓存键名
 * @returns 最后阅读时间戳
 */
export function getLastReadTime(key: string): number {
  return getTimestamp(key)
}

/**
 * 更新最后阅读时间为当前时间
 * @param key 缓存键名
 * @returns 更新后的时间戳
 */
export function updateLastReadTime(key: string): number {
  return setCurrentTimestamp(key)
}
