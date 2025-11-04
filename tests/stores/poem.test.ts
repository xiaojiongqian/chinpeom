import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'

const languageRef = ref<'chinese' | 'english' | 'french'>('chinese')
const difficultyRef = ref<'easy' | 'hard'>('easy')
const hintLanguageRef = ref<'none' | 'english' | 'french'>('english')

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    get language() {
      return languageRef.value
    },
    get difficulty() {
      return difficultyRef.value
    },
    get hintLanguage() {
      return hintLanguageRef.value
    }
  })
}))

const mockPoem = {
  id: 'poem-1',
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
  id: 'poem-1',
  sentence: [
    { senid: 0, content: 'Moonlight before my bed' },
    { senid: 1, content: 'I thought it was frost on the ground' },
    { senid: 2, content: 'Looking up to see the bright moon' },
    { senid: 3, content: 'Lowering my head in thoughts of home' }
  ]
}

const mockSentenceResult = {
  original: '疑是地上霜',
  translated: 'I thought it was frost on the ground',
  sentenceIndex: 1
}

const mockPoemData = {
  chinese: [mockPoem],
  english: [mockTranslation],
  french: []
}

const loadPoemDataMock = vi.fn().mockResolvedValue(mockPoemData)
const getAllSentencesMock = vi
  .fn()
  .mockReturnValue(mockPoemData.chinese.flatMap(poem => poem.sentence.map(item => item.content)))

vi.mock('@/utils/poemData', () => ({
  loadPoemData: loadPoemDataMock,
  getAllSentences: getAllSentencesMock
}))

const selectRandomPoemMock = vi.fn().mockReturnValue({
  poem: mockPoem,
  translation: mockTranslation,
  sentenceResult: mockSentenceResult
})

vi.mock('@/utils/randomPoemSelector', () => ({
  selectRandomPoemAndPrepareTranslation: selectRandomPoemMock
}))

const displayContentMock = ['床前明月光', 'I thought it was frost on the ground']

vi.mock('@/utils/sentenceTranslation', () => ({
  createDisplayContent: vi.fn().mockReturnValue(displayContentMock)
}))

const optionsMock = [
  { value: '疑是地上霜', label: '疑是地上霜', isCorrect: true },
  { value: '春眠不觉晓', label: '春眠不觉晓', isCorrect: false },
  { value: '红豆生南国', label: '红豆生南国', isCorrect: false },
  { value: '白日依山尽', label: '白日依山尽', isCorrect: false }
]

const generateOptionsMock = vi.fn().mockReturnValue(optionsMock)

vi.mock('@/utils/optionsGenerator', () => ({
  generateOptionsWithDifficulty: generateOptionsMock
}))

vi.mock('@/utils/resourceLoader', () => ({
  getPoemImageUrl: vi.fn().mockReturnValue('/resource/poem_images/poem-1.jpg')
}))

const { usePoemStore } = await import('@/stores/poem')

describe('usePoemStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    languageRef.value = 'chinese'
    difficultyRef.value = 'easy'
    hintLanguageRef.value = 'english'
  })

  it('initialize loads poem data and prepares state', async () => {
    const store = usePoemStore()

    await store.initialize()

    expect(loadPoemDataMock).toHaveBeenCalledWith(['chinese', 'english'])
    expect(store.currentPoem?.id).toBe('poem-1')
    expect(store.currentTranslation?.id).toBe('poem-1')
    expect(store.options).toEqual(optionsMock)
    expect(store.displayContent).toEqual(displayContentMock)
  })

  it('selectRandomPoem picks poem and prepares options', async () => {
    const store = usePoemStore()
    await store.initialize()

    selectRandomPoemMock.mockClear()
    generateOptionsMock.mockClear()

    store.selectRandomPoem()

    expect(selectRandomPoemMock).toHaveBeenCalledTimes(1)
    expect(store.currentSentenceIndex).toBe(mockSentenceResult.sentenceIndex)
    expect(generateOptionsMock).toHaveBeenCalled()
  })

  it('checkAnswer compares against generated options', async () => {
    const store = usePoemStore()
    await store.initialize()

    const correct = store.checkAnswer('疑是地上霜')
    const incorrect = store.checkAnswer('白日依山尽')

    expect(correct).toBe(true)
    expect(incorrect).toBe(false)
  })
})
