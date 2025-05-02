/**
 * 唐诗译境（Chinpoem）全局类型定义
 */

/**
 * 用户信息
 */
export interface User {
  id: number;
  username: string;
  score: number;
  language: string;
}

/**
 * 诗歌信息
 */
export interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string[];
}

/**
 * 诗歌翻译
 */
export interface TranslatedPoem {
  id: number;
  translations: string[];
}

/**
 * 支持的语言类型
 */
export type SupportedLanguage = 'english' | 'french' | 'spanish' | 'german' | 'japanese';

/**
 * 古代学级称号
 */
export type AcademicRank = 
  | '白丁' 
  | '学童' 
  | '秀才' 
  | '廪生' 
  | '贡生' 
  | '举人' 
  | '贡士' 
  | '进士' 
  | '探花' 
  | '榜眼' 
  | '状元';

/**
 * 得分与学级称号映射
 */
export const RANK_SCORE_MAPPING: Record<AcademicRank, {min: number, max: number}> = {
  '白丁': {min: 0, max: 10},
  '学童': {min: 11, max: 25},
  '秀才': {min: 26, max: 45},
  '廪生': {min: 46, max: 70},
  '贡生': {min: 71, max: 100},
  '举人': {min: 101, max: 135},
  '贡士': {min: 136, max: 175},
  '进士': {min: 176, max: 220},
  '探花': {min: 221, max: 280},
  '榜眼': {min: 281, max: 340},
  '状元': {min: 341, max: Infinity}
};

/**
 * 语言设置选项
 */
export interface LanguageOption {
  value: SupportedLanguage;
  label: string;
}

/**
 * 答题结果
 */
export interface AnswerResult {
  correct: boolean;
  correctLine: string;
  selectedLine: string;
  poem: Poem;
  lineIndex: number;
}

/**
 * 路由元数据
 */
export interface RouteMetadata {
  requiresAuth?: boolean;
  title?: string;
}

/**
 * 应用设置
 */
export interface AppSettings {
  language: SupportedLanguage;
  theme?: 'light' | 'dark';
  soundEffects?: boolean;
}

/**
 * 历史记录项
 */
export interface HistoryItem {
  date: string;
  poem: Poem;
  correct: boolean;
  score: number;
  lineIndex: number;
} 