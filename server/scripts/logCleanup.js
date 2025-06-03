/**
 * 日志清理脚本
 * 用于定期清理和管理日志文件
 * 可以作为独立脚本运行，也可以作为定时任务
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置选项
const CONFIG = {
  // 日志目录
  logDir: path.join(path.dirname(__dirname), 'logs'),
  // 保留天数
  retentionDays: 7,
  // 最大文件大小 (MB)
  maxFileSizeMB: 50,
  // 最大总大小 (MB)  
  maxTotalSizeMB: 200,
  // 日志文件模式
  logFilePattern: /^api-\d{4}-\d{2}-\d{2}.*\.log$/,
  // 测试日志文件模式
  testLogPattern: /^.*test.*\.log$/
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取文件信息
 */
function getFileInfo(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return {
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      sizeMB: stats.size / (1024 * 1024),
      created: stats.birthtime,
      modified: stats.mtime,
      age: (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24) // 天数
    }
  } catch (error) {
    console.error(`获取文件信息失败: ${filePath}`, error.message)
    return null
  }
}

/**
 * 扫描日志文件
 */
function scanLogFiles() {
  if (!fs.existsSync(CONFIG.logDir)) {
    console.log('日志目录不存在:', CONFIG.logDir)
    return { apiLogs: [], testLogs: [], others: [] }
  }

  const files = fs.readdirSync(CONFIG.logDir)
  const result = { apiLogs: [], testLogs: [], others: [] }

  files.forEach(file => {
    const filePath = path.join(CONFIG.logDir, file)
    const fileInfo = getFileInfo(filePath)
    
    if (!fileInfo) return

    if (CONFIG.logFilePattern.test(file)) {
      result.apiLogs.push(fileInfo)
    } else if (CONFIG.testLogPattern.test(file)) {
      result.testLogs.push(fileInfo)
    } else if (file.endsWith('.log')) {
      result.others.push(fileInfo)
    }
  })

  // 按修改时间排序
  result.apiLogs.sort((a, b) => b.modified - a.modified)
  result.testLogs.sort((a, b) => b.modified - a.modified)
  result.others.sort((a, b) => b.modified - a.modified)

  return result
}

/**
 * 清理过期文件
 */
function cleanupExpiredFiles(files, retentionDays) {
  const expiredFiles = files.filter(file => file.age > retentionDays)
  let deletedCount = 0
  let deletedSize = 0

  expiredFiles.forEach(file => {
    try {
      fs.unlinkSync(file.path)
      deletedCount++
      deletedSize += file.size
      console.log(`✅ 删除过期文件: ${file.name} (${formatSize(file.size)}, ${file.age.toFixed(1)}天前)`)
    } catch (error) {
      console.error(`❌ 删除文件失败: ${file.name}`, error.message)
    }
  })

  return { deletedCount, deletedSize }
}

/**
 * 清理大文件
 */
function cleanupLargeFiles(files, maxSizeMB) {
  const largeFiles = files.filter(file => file.sizeMB > maxSizeMB)
  let deletedCount = 0
  let deletedSize = 0

  largeFiles.forEach(file => {
    try {
      fs.unlinkSync(file.path)
      deletedCount++
      deletedSize += file.size
      console.log(`✅ 删除大文件: ${file.name} (${formatSize(file.size)})`)
    } catch (error) {
      console.error(`❌ 删除大文件失败: ${file.name}`, error.message)
    }
  })

  return { deletedCount, deletedSize }
}

/**
 * 清理超出总大小限制的文件
 */
