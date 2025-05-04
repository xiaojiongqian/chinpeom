import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePoemStore } from '@/stores/poem'

// 先声明模拟数据
// 模拟数据
const mockPoem = {
  id: '1',
  title: '静夜思',
  author: '李白',
  sentence: [
    { senid: 0, content: '床前明月光' },
    { senid: 1, content: '疑是地上霜' },
    { senid: 2, content: '举头望明月' },
    { senid: 3, content: '低头思故乡' }
  ]
}

const mockTranslation = {
  id: '1',
  sentence: [
    { senid: 0, content: 'Bright moonlight before my bed' },
    { senid: 1, content: 'I thought it was frost on the ground' },
    { senid: 2, content: 'Looking up to see the bright moon' },
    { senid: 3, content: 'Lowering my head in thoughts of home' }
  ]
}

// 模拟sentenceTranslation模块
vi.mock('@/utils/sentenceTranslation', () => ({
  createDisplayContent: vi.fn().mockReturnValue([
    '床前明月光',
    'I thought it was frost on the ground',
    '举头望明月',
    '低头思故乡'
  ])
}))

// 模拟randomPoemSelector模块
vi.mock('@/utils/randomPoemSelector', () => {
  const sentenceResult = {
    original: '疑是地上霜',
    translated: 'I thought it was frost on the ground',
    sentenceIndex: 1
  }
  
  return {
    selectRandomPoemAndPrepareTranslation: vi.fn().mockReturnValue({
      poem: mockPoem,
      translation: mockTranslation,
      sentenceResult
    })
  }
})

// 模拟poemData模块
vi.mock('@/utils/poemData', () => {
  const optionsResult = [
    { value: '疑是地上霜', label: '疑是地上霜', isCorrect: true },
    { value: '春眠不觉晓', label: '春眠不觉晓', isCorrect: false },
    { value: '白日依山尽', label: '白日依山尽', isCorrect: false },
    { value: '谁言寸草心', label: '谁言寸草心', isCorrect: false }
  ]
  
  return {
    loadPoemData: vi.fn().mockResolvedValue({
      chinese: [mockPoem],
      english: [mockTranslation]
    }),
    generateOptions: vi.fn().mockReturnValue(optionsResult)
  }
})

// 模拟API模块
vi.mock('@/utils/api', () => ({
  getPoemImageUrl: vi.fn().mockReturnValue('/resource/poem_images/1.jpg')
}))

describe('诗歌状态管理测试', () => {
  beforeEach(() => {
    // 创建测试用的pinia实例
    setActivePinia(createPinia())
    // 重置所有模拟函数
    vi.resetAllMocks()
  })
  
  it('初始化应该加载诗歌数据并选择一首随机诗', async () => {
    const store = usePoemStore()
    await store.initialize()
    
    // 验证loadPoemData被调用
    const { loadPoemData } = await import('@/utils/poemData')
    expect(loadPoemData).toHaveBeenCalledWith(['chinese', 'english'])
    
    // 验证状态已正确更新
    expect(store.isLoading).toBe(false)
    expect(store.loadError).toBeNull()
    expect(store.currentPoem).not.toBeNull()
    expect(store.currentTranslation).not.toBeNull()
    expect(store.options.length).toBe(4)
  })
  
  it('选择随机诗歌应该更新当前诗歌和翻译', async () => {
    const store = usePoemStore()
    await store.initialize()
    
    // 重置模拟函数以验证后续调用
    const { selectRandomPoemAndPrepareTranslation } = await import('@/utils/randomPoemSelector')
    vi.mocked(selectRandomPoemAndPrepareTranslation).mockClear()
    
    // 调用选择随机诗歌
    store.selectRandomPoem()
    
    // 验证方法被调用
    expect(selectRandomPoemAndPrepareTranslation).toHaveBeenCalled()
    
    // 验证状态被更新
    expect(store.currentPoem).not.toBeNull()
    expect(store.currentTranslation).not.toBeNull()
    expect(store.currentSentenceIndex).toBe(1)
  })
  
  it('检查正确答案应该返回true', async () => {
    const store = usePoemStore()
    await store.initialize()
    
    // 获取正确选项
    const correctOption = store.options.find(opt => opt.isCorrect)
    
    // 检查正确答案
    const result = store.checkAnswer(correctOption!.value)
    expect(result).toBe(true)
  })
  
  it('检查错误答案应该返回false', async () => {
    const store = usePoemStore()
    await store.initialize()
    
    // 获取错误选项
    const incorrectOption = store.options.find(opt => !opt.isCorrect)
    
    // 检查错误答案
    const result = store.checkAnswer(incorrectOption!.value)
    expect(result).toBe(false)
  })
  
  it('切换显示语言应该重新加载诗歌数据', async () => {
    const store = usePoemStore()
    await store.initialize()
    
    // 重置模拟函数以验证后续调用
    const { loadPoemData } = await import('@/utils/poemData')
    vi.mocked(loadPoemData).mockClear()
    
    // 切换语言
    await store.setDisplayLanguage('french')
    
    // 验证loadPoemData被调用
    expect(loadPoemData).toHaveBeenCalledWith(['chinese', 'french'])
    
    // 验证displayLanguage状态被更新
    expect(store.displayLanguage).toBe('french')
  })
}) 