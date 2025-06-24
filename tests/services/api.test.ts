import { describe, it, expect, beforeEach, vi } from 'vitest'

// 创建模拟的localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// 创建模拟的navigator
const navigatorMock = {
  onLine: true
}

// 模拟fetch
const mockFetch = vi.fn()

// 设置全局模拟
vi.stubGlobal('localStorage', localStorageMock)
vi.stubGlobal('navigator', navigatorMock)
vi.stubGlobal('fetch', mockFetch)

// 在模拟设置后导入要测试的模块
const { userApi, isAuthenticated, isOffline } = await import('../../src/services/api')

describe('API服务测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('mock-token')
    navigatorMock.onLine = true
  })

  describe('认证状态管理', () => {
    it('isAuthenticated应该正确检查登录状态', () => {
      // 有token时应该返回true
      localStorageMock.getItem.mockReturnValue('valid-token')
      expect(isAuthenticated()).toBe(true)
      
      // 没有token时应该返回false
      localStorageMock.getItem.mockReturnValue(null)
      expect(isAuthenticated()).toBe(false)
    })

    it('logout应该清除本地存储的token', () => {
      userApi.logout()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('离线状态检测', () => {
    it('isOffline应该正确检测网络状态', () => {
      // 在线状态
      navigatorMock.onLine = true
      expect(isOffline()).toBe(false)
      
      // 离线状态
      navigatorMock.onLine = false
      expect(isOffline()).toBe(true)
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

    it('getCurrentUser应该处理认证错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: '未授权，请登录' })
      })

      try {
        await userApi.getCurrentUser()
        expect(true).toBe(false) // 不应该到达这里
      } catch (error: any) {
        expect(error.message).toBe('未授权，请登录')
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      }
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

  describe('错误处理', () => {
    it('应该正确处理API错误响应', async () => {
      const errorMessage = '服务器内部错误'
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage })
      })

      try {
        await userApi.getCurrentUser()
        expect(true).toBe(false) // 不应该到达这里
      } catch (error: any) {
        expect(error.message).toBe(errorMessage)
      }
    })

    it('应该正确处理网络错误', async () => {
      const networkError = new Error('网络连接失败')
      mockFetch.mockRejectedValueOnce(networkError)

      try {
        await userApi.getCurrentUser()
        expect(true).toBe(false) // 不应该到达这里
      } catch (error) {
        expect(error).toBe(networkError)
      }
    })
  })

  describe('API基础功能', () => {
    it('应该正确构建API请求URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: {} })
      })

      await userApi.getCurrentUser()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/user/me',
        expect.any(Object)
      )
    })

    it('应该正确设置请求头', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: {} })
      })

      await userApi.getCurrentUser()

      const [, options] = mockFetch.mock.calls[0]
      
      expect(options.headers['Content-Type']).toBe('application/json')
      expect(options.headers['Authorization']).toBe('Bearer mock-token')
    })
  })
}) 