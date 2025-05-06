import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 模拟vue-router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn()
  }))
}))

// 全局组件和翻译模拟
config.global.stubs = {
  RouterLink: true,
  RouterView: true
}

config.global.mocks = {
  $t: (key: string) => key
}

// 模拟API请求
const mockPoems = {
  chinese: [
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
  ],
  english: [
    {
      id: 'poem-1',
      sentence: [
        { senid: 0, content: 'Moonlight before my bed' },
        { senid: 1, content: 'I thought it was frost on the ground' },
        { senid: 2, content: 'Looking up to see the bright moon' },
        { senid: 3, content: 'Lowering my head in thoughts of home' }
      ]
    }
  ]
}

// 模拟fetch请求
global.fetch = vi.fn().mockImplementation((url: string | Request) => {
  if (typeof url === 'string') {
    if (url.includes('poem_chinese.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPoems.chinese)
      })
    } else if (url.includes('poem_english.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPoems.english)
      })
    }
  }
  
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
})