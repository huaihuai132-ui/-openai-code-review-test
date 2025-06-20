/**
 * 获取当前时间戳并保存到缓存中
 * @param key 缓存键名
 * @returns 当前时间戳
 */
export function setCurrentTimestamp(key: string): number {
  const timestamp = Date.now();
  localStorage.setItem(key, timestamp.toString());
  return timestamp;
}

/**
 * 从缓存中获取时间戳
 * @param key 缓存键名
 * @param defaultValue 默认值，如果缓存中不存在该键
 * @returns 缓存的时间戳或默认值
 */
export function getTimestamp(key: string, defaultValue: number = 0): number {
  const value = localStorage.getItem(key);
  return value ? parseInt(value) : defaultValue;
}

/**
 * 获取最后阅读时间，如果不存在则设置当前时间
 * @param key 缓存键名
 * @returns 最后阅读时间戳
 */
export function getLastReadTime(key: string): number {
  const lastTime = getTimestamp(key);
  if (!lastTime) {
    return setCurrentTimestamp(key);
  }
  return lastTime;
}

/**
 * 更新最后阅读时间为当前时间
 * @param key 缓存键名
 * @returns 更新后的时间戳
 */
export function updateLastReadTime(key: string): number {
  return setCurrentTimestamp(key);
} 