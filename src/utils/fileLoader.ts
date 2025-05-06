/**
 * 加载JSON文件并解析为指定类型
 * @param path 文件路径
 * @returns 解析后的数据
 */
export async function loadJsonFile<T>(path: string): Promise<T> {
  try {
    // 处理测试环境中的URL解析问题
    let fullPath = path;
    // 检查是否在测试环境中
    const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    if (isTestEnv && !path.startsWith('http')) {
      // 在测试环境中，为相对路径添加基础URL
      fullPath = `http://localhost${path.startsWith('/') ? '' : '/'}${path}`;
    }
    
    const response = await fetch(fullPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Error loading file ${path}:`, error);
    throw error;
  }
} 