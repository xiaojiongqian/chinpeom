import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AnswerOptions from '@/components/AnswerOptions.vue'
import type { PoemOption } from '@/types'

describe('AnswerOptions组件', () => {
  const mockOptions: PoemOption[] = [
    { value: '床前明月光', label: '床前明月光', isCorrect: true },
    { value: '春眠不觉晓', label: '春眠不觉晓', isCorrect: false },
    { value: '红豆生南国', label: '红豆生南国', isCorrect: false },
    { value: '夜来风雨声', label: '夜来风雨声', isCorrect: false }
  ]

  it('应正确渲染所有选项按钮', () => {
    const wrapper = mount(AnswerOptions, {
      props: {
        options: mockOptions,
        answered: false,
        selectedIndex: null,
        isCorrect: null
      }
    })

    // 检查是否渲染了所有选项按钮
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(mockOptions.length)

    // 验证按钮内容
    mockOptions.forEach((option, index) => {
      expect(buttons[index].text()).toBe(option.label)
    })
  })

  it('应该在点击选项时触发select事件', async () => {
    const wrapper = mount(AnswerOptions, {
      props: {
        options: mockOptions,
        answered: false,
        selectedIndex: null,
        isCorrect: null
      }
    })

    // 点击第一个选项
    await wrapper.findAll('button')[0].trigger('click')

    // 验证是否触发了select事件，并传递了正确的索引
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual([0])
  })

  it('回答后应禁用所有选项按钮', async () => {
    const wrapper = mount(AnswerOptions, {
      props: {
        options: mockOptions,
        answered: true,
        selectedIndex: 0,
        isCorrect: true
      }
    })

    // 检查所有按钮是否被禁用
    const buttons = wrapper.findAll('button')
    buttons.forEach(button => {
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  it('选择正确答案时应显示正确的反馈样式', async () => {
    const wrapper = mount(AnswerOptions, {
      props: {
        options: mockOptions,
        answered: true,
        selectedIndex: 0, // 选择的是正确选项
        isCorrect: true
      }
    })

    // 验证选中的按钮有正确的样式
    const selectedButton = wrapper.findAll('button')[0]
    expect(selectedButton.classes()).toContain('bg-green-100')
    expect(selectedButton.classes()).toContain('border-green-500')
  })

  it('选择错误答案时应显示错误的反馈样式并标出正确答案', async () => {
    const wrapper = mount(AnswerOptions, {
      props: {
        options: mockOptions,
        answered: true,
        selectedIndex: 1, // 选择了错误选项
        isCorrect: false
      }
    })

    // 验证选中的错误按钮有错误样式
    const selectedButton = wrapper.findAll('button')[1]
    expect(selectedButton.classes()).toContain('bg-red-100')
    expect(selectedButton.classes()).toContain('border-red-500')

    // 验证正确答案按钮有提示样式
    const correctButton = wrapper.findAll('button')[0] // 第一个选项是正确的
    expect(correctButton.classes()).toContain('bg-green-50')
    expect(correctButton.classes()).toContain('border-green-300')
  })
})
