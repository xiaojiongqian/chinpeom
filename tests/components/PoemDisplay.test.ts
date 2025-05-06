import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PoemDisplay from '@/components/PoemDisplay.vue'

console.log('[PoemDisplay.test] 开始加载测试文件');

// 模拟loadPoemData和preparePoemWithTranslation
vi.mock('@/utils/poemTranslation', () => {
  console.log('[PoemDisplay.test] 模拟poemTranslation模块');
  
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
    loadPoemData: vi.fn().mockImplementation(() => {
      console.log('[PoemDisplay.test] 调用模拟的loadPoemData');
      return Promise.resolve([mockPoem]);
    }),
    preparePoemWithTranslation: vi.fn().mockImplementation(() => {
      console.log('[PoemDisplay.test] 调用模拟的preparePoemWithTranslation');
      return Promise.resolve({
        poem: mockPoem,
        translatedSentence: {
          sentenceId: 1,
          original: '第二句诗',
          translated: 'Second line'
        }
      });
    }),
    LanguageCode: {
      ENGLISH: 'english',
      CHINESE: 'chinese'
    }
  }
})

// 模拟getPoemImageUrl
vi.mock('@/utils/api', () => ({
  getPoemImageUrl: vi.fn().mockImplementation((id) => {
    console.log(`[PoemDisplay.test] 模拟获取诗歌图片URL: ${id}`);
    return `/resource/poem_images/${id}.webp`;
  })
}))

