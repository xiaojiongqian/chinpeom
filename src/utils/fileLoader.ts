/**
 * 加载JSON文件并解析为指定类型
 * @param path 文件路径
 * @returns 解析后的数据
 */
export async function loadJsonFile<T>(path: string): Promise<T> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Error loading file ${path}:`, error);
    throw error;
  }
} 