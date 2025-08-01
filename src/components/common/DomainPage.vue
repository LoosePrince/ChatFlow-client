<!-- 领域页面组件 -->
<template>
  <div>
    <!-- 桌面端内容 -->
    <div class="hidden lg:block p-5 h-full overflow-y-auto">
      <div class="w-full max-w-4xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-8 border border-secondary-200 dark:border-dark-700 shadow-sm">
          <div class="flex justify-between items-center mb-8 pb-4 border-b border-secondary-200 dark:border-dark-700">
            <h2 class="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
              <i class="fas fa-globe"></i>
              领域探索
            </h2>
          </div>
          <div class="text-center py-12 text-secondary-700 dark:text-secondary-300">
            <div class="text-6xl mb-4 text-primary-600 dark:text-primary-400 opacity-60">
              <i class="fas fa-globe"></i>
            </div>
            <h3 class="text-2xl mb-2">领域功能开发中</h3>
            <p class="opacity-80">敬请期待更多精彩功能</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 手机端内容 -->
    <div class="lg:hidden pt-20 pb-20 min-h-screen w-full bg-secondary-50 dark:bg-gray-900 overflow-x-hidden">
      <div class="p-4">
        <div class="py-12 px-4 text-center text-secondary-600 dark:text-secondary-400">
          <div class="text-6xl mb-4 text-primary-600 dark:text-primary-400 opacity-60">
            <i class="fas fa-globe"></i>
          </div>
          <h3 class="text-xl mb-2 text-secondary-900 dark:text-secondary-100 font-semibold">领域功能开发中</h3>
          <p class="text-sm text-secondary-600 dark:text-secondary-400">敬请期待更多精彩功能</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 领域页面组件逻辑
</script> 