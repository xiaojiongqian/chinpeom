import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

// 模拟所有依赖的stores
vi.mock('../../src/stores/user', () => ({
  useUserStore: vi.fn()
}))

vi.mock('../../src/stores/poem', () => ({
  usePoemStore: vi.fn()
}))

vi.mock('../../src/stores/music', () => ({
  useMusicStore: vi.fn()
}))

// 模拟认证API
vi.mock('../../src/services/authApi', () => ({
  default: {
    logout: vi.fn().mockResolvedValue(undefined)
  }
}))

// 动态导入组件
const { default: SettingsView } = await import('../../src/views/SettingsView.vue')
const { useUserStore } = await import('../../src/stores/user')
const { usePoemStore } = await import('../../src/stores/poem')
const { useMusicStore } = await import('../../src/stores/music')

// 模拟路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/settings', component: SettingsView },
    { path: '/quizview', component: { template: '<div>Quiz</div>' } }
  ]
})

describe('SettingsView 测试', () => {
  let wrapper: any
  let userStoreMock: any
  let poemStoreMock: any
  let musicStoreMock: any

  beforeEach(async () => {
    // 创建store模拟对象
    userStoreMock = {
      setLanguage: vi.fn(),
      username: '测试用户',
      logout: vi.fn(),
      isLoggedIn: true,
      language: 'english',
      settings: {
        language: 'english'
      }
    }

    poemStoreMock = {
      setDisplayLanguage: vi.fn().mockResolvedValue(undefined),
      setDifficulty: vi.fn(),
      currentDifficulty: 'easy'
    }

    musicStoreMock = {
      toggleMute: vi.fn(),
      isMuted: false
    }

    // 设置模拟返回值
    ;(useUserStore as any).mockReturnValue(userStoreMock)
    ;(usePoemStore as any).mockReturnValue(poemStoreMock)
    ;(useMusicStore as any).mockReturnValue(musicStoreMock)

    // 创建新的 Pinia 实例
    const pinia = createPinia()
    setActivePinia(pinia)

    // 挂载组件
    wrapper = mount(SettingsView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    await router.push('/settings')
  })

  describe('语言选择功能', () => {
    it('应该显示所有语言选择选项（包括中文）', () => {
      // 语言选择应该始终显示
      expect(wrapper.find('[data-testid="language-settings"]').exists()).toBe(true)
      
      // 检查是否有语言选项（包括中文）
      const languageOptions = wrapper.findAll('[data-testid^="language-"]')
      expect(languageOptions.length).toBeGreaterThanOrEqual(6) // 至少有6种语言（包括中文）
      
      // 检查中文选项存在
      const chineseOption = wrapper.find('[data-testid="language-chinese"]')
      expect(chineseOption.exists()).toBe(true)
      expect(chineseOption.text()).toContain('中文（仅困难模式）')
    })

    it('选择中文模式应该自动切换到困难模式', async () => {
      // 先确保在简单模式
      const easyDifficultyButton = wrapper.find('[data-testid="difficulty-easy"]')
      await easyDifficultyButton.trigger('click')

      // 重置模拟函数
      vi.clearAllMocks()

      // 点击中文选项
      const chineseOption = wrapper.find('[data-testid="language-chinese"]')
      if (chineseOption.exists()) {
        await chineseOption.trigger('click')

        // 验证自动切换到困难模式
        expect(poemStoreMock.setDifficulty).toHaveBeenCalledWith('hard')
        
        // 验证用户语言设置被调用
        expect(userStoreMock.setLanguage).toHaveBeenCalledWith('chinese')
      }
    })

    it('中文模式下简单模式应该置灰不可选', async () => {
      // 模拟中文模式
      userStoreMock.language = 'chinese'
      wrapper.vm.currentLanguage = 'chinese'

      await wrapper.vm.$nextTick()

      // 检查简单模式是否被置灰
      const easyDifficultyButton = wrapper.find('[data-testid="difficulty-easy"]')
      expect(easyDifficultyButton.classes()).toContain('cursor-not-allowed')
      expect(easyDifficultyButton.classes()).toContain('bg-gray-100')
      
      // 检查是否显示不可用提示
      expect(easyDifficultyButton.text()).toContain('中文模式不可用')
    })

    it('中文模式下点击简单模式应该无效', async () => {
      // 模拟中文模式
      userStoreMock.language = 'chinese'
      wrapper.vm.currentLanguage = 'chinese'

      await wrapper.vm.$nextTick()

      // 重置模拟函数
      vi.clearAllMocks()

      // 尝试点击简单模式
      const easyDifficultyButton = wrapper.find('[data-testid="difficulty-easy"]')
      await easyDifficultyButton.trigger('click')

      // 验证难度设置函数不应该被调用
      expect(poemStoreMock.setDifficulty).not.toHaveBeenCalledWith('easy')
    })

    it('非中文语言模式下应该可以选择简单模式', async () => {
      // 确保是英语模式
      userStoreMock.language = 'english'
      wrapper.vm.currentLanguage = 'english'

      await wrapper.vm.$nextTick()

      // 检查简单模式是否可以选择
      const easyDifficultyButton = wrapper.find('[data-testid="difficulty-easy"]')
      expect(easyDifficultyButton.classes()).toContain('cursor-pointer')
      expect(easyDifficultyButton.classes()).not.toContain('cursor-not-allowed')
      
      // 重置模拟函数
      vi.clearAllMocks()

      // 点击简单模式应该生效
      await easyDifficultyButton.trigger('click')
      expect(poemStoreMock.setDifficulty).toHaveBeenCalledWith('easy')
    })
  })

  describe('难度设置功能', () => {
    it('困难模式下语言选择应该仍然可用', async () => {
      // 切换到困难模式
      poemStoreMock.currentDifficulty = 'hard'
      wrapper.vm.difficulty = 'hard'

      await wrapper.vm.$nextTick()

      // 语言选择应该仍然存在且可用
      expect(wrapper.find('[data-testid="language-settings"]').exists()).toBe(true)
      
      // 语言选择应该始终可用，不应该被禁用
      const languageOptions = wrapper.findAll('[data-testid^="language-"]')
      languageOptions.forEach((option: any) => {
        expect(option.classes()).toContain('cursor-pointer')
        expect(option.classes()).not.toContain('cursor-not-allowed')
      })
    })

    it('切换到简单模式时应该同步语言设置（非中文模式）', async () => {
      // 确保不是中文模式
      userStoreMock.language = 'english'
      wrapper.vm.currentLanguage = 'english'

      // 先切换到困难模式
      const hardDifficultyButton = wrapper.find('[data-testid="difficulty-hard"]')
      await hardDifficultyButton.trigger('click')

      // 重置模拟函数
      vi.clearAllMocks()

      // 切换回简单模式
      const easyDifficultyButton = wrapper.find('[data-testid="difficulty-easy"]')
      await easyDifficultyButton.trigger('click')

      // 验证语言设置被同步（对于非中文语言）
      expect(poemStoreMock.setDisplayLanguage).toHaveBeenCalledWith('english')
    })
  })

  describe('音乐设置功能', () => {
    it('应该能够切换音乐开关', async () => {
      // 查找音乐开关按钮
      const musicToggle = wrapper.find('button[class*="bg-success-500"], button[class*="bg-gray-300"]')
      if (musicToggle.exists()) {
        await musicToggle.trigger('click')
        expect(musicStoreMock.toggleMute).toHaveBeenCalled()
      }
    })
  })

  describe('错误处理', () => {
    it('语言切换失败时应该处理错误', async () => {
      // 模拟语言切换失败
      poemStoreMock.setDisplayLanguage = vi.fn().mockRejectedValue(new Error('网络错误'))
      
      // 创建控制台错误的spy
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // 点击语言选项
      const germanOption = wrapper.find('[data-testid="language-german"]')
      if (germanOption.exists()) {
        await germanOption.trigger('click')

        // 验证错误被正确处理
        expect(consoleSpy).toHaveBeenCalledWith('切换语言失败:', expect.any(Error))
      }
      
      // 清理spy
      consoleSpy.mockRestore()
    })
  })

  describe('退出登录功能', () => {
    it('应该显示退出登录按钮', () => {
      const logoutButtons = wrapper.findAll('button')
      const logoutButton = logoutButtons.find((btn: any) => btn.text().includes('退出登录'))
      expect(logoutButton).toBeDefined()
    })

    it('点击退出登录应该显示确认弹框', async () => {
      const logoutButtons = wrapper.findAll('button')
      const logoutButton = logoutButtons.find((btn: any) => btn.text().includes('退出登录'))
      
      if (logoutButton) {
        await logoutButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        // 检查确认弹框是否显示
        expect(wrapper.text()).toContain('确认退出')
        expect(wrapper.text()).toContain('您确定要退出登录吗？')
      }
    })
  })
}) 