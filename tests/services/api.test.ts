import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userApi, isAuthenticated, isOffline } from '../../src/services/api'

// 模拟fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

// 模拟navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
})

describe('API服务测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('mock-token')
    // 重置navigator.onLine
    ;(navigator as any).onLine = true
  })

  describe('用户认证', () => {
    it('login应该发送正确的请求并返回用户数据', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: 1,
          username: 'testuser',
          score: 100,
          language: 'chinese'
        },
        token: 'new-token'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await userApi.login('test@example.com', 'password')

      expect(mockFetch).toHaveBeenCalledWith('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password'
        })
      })

      expect(result).toEqual(mockResponse)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-token')
    })

    it('register应该发送正确的注册请求', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: 1,
          username: 'newuser',
          score: 0,
          language: 'chinese'
        },
        token: 'new-user-token'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await userApi.register('newuser', 'new@example.com', 'password')

      expect(mockFetch).toHaveBeenCalledWith('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password'
        })
      })

      expect(result).toEqual(mockResponse)
    })

    it('logout应该清除本地存储的token', () => {
      userApi.logout()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('用户信息管理', () => {
    it('getCurrentUser应该获取当前用户信息', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        score: 150,
        language: 'english'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      })

      const result = await userApi.getCurrentUser()

      expect(mockFetch).toHaveBeenCalledWith('/api/user/me', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      })

      expect(result).toEqual(mockUser)
    })

    it('updateScore应该更新用户分数', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        score: 200,
        language: 'chinese'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      })

      const result = await userApi.updateScore(50)

      expect(mockFetch).toHaveBeenCalledWith('/api/user/score', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({ scoreDelta: 50 })
      })

      expect(result).toEqual(mockUser)
    })

    it('updateLanguage应该更新用户语言设置', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        score: 100,
        language: 'spanish'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      })

      const result = await userApi.updateLanguage('spanish')

      expect(mockFetch).toHaveBeenCalledWith('/api/user/language', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({ language: 'spanish' })
      })

      expect(result).toEqual(mockUser)
    })
  })

  describe('排行榜功能', () => {
    it('getLeaderboard应该获取排行榜数据', async () => {
      const mockLeaderboard = [
        { id: 1, username: 'user1', score: 300 },
        { id: 2, username: 'user2', score: 250 },
        { id: 3, username: 'user3', score: 200 }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ leaderboard: mockLeaderboard })
      })

      const result = await userApi.getLeaderboard()

      expect(mockFetch).toHaveBeenCalledWith('/api/user/leaderboard', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      })

      expect(result).toEqual(mockLeaderboard)
    })
  })

  describe('认证状态检查', () => {
    it('isAuthenticated应该在有token时返回true', () => {
      localStorageMock.getItem.mockReturnValue('some-token')
      expect(isAuthenticated()).toBe(true)
    })

    it('isAuthenticated应该在没有token时返回false', () => {
      localStorageMock.getItem.mockReturnValue(null)
      expect(isAuthenticated()).toBe(false)
    })
  })

  describe('离线状态检查', () => {
    it('isOffline应该在在线时返回false', () => {
      ;(navigator as any).onLine = true
      expect(isOffline()).toBe(false)
    })

    it('isOffline应该在离线时返回true', () => {
      ;(navigator as any).onLine = false
      expect(isOffline()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(userApi.login('test@example.com', 'password'))
        .rejects.toThrow('Network error')
    })

    it('应该处理HTTP错误状态', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      })

      await expect(userApi.getCurrentUser())
        .rejects.toThrow('Unauthorized')
    })

    it('getCurrentUser在认证错误时应该清除token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: '未授权，请登录' })
      })

      await expect(userApi.getCurrentUser()).rejects.toThrow('未授权，请登录')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })

    it('getCurrentUser在token过期时应该清除token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: '令牌已过期，请重新登录' })
      })

      await expect(userApi.getCurrentUser()).rejects.toThrow('令牌已过期，请重新登录')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('请求头设置', () => {
    it('请求应该包含正确的Authorization头', async () => {
      const token = 'test-token'
      localStorageMock.getItem.mockReturnValue(token)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: {} })
      })

      await userApi.getCurrentUser()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`
          })
        })
      )
    })

    it('所有请求应该包含正确的Content-Type头', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await userApi.register('test', 'test@example.com', 'password')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })
  })
}) 