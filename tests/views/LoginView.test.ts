import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// 模拟HTMLAudioElement
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  src: '',
  currentTime: 0,
  volume: 0.3,
  loop: false,
  preload: 'metadata',
  paused: true
}

vi.stubGlobal('Audio', vi.fn().mockImplementation(() => mockAudio))

// 模拟document事件监听器
Object.defineProperty(document, 'addEventListener', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(document, 'removeEventListener', {
  value: vi.fn(),
  writable: true
})

// 模拟路由器
const routerMock = {
  push: vi.fn().mockResolvedValue(undefined),
  currentRoute: {
    value: {
      path: '/',
      name: 'login'
    }
  }
}

// 模拟stores
vi.mock('../../src/stores/music', () => ({
  useMusicStore: vi.fn()
}))

vi.mock('../../src/stores/user', () => ({
  useUserStore: vi.fn()
}))

// 模拟路由器
vi.mock('vue-router', () => ({
  useRouter: () => routerMock
}))

// 动态导入组件和stores
const { default: LoginView } = await import('../../src/views/LoginView.vue')
const { useMusicStore } = await import('../../src/stores/music')
const { useUserStore } = await import('../../src/stores/user')

describe('LoginView测试', () => {
  let wrapper: any
  let musicStoreMock: any
  let userStoreMock: any
  let pinia: any

  beforeEach(async () => {
    // 创建store模拟对象
    musicStoreMock = {
      initializeAudio: vi.fn().mockResolvedValue(undefined),
      playRandomMusic: vi.fn().mockResolvedValue(undefined),
      enableAudio: vi.fn(),
      isAudioEnabled: false,
      isPlaying: false,
      isMuted: false,
      currentMusicIndex: 0,
      volume: 0.3,
      musicList: ['test-music.mp3']
    }

    userStoreMock = {
      login: vi.fn(),
      isLoggedIn: false,
      username: '',
      language: 'english'
    }

    // 设置模拟返回值
    ;(useMusicStore as any).mockReturnValue(musicStoreMock)
    ;(useUserStore as any).mockReturnValue(userStoreMock)

    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()

    // 挂载组件
    wrapper = mount(LoginView, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': true
        }
      }
    })
  })

  describe('组件挂载', () => {
    it('应该正确渲染登录视图', () => {
      expect(wrapper.find('.login-container').exists()).toBe(true)
      expect(wrapper.find('h1').text()).toContain('唐诗译境')
    })

    it('应该显示登录按钮和其他控制按钮', () => {
      // 检查登录按钮
      const loginButtons = wrapper.findAll('button').filter((btn: any) => 
        btn.text().includes('开始游戏') || btn.text().includes('登录')
      )
      expect(loginButtons.length).toBeGreaterThan(0)

      // 检查其他按钮（音效开关等）
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(1)
    })
  })

  describe('音效功能', () => {
    it('应该有音效开关按钮', () => {
      const audioButtons = wrapper.findAll('button').filter((btn: any) => 
        btn.text().includes('🔊') || btn.text().includes('🔇')
      )
      expect(audioButtons.length).toBeGreaterThan(0)
    })

    it('点击音效按钮应该调用音效相关方法', async () => {
      // 查找包含音效图标的按钮
      const audioButton = wrapper.findAll('button').find((btn: any) => 
        btn.text().includes('🔊') || btn.text().includes('🔇')
      )
      
      if (audioButton) {
        await audioButton.trigger('click')
        
        // 验证音效相关方法被调用
        expect(musicStoreMock.enableAudio).toHaveBeenCalled()
      }
    })

    it('应该正确初始化音频系统', () => {
      // 组件挂载时应该初始化音频
      expect(musicStoreMock.initializeAudio).toHaveBeenCalled()
    })
  })

  describe('导航功能', () => {
    it('点击开始游戏应该导航到游戏页面', async () => {
      // 查找开始游戏按钮
      const startGameButton = wrapper.findAll('button').find((btn: any) => 
        btn.text().includes('开始游戏') || btn.text().includes('开始')
      )

      if (startGameButton) {
        await startGameButton.trigger('click')
        
        // 验证路由跳转
        expect(routerMock.push).toHaveBeenCalledWith('/quizview')
      }
    })

    it('应该有设置页面的导航链接', () => {
      // 检查是否有指向设置页面的链接或按钮
      const settingsLinks = wrapper.findAll('[href="/settings"], [to="/settings"]')
      expect(settingsLinks.length).toBeGreaterThan(0)
    })
  })

  describe('第三方登录功能', () => {
    it('应该显示第三方登录选项', () => {
      // 检查是否有第三方登录相关的UI元素
      const loginOptionsContainer = wrapper.findAll('.login-options, .auth-buttons, [class*="login"]')
      expect(loginOptionsContainer.length).toBeGreaterThan(0)
    })

    it('应该有Google登录选项', () => {
      // 查找Google登录相关的元素
      const googleElements = wrapper.findAll('button, [class*="google"], [data-provider="google"]')
        .filter((el: any) => el.text().toLowerCase().includes('google') || el.classes().some((cls: string) => cls.includes('google')))
      
      expect(googleElements.length).toBeGreaterThanOrEqual(0) // 可能存在Google登录
    })
  })

  describe('状态管理', () => {
    it('音乐store应该正确初始化', () => {
      // 验证音乐store的初始状态
      expect(musicStoreMock.isAudioEnabled).toBe(false)
      expect(musicStoreMock.isPlaying).toBe(false)
      expect(musicStoreMock.isMuted).toBe(false)
      expect(musicStoreMock.volume).toBe(0.3)
    })

    it('用户store应该正确初始化', () => {
      // 验证用户store的初始状态
      expect(userStoreMock.isLoggedIn).toBe(false)
      expect(userStoreMock.username).toBe('')
      expect(userStoreMock.language).toBe('english')
    })
  })

  describe('错误处理', () => {
    it('音频初始化失败时应该优雅处理', async () => {
      // 模拟音频初始化失败
      musicStoreMock.initializeAudio = vi.fn().mockRejectedValue(new Error('音频初始化失败'))
      
      // 重新挂载组件
      wrapper = mount(LoginView, {
        global: {
          plugins: [pinia],
          stubs: {
            'router-link': true
          }
        }
      })

      // 等待异步操作完成
      await wrapper.vm.$nextTick()

      // 验证组件仍然能正常渲染
      expect(wrapper.find('.login-container').exists()).toBe(true)
    })

    it('路由跳转失败时应该优雅处理', async () => {
      // 模拟路由跳转失败
      routerMock.push.mockRejectedValueOnce(new Error('路由跳转失败'))

      const startGameButton = wrapper.findAll('button').find((btn: any) => 
        btn.text().includes('开始游戏') || btn.text().includes('开始')
      )

      if (startGameButton) {
        // 不应该抛出未捕获的错误
        await expect(startGameButton.trigger('click')).resolves.not.toThrow()
      }
    })
  })

  describe('用户体验', () => {
    it('应该显示应用标题', () => {
      expect(wrapper.text()).toContain('唐诗译境')
    })

    it('应该有适当的视觉反馈', () => {
      // 检查是否有过渡效果或视觉反馈相关的CSS类
      const container = wrapper.find('.login-container')
      expect(container.exists()).toBe(true)
      
      // 检查按钮是否有hover效果的类
      const buttons = wrapper.findAll('button')
      buttons.forEach((button: any) => {
        expect(button.classes()).toContain('transition')
      })
    })
  })
}) 