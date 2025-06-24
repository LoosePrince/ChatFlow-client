import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('chatroom_token') || null)
  const user = ref(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const isAnonymous = computed(() => user.value?.type === 'anonymous')
  const isUser = computed(() => user.value?.type === 'user')
  
  // 设置认证头
  const setAuthHeader = (authToken) => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }
  
  // 保存认证信息
  const setAuth = (authToken, userData) => {
    token.value = authToken
    user.value = userData
    
    // 保存到本地存储
    localStorage.setItem('chatroom_token', authToken)
    localStorage.setItem('chatroom_user', JSON.stringify(userData))
    
    // 设置请求头
    setAuthHeader(authToken)
  }
  
  // 清除认证信息
  const clearAuth = () => {
    token.value = null
    user.value = null
    
    // 清除本地存储
    localStorage.removeItem('chatroom_token')
    localStorage.removeItem('chatroom_user')
    
    // 清除请求头
    setAuthHeader(null)
  }
  
  // 初始化认证状态
  const initAuth = () => {
    const savedToken = localStorage.getItem('chatroom_token')
    const savedUser = localStorage.getItem('chatroom_user')
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        token.value = savedToken
        user.value = userData
        setAuthHeader(savedToken)
      } catch (error) {
        console.error('解析用户数据失败:', error)
        clearAuth()
      }
    }
  }
  
  // 异步初始化方法
  const initialize = async () => {
    if (isInitialized.value) return
    
    try {
      // 首先初始化本地存储的认证信息
      initAuth()
      
      // 如果有token，验证其有效性
      if (token.value) {
        try {
          await fetchCurrentUser()
        } catch (error) {
          // 如果token无效，清除认证状态
          console.warn('Token验证失败，清除认证状态:', error.message)
          clearAuth()
        }
      }
      
      isInitialized.value = true
    } catch (error) {
      console.error('初始化认证状态失败:', error)
      clearAuth()
      isInitialized.value = true
    }
  }
  
  // 注册
  const register = async (registerData) => {
    isLoading.value = true
    try {
      const formData = new FormData()
      formData.append('nickname', registerData.nickname)
      formData.append('password', registerData.password)
      if (registerData.email) {
        formData.append('email', registerData.email)
      }
      if (registerData.avatar) {
        formData.append('avatar', registerData.avatar)
      }
      
      const response = await axios.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const { token: authToken, user: userData } = response.data.data
      setAuth(authToken, userData)
      
      return response.data
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 登录
  const login = async (identifier, password) => {
    isLoading.value = true
    try {
      const response = await axios.post('/api/auth/login', {
        identifier,
        password
      })
      
      const { token: authToken, user: userData } = response.data.data
      setAuth(authToken, userData)
      
      return response.data
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 创建匿名用户
  const createAnonymousUser = async (chatroomId) => {
    isLoading.value = true
    try {
      // 首先检查是否有之前的匿名用户记录
      const previousAnonymousUid = localStorage.getItem(`anonymous_uid_${chatroomId}`)
      
      let response
      if (previousAnonymousUid) {
        // 尝试重新激活之前的匿名用户
        try {
          response = await axios.post('/api/auth/anonymous/rejoin', {
            uid: previousAnonymousUid,
            chatroomId
          })
          console.log('重新激活匿名用户成功，禁言时间已重置为10分钟')
          console.log('用户信息:', response.data.data.user)
        } catch (rejoinError) {
          console.log('重新激活失败，创建新的匿名用户:', rejoinError.message)
          // 如果重新激活失败，创建新的匿名用户
          response = await axios.post('/api/auth/anonymous', {
            chatroomId
          })
          // 保存新的匿名用户UID
          localStorage.setItem(`anonymous_uid_${chatroomId}`, response.data.data.user.uid)
        }
      } else {
        // 创建新的匿名用户
        response = await axios.post('/api/auth/anonymous', {
        chatroomId
      })
        // 保存匿名用户UID以便下次重新激活
        localStorage.setItem(`anonymous_uid_${chatroomId}`, response.data.data.user.uid)
      }
      
      const { token: authToken, user: userData } = response.data.data
      setAuth(authToken, userData)
      
      return response.data
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 登出
  const logout = async () => {
    // 清除路由缓存
    try {
      const { useRouteCacheStore } = await import('@/stores/routeCache')
      const routeCacheStore = useRouteCacheStore()
      routeCacheStore.manualClear()
    } catch (error) {
      console.error('清除路由缓存失败:', error)
    }
    
    clearAuth()
  }
  
  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    if (!token.value) return null
    
    try {
      const response = await axios.get('/api/auth/me')
      user.value = response.data.data.user
      return user.value
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果token无效，清除认证状态
      if (error.response?.status === 401) {
        clearAuth()
      }
      throw error
    }
  }
  
  // 更新用户信息
  const updateUserInfo = async (updateData) => {
    isLoading.value = true
    try {
      const formData = new FormData()
      
      if (updateData.nickname) {
        formData.append('nickname', updateData.nickname)
      }
      if (updateData.email) {
        formData.append('email', updateData.email)
      }
      if (updateData.avatar) {
        formData.append('avatar', updateData.avatar)
      }
      
      const response = await axios.put('/api/auth/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      user.value = { ...user.value, ...response.data.data }
      
      // 更新本地存储
      localStorage.setItem('chatroom_user', JSON.stringify(user.value))
      
      return response.data
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 检查用户名/邮箱可用性
  const checkAvailability = async (type, value) => {
    try {
      const response = await axios.post('/api/auth/check-availability', {
        type,
        value
      })
      return response.data.data.available
    } catch (error) {
      throw error
    }
  }
  
  // 刷新token
  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh')
      const { token: newToken } = response.data.data
      
      token.value = newToken
      localStorage.setItem('chatroom_token', newToken)
      setAuthHeader(newToken)
      
      return newToken
    } catch (error) {
      clearAuth()
      throw error
    }
  }
  
  // 检查认证状态（兼容旧代码）
  const checkAuth = async () => {
    await initialize()
  }

  // 更新用户数据（本地更新，不发送请求）
  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    // 更新本地存储
    localStorage.setItem('chatroom_user', JSON.stringify(user.value))
  }

  return {
    // 状态
    token,
    user,
    isLoading,
    isInitialized,
    
    // 计算属性
    isAuthenticated,
    isAnonymous,
    isUser,
    
    // 方法
    initialize,
    initAuth,
    checkAuth,
    register,
    login,
    logout,
    createAnonymousUser,
    fetchCurrentUser,
    updateUserInfo,
    updateUser,
    checkAvailability,
    refreshToken,
    setAuth,
    clearAuth
  }
})