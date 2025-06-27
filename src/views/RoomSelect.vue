<template>
  <div class="room-select-container">
    <div class="room-select-content">
      <div class="header">
        <button @click="goBack" class="back-button">
          <i class="fas fa-arrow-left"></i>
          返回
        </button>
        <h1 class="title">选择聊天室</h1>
      </div>

      <div class="options-grid">
        <!-- 加入聊天室 -->
        <div class="option-card">
          <div class="card-header">
            <i class="fas fa-sign-in-alt"></i>
            <h2>加入聊天室</h2>
          </div>
          <form @submit.prevent="joinRoom" class="option-form">
            <div class="form-group">
              <label>聊天室ID</label>
              <input
                v-model="joinForm.roomId"
                type="text"
                placeholder="请输入8位16进制ID"
                maxlength="8"
                required
              >
            </div>
            <div class="form-group">
              <label>密码（可选）</label>
              <input
                v-model="joinForm.password"
                type="password"
                placeholder="如果房间有密码请输入"
              >
            </div>
            <button type="submit" class="action-button" :disabled="isLoading">
              <i class="fas fa-sign-in-alt" :class="{ 'fa-spin': isLoading }"></i>
              {{ isLoading ? '加入中...' : '加入房间' }}
            </button>
          </form>
        </div>

        <!-- 创建聊天室 -->
        <div class="option-card" v-if="!isAnonymous">
          <div class="card-header">
            <i class="fas fa-plus"></i>
            <h2>创建聊天室</h2>
          </div>
          <form @submit.prevent="createRoom" class="option-form">
            <div class="form-group">
              <label>房间名称</label>
              <input
                v-model="createForm.name"
                type="text"
                placeholder="请输入房间名称"
                maxlength="50"
                required
              >
            </div>
            <div class="form-group">
              <label>设置密码（可选）</label>
              <input
                v-model="createForm.password"
                type="password"
                placeholder="留空表示公开房间"
              >
            </div>
            <button type="submit" class="action-button" :disabled="isLoading">
              <i class="fas fa-plus" :class="{ 'fa-spin': isLoading }"></i>
              {{ isLoading ? '创建中...' : '创建房间' }}
            </button>
          </form>
        </div>
      </div>

      <!-- 匿名用户提示 -->
      <div v-if="isAnonymous" class="anonymous-notice">
        <i class="fas fa-info-circle"></i>
        <p>匿名用户只能加入现有聊天室，无法创建新房间</p>
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
.room-select-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .room-select-container {
  background: #1e293b;
}

.room-select-content {
  width: 100%;
  max-width: 800px;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-button {
  background: white;
  color: #1976d2;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.dark .back-button {
  background: #0f172a;
  color: #60a5fa;
  border-color: #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.dark .back-button:hover {
  background: #1e293b;
  border-color: #475569;
}

.title {
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.dark .title {
  color: #f1f5f9;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.option-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.option-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #cbd5e1;
}

.dark .option-card {
  background: #0f172a;
  border: 1px solid #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.dark .option-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border-color: #475569;
}

.card-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.card-header i {
  font-size: 2.5rem;
  color: #1976d2;
  margin-bottom: 0.75rem;
  display: block;
}

.dark .card-header i {
  color: #60a5fa;
}

.card-header h2 {
  color: #1f2937;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.dark .card-header h2 {
  color: #f1f5f9;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.dark .form-group label {
  color: #f1f5f9;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #1f2937;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.dark .form-group input {
  background: #1e293b;
  border: 1px solid #475569;
  color: #f1f5f9;
}

.dark .form-group input::placeholder {
  color: #6b7280;
}

.dark .form-group input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.action-button {
  width: 100%;
  background: #1976d2;
  color: white;
  border: none;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.action-button:hover:not(:disabled) {
  background: #1565c0;
}

.action-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.dark .action-button {
  background: #3b82f6;
}

.dark .action-button:hover:not(:disabled) {
  background: #2563eb;
}

.dark .action-button:disabled {
  background: #4b5563;
}

.anonymous-notice {
  background: white;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 1rem;
  color: #92400e;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.anonymous-notice i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
  color: #f59e0b;
}

.dark .anonymous-notice {
  background: #0f172a;
  border-color: #f59e0b;
  color: #fbbf24;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.dark .anonymous-notice i {
  color: #fbbf24;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .room-select-container {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .header {
    margin-bottom: 1.5rem;
  }
  
  .option-card {
    padding: 1rem;
  }
  
  .card-header {
    margin-bottom: 1rem;
  }
  
  .card-header i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .card-header h2 {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .back-button {
    align-self: flex-start;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
  
  .title {
    font-size: 1.25rem;
    align-self: center;
  }
  
  .room-select-container {
    padding: 0.75rem;
    padding-top: 1.5rem;
  }
}
</style> 