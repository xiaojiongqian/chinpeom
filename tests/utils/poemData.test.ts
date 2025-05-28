import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  loadPoemData,
  getPoemById,
  getTranslatedPoemById,
  getRandomPoemWithTranslation,
  getAllPoems,
  generateOptions,
  clearPoemCache
} from '../../src/utils/poemData'
import type { Poem, TranslatedPoem, PoemOption } from '../../src/types'

// 模拟诗歌数据
const mockChinesePoems: Poem[] = [
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
  },
  {
    id: '2',
    title: '春晓',
    author: '孟浩然',
    sentence: [
      { senid: 0, content: '春眠不觉晓' },
      { senid: 1, content: '处处闻啼鸟' },
      { senid: 2, content: '夜来风雨声' },
      { senid: 3, content: '花落知多少' }
    ]
  }
]

const mockEnglishPoems: TranslatedPoem[] = [
  {
    id: '1',
    sentence: [
      { senid: 0, content: 'Bright moonlight before my bed' },
      { senid: 1, content: 'I thought it was frost on the ground' },
      { senid: 2, content: 'Looking up to see the bright moon' },
      { senid: 3, content: 'Lowering my head in thoughts of home' }
    ]
  },
  {
    id: '2',
    sentence: [
      { senid: 0, content: 'Spring sleep unaware of dawn' },
      { senid: 1, content: 'Everywhere birds are singing' },
      { senid: 2, content: 'Night came with sound of wind and rain' },
      { senid: 3, content: 'How many flowers have fallen?' }
    ]
  }
]

// 创建loadJsonFile的模拟函数
const loadJsonFileMock = vi.fn().mockImplementation((path: string) => {
  if (path.includes('chinese')) return Promise.resolve(mockChinesePoems)
  if (path.includes('english')) return Promise.resolve(mockEnglishPoems)
  return Promise.resolve([])
})

// 模拟文件加载函数
vi.mock('../../src/utils/resourceLoader', () => ({
  loadJsonFile: (path: string) => loadJsonFileMock(path)
}))

describe('诗歌数据处理测试', () => {
  beforeEach(() => {
    // 清除缓存和重置模拟函数
    clearPoemCache()
    loadJsonFileMock.mockClear()
  })

  it('loadPoemData应该加载所有语言的诗歌数据', async () => {
    const data = await loadPoemData(['chinese', 'english'])
    expect(data.chinese).toBeDefined()
    expect(data.english).toBeDefined()
    expect(data.chinese).toHaveLength(mockChinesePoems.length)
    expect(data.english).toHaveLength(mockEnglishPoems.length)
    expect(loadJsonFileMock).toHaveBeenCalledTimes(2)
  })

  it('getPoemById应该返回指定ID的诗歌', async () => {
    await loadPoemData(['chinese'])
    const poem = getPoemById('1')
    expect(poem).toBeDefined()
    expect(poem?.id).toBe('1')
    expect(poem?.title).toBe('静夜思')
  })

  it('getTranslatedPoemById应该返回指定ID和语言的翻译诗歌', async () => {
    await loadPoemData(['chinese', 'english'])
    const translatedPoem = getTranslatedPoemById('1', 'english')
    expect(translatedPoem).toBeDefined()
    expect(translatedPoem?.id).toBe('1')
    expect(translatedPoem?.sentence[0].content).toBe('Bright moonlight before my bed')
  })

  it('getRandomPoemWithTranslation应该返回随机诗歌及其翻译', async () => {
    await loadPoemData(['chinese', 'english'])
    const result = getRandomPoemWithTranslation('english')
    expect(result.poem).toBeDefined()
    expect(result.translated).toBeDefined()
    expect(result.poem.id).toBe(result.translated.id)
  })

  it('getAllPoems应该返回所有加载的中文诗歌', async () => {
    await loadPoemData(['chinese'])
    const poems = getAllPoems()
    expect(poems).toBeDefined()
    expect(poems).toHaveLength(mockChinesePoems.length)
  })

  it('generateOptions应该生成包含正确答案的选项列表', async () => {
    await loadPoemData(['chinese'])
    const correctSentence = mockChinesePoems[0].sentence[0].content
    const options = generateOptions(correctSentence, 4)

    expect(options).toHaveLength(4)
    // 确保有一个正确选项
    const correctOption = options.find(option => option.isCorrect)
    expect(correctOption).toBeDefined()
    expect(correctOption?.value).toBe(correctSentence)

    // 确保其他选项都是不正确的
    const incorrectOptions = options.filter(option => !option.isCorrect)
    expect(incorrectOptions).toHaveLength(3)

    // 确保没有重复选项
    const uniqueValues = new Set(options.map(option => option.value))
    expect(uniqueValues.size).toBe(options.length)
  })
})

// 添加新的测试组用于测试缓存机制
describe('诗歌数据缓存测试', () => {
  beforeEach(() => {
    // 重置缓存
    clearPoemCache()
    // 重置模拟函数计数
    loadJsonFileMock.mockClear()
  })

  it('多次调用loadPoemData相同语言，文件只应该加载一次', async () => {
    // 第一次加载数据
    await loadPoemData(['chinese'])
    expect(loadJsonFileMock).toHaveBeenCalledTimes(1)

    // 再次加载相同语言，不应该触发文件加载
    await loadPoemData(['chinese'])
    expect(loadJsonFileMock).toHaveBeenCalledTimes(1)
  })

  it('加载不同语言应该触发新的文件加载', async () => {
    // 第一次加载中文
    await loadPoemData(['chinese'])
    expect(loadJsonFileMock).toHaveBeenCalledTimes(1)

    // 加载英文，应该触发新的加载
    await loadPoemData(['english'])
    expect(loadJsonFileMock).toHaveBeenCalledTimes(2)
  })

  it('清除缓存后应该重新加载文件', async () => {
    // 第一次加载数据
    await loadPoemData(['chinese'])
    expect(loadJsonFileMock).toHaveBeenCalledTimes(1)

    // 清除缓存
    clearPoemCache()

    // 再次加载，应该重新加载文件
    await loadPoemData(['chinese'])
    expect(loadJsonFileMock).toHaveBeenCalledTimes(2)
  })
})
