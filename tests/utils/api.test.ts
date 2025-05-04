import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userApi, poemApi } from '../../src/utils/api'
import * as helpers from '../../src/utils/helpers'
import { loadPoemData, getPoemImageUrl } from '../../src/utils/api'

// 模拟helpers模块
vi.mock('../../src/utils/helpers', () => ({
  getLocalStorage: vi.fn((key, defaultValue) => {
    if (key === 'users') {
      return [
        { id: 1, username: '测试用户', score: 50, language: 'english' }
      ]
    }
    return defaultValue
  }),
  setLocalStorage: vi.fn()
}))

// 模拟fetch
global.fetch = vi.fn()

describe('用户API测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login应能获取用户信息和令牌', async () => {
    const result = await userApi.login('测试用户', 'password')
    
    expect(result.user).toBeDefined()
    expect(result.user.username).toBe('测试用户')
    expect(result.token).toBeDefined()
    expect(result.token.startsWith('mock-token-')).toBe(true)
  })
  
  it('login应在用户不存在时抛出错误', async () => {
    // 重写模拟返回空数组
    vi.mocked(helpers.getLocalStorage).mockReturnValueOnce([])
    
    await expect(userApi.login('不存在的用户', 'password'))
      .rejects.toThrow('用户不存在')
  })
  
  it('register应能创建新用户并返回令牌', async () => {
    const result = await userApi.register('新用户', 'password')
    
    expect(result.user).toBeDefined()
    expect(result.user.username).toBe('新用户')
    expect(result.user.score).toBe(0)
    expect(result.token).toBeDefined()
    
    // 检查是否调用了setLocalStorage保存用户
    expect(helpers.setLocalStorage).toHaveBeenCalled()
  })
  
  it('updateScore应能正确更新用户分数', async () => {
    const result = await userApi.updateScore(1, 5)
    
    expect(result).toBeDefined()
    expect(result.score).toBe(55) // 初始50 + 5
    
    // 检查是否调用了setLocalStorage保存更新
    expect(helpers.setLocalStorage).toHaveBeenCalled()
  })
})

describe('诗歌API测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('getChinesePoems应能获取中文诗歌列表', async () => {
    // 模拟fetch响应
    const mockPoems = [
      {
        id: "927908c0-999f-4d3f-8192-d67d28f93576",
        title: '静夜思',
        author: '李白',
        sentence: [
          {
            senid: 0,
            content: '床前明月光，'
          },
          {
            senid: 1,
            content: '疑是地上霜。'
          }
        ]
      }
    ]
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockPoems)
    })
    
    const poems = await poemApi.getChinesePoems()
    
    expect(poems).toEqual(mockPoems)
    expect(global.fetch).toHaveBeenCalledWith('/resource/poem_chinese.json')
  })
  
  it('getTranslations应能获取指定语言的翻译', async () => {
    // 模拟fetch响应
    const mockTranslations = [
      {
        id: "927908c0-999f-4d3f-8192-d67d28f93576",
        sentence: [
          {
            senid: 0,
            content: 'Moonlight before my bed,'
          },
          {
            senid: 1,
            content: 'Could it be frost on the ground?'
          }
        ]
      }
    ]
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockTranslations)
    })
    
    const translations = await poemApi.getTranslations('english')
    
    expect(translations).toEqual(mockTranslations)
    expect(global.fetch).toHaveBeenCalledWith('/resource/poem_english.json')
  })
  
  it('getRandomPoem应能获取随机诗歌', async () => {
    // 模拟getChinesePoems响应
    const mockPoems = [
      {
        id: "927908c0-999f-4d3f-8192-d67d28f93576",
        title: '静夜思',
        author: '李白',
        sentence: [
          {
            senid: 0,
            content: '床前明月光，'
          },
          {
            senid: 1,
            content: '疑是地上霜。'
          }
        ]
      }
    ]
    
    vi.spyOn(poemApi, 'getChinesePoems').mockResolvedValueOnce(mockPoems)
    
    const poem = await poemApi.getRandomPoem()
    
    expect(poem).toEqual(mockPoems[0])
    expect(poemApi.getChinesePoems).toHaveBeenCalled()
  })
})

describe('API utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('loadPoemData', () => {
    it('should load poem data for the specified language', async () => {
      const mockPoemData = [
        {
          id: '123',
          title: 'Test Poem',
          author: 'Test Author',
          sentence: [{ senid: 0, content: 'Test content' }]
        }
      ]

      // Setup mock fetch response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockPoemData
      })

      const result = await loadPoemData('chinese')
      
      expect(fetch).toHaveBeenCalledWith('/resource/data/poem_chinese.json')
      expect(result).toEqual(mockPoemData)
    })

    it('should throw an error if fetch fails', async () => {
      // Setup mock fetch response for failure
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false
      })

      await expect(loadPoemData('english')).rejects.toThrow('Failed to load english poem data')
      expect(fetch).toHaveBeenCalledWith('/resource/data/poem_english.json')
    })
  })

  describe('getPoemImageUrl', () => {
    it('should return the correct image URL for a poem ID', () => {
      const poemId = '927908c0-999f-4d3f-8192-d67d28f93576'
      const result = getPoemImageUrl(poemId)
      
      expect(result).toBe(`/resource/poem_images/${poemId}.webp`)
    })
  })
}) 