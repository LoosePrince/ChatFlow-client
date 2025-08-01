<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" @click="$emit('cancel')">
    <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl max-w-lg w-[90%] max-h-[90vh] overflow-hidden animate-slide-in" @click.stop>
      <div class="flex justify-between items-center p-5 pb-4 border-b border-gray-200 dark:border-secondary-600">
        <h3 class="m-0 text-lg font-semibold text-gray-900 dark:text-secondary-100 flex items-center gap-2">
          <i class="fas fa-edit text-blue-600 dark:text-blue-400"></i>
          修改聊天室名称
        </h3>
        <button @click="$emit('cancel')" class="bg-transparent border-none text-gray-500 dark:text-gray-400 text-base cursor-pointer p-2 rounded-md transition-all duration-200 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-secondary-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="p-6">
        <div class="mb-5">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-secondary-100 mb-2">
            <i class="fas fa-tag text-blue-600 dark:text-blue-400"></i>
            聊天室名称
          </label>
          <input
            ref="nameInput"
            v-model="newRoomName"
            type="text"
            placeholder="请输入新的聊天室名称"
            class="w-full px-4 py-3 border-2 border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-sm text-gray-900 dark:text-secondary-100 transition-all duration-200 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
            maxlength="50"
            @keydown.enter="handleSubmit"
          >
          <div class="text-right text-xs text-gray-500 dark:text-gray-400 mt-1.5">{{ newRoomName.length }}/50</div>
        </div>
        
        <div class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">
          <i class="fas fa-info-circle text-blue-600 dark:text-blue-400"></i>
          <span>只有聊天室创建者可以修改名称</span>
        </div>
      </div>
      
      <div class="flex justify-end gap-3 px-6 pb-5">
        <button @click="$emit('cancel')" class="px-5 py-2.5 border-none bg-gray-100 dark:bg-secondary-600 text-gray-600 dark:text-gray-300 rounded-md cursor-pointer text-sm font-medium transition-all duration-200 flex items-center gap-1.5 hover:bg-gray-200 dark:hover:bg-secondary-500 hover:text-gray-700 dark:hover:text-gray-200">
          <i class="fas fa-times"></i>
          取消
        </button>
        <button 
          @click="handleSubmit" 
          :disabled="!canSubmit"
          class="px-5 py-2.5 border-none bg-blue-600 dark:bg-blue-500 text-white rounded-md cursor-pointer text-sm font-medium transition-all duration-200 flex items-center gap-1.5 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'pointer-events-none': isSubmitting }"
        >
          <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
          <i class="fas fa-check" v-else></i>
          {{ isSubmitting ? '修改中...' : '确认修改' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['cancel', 'submit'])

// 状态管理
const newRoomName = ref('')
const isSubmitting = ref(false)
const nameInput = ref(null)

// 计算属性
const canSubmit = computed(() => {
  return newRoomName.value.trim().length > 0 && 
         newRoomName.value.trim().length <= 50 && 
         newRoomName.value.trim() !== props.currentName &&
         !isSubmitting.value
})

// 处理提交
const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  isSubmitting.value = true
  
  try {
    await emit('submit', newRoomName.value.trim())
    
    // 重置表单
    newRoomName.value = ''
  } catch (error) {
    console.error('修改聊天室名称失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 监听显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    // 初始化当前名称
    newRoomName.value = props.currentName
    nextTick(() => {
      nameInput.value?.focus()
      nameInput.value?.select()
    })
  } else {
    // 关闭时重置状态
    newRoomName.value = ''
    isSubmitting.value = false
  }
})
</script>

<style scoped>
/* 动画效果 */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .room-name-edit-dialog {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  /* 移动端触摸反馈 */
  button:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-in {
    animation: none;
  }
}
</style> 