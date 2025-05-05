import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import QuizView from '../../src/views/QuizView.vue'
import AnswerOptions from '../../src/components/AnswerOptions.vue'
import FeedbackDialog from '../../src/components/FeedbackDialog.vue'

// 模拟AnswerOptions组件
vi.mock('../../src/components/AnswerOptions.vue', () => ({
  default: {
    name: 'AnswerOptions',
    props: ['options', 'answered', 'selectedIndex', 'isCorrect'],
    template: '<div data-testid="answer-options">答案选项组件</div>'
  }
}))

// 模拟FeedbackDialog组件
vi.mock('../../src/components/FeedbackDialog.vue', () => ({
  default: {
    name: 'FeedbackDialog',
    props: ['show', 'isCorrect', 'correctAnswer', 'selectedAnswer', 'poemTitle', 'poemAuthor', 'scoreChange'],
    template: '<div data-testid="feedback-dialog">反馈对话框</div>'
  }
}))

describe('QuizView组件', () => {
  it('应该渲染诗歌内容和答案选项', () => {
    const wrapper = mount(QuizView, {
      global: {
        plugins: [createTestingPinia({
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
              displayContent: ['第一句诗', 'Second line'],
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
        })]
      }
    });
    
    // 检查标题和作者是否显示
    expect(wrapper.text()).toContain('测试诗');
    expect(wrapper.text()).toContain('测试作者');
    
    // 检查诗句是否显示
    expect(wrapper.text()).toContain('第一句诗');
    expect(wrapper.text()).toContain('Second line');
    
    // 检查答案选项组件是否存在
    expect(wrapper.findComponent('[data-testid="answer-options"]').exists()).toBe(true);
  });

  it('在加载状态下应显示加载指示器', () => {
    const wrapper = mount(QuizView, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            poem: {
              isLoading: true
            }
          }
        })]
      }
    });
    
    expect(wrapper.find('.animate-spin').exists()).toBe(true);
  });

  it('在有错误时应显示错误信息', () => {
    const wrapper = mount(QuizView, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            poem: {
              isLoading: false,
              loadError: '加载失败'
            }
          }
        })]
      }
    });
    
    expect(wrapper.text()).toContain('加载失败');
    expect(wrapper.find('button').text()).toBe('重试');
  });

  it('当回答问题时应该调用相应的方法', async () => {
    const wrapper = mount(QuizView, {
      global: {
        plugins: [createTestingPinia({
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
              displayContent: ['第一句诗', 'Second line'],
              options: [
                { value: '第二句诗', label: '第二句诗', isCorrect: true },
                { value: '其他选项1', label: '其他选项1', isCorrect: false },
                { value: '其他选项2', label: '其他选项2', isCorrect: false },
                { value: '其他选项3', label: '其他选项3', isCorrect: false }
              ],
              hasImage: true,
              imagePath: '/resource/poem_images/test-1.webp',
              isLoading: false,
              loadError: null,
              checkAnswer: vi.fn().mockReturnValue(true)
            },
            user: {
              isLoggedIn: true,
              user: { username: 'testuser', score: 10 },
              updateScore: vi.fn()
            }
          }
        })]
      }
    });
    
    // 模拟选择答案
    await wrapper.vm.handleSelect(0);
    
    // 验证checkAnswer方法被调用
    expect(wrapper.vm.poemStore.checkAnswer).toHaveBeenCalled();
    
    // 验证updateScore方法被调用
    expect(wrapper.vm.userStore.updateScore).toHaveBeenCalledWith(1);
  });
}); 