function cleanupByTotalSize(files, maxTotalSizeMB) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const maxTotalSize = maxTotalSizeMB * 1024 * 1024

  if (totalSize <= maxTotalSize) {
    return { deletedCount: 0, deletedSize: 0 }
  }

  console.log(`总大小超出限制: ${formatSize(totalSize)} > ${formatSize(maxTotalSize)}`)

  // 按修改时间排序，删除最旧的文件
  const sortedFiles = [...files].sort((a, b) => a.modified - b.modified)
  let currentSize = totalSize
  let deletedCount = 0
  let deletedSize = 0

  for (const file of sortedFiles) {
    if (currentSize <= maxTotalSize) break

    try {
      fs.unlinkSync(file.path)
      currentSize -= file.size
      deletedCount++
      deletedSize += file.size
      console.log(`✅ 删除旧文件: ${file.name} (${formatSize(file.size)})`)
    } catch (error) {
      console.error(`❌ 删除旧文件失败: ${file.name}`, error.message)
    }
  }

  return { deletedCount, deletedSize }
}

/**
 * 清理测试日志
 */
function cleanupTestLogs(testLogs) {
  // 测试日志保留时间更短（1天）
  const result = cleanupExpiredFiles(testLogs, 1)
  if (result.deletedCount > 0) {
    console.log(`🧪 清理测试日志: ${result.deletedCount} 个文件, ${formatSize(result.deletedSize)}`)
  }
  return result
}

/**
 * 压缩旧日志文件
 */
function compressOldLogs(files) {
  // 这里可以实现日志压缩功能
  // 暂时跳过，因为需要额外的压缩库
  console.log('💡 提示: 可以考虑压缩超过3天的日志文件以节省空间')
}

/**
 * 主清理函数
 */
function performCleanup(options = {}) {
  const config = { ...CONFIG, ...options }
  
  console.log('🧹 开始日志清理...')
  console.log(`📁 日志目录: ${config.logDir}`)
  console.log(`⏰ 保留天数: ${config.retentionDays}`)
  console.log(`📏 最大文件大小: ${config.maxFileSizeMB}MB`)
  console.log(`📊 最大总大小: ${config.maxTotalSizeMB}MB`)
  console.log('')

  // 扫描文件
  const { apiLogs, testLogs, others } = scanLogFiles()
  
  console.log('📋 扫描结果:')
  console.log(`   API日志: ${apiLogs.length} 个文件`)
  console.log(`   测试日志: ${testLogs.length} 个文件`)
  console.log(`   其他日志: ${others.length} 个文件`)
  
  const totalSize = [...apiLogs, ...testLogs, ...others].reduce((sum, file) => sum + file.size, 0)
  console.log(`   总大小: ${formatSize(totalSize)}`)
  console.log('')

  let totalDeleted = 0
  let totalDeletedSize = 0

  // 1. 清理测试日志
  if (testLogs.length > 0) {
    console.log('🧪 清理测试日志...')
    const result = cleanupTestLogs(testLogs)
    totalDeleted += result.deletedCount
    totalDeletedSize += result.deletedSize
    console.log('')
  }

  // 2. 清理过期的API日志
  if (apiLogs.length > 0) {
    console.log('📜 清理过期API日志...')
    const result = cleanupExpiredFiles(apiLogs, config.retentionDays)
    totalDeleted += result.deletedCount
    totalDeletedSize += result.deletedSize
    console.log('')
  }

  // 3. 清理大文件
  const remainingApiLogs = apiLogs.filter(file => fs.existsSync(file.path))
  if (remainingApiLogs.length > 0) {
    console.log('📦 清理大文件...')
    const result = cleanupLargeFiles(remainingApiLogs, config.maxFileSizeMB)
    totalDeleted += result.deletedCount
    totalDeletedSize += result.deletedSize
    console.log('')
  }

  // 4. 按总大小清理
  const finalRemainingLogs = remainingApiLogs.filter(file => fs.existsSync(file.path))
  if (finalRemainingLogs.length > 0) {
    console.log('⚖️  检查总大小限制...')
    const result = cleanupByTotalSize(finalRemainingLogs, config.maxTotalSizeMB)
    totalDeleted += result.deletedCount
    totalDeletedSize += result.deletedSize
    console.log('')
  }

  // 5. 清理其他日志
  if (others.length > 0) {
    console.log('🗂️  清理其他日志...')
    const result = cleanupExpiredFiles(others, 3) // 其他日志保留3天
    totalDeleted += result.deletedCount
    totalDeletedSize += result.deletedSize
    console.log('')
  }

  // 输出清理结果
  console.log('✅ 清理完成!')
  console.log(`   删除文件: ${totalDeleted} 个`)
  console.log(`   释放空间: ${formatSize(totalDeletedSize)}`)
  
  // 重新扫描显示剩余情况
  const finalScan = scanLogFiles()
  const finalTotalSize = [...finalScan.apiLogs, ...finalScan.testLogs, ...finalScan.others]
    .reduce((sum, file) => sum + file.size, 0)
  console.log(`   剩余日志: ${finalScan.apiLogs.length + finalScan.testLogs.length + finalScan.others.length} 个文件`)
  console.log(`   剩余大小: ${formatSize(finalTotalSize)}`)

  return {
    deletedFiles: totalDeleted,
    deletedSize: totalDeletedSize,
    remainingFiles: finalScan.apiLogs.length + finalScan.testLogs.length + finalScan.others.length,
    remainingSize: finalTotalSize
  }
}

