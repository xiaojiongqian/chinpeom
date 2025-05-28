import { describe, it, expect } from 'vitest'
import { Poem, TranslatedPoem, Sentence } from '../../src/types'

describe('诗歌数据模型测试', () => {
  it('诗歌对象应符合类型定义', () => {
    const poem: Poem = {
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
    }

    expect(poem.id).toBe('927908c0-999f-4d3f-8192-d67d28f93576')
    expect(poem.title).toBe('静夜思')
    expect(poem.author).toBe('李白')
    expect(poem.sentence).toHaveLength(4)
    expect(poem.sentence[0].content).toBe('床前明月光，')
    expect(poem.sentence[0].senid).toBe(0)
  })

  it('翻译对象应符合类型定义', () => {
    const translation: TranslatedPoem = {
      id: '927908c0-999f-4d3f-8192-d67d28f93576',
      sentence: [
        {
          senid: 0,
          content: 'Moonlight before my bed,'
        },
        {
          senid: 1,
          content: 'Could it be frost on the ground?'
        },
        {
          senid: 2,
          content: 'Lifting my head, I gaze at the bright moon,'
        },
        {
          senid: 3,
          content: 'Lowering my head, I think of my homeland.'
        }
      ]
    }

    expect(translation.id).toBe('927908c0-999f-4d3f-8192-d67d28f93576')
    expect(translation.sentence).toHaveLength(4)
    expect(translation.sentence[0].content).toBe('Moonlight before my bed,')
    expect(translation.sentence[0].senid).toBe(0)
  })

  it('诗歌和翻译应能正确关联', () => {
    const poem: Poem = {
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
    }

    const translation: TranslatedPoem = {
      id: '927908c0-999f-4d3f-8192-d67d28f93576',
      sentence: [
        {
          senid: 0,
          content: 'Moonlight before my bed,'
        },
        {
          senid: 1,
          content: 'Could it be frost on the ground?'
        },
        {
          senid: 2,
          content: 'Lifting my head, I gaze at the bright moon,'
        },
        {
          senid: 3,
          content: 'Lowering my head, I think of my homeland.'
        }
      ]
    }

    // 测试ID匹配
    expect(poem.id).toBe(translation.id)

    // 测试内容与翻译行数匹配
    expect(poem.sentence.length).toBe(translation.sentence.length)

    // 测试senid是否匹配
    poem.sentence.forEach((sen, index) => {
      expect(sen.senid).toBe(translation.sentence[index].senid)
    })
  })
})
