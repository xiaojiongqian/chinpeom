import type { AcademicRank } from '@/types'

export interface AcademicRankDetail {
  name: AcademicRank
  minScore: number
  maxScore: number
  description: `rankDesc.${string}`
  emoji: string
}

export const ACADEMIC_RANKS: readonly AcademicRankDetail[] = [
  { name: 'rank.baiDing', minScore: 0, maxScore: 10, description: 'rankDesc.baiDing', emoji: '📚' },
  {
    name: 'rank.xueTong',
    minScore: 11,
    maxScore: 25,
    description: 'rankDesc.xueTong',
    emoji: '🎓'
  },
  {
    name: 'rank.xiuCai',
    minScore: 26,
    maxScore: 45,
    description: 'rankDesc.xiuCai',
    emoji: '📜'
  },
  {
    name: 'rank.linSheng',
    minScore: 46,
    maxScore: 70,
    description: 'rankDesc.linSheng',
    emoji: '🖋️'
  },
  {
    name: 'rank.gongSheng',
    minScore: 71,
    maxScore: 100,
    description: 'rankDesc.gongSheng',
    emoji: '📖'
  },
  {
    name: 'rank.juRen',
    minScore: 101,
    maxScore: 135,
    description: 'rankDesc.juRen',
    emoji: '🏆'
  },
  {
    name: 'rank.gongShi',
    minScore: 136,
    maxScore: 175,
    description: 'rankDesc.gongShi',
    emoji: '🎭'
  },
  {
    name: 'rank.jinShi',
    minScore: 176,
    maxScore: 220,
    description: 'rankDesc.jinShi',
    emoji: '👑'
  },
  {
    name: 'rank.tanHua',
    minScore: 221,
    maxScore: 280,
    description: 'rankDesc.tanHua',
    emoji: '🌸'
  },
  {
    name: 'rank.bangYan',
    minScore: 281,
    maxScore: 340,
    description: 'rankDesc.bangYan',
    emoji: '💎'
  },
  {
    name: 'rank.zhuangYuan',
    minScore: 341,
    maxScore: Infinity,
    description: 'rankDesc.zhuangYuan',
    emoji: '🥇'
  }
] as const

export const RANK_SCORE_MAPPING = ACADEMIC_RANKS.reduce<
  Record<AcademicRank, { min: number; max: number }>
>(
  (acc, rank) => {
    acc[rank.name] = { min: rank.minScore, max: rank.maxScore }
    return acc
  },
  {} as Record<AcademicRank, { min: number; max: number }>
)

export function resolveRankByScore(score: number): AcademicRankDetail {
  const normalizedScore = Math.max(0, Math.floor(score))
  const found = ACADEMIC_RANKS.find(
    rank => normalizedScore >= rank.minScore && normalizedScore <= rank.maxScore
  )
  return found ?? ACADEMIC_RANKS[0]
}

export function getNextRankDetail(current: AcademicRank): AcademicRankDetail | null {
  const index = ACADEMIC_RANKS.findIndex(rank => rank.name === current)
  if (index === -1 || index === ACADEMIC_RANKS.length - 1) {
    return null
  }
  return ACADEMIC_RANKS[index + 1]
}

export function getScoreToNextRank(score: number): number {
  const current = resolveRankByScore(score)
  const next = getNextRankDetail(current.name)
  if (!next) return 0
  return Math.max(0, next.minScore - Math.max(score, current.minScore))
}
