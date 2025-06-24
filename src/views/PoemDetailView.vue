<template>
  <div class="h-screen bg-gray-100 p-4 sm:p-6 md:p-8 flex justify-center">
    <div class="w-full max-w-2xl bg-white h-full shadow-lg rounded-lg relative overflow-hidden">
      <PoemDetailDialog />
    </div>
  </div>
</template>

<script setup lang="ts">
import PoemDetailDialog from '@/components/PoemDetailDialog.vue';
</script> 