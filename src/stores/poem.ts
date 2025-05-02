import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string[];
}

export interface TranslatedPoem {
  id: number;
  translations: string[];
}

export const usePoemStore = defineStore('poem', () => {
  // 状态
  const currentPoem = ref<Poem | null>(null)
  const currentTranslation = ref<TranslatedPoem | null>(null)
  const displayLanguage = ref<string>('english')
  const currentLineIndex = ref<number>(0)
  const allPoems = ref<Poem[]>([])
  const allTranslations = ref<Record<string, TranslatedPoem[]>>({})
  const selectedOptions = ref<string[]>([])
  const correctOption = ref<string>('')
  
  // 计算属性
  const hasImage = computed(() => {
    return currentPoem.value !== null && currentPoem.value.id > 0
  })
  
  const imagePath = computed(() => {
    if (!hasImage.value) return ''
    return `/resource/images/${currentPoem.value!.id}.jpg`
  })
  
  // 获取当前显示的诗句（包含替换的外语）
  const displayContent = computed(() => {
    if (!currentPoem.value) return []
    
    return currentPoem.value.content.map((line, index) => {
      if (index === currentLineIndex.value && currentTranslation.value) {
        return currentTranslation.value.translations[index]
      }
      return line
    })
  })
  
  // 方法
  // 加载所有诗歌数据
  async function loadAllPoems() {
    try {
      const response = await fetch('/resource/poem_chinese.json')
      allPoems.value = await response.json()
    } catch (error) {
      console.error('加载诗歌数据失败', error)
    }
  }
  
  // 加载指定语言的翻译
  async function loadTranslations(language: string) {
    if (allTranslations.value[language]) return
    
    try {
      const response = await fetch(`/resource/poem_${language}.json`)
      allTranslations.value[language] = await response.json()
    } catch (error) {
      console.error(`加载${language}翻译失败`, error)
    }
  }
  
  // 随机选择一首诗
  function selectRandomPoem() {
    if (allPoems.value.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * allPoems.value.length)
    currentPoem.value = allPoems.value[randomIndex]
    
    // 随机选择一行进行替换
    selectRandomLine()
    
    // 获取对应的翻译
    if (allTranslations.value[displayLanguage.value]) {
      currentTranslation.value = allTranslations.value[displayLanguage.value].find(
        t => t.id === currentPoem.value!.id
      ) || null
    }
    
    // 生成选项
    generateOptions()
  }
  
  // 随机选择一行进行替换
  function selectRandomLine() {
    if (!currentPoem.value) return
    
    currentLineIndex.value = Math.floor(Math.random() * currentPoem.value.content.length)
  }
  
  // 生成备选答案
  function generateOptions() {
    if (!currentPoem.value) return
    
    // 正确选项
    correctOption.value = currentPoem.value.content[currentLineIndex.value]
    
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
      .flatMap(poem => poem.content)
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
  function setDisplayLanguage(language: string) {
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
    currentLineIndex,
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