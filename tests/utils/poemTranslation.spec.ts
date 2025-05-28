import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  loadPoemData,
  getTranslatedSentence,
  selectRandomSentence
} from '../../src/utils/poemTranslation'

// 模拟的诗歌数据
const mockChinesePoem = {
  id: 'test-poem-1',
  title: '测试诗',
  author: '测试作者',
  sentence: [
    { senid: 0, content: '第一句中文' },
    { senid: 1, content: '第二句中文' },
    { senid: 2, content: '第三句中文' },
    { senid: 3, content: '第四句中文' }
  ]
}

const mockEnglishPoem = {
  id: 'test-poem-1',
  title: 'Test Poem',
  author: 'Test Author',
  sentence: [
    { senid: 0, content: 'First sentence in English' },
    { senid: 1, content: 'Second sentence in English' },
    { senid: 2, content: 'Third sentence in English' },
    { senid: 3, content: 'Fourth sentence in English' }
  ]
}

// 模拟fetch API
// global.fetch = vi.fn()
const mockedFetch = vi.fn()
global.fetch = mockedFetch // 全局覆盖 fetch

describe('诗歌翻译功能', () => {
  beforeEach(() => {
    // vi.resetAllMocks()
    mockedFetch.mockClear() // 清除 mockedFetch 的记录
  })

  describe('loadPoemData', () => {
    it('应该能加载指定语言的诗歌数据', async () => {
      // 模拟fetch返回诗歌数据
      const mockResponse = {
        json: vi.fn().mockResolvedValue([mockChinesePoem]),
        ok: true
      }
      // global.fetch.mockResolvedValue(mockResponse) // 使用 mockedFetch
      mockedFetch.mockResolvedValue(mockResponse as any) // 使用 as any 避免类型错误

      const poems = await loadPoemData('chinese')

      // 测试环境中应该使用绝对URL
      // expect(fetch).toHaveBeenCalledWith('/resource/data/poem_chinese.json') // 使用 mockedFetch
      expect(mockedFetch).toHaveBeenCalledWith('/resource/data/poem_chinese.json')
      expect(poems).toEqual([mockChinesePoem])
    })

    it('当请求失败时应该使用测试环境默认数据', async () => {
      // 模拟fetch失败
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockRejectedValue(new Error('无效的JSON')),
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: '/resource/data/poem_english.json',
        clone: function () {
          return this
        },
        body: null,
        bodyUsed: false
      } as any)

      // 在测试环境中，应该返回默认的测试数据而不是抛出错误
      const result = await loadPoemData('english')

      // 确认调用了正确的URL
      expect(mockedFetch).toHaveBeenCalledWith('/resource/data/poem_english.json')

      // 确认返回了数据而不是错误
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('getTranslatedSentence', () => {
    it('应该能获取指定诗句的翻译', async () => {
      // 模拟已加载的中文和英文诗歌数据
      const mockLoadPoemData = vi.fn()
      mockLoadPoemData.mockResolvedValueOnce([mockChinesePoem])
      mockLoadPoemData.mockResolvedValueOnce([mockEnglishPoem])

      const translatedSentence = await getTranslatedSentence({
        poemId: 'test-poem-1',
        sentenceId: 1,
        fromLang: 'chinese',
        toLang: 'english',
        loadPoemDataFn: mockLoadPoemData
      })

      expect(translatedSentence).toEqual({
        original: '第二句中文',
        translated: 'Second sentence in English'
      })
    })

    it('当诗歌ID不存在时应该抛出错误', async () => {
      const mockLoadPoemData = vi.fn().mockResolvedValue([])

      await expect(
        getTranslatedSentence({
          poemId: 'non-exist-poem',
          sentenceId: 1,
          fromLang: 'chinese',
          toLang: 'english',
          loadPoemDataFn: mockLoadPoemData
        })
      ).rejects.toThrow('找不到指定的诗歌')
    })
  })

  describe('selectRandomSentence', () => {
    it('应该能随机选择一句诗进行翻译', async () => {
      // 模拟Math.random返回固定值以确保测试可预测
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const poem = mockChinesePoem
      const result = selectRandomSentence(poem)

      // 使用0.5作为随机值，应该选择下标为2的句子(因为0.5 * 4 = 2)
      expect(result).toEqual({
        poemId: 'test-poem-1',
        sentenceId: 2,
        sentenceContent: '第三句中文'
      })

      randomSpy.mockRestore()
    })

    it('不应该选择空的诗歌', () => {
      const emptyPoem = { ...mockChinesePoem, sentence: [] }

      expect(() => selectRandomSentence(emptyPoem)).toThrow('诗歌没有句子可供选择')
    })
  })
})
