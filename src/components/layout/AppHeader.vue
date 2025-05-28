<template>
  <header class="bg-primary text-white shadow-md">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center">
        <h1 class="text-xl font-bold">{{ title }}</h1>
      </div>
      <nav>
        <ul class="flex space-x-4">
          <li v-for="item in navItems" :key="item.path">
            <a
              :href="item.path"
              class="hover:text-accent transition-colors"
              :class="{ 'text-accent': item.active }"
            >
              {{ item.name }}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    navItems: Array<{
      name: string
      path: string
      active: boolean
    }>
  }>()

  // Add default export
  defineOptions({
    name: 'AppHeader'
  })
</script>
