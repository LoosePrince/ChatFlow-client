<!-- 私聊页面组件 -->
<template>
  <div>
    <!-- 桌面端内容 -->
    <div class="hidden lg:block p-5 h-full overflow-y-auto">
      <div class="w-full max-w-4xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-8 border border-secondary-200 dark:border-dark-700 shadow-sm">
          <div class="flex justify-between items-center mb-8 pb-4 border-b border-secondary-200 dark:border-dark-700">
            <h2 class="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
              <i class="fas fa-envelope"></i>
              私聊消息 ({{ privateChatStore.chats.length }})
            </h2>
            <button class="w-10 h-10 bg-primary-600 dark:bg-primary-500 border-none rounded-lg text-white cursor-pointer transition-all duration-300 hover:bg-primary-700 dark:hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center" @click="privateChatStore.fetchChats" :disabled="privateChatStore.isLoading">
              <i class="fas fa-sync-alt" :class="{ 'animate-spin': privateChatStore.isLoading }"></i>
            </button>
          </div>
          <PrivateChatList />
        </div>
      </div>
    </div>

    <!-- 手机端内容 -->
    <div class="lg:hidden pt-20 pb-20 min-h-screen w-full bg-secondary-50 dark:bg-gray-900 overflow-x-hidden">
      <div 
        class="p-4 relative min-h-50 will-change-transform touch-pan-y" 
        ref="mobilePrivateContentRef"
        @touchstart="handlePrivateTouchStart"
        @touchmove.prevent="handlePrivateTouchMove"
        @touchend="handlePrivateTouchEnd"
      >
        <!-- 下拉刷新指示器 -->
        <div 
          class="absolute top-[-50px] left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg flex items-center justify-center pointer-events-none transition-all duration-200 will-change-transform"
          :class="{ 
            'opacity-100': currentPrivateY - startPrivateY > 0,
            'opacity-0': currentPrivateY - startPrivateY <= 0
          }"
          :style="{ 
            opacity: Math.min((currentPrivateY - startPrivateY) / refreshThreshold, 1)
          }"
        >
          <i 
            class="fas fa-sync-alt text-xl text-primary-600 dark:text-primary-400 transition-transform duration-200"
            :style="{ 
              transform: isPrivateRefreshing ? 'rotate(360deg)' : `rotate(${((currentPrivateY - startPrivateY) / refreshThreshold) * 180}deg)`
            }"
          ></i>
        </div>
        
        <!-- 下拉刷新文字提示 -->
        <div 
          class="absolute top-[-5px] left-1/2 transform -translate-x-1/2 text-sm text-secondary-600 dark:text-secondary-400 font-medium text-center pointer-events-none transition-opacity duration-200 will-change-opacity whitespace-nowrap"
          :class="{ 
            'opacity-100': currentPrivateY - startPrivateY > 0,
            'opacity-0': currentPrivateY - startPrivateY <= 0
          }"
          :style="{ 
            opacity: Math.min((currentPrivateY - startPrivateY) / refreshThreshold, 1)
          }"
        >
          <span v-if="!isPrivateRefreshing && currentPrivateY - startPrivateY > 0">
            {{ currentPrivateY - startPrivateY > refreshThreshold ? '松开刷新' : '继续下拉' }}
          </span>
          <span v-else-if="isPrivateRefreshing">正在刷新...</span>
        </div>

        <PrivateChatList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePrivateChatStore } from '@/stores/privateChat'
import PrivateChatList from '@/components/common/PrivateChatList.vue'

const privateChatStore = usePrivateChatStore()

// 私聊页下拉刷新相关变量
const isPrivateRefreshing = ref(false)
const startPrivateY = ref(0)
const currentPrivateY = ref(0)
const refreshThreshold = 100 // 触发刷新的阈值
const mobilePrivateContentRef = ref(null)

// 私聊页下拉刷新相关方法
const handlePrivateTouchStart = (e) => {
  if (mobilePrivateContentRef.value.scrollTop > 0) return
  startPrivateY.value = e.touches[0].clientY
  currentPrivateY.value = startPrivateY.value
}

const handlePrivateTouchMove = (e) => {
  if (mobilePrivateContentRef.value.scrollTop > 0) return
  
  currentPrivateY.value = e.touches[0].clientY
  const pullDistance = currentPrivateY.value - startPrivateY.value
  
  if (pullDistance > 0 && !isPrivateRefreshing.value) {
    e.preventDefault()
    const distance = Math.min(pullDistance * 0.5, 100)
    mobilePrivateContentRef.value.style.transform = `translateY(${distance}px)`
  }
}

const handlePrivateTouchEnd = async () => {
  if (mobilePrivateContentRef.value.scrollTop > 0) return
  
  const pullDistance = currentPrivateY.value - startPrivateY.value
  
  if (pullDistance > refreshThreshold && !isPrivateRefreshing.value) {
    // 触发刷新
    isPrivateRefreshing.value = true
    mobilePrivateContentRef.value.style.transform = `translateY(${refreshThreshold}px)`
    
    try {
      await privateChatStore.fetchChats()
    } finally {
      // 重置状态
      isPrivateRefreshing.value = false
      mobilePrivateContentRef.value.style.transition = 'transform 0.3s ease'
      mobilePrivateContentRef.value.style.transform = 'translateY(0)'
      setTimeout(() => {
        mobilePrivateContentRef.value.style.transition = ''
      }, 300)
    }
  } else {
    // 未达到刷新阈值，回弹
    mobilePrivateContentRef.value.style.transition = 'transform 0.3s ease'
    mobilePrivateContentRef.value.style.transform = 'translateY(0)'
    setTimeout(() => {
      mobilePrivateContentRef.value.style.transition = ''
    }, 300)
  }
  
  startPrivateY.value = 0
  currentPrivateY.value = 0
}

// 生命周期
onMounted(() => {
  // 加载私聊列表
  if (privateChatStore.chats.length === 0) {
    privateChatStore.fetchChats()
  }
})
</script> 