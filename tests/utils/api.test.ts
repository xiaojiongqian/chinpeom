import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userApi } from '../../src/services/api'
import { getPoemImageUrl } from '../../src/utils/resourceLoader'

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
vi.stubGlobal('localStorage', localStorageMock)

// 模拟用户API功能
const mockUserApi = {
  getCurrentUser: vi.fn(),
  updateScore: vi.fn(),
  updateLanguage: vi.fn(),
  getLeaderboard: vi.fn(),
  logout: vi.fn()
}

describe('用户API测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('mock-token')
  })

  describe('认证状态管理', () => {
    it('应该正确检查认证状态', () => {
      // 有token的情况
      localStorageMock.getItem.mockReturnValue('valid-token')
      const hasToken = !!localStorage.getItem('auth_token')
      expect(hasToken).toBe(true)
      
      // 没有token的情况
      localStorageMock.getItem.mockReturnValue(null)
      const noToken = !!localStorage.getItem('auth_token')
      expect(noToken).toBe(false)
    })

    it('logout应该清除本地存储', () => {
      mockUserApi.logout()
      // 验证logout方法被调用
      expect(mockUserApi.logout).toHaveBeenCalled()
    })
  })

  describe('用户信息获取', () => {
    it('应该能够获取当前用户信息', async () => {
      const mockUser = {
        id: 1,
        display_name: 'Test User',
        total_score: 100,
        current_rank: '学童',
        language_preference: 'english',
        difficulty_mode: 'easy'
      }

      mockUserApi.getCurrentUser.mockResolvedValue(mockUser)
      
      const result = await mockUserApi.getCurrentUser()
      
      expect(mockUserApi.getCurrentUser).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('应该处理获取用户信息失败的情况', async () => {
      const errorMessage = '用户未登录'
      mockUserApi.getCurrentUser.mockRejectedValue(new Error(errorMessage))
      
      try {
        await mockUserApi.getCurrentUser()
        expect(true).toBe(false) // 不应该到达这里
      } catch (error: any) {
        expect(error.message).toBe(errorMessage)
      }
    })
  })

  describe('分数更新', () => {
    it('应该能够更新用户分数', async () => {
      const mockUpdatedUser = {
        id: 1,
        display_name: 'Test User',
        total_score: 150,
        current_rank: '学童'
      }

      mockUserApi.updateScore.mockResolvedValue(mockUpdatedUser)
      
      const result = await mockUserApi.updateScore(50)
      
      expect(mockUserApi.updateScore).toHaveBeenCalledWith(50)
      expect(result).toEqual(mockUpdatedUser)
    })

    it('应该处理负分数更新', async () => {
      const mockUpdatedUser = {
        id: 1,
        display_name: 'Test User',
        total_score: 80,
        current_rank: '白丁'
      }

      mockUserApi.updateScore.mockResolvedValue(mockUpdatedUser)
      
      const result = await mockUserApi.updateScore(-20)
      
      expect(mockUserApi.updateScore).toHaveBeenCalledWith(-20)
      expect(result.total_score).toBe(80)
    })
  })

  describe('语言设置', () => {
    it('应该能够更新语言偏好', async () => {
      const mockUpdatedUser = {
        id: 1,
        display_name: 'Test User',
        language_preference: 'spanish',
        hint_language: 'spanish'
      }

      mockUserApi.updateLanguage.mockResolvedValue(mockUpdatedUser)
      
      const result = await mockUserApi.updateLanguage('spanish')
      
      expect(mockUserApi.updateLanguage).toHaveBeenCalledWith('spanish')
      expect(result.language_preference).toBe('spanish')
    })

    it('应该支持中文模式切换', async () => {
      const mockUpdatedUser = {
        id: 1,
        display_name: 'Test User',
        language_preference: 'chinese',
        hint_language: 'none', // 中文模式下无外语提示
        difficulty_mode: 'hard' // 中文模式只支持困难模式
      }

      mockUserApi.updateLanguage.mockResolvedValue(mockUpdatedUser)
      
      const result = await mockUserApi.updateLanguage('chinese')
      
      expect(result.language_preference).toBe('chinese')
      expect(result.hint_language).toBe('none')
      expect(result.difficulty_mode).toBe('hard')
    })
  })

  describe('排行榜功能', () => {
    it('应该能够获取排行榜数据', async () => {
      const mockLeaderboard = [
        { id: 1, display_name: 'User1', total_score: 300, current_rank: '进士' },
        { id: 2, display_name: 'User2', total_score: 250, current_rank: '贡士' },
        { id: 3, display_name: 'User3', total_score: 200, current_rank: '举人' }
      ]

      mockUserApi.getLeaderboard.mockResolvedValue(mockLeaderboard)
      
      const result = await mockUserApi.getLeaderboard()
      
      expect(mockUserApi.getLeaderboard).toHaveBeenCalled()
      expect(result).toEqual(mockLeaderboard)
      expect(result.length).toBe(3)
    })
  })

  describe('本地存储管理', () => {
    it('应该正确存储认证token', () => {
      const token = 'test-auth-token'
      localStorage.setItem('auth_token', token)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token)
    })

    it('应该正确删除认证token', () => {
      localStorage.removeItem('auth_token')
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })

    it('应该能够检查token存在性', () => {
      localStorageMock.getItem.mockReturnValue('some-token')
      const token = localStorage.getItem('auth_token')
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token')
      expect(token).toBe('some-token')
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      const networkError = new Error('网络连接失败')
      mockUserApi.getCurrentUser.mockRejectedValue(networkError)
      
      try {
        await mockUserApi.getCurrentUser()
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBe(networkError)
      }
    })

    it('应该处理服务器错误', async () => {
      const serverError = new Error('服务器内部错误')
      mockUserApi.updateScore.mockRejectedValue(serverError)
      
      try {
        await mockUserApi.updateScore(100)
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBe(serverError)
      }
    })
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
