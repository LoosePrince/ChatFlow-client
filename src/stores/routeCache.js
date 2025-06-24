import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { routeCache } from '@/utils/routeCache'

export const useRouteCacheStore = defineStore('routeCache', () => {
  // 状态
  const isEnabled = ref(true)
  const lastCachedRoute = ref(null)
  const cacheHistory = ref([])
  
  // 计算属性
  const hasCachedRoute = computed(() => !!lastCachedRoute.value)
  const canRestore = computed(() => isEnabled.value && hasCachedRoute.value)
  
  // 保存路由到缓存
  const saveRoute = (route) => {
    if (!isEnabled.value) return
    
    try {
      routeCache.saveRoute(route)
      lastCachedRoute.value = {
        name: route.name,
        path: route.path,
        params: route.params,
        query: route.query,
        timestamp: Date.now()
      }
      
      // 添加到历史记录（最多保留10条）
      cacheHistory.value.unshift({
        ...lastCachedRoute.value,
        id: Date.now()
      })
      
      if (cacheHistory.value.length > 10) {
        cacheHistory.value = cacheHistory.value.slice(0, 10)
      }
    } catch (error) {
      console.error('保存路由到store失败:', error)
    }
  }
  
  // 获取缓存的路由
  const getCachedRoute = () => {
    try {
      const cached = routeCache.getCachedRoute()
      if (cached) {
        lastCachedRoute.value = cached
      }
      return cached
    } catch (error) {
      console.error('获取缓存路由失败:', error)
      return null
    }
  }
  
  // 清除缓存
  const clearCache = () => {
    try {
      routeCache.clearCache()
      lastCachedRoute.value = null
      cacheHistory.value = []
    } catch (error) {
      console.error('清除路由缓存store失败:', error)
    }
  }
  
  // 手动清除缓存
  const manualClear = () => {
    routeCache.manualClear()
    lastCachedRoute.value = null
    cacheHistory.value = []
  }
  
  // 启用/禁用缓存
  const toggleCache = (enabled) => {
    isEnabled.value = enabled
    if (!enabled) {
      clearCache()
    }
    
    // 保存用户设置
    localStorage.setItem('chatflow_route_cache_enabled', enabled.toString())
  }
  
  // 初始化设置
  const initialize = () => {
    try {
      const saved = localStorage.getItem('chatflow_route_cache_enabled')
      if (saved !== null) {
        isEnabled.value = saved === 'true'
      }
      
      // 加载最后的缓存路由
      const cached = getCachedRoute()
      if (cached) {
        lastCachedRoute.value = cached
      }
    } catch (error) {
      console.error('初始化路由缓存store失败:', error)
    }
  }
  
  // 更新最后访问时间
  const updateLastVisit = () => {
    routeCache.updateLastVisit()
  }
  
  // 检查是否应该恢复路由
  const shouldRestoreRoute = () => {
    return isEnabled.value && routeCache.shouldRestoreRoute()
  }
  
  // 获取缓存历史记录
  const getCacheHistory = () => {
    return cacheHistory.value
  }
  
  // 清除指定的历史记录
  const clearHistoryItem = (id) => {
    cacheHistory.value = cacheHistory.value.filter(item => item.id !== id)
  }
  
  return {
    // 状态
    isEnabled,
    lastCachedRoute,
    cacheHistory,
    
    // 计算属性
    hasCachedRoute,
    canRestore,
    
    // 方法
    saveRoute,
    getCachedRoute,
    clearCache,
    manualClear,
    toggleCache,
    initialize,
    updateLastVisit,
    shouldRestoreRoute,
    getCacheHistory,
    clearHistoryItem
  }
}) 