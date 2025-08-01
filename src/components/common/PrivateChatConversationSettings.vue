<template>
  <div class="animate-slide-in-up">
    <div v-if="isLoading" class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm py-4">
      <i class="fas fa-spinner fa-spin"></i>
      <span>加载中...</span>
    </div>
    
    <div v-else class="flex flex-col gap-3">
      <label v-for="(opt, index) in availableOptions" :key="opt.value" class="flex items-start gap-3 p-3 border border-gray-200 dark:border-secondary-600 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-secondary-700 hover:border-gray-300 dark:hover:border-secondary-500" :style="{ animationDelay: `${index * 100}ms` }">
        <div class="relative w-5 h-5 flex-shrink-0">
          <input
            type="radio"
            name="conversationMode"
            :value="opt.value"
            v-model="selectedMode"
            @change="updateMode"
            class="absolute opacity-0 w-full h-full cursor-pointer z-10"
            :disabled="isUpdating"
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
          <div v-if="opt.value === 'limited' && selectedMode === 'limited'" class="mt-3 pt-3 border-t border-gray-200 dark:border-secondary-600 animate-fade-in">
            <div class="flex items-center gap-2 text-sm text-gray-700 dark:text-secondary-300">
              <span>限制消息数：</span>
              <input
                type="number"
                v-model.number="messageLimit"
                min="1"
                max="3"
                class="w-15 px-2 py-1 border border-gray-300 dark:border-secondary-500 rounded-md bg-white dark:bg-secondary-800 text-gray-900 dark:text-secondary-100 text-sm text-center transition-all duration-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                @change="updateMode"
                :disabled="isUpdating"
              >
              <span>条</span>
            </div>
            <div class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">设置对方在你回复前最多可以发送的消息数（1-3条）</div>
          </div>
        </div>
      </label>
    </div>
    
    <div v-if="settings && settings.isGlobalDefault" class="flex items-center gap-2 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm animate-fade-in">
      <i class="fas fa-info-circle"></i>
      <span>当前使用全局默认设置，修改后将创建针对此用户的专用设置</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import axios from 'axios'

const props = defineProps({
  targetUid: {
    type: String,
    required: true
  }
})

const notificationStore = useNotificationStore()

const allOptions = [
  { value: 'free', label: '自由模式', desc: '对方可以自由发送私聊消息' },
  { value: 'limited', label: '限制模式', desc: '对方在你回复前只能发送指定数量的消息' }
  // 注意：禁止模式不在这里提供，因为用户需求中说不支持切换到禁止，可以用拉黑代替
]

// 可用选项（不包括禁止模式）
const availableOptions = computed(() => allOptions)

const selectedMode = ref('limited')
const messageLimit = ref(3)
const isLoading = ref(false)
const isUpdating = ref(false)
const settings = ref(null)

// 获取当前对话设置
const loadConversationSettings = async () => {
  if (!props.targetUid) return
  
  isLoading.value = true
  try {
    const response = await axios.get(`/api/private-chats/settings/${props.targetUid}`)
    if (response.data.success) {
      settings.value = response.data.data
      selectedMode.value = settings.value.mode
      messageLimit.value = settings.value.msgLimit
    }
  } catch (error) {
    console.error('获取私聊对话设置失败:', error)
    notificationStore.error('获取设置失败: ' + (error.response?.data?.message || error.message))
  } finally {
    isLoading.value = false
  }
}

const updateMode = async () => {
  if (isUpdating.value || !props.targetUid) return
  
  isUpdating.value = true
  try {
    // 确保消息限制在1-3之间
    if (selectedMode.value === 'limited') {
      if (messageLimit.value < 1) messageLimit.value = 1
      if (messageLimit.value > 3) messageLimit.value = 3
    }
    
    const response = await axios.patch(`/api/private-chats/settings/${props.targetUid}`, {
      mode: selectedMode.value,
      msgLimit: messageLimit.value
    })
    
    if (response.data.success) {
      settings.value = {
        ...settings.value,
        mode: selectedMode.value,
        msgLimit: messageLimit.value,
        isGlobalDefault: false
      }
      notificationStore.success('对话设置已更新')
    }
  } catch (error) {
    console.error('更新私聊对话设置失败:', error)
    notificationStore.error('更新失败: ' + (error.response?.data?.message || error.message))
  } finally {
    isUpdating.value = false
  }
}

// 监听 targetUid 变化
watch(() => props.targetUid, () => {
  loadConversationSettings()
}, { immediate: true })

// 组件挂载时加载设置
onMounted(() => {
  loadConversationSettings()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

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
  .animate-slide-in-up {
    animation: slide-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  /* 移动端触摸反馈 */
  label:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

/* 高分辨率屏幕优化 */
@media (min-resolution: 2dppx) {
  .animate-slide-in-up {
    animation: slide-in-up 0.4s ease-out;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .animate-slide-in-up,
  .animate-fade-in {
    animation: none;
  }
}
</style> 