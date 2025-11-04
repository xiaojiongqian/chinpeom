import { LanguageType, resolveResourcePath } from './resourceLoader'

/**
 * 检查资源文件是否存在
 * @returns 资源文件检查结果
 */
export async function checkResourceFiles(): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = []
  const languages: LanguageType[] = [
    'chinese',
    'english',
    'french',
    'german',
    'japanese',
    'spanish'
  ]

  // 检查诗歌数据文件
  for (const lang of languages) {
    const resourceUrl = resolveResourcePath(`resource/data/poem_${lang}.json`)
    try {
      const response = await fetch(resourceUrl, { method: 'HEAD' })
      if (!response.ok) {
        errors.push(`诗歌数据文件未找到: ${resourceUrl}`)
      }
    } catch (error) {
      errors.push(`检查资源文件失败: ${resourceUrl}`)
    }
  }

  // 诗歌图片资源通过具体文件加载时验证，静态托管平台通常不支持目录级探测，因此此处不再发起额外请求。

  return {
    success: errors.length === 0,
    errors
  }
}
