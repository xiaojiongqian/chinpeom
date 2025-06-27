import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import SettingsView from '../views/SettingsView.vue'
import AchievementView from '../views/AchievementView.vue'
import ComponentsView from '../views/ComponentsView.vue'
import PoemDetailView from '../views/PoemDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 滚动行为配置
  scrollBehavior(_to, _from, savedPosition) {
    // 如果有保存的位置（比如使用浏览器的前进后退按钮）
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到页面顶部
    return { top: 0, left: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/QuizView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/quizview',
      redirect: '/'  // 重定向到根路径
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/achievement',
      name: 'achievement',
      component: AchievementView
    },
    {
      path: '/components',
      name: 'components',
      component: () => import('../views/ComponentsView.vue'),
    },
    {
      path: '/poem/:id',
      name: 'PoemDetail',
      component: () => import('../views/PoemDetailView.vue'),
      props: true,
    }
  ]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  console.log('[Router] 路由守卫检查:', {
    toPath: to.path,
    toName: to.name,
    requiresAuth: to.meta.requiresAuth,
    isLoggedIn: userStore.isLoggedIn
  })

  // 如果去登录页面但已经登录了，重定向到主页
  if (to.name === 'login' && userStore.isLoggedIn) {
    console.log('[Router] 已登录用户访问登录页，重定向到主页')
    next({ name: 'home' })
    return
  }

  // 如果页面需要登录且用户未登录，重定向到登录页
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    console.log('[Router] 需要登录但用户未登录，重定向到登录页')
    next({ name: 'login' })
    return
  }

  // 其他情况直接通过
  next()
})

export default router
