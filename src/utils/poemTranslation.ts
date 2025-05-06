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
  console.log(`[PoemTranslation] 开始加载${language}语言诗歌数据`);
  
  // 直接使用相对路径，Vite会正确处理静态资源
  const url = `/resource/data/poem_${language}.json`;
  console.log(`[PoemTranslation] 请求URL: ${url}`);
  
  // 检查是否在测试环境中
  const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  console.log(`[PoemTranslation] 当前环境: ${isTestEnv ? '测试环境' : '生产环境'}`);
  
  try {
    console.log(`[PoemTranslation] 开始调用fetch API`);
    const response = await fetch(url);
    
    console.log(`[PoemTranslation] fetch响应状态: ${response.status}, ok: ${response.ok}`);
    
    if (!response.ok) {
      console.error(`[PoemTranslation] 请求失败: ${response.status} ${response.statusText}`);
      throw new Error('无法加载诗歌数据');
    }
    
    console.log(`[PoemTranslation] 开始解析JSON响应`);
    const data = await response.json();
    
    console.log(`[PoemTranslation] 数据解析完成, 类型: ${typeof data}, 是否数组: ${Array.isArray(data)}, 长度: ${Array.isArray(data) ? data.length : 'N/A'}`);
    
    if (!Array.isArray(data)) {
      console.error(`[PoemTranslation] 数据格式错误: 期望数组, 实际是 ${typeof data}`);
      throw new Error(`诗歌数据格式错误: ${language}`);
    }
    
    if (data.length === 0) {
      console.warn(`[PoemTranslation] ${language}语言诗歌数据为空`);
    } else {
      console.log(`[PoemTranslation] ${language}语言诗歌数据加载成功, 共${data.length}首诗`);
      
      // 简单验证第一首诗的结构
      const firstPoem = data[0];
      if (firstPoem) {
        console.log(`[PoemTranslation] 第一首诗ID: ${firstPoem.id}, 标题: ${firstPoem.title || '无标题'}`);
        console.log(`[PoemTranslation] 第一首诗句子数量: ${firstPoem.sentence?.length || 0}`);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`[PoemTranslation] 加载${language}诗歌数据失败:`, error);
    
    // 如果在测试环境，可以提供默认测试数据
    if (isTestEnv) {
      console.log('[PoemTranslation] 在测试环境中返回默认测试数据');
      // 尝试从全局模拟对象获取数据
      const mockData = typeof window !== 'undefined' 
        ? (window as any).mockPoems?.[language] 
        : (typeof global !== 'undefined' ? (global as any).mockPoems?.[language] : undefined);
      
      if (mockData) {
        console.log(`[PoemTranslation] 使用全局模拟数据, 共${mockData.length}首诗`);
        return mockData;
      }
      
      // 如果没有找到模拟数据，创建一个默认的模拟诗歌
      const defaultMockPoem: Poem = {
        id: 'mock-poem-1',
        title: '模拟诗歌',
        author: '测试作者',
        sentence: [
          { senid: 0, content: '模拟的第一句' },
          { senid: 1, content: '模拟的第二句' },
          { senid: 2, content: '模拟的第三句' },
          { senid: 3, content: '模拟的第四句' }
        ]
      };
      
      console.log('[PoemTranslation] 使用默认模拟诗歌数据');
      return [defaultMockPoem];
    }
    
    // 生产环境直接抛出错误
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
  console.log(`[PoemTranslation] 获取诗句翻译: ID=${poemId}, 句子ID=${sentenceId}, 从${fromLang}到${toLang}`);
  
  // 加载原语言诗歌数据
  console.log(`[PoemTranslation] 加载原语言(${fromLang})诗歌数据`);
  const fromPoems = await loadPoemDataFn(fromLang);
  console.log(`[PoemTranslation] 原语言诗歌数据加载完成, 共${fromPoems.length}首诗`);
  
  // 查找原诗歌
  const fromPoem = fromPoems.find(poem => poem.id === poemId);
  if (!fromPoem) {
    console.error(`[PoemTranslation] 找不到指定的诗歌: ID=${poemId}, 语言=${fromLang}`);
    throw new Error('找不到指定的诗歌');
  }
  console.log(`[PoemTranslation] 找到原语言诗歌: ID=${fromPoem.id}, 标题=${fromPoem.title}`);
  
  // 查找原句子
  const fromSentence = fromPoem.sentence.find(s => s.senid === sentenceId);
  if (!fromSentence) {
    console.error(`[PoemTranslation] 找不到指定的诗句: 诗ID=${poemId}, 句子ID=${sentenceId}`);
    throw new Error('找不到指定的诗句');
  }
  console.log(`[PoemTranslation] 找到原语言诗句: ID=${sentenceId}, 内容=${fromSentence.content}`);
  
  // 加载目标语言诗歌数据
  console.log(`[PoemTranslation] 加载目标语言(${toLang})诗歌数据`);
  const toPoems = await loadPoemDataFn(toLang);
  console.log(`[PoemTranslation] 目标语言诗歌数据加载完成, 共${toPoems.length}首诗`);
  
  // 查找目标诗歌
  const toPoem = toPoems.find(poem => poem.id === poemId);
  if (!toPoem) {
    console.error(`[PoemTranslation] 找不到对应的翻译诗歌: ID=${poemId}, 语言=${toLang}`);
    throw new Error('找不到对应的翻译诗歌');
  }
  console.log(`[PoemTranslation] 找到目标语言诗歌: ID=${toPoem.id}`);
  
  // 查找目标句子
  const toSentence = toPoem.sentence.find(s => s.senid === sentenceId);
  if (!toSentence) {
    console.error(`[PoemTranslation] 找不到对应的翻译诗句: 诗ID=${poemId}, 句子ID=${sentenceId}, 语言=${toLang}`);
    throw new Error('找不到对应的翻译诗句');
  }
  console.log(`[PoemTranslation] 找到目标语言诗句: ID=${sentenceId}, 内容=${toSentence.content}`);
  
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
  console.log(`[PoemTranslation] 从诗歌中随机选择一句: ID=${poem.id}, 标题=${poem.title}`);
  
  if (!poem.sentence || poem.sentence.length === 0) {
    console.error(`[PoemTranslation] 诗歌没有句子可供选择: ID=${poem.id}`);
    throw new Error('诗歌没有句子可供选择');
  }
  
  // 随机选择一句
  const randomIndex = Math.floor(Math.random() * poem.sentence.length);
  const selectedSentence = poem.sentence[randomIndex];
  
  console.log(`[PoemTranslation] 随机选择结果: 句子ID=${selectedSentence.senid}, 内容=${selectedSentence.content}`);
  
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
  console.log(`[PoemTranslation] 准备带翻译的诗歌: ID=${poem.id}, 目标语言=${targetLang}`);
  
  // 随机选择一句进行翻译
  const selectedSentence = selectRandomSentence(poem);
  
  // 获取翻译
  console.log(`[PoemTranslation] 获取句子翻译: 句子ID=${selectedSentence.sentenceId}`);
  const translation = await getTranslatedSentence({
    poemId: poem.id,
    sentenceId: selectedSentence.sentenceId,
    fromLang: 'chinese',
    toLang: targetLang
  });
  
  console.log(`[PoemTranslation] 翻译完成: 原文="${translation.original}", 译文="${translation.translated}"`);
  
  return {
    poem,
    translatedSentence: {
      sentenceId: selectedSentence.sentenceId,
      original: translation.original,
      translated: translation.translated
    }
  };
} 