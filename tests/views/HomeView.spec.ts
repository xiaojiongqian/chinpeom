import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomeView from '../../src/views/HomeView.vue'
import PoemDisplay from '../../src/components/PoemDisplay.vue'
import { LanguageCode } from '../../src/utils/poemTranslation'

// 模拟PoemDisplay组件
vi.mock('../../src/components/PoemDisplay.vue', () => ({
  default: {
    name: 'PoemDisplay',
    props: {
      targetLanguage: String
    },
    template: '<div data-testid="poem-display">PoemDisplay组件 语言: {{ targetLanguage }}</div>'
  }
}))

describe('HomeView组件', () => {
  it('应该渲染诗歌展示组件', async () => {
    const wrapper = mount(HomeView)
    
    expect(wrapper.findComponent(PoemDisplay).exists()).toBe(true)
  })
  
  it('应该默认使用英语作为语言', async () => {
    const wrapper = mount(HomeView)
    
    const poemDisplay = wrapper.findComponent(PoemDisplay)
    expect(poemDisplay.props('targetLanguage')).toBe('english')
  })
  
  it('应该能切换显示语言', async () => {
    const wrapper = mount(HomeView)
    
    // 找到所有语言按钮
    const buttons = wrapper.findAll('button')
    
    // 点击西班牙语按钮
    await buttons[1].trigger('click')
    
    // 检查PoemDisplay组件是否接收到更新后的语言
    const poemDisplay = wrapper.findComponent(PoemDisplay)
    expect(poemDisplay.props('targetLanguage')).toBe('spanish')
    
    // 检查按钮样式是否更新
    expect(buttons[0].classes()).not.toContain('bg-blue-500')
    expect(buttons[1].classes()).toContain('bg-blue-500')
  })
  
  it('应该显示所有可用语言选项', async () => {
    const wrapper = mount(HomeView)
    
    // 检查所有语言按钮是否存在
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(5) // 英语、西班牙语、法语、德语、日语
    
    // 检查按钮文本
    expect(buttons[0].text()).toBe('英语')
    expect(buttons[1].text()).toBe('西班牙语')
    expect(buttons[2].text()).toBe('法语')
    expect(buttons[3].text()).toBe('德语')
    expect(buttons[4].text()).toBe('日语')
  })
}) 