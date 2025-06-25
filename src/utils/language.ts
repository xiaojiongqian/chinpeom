import type { SupportedLanguage, DifficultyMode, HintLanguage } from '@/types'

/**
 * 支持的语言映射表
 */
export const LANGUAGE_MAP: Record<SupportedLanguage, { label: string; code: string; hasHint: boolean }> = {
  chinese: { label: '中文', code: 'zh', hasHint: true },
  english: { label: 'English', code: 'en', hasHint: true },
  spanish: { label: 'Español', code: 'es', hasHint: true },
  japanese: { label: '日本語', code: 'ja', hasHint: true },
  french: { label: 'Français', code: 'fr', hasHint: true },
  german: { label: 'Deutsch', code: 'de', hasHint: true }
}

/**
 * 默认语言设置
 */
export const DEFAULT_SETTINGS = {
  chinese: {
    language: 'chinese' as SupportedLanguage,
    difficulty: 'easy' as DifficultyMode,
    hintLanguage: 'english' as HintLanguage
  },
  nonChinese: {
    language: 'english' as SupportedLanguage,
    difficulty: 'easy' as DifficultyMode
  }
}

/**
 * 检测是否为中文模式
 */
export function isChineseMode(language: SupportedLanguage): boolean {
  return language === 'chinese'
}

/**
 * 检测浏览器默认语言并返回对应的应用语言设置
 */
export function detectBrowserLanguage(): { language: SupportedLanguage; difficulty: DifficultyMode } {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  const langCode = browserLang.toLowerCase()

  // 检测中文
  if (langCode.startsWith('zh')) {
    return {
      language: DEFAULT_SETTINGS.chinese.language,
      difficulty: DEFAULT_SETTINGS.chinese.difficulty
    }
  }

  // 检测其他支持的语言
  const supportedLangCode = Object.entries(LANGUAGE_MAP).find(([_, config]) => 
    langCode.startsWith(config.code)
  )

  if (supportedLangCode) {
    return {
      language: supportedLangCode[0] as SupportedLanguage,
      difficulty: DEFAULT_SETTINGS.nonChinese.difficulty
    }
  }

  // 默认返回英语
  return DEFAULT_SETTINGS.nonChinese
}

/**
 * 获取提示语言
 * 中文模式下，简单难度返回'english'，困难难度返回'none'
 */
export function getHintLanguage(language: SupportedLanguage, difficulty: DifficultyMode): HintLanguage {
  if (isChineseMode(language)) {
    return difficulty === 'easy' ? 'english' : 'none'
  }
  return language
}

/**
 * 验证难度模式是否适用于指定语言
 */
export function isValidDifficultyForLanguage(language: SupportedLanguage, difficulty: DifficultyMode): boolean {
  // 所有语言都支持所有难度模式
  return true
}

/**
 * 获取语言切换后的默认难度
 */
export function getDefaultDifficultyForLanguage(language: SupportedLanguage): DifficultyMode {
  // 默认都为 easy
  return 'easy'
}

/**
 * 获取所有可用语言选项
 */
export function getLanguageOptions(): Array<{ value: SupportedLanguage; label: string; disabled?: boolean }> {
  return Object.entries(LANGUAGE_MAP).map(([value, config]) => ({
    value: value as SupportedLanguage,
    label: config.label,
    disabled: false
  }))
}

/**
 * 语言切换处理器
 * 返回切换后的完整设置
 */
export function handleLanguageChange(
  newLanguage: SupportedLanguage,
  currentDifficulty: DifficultyMode
): { language: SupportedLanguage; difficulty: DifficultyMode; hintLanguage: HintLanguage } {
  const difficulty = isValidDifficultyForLanguage(newLanguage, currentDifficulty)
    ? currentDifficulty
    : getDefaultDifficultyForLanguage(newLanguage)

  return {
    language: newLanguage,
    difficulty,
    hintLanguage: getHintLanguage(newLanguage, difficulty)
  }
} 