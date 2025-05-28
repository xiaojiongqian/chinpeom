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
    expect(ranks).toContain('白丁')
    expect(ranks).toContain('学童')
    expect(ranks).toContain('秀才')
    expect(ranks).toContain('廪生')
    expect(ranks).toContain('贡生')
    expect(ranks).toContain('举人')
    expect(ranks).toContain('贡士')
    expect(ranks).toContain('进士')
    expect(ranks).toContain('探花')
    expect(ranks).toContain('榜眼')
    expect(ranks).toContain('状元')

    // 检查得分范围是否正确
    expect(RANK_SCORE_MAPPING['白丁'].min).toBe(0)
    expect(RANK_SCORE_MAPPING['白丁'].max).toBe(10)

    expect(RANK_SCORE_MAPPING['学童'].min).toBe(11)
    expect(RANK_SCORE_MAPPING['学童'].max).toBe(25)

    expect(RANK_SCORE_MAPPING['状元'].min).toBe(341)
    expect(RANK_SCORE_MAPPING['状元'].max).toBe(Infinity)
  })

  it('根据得分应能正确判断学级称号', () => {
    const getRank = (score: number): AcademicRank => {
      for (const [rank, range] of Object.entries(RANK_SCORE_MAPPING)) {
        if (score >= range.min && score <= range.max) {
          return rank as AcademicRank
        }
      }
      return '白丁' // 默认值
    }

    expect(getRank(0)).toBe('白丁')
    expect(getRank(10)).toBe('白丁')
    expect(getRank(11)).toBe('学童')
    expect(getRank(25)).toBe('学童')
    expect(getRank(50)).toBe('廪生')
    expect(getRank(100)).toBe('贡生')
    expect(getRank(200)).toBe('进士')
    expect(getRank(300)).toBe('榜眼')
    expect(getRank(500)).toBe('状元')
  })
})
