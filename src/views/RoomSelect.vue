<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
    <div class="w-full max-w-4xl">
      <div class="flex items-center gap-4 mb-8">
        <button @click="goBack" class="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg cursor-pointer flex items-center gap-2 transition-all duration-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          <i class="fas fa-arrow-left"></i>
          返回
        </button>
        <h1 class="text-gray-800 dark:text-gray-100 text-4xl font-bold m-0">选择聊天室</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 加入聊天室 -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600">
          <div class="text-center mb-6">
            <i class="fas fa-sign-in-alt text-5xl text-blue-600 dark:text-blue-400 mb-3 block"></i>
            <h2 class="text-gray-800 dark:text-gray-100 m-0 text-2xl font-semibold">加入聊天室</h2>
          </div>
          <form @submit.prevent="joinRoom" class="space-y-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-100 font-medium mb-2 text-sm">聊天室ID</label>
              <input
                v-model="joinForm.roomId"
                type="text"
                placeholder="请输入8位16进制ID"
                maxlength="8"
                required
                class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-3 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 placeholder-gray-400 dark:placeholder-gray-500"
              >
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-100 font-medium mb-2 text-sm">密码（可选）</label>
              <input
                v-model="joinForm.password"
                type="password"
                placeholder="如果房间有密码请输入"
                class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-3 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 placeholder-gray-400 dark:placeholder-gray-500"
              >
            </div>
            <button type="submit" class="w-full bg-blue-600 dark:bg-blue-500 text-white border-none py-3 px-4 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed mt-2" :disabled="isLoading">
              <i class="fas fa-sign-in-alt" :class="{ 'fa-spin': isLoading }"></i>
              {{ isLoading ? '加入中...' : '加入房间' }}
            </button>
          </form>
        </div>

        <!-- 创建聊天室 -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600" v-if="!isAnonymous">
          <div class="text-center mb-6">
            <i class="fas fa-plus text-5xl text-blue-600 dark:text-blue-400 mb-3 block"></i>
            <h2 class="text-gray-800 dark:text-gray-100 m-0 text-2xl font-semibold">创建聊天室</h2>
          </div>
          <form @submit.prevent="createRoom" class="space-y-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-100 font-medium mb-2 text-sm">房间名称</label>
              <input
                v-model="createForm.name"
                type="text"
                placeholder="请输入房间名称"
                maxlength="50"
                required
                class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-3 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 placeholder-gray-400 dark:placeholder-gray-500"
              >
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-100 font-medium mb-2 text-sm">设置密码（可选）</label>
              <input
                v-model="createForm.password"
                type="password"
                placeholder="留空表示公开房间"
                class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-3 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 placeholder-gray-400 dark:placeholder-gray-500"
              >
            </div>
            <button type="submit" class="w-full bg-blue-600 dark:bg-blue-500 text-white border-none py-3 px-4 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed mt-2" :disabled="isLoading">
              <i class="fas fa-plus" :class="{ 'fa-spin': isLoading }"></i>
              {{ isLoading ? '创建中...' : '创建房间' }}
            </button>
          </form>
        </div>
      </div>

      <!-- 匿名用户提示 -->
      <div v-if="isAnonymous" class="bg-white dark:bg-gray-800 border border-yellow-400 dark:border-yellow-500 rounded-lg p-4 text-yellow-800 dark:text-yellow-200 text-center shadow-sm">
        <i class="fas fa-info-circle text-2xl mb-2 block text-yellow-600 dark:text-yellow-400"></i>
        <p class="m-0">匿名用户只能加入现有聊天室，无法创建新房间</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useNotificationStore, useChatroomStore } from '@/stores'
import axios from 'axios'

// 路由相关
const router = useRouter()
const route = useRoute()

// Store实例
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const chatroomStore = useChatroomStore()

// 响应式数据
const isLoading = ref(false)

const joinForm = reactive({
  roomId: '',
  password: ''
})

const createForm = reactive({
  name: '',
  password: ''
})

