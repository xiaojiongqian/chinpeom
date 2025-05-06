import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PoemDisplay from '@/components/PoemDisplay.vue'

// 模拟loadPoemData和preparePoemWithTranslation
vi.mock('@/utils/poemTranslation', () => {
  const mockPoem = {
    id: 'poem-1',
    title: '测试诗',
    author: '测试作者',
    sentence: [
      { senid: 0, content: '第一句诗' },
      { senid: 1, content: '第二句诗' },
      { senid: 2, content: '第三句诗' },
      { senid: 3, content: '第四句诗' }
    ]
  }

  return {
    loadPoemData: vi.fn().mockResolvedValue([mockPoem]),
    preparePoemWithTranslation: vi.fn().mockResolvedValue({
      poem: mockPoem,
      translatedSentence: {
        sentenceId: 1,
        original: '第二句诗',
        translated: 'Second line'
      }
    }),
    LanguageCode: {
      ENGLISH: 'english',
      CHINESE: 'chinese'
    }
  }
})

describe('PoemDisplay', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 清除模拟函数的调用记录
    vi.clearAllMocks()
  })

  it('应该正确渲染诗歌标题和作者', async () => {
    const wrapper = mount(PoemDisplay)
    // 等待异步操作完成
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('h2').text()).toBe('测试诗')
    expect(wrapper.find('p').text()).toBe('测试作者')
  })

  it('应该正确显示诗句，包括替换为外语的句子', async () => {
    const wrapper = mount(PoemDisplay)
    // 等待异步操作完成
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()
    
    const lines = wrapper.findAll('.poem-line')
    expect(lines.length).toBe(4)
    
    expect(lines[0].text()).toBe('第一句诗')
    expect(lines[1].text()).toBe('Second line') // 翻译后的句子
    expect(lines[2].text()).toBe('第三句诗')
    expect(lines[3].text()).toBe('第四句诗')
  })

  it('应该显示诗歌配图', async () => {
    const wrapper = mount(PoemDisplay)
    // 等待异步操作完成
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()
    
    const image = wrapper.find('img')
    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('/resource/poem_images/poem-1.webp')
  })

  it('在加载状态下应该显示加载提示', async () => {
    // 模拟加载状态
    vi.mock('@/utils/poemTranslation', () => ({
      loadPoemData: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000))),
      preparePoemWithTranslation: vi.fn()
    }))
    
    const wrapper = mount(PoemDisplay)
    // 此时组件应处于加载状态
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('应该在加载出错时显示错误信息', async () => {
    // 模拟加载错误
    vi.mock('@/utils/poemTranslation', () => ({
      loadPoemData: vi.fn().mockRejectedValue(new Error('加载失败')),
      preparePoemWithTranslation: vi.fn()
    }))
    
    const wrapper = mount(PoemDisplay)
    // 等待异步操作完成
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()
    
    const errorElement = wrapper.find('.bg-red-100')
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toContain('加载失败')
  })

  it('点击下一首按钮应该加载新的诗歌', async () => {
    const { loadPoemData, preparePoemWithTranslation } = await import('@/utils/poemTranslation')
    
    const wrapper = mount(PoemDisplay)
    // 等待初始加载完成
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()
    
    // 重置模拟函数调用计数
    vi.mocked(loadPoemData).mockClear()
    vi.mocked(preparePoemWithTranslation).mockClear()
    
    // 点击"下一首"按钮
    await wrapper.find('button').trigger('click')
    
    // 验证函数被再次调用
    expect(loadPoemData).toHaveBeenCalledTimes(1)
    expect(preparePoemWithTranslation).toHaveBeenCalledTimes(1)
  })
}) 