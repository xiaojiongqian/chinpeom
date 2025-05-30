import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMusicStore } from '../../src/stores/music'

// 模拟HTMLAudioElement
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  src: '',
  currentTime: 0,
  volume: 0.3,
  loop: false,
  preload: 'metadata',
  paused: true
}

// 模拟全局Audio构造函数
vi.stubGlobal('Audio', vi.fn().mockImplementation(() => mockAudio))

// 模拟document事件监听器
Object.defineProperty(document, 'addEventListener', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(document, 'removeEventListener', {
  value: vi.fn(),
  writable: true
})

describe('音乐Store测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('应该正确初始化音乐Store', () => {
    const musicStore = useMusicStore()
    
    expect(musicStore.isPlaying).toBe(false)
    expect(musicStore.isMuted).toBe(true)
    expect(musicStore.currentMusicIndex).toBe(0)
    expect(musicStore.volume).toBe(0.3)
    expect(musicStore.isAudioEnabled).toBe(false)
    expect(musicStore.backgroundMusicList).toHaveLength(8)
  })

  it('应该正确计算当前音乐路径', () => {
    const musicStore = useMusicStore()
    
    const expectedPath = `/backgroundmusic/${musicStore.backgroundMusicList[0]}`
    expect(musicStore.currentMusicPath).toBe(expectedPath)
  })

  it('应该正确计算当前音乐名称', () => {
    const musicStore = useMusicStore()
    
    expect(musicStore.currentMusicName).toBe(musicStore.backgroundMusicList[0])
  })

  it('startBackgroundMusic应该正确初始化登录页面', () => {
    const musicStore = useMusicStore()
    
    musicStore.startBackgroundMusic()
    
    // 登录页面应该固定从第一首开始
    expect(musicStore.currentMusicIndex).toBe(0)
    expect(musicStore.currentMusicName).toBe('1.古韵绵长.mp3')
    
    // 应该添加事件监听器
    expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('startMainPageMusic应该正确初始化主页面', () => {
    const musicStore = useMusicStore()
    
    musicStore.startMainPageMusic()
    
    // 主页面应该开启音效
    expect(musicStore.isMuted).toBe(false)
    
    // 应该选择随机音乐（因为currentMusicIndex初始为0）
    expect(musicStore.currentMusicIndex).toBeGreaterThanOrEqual(0)
    expect(musicStore.currentMusicIndex).toBeLessThan(musicStore.backgroundMusicList.length)
    
    // 应该添加事件监听器
    expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('toggleMute应该正确切换静音状态', () => {
    const musicStore = useMusicStore()
    
    expect(musicStore.isMuted).toBe(true)
    
    musicStore.toggleMute()
    expect(musicStore.isMuted).toBe(false)
    
    musicStore.toggleMute()
    expect(musicStore.isMuted).toBe(true)
  })

  it('nextMusic应该切换到下一首音乐', () => {
    const musicStore = useMusicStore()
    const initialIndex = musicStore.currentMusicIndex
    
    musicStore.nextMusic()
    
    const expectedIndex = (initialIndex + 1) % musicStore.backgroundMusicList.length
    expect(musicStore.currentMusicIndex).toBe(expectedIndex)
  })

  it('enableAudio应该启用音频并初始化Audio对象', () => {
    const musicStore = useMusicStore()
    
    expect(musicStore.isAudioEnabled).toBe(false)
    
    musicStore.enableAudio()
    
    expect(musicStore.isAudioEnabled).toBe(true)
    expect(Audio).toHaveBeenCalled()
  })

  it('resumeMusic应该从暂停位置恢复播放', () => {
    const musicStore = useMusicStore()
    
    // 启用音频并取消静音
    musicStore.enableAudio()
    musicStore.isMuted = false
    
    // 调用resumeMusic
    musicStore.resumeMusic()
    
    // 应该尝试播放音频
    expect(mockAudio.play).toHaveBeenCalled()
  })

  it('toggleMusic应该在播放和暂停之间切换', () => {
    const musicStore = useMusicStore()
    
    // 启用音频
    musicStore.enableAudio()
    
    // 模拟音频正在播放
    musicStore.isPlaying = true
    
    // 切换应该暂停音乐
    musicStore.toggleMusic()
    expect(mockAudio.pause).toHaveBeenCalled()
    
    // 再次切换应该恢复播放
    musicStore.isPlaying = false
    musicStore.isMuted = false
    musicStore.toggleMusic()
    expect(mockAudio.play).toHaveBeenCalled()
  })

  it('autoPlayNextMusic应该随机选择下一首音乐', () => {
    const musicStore = useMusicStore()
    const initialIndex = musicStore.currentMusicIndex
    
    // 多次调用以测试随机性（但只验证索引范围有效性）
    for (let i = 0; i < 3; i++) {
      musicStore.autoPlayNextMusic()
      // 应该选择有效的索引范围
      expect(musicStore.currentMusicIndex).toBeGreaterThanOrEqual(0)
      expect(musicStore.currentMusicIndex).toBeLessThan(musicStore.backgroundMusicList.length)
    }
    
    // 至少有一次调用后索引应该在有效范围内
    expect(musicStore.currentMusicIndex).toBeGreaterThanOrEqual(0)
    expect(musicStore.currentMusicIndex).toBeLessThan(musicStore.backgroundMusicList.length)
  })

  it('应该有正确的音乐文件列表', () => {
    const musicStore = useMusicStore()
    
    const expectedMusicList = [
      '1.古韵绵长.mp3',
      '2.关山月.mp3',
      '3.黄鹤归来.mp3',
      '4.将进酒.mp3',
      '5.The Moon\'s Whisper.mp3',
      '6.The Winter\'s Embrace(白雪歌送武判官归京).mp3',
      '7.The Winds of War(轮台歌奉送封大夫出师西征).mp3',
      '8.Longing in Chang\'an.mp3'
    ]
    
    expect(musicStore.backgroundMusicList).toEqual(expectedMusicList)
  })
}) 