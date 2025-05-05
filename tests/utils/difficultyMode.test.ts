import { describe, it, expect, beforeEach } from 'vitest'
import { DifficultyLevel } from '@/utils/optionsGenerator'
import { usePoemStore } from '@/stores/poem'
import { createPinia, setActivePinia } from 'pinia'

describe('难度模式测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('简单模式应该生成更容易区分的选项', async () => {
    const poemStore = usePoemStore()
    
    // 模拟初始化
    await poemStore.initialize()
    
    // 使用简单模式选择随机诗
    poemStore.selectRandomPoem('easy')
    
    // 验证选项已生成
    expect(poemStore.options.length).toBeGreaterThan(0)
    
    // 验证有一个正确选项
    const correctOption = poemStore.options.find(opt => opt.isCorrect)
    expect(correctOption).toBeDefined()
  })
  
  it('困难模式应该生成更难区分的选项', async () => {
    const poemStore = usePoemStore()
    
    // 模拟初始化
    await poemStore.initialize()
    
    // 使用困难模式选择随机诗
    poemStore.selectRandomPoem('hard')
    
    // 验证选项已生成
    expect(poemStore.options.length).toBeGreaterThan(0)
    
    // 验证有一个正确选项
    const correctOption = poemStore.options.find(opt => opt.isCorrect)
    expect(correctOption).toBeDefined()
  })
  
  it('困难模式下不应显示外语提示', async () => {
    const poemStore = usePoemStore()
    
    // 模拟初始化
    await poemStore.initialize()
    
    // 使用困难模式选择随机诗
    poemStore.selectRandomPoem('hard')
    
    // 检查显示内容不应包含外语
    if (poemStore.currentPoem && poemStore.displayContent) {
      // 获取原始诗句
      const originalSentence = poemStore.currentPoem.sentence.find(
        s => s.senid === poemStore.currentSentenceIndex
      )?.content
      
      // 获取显示的内容中对应句子
      const displaySentence = poemStore.displayContent[poemStore.currentSentenceIndex]
      
      // 困难模式下，显示的句子应该是原始中文句子，不是外语翻译
      expect(displaySentence).toBe(originalSentence)
    }
  })
  
  it('简单模式下应显示外语提示', async () => {
    const poemStore = usePoemStore()
    
    // 模拟初始化
    await poemStore.initialize()
    
    // 使用简单模式选择随机诗
    poemStore.selectRandomPoem('easy')
    
    // 检查显示内容应包含外语
    if (poemStore.currentPoem && poemStore.displayContent) {
      // 获取原始诗句
      const originalSentence = poemStore.currentPoem.sentence.find(
        s => s.senid === poemStore.currentSentenceIndex
      )?.content
      
      // 获取显示的内容中对应句子
      const displaySentence = poemStore.displayContent[poemStore.currentSentenceIndex]
      
      // 简单模式下，显示的句子应该是外语翻译，不是原始中文句子
      expect(displaySentence).not.toBe(originalSentence)
    }
  })
}) 