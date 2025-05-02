import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from '@/components/common/BaseCard.vue'

describe('BaseCard', () => {
  it('渲染默认插槽内容', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '<div class="test-content">卡片内容</div>'
      }
    })
    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.find('.test-content').text()).toBe('卡片内容')
  })

  it('渲染头部插槽', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        header: '<div class="test-header">卡片头部</div>',
        default: '卡片内容'
      }
    })
    expect(wrapper.find('.test-header').exists()).toBe(true)
    expect(wrapper.find('.test-header').text()).toBe('卡片头部')
  })

  it('渲染底部插槽', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        footer: '<div class="test-footer">卡片底部</div>',
        default: '卡片内容'
      }
    })
    expect(wrapper.find('.test-footer').exists()).toBe(true)
    expect(wrapper.find('.test-footer').text()).toBe('卡片底部')
  })

  it('设置不同的阴影级别', () => {
    const elevations = ['none', 'sm', 'md', 'lg']
    
    elevations.forEach(elevation => {
      const wrapper = mount(BaseCard, {
        props: { elevation }
      })
      
      if (elevation === 'none') {
        expect(wrapper.classes()).not.toContain('shadow-sm')
        expect(wrapper.classes()).not.toContain('shadow-md')
        expect(wrapper.classes()).not.toContain('shadow-lg')
      } else {
        expect(wrapper.classes()).toContain(`shadow-${elevation}`)
      }
    })
  })

  it('设置边框属性', () => {
    const wrapper = mount(BaseCard, {
      props: {
        bordered: true
      }
    })
    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).toContain('border-gray-200')
  })

  it('没有头部插槽时不渲染头部区域', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '卡片内容'
      }
    })
    // 查找头部区域的容器，应该不存在
    const headerContainer = wrapper.find('.px-4.py-3.border-b.border-gray-200')
    expect(headerContainer.exists()).toBe(false)
  })

  it('没有底部插槽时不渲染底部区域', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '卡片内容'
      }
    })
    // 查找底部区域的容器，应该不存在
    const footerContainer = wrapper.find('.px-4.py-3.bg-gray-50.border-t.border-gray-200')
    expect(footerContainer.exists()).toBe(false)
  })
}) 