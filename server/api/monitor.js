import express from 'express'
import fs from 'fs'
import path from 'path'
import { getApiStats, cleanupLogs } from '../middleware/apiLogger.js'

const router = express.Router()

/**
 * 获取API调用统计
 * GET /api/monitor/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = getApiStats()
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('获取API统计失败:', error)
    res.status(500).json({
      success: false,
      error: '获取统计数据失败'
    })
  }
})

/**
 * 获取最近的API调用日志
 * GET /api/monitor/logs?limit=50
 */
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const logFile = path.join(
      process.cwd(),
      'logs',
      `api-${new Date().toISOString().split('T')[0]}.log`
    )

    if (!fs.existsSync(logFile)) {
      return res.json({
        success: true,
        data: [],
        message: '今日暂无API调用日志'
      })
    }

    const logContent = fs.readFileSync(logFile, 'utf8')
    const logEntries = logContent
      .split('='.repeat(80))
      .filter(entry => entry.trim())
      .slice(-limit) // 获取最近的N条
      .map(entry => {
        try {
          return JSON.parse(entry.trim())
        } catch (e) {
          return null
        }
      })
      .filter(entry => entry !== null)
      .reverse() // 最新的在前面

    res.json({
      success: true,
      data: logEntries,
      total: logEntries.length
    })
  } catch (error) {
    console.error('获取API日志失败:', error)
    res.status(500).json({
      success: false,
      error: '获取日志数据失败'
    })
  }
})

/**
 * 获取日志文件信息
 * GET /api/monitor/logs/info
 */
router.get('/logs/info', async (req, res) => {
  try {
    const logDir = path.join(process.cwd(), 'logs')

    if (!fs.existsSync(logDir)) {
      return res.json({
        success: true,
        data: {
          totalFiles: 0,
          totalSize: 0,
          files: []
        }
      })
    }

    const files = fs.readdirSync(logDir)
    const logFiles = files
      .filter(file => file.startsWith('api-') && file.endsWith('.log'))
      .map(file => {
        const filePath = path.join(logDir, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          created: stats.birthtime,
          modified: stats.mtime,
          isToday: file.includes(new Date().toISOString().split('T')[0])
        }
      })
      .sort((a, b) => b.modified - a.modified)

    const totalSize = logFiles.reduce((sum, file) => sum + file.size, 0)

    res.json({
      success: true,
      data: {
        totalFiles: logFiles.length,
        totalSize: totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        files: logFiles
      }
    })
  } catch (error) {
    console.error('获取日志文件信息失败:', error)
    res.status(500).json({
      success: false,
      error: '获取日志文件信息失败'
    })
  }
})

/**
 * 获取实时系统状态
 * GET /api/monitor/status
 */
router.get('/status', async (req, res) => {
  try {
    const stats = getApiStats()
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage()

    res.json({
      success: true,
      data: {
        server: {
          uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
          uptimeSeconds: uptime,
          nodeVersion: process.version,
          platform: process.platform,
          environment: process.env.NODE_ENV || 'development'
        },
        memory: {
          used: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          external: Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100,
          unit: 'MB'
        },
        api: stats,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('获取系统状态失败:', error)
    res.status(500).json({
      success: false,
      error: '获取系统状态失败'
    })
  }
})

/**
 * 清理API日志
 * DELETE /api/monitor/logs?type=today|old|all
 */
router.delete('/logs', async (req, res) => {
  try {
    const cleanupType = req.query.type || 'today'
    const logDir = path.join(process.cwd(), 'logs')
    let deletedFiles = 0
    let message = ''

    switch (cleanupType) {
      case 'today': {
        // 清理今日日志
        const todayLogFile = path.join(logDir, `api-${new Date().toISOString().split('T')[0]}.log`)
        if (fs.existsSync(todayLogFile)) {
          fs.unlinkSync(todayLogFile)
          deletedFiles = 1
        }
        message = '今日日志已清理'
        break
      }

      case 'old': {
        // 清理过期日志（调用apiLogger的清理函数）
        cleanupLogs()
        message = '过期日志已清理'
        break
      }

      case 'all': {
        // 清理所有日志文件
        if (fs.existsSync(logDir)) {
          const files = fs.readdirSync(logDir)
          const logFiles = files.filter(file => file.startsWith('api-') && file.endsWith('.log'))

          logFiles.forEach(file => {
            try {
              fs.unlinkSync(path.join(logDir, file))
              deletedFiles++
            } catch (error) {
              console.error(`删除日志文件失败: ${file}`, error.message)
            }
          })
        }
        message = `所有日志已清理 (${deletedFiles} 个文件)`
        break
      }

      default:
        return res.status(400).json({
          success: false,
          error: '无效的清理类型，支持: today, old, all'
        })
    }

    res.json({
      success: true,
      message: message,
      deletedFiles: deletedFiles
    })
  } catch (error) {
    console.error('清理日志失败:', error)
    res.status(500).json({
      success: false,
      error: '清理日志失败'
    })
  }
})

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default router
