import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  AccountState,
  AccountStats,
  ActiveAccountInfo,
  AppSettings,
  DifficultyMode,
  SupportedLanguage,
  HintLanguage,
  AccountPreferences
} from '@/types'
import {
  detectBrowserLanguage,
  getHintLanguage,
  handleLanguageChange,
  isValidDifficultyForLanguage
} from '@/utils/language'
import accountStorage from '@/services/accountStorage'
import logger from '@/utils/logger'
import { resolveRankByScore, getNextRankDetail, getScoreToNextRank } from '@/config/ranks'

const MIN_SCORE = 0
const SAVE_THROTTLE_MS = 1200

const DEFAULT_STATS: AccountStats = {
  totalAnswered: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  lastAnsweredAt: null
}

function createDefaultSettings(): AppSettings {
  const detected = detectBrowserLanguage()
  return {
    language: detected.language,
    difficulty: detected.difficulty,
    theme: 'light',
    soundEffects: true
  }
}

function withRank(account: AccountState): AccountState {
  const detail = resolveRankByScore(account.score)
  return {
    ...account,
    rank: detail.name
  }
}

function createEmptyAccount(accountName: string, settings: AppSettings): AccountState {
  const timestamp = new Date().toISOString()
  return withRank({
    accountName,
    displayName: accountName,
    score: 0,
    language: settings.language,
    difficulty: settings.difficulty,
    createdAt: timestamp,
    lastUpdatedAt: timestamp,
    stats: { ...DEFAULT_STATS },
    version: 1,
    preferences: {
      musicEnabled: true,
      musicTrack: null
    }
  })
}

function cloneAccount(account: AccountState): AccountState {
  return withRank({
    ...account,
    stats: { ...account.stats },
    preferences: account.preferences
      ? {
          musicEnabled: account.preferences.musicEnabled,
          musicTrack: account.preferences.musicTrack ?? null
        }
      : undefined
  })
}

