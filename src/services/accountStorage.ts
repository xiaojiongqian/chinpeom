import type {
  AccountState,
  ActiveAccountInfo,
  AccountStats,
  AccountPreferences,
  SupportedLanguage,
  DifficultyMode
} from '@/types'
import { resolveRankByScore } from '@/config/ranks'

interface PersistedStore {
  active: ActiveAccountInfo | null
  accounts: Record<string, AccountState>
}

const STORAGE_KEY = '__chinpoem_account_storage__'
const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'chinese',
  'english',
  'spanish',
  'japanese',
  'french',
  'german'
]
const SUPPORTED_DIFFICULTIES: DifficultyMode[] = ['easy', 'hard']

interface AccountStorageDriver {
  isFallback: boolean
  readActiveAccount(): Promise<ActiveAccountInfo | null>
  writeActiveAccount(info: ActiveAccountInfo): Promise<void>
  readAccount(accountName: string): Promise<AccountState | null>
  writeAccount(account: AccountState): Promise<void>
  listAccounts(): Promise<string[]>
  getAccountDirectoryPath(): Promise<string | null>
}

let fallbackStore: PersistedStore = {
  active: null,
  accounts: {}
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function cloneStats(stats: AccountStats): AccountStats {
  return {
    totalAnswered: stats.totalAnswered,
    correctAnswers: stats.correctAnswers,
    incorrectAnswers: stats.incorrectAnswers,
    lastAnsweredAt: stats.lastAnsweredAt
  }
}

function clonePreferences(preferences?: AccountPreferences) {
  if (!preferences) return undefined
  return {
    musicEnabled: preferences.musicEnabled,
    musicTrack: preferences.musicTrack ?? null
  }
}

function cloneAccount(account: AccountState): AccountState {
  return {
    ...account,
    stats: cloneStats(account.stats),
    preferences: clonePreferences(account.preferences)
  }
}

function coerceLanguage(value: unknown): SupportedLanguage {
  if (typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)) {
    return value as SupportedLanguage
  }
  return 'chinese'
}

function coerceDifficulty(value: unknown): DifficultyMode {
  if (typeof value === 'string' && SUPPORTED_DIFFICULTIES.includes(value as DifficultyMode)) {
    return value as DifficultyMode
  }
  return 'easy'
}

type UnknownRecord = Record<string, unknown>

function normalizeStats(raw: unknown): AccountStats {
  if (raw && typeof raw === 'object' && 'stats' in raw) {
    const statsRaw = (raw as UnknownRecord).stats
    if (statsRaw && typeof statsRaw === 'object') {
      const stats = statsRaw as UnknownRecord
      return {
        totalAnswered: Number(stats.totalAnswered) || 0,
        correctAnswers: Number(stats.correctAnswers) || 0,
        incorrectAnswers: Number(stats.incorrectAnswers) || 0,
        lastAnsweredAt:
          typeof stats.lastAnsweredAt === 'string' ? (stats.lastAnsweredAt as string) : null
      }
    }
  }

  const data = (raw as UnknownRecord) || {}

  const totalAnswered =
    Number((data.totalAnswered as number | string | undefined) ?? data.totalQuestions) || 0
  const correctAnswers =
    Number((data.correctAnswers as number | string | undefined) ?? data.correctQuestions) || 0
  const incorrectAnswers =
    Number(
      (data.incorrectAnswers as number | string | undefined) ??
        data.incorrectQuestions ??
        totalAnswered - correctAnswers
    ) || 0
  const lastAnsweredAt =
    typeof data.lastAnsweredAt === 'string'
      ? (data.lastAnsweredAt as string)
      : typeof data.lastPlayedAt === 'string'
        ? (data.lastPlayedAt as string)
        : null

  return { totalAnswered, correctAnswers, incorrectAnswers, lastAnsweredAt }
}

function normalizePreferences(raw: unknown): AccountPreferences | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined
  }

  const record = raw as UnknownRecord
  return {
    musicEnabled: 'musicEnabled' in record ? Boolean(record.musicEnabled) : true,
    musicTrack: typeof record.musicTrack === 'string' ? (record.musicTrack as string) : null
  }
}

