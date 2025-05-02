import { Poem } from '@/types/poem'

/**
 * 获取一首随机诗歌
 * @param poems 诗歌数组
 * @returns 随机选择的诗歌
 */
export function getRandomPoem(poems: Poem[]): Poem {
  const randomIndex = Math.floor(Math.random() * poems.length)
  return poems[randomIndex]
}

/**
 * 获取干扰选项
 * @param correctLine 正确的诗句
 * @param count 需要的干扰项数量
 * @param allLines 所有可选的诗句
 * @returns 指定数量的干扰项
 */
export function getDistractors(correctLine: string, count: number, allLines: string[]): string[] {
  // 筛选所有可能的诗句行，排除正确答案
  const possibleLines = allLines.filter(line => line !== correctLine)
  
  // 如果可选行数不足，则返回所有可用行
  if (possibleLines.length <= count) {
    return [...possibleLines]
  }
  
  // 获取正确答案的长度
  const correctLength = correctLine.length
  
  // 按照长度差异排序
  const sortedLines = [...possibleLines].sort((a, b) => {
    return Math.abs(a.length - correctLength) - Math.abs(b.length - correctLength)
  })
  
  // 返回最相近的几行
  return sortedLines.slice(0, count)
} 