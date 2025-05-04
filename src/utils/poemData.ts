import type { Poem, TranslatedPoem, PoemLanguage, PoemOption } from '../types';
import { loadJsonFile } from './fileLoader';

// 支持的语言类型
export type LanguageType = 'chinese' | 'english' | 'french' | 'german' | 'japanese' | 'spanish';

// 存储加载的诗歌数据
interface PoemDataStore {
  chinese: Poem[];
  english: TranslatedPoem[];
  french: TranslatedPoem[];
  german: TranslatedPoem[];
  japanese: TranslatedPoem[];
  spanish: TranslatedPoem[];
  [key: string]: any; // 使用any来避免类型限制，但在具体函数中进行类型安全处理
}

// 诗歌数据存储
let poemData: PoemDataStore = {
  chinese: [],
  english: [],
  french: [],
  german: [],
  japanese: [],
  spanish: []
};

// 缓存记录，记录已加载的语言
const loadedLanguages: Set<LanguageType> = new Set();

// 是否已初始化
let isInitialized = false;

/**
 * 清除诗歌数据缓存
 */
export function clearPoemCache(): void {
  poemData = {
    chinese: [],
    english: [],
    french: [],
    german: [],
    japanese: [],
    spanish: []
  };
  loadedLanguages.clear();
  isInitialized = false;
}

/**
 * 加载诗歌数据
 * @param languages 需要加载的语言列表
 * @returns 加载后的诗歌数据
 */
export async function loadPoemData(languages: LanguageType[] = ['chinese']): Promise<PoemDataStore> {
  try {
    // 过滤出未加载的语言
    const languagesToLoad = languages.filter(lang => !loadedLanguages.has(lang));
    
    if (languagesToLoad.length > 0) {
      const loadPromises = languagesToLoad.map(async (lang) => {
        const filePath = `/resource/data/poem_${lang}.json`;
        if (lang === 'chinese') {
          const data = await loadJsonFile<Poem[]>(filePath);
          poemData[lang] = data;
        } else {
          const data = await loadJsonFile<TranslatedPoem[]>(filePath);
          poemData[lang] = data;
        }
        // 记录该语言已加载
        loadedLanguages.add(lang);
      });

      await Promise.all(loadPromises);
    }
    
    isInitialized = true;
    return poemData;
  } catch (error) {
    console.error('加载诗歌数据失败:', error);
    throw error;
  }
}

/**
 * 确保数据已初始化
 */
function ensureInitialized() {
  if (!isInitialized) {
    throw new Error('诗歌数据未初始化，请先调用 loadPoemData');
  }
}

/**
 * 根据ID获取中文诗歌
 * @param id 诗歌ID
 * @returns 诗歌对象，如果未找到返回undefined
 */
export function getPoemById(id: string): Poem | undefined {
  ensureInitialized();
  return poemData.chinese.find(poem => poem.id === id) as Poem | undefined;
}

/**
 * 根据ID获取翻译的诗歌
 * @param id 诗歌ID
 * @param language 语言类型
 * @returns 翻译的诗歌对象，如果未找到返回undefined
 */
export function getTranslatedPoemById(id: string, language: Exclude<LanguageType, 'chinese'>): TranslatedPoem | undefined {
  ensureInitialized();
  return poemData[language].find(poem => poem.id === id) as TranslatedPoem | undefined;
}

/**
 * 获取随机诗歌及其翻译
 * @param language 翻译语言
 * @returns 包含原诗和翻译的对象
 */
export function getRandomPoemWithTranslation(language: Exclude<LanguageType, 'chinese'>) {
  ensureInitialized();
  
  // 获取随机索引
  const randomIndex = Math.floor(Math.random() * poemData.chinese.length);
  
  // 获取原诗
  const poem = poemData.chinese[randomIndex] as Poem;
  
  // 获取翻译
  const translated = poemData[language].find(p => p.id === poem.id) as TranslatedPoem;
  
  if (!translated) {
    throw new Error(`未找到ID为 ${poem.id} 的 ${language} 翻译`);
  }
  
  return { poem, translated };
}

/**
 * 获取所有中文诗歌
 * @returns 所有加载的中文诗歌
 */
export function getAllPoems(): Poem[] {
  ensureInitialized();
  return [...poemData.chinese] as Poem[];
}

/**
 * 获取所有诗句内容
 * @returns 所有诗句内容组成的数组
 */
export function getAllSentences(): string[] {
  ensureInitialized();
  return (poemData.chinese as Poem[]).flatMap(poem => 
    poem.sentence.map(s => s.content)
  );
}

/**
 * 生成选项列表，包含一个正确选项和多个干扰选项
 * @param correctSentence 正确的诗句
 * @param count 选项总数
 * @returns 选项列表
 */
export function generateOptions(correctSentence: string, count: number): PoemOption[] {
  ensureInitialized();
  
  // 获取所有可能的诗句
  const allSentences = getAllSentences();
  
  // 获取干扰选项（长度相近的句子）
  const correctLength = correctSentence.length;
  const similarSentences = allSentences
    .filter(sentence => 
      sentence !== correctSentence && 
      Math.abs(sentence.length - correctLength) <= 2
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);
  
  // 创建选项对象
  const options: PoemOption[] = [
    { value: correctSentence, label: correctSentence, isCorrect: true },
    ...similarSentences.map(sentence => ({
      value: sentence,
      label: sentence,
      isCorrect: false
    }))
  ];
  
  // 随机打乱选项顺序
  return shuffleArray(options);
}

/**
 * 随机打乱数组顺序
 * @param array 要打乱的数组
 * @returns 打乱后的数组
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
} 