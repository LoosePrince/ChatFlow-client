import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题模式：'light'、'dark'、'auto'
  const mode = ref('auto')
  
  // 系统偏好设置
  const systemPrefersDark = ref(false)
  
  // 当前实际主题
  const currentTheme = computed(() => {
    if (mode.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return mode.value
  })
  
  // 初始化主题
  const initializeTheme = () => {
    // 从localStorage读取保存的主题设置
    const savedMode = localStorage.getItem('theme-mode')
    if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
      mode.value = savedMode
    }
    
    // 检测系统主题偏好
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches
      
      // 监听系统主题变化
      mediaQuery.addEventListener('change', (e) => {
        systemPrefersDark.value = e.matches
      })
    }
    
    // 应用主题
    applyTheme()
  }
  
  // 应用主题到DOM
  const applyTheme = () => {
    const htmlElement = document.documentElement
    if (currentTheme.value === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }
  
  // 设置主题模式
  const setMode = (newMode) => {
    if (['light', 'dark', 'auto'].includes(newMode)) {
      mode.value = newMode
      localStorage.setItem('theme-mode', newMode)
      applyTheme()
    }
  }
  
  // 切换主题
  const toggleTheme = () => {
    const nextMode = mode.value === 'light' ? 'dark' : 
                     mode.value === 'dark' ? 'auto' : 'light'
    setMode(nextMode)
  }
  
  // 监听主题变化
  watch(currentTheme, applyTheme, { immediate: true })
  
  // 获取主题配置
  const getThemeConfig = (theme) => {
    const configs = {
      light: {
        name: '浅色',
        icon: 'fas fa-sun',
        description: '始终使用浅色主题'
      },
      dark: {
        name: '深色',
        icon: 'fas fa-moon',
        description: '始终使用深色主题'
      },
      auto: {
        name: '自动',
        icon: 'fas fa-adjust',
        description: '跟随系统设置'
      }
    }
    return configs[theme] || configs.auto
  }
  
  return {
    mode,
    currentTheme,
    systemPrefersDark,
    initializeTheme,
    setMode,
    toggleTheme,
    getThemeConfig
  }
}) 