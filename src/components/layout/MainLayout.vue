<template>
  <div class="flex flex-col min-h-screen bg-background">
    <AppHeader :title="title" :nav-items="navItems" />
    <main class="container mx-auto px-4 py-6 flex-grow">
      <slot></slot>
    </main>
    <AppFooter :copyright="copyright" :links="footerLinks" />
  </div>
</template>

<script setup lang="ts">
  import AppHeader from './AppHeader.vue'
  import AppFooter from './AppFooter.vue'

  defineProps<{
    title: string
    navItems: Array<{
      name: string
      path: string
      active: boolean
    }>
    copyright: string
    footerLinks: Array<{
      name: string
      url: string
    }>
  }>()

  defineOptions({
    name: 'MainLayout'
  })
</script>
