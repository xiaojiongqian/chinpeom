<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-white shadow-sm">
      <div class="max-w-md mx-auto px-5 py-6 text-center">
        <h1 class="text-2xl font-bold text-gray-800">{{ $t('onboarding.title') }}</h1>
        <p class="mt-2 text-gray-600 text-sm">{{ $t('onboarding.subtitle') }}</p>
      </div>
    </header>

    <main class="flex-1 max-w-md mx-auto w-full px-5 py-6 space-y-6">
      <section class="bg-white rounded-2xl shadow-md p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ $t('onboarding.stepsTitle') }}
          </h2>
          <button
            class="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="musicStore.isMuted ? 'bg-gray-200 text-gray-700' : 'bg-success-500 text-white'"
            @click="toggleMusic"
          >
            <img
              :src="musicStore.isMuted ? soundOffIcon : soundOnIcon"
              :alt="$t('common.soundToggle')"
              class="w-4 h-4"
            />
            <span>{{
              musicStore.isMuted ? $t('onboarding.musicOff') : $t('onboarding.musicOn')
            }}</span>
          </button>
        </div>

        <ol class="space-y-3 text-sm text-gray-700">
          <li class="flex items-start space-x-3">
            <span class="font-semibold text-success-500">1</span>
            <div>
              <p class="font-medium">{{ $t('onboarding.stepCreate') }}</p>
              <code
                class="mt-1 block bg-gray-900 text-white text-xs px-3 py-2 rounded-lg font-mono break-all"
              >
                poemctl account create &lt;{{ $t('onboarding.accountName') }}&gt;
              </code>
            </div>
          </li>
          <li class="flex items-start space-x-3">
            <span class="font-semibold text-success-500">2</span>
            <div>
              <p class="font-medium">{{ $t('onboarding.stepSwitch') }}</p>
              <code
                class="mt-1 block bg-gray-900 text-white text-xs px-3 py-2 rounded-lg font-mono break-all"
              >
                poemctl account switch &lt;{{ $t('onboarding.accountName') }}&gt;
              </code>
            </div>
          </li>
          <li class="flex items-start space-x-3">
            <span class="font-semibold text-success-500">3</span>
            <div>
              <p class="font-medium">{{ $t('onboarding.stepInspect') }}</p>
              <code
                class="mt-1 block bg-gray-900 text-white text-xs px-3 py-2 rounded-lg font-mono break-all"
              >
                poemctl account inspect &lt;{{ $t('onboarding.accountName') }}&gt;
              </code>
            </div>
          </li>
        </ol>

        <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
          <p class="font-semibold text-gray-800">
            {{ $t('onboarding.accountLocationTitle') }}
          </p>
          <p class="mt-1 font-mono break-all text-gray-700">
            {{ accountPath || defaultAccountPath }}
          </p>
          <p v-if="isFallback" class="mt-2 text-amber-600 flex items-center text-xs">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0V7zm.75 8a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            {{ $t('onboarding.fallbackNotice') }}
          </p>
        </div>
      </section>

      <section class="bg-white rounded-2xl shadow-md p-5 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">
          {{ $t('onboarding.troubleshootingTitle') }}
        </h2>
        <ul class="space-y-3 text-sm text-gray-700">
          <li>• {{ $t('onboarding.checkActive') }}</li>
          <li>• {{ $t('onboarding.checkAccountFile') }}</li>
          <li>• {{ $t('onboarding.checkPermissions') }}</li>
        </ul>

        <div
          v-if="userStore.lastError"
          class="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700"
        >
          {{ userStore.lastError }}
        </div>

        <button
          class="w-full bg-success-500 hover:bg-success-600 text-white font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          :disabled="refreshing"
          @click="handleRefresh"
        >
          <svg
            v-if="refreshing"
            class="animate-spin w-4 h-4 mr-2"
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
          <span>{{
            refreshing ? $t('onboarding.refreshing') : $t('onboarding.refreshButton')
          }}</span>
        </button>

        <p v-if="refreshMessage" class="text-xs text-gray-500 text-center">
          {{ refreshMessage }}
        </p>
      </section>

      <section class="text-center text-xs text-gray-500">
        {{ $t('onboarding.tip') }}
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/stores/user'
  import { useMusicStore } from '@/stores/music'
  import { usePoemStore } from '@/stores/poem'
  import accountStorage from '@/services/accountStorage'
  import soundOnIcon from '@/assets/icons/feature/icon_sound_on.svg'
  import soundOffIcon from '@/assets/icons/feature/icon_sound_off.svg'

  const router = useRouter()
  const userStore = useUserStore()
  const poemStore = usePoemStore()
  const musicStore = useMusicStore()
  const { t } = useI18n()

  const accountPath = ref<string | null>(null)
  const refreshing = ref(false)
  const refreshMessage = ref('')

  const defaultAccountPath = '~/.chinpoem/accounts'
  const isFallback = computed(() => accountStorage.isUsingFallbackStorage())

  onMounted(async () => {
    musicStore.startBackgroundMusic()
    accountPath.value = await accountStorage.getAccountDirectoryPath()
  })

  function toggleMusic() {
    musicStore.toggleMute()
  }

  async function handleRefresh() {
    refreshing.value = true
    refreshMessage.value = ''

    const loaded = await userStore.refreshAccount()
    if (loaded) {
      await poemStore.initialize()
      await router.replace({ name: 'home' })
    } else {
      refreshMessage.value = userStore.lastError || t('onboarding.missingAccountHint')
    }

    refreshing.value = false
  }
</script>

<style scoped>
  code {
    font-family: 'Fira Code', 'Courier New', monospace;
  }
</style>
