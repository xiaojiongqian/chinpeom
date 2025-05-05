import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PoemDisplay from '../../src/components/PoemDisplay.vue'
import * as poemTranslation from '../../src/utils/poemTranslation'

// 模拟诗歌数据
const mockPoem = {
  id: "test-poem-1",
  title: "测试诗",
  author: "测试作者",
  sentence: [
    { senid: 0, content: "第一句中文" },
    { senid: 1, content: "第二句中文" },
    { senid: 2, content: "第三句中文" },
    { senid: 3, content: "第四句中文" }
  ]
}

// 模拟翻译数据
const mockTranslationResult = {
  poem: mockPoem,
  translatedSentence: {
    sentenceId: 2,
    original: "第三句中文",
    translated: "Third sentence in English"
  }
}

describe('PoemDisplay组件', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    
    // 模拟loadPoemData函数
    vi.spyOn(poemTranslation, 'loadPoemData').mockResolvedValue([mockPoem])
    
    // 模拟preparePoemWithTranslation函数
    vi.spyOn(poemTranslation, 'preparePoemWithTranslation').mockResolvedValue(mockTranslationResult)
  })
  
  it('应该显示加载状态', async () => {
    const wrapper = mount(PoemDisplay)
    
    // 组件初始应该显示加载中
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    
    // 等待异步操作完成
    await flushPromises()
    
    // 加载完成后应该不再显示加载中
    expect(wrapper.find('.animate-spin').exists()).toBe(false)
  })
  
  it('应该正确显示诗歌内容', async () => {
    const wrapper = mount(PoemDisplay)
    
    // 等待异步操作完成
    await flushPromises()
    
    // 检查标题和作者
    expect(wrapper.text()).toContain('测试诗')
    expect(wrapper.text()).toContain('测试作者')
    
    // 检查诗句内容
    const poemLines = wrapper.findAll('.poem-line')
    expect(poemLines.length).toBe(4)
    
    // 检查翻译的句子
    expect(poemLines[2].text()).toContain('Third sentence in English')
    expect(poemLines[2].classes()).toContain('text-blue-600')
    
    // 检查非翻译的句子
    expect(poemLines[0].text()).toContain('第一句中文')
    expect(poemLines[0].classes()).toContain('text-gray-800')
  })
  
  it('应该能切换到下一首诗', async () => {
    const wrapper = mount(PoemDisplay)
    
    // 等待初始异步操作完成
    await flushPromises()
    
    // 重置模拟以便准确计数
    vi.spyOn(poemTranslation, 'loadPoemData').mockResolvedValue([mockPoem])
    vi.spyOn(poemTranslation, 'preparePoemWithTranslation').mockResolvedValue(mockTranslationResult)
    
    // 点击下一首按钮
    await wrapper.find('button.bg-blue-500').trigger('click')
    
    // 应该再次调用加载诗歌的函数
    expect(poemTranslation.loadPoemData).toHaveBeenCalledTimes(1)
    expect(poemTranslation.preparePoemWithTranslation).toHaveBeenCalledTimes(1)
  })
  
  it('应该使用传入的目标语言', async () => {
    const wrapper = mount(PoemDisplay, {
      props: {
        targetLanguage: 'spanish'
      }
    })
    
    // 等待异步操作完成
    await flushPromises()
    
    // 应该使用西班牙语作为目标语言
    expect(poemTranslation.preparePoemWithTranslation).toHaveBeenCalledWith(
      expect.anything(),
      'spanish'
    )
  })
  
  it('应该显示错误信息', async () => {
    // 模拟loadPoemData抛出错误
    vi.spyOn(poemTranslation, 'loadPoemData').mockRejectedValueOnce(new Error('测试错误'))
    
    const wrapper = mount(PoemDisplay)
    
    // 等待异步操作完成
    await flushPromises()
    
    // 应该显示错误信息
    expect(wrapper.find('.bg-red-100').exists()).toBe(true)
    expect(wrapper.text()).toContain('测试错误')
    
    // 错误状态下应该有一个重试按钮
    const retryButton = wrapper.find('.bg-red-500')
    expect(retryButton.exists()).toBe(true)
    
    // 重置模拟以便重试可以成功
    vi.spyOn(poemTranslation, 'loadPoemData').mockResolvedValueOnce([mockPoem])
    
    // 点击重试按钮
    await retryButton.trigger('click')
    
    // 应该再次尝试加载
    expect(poemTranslation.loadPoemData).toHaveBeenCalledTimes(1)
  })
}) 