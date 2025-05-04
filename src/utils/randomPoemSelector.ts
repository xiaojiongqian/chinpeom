import type { Poem, TranslatedPoem } from '@/types'

/**
 * 从诗歌列表中随机选择一首诗歌
 * @param poems 诗歌列表
 * @returns 随机选择的诗歌
 * @throws 如果诗歌列表为空
 */
export function getRandomPoem(poems: Poem[]): Poem {
  if (poems.length === 0) {
    throw new Error('没有可用的诗歌数据')
  }
  
  // 如果只有一首诗，直接返回
  if (poems.length === 1) {
    return poems[0]
  }
  
  // 随机选择一首诗
  const randomIndex = Math.floor(Math.random() * poems.length)
  return poems[randomIndex]
}

/**
 * 从诗歌中随机选择一句的索引
 * @param poem 诗歌对象
 * @returns 随机选择的句子索引
 * @throws 如果诗歌没有句子
 */
export function chooseRandomSentence(poem: Poem): number {
  if (!poem.sentence || poem.sentence.length === 0) {
    throw new Error('诗歌没有句子')
  }
  
  // 随机选择一句
  const randomIndex = Math.floor(Math.random() * poem.sentence.length)
  return poem.sentence[randomIndex].senid
}

/**
 * 翻译句子结果接口
 */
export interface TranslatedSentenceResult {
  original: string;  // 原句
  translated: string;  // 翻译句
  sentenceIndex: number;  // 句子索引
}

/**
 * 准备翻译的句子
 * @param poem 原诗
 * @param translation 翻译
 * @param sentenceIndex 要翻译的句子索引
 * @returns 翻译结果对象
 * @throws 如果句子索引无效或找不到翻译
 */
export function prepareTranslatedSentence(
  poem: Poem,
  translation: TranslatedPoem,
  sentenceIndex: number
): TranslatedSentenceResult {
  // 检查句子索引是否有效
  const originalSentence = poem.sentence.find(s => s.senid === sentenceIndex)
  if (!originalSentence) {
    throw new Error('无效的句子索引')
  }
  
  // 查找翻译的句子
  const translatedSentence = translation.sentence.find(s => s.senid === sentenceIndex)
  if (!translatedSentence) {
    throw new Error('找不到该句的翻译')
  }
  
  return {
    original: originalSentence.content,
    translated: translatedSentence.content,
    sentenceIndex
  }
}

/**
 * 随机选择诗歌并准备翻译句子
 * @param poems 诗歌列表
 * @param translations 翻译字典，键为诗歌ID
 * @returns 包含选中诗歌、翻译和句子信息的结果
 */
export function selectRandomPoemAndPrepareTranslation(
  poems: Poem[],
  translations: Record<string, TranslatedPoem>
): {
  poem: Poem;
  translation: TranslatedPoem;
  sentenceResult: TranslatedSentenceResult;
} {
  // 随机选择一首诗
  const poem = getRandomPoem(poems)
  
  // 获取该诗的翻译
  const translation = translations[poem.id]
  if (!translation) {
    throw new Error(`找不到诗歌 ${poem.id} 的翻译`)
  }
  
  // 随机选择一句
  const sentenceIndex = chooseRandomSentence(poem)
  
  // 准备翻译结果
  const sentenceResult = prepareTranslatedSentence(poem, translation, sentenceIndex)
  
  return {
    poem,
    translation,
    sentenceResult
  }
} 