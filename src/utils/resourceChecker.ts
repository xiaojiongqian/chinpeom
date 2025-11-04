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

  // 检查是否有诗歌图片文件夹
  try {
    const imagesUrl = resolveResourcePath('resource/poem_images/')
    const response = await fetch(imagesUrl, { method: 'HEAD' })
    if (!response.ok) {
      errors.push(`诗歌图片文件夹未找到: ${imagesUrl}`)
    }
  } catch (error) {
    // 某些服务器可能不允许列出目录内容，这里可以忽略
  }

  return {
    success: errors.length === 0,
    errors
  }
}
