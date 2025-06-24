import type { SupportedLanguage } from './index'

export interface User {
  id: number
  username: string
  score: number
  language: SupportedLanguage
  isPaid?: boolean
}

export interface UserLoginForm {
  username: string
  password: string
}

export interface UserRegisterForm extends UserLoginForm {
  confirmPassword: string
}

export type RankType =
  | 'rank.baiDing'
  | 'rank.xueTong'
  | 'rank.xiuCai'
  | 'rank.linSheng'
  | 'rank.gongSheng'
  | 'rank.juRen'
  | 'rank.gongShi'
  | 'rank.jinShi'
  | 'rank.tanHua'
  | 'rank.bangYan'
  | 'rank.zhuangYuan'
