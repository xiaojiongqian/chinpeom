import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../../src/stores/user'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock navigator.language
const mockNavigator = vi.fn()
Object.defineProperty(navigator, 'language', {
  get: mockNavigator,
  configurable: true
})

describe('User Store - Language Features', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Language Detection and Initialization', () => {
    it('中文浏览器应该默认设置为中文+困难模式', () => {
      mockNavigator.mockReturnValue('zh-CN')
      
      const store = useUserStore()
      store.init()

      expect(store.language).toBe('chinese')
      expect(store.difficulty).toBe('hard')
      expect(store.isInChineseMode).toBe(true)
      expect(store.hintLanguage).toBe('none')
    })

    it('英文浏览器应该默认设置为英文+简单模式', () => {
      mockNavigator.mockReturnValue('en-US')
      
      const store = useUserStore()
      store.init()

      expect(store.language).toBe('english')
      expect(store.difficulty).toBe('easy')
      expect(store.isInChineseMode).toBe(false)
      expect(store.hintLanguage).toBe('english')
    })

    it('西班牙语浏览器应该正确检测', () => {
      mockNavigator.mockReturnValue('es-ES')
      
      const store = useUserStore()
      store.init()

      expect(store.language).toBe('spanish')
      expect(store.difficulty).toBe('easy')
      expect(store.hintLanguage).toBe('spanish')
    })

    it('不支持的语言应该默认为英文', () => {
      mockNavigator.mockReturnValue('ko-KR')
      
      const store = useUserStore()
      store.init()

      expect(store.language).toBe('english')
      expect(store.difficulty).toBe('easy')
    })

    it('有保存的设置时应该使用保存的设置', () => {
      const savedSettings = JSON.stringify({
        language: 'french',
        difficulty: 'hard',
        theme: 'dark',
        soundEffects: false
      })
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'app_settings') return savedSettings
        return null
      })

      const store = useUserStore()
      store.init()

      expect(store.language).toBe('french')
      expect(store.difficulty).toBe('hard')
    })
  })

  describe('Language Switching', () => {
    it('切换到中文应该强制困难模式', () => {
      const store = useUserStore()
      store.init()

      // 首先设置为其他语言的简单模式
      store.setLanguage('english')
      store.setDifficulty('easy')
      expect(store.difficulty).toBe('easy')

      // 切换到中文
      store.setLanguage('chinese')

      expect(store.language).toBe('chinese')
      expect(store.difficulty).toBe('hard')
      expect(store.isInChineseMode).toBe(true)
      expect(store.hintLanguage).toBe('none')
    })

    it('从中文切换到其他语言应该保持困难模式', () => {
      const store = useUserStore()
      store.setLanguage('chinese')
      expect(store.difficulty).toBe('hard')

      // 切换到英文
      store.setLanguage('english')

      expect(store.language).toBe('english')
      expect(store.difficulty).toBe('hard') // 保持困难模式
      expect(store.isInChineseMode).toBe(false)
      expect(store.hintLanguage).toBe('english')
    })

    it('在非中文语言间切换应该保持当前难度', () => {
      const store = useUserStore()
      store.setLanguage('english')
      store.setDifficulty('easy')

      // 切换到西班牙语
      store.setLanguage('spanish')

      expect(store.language).toBe('spanish')
      expect(store.difficulty).toBe('easy') // 保持简单模式
      expect(store.hintLanguage).toBe('spanish')
    })

    it('语言切换应该同步用户数据（如果已登录）', () => {
      const store = useUserStore()
      
      // 模拟登录用户
      const userData = {
        id: 1,
        username: 'testuser',
        score: 20,
        language: 'english' as const,
        isPaid: false
      }
      store.login(userData, 'test-token')

      // 切换语言
      store.setLanguage('french')

      expect(store.user?.language).toBe('french')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify({ ...userData, language: 'french' })
      )
    })
  })

  describe('Difficulty Setting', () => {
    it('中文模式下不允许设置简单模式', () => {
      const store = useUserStore()
      store.setLanguage('chinese')

      const result = store.setDifficulty('easy')

      expect(result).toBe(false)
      expect(store.difficulty).toBe('hard')
    })

    it('中文模式下允许设置困难模式', () => {
      const store = useUserStore()
      store.setLanguage('chinese')

      const result = store.setDifficulty('hard')

      expect(result).toBe(true)
      expect(store.difficulty).toBe('hard')
    })

    it('非中文模式下允许设置任何难度', () => {
      const store = useUserStore()
      store.setLanguage('english')

      let result = store.setDifficulty('easy')
      expect(result).toBe(true)
      expect(store.difficulty).toBe('easy')

      result = store.setDifficulty('hard')
      expect(result).toBe(true)
      expect(store.difficulty).toBe('hard')
    })

    it('难度设置应该保存到localStorage', () => {
      const store = useUserStore()
      store.setLanguage('english')
      
      store.setDifficulty('hard')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'app_settings',
        expect.stringContaining('"difficulty":"hard"')
      )
    })
  })

  describe('Computed Properties', () => {
    it('isInChineseMode 应该正确反映中文模式状态', () => {
      const store = useUserStore()

      store.setLanguage('chinese')
      expect(store.isInChineseMode).toBe(true)

      store.setLanguage('english')
      expect(store.isInChineseMode).toBe(false)
    })

    it('hintLanguage 应该根据语言正确返回', () => {
      const store = useUserStore()

      store.setLanguage('chinese')
      expect(store.hintLanguage).toBe('none')

      store.setLanguage('english')
      expect(store.hintLanguage).toBe('english')

      store.setLanguage('spanish')
      expect(store.hintLanguage).toBe('spanish')
    })

    it('language 计算属性应该优先使用用户数据', () => {
      const store = useUserStore()
      
      // 设置默认语言
      store.setLanguage('english')
      expect(store.language).toBe('english')

      // 登录后用户语言不同
      const userData = {
        id: 1,
        username: 'testuser',
        score: 20,
        language: 'french' as const,
        isPaid: false
      }
      store.login(userData, 'test-token')

      expect(store.language).toBe('french')
    })
  })

  describe('Session Recovery', () => {
    it('恢复会话时应该同步用户语言到设置', () => {
      const userData = {
        id: 1,
        username: 'testuser',
        score: 20,
        language: 'german',
        isPaid: false
      }
      const settings = {
        language: 'english',
        difficulty: 'easy',
        theme: 'light',
        soundEffects: true
      }

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'saved-token'
        if (key === 'user_data') return JSON.stringify(userData)
        if (key === 'app_settings') return JSON.stringify(settings)
        return null
      })

      const store = useUserStore()
      store.init()

      // 用户数据应该被同步到设置中的语言
      expect(store.user?.language).toBe('english') // 同步后的语言
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_data',
        expect.stringContaining('"language":"english"')
      )
    })
  })

  describe('Integration with Payment Status', () => {
    it('中文模式应该与付费状态正确配合', () => {
      const store = useUserStore()
      
      // 中文免费用户
      const userData = {
        id: 1,
        username: 'testuser',
        score: 24,
        language: 'chinese' as const,
        isPaid: false
      }
      store.login(userData, 'test-token')

      expect(store.isInChineseMode).toBe(true)
      expect(store.difficulty).toBe('hard')
      expect(store.isPaidUser).toBe(false)
      expect(store.hintLanguage).toBe('none')

      // 升级为付费用户不应该影响语言设置
      store.upgradeToPaid()
      expect(store.isInChineseMode).toBe(true)
      expect(store.difficulty).toBe('hard')
    })
  })
}) 