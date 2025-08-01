<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative overflow-hidden">
    <div class="text-center text-gray-800 dark:text-white z-10 relative">
      <div class="text-9xl font-black leading-none mb-5 drop-shadow-2xl bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
        404
      </div>
      <h1 class="text-4xl font-bold mb-4 drop-shadow-lg text-gray-800 dark:text-gray-100">页面未找到</h1>
      <p class="text-lg mb-4 opacity-90 max-w-lg mx-auto text-gray-700 dark:text-gray-300 dark:opacity-100">
        抱歉，您访问的页面不存在或已被删除
      </p>
      <p class="text-base mb-8 opacity-80 text-yellow-600 font-medium dark:text-yellow-300 dark:opacity-100">
        将在 {{ countdown }} 秒后自动跳转到首页...
      </p>
      
      <div class="flex gap-5 justify-center flex-wrap">
        <button @click="goHome" class="px-8 py-4 border-none rounded-full text-base font-semibold cursor-pointer flex items-center gap-2.5 transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 dark:bg-indigo-500 dark:hover:bg-indigo-600">
          <i class="fas fa-home"></i>
          立即返回首页
        </button>
        <button @click="goBack" class="px-8 py-4 bg-transparent text-gray-700 border-2 border-gray-400 rounded-full text-base font-semibold cursor-pointer flex items-center gap-2.5 transition-all duration-300 hover:bg-gray-100 hover:-translate-y-0.5 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-800">
          <i class="fas fa-arrow-left"></i>
          上一页
        </button>
      </div>
    </div>
    
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute w-48 h-48 top-1/5 left-1/10 bg-gray-300/30 dark:bg-gray-600/20 rounded-full animate-float"></div>
      <div class="absolute w-36 h-36 top-3/5 right-1/6 bg-gray-300/30 dark:bg-gray-600/20 rounded-full animate-float animation-delay-2000"></div>
      <div class="absolute w-24 h-24 bottom-1/5 left-3/5 bg-gray-300/30 dark:bg-gray-600/20 rounded-full animate-float animation-delay-4000"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// 路由相关
const router = useRouter()

// 倒计时相关
const countdown = ref(5)
let timer = null

// 自动重定向倒计时
const startCountdown = () => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      goHome()
    }
  }, 1000)
}

// 返回首页
const goHome = () => {
  router.push({ name: 'Home' })
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 组件挂载时开始倒计时
onMounted(() => {
  startCountdown()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
/* 自定义动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .text-9xl {
    font-size: 6.25rem; /* 100px */
  }
  
  .text-4xl {
    font-size: 1.75rem; /* 28px */
  }
  
  .text-lg {
    font-size: 1rem; /* 16px */
  }

  .text-base {
    font-size: 0.875rem; /* 14px */
  }
  
  .px-8 {
    padding-left: 1.5rem; /* 24px */
    padding-right: 1.5rem; /* 24px */
  }
  
  .py-4 {
    padding-top: 0.75rem; /* 12px */
    padding-bottom: 0.75rem; /* 12px */
  }
  
  .text-base {
    font-size: 0.875rem; /* 14px */
  }
}
</style> 