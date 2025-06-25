/**
 * 唐诗译境（Chinpoem）全局类型定义
 */

/**
 * 用户信息
 */
export interface User {
  id: number
  username: string
  score: number
  language: string
}

/**
 * 诗句信息
 */
export interface Sentence {
  senid: number
  content: string
}

/**
 * 诗歌信息
 */
export interface PoemSentence {
  senid: number
  content: string
}

export interface Poem {
  id: string
  title: string
  author: string
  sentence: PoemSentence[]
}

/**
 * 诗歌翻译
 */
export interface TranslatedPoem {
  id: string
  title?: string
  author?: string
  sentence: PoemSentence[]
}

/**
 * 支持的语言类型
 */
export type Language = 'chinese' | 'english' | 'french' | 'spanish' | 'german' | 'japanese'

/**
 * 提示语言类型，可以是支持的语言或'none'
 */
export type HintLanguage = Language | 'none'

/**
 * 统一的语言类型，用于应用状态管理
 */
export type SupportedLanguage = 'chinese' | 'english' | 'french' | 'spanish' | 'german' | 'japanese'

/**
 * 难度模式类型
 */
export type DifficultyMode = 'easy' | 'hard'

/**
 * 古代学级称号翻译键
 */
export type AcademicRank =
  | 'rank.baiDing'
  | 'rank.xueTong'
  | 'rank.xiuCai'
  | 'rank.linSheng'
  | 'rank.gongSheng'
  | 'rank.juRen'
  | 'rank.gongShi'
  | 'rank.jinShi'
  | 'rank.tanHua'
  | 'rank.bangYan'
  | 'rank.zhuangYuan'

/**
 * 得分与学级称号映射
 */
export const RANK_SCORE_MAPPING: Record<AcademicRank, { min: number; max: number }> = {
  'rank.baiDing': { min: 0, max: 10 },
  'rank.xueTong': { min: 11, max: 25 },
  'rank.xiuCai': { min: 26, max: 45 },
  'rank.linSheng': { min: 46, max: 70 },
  'rank.gongSheng': { min: 71, max: 100 },
  'rank.juRen': { min: 101, max: 135 },
  'rank.gongShi': { min: 136, max: 175 },
  'rank.jinShi': { min: 176, max: 220 },
  'rank.tanHua': { min: 221, max: 280 },
  'rank.bangYan': { min: 281, max: 340 },
  'rank.zhuangYuan': { min: 341, max: Infinity }
}

/**
 * 语言设置选项
 */
export interface LanguageOption {
  value: SupportedLanguage
  label: string
}

/**
 * 答题结果
 */
export interface AnswerResult {
  correct: boolean
  correctLine: string
  selectedLine: string
  poem: Poem
  sentenceIndex: number
}

/**
 * 路由元数据
 */
export interface RouteMetadata {
  requiresAuth?: boolean
  title?: string
}

/**
 * 应用设置
 */
export interface AppSettings {
  language: SupportedLanguage
  difficulty: DifficultyMode
  theme?: 'light' | 'dark'
  soundEffects?: boolean
}

/**
 * 历史记录项
 */
export interface HistoryItem {
  date: string
  poem: Poem
  correct: boolean
  score: number
  sentenceIndex: number
}

export type PoemLanguage = 'chinese' | 'english' | 'french' | 'german' | 'japanese' | 'spanish'

export interface UserData {
  username: string
  score: number
  level: string
  language: PoemLanguage
}

export interface GameState {
  currentPoem: Poem | null
  currentTranslation: TranslatedPoem | null
  selectedSentenceIndex: number
  options: string[]
  correctAnswer: string
  userAnswer: string | null
  isCorrect: boolean | null
}

/**
 * 诗句选项
 */
export interface PoemOption {
  value: string
  label: string
  isCorrect: boolean
}
