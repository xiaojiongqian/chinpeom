import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Poem, TranslatedPoem, PoemOption } from '@/types/poem'
import { 
  loadPoemData as loadPoemDataUtil, 
  getRandomPoemWithTranslation, 
  generateOptions as generatePoemOptions,
  LanguageType
} from '@/utils/poemData'
import { getPoemImageUrl } from '@/utils/api'

export const usePoemStore = defineStore('poem', () => {
  // 状态
  const currentPoem = ref<Poem | null>(null)
  const currentTranslation = ref<TranslatedPoem | null>(null)
  const displayLanguage = ref<Exclude<LanguageType, 'chinese'>>('english')
  const currentSentenceIndex = ref<number>(0)
  const options = ref<PoemOption[]>([])
  const isLoading = ref(true)
  const loadError = ref<string | null>(null)
  
  // 计算属性
  const hasImage = computed(() => {
    return currentPoem.value !== null && currentPoem.value.id !== ''
  })
  
  const imagePath = computed(() => {
    if (!hasImage.value) return ''
    return getPoemImageUrl(currentPoem.value!.id)
  })
  
  // 获取当前显示的诗句（包含替换的外语）
  const displayContent = computed(() => {
    if (!currentPoem.value) return []
    
    return currentPoem.value.sentence.map((sen) => {
      if (sen.senid === currentSentenceIndex.value && currentTranslation.value) {
        const translatedSentence = currentTranslation.value.sentence.find(ts => ts.senid === sen.senid)
        return translatedSentence ? translatedSentence.content : sen.content
      }
      return sen.content
    })
  })
  
  // 方法
  // 初始化诗歌数据
  async function initialize() {
    isLoading.value = true
    loadError.value = null
    
    try {
      // 加载中文和当前显示语言的诗歌数据
      await loadPoemDataUtil(['chinese', displayLanguage.value])
      // 初始化后选择一首随机诗
      selectRandomPoem()
      isLoading.value = false
    } catch (error) {
      console.error('初始化诗歌数据失败', error)
      loadError.value = '加载诗歌数据失败，请刷新页面重试'
      isLoading.value = false
    }
  }
  
  // 随机选择一首诗
  function selectRandomPoem() {
    try {
      // 获取随机诗歌和其翻译
      const { poem, translated } = getRandomPoemWithTranslation(displayLanguage.value)
      currentPoem.value = poem
      currentTranslation.value = translated
      
      // 随机选择一句进行替换
      selectRandomSentence()
      
      // 生成选项
      generateOptions()
    } catch (error) {
      console.error('选择随机诗歌失败', error)
      loadError.value = '选择诗歌失败，请重试'
    }
  }
  
  // 随机选择一句进行替换
  function selectRandomSentence() {
    if (!currentPoem.value) return
    
    const randomIndex = Math.floor(Math.random() * currentPoem.value.sentence.length)
    currentSentenceIndex.value = currentPoem.value.sentence[randomIndex].senid
  }
  
  // 生成备选答案
  function generateOptions() {
    if (!currentPoem.value) return
    
    // 获取当前选中的句子
    const currentSentence = currentPoem.value.sentence.find(s => s.senid === currentSentenceIndex.value)
    if (!currentSentence) return
    
    // 生成选项（包含正确答案和干扰项）
    options.value = generatePoemOptions(currentSentence.content, 4)
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
      await loadPoemDataUtil(['chinese', language])
      // 重新选择随机诗歌
      selectRandomPoem()
      isLoading.value = false
    } catch (error) {
      console.error(`加载${language}翻译失败`, error)
      loadError.value = `加载${language}翻译失败，请重试`
      isLoading.value = false
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
    initialize,
    selectRandomPoem,
    checkAnswer,
    setDisplayLanguage
  }
}) 