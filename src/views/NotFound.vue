<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-message">抱歉，您访问的页面不存在或已被删除</p>
      <p class="redirect-message">将在 {{ countdown }} 秒后自动跳转到首页...</p>
      
      <div class="action-buttons">
        <button @click="goHome" class="home-button">
          <i class="fas fa-home"></i>
          立即返回首页
        </button>
        <button @click="goBack" class="back-button">
          <i class="fas fa-arrow-left"></i>
          上一页
        </button>
      </div>
    </div>
    
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
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
.not-found-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.not-found-content {
  text-align: center;
  color: white;
  z-index: 2;
  position: relative;
}

.error-code {
  font-size: 150px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.error-message {
  font-size: 18px;
  margin-bottom: 15px;
  opacity: 0.9;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.redirect-message {
  font-size: 16px;
  margin-bottom: 30px;
  opacity: 0.8;
  color: #ffd700;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.home-button,
.back-button {
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.home-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.home-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.back-button {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@media (max-width: 768px) {
  .error-code {
    font-size: 100px;
  }
  
  .error-title {
    font-size: 28px;
  }
  
  .error-message {
    font-size: 16px;
    padding: 0 20px;
  }

  .redirect-message {
    font-size: 14px;
    padding: 0 20px;
  }
  
  .action-buttons {
    padding: 0 20px;
  }
  
  .home-button,
  .back-button {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style> 