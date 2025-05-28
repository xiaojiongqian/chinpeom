import { describe, it, expect } from 'vitest'
import { getRandomPoem, getDistractors } from '@/utils/poem'

describe('诗歌工具函数测试', () => {
  // 模拟诗歌数据
  const mockPoems = [
    {
      id: '1',
      title: '静夜思',
      author: '李白',
      content: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。']
    },
    {
      id: '2',
      title: '春晓',
      author: '孟浩然',
      content: ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。']
    }
  ]

  it('getRandomPoem应该返回一首随机诗歌', () => {
    const poem = getRandomPoem(mockPoems)
    expect(poem).toBeDefined()
    expect(mockPoems).toContain(poem)
  })

  it('getDistractors应该返回指定数量的干扰项', () => {
    const correctLine = '床前明月光，'
    const count = 3
    const allLines = mockPoems.flatMap(poem => poem.content)

    const distractors = getDistractors(correctLine, count, allLines)

    expect(distractors).toHaveLength(count)
    expect(distractors).not.toContain(correctLine)

    // 检查是否所有干扰项都来自原始诗句
    distractors.forEach(line => {
      expect(allLines).toContain(line)
    })
  })
})
