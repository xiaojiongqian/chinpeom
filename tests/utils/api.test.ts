import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userApi } from '../../src/services/api'
import { getPoemImageUrl } from '../../src/utils/resourceLoader'

// 用户API测试现在将使用setup.ts中创建的模拟
describe('用户API测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login应能获取用户信息和令牌', async () => {
    const result = await userApi.login('test@example.com', 'password')

    expect(result.user).toBeDefined()
    expect(result.token).toBeDefined()
  })

  it('register应能创建新用户并返回令牌', async () => {
    const result = await userApi.register('testuser', 'test@example.com', 'password')

    expect(result.user).toBeDefined()
    expect(result.user.username).toBe('testuser')
    expect(result.user.email).toBe('test@example.com')
    expect(result.token).toBeDefined()
  })

  it('updateScore应能正确更新用户分数', async () => {
    const scoreDelta = 5
    const result = await userApi.updateScore(scoreDelta)

    expect(result).toBeDefined()
    expect(result.score).toBe(15 + scoreDelta) // 根据模拟实现, 初始分数15 + 5
  })

  it('updateLanguage应能正确更新用户语言设置', async () => {
    const language = 'english'
    const result = await userApi.updateLanguage(language)

    expect(result).toBeDefined()
    expect(result.preferredLanguage).toBe(language)
  })
})

// 不再直接测试诗歌API，因为它们从静态资源获取数据
// 但是我们可以测试诗歌相关的工具函数

describe('诗歌工具函数', () => {
  describe('getPoemImageUrl', () => {
    it('应返回正确的诗歌图像URL', () => {
      const poemId = '927908c0-999f-4d3f-8192-d67d28f93576'
      const result = getPoemImageUrl(poemId)

      expect(result).toBe(`/resource/poem_images/${poemId}.webp`)
    })
  })
})
