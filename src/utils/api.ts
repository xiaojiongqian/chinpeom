import { User, Poem, TranslatedPoem, SupportedLanguage } from '../types'
import { getLocalStorage, setLocalStorage } from './helpers'

/**
 * 模拟API响应延迟
 * @param ms 延迟毫秒数
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 模拟API用户接口
 */
export const userApi = {
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 登录用户信息与令牌
   */
  async login(username: string, password: string): Promise<{ user: User, token: string }> {
    await delay(300)
    
    // 从本地存储获取用户
    const users = getLocalStorage<User[]>('users', [])
    const user = users.find(u => u.username === username)
    
    if (!user) {
      throw new Error('用户不存在')
    }
    
    // 真实环境中应进行密码验证
    
    return {
      user,
      token: `mock-token-${Date.now()}`
    }
  },
  
  /**
   * 用户注册
   * @param username 用户名
   * @param password 密码
   * @returns 新用户信息与令牌
   */
  async register(username: string, password: string): Promise<{ user: User, token: string }> {
    await delay(300)
    
    // 从本地存储获取用户
    const users = getLocalStorage<User[]>('users', [])
    
    // 检查用户名是否已存在
    if (users.some(u => u.username === username)) {
      throw new Error('用户名已存在')
    }
    
    // 创建新用户
    const newUser: User = {
      id: Date.now(),
      username,
      score: 0,
      language: 'english'
    }
    
    // 保存到本地存储
    users.push(newUser)
    setLocalStorage('users', users)
    
    return {
      user: newUser,
      token: `mock-token-${Date.now()}`
    }
  },
  
  /**
   * 获取用户信息
   * @param token 用户令牌
   * @returns 用户信息
   */
  async getUserInfo(token: string): Promise<User> {
    await delay(200)
    
    // 从本地存储获取用户
    const users = getLocalStorage<User[]>('users', [])
    
    // 这里应该根据token获取对应用户
    // 模拟环境中简单返回第一个用户
    const user = users[0]
    
    if (!user) {
      throw new Error('用户不存在')
    }
    
    return user
  },
  
  /**
   * 更新用户得分
   * @param userId 用户ID
   * @param scoreDelta 分数变化值
   * @returns 更新后的用户信息
   */
  async updateScore(userId: number, scoreDelta: number): Promise<User> {
    await delay(200)
    
    // 从本地存储获取用户
    const users = getLocalStorage<User[]>('users', [])
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }
    
    // 更新分数
    users[userIndex].score += scoreDelta
    
    // 保存回本地存储
    setLocalStorage('users', users)
    
    return users[userIndex]
  }
}

/**
 * 模拟API诗歌接口
 */
export const poemApi = {
  /**
   * 获取所有中文诗歌
   * @returns 中文诗歌列表
   */
  async getChinesePoems(): Promise<Poem[]> {
    await delay(500)
    
    try {
      const response = await fetch('/resource/poem_chinese.json')
      return await response.json()
    } catch (error) {
      console.error('获取中文诗歌失败', error)
      return []
    }
  },
  
  /**
   * 获取指定语言的诗歌翻译
   * @param language 语言
   * @returns 诗歌翻译列表
   */
  async getTranslations(language: SupportedLanguage): Promise<TranslatedPoem[]> {
    await delay(500)
    
    try {
      const response = await fetch(`/resource/poem_${language}.json`)
      return await response.json()
    } catch (error) {
      console.error(`获取${language}翻译失败`, error)
      return []
    }
  },
  
  /**
   * 获取随机诗歌
   * @returns 随机诗歌
   */
  async getRandomPoem(): Promise<Poem> {
    const poems = await this.getChinesePoems()
    
    if (poems.length === 0) {
      throw new Error('诗歌数据为空')
    }
    
    const randomIndex = Math.floor(Math.random() * poems.length)
    return poems[randomIndex]
  },
  
  /**
   * 获取诗歌翻译
   * @param poemId 诗歌ID
   * @param language 语言
   * @returns 诗歌翻译
   */
  async getPoemTranslation(poemId: string, language: SupportedLanguage): Promise<TranslatedPoem | null> {
    const translations = await this.getTranslations(language)
    return translations.find(t => t.id === poemId) || null
  }
} 