<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="flex flex-col h-full bg-white">
    <template v-if="poemStory">
      <!-- Header with Back Button -->
      <div class="relative p-4 border-b h-16 flex items-center justify-center">
        <button class="absolute left-4 text-success font-bold" @click="$router.back()">&lt;</button>
        <h2 class="text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis mx-16">
          {{ poemStory.title }}
        </h2>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-4 hover-scrollbar">
        <!-- Poem Details -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="prose max-w-none mb-6" v-html="formattedStoryContent"></div>

        <!-- Preset Questions -->
        <div class="flex flex-col items-start space-y-1 mb-4">
          <button
            v-for="q in poemStory.story.questions.slice(0, 3)"
            :key="q"
            class="bg-gray-200 text-xs hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-md max-w-full text-left line-clamp-2"
            @click="askPresetQuestion(q)"
          >
            {{ q }}
          </button>
        </div>

        <!-- Chat History -->
        <div ref="chatHistoryRef" class="space-y-4">
          <div
            v-for="(message, index) in chatHistory"
            :key="index"
            class="flex"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg"
              :class="
                message.role === 'user'
                  ? 'bg-success-100 text-gray-800'
                  : 'bg-gray-100 text-gray-800'
              "
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div
                v-if="message.role === 'assistant'"
                v-html="renderMarkdown(message.content)"
              ></div>
              <span v-else>{{ message.content }}</span>
            </div>
          </div>
          <div v-if="isLLMLoading" class="flex justify-start">
            <div
              class="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-gray-100 text-gray-800"
            >
              ...
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Input Area -->
      <div class="border-t p-4">
        <div class="flex items-center">
          <input
            v-model="userInput"
            type="text"
            class="w-full border rounded-l-lg p-2 bg-white h-11"
            :placeholder="$t('poemDetail.askPlaceholder')"
            :disabled="isLLMLoading"
            @keyup.enter="sendMessage"
          />
          <button
            class="bg-success text-white p-2 px-4 rounded-r-lg h-11 flex items-center justify-center"
            :disabled="isLLMLoading"
            @click="sendMessage"
          >
            <span v-if="!isLLMLoading" class="font-bold text-lg">&gt;</span>
            <span v-else>...</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Loading State -->
    <div v-else class="flex-1 flex items-center justify-center">
      <p>{{ $t('common.loading') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, nextTick } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { marked } from 'marked'
  import { useUserStore } from '@/stores/user'
  import { postToLLM, type LlmMessage } from '@/services/llmApi'
  import type { SupportedLanguage } from '@/types'

  interface StoryDetails {
    meaning: string
    allusion: string
    background: string
    additional_info: string
    questions: string[]
  }

  interface PoemStory {
    id: string
    title: string
    author: string
    content: string // The original poem content
    story: StoryDetails
  }

  type ChatMessage = LlmMessage & { role: 'user' | 'assistant' }

  const route = useRoute()
  const { t } = useI18n()
  const userStore = useUserStore()
  const poemStory = ref<PoemStory | null>(null)
  const userInput = ref('')
  const chatHistory = ref<ChatMessage[]>([])
  const isLLMLoading = ref(false)
  const chatHistoryRef = ref<HTMLElement | null>(null)

  const formattedStoryContent = computed(() => {
    if (!poemStory.value) return ''
    const { meaning, allusion, background, additional_info } = poemStory.value.story
    let markdown = ''
    if (meaning) markdown += `### ${t('poemDetail.meaning')}\n\n${meaning}\n\n`
    if (allusion) markdown += `### ${t('poemDetail.allusion')}\n\n${allusion}\n\n`
    if (background) markdown += `### ${t('poemDetail.background')}\n\n${background}\n\n`
    if (additional_info)
      markdown += `### ${t('poemDetail.additionalInfo')}\n\n${additional_info}\n\n`
    return renderMarkdown(markdown)
  })

  function renderMarkdown(content: string) {
    return marked.parse(content, { gfm: true, breaks: true })
  }

  async function fetchPoemStory() {
    const id = route.params.id
    const lang = userStore.language
    const supportedLangs: SupportedLanguage[] = [
      'chinese',
      'english',
      'french',
      'german',
      'japanese',
      'spanish'
    ]
    const finalLang: SupportedLanguage = supportedLangs.includes(lang) ? lang : 'english'

    try {
      const response = await fetch(`/resource/data/poem_stories_${finalLang}.json`)
      if (!response.ok) throw new Error('Failed to fetch story data')
      const stories = (await response.json()) as PoemStory[]
      poemStory.value = stories.find(story => story.id === id) || null
    } catch (error) {
      console.error('Failed to load poem story:', error)
      poemStory.value = null
    }
  }

  async function sendMessage() {
    if (!userInput.value.trim() || isLLMLoading.value) return

    const userMessage: ChatMessage = { role: 'user', content: userInput.value }
    chatHistory.value.push(userMessage)
    userInput.value = ''
    isLLMLoading.value = true
    scrollToBottom()

    try {
      const story = poemStory.value?.story
      const context = `
      Poem: ${poemStory.value?.title} by ${poemStory.value?.author}.
      Meaning: ${story?.meaning}.
      Allusion: ${story?.allusion}.
      Background: ${story?.background}.
      Additional Info: ${story?.additional_info}.
    `

      const initialPrompt: LlmMessage = {
        role: 'system',
        content: `You are a historian and poet. Your knowledge base includes the following context: ${context}. Please answer questions based on this context.`
      }

      const messages: LlmMessage[] = [initialPrompt, ...chatHistory.value.slice(-5)]
      const response = await postToLLM(messages)

      if (response.choices && response.choices.length > 0) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.choices[0].message.content
        }
        chatHistory.value.push(assistantMessage)
      } else {
        throw new Error('No response from LLM')
      }
    } catch (error) {
      console.error('Error fetching from LLM:', error)
      const errorMessage: ChatMessage = { role: 'assistant', content: t('errors.llmError') }
      chatHistory.value.push(errorMessage)
    } finally {
      isLLMLoading.value = false
      scrollToBottom()
    }
  }

  function askPresetQuestion(question: string) {
    userInput.value = question
    sendMessage()
  }

  function scrollToBottom() {
    nextTick(() => {
      const el = chatHistoryRef.value
      if (el) {
        el.parentElement!.scrollTop = el.parentElement!.scrollHeight
      }
    })
  }

  onMounted(() => {
    fetchPoemStory()
  })
</script>

<style scoped>
  /* Scoped styles for the dialog can be added here. */
</style>
