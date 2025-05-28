import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from '@/components/common/BaseInput.vue'

describe('BaseInput', () => {
  it('渲染输入框', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: ''
      }
    })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('渲染标签文本', () => {
    const wrapper = mount(BaseInput, {
      props: {
        label: '用户名',
        modelValue: ''
      }
    })
    expect(wrapper.find('label').text()).toBe('用户名')
  })

  it('标记必填字段', () => {
    const wrapper = mount(BaseInput, {
      props: {
        label: '用户名',
        required: true,
        modelValue: ''
      }
    })
    expect(wrapper.find('label').text()).toContain('*')
  })

  it('设置输入框类型', () => {
    const wrapper = mount(BaseInput, {
      props: {
        type: 'password',
        modelValue: ''
      }
    })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('设置占位符文本', () => {
    const wrapper = mount(BaseInput, {
      props: {
        placeholder: '请输入用户名',
        modelValue: ''
      }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('请输入用户名')
  })

  it('禁用输入框', () => {
    const wrapper = mount(BaseInput, {
      props: {
        disabled: true,
        modelValue: ''
      }
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('显示帮助文本', () => {
    const wrapper = mount(BaseInput, {
      props: {
        helpText: '请输入6-20个字符',
        modelValue: ''
      }
    })
    expect(wrapper.text()).toContain('请输入6-20个字符')
  })

  it('显示错误信息', () => {
    const wrapper = mount(BaseInput, {
      props: {
        error: '用户名不能为空',
        modelValue: ''
      }
    })
    expect(wrapper.find('.text-red-600').text()).toBe('用户名不能为空')
  })

  it('输入时触发update:modelValue事件', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: ''
      }
    })

    await wrapper.find('input').setValue('新值')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['新值'])
  })

  it('渲染前缀插槽', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: ''
      },
      slots: {
        prefix: '<span class="test-prefix">前缀</span>'
      }
    })
    expect(wrapper.find('.test-prefix').exists()).toBe(true)
    expect(wrapper.find('.test-prefix').text()).toBe('前缀')
  })

  it('渲染后缀插槽', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: ''
      },
      slots: {
        suffix: '<span class="test-suffix">后缀</span>'
      }
    })
    expect(wrapper.find('.test-suffix').exists()).toBe(true)
    expect(wrapper.find('.test-suffix').text()).toBe('后缀')
  })
})
