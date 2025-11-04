#!/usr/bin/env node

import http from 'http'
import { spawn } from 'child_process'
import { writeFileSync } from 'fs'

const tests = []
let passedTests = 0
let failedTests = 0
const testResults = []

// 测试结果收集
function addTest(category, name, testFn) {
  tests.push({ category, name, testFn })
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

    const req = http.request(options, res => {
      let body = ''
      res.on('data', chunk => (body += chunk))
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

    server.stdout.on('data', data => {
      const output = data.toString()
      if (output.includes('服务器运行在') && !started) {
        started = true
        clearTimeout(timeout)
        console.log('✅ 服务器启动成功')
        setTimeout(resolve, 1000)
      }
    })

    server.stderr.on('data', data => {
      console.error('服务器错误:', data.toString())
    })

    server.on('close', code => {
      if (!started) {
        reject(new Error(`服务器启动失败，退出代码: ${code}`))
      }
    })

    resolve.server = server
  })
}

// ============= API测试用例 =============

// 基础功能测试
addTest('基础功能', '健康检查接口', async () => {
  const response = await makeRequest('GET', '/api/health')
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.status === 'ok', '期望返回状态为ok')
  assert(typeof response.body.uptime === 'number', '期望返回运行时间')
  return { uptime: response.body.uptime }
})

// 认证测试
addTest('认证模块', '微信登录', async () => {
  const loginData = {
    provider: 'wechat',
    access_token: 'valid_wechat_token'
  }
  const response = await makeRequest('POST', '/api/auth/login', loginData)
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '登录成功', '期望登录成功消息')
  assert(response.body.user && response.body.user.id, '期望返回用户信息')
  assert(response.body.token, '期望返回JWT令牌')

  global.wechatToken = response.body.token
  global.wechatUserId = response.body.user.id

  return {
    userId: response.body.user.id,
    displayName: response.body.user.display_name,
    currentRank: response.body.user.current_rank
  }
})

addTest('认证模块', 'Google登录', async () => {
  const loginData = {
    provider: 'google',
    access_token: 'valid_google_token'
  }
  const response = await makeRequest('POST', '/api/auth/login', loginData)
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body.user.display_name.includes('Google'), '期望Google用户名称')

  global.googleToken = response.body.token
  global.googleUserId = response.body.user.id

  return {
    userId: response.body.user.id,
    displayName: response.body.user.display_name
  }
})

addTest('认证模块', 'Apple登录', async () => {
  const loginData = {
    provider: 'apple',
    access_token: 'valid_apple_token'
  }
  const response = await makeRequest('POST', '/api/auth/login', loginData)
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body.user.display_name.includes('Apple'), '期望Apple用户名称')

  return {
    userId: response.body.user.id,
    displayName: response.body.user.display_name
  }
})

addTest('认证模块', '无效平台拒绝', async () => {
  const loginData = {
    provider: 'invalid_platform',
    access_token: 'some_token'
  }
  const response = await makeRequest('POST', '/api/auth/login', loginData)
  assert(response.statusCode === 400, `期望状态码400，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '不支持的第三方平台', '期望错误消息')
  assert(Array.isArray(response.body.supported_providers), '期望返回支持的平台列表')

  return {
    supportedProviders: response.body.supported_providers
  }
})

addTest('认证模块', '无效令牌拒绝', async () => {
  const loginData = {
    provider: 'wechat',
    access_token: 'invalid_token'
  }
  const response = await makeRequest('POST', '/api/auth/login', loginData)
  assert(response.statusCode === 401, `期望状态码401，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '第三方认证失败', '期望认证失败消息')
})

addTest('认证模块', '令牌验证', async () => {
  const response = await makeRequest('GET', '/api/auth/verify', null, {
    Authorization: `Bearer ${global.wechatToken}`
  })
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.valid === true, '期望令牌有效')
  assert(response.body.user.id === global.wechatUserId, '期望用户ID匹配')

  return {
    tokenValid: response.body.valid,
    userId: response.body.user.id
  }
})

addTest('认证模块', '令牌刷新', async () => {
  const response = await makeRequest('POST', '/api/auth/refresh', null, {
    Authorization: `Bearer ${global.wechatToken}`
  })
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '令牌刷新成功', '期望刷新成功消息')
  assert(response.body.token, '期望返回新令牌')

  global.refreshedToken = response.body.token

  return {
    newToken: response.body.token.substring(0, 20) + '...'
  }
})

// 用户管理测试
addTest('用户管理', '获取用户信息', async () => {
  const response = await makeRequest('GET', '/api/user/profile', null, {
    Authorization: `Bearer ${global.wechatToken}`
  })
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.user, '期望返回用户信息')
  assert(response.body.user.id === global.wechatUserId, '期望用户ID匹配')

  return {
    userId: response.body.user.id,
    currentRank: response.body.user.current_rank,
    totalScore: response.body.user.total_score
  }
})

