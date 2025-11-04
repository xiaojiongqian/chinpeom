# 唐诗译境（Chinpoem）测试规范

> 说明：当前项目以本地账户与资源为主（无在线登录/付费流程）。示例中涉及 `login`/`logout` 的用例用于演示状态管理模式，非在线认证流程。

## 测试框架

本项目使用以下测试工具：

- **Vitest**: 单元测试框架
- **Vue Test Utils**: Vue组件测试工具
- **jsdom**: 浏览器环境模拟

## 测试目录结构

```
tests/
├── components/              # 组件测试
│   ├── common/              # 通用组件测试
│   │   └── BaseButton.spec.ts
│   └── layout/              # 布局组件测试
│       └── AppHeader.spec.ts
├── views/                   # 页面组件测试
│   └── HomeView.spec.ts
├── stores/                  # 状态管理测试
│   ├── user.spec.ts
│   └── poem.spec.ts
├── utils/                   # 工具函数测试
│   └── helpers.spec.ts
└── setup.ts                 # 测试配置
```

## 测试命名规范

- 测试文件使用与被测文件相同的名称，但添加`.spec.ts`后缀
- 测试套件（describe）使用被测组件/功能的名称
- 测试用例（it/test）使用明确表达预期行为的描述

## 组件测试示例

```typescript
// BaseButton.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/common/BaseButton.vue'

describe('BaseButton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: '点击'
      }
    })
    expect(wrapper.text()).toContain('点击')
    expect(wrapper.classes()).toContain('base-button')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: '点击'
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('applies additional classes when provided', () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: '点击',
        variant: 'primary'
      }
    })
    expect(wrapper.classes()).toContain('base-button--primary')
  })

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: '点击',
        disabled: true
      }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
```

## 状态管理测试示例

```typescript
// user.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    // 创建一个新的 Pinia 实例并使其激活
    setActivePinia(createPinia())
  })

  it('initializes with correct default values', () => {
    const store = useUserStore()
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(store.score).toBe(0)
  })

  it('updates user information correctly when logged in', () => {
    const store = useUserStore()
    const userData = {
      id: 1,
      username: 'testuser',
      score: 50,
      language: 'english'
    }
    store.login(userData, 'test-token')
    
    expect(store.isLoggedIn).toBe(true)
    expect(store.user).toEqual(userData)
    expect(store.token).toBe('test-token')
    expect(store.score).toBe(50)
  })

  it('clears user information when logged out', () => {
    const store = useUserStore()
    // 先登录
    store.login({
      id: 1,
      username: 'testuser',
      score: 50,
      language: 'english'
    }, 'test-token')
    
    // 然后登出
    store.logout()
    
    expect(store.isLoggedIn).toBe(false)
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
  })

  it('calculates rank correctly based on score', () => {
    const store = useUserStore()
    const userData = {
      id: 1,
      username: 'testuser',
      score: 0,
      language: 'english'
    }
    
    // 白丁: 0-10分
    store.login(userData, 'test-token')
    expect(store.rank).toBe('白丁')
    
    // 学童: 11-25分
    store.updateScore(15)
    expect(store.rank).toBe('学童')
    
    // 秀才: 26-45分
    store.updateScore(15)
    expect(store.rank).toBe('秀才')
    
    // 其他等级类似测试...
  })
})
```

## 视图测试示例

```typescript
// HomeView.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import HomeView from '@/views/HomeView.vue'
import { usePoemStore } from '@/stores/poem'
import { useUserStore } from '@/stores/user'

describe('HomeView', () => {
  it('renders correctly with poem data', async () => {
    // 创建测试用 pinia 实例，模拟状态
    const wrapper = mount(HomeView, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            poem: {
              currentPoem: {
                id: 1,
                title: '测试诗歌',
                author: '测试作者',
                dynasty: '唐',
                content: ['测试诗句一', '测试诗句二']
              },
              displayContent: ['测试诗句一', 'Test Line Two'],
              currentLineIndex: 1,
              selectedOptions: ['选项1', '选项2', '选项3', '测试诗句二'],
              correctOption: '测试诗句二'
            },
            user: {
              user: { username: 'testuser', score: 10 },
              isLoggedIn: true
            }
          }
        })]
      }
    })
    
    // 验证诗歌标题和作者渲染正确
    expect(wrapper.text()).toContain('测试诗歌')
    expect(wrapper.text()).toContain('测试作者')
    
    // 验证诗句内容渲染正确
    expect(wrapper.text()).toContain('测试诗句一')
    expect(wrapper.text()).toContain('Test Line Two')
    
    // 验证选项渲染正确
    expect(wrapper.findAll('.option').length).toBe(4)
    
    // 模拟点击正确答案
    const poemStore = usePoemStore()
    const userStore = useUserStore()
    
    await wrapper.findAll('.option')[3].trigger('click')
    
    // 验证调用了检查答案和更新得分的方法
    expect(poemStore.checkAnswer).toHaveBeenCalledWith('测试诗句二')
    expect(userStore.updateScore).toHaveBeenCalledWith(1)
  })
})
```

## 工具函数测试示例

```typescript
// helpers.spec.ts
import { describe, it, expect } from 'vitest'
import { shuffleArray, formatDate } from '@/utils/helpers'

describe('shuffleArray', () => {
  it('shuffles array elements', () => {
    const original = [1, 2, 3, 4, 5]
    const shuffled = [...original]
    
    // 调用洗牌函数
    shuffleArray(shuffled)
    
    // 验证元素数量相同
    expect(shuffled.length).toBe(original.length)
    
    // 验证所有原始元素都存在
    original.forEach(item => {
      expect(shuffled).toContain(item)
    })
    
    // 注意：理论上有极小概率洗牌后顺序不变，但概率非常低
    // 为避免偶尔的测试失败，可以不做这种断言
  })
})

describe('formatDate', () => {
  it('formats date correctly', () => {
    // 创建一个特定日期
    const date = new Date(2023, 0, 15) // 2023年1月15日
    
    // 测试格式化
    expect(formatDate(date)).toBe('2023-01-15')
  })
})
```

## 测试覆盖率要求

项目设置了以下测试覆盖率目标：

- **语句覆盖率**：80%以上
- **分支覆盖率**：70%以上
- **函数覆盖率**：80%以上
- **行覆盖率**：80%以上

每当完成一个功能模块，都应该编写相应的测试用例，确保覆盖率达到上述标准。 
