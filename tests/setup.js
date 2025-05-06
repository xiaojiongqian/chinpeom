import { vi } from 'vitest'

// 模拟fetch请求，避免实际网络请求
global.fetch = vi.fn().mockImplementation((url) => {
  if (typeof url === 'string') {
    // 根据URL返回不同的模拟数据
    if (url.includes('poem_chinese.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
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
        ])
      })
    } else if (url.includes('poem_english.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 'poem-1',
            sentence: [
              { senid: 0, content: 'Moonlight before my bed' },
              { senid: 1, content: 'I thought it was frost on the ground' },
              { senid: 2, content: 'Looking up to see the bright moon' },
              { senid: 3, content: 'Lowering my head in thoughts of home' }
            ]
          }
        ])
      })
    }
  }
  
  // 默认返回空数组
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
}) 