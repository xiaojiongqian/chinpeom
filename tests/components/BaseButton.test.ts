import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/common/BaseButton.vue'

describe('BaseButton', () => {
  it('渲染默认插槽内容', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: '按钮文本'
      }
    })
    expect(wrapper.text()).toContain('按钮文本')
  })

  it('使用label属性渲染按钮文本', () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: '按钮标签'
      }
    })
    expect(wrapper.text()).toContain('按钮标签')
  })

  it('点击按钮时触发click事件', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })

  it('禁用状态下按钮不可点击', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        disabled: true
      }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('渲染不同的按钮变体样式', () => {
    const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']

    variants.forEach(variant => {
      const wrapper = mount(BaseButton, {
        props: { variant }
      })

      // 检查按钮类名包含对应变体的类
      if (variant === 'primary') {
        expect(wrapper.classes()).toContain('bg-primary')
      } else if (variant === 'secondary') {
        expect(wrapper.classes()).toContain('bg-gray-200')
      } else if (variant === 'success') {
        expect(wrapper.classes()).toContain('bg-green-500')
      }
    })
  })

  it('渲染不同的按钮尺寸', () => {
    const sizes = ['sm', 'md', 'lg']

    sizes.forEach(size => {
      const wrapper = mount(BaseButton, {
        props: { size }
      })

      if (size === 'sm') {
        expect(wrapper.classes()).toContain('text-sm')
      } else if (size === 'md') {
        expect(wrapper.classes()).toContain('text-base')
      } else if (size === 'lg') {
        expect(wrapper.classes()).toContain('text-lg')
      }
    })
  })

  it('宽度100%当block=true', () => {
    const wrapper = mount(BaseButton, {
      props: {
        block: true
      }
    })
    expect(wrapper.classes()).toContain('w-full')
  })

  it('渲染左侧图标', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        'icon-left': '<span class="left-icon">图标</span>',
        default: '按钮'
      }
    })
    expect(wrapper.find('.left-icon').exists()).toBe(true)
    expect(wrapper.find('.left-icon').text()).toBe('图标')
  })

  it('渲染右侧图标', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        'icon-right': '<span class="right-icon">图标</span>',
        default: '按钮'
      }
    })
    expect(wrapper.find('.right-icon').exists()).toBe(true)
    expect(wrapper.find('.right-icon').text()).toBe('图标')
  })
})
