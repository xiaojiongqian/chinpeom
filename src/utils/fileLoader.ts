/**
 * 加载JSON文件数据
 * @param filePath 文件路径
 * @returns Promise<T> 解析后的JSON数据
 */
export async function loadJsonFile<T>(filePath: string): Promise<T> {
  try {
    const response = await fetch(filePath)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data as T
  } catch (error) {
    console.error(`加载文件失败: ${filePath}`, error)
    throw error
  }
} 