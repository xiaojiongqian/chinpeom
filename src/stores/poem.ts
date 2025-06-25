import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Poem, TranslatedPoem, PoemOption } from '@/types'
import { useUserStore } from '@/stores/user'
import { loadPoemData as loadPoemDataUtil, getAllSentences, LanguageType } from '@/utils/poemData'
import { getPoemImageUrl } from '@/utils/resourceLoader'
import { selectRandomPoemAndPrepareTranslation } from '@/utils/randomPoemSelector'
import { createDisplayContent } from '@/utils/sentenceTranslation'
import {
  generateOptionsWithDifficulty as generateOptionsByDifficulty,
  type DifficultyLevel
} from '@/utils/optionsGenerator'

export const usePoemStore = defineStore('poem', () => {
  // 依赖 userStore
  const userStore = useUserStore()

  // 状态
  const currentPoem = ref<Poem | null>(null)
  const currentTranslation = ref<TranslatedPoem | null>(null)
  const currentSentenceIndex = ref<number>(0)
  const options = ref<PoemOption[]>([])
  const isLoading = ref(true)
  const loadError = ref<string | null>(null)
  const allPoems = ref<Poem[]>([])
  const allTranslations = ref<Record<string, TranslatedPoem>>({})
  
  // 难度直接从 userStore 获取
  const currentDifficulty = computed(() => userStore.difficulty)

  // 计算属性
  const hasImage = computed(() => {
    return currentPoem.value !== null && currentPoem.value.id !== ''
  })

  const imagePath = computed(() => {
    if (!hasImage.value) return ''
    return getPoemImageUrl(currentPoem.value!.id)
  })

  // 获取当前显示的诗句（包含替换的外语或原始中文，取决于难度）
  const displayContent = computed(() => {
    return createDisplayContent(
      currentPoem.value,
      currentTranslation.value,
      currentSentenceIndex.value,
      currentDifficulty.value,
      userStore.language // 传入当前界面语言
    )
  })

  // 方法
  // 初始化诗歌数据
  async function initialize() {
    console.log('[PoemStore] Initialize: START, current isLoading state:', isLoading.value)
    isLoading.value = true
    loadError.value = null

    try {
      console.log('[PoemStore] Calling loadPoemDataUtil...')
      const hintLang = userStore.hintLanguage
      const languagesToLoad: LanguageType[] = ['chinese']
      if (hintLang !== 'none' && hintLang !== 'chinese') {
        languagesToLoad.push(hintLang as LanguageType)
      }
      
      const poemData = await loadPoemDataUtil(languagesToLoad)
      console.log('[PoemStore] loadPoemDataUtil returned. poemData exists:', !!poemData)

      // 保存所有诗歌数据
      allPoems.value = [...poemData.chinese]

      // 构建翻译字典
      allTranslations.value = {}
      if (hintLang !== 'none' && poemData[hintLang]) {
        poemData[hintLang].forEach((poem: TranslatedPoem) => {
          allTranslations.value[poem.id] = poem
        })
      }

      console.log('[PoemStore] Calling selectRandomPoem...')
      selectRandomPoem()
      console.log('[PoemStore] selectRandomPoem finished.')
      isLoading.value = false
      console.log('[PoemStore] Initialize: SUCCESS, isLoading set to:', isLoading.value)
    } catch (error) {
      console.error('[PoemStore] Initialize: FAILED with error:', error)
      loadError.value = '加载诗歌数据失败，请刷新页面重试'
      isLoading.value = false
      console.log(
        '[PoemStore] Initialize: FAILED (error caught), isLoading set to:',
        isLoading.value
      )
    }
  }

  // 监听用户语言或难度变化，重新加载数据
  watch([() => userStore.language, () => userStore.difficulty], () => {
    console.log('检测到用户语言或难度变化，重新初始化诗歌数据...')
    initialize()
  }, { deep: true })


  // 随机选择一首诗
  function selectRandomPoem() {
    try {
      if (allPoems.value.length === 0) {
        throw new Error('诗歌数据尚未加载')
      }

      // 使用新的随机诗歌选择器
      const { poem, translation, sentenceResult } = selectRandomPoemAndPrepareTranslation(
        allPoems.value,
        allTranslations.value
      )

      // 更新状态
      currentPoem.value = poem
      currentTranslation.value = translation // 可以是 null
      currentSentenceIndex.value = sentenceResult?.sentenceIndex ?? 0 // 如果为null，默认为0

      // 生成选项
      generateOptionsWithDifficulty()
    } catch (error) {
      console.error('选择随机诗歌失败', error)
      loadError.value = '选择诗歌失败，请重试'
    }
  }

  // 生成备选答案，支持难度调整
  function generateOptionsWithDifficulty() {
    if (!currentPoem.value) return

    // 获取当前选中的句子
    const currentSentence = currentPoem.value.sentence.find(
      s => s.senid === currentSentenceIndex.value
    )
    if (!currentSentence) return

    // 获取所有诗句用于生成选项
    const allSentences = getAllSentences()

    // 使用带难度级别的选项生成器
    options.value = generateOptionsByDifficulty(
      currentSentence.content,
      4, // 生成4个选项
      allSentences,
      currentDifficulty.value
    )
  }

  // 检查答案
  function checkAnswer(selectedLine: string): boolean {
    const correctOption = options.value.find(opt => opt.isCorrect)
    return selectedLine === correctOption?.value
  }

  return {
    currentPoem,
    currentTranslation,
    currentSentenceIndex,
    displayContent,
    hasImage,
    imagePath,
    options,
    isLoading,
    loadError,
    currentDifficulty,
    initialize,
    selectRandomPoem,
    checkAnswer,
    generateOptionsWithDifficulty,
  }
})
