import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PoemImage from '@/components/PoemImage.vue'

// 模拟vue中的ref和computed
vi.mock('vue', () => ({
  ref: vi.fn((val) => ({ value: val })),
  computed: vi.fn((fn) => fn()),
}))

describe('PoemImage', () => {
  it('当hasImage为false时不应该渲染', () => {
    const wrapper = mount(PoemImage, {
      props: {
        imagePath: '/path/to/image.jpg',
        hasImage: false,
        poemTitle: '测试诗',
        poemAuthor: '测试作者'
      }
    })
    
    expect(wrapper.html()).toBe('')
  })
  
  it('当hasImage为true时应该渲染组件', () => {
    const wrapper = mount(PoemImage, {
      props: {
        imagePath: '/path/to/image.jpg',
        hasImage: true,
        poemTitle: '测试诗',
        poemAuthor: '测试作者'
      }
    })
    
    // 检查组件是否渲染
    expect(wrapper.find('.poem-image-component').exists()).toBe(true)
    
    // 检查容器是否渲染
    expect(wrapper.find('.image-container').exists()).toBe(true)
  })
  
  it('应该正确设置图片属性', () => {
    const wrapper = mount(PoemImage, {
      props: {
        imagePath: '/path/to/image.jpg',
        hasImage: true,
        poemTitle: '测试诗',
        poemAuthor: '测试作者'
      }
    })
    
    // 测试img元素属性
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/path/to/image.jpg')
    expect(img.attributes('alt')).toBe('测试诗（测试作者）配图')
  })
  
  it('应该显示加载状态', () => {
    const wrapper = mount(PoemImage, {
      props: {
        imagePath: '/path/to/image.jpg',
        hasImage: true
      }
    })
    
    // 默认状态下应该显示加载中
    expect(wrapper.find('[data-test="image-loading"]').exists()).toBe(true)
  })
}) 