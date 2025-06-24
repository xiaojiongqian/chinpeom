import { describe, it, expect, beforeEach, vi } from 'vitest'

// 模拟Pinia store
vi.mock('../../src/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    isLoggedIn: false,
    login: vi.fn(),
    logout: vi.fn()
  }))
}))

// 动态导入路由器以确保模拟生效
const { default: router } = await import('../../src/router/index')

describe('路由配置测试', () => {
  beforeEach(async () => {
    // 重置路由状态
    await router.push('/')
  })

  it('应该有正确的路由配置', () => {
    const routesList = router.getRoutes()
    
    // 检查路由数量
    expect(routesList.length).toBeGreaterThan(0)
    
    // 检查关键路由是否存在
    const routePaths = routesList.map((route: any) => route.path)
    expect(routePaths).toContain('/')
    expect(routePaths).toContain('/quizview')
    expect(routePaths).toContain('/settings')
    expect(routePaths).toContain('/achievement')
    expect(routePaths).toContain('/components')
    expect(routePaths).toContain('/login')
  })

  it('根路径应该对应登录页面', async () => {
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('应该能够导航到QuizView', async () => {
    await router.push('/quizview')
    expect(router.currentRoute.value.path).toBe('/quizview')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('应该能够导航到设置页面', async () => {
    await router.push('/settings')
    expect(router.currentRoute.value.path).toBe('/settings')
    expect(router.currentRoute.value.name).toBe('settings')
  })

  it('应该能够导航到成就页面', async () => {
    await router.push('/achievement')
    expect(router.currentRoute.value.path).toBe('/achievement')
    expect(router.currentRoute.value.name).toBe('achievement')
  })

  it('应该能够导航到组件展示页面', async () => {
    await router.push('/components')
    expect(router.currentRoute.value.path).toBe('/components')
    expect(router.currentRoute.value.name).toBe('components')
  })

  it('未知路径应该有处理机制', async () => {
    await router.push('/unknown-path')
    // 由于没有定义catch-all路由，Vue Router会保持在当前路径
    // 但是路由匹配会失败，这是正常行为
    expect(router.currentRoute.value.path).toBe('/unknown-path')
  })

  it('路由应该有正确的组件配置', () => {
    const routes = router.getRoutes()
    
    // 检查每个路由都有组件配置
    routes.forEach(route => {
      if (route.path !== '/unknown-path') {
        expect(route.components).toBeDefined()
      }
    })
  })

  it('应该有scrollBehavior配置', () => {
    expect(router.options.scrollBehavior).toBeDefined()
    expect(typeof router.options.scrollBehavior).toBe('function')
  })

  it('scrollBehavior应该返回正确的滚动位置', () => {
    const scrollBehavior = router.options.scrollBehavior
    
    if (!scrollBehavior) {
      throw new Error('scrollBehavior should be defined')
    }
    
    // 测试有保存位置的情况
    const savedPosition = { left: 0, top: 100 }
    const result1 = scrollBehavior({} as any, {} as any, savedPosition)
    expect(result1).toEqual(savedPosition)
    
    // 测试没有保存位置的情况
    const result2 = scrollBehavior({} as any, {} as any, null)
    expect(result2).toEqual({ top: 0, left: 0, behavior: 'smooth' })
  })
}) 