<template>
  <div class="max-w-[500px] bg-gray-50 dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center gap-2 p-10 text-gray-500 dark:text-gray-400">
      <i class="fas fa-spinner fa-spin text-lg text-pink-500"></i>
      <span>加载视频信息中...</span>
    </div>

    <!-- 回退模式：仅显示视频播放器 -->
    <div v-else-if="fallbackMode" class="border-l-3 border-yellow-500 dark:border-yellow-400">
      <!-- 视频播放器 -->
      <div class="relative w-full aspect-video">
        <iframe 
          :src="`//player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`"
          class="w-full h-full border-none"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
      
      <!-- 简化信息 -->
      <div class="p-4">
        <div class="mb-3">
          <div class="flex gap-3 flex-wrap text-xs">
            <span class="font-mono bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-medium">{{ bvid }}</span>
            <span class="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded text-xs font-medium">{{ fallbackError || '信息加载失败，仅显示播放器' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态（保留用于其他致命错误） -->
    <div v-else-if="error" class="flex items-start gap-3 p-5 text-red-500 dark:text-red-400">
      <i class="fas fa-exclamation-triangle text-xl mt-0.5 flex-shrink-0"></i>
      <div class="flex-1">
        <div class="font-semibold mb-1">无法加载视频信息</div>
        <div class="text-sm opacity-80 mb-2">{{ error }}</div>
        <div class="text-xs font-mono bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded inline-block">BVID: {{ bvid }}</div>
      </div>
    </div>

    <!-- 视频内容 -->
    <div v-else-if="videoInfo">
      <!-- 视频播放器 -->
      <div class="relative w-full aspect-video">
        <iframe 
          :src="`//player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`"
          class="w-full h-full border-none"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>

      <!-- 视频信息 -->
      <div class="p-4">
        <!-- 标题和基础信息 -->
        <div class="mb-3">
          <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100 m-0 mb-2 leading-relaxed">{{ videoInfo.title }}</h3>
          <div class="flex gap-3 flex-wrap text-xs">
            <span class="font-mono bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-medium">{{ videoInfo.bvid }}</span>
            <span class="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded font-medium">{{ getCopyrightText(videoInfo.copyright) }}</span>
            <span class="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">{{ getResolutionText(videoInfo.dimension) }}</span>
          </div>
        </div>

        <!-- 作者信息 -->
        <div class="mb-3 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
          <div class="w-full flex items-center justify-between">
            <div class="font-semibold text-gray-800 dark:text-gray-100 text-sm mr-0.5">{{ videoInfo.owner.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatPublishTime(videoInfo.pubdate) }}</div>
          </div>
        </div>

        <!-- 视频描述（如果有） -->
        <div v-if="videoInfo.desc && videoInfo.desc !== '-'" class="mb-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md border-l-3 border-gray-500 dark:border-gray-400">
          <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">简介：</div>
          <div class="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{{ videoInfo.desc }}</div>
        </div>

        <!-- 统计信息 -->
        <div class="flex gap-4 flex-wrap">
          <div class="stat-item flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <i class="fas fa-play-circle text-sm w-3.5 text-cyan-600 dark:text-cyan-400"></i>
            <span>{{ formatNumber(videoInfo.stat.view) }}</span>
          </div>
          <div class="stat-item flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <i class="fas fa-thumbs-up text-sm w-3.5 text-green-600 dark:text-green-400"></i>
            <span>{{ formatNumber(videoInfo.stat.like) }}</span>
          </div>
          <div class="stat-item flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <i class="fas fa-star text-sm w-3.5 text-yellow-600 dark:text-yellow-400"></i>
            <span>{{ formatNumber(videoInfo.stat.favorite) }}</span>
          </div>
          <div class="stat-item flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <i class="fas fa-coins text-sm w-3.5 text-orange-600 dark:text-orange-400"></i>
            <span>{{ formatNumber(videoInfo.stat.coin) }}</span>
          </div>
          <div class="stat-item flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <i class="fas fa-comment text-sm w-3.5 text-purple-600 dark:text-purple-400"></i>
            <span>{{ formatNumber(videoInfo.stat.reply) }}</span>
          </div>
          <div class="stat-item flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <i class="fas fa-share text-sm w-3.5 text-teal-600 dark:text-teal-400"></i>
            <span>{{ formatNumber(videoInfo.stat.share) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  bvid: {
    type: String,
    required: true
  }
})

const loading = ref(true)
const error = ref(null)
const videoInfo = ref(null)
const fallbackMode = ref(false)
const fallbackError = ref(null)

// 简化错误信息
const getSimplifiedError = (errorMessage) => {
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) {
    return '网络连接失败'
  }
  if (errorMessage.includes('API端点不存在') || errorMessage.includes('端点不存在')) {
    return 'API端点不存在'
  }
  if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
    return '接口不存在'
  }
  if (errorMessage.includes('API不支持')) {
    return 'API不支持'
  }
  if (errorMessage.includes('服务暂不可用')) {
    return '服务暂不可用'
  }
  if (errorMessage.includes('获取视频信息失败')) {
    return '获取信息失败'
  }
  // 默认简化处理，截取前20个字符
  return errorMessage.length > 20 ? errorMessage.substring(0, 20) + '...' : errorMessage
}

