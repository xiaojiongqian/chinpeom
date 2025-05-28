import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import QuizView from '../../src/views/QuizView.vue'
import AnswerOptions from '../../src/components/AnswerOptions.vue'
import FeedbackDialog from '../../src/components/FeedbackDialog.vue'
import { usePoemStore } from '../../src/stores/poem'
import { useUserStore } from '../../src/stores/user'

// 模拟FeedbackDialog组件
vi.mock('../../src/components/FeedbackDialog.vue', () => ({
  default: {
    name: 'FeedbackDialog',
    props: [
      'show',
      'isCorrect',
      'correctAnswer',
      'selectedAnswer',
      'poemTitle',
      'poemAuthor',
      'scoreChange'
    ],
    template: '<div data-testid="feedback-dialog">反馈对话框</div>'
  }
}))

describe('QuizView组件', () => {
  it('应该渲染诗歌内容和答案选项', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        poem: {
          currentPoem: {
            id: 'test-1',
            title: '测试诗',
            author: '测试作者',
            sentence: [
              { senid: 0, content: '第一句诗' },
              { senid: 1, content: '第二句诗' }
            ]
          },
          currentSentenceIndex: 1,
          options: [
            { value: '第二句诗', label: '第二句诗', isCorrect: true },
            { value: '其他选项1', label: '其他选项1', isCorrect: false },
            { value: '其他选项2', label: '其他选项2', isCorrect: false },
            { value: '其他选项3', label: '其他选项3', isCorrect: false }
          ],
          hasImage: true,
          imagePath: '/resource/poem_images/test-1.webp',
          isLoading: false,
          loadError: null
        },
        user: {
          isLoggedIn: true,
          user: { username: 'testuser', score: 10 }
        }
      }
    })

    const wrapper = mount(QuizView, {
      global: {
        plugins: [pinia]
      }
    })

    // 检查标题和作者是否显示
    expect(wrapper.text()).toContain('测试诗')
    expect(wrapper.text()).toContain('测试作者')

    // 检查诗句是否显示
    expect(wrapper.text()).toContain('第一句诗')
    expect(wrapper.text()).toContain('第二句诗')

    // 检查答案选项按钮是否存在
    const optionButtons = wrapper.findAll('button.quiz-option-button')

    const poemStore = usePoemStore(pinia)
    expect(optionButtons.length).toBe(poemStore.options.length)

    // 更精确地检查选项文本，移除小数点后的空格以匹配实际渲染
    poemStore.options.forEach((option, index) => {
      expect(optionButtons[index].text()).toContain(`${index + 1}.${option.label}`)
    })
  })

  it('在加载状态下应显示加载指示器', () => {
    const wrapper = mount(QuizView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              poem: {
                isLoading: true
              }
            }
          })
        ]
      }
    })

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('在有错误时应显示错误信息', () => {
    const wrapper = mount(QuizView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              poem: {
                isLoading: false,
                loadError: '加载失败'
              }
            }
          })
        ]
      }
    })

    // 检查错误信息是否显示
    expect(wrapper.text()).toContain('加载失败')

    // 检查重试按钮是否存在
    const retryButton = wrapper.find('button.retry-button')
    expect(retryButton.exists()).toBe(true)
    expect(retryButton.text().trim()).toBe('重试')
  })

  it('应该显示用户分数信息', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        poem: {
          isLoading: false,
          currentPoem: {
            id: 'test-1',
            title: '测试诗',
            author: '测试作者',
            sentence: [
              { senid: 0, content: '第一句诗' },
              { senid: 1, content: '第二句诗' }
            ]
          },
          currentTranslation: {
            id: 'test-1',
            title: 'Test Poem',
            author: 'Test Author',
            sentence: [
              { senid: 0, content: 'First sentence' },
              { senid: 1, content: 'Second sentence' }
            ]
          },
          currentSentenceIndex: 0,
          options: [{ value: '第二句诗', label: '第二句诗', isCorrect: true }],
          loadError: null
        },
        user: {
          isLoggedIn: true,
          user: { username: 'testuser', score: 10 },
          rank: '白丁'
        }
      }
    })

    const wrapper = mount(QuizView, {
      global: {
        plugins: [pinia]
      }
    })

    // 检查分数信息是否显示
    const userStore = useUserStore(pinia)
    expect(wrapper.text()).toContain(userStore.rank)
    expect(wrapper.text()).toContain(`(${userStore.score}分)`)
  })
})
