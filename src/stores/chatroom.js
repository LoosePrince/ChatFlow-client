import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useChatroomStore = defineStore('chatroom', () => {
  // 状态
  const currentRoom = ref(null)
  const messages = ref([])
  const onlineUsers = ref([])
  const isConnected = ref(false)
  const socket = ref(null)
  const userChatrooms = ref([])
  const isLoading = ref(false)
  
  // 计算属性
  const roomId = computed(() => currentRoom.value?.id)
  const roomName = computed(() => currentRoom.value?.name)
  const isInRoom = computed(() => !!currentRoom.value)
  
  // 方法
  const setCurrentRoom = (room) => {
    currentRoom.value = room
  }
  
  const clearCurrentRoom = () => {
    currentRoom.value = null
    messages.value = []
    onlineUsers.value = []
  }
  
  const addMessage = (message) => {
    messages.value.push(message)
  }
  
  const setMessages = (messageList) => {
    messages.value = messageList
  }
  
  const updateOnlineUsers = (users) => {
    onlineUsers.value = users
  }
  
  const setSocket = (socketInstance) => {
    socket.value = socketInstance
    isConnected.value = true
  }
  
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    isConnected.value = false
  }
  
  // 获取聊天室信息
  const fetchRoomInfo = async (roomId) => {
    try {
      const response = await axios.get(`/api/chatrooms/${roomId}`)
      return response.data.data
    } catch (error) {
      console.error('获取聊天室信息失败:', error)
      throw error
    }
  }
  
  // 获取聊天室消息
  const fetchMessages = async (roomId, limit = 50, offset = 0) => {
    try {
      const response = await axios.get(`/api/chatrooms/${roomId}/messages`, {
        params: { limit, offset }
      })
      return response.data.data
    } catch (error) {
      console.error('获取聊天室消息失败:', error)
      throw error
    }
  }
  
  // 发送消息
  const sendMessage = async (roomId, content, messageType = 'text') => {
    try {
      const response = await axios.post(`/api/chatrooms/${roomId}/messages`, {
        content,
        messageType
      })
      return response.data.data
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }
  
  // 获取用户创建的聊天室列表
  const fetchUserChatrooms = async () => {
    isLoading.value = true
    try {
      const response = await axios.get('/api/chatrooms/my/rooms')
      userChatrooms.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('获取聊天室列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 加入聊天室
  const joinChatroom = async (roomId, password = null) => {
    try {
      const response = await axios.post('/api/chatrooms/join', {
        roomId,
        password
      })
      
      currentRoom.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('加入聊天室失败:', error)
      throw error
    }
  }
  
  // 创建聊天室
  const createChatroom = async (chatroomData) => {
    try {
      const response = await axios.post('/api/chatrooms', chatroomData)
      const newChatroom = response.data.data
      
      // 添加到列表顶部
      userChatrooms.value.unshift({
        roomId: newChatroom.roomId,
        name: newChatroom.name,
        createdAt: new Date().toISOString(),
        userCount: 0,
        lastMessage: null
      })
      
      return newChatroom
    } catch (error) {
      console.error('创建聊天室失败:', error)
      throw error
    }
  }

  // 更新聊天室名称
  const updateRoomName = async (roomId, newName) => {
    try {
      const response = await axios.put(`/api/chatrooms/${roomId}/name`, {
        name: newName
      })
      
      // 更新当前房间信息
      if (currentRoom.value && currentRoom.value.id === roomId) {
        currentRoom.value.name = newName
      }
      
      // 更新用户聊天室列表中的名称
      const roomIndex = userChatrooms.value.findIndex(room => room.roomId === roomId)
      if (roomIndex !== -1) {
        userChatrooms.value[roomIndex].name = newName
      }
      
      return response.data.data
    } catch (error) {
      console.error('更新聊天室名称失败:', error)
      throw error
    }
  }
  
  return {
    // 状态
    currentRoom,
    messages,
    onlineUsers,
    isConnected,
    socket,
    userChatrooms,
    isLoading,
    
    // 计算属性
    roomId,
    roomName,
    isInRoom,
    
    // 方法
    setCurrentRoom,
    clearCurrentRoom,
    addMessage,
    setMessages,
    updateOnlineUsers,
    setSocket,
    disconnect,
    fetchRoomInfo,
    fetchMessages,
    sendMessage,
    fetchUserChatrooms,
    joinChatroom,
    createChatroom,
    updateRoomName
  }
}) 