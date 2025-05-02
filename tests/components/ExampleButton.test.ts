import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExampleButton from '@/components/common/ExampleButton.vue'

// 这是一个基础组件测试示例
describe('ExampleButton', () => {
  it('渲染按钮文本', () => {
    const wrapper = mount(ExampleButton, {
      props: {
        label: '测试按钮'
      }
    })
    expect(wrapper.text()).toContain('测试按钮')
  })

  it('点击按钮时触发click事件', async () => {
    const wrapper = mount(ExampleButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })

  it('禁用状态下按钮不可点击', async () => {
    const wrapper = mount(ExampleButton, {
      props: {
        disabled: true
      }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
}) 