export const useUserStore = defineStore('user', () => {
  const accountState = ref<AccountState | null>(null)
  const activeConfig = ref<ActiveAccountInfo | null>(null)
  const settings = ref<AppSettings>(createDefaultSettings())
  const isLoading = ref(false)
  const lastError = ref<string | null>(null)
  const accountDirectory = ref<string | null>(null)
  const isSaving = ref(false)

  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const isAccountReady = computed(() => !!accountState.value)
  const accountName = computed(() => accountState.value?.accountName ?? null)
  const displayName = computed(
    () => accountState.value?.displayName ?? accountState.value?.accountName ?? ''
  )
  const score = computed(() => accountState.value?.score ?? 0)
  const language = computed<SupportedLanguage>(() => settings.value.language)
  const difficulty = computed<DifficultyMode>(() => settings.value.difficulty)
  const hintLanguage = computed<HintLanguage>(() =>
    getHintLanguage(language.value, difficulty.value)
  )
  const username = computed(() => displayName.value)

  const rankDetail = computed(() => resolveRankByScore(score.value))
  const rank = computed(() => rankDetail.value.name)
  const rankDetails = computed(() => rankDetail.value)

  const stats = computed<AccountStats>(() => accountState.value?.stats ?? { ...DEFAULT_STATS })

  const nextRank = computed(() => {
    const detail = getNextRankDetail(rankDetail.value.name)
    return detail
  })

  const scoreToNextRank = computed(() => {
    return getScoreToNextRank(score.value)
  })

  function setAccount(account: AccountState | null) {
    accountState.value = account ? cloneAccount(account) : null
    if (account) {
      settings.value.language = account.language
      settings.value.difficulty = account.difficulty
    }
  }

  function cancelScheduledSave() {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
  }

  async function persistAccount(immediate = false) {
    if (!accountState.value) {
      return
    }

    cancelScheduledSave()

    const save = async () => {
      if (!accountState.value) return
      isSaving.value = true
      try {
        const payload: AccountState = withRank({
          ...accountState.value,
          language: settings.value.language,
          difficulty: settings.value.difficulty,
          lastUpdatedAt: new Date().toISOString()
        })
        await accountStorage.writeAccount(payload)
      } catch (error) {
        console.error('[UserStore] 保存账户失败:', error)
        lastError.value = (error as Error).message ?? '保存账户失败'
      } finally {
        isSaving.value = false
      }
    }

    if (immediate) {
      await save()
    } else {
      saveTimer = setTimeout(save, SAVE_THROTTLE_MS)
    }
  }

  async function createDefaultAccount(): Promise<{
    account: AccountState
    active: ActiveAccountInfo
  }> {
    const defaultName = 'guest'
    const baseSettings = settings.value
    const account = createEmptyAccount(defaultName, baseSettings)
    const active: ActiveAccountInfo = {
      accountName: defaultName,
      switchedAt: new Date().toISOString(),
      schemaVersion: 1
    }

    await accountStorage.writeAccount(account)
    await accountStorage.writeActiveAccount(active)
    return { account, active }
  }

  async function bootstrap() {
    isLoading.value = true
    lastError.value = null
    cancelScheduledSave()

    try {
      const usingFallback = accountStorage.isUsingFallbackStorage()
      accountDirectory.value = await accountStorage.getAccountDirectoryPath()

      let active = await accountStorage.readActiveAccount()
      let account: AccountState | null = null
      let missingMessage: string | null = null

      if (active?.accountName) {
        account = await accountStorage.readAccount(active.accountName)
        if (!account) {
          missingMessage = `未找到账户“${active.accountName}”的数据文件`
        }
      } else {
        missingMessage = '未检测到激活账户配置'
      }

      if ((!active || !account) && usingFallback) {
        logger.info('[UserStore] 使用回退存储，自动创建默认账户')
        const created = await createDefaultAccount()
        active = created.active
        account = created.account
        missingMessage = null
      }

      if (!active || !account) {
        const message =
          missingMessage && active?.accountName
            ? `${missingMessage}。请在终端运行“poemctl account inspect ${active.accountName}”检查文件是否存在，或重新执行“poemctl account switch ${active.accountName}”。`
            : '未检测到有效账户，请在终端运行“poemctl account create <名称>”创建账户，并执行“poemctl account switch <名称>”激活后刷新。'
        lastError.value = message
        activeConfig.value = active
        setAccount(null)
        return false
      }

      activeConfig.value = active
      setAccount(account)
      logger.info('[UserStore] 已加载账户', account.accountName)
      return true
    } catch (error) {
      console.error('[UserStore] 加载账户失败:', error)
      lastError.value = (error as Error).message ?? '加载账户失败'
      if (!accountDirectory.value) {
        accountDirectory.value = await accountStorage.getAccountDirectoryPath()
      }
      setAccount(null)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function refreshAccount() {
    return bootstrap()
  }

  function touchAccountMetadata() {
    if (!accountState.value) return
    accountState.value.lastUpdatedAt = new Date().toISOString()
  }

  function updateScore(delta: number) {
    if (!accountState.value) return false

    const newScore = Math.max(MIN_SCORE, accountState.value.score + delta)
    const statsSnapshot: AccountStats = {
      ...accountState.value.stats,
      totalAnswered: accountState.value.stats.totalAnswered + 1,
      lastAnsweredAt: new Date().toISOString(),
      correctAnswers: accountState.value.stats.correctAnswers + (delta > 0 ? 1 : 0),
      incorrectAnswers: accountState.value.stats.incorrectAnswers + (delta < 0 ? 1 : 0)
    }

    accountState.value.score = newScore
    accountState.value.rank = resolveRankByScore(newScore).name
    accountState.value.stats = statsSnapshot
    touchAccountMetadata()
    persistAccount()
    return true
  }

  function setLanguage(newLanguage: SupportedLanguage) {
    const result = handleLanguageChange(newLanguage, settings.value.difficulty)
    settings.value.language = result.language
    settings.value.difficulty = result.difficulty
    if (accountState.value) {
      accountState.value.language = result.language
      accountState.value.difficulty = result.difficulty
      touchAccountMetadata()
      persistAccount()
    }
  }

  function setDifficulty(newDifficulty: DifficultyMode) {
    if (!isValidDifficultyForLanguage(settings.value.language, newDifficulty)) {
      logger.warn(`[UserStore] 当前语言不支持难度 ${newDifficulty}`)
      return false
    }

    settings.value.difficulty = newDifficulty
    if (accountState.value) {
      accountState.value.difficulty = newDifficulty
      touchAccountMetadata()
      persistAccount()
    }
    return true
  }

  function updateSettings(
    newSettings: Partial<AppSettings> & { preferences?: AccountPreferences }
  ) {
    settings.value = { ...settings.value, ...newSettings }
    if (accountState.value) {
      if (newSettings.preferences && accountState.value.preferences) {
        accountState.value.preferences = {
          ...accountState.value.preferences,
          ...newSettings.preferences
        }
      }
      accountState.value.rank = resolveRankByScore(accountState.value.score).name
      touchAccountMetadata()
      persistAccount()
    }
  }

  function toggleSoundEffects() {
    settings.value.soundEffects = !settings.value.soundEffects
    persistAccount()
  }

  function toggleTheme() {
    settings.value.theme = settings.value.theme === 'light' ? 'dark' : 'light'
    persistAccount()
  }

  function resetScore() {
    if (!accountState.value) return
    accountState.value.score = 0
    accountState.value.rank = resolveRankByScore(0).name
    accountState.value.stats = { ...DEFAULT_STATS }
    touchAccountMetadata()
    persistAccount(true)
  }

  async function saveNow() {
    await persistAccount(true)
  }

  return {
    // state
    accountState,
    activeConfig,
    settings,
    isLoading,
    isSaving,
    lastError,
    accountDirectory,

    // getters
    isAccountReady,
    accountName,
    displayName,
    username,
    score,
    language,
    difficulty,
    hintLanguage,
    rank,
    rankDetails,
    stats,
    nextRank,
    scoreToNextRank,

    // actions
    bootstrap,
    refreshAccount,
    updateScore,
    setLanguage,
    setDifficulty,
    updateSettings,
    toggleSoundEffects,
    toggleTheme,
    resetScore,
    saveNow
  }
})
