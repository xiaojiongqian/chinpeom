import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// 确保在vi.mock之前导入工具类型，这样模拟才能正确工作
import type { Poem, TranslatedPoem, PoemOption } from '../../src/types'
import type { LanguageType } from '../../src/utils/poemData'
import type { DifficultyLevel } from '../../src/utils/optionsGenerator'

// 先模拟所有模块
vi.mock('../../src/utils/poemData', () => ({
  loadPoemData: vi.fn().mockImplementation(languages => {
    return Promise.resolve({
      chinese: [
        {
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
      ],
      english: languages.includes('english')
        ? [
            {
              id: '1',
              sentence: [
                { senid: 0, content: 'Bright moonlight before my bed' },
                { senid: 1, content: 'I thought it was frost on the ground' },
                { senid: 2, content: 'Looking up to see the bright moon' },
                { senid: 3, content: 'Lowering my head in thoughts of home' }
              ]
            }
          ]
        : [],
      french: languages.includes('french')
        ? [
            {
              id: '1',
              sentence: [
                { senid: 0, content: 'Clair de lune devant mon lit' },
                { senid: 1, content: "Je pensais que c'était du givre sur le sol" },
                { senid: 2, content: 'Levant la tête pour voir la lune brillante' },
                { senid: 3, content: 'Baissant la tête en pensant à ma terre natale' }
              ]
            }
          ]
        : [],
      german: [],
      japanese: [],
      spanish: []
    })
  }),
  generateOptions: vi.fn().mockReturnValue([
    { value: '疑是地上霜', label: '疑是地上霜', isCorrect: true },
    { value: '春眠不觉晓', label: '春眠不觉晓', isCorrect: false },
    { value: '白日依山尽', label: '白日依山尽', isCorrect: false },
    { value: '谁言寸草心', label: '谁言寸草心', isCorrect: false }
  ]),
  getAllSentences: vi.fn().mockReturnValue(['床前明月光', '疑是地上霜', '举头望明月', '低头思故乡'])
}))

vi.mock('../../src/utils/sentenceTranslation', () => ({
  createDisplayContent: vi
    .fn()
    .mockReturnValue([
      '床前明月光',
      'I thought it was frost on the ground',
      '举头望明月',
      '低头思故乡'
    ])
}))

vi.mock('../../src/utils/randomPoemSelector', () => ({
  selectRandomPoemAndPrepareTranslation: vi.fn().mockReturnValue({
    poem: {
      id: '1',
      title: '静夜思',
      author: '李白',
      sentence: [
        { senid: 0, content: '床前明月光' },
        { senid: 1, content: '疑是地上霜' },
        { senid: 2, content: '举头望明月' },
        { senid: 3, content: '低头思故乡' }
      ]
    },
    translation: {
      id: '1',
      sentence: [
        { senid: 0, content: 'Bright moonlight before my bed' },
        { senid: 1, content: 'I thought it was frost on the ground' },
        { senid: 2, content: 'Looking up to see the bright moon' },
        { senid: 3, content: 'Lowering my head in thoughts of home' }
      ]
    },
    sentenceResult: {
      original: '疑是地上霜',
      translated: 'I thought it was frost on the ground',
      sentenceIndex: 1
    }
  })
}))

vi.mock('../../src/utils/api', () => ({
  getPoemImageUrl: vi.fn().mockReturnValue('/resource/poem_images/1.jpg')
}))

vi.mock('../../src/utils/optionsGenerator', () => ({
  generateOptionsWithDifficulty: vi.fn().mockReturnValue([
    { value: '疑是地上霜', label: '疑是地上霜', isCorrect: true },
    { value: '春眠不觉晓', label: '春眠不觉晓', isCorrect: false },
    { value: '白日依山尽', label: '白日依山尽', isCorrect: false },
    { value: '谁言寸草心', label: '谁言寸草心', isCorrect: false }
  ])
}))

// 导入被测试的store
import { usePoemStore } from '../../src/stores/poem'

describe('诗歌状态管理测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初始化应该加载诗歌数据并选择一首随机诗', async () => {
    const store = usePoemStore()
    await store.initialize()

    const { loadPoemData } = await import('../../src/utils/poemData')
    expect(loadPoemData).toHaveBeenCalledWith(['chinese', 'english'])

    expect(store.isLoading).toBe(false)
    expect(store.loadError).toBeNull()
    expect(store.currentPoem).not.toBeNull()
    expect(store.currentTranslation).not.toBeNull()
    expect(store.options.length).toBe(4)
  })

  it('选择随机诗歌应该更新当前诗歌和翻译', async () => {
    const store = usePoemStore()
    await store.initialize()

    const { selectRandomPoemAndPrepareTranslation } = await import(
      '../../src/utils/randomPoemSelector'
    )
    vi.mocked(selectRandomPoemAndPrepareTranslation).mockClear()

    store.selectRandomPoem()

    expect(selectRandomPoemAndPrepareTranslation).toHaveBeenCalled()
    expect(store.currentPoem).not.toBeNull()
    expect(store.currentTranslation).not.toBeNull()
    expect(store.currentSentenceIndex).toBe(1)
  })

  it('检查正确答案应该返回true', async () => {
    const store = usePoemStore()
    await store.initialize()

    const correctOption = store.options.find(opt => opt.isCorrect)
    const result = store.checkAnswer(correctOption!.value)
    expect(result).toBe(true)
  })

  it('检查错误答案应该返回false', async () => {
    const store = usePoemStore()
    await store.initialize()

    const incorrectOption = store.options.find(opt => !opt.isCorrect)
    const result = store.checkAnswer(incorrectOption!.value)
    expect(result).toBe(false)
  })

  it('切换显示语言应该重新加载诗歌数据', async () => {
    const store = usePoemStore()
    await store.initialize()

    const { loadPoemData } = await import('../../src/utils/poemData')
    vi.mocked(loadPoemData).mockClear()

    await store.setDisplayLanguage('french')

    expect(loadPoemData).toHaveBeenCalledWith(['chinese', 'french'])
    expect(store.displayLanguage).toBe('french')
  })
})
