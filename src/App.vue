<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router'
</script>

<style>
  @import './assets/main.css';
</style>