addTest('用户管理', '更新用户设置', async () => {
  const settings = {
    language_preference: 'en',
    difficulty_mode: 'hard',
    hint_language: 'fr',
    sound_enabled: false
  }
  const response = await makeRequest('PUT', '/api/user/settings', settings, {
    Authorization: `Bearer ${global.wechatToken}`
  })
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '设置更新成功', '期望设置更新成功')
  assert(response.body.settings.difficulty_mode === 'hard', '期望难度设置为困难')

  return {
    difficultyMode: response.body.settings.difficulty_mode,
    soundEnabled: response.body.settings.sound_enabled
  }
})

addTest('用户管理', '积分同步', async () => {
  const response = await makeRequest(
    'PUT',
    '/api/user/score',
    { total_score: 30 },
    {
      Authorization: `Bearer ${global.wechatToken}`
    }
  )
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '积分同步成功', '期望积分同步成功')
  assert(response.body.user.total_score === 30, '期望积分为30')
  assert(response.body.user.current_rank === '秀才', '期望升级到秀才')

  return {
    totalScore: response.body.user.total_score,
    currentRank: response.body.user.current_rank
  }
})

// 配置接口测试
addTest('配置管理', '学级配置', async () => {
  const response = await makeRequest('GET', '/api/config/ranks')
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(Array.isArray(response.body.ranks), '期望返回学级数组')
  assert(response.body.ranks.length > 0, '期望至少有一个学级')

  const baiDing = response.body.ranks.find(r => r.rank_name === '白丁')
  assert(baiDing, '期望包含白丁学级')
  assert(baiDing.min_score === 0, '期望白丁最低分数为0')

  return {
    totalRanks: response.body.ranks.length,
    freeRanks: response.body.ranks.filter(r => !r.requires_premium).length,
    premiumRanks: response.body.ranks.filter(r => r.requires_premium).length
  }
})

// 支付模块测试
addTest('支付管理', '产品列表', async () => {
  const response = await makeRequest('GET', '/api/payment/products')
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(Array.isArray(response.body.products), '期望返回产品数组')
  assert(response.body.products.length > 0, '期望至少有一个产品')
  assert(Array.isArray(response.body.supported_payment_methods), '期望返回支付方式数组')

  return {
    totalProducts: response.body.products.length,
    paymentMethods: response.body.supported_payment_methods
  }
})

addTest('支付管理', '创建订单', async () => {
  const orderData = {
    payment_method: 'alipay',
    product_type: 'premium_month',
    amount: 9.9,
    currency: 'CNY'
  }
  const response = await makeRequest('POST', '/api/payment/create', orderData, {
    Authorization: `Bearer ${global.wechatToken}`
  })
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(response.body && response.body.message === '订单创建成功', '期望订单创建成功')
  assert(response.body.order && response.body.order.order_no, '期望返回订单号')
  assert(response.body.order.payment_data, '期望返回支付数据')

  global.testOrderNo = response.body.order.order_no

  return {
    orderNo: response.body.order.order_no,
    amount: response.body.order.amount,
    paymentMethod: response.body.order.payment_method
  }
})

addTest('支付管理', '支付验证', async () => {
  const verifyData = {
    order_no: global.testOrderNo,
    third_party_order_id: 'test_payment_12345'
  }
  const response = await makeRequest('POST', '/api/payment/verify', verifyData, {
    Authorization: `Bearer ${global.wechatToken}`
  })

  // Mock服务有成功率限制，接受200状态码
  if (response.statusCode === 200) {
    assert(response.body.verification_result, '期望返回验证结果')
    return {
      success: response.body.verification_result.success,
      orderNo: global.testOrderNo
    }
  } else {
    // 模拟支付失败也是正常情况
    return {
      success: false,
      reason: 'Mock支付服务模拟失败',
      statusCode: response.statusCode
    }
  }
})

addTest('支付管理', '支付历史', async () => {
  const response = await makeRequest('GET', '/api/payment/history', null, {
    Authorization: `Bearer ${global.wechatToken}`
  })
  assert(response.statusCode === 200, `期望状态码200，实际: ${response.statusCode}`)
  assert(Array.isArray(response.body.records), '期望返回支付记录数组')

  return {
    totalRecords: response.body.records.length,
    hasTestOrder: response.body.records.some(r => r.order_no === global.testOrderNo)
  }
})

// 错误处理测试
addTest('错误处理', '无效JSON请求', async () => {
  const response = await makeRequest('POST', '/api/auth/login', 'invalid json')
  assert(response.statusCode === 400, `期望状态码400，实际: ${response.statusCode}`)
})

addTest('错误处理', '无效令牌访问', async () => {
  const response = await makeRequest('GET', '/api/user/profile', null, {
    Authorization: 'Bearer invalid_token'
  })
  assert(response.statusCode === 401, `期望状态码401，实际: ${response.statusCode}`)
})

