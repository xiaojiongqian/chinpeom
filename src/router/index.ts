import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import SettingsView from '../views/SettingsView.vue'
import AchievementView from '../views/AchievementView.vue'
import OnboardingView from '../views/OnboardingView.vue'

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
      meta: { requiresAccount: true }
    },
    {
      path: '/quizview',
      redirect: '/' // 重定向到根路径
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView
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
      component: () => import('../views/ComponentsView.vue')
    },
    {
      path: '/poem/:id',
      name: 'PoemDetail',
      component: () => import('../views/PoemDetailView.vue'),
      props: true,
      meta: { requiresAccount: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const needsAccount = !!to.meta.requiresAccount

  if (needsAccount && !userStore.isAccountReady) {
    // 如果账户未就绪，跳转到引导页
    if (to.name !== 'onboarding') {
      next({ name: 'onboarding' })
      return
    }
  }

  if (to.name === 'onboarding' && userStore.isAccountReady) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
