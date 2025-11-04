/**
 * 应用配置
 * 支持持久化存储和动态切换
 */

interface AppConfig {
  api: {
    baseUrl: string
    useRealApi: boolean // 控制是否使用真实API
  }

  auth: {
    mockMode: boolean // 是否使用Mock认证
  }
}

interface ChinpoemDevWindow extends Window {
  appConfig?: AppConfig
  enableRealApi?: () => void
  enableMockApi?: () => void
  resetConfig?: () => void
}

declare global {
  interface Window {
    appConfig?: AppConfig
    enableRealApi?: () => void
    enableMockApi?: () => void
    resetConfig?: () => void
  }
}

// 从环境变量读取配置
const isDevelopment = import.meta.env.DEV

// 配置键名
const CONFIG_STORAGE_KEY = 'chinpoem_app_config'

// 默认配置
const defaultConfig: AppConfig = {
  api: {
    baseUrl: isDevelopment ? 'http://localhost:3001/api' : '/api',
    useRealApi: true // 改为使用真实API
  },

  auth: {
    mockMode: false // 改为使用真实认证
  }
}

// 从localStorage加载保存的配置
function loadConfigFromStorage(): Partial<AppConfig> {
  try {
    const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY)
    if (savedConfig) {
      return JSON.parse(savedConfig)
    }
  } catch (error) {
    console.warn('加载配置失败:', error)
  }
  return {}
}

// 保存配置到localStorage
function saveConfigToStorage(config: AppConfig) {
  try {
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({
        api: { useRealApi: config.api.useRealApi },
        auth: { mockMode: config.auth.mockMode }
      })
    )
  } catch (error) {
    console.warn('保存配置失败:', error)
  }
}

// 合并默认配置和保存的配置
const savedConfig = loadConfigFromStorage()
export const appConfig: AppConfig = {
  api: {
    baseUrl: defaultConfig.api.baseUrl,
    useRealApi: savedConfig.api?.useRealApi ?? defaultConfig.api.useRealApi
  },
  auth: {
    mockMode: savedConfig.auth?.mockMode ?? defaultConfig.auth.mockMode
  }
}

// 配置更新函数
export function updateConfig(newConfig: {
  api?: Partial<AppConfig['api']>
  auth?: Partial<AppConfig['auth']>
}) {
  if (newConfig.api) {
    Object.assign(appConfig.api, newConfig.api)
  }
  if (newConfig.auth) {
    Object.assign(appConfig.auth, newConfig.auth)
  }
  saveConfigToStorage(appConfig)
}

// 开发环境下的动态配置切换
if (isDevelopment) {
  const devWindow = window as ChinpoemDevWindow
  // 暴露配置到全局，方便开发调试
  devWindow.appConfig = appConfig

  // 提供快捷切换方法
  devWindow.enableRealApi = () => {
    updateConfig({
      api: { useRealApi: true },
      auth: { mockMode: false }
    })
    console.log('✅ 已切换到真实API模式')
    console.log('🔄 请刷新页面生效')
  }
  devWindow.enableMockApi = () => {
    updateConfig({
      api: { useRealApi: false },
      auth: { mockMode: true }
    })
    console.log('✅ 已切换到Mock API模式')
    console.log('🔄 请刷新页面生效')
  }

  // 添加重置配置的方法
  devWindow.resetConfig = () => {
    localStorage.removeItem(CONFIG_STORAGE_KEY)
    console.log('✅ 配置已重置，请刷新页面')
  }

  console.log('🔧 开发环境配置:')
  console.log(`   API模式: ${appConfig.auth.mockMode ? 'Mock API' : '真实API'}`)
  console.log(`   认证模式: ${appConfig.auth.mockMode ? 'Mock认证' : '真实认证'}`)
  console.log(`   API地址: ${appConfig.api.baseUrl}`)
  console.log('')
  console.log('💡 控制台快捷命令:')
  console.log('   enableRealApi()  - 切换到真实API')
  console.log('   enableMockApi()  - 切换到Mock API')
  console.log('   resetConfig()    - 重置为默认配置')
}

export default appConfig
