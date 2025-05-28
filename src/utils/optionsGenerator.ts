import type { PoemOption } from '@/types'

/**
 * 难度级别
 */
export type DifficultyLevel = 'easy' | 'normal' | 'hard'

/**
 * 根据不同难度生成选项
 * @param correctSentence 正确的诗句
 * @param count 需要生成的选项数量
 * @param allSentences 所有可选的诗句
 * @param difficulty 难度级别
 * @returns 选项列表
 */
export function generateOptionsWithDifficulty(
  correctSentence: string,
  count: number,
  allSentences: string[],
  difficulty: DifficultyLevel
): PoemOption[] {
  // 筛选所有可能的诗句行，排除正确答案
  const possibleLines = allSentences.filter(line => line !== correctSentence)

  // 如果可选行数不足，则返回所有可用行加上正确答案
  if (possibleLines.length <= count - 1) {
    const options: PoemOption[] = [
      { value: correctSentence, label: correctSentence, isCorrect: true },
      ...possibleLines.map(line => ({
        value: line,
        label: line,
        isCorrect: false
      }))
    ]
    return shuffleArray(options)
  }

  // 获取正确答案的长度
  const correctLength = correctSentence.length

  // 根据难度设置长度差异的范围
  let maxLengthDiff: number

  switch (difficulty) {
    case 'easy':
      maxLengthDiff = 3 // 简单模式：长度差异较大
      break
    case 'normal':
      maxLengthDiff = 2 // 普通模式：中等长度差异
      break
    case 'hard':
      maxLengthDiff = 1 // 困难模式：长度差异小
      break
    default:
      maxLengthDiff = 2 // 默认为普通模式
  }

  // 按照长度差异和其他特征进行筛选和排序
  const getSimilarityScore = (sentence: string): number => {
    const lengthDiff = Math.abs(sentence.length - correctLength)

    // 计算共同字符数量（困难模式下更看重内容相似度）
    let commonChars = 0
    if (difficulty === 'hard') {
      for (const char of sentence) {
        if (correctSentence.includes(char)) {
          commonChars++
        }
      }
    }

    // 综合相似度分数（数字越小越相似）
    switch (difficulty) {
      case 'easy':
        // 简单模式：主要看长度差异，希望差异大
        return -lengthDiff
      case 'hard':
        // 困难模式：同时考虑长度和内容相似度，希望长度相近且内容有相似处
        return lengthDiff - commonChars * 0.5
      case 'normal':
      default:
        // 普通模式：主要看长度相似度
        return lengthDiff
    }
  }

  // 过滤并排序干扰项
  let filteredLines = [...possibleLines]

  // 特定难度的额外过滤
  if (difficulty !== 'easy') {
    // 对于普通和困难难度，过滤出长度相近的诗句
    filteredLines = filteredLines.filter(line => {
      return Math.abs(line.length - correctLength) <= maxLengthDiff
    })

    // 如果过滤后的选项不足，则放宽过滤条件
    if (filteredLines.length < count - 1) {
      filteredLines = [...possibleLines]
    }
  }

  // 按相似度排序
  filteredLines.sort((a, b) => {
    return getSimilarityScore(a) - getSimilarityScore(b)
  })

  // 困难模式下选择最相似的，简单模式选择最不相似的
  let selectedLines: string[]
  if (difficulty === 'easy') {
    // 简单模式：选择最不相似的
    selectedLines = filteredLines.slice(-count + 1)
  } else {
    // 普通和困难模式：选择最相似的
    selectedLines = filteredLines.slice(0, count - 1)
  }

  // 创建选项数组
  const options: PoemOption[] = [
    { value: correctSentence, label: correctSentence, isCorrect: true },
    ...selectedLines.map(line => ({
      value: line,
      label: line,
      isCorrect: false
    }))
  ]

  // 随机打乱选项顺序
  return shuffleArray(options)
}

/**
 * 随机打乱数组顺序
 * @param array 要打乱的数组
 * @returns 打乱后的数组
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // 交换元素
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}
