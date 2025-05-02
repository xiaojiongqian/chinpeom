export interface User {
  id: number;
  username: string;
  score: number;
  language: string;
}

export interface UserLoginForm {
  username: string;
  password: string;
}

export interface UserRegisterForm extends UserLoginForm {
  confirmPassword: string;
}

export type RankType = 
  | '白丁'
  | '学童'
  | '秀才'
  | '廪生'
  | '贡生'
  | '举人'
  | '贡士'
  | '进士'
  | '探花'
  | '榜眼'
  | '状元'; 