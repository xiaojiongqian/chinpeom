import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import SettingsView from '@/views/SettingsView.vue'
import { useUserStore } from '@/stores/user'
import { usePoemStore } from '@/stores/poem'
import { useMusicStore } from '@/stores/music'

// 模拟路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/settings', component: SettingsView },
    { path: '/quizview', component: { template: '<div>Quiz</div>' } }
  ]
})

describe('SettingsView 语言切换测试', () => {
  let wrapper: any
  let userStore: any
  let poemStore: any
  let musicStore: any

  beforeEach(async () => {
    // 创建新的 Pinia 实例
    const pinia = createPinia()
    setActivePinia(pinia)

    // 初始化 stores
    userStore = useUserStore()
    poemStore = usePoemStore()
    musicStore = useMusicStore()

    // 模拟 poemStore 方法
    poemStore.setDisplayLanguage = vi.fn().mockResolvedValue(undefined)
    poemStore.setDifficulty = vi.fn()
    poemStore.currentDifficulty = 'easy'

    // 模拟 userStore 方法
    userStore.setLanguage = vi.fn()
    userStore.language = 'english'
    userStore.username = '测试用户'
    userStore.logout = vi.fn()

    // 模拟 musicStore 方法
    musicStore.toggleMute = vi.fn()
    musicStore.isMuted = false

    // 挂载组件
    wrapper = mount(SettingsView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    await router.isReady()
  })

  it('应该显示语言选择选项（始终显示）', () => {
    // 语言选择应该始终显示
    expect(wrapper.find('[data-testid="language-settings"]').exists()).toBe(true)
    
    // 检查是否有语言选项
    const languageOptions = wrapper.findAll('[data-testid^="language-"]')
    expect(languageOptions.length).toBeGreaterThanOrEqual(5) // 至少有5种语言
  })

  it('应该在困难模式下禁用语言选择而不是隐藏', async () => {
    // 切换到困难模式
    const hardDifficultyButton = wrapper.find('[data-testid="difficulty-hard"]')
    await hardDifficultyButton.trigger('click')

    // 语言选择应该仍然存在
    expect(wrapper.find('[data-testid="language-settings"]').exists()).toBe(true)
    
    // 但应该显示禁用状态的提示
    expect(wrapper.text()).toContain('困难模式下禁用')
  })

  it('点击语言选项应该在简单模式下生效', async () => {
    // 确保在简单模式
    const easyDifficultyButton = wrapper.find('[data-testid="difficulty-easy"]')
    await easyDifficultyButton.trigger('click')

    // 重置模拟函数
    vi.clearAllMocks()

    // 点击法语选项
    const frenchOption = wrapper.find('[data-testid="language-french"]')
    if (frenchOption.exists()) {
      await frenchOption.trigger('click')

      // 验证用户存储的语言设置被调用
      expect(userStore.setLanguage).toHaveBeenCalledWith('french')
      
      // 验证诗歌存储的语言设置被调用
      expect(poemStore.setDisplayLanguage).toHaveBeenCalledWith('french')
    }
  })

  it('在困难模式下点击语言选项应该无效', async () => {
    // 切换到困难模式
    const hardDifficultyButton = wrapper.find('[data-testid="difficulty-hard"]')
    await hardDifficultyButton.trigger('click')

    // 重置模拟函数
    vi.clearAllMocks()

    // 尝试点击语言选项
    const languageOptions = wrapper.findAll('[data-testid^="language-"]')
    if (languageOptions.length > 0) {
      await languageOptions[0].trigger('click')

      // 验证语言设置函数不应该被调用
      expect(userStore.setLanguage).not.toHaveBeenCalled()
      expect(poemStore.setDisplayLanguage).not.toHaveBeenCalled()
    }
  })

  it('切换到简单模式时应该同步语言设置', async () => {
    // 先切换到困难模式
    const hardDifficultyButton = wrapper.find('[data-testid="difficulty-hard"]')
    await hardDifficultyButton.trigger('click')

    // 重置模拟函数
    vi.clearAllMocks()

    // 切换回简单模式
    const easyDifficultyButton = wrapper.find('[data-testid="difficulty-easy"]')
    await easyDifficultyButton.trigger('click')

    // 验证语言设置被同步
    expect(poemStore.setDisplayLanguage).toHaveBeenCalledWith('english')
  })

  it('应该正确显示当前选中的语言', () => {
    // 设置当前语言为法语
    userStore.language = 'french'
    
    // 重新挂载组件以反映变化
    wrapper = mount(SettingsView, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      }
    })

    // 法语选项应该显示为选中状态
    const frenchOption = wrapper.find('[data-testid="language-french"]')
    expect(frenchOption.classes()).toContain('bg-success-50')
  })

  it('语言切换失败时应该处理错误', async () => {
    // 模拟语言切换失败
    poemStore.setDisplayLanguage = vi.fn().mockRejectedValue(new Error('网络错误'))
    
    // 创建控制台错误的spy
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 点击语言选项
    const germanOption = wrapper.find('[data-testid="language-german"]')
    await germanOption.trigger('click')

    // 验证错误被正确处理
    expect(consoleSpy).toHaveBeenCalledWith('切换语言失败:', expect.any(Error))
    
    // 清理spy
    consoleSpy.mockRestore()
  })
}) 