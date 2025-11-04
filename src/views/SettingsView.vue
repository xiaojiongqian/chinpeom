<template>
  <div class="min-h-screen bg-gray-100 pb-16 flex flex-col">
    <header class="pt-6 pb-3 text-center">
      <h1 class="text-2xl font-bold text-gray-800">{{ $t('settings.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ $t('settings.subtitle') }}</p>
    </header>

    <main class="flex-1 px-4 space-y-4">
      <!-- 语言与难度 -->
      <section class="bg-white rounded-xl shadow-md p-4 space-y-4">
        <div>
          <h2 class="text-base font-semibold text-gray-800 mb-3">{{ $t('settings.language') }}</h2>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="item in languageOptions"
              :key="item.value"
              class="flex items-center justify-between p-2.5 border rounded-lg text-sm transition-colors"
              :class="
                currentLanguage === item.value
                  ? 'bg-success-50 border-success-500 text-success-700'
                  : 'hover:bg-gray-50 border-gray-200 text-gray-700'
              "
              @click="setLanguage(item.value)"
            >
              <span class="flex items-center space-x-2">
                <span class="text-lg">{{ item.emoji }}</span>
                <span>{{ $t(`languages.${item.value}`) }}</span>
              </span>
              <svg
                v-if="currentLanguage === item.value"
                class="w-4 h-4 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="border-t pt-4">
          <h2 class="text-base font-semibold text-gray-800 mb-3">
            {{ $t('settings.difficulty') }}
          </h2>
          <div class="space-y-2">
            <button
              class="w-full flex items-center justify-between p-2.5 border rounded-lg text-left transition-colors"
              :class="
                difficulty === 'easy'
                  ? 'bg-success-50 border-success-500 text-success-700'
                  : 'hover:bg-gray-50 border-gray-200 text-gray-700'
              "
              @click="setDifficulty('easy')"
            >
              <span>
                <span class="block font-medium text-sm">{{ $t('settings.easyMode') }}</span>
                <span class="text-xs text-gray-500">{{ $t('settings.easyModeDesc') }}</span>
              </span>
              <svg
                v-if="difficulty === 'easy'"
                class="w-4 h-4 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              class="w-full flex items-center justify-between p-2.5 border rounded-lg text-left transition-colors"
              :class="
                difficulty === 'hard'
                  ? 'bg-success-50 border-success-500 text-success-700'
                  : 'hover:bg-gray-50 border-gray-200 text-gray-700'
              "
              @click="setDifficulty('hard')"
            >
              <span>
                <span class="block font-medium text-sm">{{ $t('settings.hardMode') }}</span>
                <span class="text-xs text-gray-500">{{ $t('settings.hardModeDesc') }}</span>
              </span>
              <svg
                v-if="difficulty === 'hard'"
                class="w-4 h-4 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- 账户信息 -->
      <section class="bg-white rounded-xl shadow-md p-4 space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-base font-semibold text-gray-800">{{ $t('settings.accountTitle') }}</h2>
            <p class="text-xs text-gray-500">{{ $t('settings.accountSubtitle') }}</p>
          </div>
          <span class="px-2 py-1 text-xs rounded-full bg-success-100 text-success-700">
            {{ $t(userStore.rank) }}
          </span>
        </div>

        <dl class="grid grid-cols-2 gap-y-3 text-sm text-gray-700">
          <div>
            <dt class="text-xs text-gray-500">{{ $t('settings.accountName') }}</dt>
            <dd class="mt-0.5 font-medium">{{ userStore.accountName || '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">{{ $t('settings.displayName') }}</dt>
            <dd class="mt-0.5 font-medium">{{ userStore.displayName || '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">{{ $t('settings.totalAnswered') }}</dt>
            <dd class="mt-0.5 font-medium">{{ stats.totalAnswered }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">{{ $t('settings.accuracy') }}</dt>
            <dd class="mt-0.5 font-medium">{{ accuracy }}%</dd>
          </div>
        </dl>

        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
          <p class="font-semibold text-gray-700">{{ $t('settings.accountPath') }}</p>
          <p class="mt-1 font-mono break-all text-gray-700">{{ accountPath }}</p>
          <p v-if="isFallback" class="mt-2 text-amber-600 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0V7zm.75 8a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            {{ $t('settings.fallbackNotice') }}
          </p>
        </div>

        <div class="flex items-center space-x-2">
          <button
            class="flex-1 bg-success-500 hover:bg-success-600 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-60 flex items-center justify-center space-x-2"
            :disabled="saving"
            @click="saveAccount"
          >
            <svg
              v-if="saving"
              class="w-4 h-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M21 12a9 9 0 10-9 9"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ saving ? $t('settings.saving') : $t('settings.saveNow') }}</span>
          </button>
          <button
            class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
            @click="showTerminalGuide = true"
          >
            {{ $t('settings.terminalHelp') }}
          </button>
        </div>

        <p v-if="lastMessage" class="text-xs text-gray-500">{{ lastMessage }}</p>
      </section>

      <!-- 音乐控制 -->
      <section class="bg-white rounded-xl shadow-md p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-800">{{ $t('settings.music') }}</h2>
          <button
            class="px-3 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2"
            :class="
              musicStore.isMuted ? 'bg-gray-200 text-gray-700' : 'bg-success-100 text-success-700'
            "
            @click="musicStore.toggleMute()"
          >
            <img
              :src="musicStore.isMuted ? soundOffIcon : soundOnIcon"
              :alt="$t('common.soundToggle')"
              class="w-4 h-4"
            />
            <span>{{ musicStore.isMuted ? $t('settings.musicOff') : $t('settings.musicOn') }}</span>
          </button>
        </div>
        <p class="text-xs text-gray-500">{{ $t('settings.musicDesc') }}</p>
      </section>
    </main>

    <!-- 底部导航 -->
    <nav
      class="fixed-mobile bottom-0 bg-white border-t shadow-md flex justify-around items-center h-16 z-20"
    >
      <router-link
        to="/achievement"
        class="flex flex-col items-center transition-colors"
        :class="
          $route.name === 'achievement'
            ? 'text-success-600'
            : 'text-gray-800 hover:text-success-600'
        "
      >
        <img
          src="@/assets/icons/nav/icon_achievement.svg"
          :alt="$t('common.achievement')"
          class="w-7 h-7 mb-0.5"
          :class="$route.name === 'achievement' ? 'filter-green' : 'filter-gray'"
        />
      </router-link>
      <router-link
        to="/quizview"
        class="flex flex-col items-center transition-colors"
        :class="
          $route.name === 'home' ? 'text-success-600' : 'text-gray-800 hover:text-success-600'
        "
      >
        <img
          src="@/assets/icons/nav/icon_home.svg"
          :alt="$t('common.home')"
          class="w-8 h-8 mb-0.5"
          :class="$route.name === 'home' ? 'filter-green' : 'filter-gray'"
        />
      </router-link>
      <router-link
        to="/settings"
        class="flex flex-col items-center transition-colors"
        :class="
          $route.name === 'settings' ? 'text-success-600' : 'text-gray-800 hover:text-success-600'
        "
      >
        <img
          src="@/assets/icons/nav/icon_usersetting.svg"
          :alt="$t('common.settings')"
          class="w-7 h-7 mb-0.5"
          :class="$route.name === 'settings' ? 'filter-green' : 'filter-gray'"
        />
      </router-link>
    </nav>

    <!-- 终端指引弹窗 -->
    <div
      v-if="showTerminalGuide"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 px-4"
      @click.self="showTerminalGuide = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ $t('settings.terminalGuideTitle') }}
          </h3>
          <button class="text-gray-400 hover:text-gray-600" @click="showTerminalGuide = false">
            ×
          </button>
        </div>
        <p class="text-sm text-gray-600">{{ $t('settings.terminalGuideDesc') }}</p>
        <div class="bg-gray-900 text-white text-xs rounded-lg p-3 space-y-2 font-mono">
          <p>$ poemctl account create myname</p>
          <p>$ poemctl account switch myname</p>
          <p>$ poemctl account inspect myname</p>
        </div>
        <ul class="text-xs text-gray-600 space-y-1">
          <li>• {{ $t('settings.tipActiveFile') }}</li>
          <li>• {{ $t('settings.tipAccountsDir') }}</li>
          <li>• {{ $t('settings.tipBackup') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/stores/user'
  import { useMusicStore } from '@/stores/music'
  import accountStorage from '@/services/accountStorage'
  import soundOnIcon from '@/assets/icons/feature/icon_sound_on.svg'
  import soundOffIcon from '@/assets/icons/feature/icon_sound_off.svg'
  import type { SupportedLanguage, DifficultyMode } from '@/types'

  const { t } = useI18n()
  const userStore = useUserStore()
  const musicStore = useMusicStore()

  const showTerminalGuide = ref(false)
  const saving = computed(() => userStore.isSaving)
  const lastMessage = ref('')
  const accountPath = ref('~/.chinpoem/accounts')

  const languageOptions = [
    { value: 'chinese' as SupportedLanguage, emoji: '🇨🇳' },
    { value: 'english' as SupportedLanguage, emoji: '🇬🇧' },
    { value: 'spanish' as SupportedLanguage, emoji: '🇪🇸' },
    { value: 'japanese' as SupportedLanguage, emoji: '🇯🇵' },
    { value: 'french' as SupportedLanguage, emoji: '🇫🇷' },
    { value: 'german' as SupportedLanguage, emoji: '🇩🇪' }
  ]

  const currentLanguage = computed(() => userStore.language)
  const difficulty = computed(() => userStore.difficulty)
  const stats = computed(() => userStore.stats)

  const accuracy = computed(() => {
    if (stats.value.totalAnswered === 0) return 0
    const value = (stats.value.correctAnswers / stats.value.totalAnswered) * 100
    return Math.round(value)
  })

  const isFallback = computed(() => accountStorage.isUsingFallbackStorage())

  onMounted(async () => {
    const resolved = await accountStorage.getAccountDirectoryPath()
    if (resolved) {
      accountPath.value = resolved
    }
  })

  function setLanguage(newLanguage: SupportedLanguage) {
    userStore.setLanguage(newLanguage)
    lastMessage.value = t('settings.languageUpdated')
  }

  function setDifficulty(newDifficulty: DifficultyMode) {
    if (userStore.setDifficulty(newDifficulty)) {
      lastMessage.value = t('settings.difficultyUpdated')
    }
  }

  async function saveAccount() {
    await userStore.saveNow()
    lastMessage.value = t('settings.savedAt', { time: new Date().toLocaleTimeString() })
  }
</script>

<style scoped>
  .filter-green {
    filter: brightness(0) saturate(100%) invert(42%) sepia(78%) saturate(1084%) hue-rotate(93deg)
      brightness(96%) contrast(86%);
  }

  .filter-gray {
    filter: brightness(0) saturate(100%) invert(20%) sepia(0%) saturate(0%) hue-rotate(0deg)
      brightness(0%) contrast(100%);
  }
</style>
