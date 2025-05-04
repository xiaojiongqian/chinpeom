import { describe, it, expect, beforeAll } from 'vitest';
import { 
  loadPoemData, 
  loadTranslationData, 
  getPoemById, 
  getRandomPoem, 
  getLanguages, 
  cachePoemData,
  getCachedPoemData
} from '../../src/utils/poemData';
import type { Poem, PoemLanguage } from '../../src/types';

describe('诗歌数据处理测试', () => {
  beforeAll(async () => {
    // 在所有测试开始前加载数据
    await loadPoemData();
  });

  it('应该能够成功加载中文诗歌数据', async () => {
    const poemData = await loadPoemData();
    expect(poemData).toBeDefined();
    expect(Array.isArray(poemData)).toBe(true);
    expect(poemData.length).toBeGreaterThan(0);
    
    // 检查诗歌数据结构
    const firstPoem = poemData[0];
    expect(firstPoem).toHaveProperty('id');
    expect(firstPoem).toHaveProperty('title');
    expect(firstPoem).toHaveProperty('author');
    expect(firstPoem).toHaveProperty('sentence');
    expect(Array.isArray(firstPoem.sentence)).toBe(true);
  });

  it('应该能够成功加载翻译数据', async () => {
    const languages: PoemLanguage[] = ['english', 'french', 'german', 'japanese', 'spanish'];
    
    for (const lang of languages) {
      const translationData = await loadTranslationData(lang);
      expect(translationData).toBeDefined();
      expect(Array.isArray(translationData)).toBe(true);
      expect(translationData.length).toBeGreaterThan(0);
      
      // 检查翻译数据结构
      const firstTranslation = translationData[0];
      expect(firstTranslation).toHaveProperty('id');
      expect(firstTranslation).toHaveProperty('sentence');
    }
  });

  it('应该能够根据ID获取特定诗歌', async () => {
    const poemData = await loadPoemData();
    const firstPoemId = poemData[0].id;
    
    const poem = await getPoemById(firstPoemId);
    expect(poem).toBeDefined();
    expect(poem?.id).toBe(firstPoemId);
  });

  it('应该能够获取随机诗歌', async () => {
    const randomPoem = await getRandomPoem();
    expect(randomPoem).toBeDefined();
    expect(randomPoem).toHaveProperty('id');
    expect(randomPoem).toHaveProperty('title');
    expect(randomPoem).toHaveProperty('author');
    expect(randomPoem).toHaveProperty('sentence');
  });

  it('应该能够获取支持的语言列表', () => {
    const languages = getLanguages();
    expect(languages).toBeDefined();
    expect(Array.isArray(languages)).toBe(true);
    expect(languages).toContain('english');
    expect(languages).toContain('chinese');
  });

  it('应该能够缓存和获取缓存的诗歌数据', async () => {
    const poemData = await loadPoemData();
    cachePoemData('chinese', poemData);
    
    const cachedData = getCachedPoemData('chinese');
    expect(cachedData).toBeDefined();
    expect(cachedData).toEqual(poemData);
  });
}); 