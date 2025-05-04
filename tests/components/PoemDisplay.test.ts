import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PoemDisplay from '@/components/PoemDisplay.vue'
import { usePoemStore } from '@/stores/poem'

// 模拟PoemImage组件
vi.mock('@/components/PoemImage.vue', () => ({
  default: {
    name: 'PoemImage',
    props: ['imagePath', 'poemTitle', 'poemAuthor', 'hasImage'],
    template: '<div data-test="mocked-poem-image" :src="imagePath"></div>'
  }
}))

// 模拟数据
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

const mockTranslation = {
  id: 'poem-1',
  sentence: [
    { senid: 0, content: 'First line' },
    { senid: 1, content: 'Second line' },
    { senid: 2, content: 'Third line' },
    { senid: 3, content: 'Fourth line' }
  ]
}

// 模拟 poemStore
vi.mock('@/stores/poem', () => ({
  usePoemStore: vi.fn(() => ({
    currentPoem: mockPoem,
    currentTranslation: mockTranslation,
    currentSentenceIndex: 1,
    displayContent: [
      '第一句诗',
      'Second line', // 这一句被替换成了外语
      '第三句诗',
      '第四句诗'
    ],
    hasImage: true,
    imagePath: '/resource/poem_images/poem-1.jpg',
    isLoading: false,
    loadError: null,
    initialize: vi.fn(),
    selectRandomPoem: vi.fn()
  }))
}))

describe('PoemDisplay', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该正确渲染诗歌标题和作者', () => {
    const wrapper = mount(PoemDisplay)
    expect(wrapper.find('[data-test="poem-title"]').text()).toBe('测试诗')
    expect(wrapper.find('[data-test="poem-author"]').text()).toBe('测试作者')
  })

  it('应该正确显示诗句，包括替换为外语的句子', () => {
    const wrapper = mount(PoemDisplay)
    const lines = wrapper.findAll('[data-test="poem-line"]')
    expect(lines.length).toBe(4)
    expect(lines[0].text()).toBe('第一句诗')
    expect(lines[1].text()).toBe('Second line')
    expect(lines[2].text()).toBe('第三句诗')
    expect(lines[3].text()).toBe('第四句诗')
  })

  it('应该显示诗歌配图', () => {
    const wrapper = mount(PoemDisplay)
    const imageComponent = wrapper.find('[data-test="mocked-poem-image"]')
    expect(imageComponent.exists()).toBe(true)
    expect(imageComponent.attributes('src')).toBe('/resource/poem_images/poem-1.jpg')
  })

  it('在加载状态下应该显示加载提示', async () => {
    vi.mocked(usePoemStore).mockReturnValueOnce({
      ...usePoemStore(),
      isLoading: true
    })
    const wrapper = mount(PoemDisplay)
    expect(wrapper.find('[data-test="loading-indicator"]').exists()).toBe(true)
  })

  it('应该在加载出错时显示错误信息', async () => {
    vi.mocked(usePoemStore).mockReturnValueOnce({
      ...usePoemStore(),
      loadError: '加载失败'
    })
    const wrapper = mount(PoemDisplay)
    expect(wrapper.find('[data-test="error-message"]').text()).toBe('加载失败')
  })

  it('在挂载组件时应该初始化诗歌数据', () => {
    const initializeMock = vi.fn()
    vi.mocked(usePoemStore).mockReturnValueOnce({
      ...usePoemStore(),
      initialize: initializeMock
    })
    mount(PoemDisplay)
    expect(initializeMock).toHaveBeenCalled()
  })
}) 