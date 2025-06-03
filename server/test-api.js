#!/usr/bin/env node

import http from 'http'
import { spawn } from 'child_process'

const BASE_URL = 'http://localhost:3001'
const tests = []
let passedTests = 0
let failedTests = 0

// 测试结果收集
function addTest(name, testFn) {
  tests.push({ name, testFn })
}

// HTTP请求工具
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null
          resolve({ statusCode: res.statusCode, body: parsed, headers: res.headers })
        } catch (e) {
          resolve({ statusCode: res.statusCode, body, headers: res.headers })
        }
      })
    })

    req.on('error', reject)

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

// 断言工具
function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

// 启动服务器
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 正在启动服务器...')
    const server = spawn('node', ['server.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' }
    })

    let started = false
    const timeout = setTimeout(() => {
      if (!started) {
        server.kill()
        reject(new Error('服务器启动超时'))
      }
    }, 10000)

    server.stdout.on('data', (data) => {
      const output = data.toString()
      console.log('服务器输出:', output)
      if (output.includes('服务器运行在') && !started) {
        started = true
        clearTimeout(timeout)
        console.log('✅ 服务器启动成功')
        setTimeout(resolve, 1000) // 等待1秒确保服务器完全启动
      }
    })

    server.stderr.on('data', (data) => {
      console.error('服务器错误:', data.toString())
    })

    server.on('close', (code) => {
      if (!started) {
        reject(new Error(`服务器启动失败，退出代码: ${code}`))
      }
    })

    // 返回服务器进程以便后续关闭
    resolve.server = server
  })
}

// API测试用例
addTest('健康检查接口', async () => {
  const response = await makeRequest('GET', '/api/health')
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.status === 'ok', '期望返回状态为ok')
  assert(typeof response.body.uptime === 'number', '期望返回运行时间')
})

addTest('微信登录接口', async () => {
  const loginData = {
    provider: 'wechat',
    access_token: 'valid_wechat_token'
  }
  const response = await makeRequest('POST', '/api/auth/login', loginData)
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '登录成功', '期望登录成功消息')
  assert(response.body.user && response.body.user.id, '期望返回用户信息')
  assert(response.body.token, '期望返回JWT令牌')
  
  // 保存token用于后续测试
  global.testToken = response.body.token
  global.testUserId = response.body.user.id
})

addTest('Google登录接口', async () => {
  const loginData = {
    provider: 'google',
    access_token: 'valid_google_token'
  }
  const response = await makeRequest('POST', '/api/auth/login', loginData)
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '登录成功', '期望登录成功消息')
  assert(response.body.user.display_name.includes('Google'), '期望Google用户名称')
})

addTest('无效平台登录测试', async () => {
  const loginData = {
    provider: 'invalid_platform',
    access_token: 'some_token'
  }
  const response = await makeRequest('POST', '/api/auth/login', loginData)
  assert(response.statusCode === 400, `期望状态码400，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '不支持的第三方平台', '期望错误消息')
})

addTest('令牌验证接口', async () => {
  if (!global.testToken) {
    throw new Error('需要先进行登录测试获取token')
  }
  
  const response = await makeRequest('GET', '/api/auth/verify', null, {
    'Authorization': `Bearer ${global.testToken}`
  })
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.valid === true, '期望令牌有效')
})

addTest('用户信息接口', async () => {
  if (!global.testToken) {
    throw new Error('需要先进行登录测试获取token')
  }
  
  const response = await makeRequest('GET', '/api/user/profile', null, {
    'Authorization': `Bearer ${global.testToken}`
  })
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.user, '期望返回用户信息')
  assert(response.body.user.id === global.testUserId, '期望用户ID匹配')
})

addTest('学级配置接口', async () => {
  const response = await makeRequest('GET', '/api/config/ranks')
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(Array.isArray(response.body.ranks), '期望返回学级数组')
  assert(response.body.ranks.length > 0, '期望至少有一个学级')
  
  const baiDing = response.body.ranks.find(r => r.rank_name === '白丁')
  assert(baiDing, '期望包含白丁学级')
  assert(baiDing.min_score === 0, '期望白丁最低分数为0')
})

addTest('产品配置接口', async () => {
  const response = await makeRequest('GET', '/api/payment/products')
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(Array.isArray(response.body.products), '期望返回产品数组')
  assert(response.body.products.length > 0, '期望至少有一个产品')
  assert(Array.isArray(response.body.supported_payment_methods), '期望返回支付方式数组')
})

// 运行测试
async function runTests() {
  console.log('🧪 开始API接口测试\n')
  
  let serverProcess = null
  
  try {
    // 启动服务器
    const startPromise = startServer()
    serverProcess = startPromise.server
    await startPromise
    
    console.log(`\n📝 运行 ${tests.length} 个测试用例...\n`)
    
    // 运行所有测试
    for (const test of tests) {
      try {
        console.log(`⏳ 运行: ${test.name}`)
        await test.testFn()
        console.log(`✅ 通过: ${test.name}`)
        passedTests++
      } catch (error) {
        console.log(`❌ 失败: ${test.name}`)
        console.log(`   错误: ${error.message}`)
        failedTests++
      }
      console.log('')
    }
    
  } catch (error) {
    console.error('❌ 测试运行失败:', error.message)
    process.exit(1)
  } finally {
    // 关闭服务器
    if (serverProcess) {
      console.log('🛑 关闭服务器...')
      serverProcess.kill('SIGTERM')
      setTimeout(() => serverProcess.kill('SIGKILL'), 3000)
    }
  }
  
  // 生成测试报告
  console.log('📊 测试报告')
  console.log('='.repeat(50))
  console.log(`总测试数: ${tests.length}`)
  console.log(`✅ 通过: ${passedTests}`)
  console.log(`❌ 失败: ${failedTests}`)
  console.log(`📈 通过率: ${(passedTests / tests.length * 100).toFixed(1)}%`)
  
  if (failedTests > 0) {
    console.log('\n❌ 存在失败的测试用例')
    process.exit(1)
  } else {
    console.log('\n🎉 所有测试用例通过！')
    process.exit(0)
  }
}

// 启动测试
runTests().catch(error => {
  console.error('测试运行异常:', error)
  process.exit(1)
}) 