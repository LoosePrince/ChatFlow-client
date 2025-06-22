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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-select-content {
  width: 100%;
  max-width: 800px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.title {
  color: white;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.option-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-header i {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 15px;
  display: block;
}

.card-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.action-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.anonymous-notice {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  color: white;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.anonymous-notice i {
  font-size: 24px;
  margin-bottom: 10px;
  display: block;
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .title {
    font-size: 24px;
  }
}
</style> 