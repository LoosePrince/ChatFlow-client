import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import axios from 'axios'

// 引入样式
import './style.css'

// 引入CORS配置
import { corsConfig, getCorsHeaders } from './config/cors.js'

// 配置axios
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
axios.defaults.timeout = 10000

// 应用CORS配置
axios.defaults.withCredentials = corsConfig.credentials

// 设置默认请求头（只设置安全的头）
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
// 不设置 Content-Type，让axios根据请求内容自动设置

// 添加请求拦截器
axios.interceptors.request.use(
  (config) => {
    // 可以在这里添加请求日志
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('响应错误:', error.response?.status, error.response?.data)
    
    // 处理401认证错误
    if (error.response?.status === 401) {
      // 清除认证状态
      localStorage.removeItem('chatroom_token')
      localStorage.removeItem('chatroom_user')
      delete axios.defaults.headers.common['Authorization']
      
      // 如果不是在登录页面，跳转到登录页面
      if (!window.location.pathname.includes('/login')) {
        console.log('认证失效，跳转到登录页面')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// 创建应用实例
const app = createApp(App)

// 创建pinia实例
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)

// 初始化认证状态并挂载应用
import { useAuthStore } from './stores/auth'

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue应用错误:', err, info)
}

// 异步初始化认证状态后挂载应用
const initializeApp = async () => {
  try {
    const authStore = useAuthStore()
    await authStore.initialize() // 异步初始化认证状态
    console.log('认证状态初始化完成')
    
    // 检查并恢复路由缓存
    await checkAndRestoreRoute(authStore)
  } catch (error) {
    console.error('认证状态初始化失败:', error)
  } finally {
    // 无论初始化成功与否都挂载应用
    app.mount('#app')
  }
}

// 检查并恢复路由缓存
const checkAndRestoreRoute = async (authStore) => {
  try {
    // 导入路由缓存store
    const { useRouteCacheStore } = await import('./stores/routeCache')
    const routeCacheStore = useRouteCacheStore()
    
    // 初始化路由缓存store
    routeCacheStore.initialize()
    
    // 只有在首页且用户已认证时才恢复路由
    const isHomePage = window.location.hash === '#/' || window.location.hash === '' || window.location.hash === '#'
    
    if (isHomePage) {
      const cachedRoute = routeCacheStore.getCachedRoute()
      const shouldRestore = routeCacheStore.shouldRestoreRoute()
      
      if (cachedRoute && authStore.isAuthenticated && shouldRestore) {
        // 等待应用挂载后再进行路由跳转
        setTimeout(() => {
          router.push({
            name: cachedRoute.name,
            params: cachedRoute.params,
            query: cachedRoute.query
          }).catch((error) => {
            console.error('路由恢复失败:', error)
            routeCacheStore.clearCache() // 恢复失败时清除缓存
          })
        }, 300) // 增加延时，确保Vue Router完全初始化
      }
    }
  } catch (error) {
    console.error('路由缓存恢复失败:', error)
  }
}

initializeApp() 