/**
 * 显示日志统计信息
 */
function showLogStats() {
  console.log('📊 日志文件统计:')
  console.log('')

  const { apiLogs, testLogs, others } = scanLogFiles()
  
  if (apiLogs.length > 0) {
    console.log('📜 API日志:')
    apiLogs.forEach(file => {
      const ageStr = file.age < 1 ? '今天' : `${file.age.toFixed(1)}天前`
      console.log(`   ${file.name} - ${formatSize(file.size)} (${ageStr})`)
    })
    console.log('')
  }

  if (testLogs.length > 0) {
    console.log('🧪 测试日志:')
    testLogs.forEach(file => {
      const ageStr = file.age < 1 ? '今天' : `${file.age.toFixed(1)}天前`
      console.log(`   ${file.name} - ${formatSize(file.size)} (${ageStr})`)
    })
    console.log('')
  }

  if (others.length > 0) {
    console.log('🗂️  其他日志:')
    others.forEach(file => {
      const ageStr = file.age < 1 ? '今天' : `${file.age.toFixed(1)}天前`
      console.log(`   ${file.name} - ${formatSize(file.size)} (${ageStr})`)
    })
    console.log('')
  }

  const totalFiles = apiLogs.length + testLogs.length + others.length
  const totalSize = [...apiLogs, ...testLogs, ...others].reduce((sum, file) => sum + file.size, 0)
  
  console.log(`📋 总计: ${totalFiles} 个文件, ${formatSize(totalSize)}`)
}

// 命令行参数处理
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'cleanup'
  
  switch (command) {
    case 'cleanup':
      performCleanup()
      break
    case 'stats':
      showLogStats()
      break
    case 'test-cleanup':
      performCleanup({ retentionDays: 0, maxFileSizeMB: 1, maxTotalSizeMB: 10 })
      break
    case 'help':
      console.log(`
📖 日志清理脚本使用说明:

用法: node logCleanup.js [命令]

命令:
  cleanup       执行日志清理 (默认)
  stats         显示日志统计信息
  test-cleanup  测试模式清理 (更严格的规则)
  help          显示此帮助信息

示例:
  node scripts/logCleanup.js             # 执行常规清理
  node scripts/logCleanup.js stats       # 查看日志统计
  node scripts/logCleanup.js test-cleanup # 测试模式清理

配置:
  保留天数: ${CONFIG.retentionDays}天
  最大文件大小: ${CONFIG.maxFileSizeMB}MB
  最大总大小: ${CONFIG.maxTotalSizeMB}MB
`)
      break
    default:
      console.log(`❓ 未知命令: ${command}`)
      console.log('使用 "node scripts/logCleanup.js help" 查看帮助')
      process.exit(1)
  }
}

export { performCleanup, showLogStats, scanLogFiles } 