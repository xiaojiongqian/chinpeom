<template>
  <MainLayout
    title="唐诗译境"
    :nav-items="navItems"
    :copyright="copyright"
    :footer-links="footerLinks"
  >
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">组件展示</h1>

      <!-- 按钮组件展示 -->
      <BaseCard class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">按钮组件</h2>
        </template>

        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-medium mb-2">按钮变体</h3>
            <div class="flex flex-wrap gap-3">
              <BaseButton variant="primary">主要按钮</BaseButton>
              <BaseButton variant="secondary">次要按钮</BaseButton>
              <BaseButton variant="success">成功按钮</BaseButton>
              <BaseButton variant="danger">危险按钮</BaseButton>
              <BaseButton variant="warning">警告按钮</BaseButton>
              <BaseButton variant="info">信息按钮</BaseButton>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium mb-2">按钮尺寸</h3>
            <div class="flex flex-wrap items-center gap-3">
              <BaseButton size="sm">小按钮</BaseButton>
              <BaseButton size="md">中按钮</BaseButton>
              <BaseButton size="lg">大按钮</BaseButton>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium mb-2">按钮状态</h3>
            <div class="flex flex-wrap gap-3">
              <BaseButton>普通按钮</BaseButton>
              <BaseButton disabled>禁用按钮</BaseButton>
              <BaseButton block class="mb-3">100%宽度按钮</BaseButton>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium mb-2">带图标按钮</h3>
            <div class="flex flex-wrap gap-3">
              <BaseButton>
                <template #icon-left>
                  <span class="text-sm">👈</span>
                </template>
                左侧图标
              </BaseButton>
              <BaseButton>
                右侧图标
                <template #icon-right>
                  <span class="text-sm">👉</span>
                </template>
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- 卡片组件展示 -->
      <BaseCard class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">卡片组件</h2>
        </template>

        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-medium mb-2">卡片变体</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BaseCard elevation="none">
                <template #header>无阴影卡片</template>
                这是一个没有阴影的卡片
              </BaseCard>
              <BaseCard elevation="sm">
                <template #header>小阴影卡片</template>
                这是一个小阴影的卡片
              </BaseCard>
              <BaseCard elevation="md">
                <template #header>中阴影卡片</template>
                这是一个中阴影的卡片
              </BaseCard>
              <BaseCard elevation="lg">
                <template #header>大阴影卡片</template>
                这是一个大阴影的卡片
              </BaseCard>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium mb-2">带边框卡片</h3>
            <BaseCard bordered>
              <template #header>带边框的卡片</template>
              <div>这是一个带边框的卡片内容</div>
              <template #footer>卡片底部</template>
            </BaseCard>
          </div>
        </div>
      </BaseCard>

      <!-- 输入框组件展示 -->
      <BaseCard class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">输入框组件</h2>
        </template>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput v-model="inputValue1" label="基本输入框" placeholder="请输入内容" />

            <BaseInput
              v-model="inputValue2"
              label="带帮助文本"
              placeholder="请输入用户名"
              help-text="用户名长度6-20个字符"
            />

            <BaseInput
              v-model="inputValue3"
              label="必填字段"
              placeholder="请输入密码"
              type="password"
              required
            />

            <BaseInput
              v-model="inputValue4"
              label="错误状态"
              placeholder="请输入邮箱"
              error="邮箱格式不正确"
            />

            <BaseInput
              v-model="inputValue5"
              label="禁用状态"
              placeholder="此字段不可编辑"
              disabled
            />

            <BaseInput v-model="inputValue6" label="前缀图标" placeholder="搜索内容">
              <template #prefix>
                <span class="text-gray-400">🔍</span>
              </template>
            </BaseInput>
          </div>
        </div>
      </BaseCard>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import MainLayout from '../components/layout/MainLayout.vue'
  import BaseButton from '../components/common/BaseButton.vue'
  import BaseCard from '../components/common/BaseCard.vue'
  import BaseInput from '../components/common/BaseInput.vue'

  defineOptions({
    name: 'ComponentsView'
  })

  // 导航配置
  const navItems = [
    { name: '组件', path: '/components', active: true },
    { name: '设置', path: '/settings', active: false }
  ]

  // 页脚配置
  const copyright = '© 2023 唐诗译境'
  const footerLinks = [
    { name: '关于我们', url: '/about' },
    { name: '联系方式', url: '/contact' }
  ]

  // 输入框绑定值
  const inputValue1 = ref('')
  const inputValue2 = ref('')
  const inputValue3 = ref('')
  const inputValue4 = ref('')
  const inputValue5 = ref('')
  const inputValue6 = ref('')
</script>