function normalizeAccount(raw: unknown): AccountState | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const record = raw as UnknownRecord

  const accountName =
    typeof record.accountName === 'string'
      ? (record.accountName as string)
      : typeof record.account === 'string'
        ? (record.account as string)
        : null

  if (!accountName) {
    return null
  }

  const createdAt =
    typeof record.createdAt === 'string' ? (record.createdAt as string) : new Date().toISOString()
  const lastUpdatedAt =
    typeof record.lastUpdatedAt === 'string' ? (record.lastUpdatedAt as string) : createdAt

  const score = Number(record.score) || 0
  const rankName = resolveRankByScore(score).name

  return {
    accountName,
    displayName:
      typeof record.displayName === 'string' ? (record.displayName as string) : accountName,
    score,
    language: coerceLanguage(record.language),
    difficulty: coerceDifficulty(record.difficulty),
    createdAt,
    lastUpdatedAt,
    stats: normalizeStats(record),
    version: Number(record.version ?? record.schemaVersion ?? 1) || 1,
    preferences: normalizePreferences(record.preferences),
    rank: rankName
  }
}

function denormalizeAccount(account: AccountState) {
  const { name: computedRank } = resolveRankByScore(account.score)
  return {
    ...account,
    rank: computedRank,
    stats: cloneStats(account.stats),
    preferences: clonePreferences(account.preferences),
    schemaVersion: account.version ?? 1
  }
}

function normalizeActiveAccount(raw: unknown): ActiveAccountInfo | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const record = raw as UnknownRecord

  const accountName =
    typeof record.accountName === 'string'
      ? (record.accountName as string)
      : typeof record.currentAccount === 'string'
        ? (record.currentAccount as string)
        : null

  if (!accountName) {
    return null
  }

  const switchedAt =
    typeof record.switchedAt === 'string'
      ? (record.switchedAt as string)
      : typeof record.lastSwitch === 'string'
        ? (record.lastSwitch as string)
        : new Date().toISOString()

  return {
    accountName,
    switchedAt,
    schemaVersion: Number(record.schemaVersion ?? record.version ?? 1) || 1
  }
}

function denormalizeActiveAccount(info: ActiveAccountInfo) {
  const switchedAt = info.switchedAt || new Date().toISOString()
  return {
    accountName: info.accountName,
    currentAccount: info.accountName,
    switchedAt,
    lastSwitch: switchedAt,
    schemaVersion: info.schemaVersion ?? 1
  }
}

function loadStore(): PersistedStore {
  if (!isBrowser()) {
    return fallbackStore
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return fallbackStore
  }

  try {
    const parsed = JSON.parse(raw) as {
      active?: unknown
      accounts?: Record<string, unknown>
    }
    const active = normalizeActiveAccount(parsed.active)
    const accounts: Record<string, AccountState> = {}

    if (parsed.accounts && typeof parsed.accounts === 'object') {
      for (const value of Object.values(parsed.accounts)) {
        const normalized = normalizeAccount(value)
        if (normalized) {
          accounts[normalized.accountName] = normalized
        }
      }
    }

    fallbackStore = {
      active,
      accounts
    }
  } catch (error) {
    console.warn('[AccountStorage] 读取存储失败，使用空数据', error)
    fallbackStore = { active: null, accounts: {} }
  }

  return fallbackStore
}