describe('PoemDisplay', () => {
  beforeEach(() => {
    console.log('[PoemDisplay.test] 设置测试环境');
    setActivePinia(createPinia())
    // 清除模拟函数的调用记录
    vi.clearAllMocks()
    console.log('[PoemDisplay.test] 模拟函数记录已清除');
  })

  it('应该正确渲染诗歌标题和作者', async () => {
    console.log('[PoemDisplay.test] 开始测试: 应该正确渲染诗歌标题和作者');
    const wrapper = mount(PoemDisplay)
    console.log('[PoemDisplay.test] 组件已挂载');
    
    // 等待异步操作完成
    await flushPromises()
    await wrapper.vm.$nextTick()
    console.log('[PoemDisplay.test] 异步操作完成');
    
    expect(wrapper.find('h2').text()).toBe('测试诗')
    expect(wrapper.find('p').text()).toBe('测试作者')
  })

  it('应该正确显示诗句，包括替换为外语的句子', async () => {
    console.log('[PoemDisplay.test] 开始测试: 应该正确显示诗句，包括替换为外语的句子');
    const wrapper = mount(PoemDisplay)
    
    // 等待异步操作完成
    await flushPromises()
    await wrapper.vm.$nextTick()
    
    const lines = wrapper.findAll('.poem-line')
    expect(lines.length).toBe(4)
    
    expect(lines[0].text()).toBe('第一句诗')
    expect(lines[1].text()).toBe('Second line') // 翻译后的句子
    expect(lines[2].text()).toBe('第三句诗')
    expect(lines[3].text()).toBe('第四句诗')
  })

  it('应该显示诗歌配图', async () => {
    console.log('[PoemDisplay.test] 开始测试: 应该显示诗歌配图');
    const wrapper = mount(PoemDisplay)
    
    // 等待异步操作完成
    await flushPromises()
    await wrapper.vm.$nextTick()
    
    const image = wrapper.find('img')
    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('/resource/poem_images/poem-1.webp')
  })

  it('在加载状态下应该显示加载提示', async () => {
    console.log('[PoemDisplay.test] 开始测试: 在加载状态下应该显示加载提示');
    
    // 捕获当前模拟实现的引用
    let originalMockImplementation;
    
    try {
      // 临时重写模拟实现
      const { loadPoemData } = await import('@/utils/poemTranslation');
      originalMockImplementation = vi.mocked(loadPoemData).getMockImplementation();
      
      vi.mocked(loadPoemData).mockImplementationOnce(() => {
        console.log('[PoemDisplay.test] 模拟延迟加载 (100ms)');
        return new Promise(resolve => {
          setTimeout(() => {
            console.log('[PoemDisplay.test] 延迟加载完成');
            resolve([]);
          }, 100);
        });
      });
    } catch (mockError) {
      console.error('[PoemDisplay.test] 模拟实现修改失败:', mockError);
      throw mockError;
    }
    
    let wrapper;
    try {
      console.log('[PoemDisplay.test] 开始挂载组件 (应处于加载状态)');
      wrapper = mount(PoemDisplay);
      console.log('[PoemDisplay.test] 组件已挂载, isLoading状态:', wrapper.vm.isLoading);
    } catch (mountError) {
      console.error('[PoemDisplay.test] 组件挂载失败:', mountError);
      throw mountError;
    }
    
    // 此时组件应处于加载状态
    try {
      console.log('[PoemDisplay.test] 检查加载指示器');
      const spinner = wrapper.find('.animate-spin');
      console.log(`[PoemDisplay.test] 加载指示器存在: ${spinner.exists()}`);
      
      expect(spinner.exists()).toBe(true);
    } catch (assertError) {
      console.error('[PoemDisplay.test] 断言失败:', assertError);
      console.error('[PoemDisplay.test] 当前组件HTML:', wrapper.html());
      throw assertError;
    }
    
    // 恢复原始模拟实现
    if (originalMockImplementation) {
      const { loadPoemData } = await import('@/utils/poemTranslation');
      vi.mocked(loadPoemData).mockImplementation(originalMockImplementation);
      console.log('[PoemDisplay.test] 已恢复原始模拟实现');
    }
  })

  it('应该在加载出错时显示错误信息', async () => {
    console.log('[PoemDisplay.test] 开始测试: 应该在加载出错时显示错误信息');
    
    let originalMockImplementation;
    const errorMessage = '加载失败';
    
    try {
      // 临时重写模拟实现
      const { loadPoemData } = await import('@/utils/poemTranslation');
      originalMockImplementation = vi.mocked(loadPoemData).getMockImplementation();
      
      vi.mocked(loadPoemData).mockRejectedValueOnce(new Error(errorMessage));
      console.log(`[PoemDisplay.test] 设置模拟实现为拒绝Promise, 错误信息: ${errorMessage}`);
    } catch (mockError) {
      console.error('[PoemDisplay.test] 模拟实现修改失败:', mockError);
      throw mockError;
    }
    
    let wrapper;
    try {
      console.log('[PoemDisplay.test] 开始挂载组件');
      wrapper = mount(PoemDisplay);
      console.log('[PoemDisplay.test] 组件已挂载, 当前isLoading状态:', wrapper.vm.isLoading);
    } catch (mountError) {
      console.error('[PoemDisplay.test] 组件挂载失败:', mountError);
      throw mountError;
    }
    
    // 等待异步操作完成
    try {
      console.log('[PoemDisplay.test] 等待异步操作完成 (应该触发错误)');
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      console.log('[PoemDisplay.test] 异步操作完成, 当前组件状态:', {
        isLoading: wrapper.vm.isLoading,
        error: wrapper.vm.error,
        hasErrorMessage: !!wrapper.vm.error
      });
    } catch (asyncError) {
      console.error('[PoemDisplay.test] 等待异步操作失败:', asyncError);
      throw asyncError;
    }
    
    try {
      console.log('[PoemDisplay.test] 检查错误信息元素');
      const errorElement = wrapper.find('.bg-red-100');
      
      console.log(`[PoemDisplay.test] 错误元素存在: ${errorElement.exists()}`);
      if (errorElement.exists()) {
        console.log(`[PoemDisplay.test] 错误文本: "${errorElement.text()}"`);
      }
      
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toContain(errorMessage);
    } catch (assertError) {
      console.error('[PoemDisplay.test] 断言失败:', assertError);
      console.error('[PoemDisplay.test] 当前组件HTML:', wrapper.html());
      throw assertError;
    }
    
    // 恢复原始模拟实现
    if (originalMockImplementation) {
      const { loadPoemData } = await import('@/utils/poemTranslation');
      vi.mocked(loadPoemData).mockImplementation(originalMockImplementation);
      console.log('[PoemDisplay.test] 已恢复原始模拟实现');
    }
  })

  it('点击下一首按钮应该加载新的诗歌', async () => {
    console.log('[PoemDisplay.test] 开始测试: 点击下一首按钮应该加载新的诗歌');
    const { loadPoemData, preparePoemWithTranslation } = await import('@/utils/poemTranslation')
    
    const wrapper = mount(PoemDisplay)
    // 等待初始加载完成
    await flushPromises()
    await wrapper.vm.$nextTick()
    
    // 重置模拟函数调用计数
    vi.mocked(loadPoemData).mockClear()
    vi.mocked(preparePoemWithTranslation).mockClear()
    
    console.log('[PoemDisplay.test] 点击"下一首"按钮');
    // 点击"下一首"按钮
    await wrapper.find('button').trigger('click')
    
    // 验证函数被再次调用
    expect(loadPoemData).toHaveBeenCalledTimes(1)
    expect(preparePoemWithTranslation).toHaveBeenCalledTimes(1)
  })
}) 