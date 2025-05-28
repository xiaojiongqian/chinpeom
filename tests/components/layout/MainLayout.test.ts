import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MainLayout from '@/components/layout/MainLayout.vue'

// 需要模拟子组件
vi.mock('@/components/layout/AppHeader.vue', () => ({
  default: {
    name: 'AppHeader',
    template: '<div class="mocked-header"><slot /></div>',
    props: ['title', 'navItems']
  }
}))

vi.mock('@/components/layout/AppFooter.vue', () => ({
  default: {
    name: 'AppFooter',
    template: '<div class="mocked-footer"><slot /></div>',
    props: ['copyright', 'links']
  }
}))

describe('MainLayout', () => {
  const defaultProps = {
    title: '诗歌学习',
    navItems: [
      { name: '首页', path: '/', active: true },
      { name: '学习', path: '/learn', active: false }
    ],
    copyright: '© 2023 唐诗译境',
    footerLinks: [
      { name: '关于我们', url: '/about' },
      { name: '联系方式', url: '/contact' }
    ]
  }

  it('渲染头部、主体和底部区域', () => {
    const wrapper = mount(MainLayout, {
      props: defaultProps,
      slots: {
        default: '<div class="test-content">内容区域</div>'
      }
    })

    // 检查结构
    expect(wrapper.find('.mocked-header').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('.mocked-footer').exists()).toBe(true)

    // 检查内容
    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.find('.test-content').text()).toBe('内容区域')
  })

  it('传递正确的props给子组件', () => {
    const wrapper = mount(MainLayout, {
      props: defaultProps
    })

    // 检查传递给AppHeader的props
    const headerProps = wrapper.findComponent({ name: 'AppHeader' }).props()
    expect(headerProps.title).toBe('诗歌学习')
    expect(headerProps.navItems).toEqual([
      { name: '首页', path: '/', active: true },
      { name: '学习', path: '/learn', active: false }
    ])

    // 检查传递给AppFooter的props
    const footerProps = wrapper.findComponent({ name: 'AppFooter' }).props()
    expect(footerProps.copyright).toBe('© 2023 唐诗译境')
    expect(footerProps.links).toEqual([
      { name: '关于我们', url: '/about' },
      { name: '联系方式', url: '/contact' }
    ])
  })

  it('主内容区域具有正确的布局样式', () => {
    const wrapper = mount(MainLayout, {
      props: defaultProps
    })

    const main = wrapper.find('main')
    expect(main.classes()).toContain('container')
    expect(main.classes()).toContain('mx-auto')
    expect(main.classes()).toContain('flex-grow')
  })
})