function persistStore(store: PersistedStore) {
  fallbackStore = {
    active: store.active ? { ...store.active } : null,
    accounts: Object.fromEntries(
      Object.entries(store.accounts).map(([key, account]) => [key, cloneAccount(account)])
    )
  }

  if (!isBrowser()) {
    return
  }

  try {
    const serializable = {
      active: store.active ? denormalizeActiveAccount(store.active) : null,
      accounts: Object.fromEntries(
        Object.entries(store.accounts).map(([key, account]) => [key, denormalizeAccount(account)])
      )
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch (error) {
    console.warn('[AccountStorage] 写入存储失败', error)
  }
}

function createFallbackDriver(label: string): AccountStorageDriver {
  return {
    isFallback: true,
    async readActiveAccount() {
      const store = loadStore()
      return store.active ? { ...store.active } : null
    },
    async writeActiveAccount(info: ActiveAccountInfo) {
      if (!info.accountName) {
        throw new Error('Active account name is required')
      }
      const store = loadStore()
      const normalized = normalizeActiveAccount(info)
      if (!normalized) {
        throw new Error('Active account payload is invalid')
      }
      store.active = normalized
      persistStore(store)
    },
    async readAccount(accountName: string) {
      if (!accountName) return null
      const store = loadStore()
      const account = store.accounts[accountName]
      return account ? cloneAccount(account) : null
    },
    async writeAccount(account: AccountState) {
      if (!account || !account.accountName) {
        throw new Error('Account data is invalid')
      }
      const normalized = normalizeAccount(account)
      if (!normalized) {
        throw new Error('Account data is invalid')
      }
      const store = loadStore()
      store.accounts[normalized.accountName] = cloneAccount(normalized)
      persistStore(store)
    },
    async listAccounts() {
      const store = loadStore()
      return Object.keys(store.accounts)
    },
    async getAccountDirectoryPath() {
      return `${label}://chinpoem`
    }
  }
}

interface NativeAccountBridge {
  readActiveAccount?: () => Promise<unknown>
  writeActiveAccount?: (info: unknown) => Promise<void>
  readAccount?: (accountName: string) => Promise<unknown>
  writeAccount?: (account: unknown) => Promise<void>
  listAccounts?: () => Promise<string[]>
  getAccountDirectoryPath?: () => Promise<string | null>
}

function detectNativeBridge(): NativeAccountBridge | null {
  if (typeof window === 'undefined') {
    return null
  }

  const nativeHost = (window as Window & { chinpoemNative?: { accounts?: NativeAccountBridge } })
    .chinpoemNative

  return nativeHost?.accounts ?? null
}

function createNativeDriver(bridge: NativeAccountBridge): AccountStorageDriver {
  return {
    isFallback: false,
    async readActiveAccount() {
      if (typeof bridge.readActiveAccount !== 'function') {
        return null
      }
      const raw = await bridge.readActiveAccount()
      return normalizeActiveAccount(raw)
    },
    async writeActiveAccount(info: ActiveAccountInfo) {
      if (typeof bridge.writeActiveAccount !== 'function') {
        throw new Error('Native bridge does not support writeActiveAccount')
      }
      await bridge.writeActiveAccount(denormalizeActiveAccount(info))
    },
    async readAccount(accountName: string) {
      if (typeof bridge.readAccount !== 'function') {
        return null
      }
      const raw = await bridge.readAccount(accountName)
      return normalizeAccount(raw)
    },
    async writeAccount(account: AccountState) {
      if (typeof bridge.writeAccount !== 'function') {
        throw new Error('Native bridge does not support writeAccount')
      }
      const normalized = normalizeAccount(account)
      if (!normalized) {
        throw new Error('Account data is invalid')
      }
      await bridge.writeAccount(denormalizeAccount(normalized))
    },
    async listAccounts() {
      if (typeof bridge.listAccounts !== 'function') {
        return []
      }
      try {
        return await bridge.listAccounts()
      } catch (error) {
        console.warn('[AccountStorage] 获取账户列表失败', error)
        return []
      }
    },
    async getAccountDirectoryPath() {
      if (typeof bridge.getAccountDirectoryPath === 'function') {
        try {
          return await bridge.getAccountDirectoryPath()
        } catch (error) {
          console.warn('[AccountStorage] 获取账户目录失败', error)
        }
      }
      return null
    }
  }
}

const driver: AccountStorageDriver = (() => {
  const nativeBridge = detectNativeBridge()
  if (nativeBridge) {
    return createNativeDriver(nativeBridge)
  }

  if (isBrowser()) {
    return createFallbackDriver('localStorage')
  }

  return createFallbackDriver('memory')
})()

export async function readActiveAccount(): Promise<ActiveAccountInfo | null> {
  return driver.readActiveAccount()
}

export async function writeActiveAccount(info: ActiveAccountInfo) {
  if (!info.accountName) {
    throw new Error('Active account name is required')
  }
  const payload: ActiveAccountInfo = {
    accountName: info.accountName,
    switchedAt: info.switchedAt ?? new Date().toISOString(),
    schemaVersion: info.schemaVersion ?? 1
  }
  await driver.writeActiveAccount(payload)
}

export async function readAccount(accountName: string): Promise<AccountState | null> {
  return driver.readAccount(accountName)
}

export async function writeAccount(account: AccountState) {
  if (!account || !account.accountName) {
    throw new Error('Account data is invalid')
  }
  const sanitized = normalizeAccount(account)
  if (!sanitized) {
    throw new Error('Account data is invalid')
  }
  await driver.writeAccount(sanitized)
}

export async function listAccounts(): Promise<string[]> {
  return driver.listAccounts()
}

export async function getAccountDirectoryPath(): Promise<string | null> {
  return driver.getAccountDirectoryPath()
}

export function isUsingFallbackStorage(): boolean {
  return driver.isFallback
}

export default {
  readActiveAccount,
  writeActiveAccount,
  readAccount,
  writeAccount,
  listAccounts,
  getAccountDirectoryPath,
  isUsingFallbackStorage
}