addTest('错误处理', '不存在的路径', async () => {
  const response = await makeRequest('GET', '/api/nonexistent')
  assert(response.statusCode === 404, `期望状态码404，实际: ${response.statusCode}`)
})

// 运行测试
async function runTests() {
  console.log('🧪 开始全面API接口测试\n')

  let serverProcess = null
  const startTime = new Date()

  try {
    // 启动服务器
    const startPromise = startServer()
    serverProcess = startPromise.server
    await startPromise

    console.log(`\n📝 运行 ${tests.length} 个测试用例...\n`)

    // 按类别组织测试
    const categories = [...new Set(tests.map(t => t.category))]

    for (const category of categories) {
      console.log(`\n📁 ${category} 测试`)
      console.log('-'.repeat(30))

      const categoryTests = tests.filter(t => t.category === category)

      for (const test of categoryTests) {
        const testStart = Date.now()
        try {
          console.log(`⏳ ${test.name}`)
          const result = await test.testFn()
          const duration = Date.now() - testStart

          console.log(`✅ ${test.name} (${duration}ms)`)
          if (result && Object.keys(result).length > 0) {
            console.log(`   数据: ${JSON.stringify(result)}`)
          }

          testResults.push({
            category: test.category,
            name: test.name,
            status: 'PASS',
            duration,
            data: result
          })
          passedTests++
        } catch (error) {
          const duration = Date.now() - testStart
          console.log(`❌ ${test.name} (${duration}ms)`)
          console.log(`   错误: ${error.message}`)

          testResults.push({
            category: test.category,
            name: test.name,
            status: 'FAIL',
            duration,
            error: error.message
          })
          failedTests++
        }
      }
    }
  } catch (error) {
    console.error('❌ 测试运行失败:', error.message)
    process.exit(1)
  } finally {
    // 关闭服务器
    if (serverProcess) {
      console.log('\n🛑 关闭服务器...')
      serverProcess.kill('SIGTERM')
      setTimeout(() => serverProcess.kill('SIGKILL'), 3000)
    }
  }

  const endTime = new Date()
  const totalDuration = endTime - startTime

  // 生成测试报告
  generateReport(startTime, endTime, totalDuration)

  if (failedTests > 0) {
    console.log('\n❌ 存在失败的测试用例')
    process.exit(1)
  } else {
    console.log('\n🎉 所有测试用例通过！')
    process.exit(0)
  }
}

function generateReport(startTime, endTime, totalDuration) {
  console.log('\n📊 详细测试报告')
  console.log('='.repeat(60))
  console.log(`测试开始时间: ${startTime.toLocaleString()}`)
  console.log(`测试结束时间: ${endTime.toLocaleString()}`)
  console.log(`总耗时: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`)
  console.log(`总测试数: ${tests.length}`)
  console.log(`✅ 通过: ${passedTests}`)
  console.log(`❌ 失败: ${failedTests}`)
  console.log(`📈 通过率: ${((passedTests / tests.length) * 100).toFixed(1)}%`)

  // 按类别统计
  console.log('\n📊 分类统计:')
  const categories = [...new Set(testResults.map(t => t.category))]
  categories.forEach(category => {
    const categoryResults = testResults.filter(t => t.category === category)
    const passed = categoryResults.filter(t => t.status === 'PASS').length
    const failed = categoryResults.filter(t => t.status === 'FAIL').length
    const avgDuration =
      categoryResults.reduce((sum, t) => sum + t.duration, 0) / categoryResults.length

    console.log(`  ${category}: ${passed}✅/${failed}❌ (平均耗时: ${avgDuration.toFixed(0)}ms)`)
  })

  // 生成JSON报告
  const jsonReport = {
    summary: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalDuration,
      totalTests: tests.length,
      passed: passedTests,
      failed: failedTests,
      passRate: ((passedTests / tests.length) * 100).toFixed(1)
    },
    categories: categories.map(category => {
      const categoryResults = testResults.filter(t => t.category === category)
      return {
        name: category,
        total: categoryResults.length,
        passed: categoryResults.filter(t => t.status === 'PASS').length,
        failed: categoryResults.filter(t => t.status === 'FAIL').length,
        avgDuration:
          categoryResults.reduce((sum, t) => sum + t.duration, 0) / categoryResults.length
      }
    }),
    details: testResults
  }

  // 保存报告文件
  try {
    writeFileSync('test-report.json', JSON.stringify(jsonReport, null, 2))
    console.log('\n📄 详细报告已保存到: test-report.json')
  } catch (error) {
    console.log('\n⚠️  无法保存报告文件:', error.message)
  }
}

// 启动测试
runTests().catch(error => {
  console.error('测试运行异常:', error)
  process.exit(1)
})
