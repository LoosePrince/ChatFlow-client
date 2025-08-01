import { ref, reactive } from 'vue'
import axios from 'axios'

// 全局用户信息缓存
const userCache = reactive(new Map())

export function useUserInfo() {
  const isLoading = ref(false)

  // 获取用户信息（带缓存）
  const getUserInfo = async (uid) => {
    if (!uid) return null
    
    // 检查缓存
    if (userCache.has(uid)) {
      return userCache.get(uid)
    }

    try {
      isLoading.value = true
      const response = await axios.get(`/api/auth/user/${uid}`)
      
      if (response.data.success) {
        const userInfo = response.data.data
        // 缓存用户信息
        userCache.set(uid, userInfo)
        return userInfo
      }
      
      return null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取失败，返回基本信息
      const fallbackInfo = {
        uid,
        nickname: uid,
        avatarUrl: `/avatars/${uid}`
      }
      userCache.set(uid, fallbackInfo)
      return fallbackInfo
    } finally {
      isLoading.value = false
    }
  }

  // 批量获取用户信息
  const getUsersInfo = async (uids) => {
    if (!Array.isArray(uids) || uids.length === 0) return []
    
    const results = []
    for (const uid of uids) {
      const userInfo = await getUserInfo(uid)
      if (userInfo) {
        results.push(userInfo)
      }
    }
    return results
  }

  // 清除缓存
  const clearCache = () => {
    userCache.clear()
  }

  // 清除特定用户缓存
  const clearUserCache = (uid) => {
    userCache.delete(uid)
  }

  return {
    isLoading,
    getUserInfo,
    getUsersInfo,
    clearCache,
    clearUserCache,
    userCache
  }
} 