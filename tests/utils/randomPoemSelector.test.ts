import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getRandomPoem,
  chooseRandomSentence,
  prepareTranslatedSentence
} from '@/utils/randomPoemSelector'
import type { Poem, TranslatedPoem } from '@/types'

// 模拟诗歌数据
const mockPoems: Poem[] = [
  {
    id: 'poem-1',
    title: '诗歌一',
    author: '作者一',
    sentence: [
      { senid: 0, content: '诗歌一第一句' },
      { senid: 1, content: '诗歌一第二句' }
    ]
  },
  {
    id: 'poem-2',
    title: '诗歌二',
    author: '作者二',
    sentence: [
      { senid: 0, content: '诗歌二第一句' },
      { senid: 1, content: '诗歌二第二句' },
      { senid: 2, content: '诗歌二第三句' }
    ]
  }
]

const mockTranslations: Record<string, TranslatedPoem> = {
  'poem-1': {
    id: 'poem-1',
    sentence: [
      { senid: 0, content: 'First line of poem one' },
      { senid: 1, content: 'Second line of poem one' }
    ]
  },
  'poem-2': {
    id: 'poem-2',
    sentence: [
      { senid: 0, content: 'First line of poem two' },
      { senid: 1, content: 'Second line of poem two' },
      { senid: 2, content: 'Third line of poem two' }
    ]
  }
}

// 模拟 Math.random
const mockMathRandom = vi.spyOn(Math, 'random')

describe('随机诗歌选择算法', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRandomPoem', () => {
    it('从提供的诗歌列表中随机选择一首诗歌', () => {
      mockMathRandom.mockReturnValueOnce(0.1) // 返回第一首诗
      const poem = getRandomPoem(mockPoems)
      expect(poem.id).toBe('poem-1')

      mockMathRandom.mockReturnValueOnce(0.6) // 返回第二首诗
      const poem2 = getRandomPoem(mockPoems)
      expect(poem2.id).toBe('poem-2')
    })

    it('当诗歌列表为空时应抛出错误', () => {
      expect(() => getRandomPoem([])).toThrowError('没有可用的诗歌数据')
    })

    it('当只有一首诗时应返回该诗', () => {
      const singlePoem = [mockPoems[0]]
      const poem = getRandomPoem(singlePoem)
      expect(poem.id).toBe('poem-1')
    })
  })

  describe('chooseRandomSentence', () => {
    it('从诗歌中随机选择一句', () => {
      const poem = mockPoems[1] // 使用三句的诗

      mockMathRandom.mockReturnValueOnce(0.1) // 返回第一句
      const index1 = chooseRandomSentence(poem)
      expect(index1).toBe(0)

      mockMathRandom.mockReturnValueOnce(0.5) // 返回第二句
      const index2 = chooseRandomSentence(poem)
      expect(index2).toBe(1)

      mockMathRandom.mockReturnValueOnce(0.9) // 返回第三句
      const index3 = chooseRandomSentence(poem)
      expect(index3).toBe(2)
    })

    it('当诗歌没有句子时应抛出错误', () => {
      const emptyPoem: Poem = {
        id: 'empty',
        title: '空诗',
        author: '无',
        sentence: []
      }
      expect(() => chooseRandomSentence(emptyPoem)).toThrowError('诗歌没有句子')
    })
  })

  describe('prepareTranslatedSentence', () => {
    it('应该正确获取指定句子的翻译', () => {
      const poem = mockPoems[0]
      const translation = mockTranslations['poem-1']
      const sentenceIndex = 1

      const result = prepareTranslatedSentence(poem, translation, sentenceIndex)

      expect(result.original).toBe('诗歌一第二句')
      expect(result.translated).toBe('Second line of poem one')
    })

    it('当句子索引无效时应抛出错误', () => {
      const poem = mockPoems[0]
      const translation = mockTranslations['poem-1']
      const invalidIndex = 5

      expect(() => prepareTranslatedSentence(poem, translation, invalidIndex)).toThrowError(
        '无效的句子索引'
      )
    })

    it('当翻译中找不到对应句子时应抛出错误', () => {
      const poem = mockPoems[0]
      // 创建缺少句子的翻译
      const incompleteTranslation: TranslatedPoem = {
        id: 'poem-1',
        sentence: [
          { senid: 0, content: 'First line of poem one' }
          // 缺少第二句翻译
        ]
      }
      const sentenceIndex = 1

      expect(() =>
        prepareTranslatedSentence(poem, incompleteTranslation, sentenceIndex)
      ).toThrowError('找不到该句的翻译')
    })
  })
})
