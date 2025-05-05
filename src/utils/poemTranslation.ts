/**
 * 诗歌数据类型定义
 */
export interface PoemSentence {
  senid: number;
  content: string;
}

export interface Poem {
  id: string;
  title: string;
  author: string;
  sentence: PoemSentence[];
}

export type LanguageCode = 'chinese' | 'english' | 'spanish' | 'french' | 'german' | 'japanese';

/**
 * 加载指定语言的诗歌数据
 * @param language 语言代码
 * @returns 诗歌数据数组
 */
export async function loadPoemData(language: LanguageCode): Promise<Poem[]> {
  // 直接使用相对路径，Vite会正确处理静态资源
  const url = `/resource/data/poem_${language}.json`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('无法加载诗歌数据');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`加载${language}诗歌数据失败:`, error);
    throw new Error('无法加载诗歌数据');
  }
}

/**
 * 获取指定诗句的翻译
 */
export async function getTranslatedSentence({
  poemId,
  sentenceId,
  fromLang,
  toLang,
  loadPoemDataFn = loadPoemData
}: {
  poemId: string;
  sentenceId: number;
  fromLang: LanguageCode;
  toLang: LanguageCode;
  loadPoemDataFn?: typeof loadPoemData;
}): Promise<{ original: string; translated: string }> {
  // 加载原语言诗歌数据
  const fromPoems = await loadPoemDataFn(fromLang);
  
  // 查找原诗歌
  const fromPoem = fromPoems.find(poem => poem.id === poemId);
  if (!fromPoem) {
    throw new Error('找不到指定的诗歌');
  }
  
  // 查找原句子
  const fromSentence = fromPoem.sentence.find(s => s.senid === sentenceId);
  if (!fromSentence) {
    throw new Error('找不到指定的诗句');
  }
  
  // 加载目标语言诗歌数据
  const toPoems = await loadPoemDataFn(toLang);
  
  // 查找目标诗歌
  const toPoem = toPoems.find(poem => poem.id === poemId);
  if (!toPoem) {
    throw new Error('找不到对应的翻译诗歌');
  }
  
  // 查找目标句子
  const toSentence = toPoem.sentence.find(s => s.senid === sentenceId);
  if (!toSentence) {
    throw new Error('找不到对应的翻译诗句');
  }
  
  return {
    original: fromSentence.content,
    translated: toSentence.content
  };
}

/**
 * 从一首诗中随机选择一句
 * @param poem 诗歌对象
 * @returns 选择的句子信息
 */
export function selectRandomSentence(poem: Poem): { poemId: string; sentenceId: number; sentenceContent: string } {
  if (!poem.sentence || poem.sentence.length === 0) {
    throw new Error('诗歌没有句子可供选择');
  }
  
  // 随机选择一句
  const randomIndex = Math.floor(Math.random() * poem.sentence.length);
  const selectedSentence = poem.sentence[randomIndex];
  
  return {
    poemId: poem.id,
    sentenceId: selectedSentence.senid,
    sentenceContent: selectedSentence.content
  };
}

/**
 * 准备带有外语翻译的诗歌展示数据
 * @param poem 原始诗歌对象（中文）
 * @param targetLang 目标语言
 * @returns 带有翻译的诗歌展示数据
 */
export async function preparePoemWithTranslation(
  poem: Poem, 
  targetLang: LanguageCode
): Promise<{
  poem: Poem;
  translatedSentence: {
    sentenceId: number;
    original: string;
    translated: string;
  }
}> {
  // 随机选择一句进行翻译
  const selectedSentence = selectRandomSentence(poem);
  
  // 获取翻译
  const translation = await getTranslatedSentence({
    poemId: poem.id,
    sentenceId: selectedSentence.sentenceId,
    fromLang: 'chinese',
    toLang: targetLang
  });
  
  return {
    poem,
    translatedSentence: {
      sentenceId: selectedSentence.sentenceId,
      original: translation.original,
      translated: translation.translated
    }
  };
} 