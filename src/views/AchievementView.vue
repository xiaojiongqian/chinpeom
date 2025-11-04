<template>
  <div class="min-h-screen bg-gray-100 pb-16 flex flex-col">
    <header class="pt-6 pb-3 text-center space-y-1">
      <h1 class="text-2xl font-bold text-gray-800">
        {{ $t('achievement.title') }}
      </h1>
      <p class="text-sm text-gray-500">
        {{ $t('achievement.subtitle') }}
      </p>
    </header>

    <main class="flex-1 px-4 space-y-4">
      <section class="bg-white rounded-xl shadow-md p-5 space-y-4">
        <div class="flex items-center space-x-3">
          <div
            class="h-16 w-16 rounded-full bg-success-500 flex items-center justify-center text-2xl text-white"
          >
            {{ userStore.rankDetails.emoji }}
          </div>
          <div class="space-y-1">
            <h2 class="text-xl font-semibold text-gray-800">
              {{ userStore.displayName || '-' }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ $t('achievement.currentRankLabel') }} · {{ $t(userStore.rank) }}
            </p>
          </div>
        </div>

        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
          <div>
            <dt class="text-xs uppercase tracking-wide text-gray-500">
              {{ $t('achievement.accountLabel') }}
            </dt>
            <dd class="mt-0.5 font-mono text-gray-900">
              {{ userStore.accountName || '-' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-gray-500">
              {{ $t('achievement.scoreLabel') }}
            </dt>
            <dd class="mt-0.5 font-semibold text-gray-900">
              {{ userStore.score }} {{ $t('achievement.pointsLabel') }}
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs uppercase tracking-wide text-gray-500">
              {{ $t('achievement.lastPlayedLabel') }}
            </dt>
            <dd class="mt-0.5 text-gray-800">
              {{ lastPlayedText }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="bg-white rounded-xl shadow-md p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h3 class="text-base font-semibold text-gray-800">
              {{ $t('achievement.progressTitle') }}
            </h3>
            <p class="text-xs text-gray-500">
              {{ nextRankLabel }}
            </p>
          </div>
          <p class="text-sm font-medium text-gray-700">
            {{ nextRankHint }}
          </p>
        </div>

        <div
          class="w-full bg-gray-200 rounded-full h-3"
          role="progressbar"
          :aria-valuenow="scoreProgress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="bg-success-500 h-3 rounded-full transition-all"
            :style="{ width: `${scoreProgress}%` }"
          ></div>
        </div>
      </section>

      <section class="bg-white rounded-xl shadow-md p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 class="text-base font-semibold text-gray-800">
            {{ $t('achievement.statsTitle') }}
          </h3>
          <p class="text-xs text-gray-500">
            {{ $t('achievement.accuracyLabel') }}：
            <span class="font-semibold text-gray-800">{{ accuracy }}%</span>
          </p>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="rounded-lg bg-gray-50 py-3">
            <p class="text-xs text-gray-500">{{ $t('achievement.totalAnsweredLabel') }}</p>
            <p class="mt-1 text-lg font-semibold text-gray-800">{{ stats.totalAnswered }}</p>
          </div>
          <div class="rounded-lg bg-success-50 py-3">
            <p class="text-xs text-success-600">{{ $t('achievement.correctAnswersLabel') }}</p>
            <p class="mt-1 text-lg font-semibold text-success-700">{{ stats.correctAnswers }}</p>
          </div>
          <div class="rounded-lg bg-red-50 py-3">
            <p class="text-xs text-red-600">{{ $t('achievement.incorrectAnswersLabel') }}</p>
            <p class="mt-1 text-lg font-semibold text-red-600">{{ stats.incorrectAnswers }}</p>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-xl shadow-md p-5 space-y-3">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-base font-semibold text-gray-800">
              {{ $t('achievement.levelSystemTitle') }}
            </h3>
            <p class="text-xs text-gray-500">
              {{ $t('achievement.levelSystemDesc') }}
            </p>
          </div>
          <button
            class="text-sm text-success-600 hover:text-success-700 font-medium"
            type="button"
            @click="showRankInfo = true"
          >
            {{ $t('achievement.levelSystemAction') }}
          </button>
        </div>
      </section>
    </main>

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

    <div
      v-if="showRankInfo"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 px-4"
      @click.self="showRankInfo = false"
    >
      <div
        class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5 space-y-4"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ $t('achievement.rankSystemTitle') }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600"
            type="button"
            :aria-label="$t('achievement.close')"
            @click="showRankInfo = false"
          >
            ×
          </button>
        </div>
        <p class="text-xs text-gray-500">
          {{ $t('achievement.rankSystemDesc') }}
        </p>
        <div class="space-y-3">
          <article
            v-for="level in rankLevels"
            :key="level.name"
            class="p-3 border rounded-lg transition-colors"
            :class="
              level.name === userStore.rank ? 'border-success-500 bg-success-50' : 'border-gray-200'
            "
          >
            <div class="flex items-center space-x-3">
              <span class="text-xl">{{ level.emoji }}</span>
              <div class="flex-1">
                <div class="flex items-baseline gap-1 flex-wrap">
                  <h4 class="font-semibold text-gray-800">{{ $t(level.name) }}</h4>
                  <span class="text-xs text-gray-500"
                    >：{{ formatScoreRange(level.minScore, level.maxScore) }}</span
                  >
                </div>
              </div>
              <span
                v-if="level.name === userStore.rank"
                class="ml-auto px-2 py-0.5 text-xs rounded-full bg-success-500 text-white"
              >
                {{ $t('achievement.currentLevelTag') }}
              </span>
            </div>
            <p class="mt-2 text-xs text-gray-600">
              {{ $t(level.description) }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/stores/user'
  import { ACADEMIC_RANKS } from '@/config/ranks'

  const userStore = useUserStore()
  const { t } = useI18n()

  const showRankInfo = ref(false)

  const stats = computed(() => userStore.stats)

  const accuracy = computed(() => {
    if (stats.value.totalAnswered === 0) return 0
    return Math.round((stats.value.correctAnswers / stats.value.totalAnswered) * 100)
  })

  const rankLevels = computed(() => ACADEMIC_RANKS)

  const pointsUnit = computed(() => t('achievement.pointsLabel'))

  const pointsToNext = computed(() => userStore.scoreToNextRank)

  const scoreProgress = computed(() => {
    const currentRank = userStore.rankDetails
    const min = currentRank.minScore
    const max =
      currentRank.maxScore === Infinity ? Math.max(min, userStore.score) : currentRank.maxScore
    if (max === min) return 100

    const ratio = ((userStore.score - min) / (max - min)) * 100
    return Math.min(100, Math.max(0, Math.round(ratio)))
  })

  const nextRankLabel = computed(() => {
    const next = userStore.nextRank
    if (!next) {
      return t('achievement.maxRankReachedShort')
    }
    return t('achievement.nextRankLabel', { rank: t(next.name) })
  })

  const nextRankHint = computed(() => {
    const next = userStore.nextRank
    if (!next) {
      return t('achievement.maxRankReached')
    }
    return t('achievement.nextRankHint', {
      rank: t(next.name),
      points: pointsToNext.value,
      unit: pointsUnit.value
    })
  })

  const lastPlayedText = computed(() => {
    const iso = stats.value.lastAnsweredAt
    if (!iso) return t('achievement.noHistory')
    return formatDate(iso)
  })

  function formatDate(iso: string) {
    try {
      const date = new Date(iso)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    } catch {
      return iso
    }
  }

  function formatScoreRange(min: number, max: number) {
    if (max === Infinity) {
      return t('achievement.scoreRangeOpen', { min, unit: pointsUnit.value })
    }
    return t('achievement.scoreRangeClosed', { min, max, unit: pointsUnit.value })
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
