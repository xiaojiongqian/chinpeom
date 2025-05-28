/**
 * 唐诗译境（Chinpoem）工具函数库
 */

/**
 * 打乱数组顺序（Fisher-Yates 洗牌算法）
 * @param array 要打乱的数组
 */
export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的新对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (obj instanceof Object) {
    const copy = {} as Record<string, any>
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as Record<string, any>)[key])
    })
    return copy as T
  }

  return obj
}

/**
 * 节流函数 - 限制函数在指定时间内只执行一次
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

/**
 * 防抖函数 - 延迟执行函数，若在延迟时间内再次调用则重新计时
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | null = null
  return function (...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay) as unknown as number
  }
}

/**
 * 获取本地存储中的数据
 * @param key 存储键名
 * @param defaultValue 默认值（如果存储中没有对应数据）
 * @returns 解析后的数据
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  const value = localStorage.getItem(key)
  if (value === null) {
    return defaultValue
  }
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error(`从本地存储解析数据失败: ${error}`)
    return defaultValue
  }
}

/**
 * 将数据保存到本地存储
 * @param key 存储键名
 * @param value 要存储的数据
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`保存数据到本地存储失败: ${error}`)
  }
}
