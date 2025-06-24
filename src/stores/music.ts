import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useMusicStore = defineStore('music', () => {
  // 背景音乐列表
  const backgroundMusicList = [
    '1.古韵绵长.mp3',
    '2.关山月.mp3',
    '3.黄鹤归来.mp3',
    '4.将进酒.mp3',
    '5.The Moon\'s Whisper.mp3',
    '6.The Winter\'s Embrace(白雪歌送武判官归京).mp3',
    '7.The Winds of War(轮台歌奉送封大夫出师西征).mp3',
    '8.Longing in Chang\'an.mp3'
  ]

  // 状态
  const isPlaying = ref(false)
  // 从localStorage初始化静音状态，默认不静音
  const isMuted = ref(JSON.parse(localStorage.getItem('musicMuted') || 'false'))
  const currentMusicIndex = ref(0) // 默认从第一首开始（古韵绵长）
  const audio = ref<HTMLAudioElement | null>(null)
  const volume = ref(0.3) // 默认音量30%
  const isAudioEnabled = ref(false) // 音频是否已启用（用户交互后）

  // 计算属性
  const currentMusicPath = computed(() => {
    return `/backgroundmusic/${backgroundMusicList[currentMusicIndex.value]}`
  })

  const currentMusicName = computed(() => {
    return backgroundMusicList[currentMusicIndex.value]
  })

  // 监听isMuted的变化并持久化到localStorage
  watch(isMuted, (newVal) => {
    localStorage.setItem('musicMuted', JSON.stringify(newVal))
  })

  // 检测是否在移动应用环境中
  function isMobileApp() {
    // 检测Capacitor环境
    return !!(window as any).Capacitor || 
           // 检测其他移动应用标识
           navigator.userAgent.includes('CapacitorApp') ||
           // 可以添加其他移动应用环境检测逻辑
           false
  }

  // 初始化音频
  function initAudio() {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.volume = volume.value
      audio.value.loop = false
      audio.value.preload = 'metadata'
      
      // 音乐自然结束时自动随机播放下一首
      audio.value.addEventListener('ended', () => {
        console.log('音乐播放结束:', currentMusicName.value)
        isPlaying.value = false
        autoPlayNextMusic()
      })

      // 处理播放错误
      audio.value.addEventListener('error', (e) => {
        console.error('音频播放错误:', e, '当前音乐:', currentMusicName.value)
        isPlaying.value = false
        // 延迟一秒后尝试下一首，避免快速连续错误
        setTimeout(() => {
          autoPlayNextMusic()
        }, 1000)
      })

      // 音频可以播放时
      audio.value.addEventListener('canplay', () => {
        console.log('音频准备就绪:', currentMusicName.value)
      })

      // 音频开始播放时
      audio.value.addEventListener('play', () => {
        console.log('音频开始播放:', currentMusicName.value)
        isPlaying.value = true
      })

      // 音频暂停时
      audio.value.addEventListener('pause', () => {
        console.log('音频暂停:', currentMusicName.value)
        isPlaying.value = false
      })
    }
  }

  // 自动播放下一首音乐（音乐自然结束时调用）
  function autoPlayNextMusic() {
    // 随机选择下一首音乐，确保不是当前正在播放的音乐
    let nextIndex = Math.floor(Math.random() * backgroundMusicList.length)
    // 如果只有一首歌，直接重新播放
    if (backgroundMusicList.length > 1) {
      while (nextIndex === currentMusicIndex.value) {
        nextIndex = Math.floor(Math.random() * backgroundMusicList.length)
      }
    }
    
    console.log('自动切换到下一首:', backgroundMusicList[nextIndex])
    currentMusicIndex.value = nextIndex
    
    if (isAudioEnabled.value && !isMuted.value) {
      playMusic()
    }
  }

  // 启用音频（用户首次交互后调用）
  function enableAudio() {
    if (!isAudioEnabled.value) {
      isAudioEnabled.value = true
      initAudio()
      if (!isMuted.value) {
        playMusic()
      }
    }
  }

  // 自动启用音频（移动应用环境使用）
  function autoEnableAudio() {
    if (isMobileApp()) {
      // 在移动应用环境中可以立即启用音频
      enableAudio()
      return true
    }
    return false
  }

  // 播放音乐
  function playMusic() {
    if (!isAudioEnabled.value) {
      return // 如果音频未启用，不播放
    }

    if (!audio.value) {
      initAudio()
    }
    
    if (audio.value && !isMuted.value) {
      const targetSrc = currentMusicPath.value
      
      console.log('准备播放音乐:', currentMusicName.value, '路径:', targetSrc)
      
      // 如果音频源发生变化，才需要设置新的音乐源
      if (audio.value.src !== window.location.origin + targetSrc) {
        // 停止当前播放并设置新的音乐源
        if (!audio.value.paused) {
          audio.value.pause()
        }
        
        // 设置新的音乐源并从头播放
        audio.value.src = targetSrc
        audio.value.currentTime = 0
      }
      // 如果是同一首音乐，直接从暂停位置继续播放
      
      audio.value.play().then(() => {
        isPlaying.value = true
        console.log('成功开始播放:', currentMusicName.value)
      }).catch(error => {
        console.error('播放音乐失败:', error, '音乐:', currentMusicName.value)
        isPlaying.value = false
        // 如果播放失败，尝试下一首
        setTimeout(() => {
          autoPlayNextMusic()
        }, 1000)
      })
    }
  }

  // 暂停音乐
  function pauseMusic() {
    if (audio.value) {
      audio.value.pause()
      isPlaying.value = false
    }
  }

  // 停止音乐
  function stopMusic() {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
      isPlaying.value = false
    }
  }

  // 切换播放/暂停
  function toggleMusic() {
    if (!isAudioEnabled.value) {
      enableAudio()
      return
    }

    if (isPlaying.value) {
      pauseMusic()
    } else {
      // 从暂停位置恢复播放
      resumeMusic()
    }
  }

  // 恢复播放音乐（从暂停位置继续）
  function resumeMusic() {
    if (!isAudioEnabled.value) {
      return // 如果音频未启用，不播放
    }

    if (!audio.value) {
      initAudio()
    }
    
    if (audio.value && !isMuted.value) {
      // 确保音频源已设置
      if (!audio.value.src) {
        const targetSrc = currentMusicPath.value
        audio.value.src = targetSrc
      }
      
      audio.value.play().then(() => {
        isPlaying.value = true
        console.log('成功恢复播放:', currentMusicName.value, '位置:', audio.value?.currentTime)
      }).catch(error => {
        console.error('恢复播放失败:', error, '音乐:', currentMusicName.value)
        isPlaying.value = false
        // 如果恢复播放失败，尝试从头播放
        setTimeout(() => {
          playMusic()
        }, 1000)
      })
    }
  }

  // 手动切换到下一首音乐（主页面的"换音乐"按钮使用）
  function nextMusic() {
    currentMusicIndex.value = (currentMusicIndex.value + 1) % backgroundMusicList.length
    console.log('手动切换到下一首:', backgroundMusicList[currentMusicIndex.value])
    if (isAudioEnabled.value && !isMuted.value) {
      playMusic()
    }
  }

  // 静音/取消静音
  function toggleMute() {
    isMuted.value = !isMuted.value
    if (isMuted.value) {
      pauseMusic()
    } else if (isAudioEnabled.value) {
      // 从暂停位置恢复播放，而不是重新开始
      resumeMusic()
    }
  }

  // 开始播放背景音乐（登录页面调用）
  function startBackgroundMusic() {
    // 登录页面固定从第一首开始（古韵绵长.mp3），可以保持音效开启状态
    currentMusicIndex.value = 0
    
    // 添加全局点击监听器，首次点击时启用音频
    const handleFirstInteraction = () => {
      enableAudio()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
    
    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)
  }

  // 主页面启动音乐（主页面调用）
  function startMainPageMusic() {
    // 主页面保持音效开启状态（已在初始化时设置为false）
    
    // 如果当前没有播放，随机选择一首音乐
    if (currentMusicIndex.value === 0) {
      const randomIndex = Math.floor(Math.random() * backgroundMusicList.length)
      currentMusicIndex.value = randomIndex
    }
    
    // 添加全局点击监听器，首次点击时启用音频
    const handleFirstInteraction = () => {
      enableAudio()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
    
    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)
  }

  return {
    // 状态
    isPlaying,
    isMuted,
    currentMusicIndex,
    volume,
    backgroundMusicList,
    isAudioEnabled,
    
    // 计算属性
    currentMusicPath,
    currentMusicName,
    
    // 方法
    initAudio,
    enableAudio,
    playMusic,
    pauseMusic,
    stopMusic,
    toggleMusic,
    resumeMusic,
    nextMusic,
    toggleMute,
    startBackgroundMusic,
    startMainPageMusic,
    autoPlayNextMusic,
    isMobileApp,
    autoEnableAudio
  }
}) 