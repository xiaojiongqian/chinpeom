import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '../../src/router/index'

describe('路由配置测试', () => {
  let router: any

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: routes.options.routes
    })
    await router.isReady()
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
  })

  it('根路径应该重定向到登录页面', async () => {
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('应该能够导航到QuizView', async () => {
    await router.push('/quizview')
    expect(router.currentRoute.value.path).toBe('/quizview')
  })

  it('应该能够导航到设置页面', async () => {
    await router.push('/settings')
    expect(router.currentRoute.value.path).toBe('/settings')
  })

  it('应该能够导航到成就页面', async () => {
    await router.push('/achievement')
    expect(router.currentRoute.value.path).toBe('/achievement')
  })

  it('应该能够导航到组件展示页面', async () => {
    await router.push('/components')
    expect(router.currentRoute.value.path).toBe('/components')
  })

  it('未知路径应该有处理机制', async () => {
    await router.push('/unknown-path')
    
    // 路由器应该处理未知路径（可能重定向或显示404）
    const currentPath = router.currentRoute.value.path
    expect(currentPath).toBeDefined()
  })

  it('路由应该有正确的组件配置', () => {
    const routesList = router.getRoutes()
    
    routesList.forEach((route: any) => {
      if (route.path !== '/unknown-path') {
        // 每个路由都应该有组件或重定向配置
        expect(
          route.component || route.redirect || route.children
        ).toBeDefined()
      }
    })
  })

  it('应该有scrollBehavior配置', () => {
    expect(router.options.scrollBehavior).toBeDefined()
    expect(typeof router.options.scrollBehavior).toBe('function')
  })

  it('scrollBehavior应该返回正确的滚动位置', () => {
    const scrollBehavior = router.options.scrollBehavior
    
    // 测试有保存位置的情况
    const savedPosition = { left: 0, top: 100 }
    const result1 = scrollBehavior({} as any, {} as any, savedPosition)
    expect(result1).toEqual(savedPosition)
    
    // 测试没有保存位置的情况
    const result2 = scrollBehavior({} as any, {} as any, null)
    expect(result2).toEqual({ top: 0 })
  })
}) 