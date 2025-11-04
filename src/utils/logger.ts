/**
 * 前端日志管理工具
 * 根据环境自动控制日志输出级别，避免生产环境日志过多
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'off'

interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableLocalStorage: boolean
  maxStoredLogs: number
}

type LogPayload = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined

class Logger {
  private config: LoggerConfig
  private logs: Array<{ timestamp: string; level: LogLevel; message: string; data?: LogPayload }> =
    []

  constructor() {
    // 根据环境设置默认配置
    const isDevelopment = import.meta.env.DEV
    const isTest = import.meta.env.MODE === 'test'

    this.config = {
      level: isDevelopment ? 'debug' : isTest ? 'warn' : 'error',
      enableConsole: isDevelopment || isTest,
      enableLocalStorage: isDevelopment,
      maxStoredLogs: 100
    }

    // 从localStorage恢复配置（如果有）
    this.loadConfig()
  }

  /**
   * 从localStorage加载配置
   */
  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem('logger-config')
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) }
      }
    } catch (error) {
      // 忽略配置加载错误
    }
  }

  /**
   * 保存配置到localStorage
   */
  private saveConfig() {
    try {
      if (this.config.enableLocalStorage) {
        localStorage.setItem('logger-config', JSON.stringify(this.config))
      }
    } catch (error) {
      // 忽略配置保存错误
    }
  }

  /**
   * 检查日志级别是否应该输出
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'off']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex && this.config.level !== 'off'
  }

  /**
   * 添加日志到存储
   */
  private addToStorage(level: LogLevel, message: string, data?: LogPayload) {
    if (!this.config.enableLocalStorage) return

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    }

    this.logs.push(logEntry)

    // 限制存储的日志数量
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs = this.logs.slice(-this.config.maxStoredLogs)
    }

    // 保存到localStorage
    try {
      localStorage.setItem('app-logs', JSON.stringify(this.logs))
    } catch (error) {
      // 如果存储满了，清理一半的日志
      this.logs = this.logs.slice(-Math.floor(this.config.maxStoredLogs / 2))
      try {
        localStorage.setItem('app-logs', JSON.stringify(this.logs))
      } catch {
        // 如果还是失败，就放弃存储
      }
    }
  }

  /**
   * 通用日志方法
   */
  private log(level: LogLevel, message: string, ...args: unknown[]) {
    if (!this.shouldLog(level)) return

    const data: LogPayload | undefined = args.length > 0 ? args : undefined

    // 输出到控制台
    if (this.config.enableConsole) {
      const timestamp = new Date().toLocaleTimeString()
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`

      switch (level) {
        case 'debug':
          console.debug(prefix, message, ...args)
          break
        case 'info':
          console.info(prefix, message, ...args)
          break
        case 'warn':
          console.warn(prefix, message, ...args)
          break
        case 'error':
          console.error(prefix, message, ...args)
          break
      }
    }

    // 添加到存储
    this.addToStorage(level, message, data)
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: unknown[]) {
    this.log('debug', message, ...args)
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: unknown[]) {
    this.log('info', message, ...args)
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: unknown[]) {
    this.log('warn', message, ...args)
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: unknown[]) {
    this.log('error', message, ...args)
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel) {
    this.config.level = level
    this.saveConfig()
  }

  /**
   * 启用/禁用控制台输出
   */
  setConsoleOutput(enabled: boolean) {
    this.config.enableConsole = enabled
    this.saveConfig()
  }

  /**
   * 启用/禁用本地存储
   */
  setLocalStorage(enabled: boolean) {
    this.config.enableLocalStorage = enabled
    this.saveConfig()
  }

  /**
   * 获取当前配置
   */
  getConfig(): LoggerConfig {
    return { ...this.config }
  }

  /**
   * 获取存储的日志
   */
  getLogs(): Array<{ timestamp: string; level: LogLevel; message: string; data?: LogPayload }> {
    return [...this.logs]
  }

  /**
   * 清理存储的日志
   */
  clearLogs() {
    this.logs = []
    try {
      localStorage.removeItem('app-logs')
    } catch (error) {
      // 忽略清理错误
    }
  }

  /**
   * 导出日志（用于调试）
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// 创建全局日志实例
const logger = new Logger()

// 在开发环境下，将logger暴露到全局，方便调试
if (import.meta.env.DEV) {
  ;(window as Window & { logger?: Logger }).logger = logger
}

export default logger

// 兼容原有的console调用方式
export const log = logger.info.bind(logger)
export const warn = logger.warn.bind(logger)
export const error = logger.error.bind(logger)
export const debug = logger.debug.bind(logger)
