<template>
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">唐诗译境</h1>
    
    <!-- 语言选择器 -->
    <div class="mb-6 flex justify-center">
      <div class="inline-flex p-1 rounded-lg bg-gray-100">
        <button
          v-for="lang in availableLanguages"
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          class="px-4 py-2 rounded-md transition-colors"
          :class="{
            'bg-blue-500 text-white': currentLanguage === lang.code,
            'hover:bg-gray-200': currentLanguage !== lang.code
          }"
        >
          {{ lang.name }}
        </button>
      </div>
    </div>
    
    <!-- 诗歌显示组件 -->
    <PoemDisplay :targetLanguage="currentLanguage" />
    
    <!-- 进入答题挑战按钮 -->
    <div class="mt-8 text-center">
      <router-link to="/quiz" class="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-md transition-colors">
        进入答题挑战
      </router-link>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PoemDisplay from '../components/PoemDisplay.vue';
import { LanguageCode } from '../utils/poemTranslation';

// 当前选择的提示语言
const currentLanguage = ref<LanguageCode>('english');

// 可用的语言选项
const availableLanguages = [
  { code: 'english', name: '英语' },
  { code: 'spanish', name: '西班牙语' },
  { code: 'french', name: '法语' },
  { code: 'german', name: '德语' },
  { code: 'japanese', name: '日语' }
] as const;

// 切换语言
const changeLanguage = (lang: LanguageCode) => {
  currentLanguage.value = lang;
};
</script> 