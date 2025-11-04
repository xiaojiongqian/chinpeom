import type { Poem, TranslatedPoem, DifficultyMode, SupportedLanguage } from '@/types'

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
 * 创建要显示的诗句内容
 * @param poem - 当前诗歌
 * @param translation - 当前诗歌的翻译
 * @param sentenceIndex - 当前句子的索引
 * @param difficulty - 当前难度
 * @param language - 当前界面语言
 * @returns 包含要显示的诗句的字符串数组
 */
export function createDisplayContent(
  poem: Poem | null,
  translation: TranslatedPoem | null,
  sentenceIndex: number,
  difficulty: DifficultyMode = 'easy',
  language: SupportedLanguage = 'chinese'
): string[] | null {
  if (!poem) return null

  const displayLines = poem.sentence.map(s => s.content)

  if (sentenceIndex < 0 || sentenceIndex >= displayLines.length) {
    return displayLines
  }

  // 困难模式：用星号替换
  if (difficulty === 'hard') {
    displayLines[sentenceIndex] = '***'
    return displayLines
  }

  // 简单模式
  // 如果是中文模式下的简单模式，则使用英文翻译
  if (language === 'chinese' && difficulty === 'easy') {
    if (translation && translation.sentence && sentenceIndex < translation.sentence.length) {
      displayLines[sentenceIndex] = translation.sentence[sentenceIndex].content
    } else {
      // 降级处理：如果没有翻译，显示星号
      displayLines[sentenceIndex] = '***'
    }
    return displayLines
  }

  // 其他语言的简单模式
  if (translation && translation.sentence && sentenceIndex < translation.sentence.length) {
    displayLines[sentenceIndex] = translation.sentence[sentenceIndex].content
  }

  return displayLines
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
