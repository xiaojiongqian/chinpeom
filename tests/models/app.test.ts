import { describe, it, expect } from 'vitest'
import { AppSettings, AnswerResult, HistoryItem, SupportedLanguage } from '../../src/types'

describe('应用状态模型测试', () => {
  it('应用设置应符合类型定义', () => {
    const settings: AppSettings = {
      language: 'english',
      theme: 'light',
      soundEffects: true
    }

    expect(settings.language).toBe('english')
    expect(settings.theme).toBe('light')
    expect(settings.soundEffects).toBe(true)
  })

  it('答题结果应符合类型定义', () => {
    const result: AnswerResult = {
      correct: true,
      correctLine: '床前明月光，',
      selectedLine: '床前明月光，',
      poem: {
        id: '927908c0-999f-4d3f-8192-d67d28f93576',
        title: '静夜思',
        author: '李白',
        sentence: [
          {
            senid: 0,
            content: '床前明月光，'
          },
          {
            senid: 1,
            content: '疑是地上霜。'
          },
          {
            senid: 2,
            content: '举头望明月，'
          },
          {
            senid: 3,
            content: '低头思故乡。'
          }
        ]
      },
      sentenceIndex: 0
    }

    expect(result.correct).toBe(true)
    expect(result.correctLine).toBe('床前明月光，')
    expect(result.selectedLine).toBe('床前明月光，')
    expect(result.poem.title).toBe('静夜思')
    expect(result.sentenceIndex).toBe(0)
  })

  it('历史记录项应符合类型定义', () => {
    const historyItem: HistoryItem = {
      date: '2023-05-20',
      poem: {
        id: '927908c0-999f-4d3f-8192-d67d28f93576',
        title: '静夜思',
        author: '李白',
        sentence: [
          {
            senid: 0,
            content: '床前明月光，'
          },
          {
            senid: 1,
            content: '疑是地上霜。'
          },
          {
            senid: 2,
            content: '举头望明月，'
          },
          {
            senid: 3,
            content: '低头思故乡。'
          }
        ]
      },
      correct: true,
      score: 51,
      sentenceIndex: 0
    }

    expect(historyItem.date).toBe('2023-05-20')
    expect(historyItem.poem.title).toBe('静夜思')
    expect(historyItem.correct).toBe(true)
    expect(historyItem.score).toBe(51)
    expect(historyItem.sentenceIndex).toBe(0)
  })

  it('支持的语言类型应符合定义', () => {
    const supportedLanguages: SupportedLanguage[] = [
      'english',
      'french',
      'spanish',
      'german',
      'japanese'
    ]

    expect(supportedLanguages).toContain('english')
    expect(supportedLanguages).toContain('french')
    expect(supportedLanguages).toContain('spanish')
    expect(supportedLanguages).toContain('german')
    expect(supportedLanguages).toContain('japanese')

    // 类型测试
    const language: SupportedLanguage = 'english'
    expect(supportedLanguages).toContain(language)
  })
})
