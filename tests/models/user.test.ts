import { describe, it, expect } from 'vitest'
import { User, RANK_SCORE_MAPPING, AcademicRank } from '../../src/types'

describe('用户数据模型测试', () => {
  it('用户对象应符合类型定义', () => {
    const user: User = {
      id: 1,
      username: '测试用户',
      score: 50,
      language: 'english'
    }

    expect(user.id).toBe(1)
    expect(user.username).toBe('测试用户')
    expect(user.score).toBe(50)
    expect(user.language).toBe('english')
  })

  it('学级称号映射应覆盖所有得分范围', () => {
    const ranks = Object.keys(RANK_SCORE_MAPPING) as AcademicRank[]

    // 检查是否包含所有学级称号
    expect(ranks).toContain('rank.baiDing')
    expect(ranks).toContain('rank.xueTong')
    expect(ranks).toContain('rank.xiuCai')
    expect(ranks).toContain('rank.linSheng')
    expect(ranks).toContain('rank.gongSheng')
    expect(ranks).toContain('rank.juRen')
    expect(ranks).toContain('rank.gongShi')
    expect(ranks).toContain('rank.jinShi')
    expect(ranks).toContain('rank.tanHua')
    expect(ranks).toContain('rank.bangYan')
    expect(ranks).toContain('rank.zhuangYuan')

    // 检查得分范围是否正确
    expect(RANK_SCORE_MAPPING['rank.baiDing'].min).toBe(0)
    expect(RANK_SCORE_MAPPING['rank.baiDing'].max).toBe(10)

    expect(RANK_SCORE_MAPPING['rank.xueTong'].min).toBe(11)
    expect(RANK_SCORE_MAPPING['rank.xueTong'].max).toBe(25)

    expect(RANK_SCORE_MAPPING['rank.zhuangYuan'].min).toBe(341)
    expect(RANK_SCORE_MAPPING['rank.zhuangYuan'].max).toBe(Infinity)
  })

  it('根据得分应能正确判断学级称号', () => {
    const getRank = (score: number): AcademicRank => {
      for (const [rank, range] of Object.entries(RANK_SCORE_MAPPING)) {
        if (score >= range.min && score <= range.max) {
          return rank as AcademicRank
        }
      }
      return 'rank.baiDing' // 默认值
    }

    expect(getRank(0)).toBe('rank.baiDing')
    expect(getRank(10)).toBe('rank.baiDing')
    expect(getRank(11)).toBe('rank.xueTong')
    expect(getRank(25)).toBe('rank.xueTong')
    expect(getRank(50)).toBe('rank.linSheng')
    expect(getRank(100)).toBe('rank.gongSheng')
    expect(getRank(200)).toBe('rank.jinShi')
    expect(getRank(300)).toBe('rank.bangYan')
    expect(getRank(500)).toBe('rank.zhuangYuan')
  })
})
