import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import jwt from 'jsonwebtoken'
import { auth } from '../middleware/auth.js'
import config from '../config/env/default.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 用户数据文件路径
const DATA_FILE = join(__dirname, '../data/users.json')

// 读取用户数据
const readUsers = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // 如果文件不存在，创建一个空的用户数据文件
      fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }))
      return { users: [] }
    }

    const data = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取用户数据失败:', error)
    return { users: [] }
  }
}

// 写入用户数据
const writeUsers = data => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('写入用户数据失败:', error)
    return false
  }
}

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: '用户名、邮箱和密码不能为空' })
    }

    const userData = readUsers()

    // 检查用户是否已存在
    if (userData.users.some(user => user.email === email)) {
      return res.status(400).json({ message: '该邮箱已被注册' })
    }

    // 创建新用户
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password, // 注意：实际应用中应该对密码进行哈希处理
      score: 0,
      language: 'english',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 添加用户到数据
    userData.users.push(newUser)
    writeUsers(userData)

    // 生成JWT
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, config.jwtSecret, {
      expiresIn: config.jwtExpire
    })

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json({
      message: '注册成功',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' })
    }

    const userData = readUsers()

    // 查找用户
    const user = userData.users.find(user => user.email === email)

    if (!user || user.password !== password) {
      // 实际应用中应比较哈希值
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    // 生成JWT
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpire
    })

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user

    res.json({
      message: '登录成功',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取用户信息
router.get('/me', auth, async (req, res) => {
  try {
    const userData = readUsers()
    const user = userData.users.find(user => user.id === req.user.id)

    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user

    res.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 更新用户分数
router.put('/score', auth, async (req, res) => {
  try {
    const { scoreDelta } = req.body

    if (typeof scoreDelta !== 'number') {
      return res.status(400).json({ message: '分数增量必须是数字' })
    }

    const userData = readUsers()
    const userIndex = userData.users.findIndex(user => user.id === req.user.id)

    if (userIndex === -1) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 更新用户分数
    userData.users[userIndex].score += scoreDelta
    userData.users[userIndex].updatedAt = new Date().toISOString()

    // 保存更新
    writeUsers(userData)

    // 返回更新后的用户信息（不包含密码）
    const { password, ...userWithoutPassword } = userData.users[userIndex]

    res.json({
      message: '分数更新成功',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('更新分数失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 更新用户语言设置
router.put('/language', auth, async (req, res) => {
  try {
    const { language } = req.body

    if (!language) {
      return res.status(400).json({ message: '语言不能为空' })
    }

    const userData = readUsers()
    const userIndex = userData.users.findIndex(user => user.id === req.user.id)

    if (userIndex === -1) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 更新用户语言设置
    userData.users[userIndex].language = language
    userData.users[userIndex].updatedAt = new Date().toISOString()

    // 保存更新
    writeUsers(userData)

    // 返回更新后的用户信息（不包含密码）
    const { password, ...userWithoutPassword } = userData.users[userIndex]

    res.json({
      message: '语言设置更新成功',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('更新语言设置失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取排行榜
router.get('/leaderboard', async (req, res) => {
  try {
    const userData = readUsers()

    // 获取排行榜（按分数降序排列，只返回前10名）
    const leaderboard = userData.users
      .map(user => {
        const { id, username, score } = user
        return { id, username, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    res.json({ leaderboard })
  } catch (error) {
    console.error('获取排行榜失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router
