import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Poem, TranslatedPoem, Sentence, SupportedLanguage } from '../types'
import { loadPoemData, getPoemImageUrl, LanguageType } from '../utils/api'

export const usePoemStore = defineStore('poem', () => {
  // 状态
  const currentPoem = ref<Poem | null>(null)
  const currentTranslation = ref<TranslatedPoem | null>(null)
  const displayLanguage = ref<SupportedLanguage>('english')
  const currentSentenceIndex = ref<number>(0)
  const allPoems = ref<Poem[]>([])
  const allTranslations = ref<Record<string, TranslatedPoem[]>>({})
  const selectedOptions = ref<string[]>([])
  const correctOption = ref<string>('')
  
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
  // 加载所有诗歌数据
  async function loadAllPoems() {
    try {
      allPoems.value = await loadPoemData('chinese') as Poem[]
    } catch (error) {
      console.error('加载诗歌数据失败', error)
    }
  }
  
  // 加载指定语言的翻译
  async function loadTranslations(language: SupportedLanguage) {
    if (allTranslations.value[language]) return
    
    try {
      allTranslations.value[language] = await loadPoemData(language as LanguageType) as TranslatedPoem[]
    } catch (error) {
      console.error(`加载${language}翻译失败`, error)
    }
  }
  
  // 随机选择一首诗
  function selectRandomPoem() {
    if (allPoems.value.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * allPoems.value.length)
    currentPoem.value = allPoems.value[randomIndex]
    
    // 随机选择一句进行替换
    selectRandomSentence()
    
    // 获取对应的翻译
    if (allTranslations.value[displayLanguage.value]) {
      currentTranslation.value = allTranslations.value[displayLanguage.value].find(
        t => t.id === currentPoem.value!.id
      ) || null
    }
    
    // 生成选项
    generateOptions()
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
    
    // 正确选项
    correctOption.value = currentSentence.content
    
    // 生成3个干扰选项
    const distractors = generateDistractors(correctOption.value, 3)
    
    // 合并选项并随机排序
    selectedOptions.value = [correctOption.value, ...distractors]
    shuffleArray(selectedOptions.value)
  }
  
  // 生成干扰选项
  function generateDistractors(correctLine: string, count: number): string[] {
    // 获取相似长度的诗句
    const similarLengthLines = allPoems.value
      .flatMap(poem => poem.sentence.map(s => s.content))
      .filter(line => {
        // 排除正确答案
        if (line === correctLine) return false
        
        // 选择长度相近的诗句（±3个字）
        const lengthDiff = Math.abs(line.length - correctLine.length)
        return lengthDiff <= 3
      })
    
    // 如果找不到足够的干扰项，使用所有可用的
    if (similarLengthLines.length <= count) {
      return similarLengthLines
    }
    
    // 随机选择count个干扰项
    const distractors: string[] = []
    while (distractors.length < count && similarLengthLines.length > 0) {
      const randomIndex = Math.floor(Math.random() * similarLengthLines.length)
      const line = similarLengthLines.splice(randomIndex, 1)[0]
      distractors.push(line)
    }
    
    return distractors
  }
  
  // 检查答案
  function checkAnswer(selectedLine: string): boolean {
    return selectedLine === correctOption.value
  }
  
  // 设置显示语言
  function setDisplayLanguage(language: SupportedLanguage) {
    displayLanguage.value = language
    loadTranslations(language)
    
    // 如果当前有诗歌，更新翻译
    if (currentPoem.value && allTranslations.value[language]) {
      currentTranslation.value = allTranslations.value[language].find(
        t => t.id === currentPoem.value!.id
      ) || null
    }
  }
  
  // 打乱数组顺序（Fisher-Yates算法）
  function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  // 初始化
  function init() {
    loadAllPoems()
    loadTranslations(displayLanguage.value)
  }
  
  return {
    currentPoem,
    currentTranslation,
    displayLanguage,
    currentSentenceIndex,
    displayContent,
    hasImage,
    imagePath,
    selectedOptions,
    correctOption,
    loadAllPoems,
    loadTranslations,
    selectRandomPoem,
    checkAnswer,
    setDisplayLanguage,
    init
  }
}) 