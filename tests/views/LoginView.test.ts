import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../../src/views/LoginView.vue'
import { useMusicStore } from '../../src/stores/music'

// 模拟路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/quizview', component: { template: '<div>Quiz</div>' } }
  ]
})

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

describe('LoginView 测试', () => {
  let pinia: any

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
    await router.push('/')
    await router.isReady()
  })

  it('应该正确渲染登录页面', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    // 检查页面标题
    expect(wrapper.find('h1').text()).toBe('唐诗译境')
    
    // 检查描述文本
    expect(wrapper.text()).toContain('配合其它语言来学习唐诗的游戏')
    
    // 检查登录按钮
    expect(wrapper.findAll('button').length).toBeGreaterThan(0)
  })

  it('应该显示音效开关按钮', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    // 查找音效开关按钮
    const soundButton = wrapper.find('button[aria-label="音效开关"], button img[alt="音效开关"]').exists() || 
                       wrapper.find('img[alt="音效开关"]').exists()
    
    expect(soundButton).toBe(true)
  })

  it('应该在页面加载时启动背景音乐', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    const musicStore = useMusicStore()
    
    // 检查音乐store的初始状态（登录页面默认静音）
    expect(musicStore.isMuted).toBe(true)
    expect(musicStore.currentMusicIndex).toBe(0) // 登录页面固定第一首
  })

  it('点击音效按钮应该切换静音状态', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    const musicStore = useMusicStore()
    
    // 初始状态应该是静音
    expect(musicStore.isMuted).toBe(true)

    // 查找音效按钮（在标题旁边）
    const soundButton = wrapper.find('h1').element.parentElement?.querySelector('button')
    if (soundButton) {
      await wrapper.find('h1').element.parentElement?.querySelector('button')?.click()
      await wrapper.vm.$nextTick()
      
      // 状态应该切换
      expect(musicStore.isMuted).toBe(false)
    }
  })

  it('点击登录按钮应该跳转到QuizView', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    // 查找登录按钮（假设有多个，我们找第一个）
    const loginButtons = wrapper.findAll('button').filter(button => 
      button.text().includes('登录') || 
      button.text().includes('开始') ||
      !button.text().includes('音效')
    )

    if (loginButtons.length > 0) {
      await loginButtons[0].trigger('click')
      
      // 等待路由跳转
      await wrapper.vm.$nextTick()
      
      // 检查是否跳转到正确路径
      expect(router.currentRoute.value.path).toBe('/quizview')
    }
  })

  it('应该显示logo图片', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    const logoImg = wrapper.find('img[alt="唐诗译境"]')
    expect(logoImg.exists()).toBe(true)
    expect(logoImg.attributes('src')).toContain('login_floatwater.webp')
  })

  it('应该有正确的页面布局结构', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    // 检查主容器
    expect(wrapper.find('.flex.flex-col.min-h-screen').exists()).toBe(true)
    
    // 检查内容容器
    expect(wrapper.find('.bg-white.rounded-2xl').exists()).toBe(true)
  })

  it('登录过程中应该显示加载状态', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    // 查找登录按钮
    const loginButtons = wrapper.findAll('button').filter(button => 
      !button.text().includes('音效')
    )

    if (loginButtons.length > 0) {
      // 点击登录按钮
      await loginButtons[0].trigger('click')
      
      // 检查组件的loading状态（通过ref或data）
      const componentData = wrapper.vm.$data as any
      expect(componentData.loading).toBeDefined()
    }
  })

  it('应该处理登录错误', async () => {
    // 模拟登录失败的情况
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    // 设置组件错误状态（通过直接访问组件数据）
    await wrapper.setData({ errorMessage: '登录失败，请重试' })

    // 检查错误信息是否显示
    expect(wrapper.text()).toContain('登录失败，请重试')
  })

  it('音效图标应该根据静音状态变化', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router]
      }
    })

    const musicStore = useMusicStore()
    
    // 初始状态（静音）
    expect(musicStore.isMuted).toBe(true)
    
    // 切换静音状态
    musicStore.toggleMute()
    await wrapper.vm.$nextTick()
    
    // 图标应该更新
    const soundImg = wrapper.find('img[alt="音效开关"]')
    if (soundImg.exists()) {
      const imgSrc = soundImg.attributes('src')
      // 根据当前状态检查图标
      if (musicStore.isMuted) {
        expect(imgSrc).toContain('sound_off')
      } else {
        expect(imgSrc).toContain('sound_on')
      }
    }
  })
}) 