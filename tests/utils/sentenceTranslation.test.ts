import { describe, it, expect } from 'vitest'
import { createDisplayContent, findTranslatedSentence } from '@/utils/sentenceTranslation'
import type { Poem, TranslatedPoem } from '@/types'

describe('句子翻译工具测试', () => {
  const mockPoem: Poem = {
    id: 'test-poem',
    title: '测试诗',
    author: '测试作者',
    sentence: [
      { senid: 0, content: '床前明月光' },
      { senid: 1, content: '疑是地上霜' },
      { senid: 2, content: '举头望明月' },
      { senid: 3, content: '低头思故乡' }
    ]
  }

  const mockTranslation: TranslatedPoem = {
    id: 'test-poem',
    sentence: [
      { senid: 0, content: 'Moonlight before my bed' },
      { senid: 1, content: 'I thought it was frost on the ground' },
      { senid: 2, content: 'Looking up to see the bright moon' },
      { senid: 3, content: 'Lowering my head in thoughts of home' }
    ]
  }

  describe('findTranslatedSentence', () => {
    it('应该根据句子索引找到对应的翻译', () => {
      const result = findTranslatedSentence(mockTranslation, 0)
      expect(result).toBe('Moonlight before my bed')
    })

    it('当翻译对象为null时应返回null', () => {
      const result = findTranslatedSentence(null, 0)
      expect(result).toBeNull()
    })

    it('当找不到对应句子时应返回null', () => {
      const result = findTranslatedSentence(mockTranslation, 99)
      expect(result).toBeNull()
    })
  })

  describe('createDisplayContent', () => {
    it('简单模式下应该显示外语翻译', () => {
      const result = createDisplayContent(mockPoem, mockTranslation, 1, 'easy')
      
      expect(result).toHaveLength(4)
      expect(result[0]).toBe('床前明月光') // 原句
      expect(result[1]).toBe('I thought it was frost on the ground') // 外语翻译
      expect(result[2]).toBe('举头望明月') // 原句
      expect(result[3]).toBe('低头思故乡') // 原句
    })

    it('困难模式下应该显示***', () => {
      const result = createDisplayContent(mockPoem, mockTranslation, 1, 'hard')
      
      expect(result).toHaveLength(4)
      expect(result[0]).toBe('床前明月光') // 原句
      expect(result[1]).toBe('***') // 困难模式占位符
      expect(result[2]).toBe('举头望明月') // 原句
      expect(result[3]).toBe('低头思故乡') // 原句
    })

    it('当翻译不存在时简单模式应该显示***', () => {
      const result = createDisplayContent(mockPoem, null, 1, 'easy')
      
      expect(result).toHaveLength(4)
      expect(result[0]).toBe('床前明月光') // 原句
      expect(result[1]).toBe('***') // 无翻译时的占位符
      expect(result[2]).toBe('举头望明月') // 原句
      expect(result[3]).toBe('低头思故乡') // 原句
    })

    it('当诗歌对象为null时应该返回空数组', () => {
      const result = createDisplayContent(null, mockTranslation, 1, 'easy')
      expect(result).toEqual([])
    })

    it('默认难度（normal）应该显示外语翻译', () => {
      const result = createDisplayContent(mockPoem, mockTranslation, 2)
      
      expect(result).toHaveLength(4)
      expect(result[0]).toBe('床前明月光') // 原句
      expect(result[1]).toBe('疑是地上霜') // 原句
      expect(result[2]).toBe('Looking up to see the bright moon') // 外语翻译
      expect(result[3]).toBe('低头思故乡') // 原句
    })
  })
})
