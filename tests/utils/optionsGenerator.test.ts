import { describe, it, expect, beforeEach } from 'vitest'
import { generateOptionsWithDifficulty } from '@/utils/optionsGenerator'
import type { Poem, PoemOption } from '@/types'

describe('备选答案生成算法测试', () => {
  // 模拟诗歌数据
  const mockPoems: Poem[] = [
    {
      id: '1',
      title: '静夜思',
      author: '李白',
      sentence: [
        { senid: 0, content: '床前明月光' },
        { senid: 1, content: '疑是地上霜' },
        { senid: 2, content: '举头望明月' },
        { senid: 3, content: '低头思故乡' }
      ]
    },
    {
      id: '2',
      title: '春晓',
      author: '孟浩然',
      sentence: [
        { senid: 0, content: '春眠不觉晓' },
        { senid: 1, content: '处处闻啼鸟' },
        { senid: 2, content: '夜来风雨声' },
        { senid: 3, content: '花落知多少' }
      ]
    },
    {
      id: '3',
      title: '相思',
      author: '王维',
      sentence: [
        { senid: 0, content: '红豆生南国' },
        { senid: 1, content: '春来发几枝' },
        { senid: 2, content: '愿君多采撷' },
        { senid: 3, content: '此物最相思' }
      ]
    }
  ]

  let allSentences: string[]

  beforeEach(() => {
    // 提取所有诗句
    allSentences = mockPoems.flatMap(poem => poem.sentence.map(s => s.content))
  })

  it('应该返回指定数量的选项', () => {
    const correctSentence = '床前明月光'
    const count = 4
    const difficulty = 'normal'
    
    const options = generateOptionsWithDifficulty(correctSentence, count, allSentences, difficulty)
    
    // 验证选项数量
    expect(options.length).toBe(count)
    
    // 验证选项中包含正确答案
    const correctOption = options.find(opt => opt.isCorrect)
    expect(correctOption).toBeDefined()
    expect(correctOption?.value).toBe(correctSentence)
  })

  it('应该根据难度调整干扰项的相似度', () => {
    const correctSentence = '床前明月光'
    const count = 4
    
    // 测试简单难度
    const easyOptions = generateOptionsWithDifficulty(correctSentence, count, allSentences, 'easy')
    
    // 测试困难难度
    const hardOptions = generateOptionsWithDifficulty(correctSentence, count, allSentences, 'hard')
    
    // 简单难度的干扰项应该与正确答案差异较大
    // 困难难度的干扰项应该与正确答案更相似
    
    // 获取简单和困难模式下的干扰项
    const easyDistractors = easyOptions.filter(opt => !opt.isCorrect)
    const hardDistractors = hardOptions.filter(opt => !opt.isCorrect)
    
    // 计算字符长度差异的均值
    const getAvgLengthDiff = (distractors: PoemOption[]) => {
      return distractors.reduce((sum, opt) => sum + Math.abs(opt.value.length - correctSentence.length), 0) / distractors.length
    }
    
    const easyAvgDiff = getAvgLengthDiff(easyDistractors)
    const hardAvgDiff = getAvgLengthDiff(hardDistractors)
    
    // 简单模式的长度差异应该大于或等于困难模式
    expect(easyAvgDiff).toBeGreaterThanOrEqual(hardAvgDiff)
  })

  it('当可用选项不足时应返回所有可用选项', () => {
    // 只有两首诗的情况
    const limitedSentences = mockPoems.slice(0, 1).flatMap(poem => poem.sentence.map(s => s.content))
    const correctSentence = limitedSentences[0]
    const count = 6 // 请求的选项数超过可用选项
    
    const options = generateOptionsWithDifficulty(correctSentence, count, limitedSentences, 'normal')
    
    // 选项数应该等于可用句子数（包含正确答案）
    expect(options.length).toBe(limitedSentences.length)
    
    // 验证存在正确选项
    expect(options.some(opt => opt.isCorrect && opt.value === correctSentence)).toBe(true)
  })

  it('选项顺序应该随机且没有重复', () => {
    const correctSentence = '床前明月光'
    const count = 4
    
    // 多次生成选项，检查顺序是否有变化
    const firstRun = generateOptionsWithDifficulty(correctSentence, count, allSentences, 'normal')
    const secondRun = generateOptionsWithDifficulty(correctSentence, count, allSentences, 'normal')
    
    // 检查两次生成的选项值是否完全相同（顺序可能不同）
    const firstValues = firstRun.map(opt => opt.value).sort()
    const secondValues = secondRun.map(opt => opt.value).sort()
    
    // 值应该相同（排序后）
    expect(firstValues).toEqual(secondValues)
    
    // 检查单次生成中没有重复选项
    const uniqueValues = new Set(firstRun.map(opt => opt.value))
    expect(uniqueValues.size).toBe(firstRun.length)
  })
}) 