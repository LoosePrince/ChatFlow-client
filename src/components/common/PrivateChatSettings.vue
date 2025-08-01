<template>
  <div class="py-3 sm:py-3">
    <div class="mb-4">
      <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
        <i class="fas fa-envelope"></i>
        私聊设置
      </label>
      <div class="text-xs text-gray-500 dark:text-gray-400">
        <span>设置谁可以给你发送私聊消息</span>
      </div>
    </div>
    
    <div class="flex flex-col gap-3">
      <label v-for="opt in options" :key="opt.value" class="flex items-start gap-3 p-3 border border-gray-200 dark:border-secondary-600 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-secondary-700 hover:border-gray-300 dark:hover:border-secondary-500">
        <div class="relative w-5 h-5 flex-shrink-0">
          <input
            type="radio"
            name="privateMode"
            :value="opt.value"
            v-model="selectedMode"
            @change="updateMode"
            class="absolute opacity-0 w-full h-full cursor-pointer z-10"
            :disabled="isLoading"
          >
          <div class="absolute top-0 left-0 w-5 h-5 border-2 border-gray-300 dark:border-secondary-500 rounded-full transition-all duration-200 peer-checked:border-green-600 dark:peer-checked:border-green-500 peer-checked:bg-green-600 dark:peer-checked:bg-green-500"></div>
          <div class="absolute top-0 left-0 w-5 h-5 border-2 border-green-600 dark:border-green-500 rounded-full transition-all duration-200 opacity-0 scale-75 peer-checked:opacity-100 peer-checked:scale-100">
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-gray-900 dark:text-secondary-100 font-medium mb-1">{{ opt.label }}</div>
          <div class="text-gray-600 dark:text-secondary-400 text-sm">{{ opt.desc }}</div>
          
          <!-- 限制模式的消息数量设置 -->
          <div v-if="opt.value === 'limited' && selectedMode === 'limited'" class="mt-3 pt-3 border-t border-gray-200 dark:border-secondary-600">
            <div class="flex items-center gap-2 text-sm text-gray-700 dark:text-secondary-300">
              <span>限制消息数：</span>
              <input
                type="number"
                v-model.number="messageLimit"
                min="1"
                max="3"
                class="w-15 px-2 py-1 border border-gray-300 dark:border-secondary-500 rounded-md bg-white dark:bg-secondary-800 text-gray-900 dark:text-secondary-100 text-sm text-center transition-all duration-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                @change="updateMode"
                :disabled="isLoading"
              >
              <span>条</span>
            </div>
            <div class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">设置陌生人在你回复前最多可以发送的消息数（1-3条）</div>
          </div>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePrivateChatStore } from '@/stores/privateChat'
import { useNotificationStore } from '@/stores/notification'
import axios from 'axios'

const privateChatStore = usePrivateChatStore()
const notificationStore = useNotificationStore()

const options = [
  { value: 'free', label: '自由模式', desc: '任何人都可以给你发送私聊消息' },
  { value: 'limited', label: '限制模式', desc: '陌生人在回复前只能发送指定数量的消息' },
  { value: 'blocked', label: '禁止模式', desc: '完全禁止陌生人发送私聊消息，已创建的私聊会话不受影响' }
]

// 默认选 limited
const selectedMode = ref('limited')
const messageLimit = ref(3) // 默认限制3条消息
const isLoading = ref(false)

// 获取当前全局设置
const loadGlobalSettings = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/api/private-chats/settings')
    if (response.data.success) {
      const settings = response.data.data
      selectedMode.value = settings.mode
      messageLimit.value = settings.msgLimit
    }
  } catch (error) {
    console.error('获取全局私聊设置失败:', error)
    // 使用默认值，不显示错误提示
  } finally {
    isLoading.value = false
  }
}

const updateMode = async () => {
  if (isLoading.value) return
  
  try {
    // 确保消息限制在1-3之间
    if (selectedMode.value === 'limited') {
      if (messageLimit.value < 1) messageLimit.value = 1
      if (messageLimit.value > 3) messageLimit.value = 3
    }
    
    await privateChatStore.updateGlobalMode(selectedMode.value, messageLimit.value)
    notificationStore.success('私聊设置已更新')
  } catch (error) {
    console.error('更新私聊设置失败:', error)
    notificationStore.error('更新失败: ' + (error.response?.data?.message || error.message))
  }
}

// 组件挂载时加载当前设置
onMounted(() => {
  loadGlobalSettings()
})
</script>

<style scoped>
/* 自定义单选按钮样式 */
input[type="radio"]:checked + div {
  border-color: #059669;
  background: #059669;
}

.dark input[type="radio"]:checked + div {
  border-color: #10b981;
  background: #10b981;
}

/* 移动端优化 */
@media (max-width: 768px) {
  /* 移动端触摸反馈 */
  label:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}
</style> 