import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../../src/stores/user'

describe('用户Store - 最低分数限制测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该将分数限制在最低0分', () => {
    const userStore = useUserStore()
    
    // 设置初始用户（免费用户）
    userStore.login({
      id: 1,
      username: 'testuser',
      score: 5,
      language: 'english'
    }, 'test-token')

    // 扣分到负数应该被限制为0
    userStore.updateScore(-10)
    
    expect(userStore.score).toBe(0)
  })

  it('应该允许从0分继续扣分但保持在0分', () => {
    const userStore = useUserStore()
    
    // 设置初始用户分数为0
    userStore.login({
      id: 1,
      username: 'testuser',
      score: 0,
      language: 'english'
    }, 'test-token')

    // 从0分继续扣分应该保持0分
    userStore.updateScore(-5)
    
    expect(userStore.score).toBe(0)
  })

  it('应该允许正常的分数增减（在正数范围内）', () => {
    const userStore = useUserStore()
    
    // 设置初始用户
    userStore.login({
      id: 1,
      username: 'testuser',
      score: 10,
      language: 'english'
    }, 'test-token')

    // 正常加分
    userStore.updateScore(5)
    expect(userStore.score).toBe(15)
    
    // 正常扣分（不会到负数）
    userStore.updateScore(-3)
    expect(userStore.score).toBe(12)
  })

  it('应该在接近0分时正确处理扣分', () => {
    const userStore = useUserStore()
    
    // 设置初始用户分数为2
    userStore.login({
      id: 1,
      username: 'testuser',
      score: 2,
      language: 'english'
    }, 'test-token')

    // 扣除超过当前分数的分数，应该限制为0
    userStore.updateScore(-5)
    
    expect(userStore.score).toBe(0)
  })

  it('最低分数常量应该被正确导出', () => {
    const userStore = useUserStore()
    
    expect(userStore.MIN_SCORE).toBe(0)
  })
}) 