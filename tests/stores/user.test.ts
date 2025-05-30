import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../../src/stores/user'

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// 模拟全局localStorage
vi.stubGlobal('localStorage', localStorageMock)

describe('用户Store测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('应该正确初始化用户Store', () => {
    const userStore = useUserStore()
    
    expect(userStore.user).toBeNull()
    expect(userStore.token).toBeNull()
    expect(userStore.isLoggedIn).toBe(false)
    expect(userStore.settings.language).toBe('english')
    expect(userStore.settings.theme).toBe('light')
    expect(userStore.settings.soundEffects).toBe(true)
  })

  it('login应该正确设置用户信息', () => {
    const userStore = useUserStore()
    const userData = {
      id: 1,
      username: 'testuser',
      score: 100,
      language: 'english'
    }
    const token = 'test-token'

    userStore.login(userData, token)

    expect(userStore.user).toEqual(userData)
    expect(userStore.token).toBe(token)
    expect(userStore.isLoggedIn).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', token)
  })

  it('logout应该清除用户信息', () => {
    const userStore = useUserStore()
    
    // 先登录
    userStore.login({
      id: 1,
      username: 'testuser',
      score: 100,
      language: 'english'
    }, 'test-token')

    // 然后登出
    userStore.logout()

    expect(userStore.user).toBeNull()
    expect(userStore.token).toBeNull()
    expect(userStore.isLoggedIn).toBe(false)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('updateScore应该正确更新用户分数', () => {
    const userStore = useUserStore()
    
    // 先登录
    userStore.login({
      id: 1,
      username: 'testuser',
      score: 100,
      language: 'english'
    }, 'test-token')

    userStore.updateScore(150)

    expect(userStore.user?.score).toBe(250)
  })

  it('setLanguage应该正确设置用户语言', () => {
    const userStore = useUserStore()
    
    // 先登录
    userStore.login({
      id: 1,
      username: 'testuser',
      score: 100,
      language: 'english'
    }, 'test-token')

    userStore.setLanguage('spanish')

    expect(userStore.user?.language).toBe('spanish')
  })

  it('updateSettings应该正确更新应用设置', () => {
    const userStore = useUserStore()
    
    userStore.updateSettings({
      theme: 'dark',
      soundEffects: false
    })

    expect(userStore.settings.theme).toBe('dark')
    expect(userStore.settings.soundEffects).toBe(false)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('app_settings', expect.any(String))
  })

  it('toggleSoundEffects应该切换音效设置', () => {
    const userStore = useUserStore()
    
    expect(userStore.settings.soundEffects).toBe(true)
    
    userStore.toggleSoundEffects()
    expect(userStore.settings.soundEffects).toBe(false)
    
    userStore.toggleSoundEffects()
    expect(userStore.settings.soundEffects).toBe(true)
  })

  it('toggleTheme应该切换主题设置', () => {
    const userStore = useUserStore()
    
    expect(userStore.settings.theme).toBe('light')
    
    userStore.toggleTheme()
    expect(userStore.settings.theme).toBe('dark')
    
    userStore.toggleTheme()
    expect(userStore.settings.theme).toBe('light')
  })

  it('计算属性应该正确工作', () => {
    const userStore = useUserStore()
    
    expect(userStore.username).toBe('')
    expect(userStore.score).toBe(0)
    expect(userStore.rank).toBe('白丁')
    expect(userStore.language).toBe('english')

    // 登录后
    userStore.login({
      id: 1,
      username: 'testuser',
      score: 250,
      language: 'english'
    }, 'test-token')

    expect(userStore.username).toBe('testuser')
    expect(userStore.score).toBe(250)
    expect(userStore.rank).toBe('探花')
    expect(userStore.language).toBe('english')
  })

  it('init应该从localStorage恢复状态', () => {
    const savedSettings = {
      language: 'english',
      theme: 'dark',
      soundEffects: false
    }
    const savedToken = 'saved-token'

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'app_settings') {
        return JSON.stringify(savedSettings)
      }
      if (key === 'token') {
        return savedToken
      }
      return null
    })

    const userStore = useUserStore()
    userStore.init()

    expect(userStore.settings).toEqual(expect.objectContaining(savedSettings))
    expect(userStore.token).toBe(savedToken)
  })

  it('init应该处理localStorage解析错误', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'app_settings') {
        return 'invalid-json'
      }
      return null
    })

    const userStore = useUserStore()
    
    // 不应该抛出错误
    expect(() => userStore.init()).not.toThrow()
    
    // 设置应该保持默认值
    expect(userStore.settings.language).toBe('english')
    expect(userStore.settings.theme).toBe('light')
  })

  it('saveSettings应该保存设置到localStorage', () => {
    const userStore = useUserStore()
    
    userStore.updateSettings({ theme: 'dark' })
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'app_settings',
      expect.stringContaining('"theme":"dark"')
    )
  })

  it('init中的loadSettings应该正确加载设置', () => {
    const savedSettings = {
      language: 'spanish',
      theme: 'dark',
      soundEffects: false
    }

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'app_settings') {
        return JSON.stringify(savedSettings)
      }
      return null
    })

    const userStore = useUserStore()
    userStore.init() // init会调用loadSettings

    expect(userStore.settings).toEqual(expect.objectContaining(savedSettings))
  })
}) 