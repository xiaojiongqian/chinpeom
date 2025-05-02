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

// 全局组件模拟
config.global.stubs = {
  RouterLink: true,
  RouterView: true
}

// 全局 mocks
config.global.mocks = {
  $t: (key: string) => key
} 