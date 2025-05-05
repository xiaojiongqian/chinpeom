import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Poem, TranslatedPoem, PoemOption } from '@/types'
import { 
  loadPoemData as loadPoemDataUtil, 
  generateOptions as generatePoemOptions,
  getAllSentences,
  LanguageType
} from '@/utils/poemData'
import { getPoemImageUrl } from '@/utils/api'
import { 
  selectRandomPoemAndPrepareTranslation,
  type TranslatedSentenceResult 
} from '@/utils/randomPoemSelector'
import { createDisplayContent } from '@/utils/sentenceTranslation'
import { 
  generateOptionsWithDifficulty as generateOptionsByDifficulty, 
  type DifficultyLevel 
} from '@/utils/optionsGenerator'

export const usePoemStore = defineStore('poem', () => {
  // 状态
  const currentPoem = ref<Poem | null>(null)
  const currentTranslation = ref<TranslatedPoem | null>(null)
  const displayLanguage = ref<Exclude<LanguageType, 'chinese'>>('english')
  const currentSentenceIndex = ref<number>(0)
  const options = ref<PoemOption[]>([])
  const isLoading = ref(true)
  const loadError = ref<string | null>(null)
  const allPoems = ref<Poem[]>([])
  const allTranslations = ref<Record<string, TranslatedPoem>>({})
  const currentDifficulty = ref<DifficultyLevel>('normal')
  
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
      currentDifficulty.value
    )
  })
  
  // 方法
  // 初始化诗歌数据
  async function initialize() {
    isLoading.value = true
    loadError.value = null
    
    try {
      // 加载中文和当前显示语言的诗歌数据
      const poemData = await loadPoemDataUtil(['chinese', displayLanguage.value])
      
      // 保存所有诗歌数据
      allPoems.value = [...poemData.chinese]
      
      // 构建翻译字典
      allTranslations.value = {}
      poemData[displayLanguage.value].forEach((poem: TranslatedPoem) => {
        allTranslations.value[poem.id] = poem
      })
      
      // 初始化后选择一首随机诗
      selectRandomPoem()
      isLoading.value = false
    } catch (error) {
      console.error('初始化诗歌数据失败', error)
      loadError.value = '加载诗歌数据失败，请刷新页面重试'
      isLoading.value = false
    }
  }
  
  // 随机选择一首诗，可以指定难度
  function selectRandomPoem(difficulty: DifficultyLevel = 'normal') {
    try {
      if (allPoems.value.length === 0) {
        throw new Error('诗歌数据尚未加载')
      }
      
      // 更新当前难度
      currentDifficulty.value = difficulty
      
      // 使用新的随机诗歌选择器
      const { 
        poem, 
        translation, 
        sentenceResult 
      } = selectRandomPoemAndPrepareTranslation(
        allPoems.value, 
        allTranslations.value
      )
      
      // 更新状态
      currentPoem.value = poem
      currentTranslation.value = translation
      currentSentenceIndex.value = sentenceResult.sentenceIndex
      
      // 生成选项
      generateOptionsWithDifficulty(difficulty)
    } catch (error) {
      console.error('选择随机诗歌失败', error)
      loadError.value = '选择诗歌失败，请重试'
    }
  }
  
  // 生成备选答案，支持难度调整
  function generateOptionsWithDifficulty(difficulty: DifficultyLevel = 'normal') {
    if (!currentPoem.value) return
    
    // 获取当前选中的句子
    const currentSentence = currentPoem.value.sentence.find(s => s.senid === currentSentenceIndex.value)
    if (!currentSentence) return
    
    // 获取所有诗句用于生成选项
    const allSentences = getAllSentences()
    
    // 使用带难度级别的选项生成器
    options.value = generateOptionsByDifficulty(
      currentSentence.content, 
      4, // 生成4个选项
      allSentences,
      difficulty
    )
  }
  
  // 检查答案
  function checkAnswer(selectedLine: string): boolean {
    const correctOption = options.value.find(opt => opt.isCorrect)
    return selectedLine === correctOption?.value
  }
  
  // 设置显示语言
  async function setDisplayLanguage(language: Exclude<LanguageType, 'chinese'>) {
    if (displayLanguage.value === language) return
    
    displayLanguage.value = language
    isLoading.value = true
    
    try {
      // 加载新语言的诗歌数据
      const poemData = await loadPoemDataUtil(['chinese', language])
      
      // 更新翻译字典
      allTranslations.value = {}
      poemData[language].forEach((poem: TranslatedPoem) => {
        allTranslations.value[poem.id] = poem
      })
      
      // 重新选择随机诗歌
      selectRandomPoem(currentDifficulty.value)
      isLoading.value = false
    } catch (error) {
      console.error(`加载${language}翻译失败`, error)
      loadError.value = `加载${language}翻译失败，请重试`
      isLoading.value = false
    }
  }
  
  // 设置难度
  function setDifficulty(difficulty: DifficultyLevel) {
    if (currentDifficulty.value !== difficulty) {
      currentDifficulty.value = difficulty
      // 以新的难度重新选择诗歌
      selectRandomPoem(difficulty)
    }
  }
  
  return {
    currentPoem,
    currentTranslation,
    displayLanguage,
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
    setDisplayLanguage,
    generateOptionsWithDifficulty,
    setDifficulty
  }
}) 