/**
 * API调用日志中间件
 * 记录所有API请求和响应，方便调试和监控
 * 包含日志轮转、大小限制和自动清理功能
 */

import fs from 'fs'
import path from 'path'

// 日志配置
const LOG_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 7, // 保留7天的日志
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'info'
}

// 创建日志目录
const logDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

/**
 * 获取当前日志文件路径
 */
function getCurrentLogFile() {
  const dateStr = new Date().toISOString().split('T')[0]
  return path.join(logDir, `api-${dateStr}.log`)
}

/**
 * 检查日志文件大小并轮转
 */
function checkLogRotation() {
  const logFile = getCurrentLogFile()

  if (fs.existsSync(logFile)) {
    const stats = fs.statSync(logFile)
    if (stats.size > LOG_CONFIG.maxFileSize) {
      // 创建备份文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFile = logFile.replace('.log', `.${timestamp}.log`)
      fs.renameSync(logFile, backupFile)
      console.log(`[Logger] 日志文件轮转: ${path.basename(backupFile)}`)
    }
  }
}

/**
 * 清理过期日志文件
 */
function cleanupOldLogs() {
  try {
    const files = fs.readdirSync(logDir)
    const logFiles = files
      .filter(file => file.startsWith('api-') && file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logDir, file),
        mtime: fs.statSync(path.join(logDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime) // 按修改时间降序排列

    // 删除超出保留数量的文件
    if (logFiles.length > LOG_CONFIG.maxFiles) {
      const filesToDelete = logFiles.slice(LOG_CONFIG.maxFiles)
      filesToDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path)
          console.log(`[Logger] 删除过期日志: ${file.name}`)
        } catch (error) {
          console.error(`[Logger] 删除日志文件失败: ${file.name}`, error.message)
        }
      })
    }

    // 删除7天前的日志文件
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    logFiles.forEach(file => {
      if (file.mtime < sevenDaysAgo) {
        try {
          fs.unlinkSync(file.path)
          console.log(`[Logger] 删除过期日志: ${file.name}`)
        } catch (error) {
          console.error(`[Logger] 删除过期日志失败: ${file.name}`, error.message)
        }
      }
    })
  } catch (error) {
    console.error('[Logger] 清理日志时出错:', error.message)
  }
}

/**
 * 格式化日志信息
 */
function formatLogEntry(req, res, responseTime, statusCode, responseBody) {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.originalUrl
  const userAgent = req.get('User-Agent') || 'Unknown'
  const ip = req.ip || req.connection.remoteAddress
  const requestBody = req.body ? JSON.stringify(req.body) : ''

  const logEntry = {
    timestamp,
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    ip,
    userAgent,
    requestHeaders: {
      'content-type': req.get('Content-Type'),
      authorization: req.get('Authorization') ? '[HIDDEN]' : undefined
    },
    requestBody: requestBody.length > 500 ? '[LARGE_BODY]' : requestBody,
    responseBody:
      typeof responseBody === 'string' && responseBody.length > 1000
        ? '[LARGE_RESPONSE]'
        : responseBody
  }

  return JSON.stringify(logEntry, null, 2)
}

/**
 * 写入日志文件
 */
function writeLog(logEntry) {
  try {
    // 检查日志轮转
    checkLogRotation()

    const logFile = getCurrentLogFile()
    const logLine = `${logEntry}\n${'='.repeat(80)}\n`
    fs.appendFileSync(logFile, logLine, 'utf8')
  } catch (error) {
    console.error('[Logger] 写入日志失败:', error.message)
  }
}

/**
 * API日志中间件
 */
export const apiLogger = (req, res, next) => {
  const startTime = Date.now()

  // 保存原始的res.json方法
  const originalJson = res.json
  let responseBody = null

  // 重写res.json方法来捕获响应数据
  res.json = function (body) {
    responseBody = body
    return originalJson.call(this, body)
  }

  // 监听响应结束事件
  res.on('finish', () => {
    const endTime = Date.now()
    const responseTime = endTime - startTime

    try {
      // 只记录重要的API调用，过滤掉监控端点的频繁调用
      if (!req.originalUrl.includes('/monitor/') || res.statusCode >= 400) {
        const logEntry = formatLogEntry(req, res, responseTime, res.statusCode, responseBody)
        writeLog(logEntry)
      }

      // 控制台输出（生产环境只显示错误）
      const shouldLog = LOG_CONFIG.logLevel === 'info' || res.statusCode >= 400
      if (shouldLog) {
        const color =
          res.statusCode >= 400 ? '\x1b[31m' : res.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m'
        const reset = '\x1b[0m'

        console.log(
          `${color}[API] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms${reset}`
        )

        // 如果是错误，打印更详细的信息
        if (res.statusCode >= 400) {
          console.log(`${color}[ERROR] Request Body: ${JSON.stringify(req.body)}${reset}`)
          if (responseBody && responseBody.error) {
            console.log(`${color}[ERROR] Response: ${JSON.stringify(responseBody)}${reset}`)
          }
        }
      }
    } catch (error) {
      console.error('日志记录失败:', error)
    }
  })

  next()
}

/**
 * 获取今日API调用统计
 */
export function getApiStats() {
  try {
    const logFile = getCurrentLogFile()
    if (!fs.existsSync(logFile)) {
      return { totalCalls: 0, errorCalls: 0, averageResponseTime: 0 }
    }

    const logContent = fs.readFileSync(logFile, 'utf8')
    const logEntries = logContent.split('='.repeat(80)).filter(entry => entry.trim())

    let totalCalls = 0
    let errorCalls = 0
    let totalResponseTime = 0
    const methodStats = {}
    const endpointStats = {}

    logEntries.forEach(entry => {
      try {
        const logData = JSON.parse(entry.trim())
        totalCalls++

        if (logData.statusCode >= 400) {
          errorCalls++
        }

        const responseTime = parseInt(logData.responseTime.replace('ms', ''))
        totalResponseTime += responseTime

        // 统计方法
        methodStats[logData.method] = (methodStats[logData.method] || 0) + 1

        // 统计端点
        const endpoint = logData.url.split('?')[0] // 移除查询参数
        endpointStats[endpoint] = (endpointStats[endpoint] || 0) + 1
      } catch (e) {
        // 忽略解析错误的日志条目
      }
    })

    return {
      totalCalls,
      errorCalls,
      successRate:
        totalCalls > 0 ? (((totalCalls - errorCalls) / totalCalls) * 100).toFixed(2) + '%' : '0%',
      averageResponseTime:
        totalCalls > 0 ? Math.round(totalResponseTime / totalCalls) + 'ms' : '0ms',
      methodStats,
      endpointStats
    }
  } catch (error) {
    console.error('获取API统计失败:', error)
    return { totalCalls: 0, errorCalls: 0, averageResponseTime: 0 }
  }
}

/**
 * 手动清理日志
 */
export function cleanupLogs() {
  cleanupOldLogs()
}

// 启动时清理一次过期日志
cleanupOldLogs()

// 每小时清理一次过期日志
setInterval(cleanupOldLogs, 60 * 60 * 1000)
