<template>
  <div class="router-loading">
    <div class="loading-content">
      <div class="spinner"></div>
      <p class="loading-text">正在加载页面...</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.router-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  backdrop-filter: blur(2px);
}

.dark .router-loading {
  background: rgba(17, 24, 39, 0.9);
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.dark .spinner {
  border-color: #374151;
  border-top-color: #818cf8;
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.dark .loading-text {
  color: #9ca3af;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>