// 计算属性
const isAnonymous = computed(() => {
  return route.query.mode === 'anonymous' || authStore.isAnonymous
})

// 加入房间
const joinRoom = async () => {
  if (!joinForm.roomId.trim()) {
    notificationStore.error('请输入聊天室ID')
    return
  }
  
  // 验证房间ID格式（8位16进制）
  if (!/^[0-9a-fA-F]{8}$/.test(joinForm.roomId)) {
    notificationStore.error('聊天室ID必须是8位16进制字符')
    return
  }
  
  isLoading.value = true
  try {
    // 先验证聊天室是否存在
    const roomInfo = await chatroomStore.fetchRoomInfo(joinForm.roomId)
    
    // 如果房间需要密码但没有提供密码
    if (roomInfo.hasPassword && !joinForm.password) {
      notificationStore.error('该聊天室需要密码')
      return
    }
    
    // 如果提供了密码，验证密码
    if (joinForm.password) {
      try {
        await axios.post('/api/chatrooms/join', {
          roomId: joinForm.roomId,
          password: joinForm.password
        })
      } catch (error) {
        if (error.response?.status === 401) {
          notificationStore.error('密码错误')
          return
        }
        throw error
      }
    }
    
    // 如果是匿名模式，创建匿名用户
    if (isAnonymous.value && !authStore.isAuthenticated) {
      try {
        await authStore.createAnonymousUser(joinForm.roomId)
        notificationStore.success('已创建匿名用户身份')
      } catch (error) {
        console.error('创建匿名用户失败:', error)
        notificationStore.error('创建匿名用户失败: ' + (error.response?.data?.message || error.message))
        return
      }
    }
    
    notificationStore.success(`成功加入聊天室：${roomInfo.name}`)
    router.push({ 
      name: 'ChatRoom', 
      params: { roomId: joinForm.roomId }
    })
  } catch (error) {
    console.error('加入房间失败:', error)
    if (error.response?.status === 404) {
      notificationStore.error('聊天室不存在')
    } else {
      notificationStore.error(error.response?.data?.message || error.message || '加入房间失败')
    }
  } finally {
    isLoading.value = false
  }
}

// 创建房间
const createRoom = async () => {
  if (!createForm.name.trim()) {
    notificationStore.error('请输入房间名称')
    return
  }
  
  if (createForm.name.length > 50) {
    notificationStore.error('房间名称不能超过50个字符')
    return
  }
  
  isLoading.value = true
  try {
    const response = await axios.post('/api/chatrooms', {
      name: createForm.name.trim(),
      password: createForm.password || null
    })
    
    const result = response.data.data
    notificationStore.success(`聊天室"${result.name}"创建成功！`)
    
    // 创建成功后跳转到聊天室
    router.push({ 
      name: 'ChatRoom', 
      params: { roomId: result.roomId }
    })
  } catch (error) {
    console.error('创建房间失败:', error)
    notificationStore.error(error.response?.data?.message || error.message || '创建房间失败')
  } finally {
    isLoading.value = false
  }
}

// 返回首页
const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .min-h-screen {
    min-height: 100vh;
  }
  
  .p-4 {
    padding: 1rem;
  }
  
  .flex.items-center.justify-center {
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .grid.grid-cols-1.lg\\:grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .text-4xl {
    font-size: 1.5rem;
  }
  
  .mb-8 {
    margin-bottom: 1.5rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
  
  .text-center.mb-6 {
    margin-bottom: 1rem;
  }
  
  .text-5xl {
    font-size: 2rem;
  }
  
  .mb-3 {
    margin-bottom: 0.5rem;
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .flex.items-center.gap-4 {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .bg-white.dark\\:bg-gray-800 {
    align-self: flex-start;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
  
  .text-4xl.font-bold {
    font-size: 1.25rem;
    align-self: center;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
  
  .flex.items-center.justify-center {
    padding-top: 1.5rem;
  }
}
</style> 