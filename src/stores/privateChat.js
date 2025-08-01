import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const usePrivateChatStore = defineStore('privateChat', () => {
  // 会话列表
  const chats = ref([]) // [{chatId, otherUid, lastMessage, lastMessageAt, unread}]
  // 当前打开的会话
  const currentChatId = ref(null)
  // 消息缓存，键为chatId，值为数组
  const messages = ref({})
  // 加载状态
  const isLoading = ref(false)
  // 拉黑列表
  const blockedUids = ref(new Set())

  // 未读总数
  const totalUnread = computed(() => chats.value.reduce((sum, c) => sum + (c.unread || 0), 0))

  // ----------------- 内部辅助 -----------------
  const findChatIndex = (chatId) => chats.value.findIndex(c => c.chatId === chatId)

  const isBlocked = (uid) => blockedUids.value.has(uid)

  // ----------------- API 调用 ----------------
  // 获取我的会话列表
  const fetchChats = async () => {
    isLoading.value = true
    try {
      const res = await axios.get('/api/private-chats')
      const list = res.data.data || []
      // 初始化 unread = 0
      chats.value = list.map(c => ({ ...c, unread: 0 }))
    } finally {
      isLoading.value = false
    }
  }

  // 选择当前会话
  const openChat = async (chatId) => {
    currentChatId.value = chatId
    // 将未读清零
    const idx = findChatIndex(chatId)
    if (idx >= 0) chats.value[idx].unread = 0

    // 如果还没有加载消息，拉取
    if (!messages.value[chatId]) {
      await fetchMessages(chatId)
    }
  }

  // 拉取消息
  const fetchMessages = async (chatId, limit = 50, offset = 0) => {
    isLoading.value = true
    try {
      const res = await axios.get(`/api/private-chats/${chatId}/messages`, {
        params: { limit, offset }
      })
      const list = res.data.data || []
      messages.value[chatId] = list.reverse() // 逆序，时间升序
    } finally {
      isLoading.value = false
    }
  }

  // 发送消息
  const sendMessage = async (targetUid, content, messageType = 'text') => {
    if (!content) return
    const res = await axios.post(`/api/private-chats/${targetUid}/messages`, { content, messageType })
    const msg = res.data.data

    // 更新本地 state
    const chatId = msg.chatId
    if (!messages.value[chatId]) messages.value[chatId] = []
    messages.value[chatId].push(msg)

    // 更新会话列表 lastMessage
    const idx = findChatIndex(chatId)
    if (idx >= 0) {
      chats.value[idx].lastMessage = msg
      chats.value[idx].lastMessageAt = msg.createdAt
    } else {
      chats.value.unshift({
        chatId,
        otherUid: targetUid,
        lastMessage: msg,
        lastMessageAt: msg.createdAt,
        unread: 0
      })
    }
  }

  // 接收实时消息（可由 WebSocket 事件调用）
  const receiveMessage = (msg) => {
    const chatId = msg.chatId
    if (!messages.value[chatId]) messages.value[chatId] = []
    messages.value[chatId].push(msg)

    // 更新会话列表
    const idx = findChatIndex(chatId)
    if (idx >= 0) {
      chats.value[idx].lastMessage = msg
      chats.value[idx].lastMessageAt = msg.createdAt
      if (currentChatId.value !== chatId) {
        chats.value[idx].unread = (chats.value[idx].unread || 0) + 1
      }
    } else {
      chats.value.unshift({
        chatId,
        otherUid: msg.senderUid,
        lastMessage: msg,
        lastMessageAt: msg.createdAt,
        unread: currentChatId.value === chatId ? 0 : 1
      })
    }
  }

  // 修改私聊模式
  const updateChatMode = async (targetUid, mode, msgLimit) => {
    await axios.patch(`/api/private-chats/settings/${targetUid}`, { 
      mode,
      msgLimit: mode === 'limited' ? msgLimit : undefined
    })
    if (mode === 'blocked') {
      blockedUids.value.add(targetUid)
    } else {
      blockedUids.value.delete(targetUid)
    }
  }

  // 修改全局模式
  const updateGlobalMode = async (mode, msgLimit) => {
    await axios.patch('/api/private-chats/settings', { 
      mode,
      msgLimit: mode === 'limited' ? msgLimit : undefined
    })
  }

  const blockUser = async (uid) => {
    await axios.post(`/api/private-chats/blacklist/${uid}`)
    blockedUids.value.add(uid)
  }

  const unblockUser = async (uid) => {
    await axios.delete(`/api/private-chats/blacklist/${uid}`)
    blockedUids.value.delete(uid)
  }

  return {
    chats,
    currentChatId,
    messages,
    isLoading,
    totalUnread,
    fetchChats,
    openChat,
    fetchMessages,
    sendMessage,
    receiveMessage,
    updateChatMode,
    updateGlobalMode,
    blockedUids,
    isBlocked,
    blockUser,
    unblockUser
  }
}) 