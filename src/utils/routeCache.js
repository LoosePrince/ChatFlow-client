/**
 * 路由缓存工具类
 * 用于在页面关闭后重新打开时自动跳转到之前的路由
 */
class RouteCache {
  constructor() {
    this.CACHE_KEY = 'chatflow_route_cache'
    this.LAST_VISIT_KEY = 'chatflow_last_visit'
    this.SESSION_KEY = 'chatflow_session_id'
    this.CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时缓存时间
    this.currentSessionId = this.generateSessionId()
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 保存当前路由到缓存
   * @param {Object} route - Vue Router 路由对象
   */
  saveRoute(route) {
    try {
      // 只缓存特定的路由，排除登录、注册等页面
      const cachableRoutes = ['ChatRoom', 'RoomSelect', 'Profile', 'RouteCacheDemo']
      
      if (!cachableRoutes.includes(route.name)) {
        return
      }

      const cacheData = {
        name: route.name,
        path: route.path,
        params: route.params,
        query: route.query,
        meta: route.meta,
        timestamp: Date.now(),
        sessionId: this.currentSessionId
      }

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData))
      localStorage.setItem(this.LAST_VISIT_KEY, Date.now().toString())
      localStorage.setItem(this.SESSION_KEY, this.currentSessionId)
    } catch (error) {
      console.error('保存路由缓存失败:', error)
    }
  }

  /**
   * 获取缓存的路由
   * @returns {Object|null} 缓存的路由对象或null
   */
  getCachedRoute() {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY)
      const lastVisit = localStorage.getItem(this.LAST_VISIT_KEY)

      if (!cachedData || !lastVisit) {
        return null
      }

      const routeData = JSON.parse(cachedData)
      const visitTime = parseInt(lastVisit)
      const now = Date.now()

      // 检查缓存是否过期（24小时）
      if (now - visitTime > this.CACHE_DURATION) {
        this.clearCache()
        return null
      }

      // 直接返回缓存的路由数据，让调用者决定是否需要恢复
      return routeData
    } catch (error) {
      console.error('获取路由缓存失败:', error)
      this.clearCache()
      return null
    }
  }

  /**
   * 清除路由缓存
   */
  clearCache() {
    try {
      localStorage.removeItem(this.CACHE_KEY)
      localStorage.removeItem(this.LAST_VISIT_KEY)
    } catch (error) {
      console.error('清除路由缓存失败:', error)
    }
  }

  /**
   * 检查是否应该恢复缓存的路由
   * @returns {boolean}
   */
  shouldRestoreRoute() {
    try {
      const lastVisit = localStorage.getItem(this.LAST_VISIT_KEY)
      const lastSessionId = localStorage.getItem(this.SESSION_KEY)
      
      if (!lastVisit || !lastSessionId) {
        return false
      }

      const visitTime = parseInt(lastVisit)
      const now = Date.now()
      
      // 检查是否是不同的会话ID（表示是新的浏览器会话）
      const isDifferentSession = this.currentSessionId !== lastSessionId
      
      // 或者检查时间间隔是否超过30秒（兼容性检查）
      const sessionTimeout = 30 * 1000 // 30秒
      const isTimeoutSession = now - visitTime > sessionTimeout
      
      return isDifferentSession || isTimeoutSession
    } catch (error) {
      console.error('检查路由恢复条件失败:', error)
      return false
    }
  }

  /**
   * 更新最后访问时间
   */
  updateLastVisit() {
    try {
      localStorage.setItem(this.LAST_VISIT_KEY, Date.now().toString())
    } catch (error) {
      console.error('更新最后访问时间失败:', error)
    }
  }

  /**
   * 手动清除缓存（用于登出等场景）
   */
  manualClear() {
    this.clearCache()
  }
}

// 导出单例实例
export const routeCache = new RouteCache()
export default routeCache 