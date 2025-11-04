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
 * 账户统计信息
 */
export interface AccountStats {
  totalAnswered: number
  correctAnswers: number
  incorrectAnswers: number
  lastAnsweredAt: string | null
}

/**
 * 账户偏好设置
 */
export interface AccountPreferences {
  musicEnabled: boolean
  musicTrack?: string | null
}

/**
 * 本地账户状态
 */
export interface AccountState {
  accountName: string
  displayName: string
  score: number
  language: SupportedLanguage
  difficulty: DifficultyMode
  createdAt: string
  lastUpdatedAt: string
  stats: AccountStats
  version: number
  preferences?: AccountPreferences
  rank?: AcademicRank
}

/**
 * 当前激活账户信息
 */
export interface ActiveAccountInfo {
  accountName: string
  switchedAt: string
  schemaVersion?: number
}

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
