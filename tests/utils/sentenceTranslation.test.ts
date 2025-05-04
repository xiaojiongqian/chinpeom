import { describe, it, expect } from 'vitest'
import { createDisplayContent, findTranslatedSentence } from '@/utils/sentenceTranslation'
import type { Poem, TranslatedPoem } from '@/types'

describe('诗句翻译功能', () => {
  // 测试数据
  const poem: Poem = {
    id: 'test-poem',
    title: '测试诗',
    author: '测试作者',
    sentence: [
      { senid: 0, content: '第一句中文' },
      { senid: 1, content: '第二句中文' },
      { senid: 2, content: '第三句中文' },
      { senid: 3, content: '第四句中文' }
    ]
  }

  const translation: TranslatedPoem = {
    id: 'test-poem',
    sentence: [
      { senid: 0, content: 'First line in English' },
      { senid: 1, content: 'Second line in English' },
      { senid: 2, content: 'Third line in English' },
      { senid: 3, content: 'Fourth line in English' }
    ]
  }

  describe('findTranslatedSentence', () => {
    it('应该找到对应的翻译句子', () => {
      const result = findTranslatedSentence(translation, 2)
      expect(result).toBe('Third line in English')
    })

    it('当句子索引不存在时应该返回null', () => {
      const result = findTranslatedSentence(translation, 5)
      expect(result).toBeNull()
    })

    it('当translation为null时应该返回null', () => {
      const result = findTranslatedSentence(null, 1)
      expect(result).toBeNull()
    })
  })

  describe('createDisplayContent', () => {
    it('应该创建正确的显示内容，替换外语句子', () => {
      const result = createDisplayContent(poem, translation, 1)
      expect(result).toHaveLength(4)
      expect(result[0]).toBe('第一句中文')
      expect(result[1]).toBe('Second line in English') // 替换为英文
      expect(result[2]).toBe('第三句中文')
      expect(result[3]).toBe('第四句中文')
    })

    it('当没有翻译数据时应只返回原句', () => {
      const result = createDisplayContent(poem, null, 1)
      expect(result).toHaveLength(4)
      expect(result[1]).toBe('第二句中文') // 未替换
    })

    it('当诗歌为null时应返回空数组', () => {
      const result = createDisplayContent(null, translation, 1)
      expect(result).toEqual([])
    })

    it('当句子索引不存在时不应替换任何句子', () => {
      const result = createDisplayContent(poem, translation, 5)
      expect(result).toHaveLength(4)
      expect(result[0]).toBe('第一句中文')
      expect(result[1]).toBe('第二句中文')
      expect(result[2]).toBe('第三句中文')
      expect(result[3]).toBe('第四句中文')
    })

    it('当句子索引为负数时不应替换任何句子', () => {
      const result = createDisplayContent(poem, translation, -1)
      expect(result).toHaveLength(4)
      expect(result[0]).toBe('第一句中文')
    })
  })
}) 