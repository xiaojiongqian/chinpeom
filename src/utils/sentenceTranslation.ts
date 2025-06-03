import type { Poem, TranslatedPoem } from '@/types'
import { type DifficultyLevel } from './optionsGenerator'

/**
 * 在翻译中查找指定索引的句子
 * @param translation 翻译对象
 * @param sentenceIndex 句子索引
 * @returns 对应的翻译句子内容，如果未找到则返回null
 */
export function findTranslatedSentence(
  translation: TranslatedPoem | null,
  sentenceIndex: number
): string | null {
  if (!translation) {
    return null
  }

  const sentence = translation.sentence.find(s => s.senid === sentenceIndex)
  return sentence ? sentence.content : null
}

/**
 * 创建显示内容，将指定句子替换为翻译或占位符
 * @param poem 原诗
 * @param translation 翻译
 * @param sentenceIndex 要替换的句子索引
 * @param difficulty 难度级别
 * @returns 包含原句和替换后句子的数组
 */
export function createDisplayContent(
  poem: Poem | null,
  translation: TranslatedPoem | null,
  sentenceIndex: number,
  difficulty: DifficultyLevel = 'normal'
): string[] {
  if (!poem) {
    return []
  }

  return poem.sentence.map(sen => {
    // 如果该句是要替换的句子
    if (sen.senid === sentenceIndex) {
      if (difficulty === 'hard') {
        // 困难模式：显示 "***"
        return '***'
      } else {
        // 简单模式：显示外语翻译，如果找不到翻译则显示 "***"
        const translatedContent = findTranslatedSentence(translation, sentenceIndex)
        return translatedContent || '***'
      }
    }
    
    // 其他句子显示中文原句
    return sen.content
  })
}

/**
 * 创建包含原句和翻译的显示对象
 * @param poem 原诗
 * @param translation 翻译
 * @returns 包含原句和翻译的对象数组
 */
export function createBilingualContent(
  poem: Poem | null,
  translation: TranslatedPoem | null
): Array<{ original: string; translated: string | null }> {
  if (!poem) {
    return []
  }

  return poem.sentence.map(sen => {
    const translatedContent = translation ? findTranslatedSentence(translation, sen.senid) : null

    return {
      original: sen.content,
      translated: translatedContent
    }
  })
}
