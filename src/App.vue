<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 全局容器，限制最大宽度并居中 -->
    <div class="mx-auto max-w-md min-h-screen">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router'
</script>

<style>
  @import './assets/main.css';
</style>