// 获取视频信息
const fetchVideoInfo = async () => {
  try {
    loading.value = true
    error.value = null
    fallbackMode.value = false
    fallbackError.value = null
    
    // 使用后端代理API
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/bilibili/video/${props.bvid}`)
    const result = await response.json()
    
    if (result.success) {
      videoInfo.value = result.data
    } else {
      throw new Error(result.message || '获取视频信息失败')
    }
  } catch (err) {
    console.warn('获取B站视频信息失败，回退为仅显示播放器:', err)
    
    // 检查是否为网络错误或API不支持错误，如果是则回退为仅显示播放器
    if (err.message.includes('Failed to fetch') || 
        err.message.includes('Network Error') ||
        err.message.includes('获取视频信息失败') ||
        err.message.includes('API不支持') ||
        err.message.includes('服务暂不可用') ||
        err.message.includes('API端点不存在') ||
        err.message.includes('端点不存在') ||
        err.message.includes('404') ||
        err.message.includes('Not Found')) {
      fallbackMode.value = true
      fallbackError.value = getSimplifiedError(err.message)
    } else {
      // 其他致命错误仍然显示错误信息
      error.value = err.message || '获取视频信息失败'
    }
  } finally {
    loading.value = false
  }
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0'
  
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  } else {
    return num.toString()
  }
}

// 格式化发布时间
const formatPublishTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now - date
  
  // 小于1天显示相对时间
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  }
  
  // 大于1天显示日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 获取版权文本
const getCopyrightText = (copyright) => {
  return copyright === 1 ? '原创' : '转载'
}

// 获取分辨率文本
const getResolutionText = (dimension) => {
  if (!dimension) return ''
  
  const { width, height } = dimension
  if (!width || !height) return ''
  
  // 常见分辨率标识
  if (height >= 2160) return '4K'
  if (height >= 1440) return '2K'
  if (height >= 1080) return '1080P'
  if (height >= 720) return '720P'
  if (height >= 480) return '480P'
  
  return `${width}×${height}`
}

onMounted(() => {
  fetchVideoInfo()
})
</script>

<style scoped>
/* 移动端适配 */
@media (max-width: 768px) {
  .max-w-\[500px\] {
    max-width: 100%;
  }
  
  .p-4 {
    padding: 12px;
  }
  
  .text-base {
    font-size: 15px;
  }
  
  .flex.gap-3 {
    gap: 8px;
  }
  
  .flex.gap-4 {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .flex.gap-4 {
    gap: 8px;
  }
  
  .text-xs {
    font-size: 11px;
  }
  
  .text-sm {
    font-size: 13px;
  }
}
</style> 