import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Ensure browser-like globals exist for the store
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

vi.stubGlobal('localStorage', localStorageMock)

const mockAccountStorage = {
  readActiveAccount: vi.fn().mockResolvedValue(null),
  writeActiveAccount: vi.fn().mockResolvedValue(undefined),
  readAccount: vi.fn().mockResolvedValue(null),
  writeAccount: vi.fn().mockResolvedValue(undefined),
  listAccounts: vi.fn().mockResolvedValue([]),
  getAccountDirectoryPath: vi.fn().mockResolvedValue(null),
  isUsingFallbackStorage: vi.fn().mockReturnValue(true)
}

vi.mock('@/services/accountStorage', () => ({
  default: mockAccountStorage
}))

vi.mock('@/utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@/utils/language', async importOriginal => {
  const actual = await importOriginal<typeof import('@/utils/language')>()
  return {
    ...actual,
    detectBrowserLanguage: vi.fn(() => ({
      language: 'english' as const,
      difficulty: 'easy' as const
    }))
  }
})

const { useUserStore } = await import('@/stores/user')

function createTestAccount(
  overrides: Partial<ReturnType<typeof useUserStore>['accountState']> = {}
) {
  const base = {
    accountName: 'guest',
    displayName: 'Guest',
    score: 0,
    language: 'english',
    difficulty: 'easy',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastUpdatedAt: '2024-01-01T00:00:00.000Z',
    stats: {
      totalAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      lastAnsweredAt: null
    },
    version: 1,
    preferences: {
      musicEnabled: true,
      musicTrack: null
    },
    rank: 'rank.baiDing'
  } as const

  return { ...base, ...overrides }
}

describe('useUserStore (account state)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses detected browser language for initial settings', () => {
    const store = useUserStore()

    expect(store.language).toBe('english')
    expect(store.difficulty).toBe('easy')
    expect(store.hintLanguage).toBe('english')
    expect(store.score).toBe(0)
    expect(store.isAccountReady).toBe(false)
  })

  it('setLanguage updates settings and persists account when available', async () => {
    const store = useUserStore()
    store.accountState = createTestAccount()

    store.setLanguage('chinese')

    expect(store.language).toBe('chinese')
    expect(store.difficulty).toBe('easy')
    expect(store.accountState.language).toBe('chinese')
    expect(store.accountState.difficulty).toBe('easy')

    await vi.runAllTimersAsync()
    expect(mockAccountStorage.writeAccount).toHaveBeenCalledTimes(1)
    const payload = mockAccountStorage.writeAccount.mock.calls[0][0]
    expect(payload.language).toBe('chinese')
  })

  it('updateScore adjusts stats and schedules persistence', async () => {
    const store = useUserStore()
    store.accountState = createTestAccount()

    const result = store.updateScore(10)
    expect(result).toBe(true)

    expect(store.score).toBe(10)
    expect(store.stats.totalAnswered).toBe(1)
    expect(store.stats.correctAnswers).toBe(1)
    expect(store.stats.incorrectAnswers).toBe(0)

    await vi.runAllTimersAsync()
    expect(mockAccountStorage.writeAccount).toHaveBeenCalled()
  })

  it('resetScore clears progress immediately', async () => {
    const store = useUserStore()
    store.accountState = createTestAccount({
      score: 120,
      stats: {
        totalAnswered: 5,
        correctAnswers: 4,
        incorrectAnswers: 1,
        lastAnsweredAt: '2024-01-01T10:00:00.000Z'
      }
    })

    store.resetScore()

    expect(store.score).toBe(0)
    expect(store.stats.totalAnswered).toBe(0)
    expect(store.accountState?.stats.totalAnswered).toBe(0)

    await vi.waitFor(() => {
      expect(mockAccountStorage.writeAccount).toHaveBeenCalled()
    })
  })
})
