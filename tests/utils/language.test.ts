import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  isChineseMode,
  detectBrowserLanguage,
  getHintLanguage,
  isValidDifficultyForLanguage,
  getDefaultDifficultyForLanguage,
  handleLanguageChange,
  getLanguageOptions,
  LANGUAGE_MAP,
  DEFAULT_SETTINGS
} from '../../src/utils/language'
import type { SupportedLanguage, DifficultyMode } from '../../src/types'

describe('Language Utils', () => {
  beforeEach(() => {
    // 重置 navigator.language mock
    vi.clearAllMocks()
  })

  describe('isChineseMode', () => {
    it('应该正确识别中文模式', () => {
      expect(isChineseMode('chinese')).toBe(true)
      expect(isChineseMode('english')).toBe(false)
      expect(isChineseMode('spanish')).toBe(false)
      expect(isChineseMode('japanese')).toBe(false)
      expect(isChineseMode('french')).toBe(false)
      expect(isChineseMode('german')).toBe(false)
    })
  })

  describe('detectBrowserLanguage', () => {
    it('应该检测中文浏览器并返回中文+困难模式', () => {
      // Mock navigator.language
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'zh-CN'
      })

      const result = detectBrowserLanguage()
      expect(result.language).toBe('chinese')
      expect(result.difficulty).toBe('hard')
    })

    it('应该检测英文浏览器并返回英文+简单模式', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'en-US'
      })

      const result = detectBrowserLanguage()
      expect(result.language).toBe('english')
      expect(result.difficulty).toBe('easy')
    })

    it('应该检测西班牙语浏览器', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'es-ES'
      })

      const result = detectBrowserLanguage()
      expect(result.language).toBe('spanish')
      expect(result.difficulty).toBe('easy')
    })

    it('应该对不支持的语言返回默认英文', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'ko-KR'
      })

      const result = detectBrowserLanguage()
      expect(result.language).toBe('english')
      expect(result.difficulty).toBe('easy')
    })

    it('应该处理没有navigator.language的情况', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: undefined
      })
      Object.defineProperty(navigator, 'languages', {
        writable: true,
        value: undefined
      })

      const result = detectBrowserLanguage()
      expect(result.language).toBe('english')
      expect(result.difficulty).toBe('easy')
    })
  })

  describe('getHintLanguage', () => {
    it('中文模式应该返回 none', () => {
      expect(getHintLanguage('chinese')).toBe('none')
    })

    it('其他语言应该返回对应语言', () => {
      expect(getHintLanguage('english')).toBe('english')
      expect(getHintLanguage('spanish')).toBe('spanish')
      expect(getHintLanguage('japanese')).toBe('japanese')
      expect(getHintLanguage('french')).toBe('french')
      expect(getHintLanguage('german')).toBe('german')
    })
  })

  describe('isValidDifficultyForLanguage', () => {
    it('中文模式只支持困难模式', () => {
      expect(isValidDifficultyForLanguage('chinese', 'hard')).toBe(true)
      expect(isValidDifficultyForLanguage('chinese', 'easy')).toBe(false)
    })

    it('其他语言支持所有难度', () => {
      const languages: SupportedLanguage[] = ['english', 'spanish', 'japanese', 'french', 'german']
      const difficulties: DifficultyMode[] = ['easy', 'hard']

      languages.forEach(lang => {
        difficulties.forEach(diff => {
          expect(isValidDifficultyForLanguage(lang, diff)).toBe(true)
        })
      })
    })
  })

  describe('getDefaultDifficultyForLanguage', () => {
    it('中文模式默认困难模式', () => {
      expect(getDefaultDifficultyForLanguage('chinese')).toBe('hard')
    })

    it('其他语言默认简单模式', () => {
      const languages: SupportedLanguage[] = ['english', 'spanish', 'japanese', 'french', 'german']
      languages.forEach(lang => {
        expect(getDefaultDifficultyForLanguage(lang)).toBe('easy')
      })
    })
  })

  describe('handleLanguageChange', () => {
    it('切换到中文应该强制困难模式', () => {
      const result = handleLanguageChange('chinese', 'easy')
      expect(result.language).toBe('chinese')
      expect(result.difficulty).toBe('hard')
      expect(result.hintLanguage).toBe('none')
    })

    it('从中文切换到其他语言应该保持当前难度（如果有效）', () => {
      const result = handleLanguageChange('english', 'hard')
      expect(result.language).toBe('english')
      expect(result.difficulty).toBe('hard')
      expect(result.hintLanguage).toBe('english')
    })

    it('切换到其他语言且当前难度有效时应该保持', () => {
      const result = handleLanguageChange('spanish', 'easy')
      expect(result.language).toBe('spanish')
      expect(result.difficulty).toBe('easy')
      expect(result.hintLanguage).toBe('spanish')
    })
  })

  describe('getLanguageOptions', () => {
    it('应该返回所有支持的语言选项', () => {
      const options = getLanguageOptions()
      expect(options).toHaveLength(6)
      
      // 检查是否包含所有语言
      const values = options.map(opt => opt.value)
      expect(values).toContain('chinese')
      expect(values).toContain('english')
      expect(values).toContain('spanish')
      expect(values).toContain('japanese')
      expect(values).toContain('french')
      expect(values).toContain('german')

      // 检查中文选项的特殊标注
      const chineseOption = options.find(opt => opt.value === 'chinese')
      expect(chineseOption?.label).toBe('中文（仅困难模式）')
    })

    it('所有选项都应该是启用状态', () => {
      const options = getLanguageOptions()
      options.forEach(option => {
        expect(option.disabled).toBeFalsy()
      })
    })
  })

  describe('LANGUAGE_MAP', () => {
    it('应该包含所有支持的语言', () => {
      expect(LANGUAGE_MAP).toHaveProperty('chinese')
      expect(LANGUAGE_MAP).toHaveProperty('english')
      expect(LANGUAGE_MAP).toHaveProperty('spanish')
      expect(LANGUAGE_MAP).toHaveProperty('japanese')
      expect(LANGUAGE_MAP).toHaveProperty('french')
      expect(LANGUAGE_MAP).toHaveProperty('german')
    })

    it('中文应该没有提示功能', () => {
      expect(LANGUAGE_MAP.chinese.hasHint).toBe(false)
    })

    it('其他语言应该有提示功能', () => {
      expect(LANGUAGE_MAP.english.hasHint).toBe(true)
      expect(LANGUAGE_MAP.spanish.hasHint).toBe(true)
      expect(LANGUAGE_MAP.japanese.hasHint).toBe(true)
      expect(LANGUAGE_MAP.french.hasHint).toBe(true)
      expect(LANGUAGE_MAP.german.hasHint).toBe(true)
    })
  })

  describe('DEFAULT_SETTINGS', () => {
    it('中文默认设置应该正确', () => {
      expect(DEFAULT_SETTINGS.chinese.language).toBe('chinese')
      expect(DEFAULT_SETTINGS.chinese.difficulty).toBe('hard')
      expect(DEFAULT_SETTINGS.chinese.hintLanguage).toBe('none')
    })

    it('非中文默认设置应该正确', () => {
      expect(DEFAULT_SETTINGS.nonChinese.language).toBe('english')
      expect(DEFAULT_SETTINGS.nonChinese.difficulty).toBe('easy')
    })
  })
}) 