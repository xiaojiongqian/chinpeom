<template>
  <div class="poem-display">
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div
        class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"
      ></div>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>{{ error }}</p>
      <button
        class="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        @click="getRandomPoem"
      >
        {{ $t('common.retry') }}
      </button>
    </div>

    <div
      v-else-if="poemData"
      class="poem-content bg-amber-50 rounded-lg shadow-md p-6 max-w-xl mx-auto"
    >
      <!-- 诗歌标题和作者 -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">{{ poemData.title }}</h2>
        <p class="text-gray-600 mt-1">{{ poemData.author }}</p>
      </div>

      <!-- 诗歌图片 -->
      <div class="mb-6">
        <img
          :src="poemImageUrl"
          :alt="poemData.title"
          class="w-full h-64 object-cover rounded-md shadow"
        />
      </div>

      <!-- 诗歌内容 -->
      <div class="space-y-2 text-lg">
        <p
          v-for="sentence in poemData.sentence"
          :key="sentence.senid"
          class="poem-line"
          :class="{
            'text-gray-800': sentence.senid !== translatedSentenceId,
            'text-blue-600 font-medium': sentence.senid === translatedSentenceId
          }"
        >
          <template v-if="sentence.senid === translatedSentenceId">
            {{ translatedText }}
          </template>
          <template v-else>
            {{ sentence.content }}
          </template>
        </p>
      </div>

      <!-- 下一首按钮 -->
      <div class="mt-6 text-center">
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition-colors"
          @click="getRandomPoem"
        >
          {{ $t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import {
    Poem,
    LanguageCode,
    loadPoemData,
    preparePoemWithTranslation
  } from '../utils/poemTranslation'

  interface Props {
    targetLanguage?: LanguageCode
  }

  const props = withDefaults(defineProps<Props>(), {
    targetLanguage: 'english'
  })

  // 状态
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const poemData = ref<Poem | null>(null)
  const translatedSentenceId = ref<number | null>(null)
  const translatedText = ref<string | null>(null)

  // 获取一首随机诗
  const getRandomPoem = async () => {
    try {
      isLoading.value = true
      error.value = null

      // 加载中文诗歌数据
      const poems = await loadPoemData('chinese')

      // 随机选择一首诗
      const randomIndex = Math.floor(Math.random() * poems.length)
      const selectedPoem = poems[randomIndex]

      // 处理翻译
      const result = await preparePoemWithTranslation(selectedPoem, props.targetLanguage)

      // 更新状态
      poemData.value = result.poem
      translatedSentenceId.value = result.translatedSentence.sentenceId
      translatedText.value = result.translatedSentence.translated
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载诗歌时出错'
      console.error('加载诗歌时出错:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 诗歌图片URL
  const poemImageUrl = computed(() => {
    if (!poemData.value) return ''
    return `/resource/poem_images/${poemData.value.id}.webp`
  })

  // 初始加载
  onMounted(() => {
    getRandomPoem()
  })
</script>

<style scoped>
  .poem-line {
    text-align: center;
    line-height: 1.8;
  }
</style>
