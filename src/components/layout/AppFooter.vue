<template>
  <footer class="bg-primary text-white py-4 mt-auto">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <p>{{ copyright }}</p>
        </div>
        <div class="flex space-x-4">
          <a
            v-for="link in links"
            :key="link.name"
            :href="link.url"
            class="hover:text-accent transition-colors"
          >
            {{ link.name }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
  defineProps<{
    copyright: string
    links: Array<{
      name: string
      url: string
    }>
  }>()

  // Add default export
  defineOptions({
    name: 'AppFooter'
  })
</script>
