<template>
  <div class="bilibili-video">
    <!-- 加载状态 -->
    <div v-if="loading" class="video-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span>加载视频信息中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="video-error">
      <i class="fas fa-exclamation-triangle"></i>
      <div class="error-content">
        <div class="error-title">无法加载视频信息</div>
        <div class="error-message">{{ error }}</div>
        <div class="bvid-fallback">BVID: {{ bvid }}</div>
      </div>
    </div>

    <!-- 视频内容 -->
    <div v-else-if="videoInfo" class="video-content">
      <!-- 视频播放器 -->
      <div class="video-player">
        <iframe 
          :src="`//player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`"
          class="bilibili-iframe"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>

      <!-- 视频信息 -->
      <div class="video-info">
        <!-- 标题和基础信息 -->
        <div class="video-header">
          <h3 class="video-title">{{ videoInfo.title }}</h3>
          <div class="video-meta">
            <span class="bvid">{{ videoInfo.bvid }}</span>
            <span class="copyright">{{ getCopyrightText(videoInfo.copyright) }}</span>
            <span class="resolution">{{ getResolutionText(videoInfo.dimension) }}</span>
          </div>
        </div>

        <!-- 作者信息 -->
        <div class="author-info">
          <div class="author-details">
            <div class="author-name">{{ videoInfo.owner.name }}</div>
            <div class="publish-time">{{ formatPublishTime(videoInfo.pubdate) }}</div>
          </div>
        </div>

        <!-- 视频描述（如果有） -->
        <div v-if="videoInfo.desc && videoInfo.desc !== '-'" class="video-description">
          <div class="desc-label">简介：</div>
          <div class="desc-content">{{ videoInfo.desc }}</div>
        </div>

        <!-- 统计信息 -->
        <div class="video-stats">
          <div class="stat-item">
            <i class="fas fa-play-circle"></i>
            <span>{{ formatNumber(videoInfo.stat.view) }}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-thumbs-up"></i>
            <span>{{ formatNumber(videoInfo.stat.like) }}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-star"></i>
            <span>{{ formatNumber(videoInfo.stat.favorite) }}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-coins"></i>
            <span>{{ formatNumber(videoInfo.stat.coin) }}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-comment"></i>
            <span>{{ formatNumber(videoInfo.stat.reply) }}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-share"></i>
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

// 获取视频信息
const fetchVideoInfo = async () => {
  try {
    loading.value = true
    error.value = null
    
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
    console.error('获取B站视频信息失败:', err)
    if (err.message.includes('Failed to fetch')) {
      error.value = '无法连接到服务器，请检查网络连接'
    } else {
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
.bilibili-video {
  max-width: 500px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.bilibili-video:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 暗色模式 */
.dark .bilibili-video {
  background: #334155;
  border: 1px solid #475569;
}

.dark .bilibili-video:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 加载状态 */
.video-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: #6c757d;
}

.dark .video-loading {
  color: #94a3b8;
}

.video-loading i {
  font-size: 18px;
  color: #fb7299;
}

/* 错误状态 */
.video-error {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  color: #dc3545;
}

.dark .video-error {
  color: #ef4444;
}

.video-error i {
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.error-message {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.bvid-fallback {
  font-size: 12px;
  font-family: 'Monaco', 'Consolas', monospace;
  background: rgba(220, 53, 69, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.dark .bvid-fallback {
  background: rgba(239, 68, 68, 0.2);
}



/* 视频播放器 */
.video-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
}

.bilibili-iframe {
  width: 100%;
  height: 100%;
  border: none;
}



/* 视频信息 */
.video-info {
  padding: 16px;
}

/* 视频标题和元信息 */
.video-header {
  margin-bottom: 12px;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.dark .video-title {
  color: #f1f5f9;
}

.video-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
}

.bvid {
  font-family: 'Monaco', 'Consolas', monospace;
  background: rgba(251, 114, 153, 0.1);
  color: #fb7299;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.dark .bvid {
  background: rgba(251, 114, 153, 0.2);
}

.copyright {
  background: rgba(28, 167, 69, 0.1);
  color: #28a745;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.dark .copyright {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.resolution {
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.dark .resolution {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

/* 作者信息 */
.author-info {
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 8px;
}

.dark .author-info {
  background: rgba(59, 130, 246, 0.1);
}

.author-details {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  margin-right: 2px;
}

.dark .author-name {
  color: #f1f5f9;
}

.publish-time {
  font-size: 12px;
  color: #6c757d;
}

.dark .publish-time {
  color: #94a3b8;
}

/* 视频描述 */
.video-description {
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(108, 117, 125, 0.05);
  border-radius: 6px;
  border-left: 3px solid #6c757d;
}

.dark .video-description {
  background: rgba(148, 163, 184, 0.1);
  border-left-color: #94a3b8;
}

.desc-label {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 4px;
}

.dark .desc-label {
  color: #94a3b8;
}

.desc-content {
  font-size: 13px;
  color: #2c3e50;
  line-height: 1.4;
}

.dark .desc-content {
  color: #cbd5e1;
}

/* 统计信息 */
.video-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.dark .stat-item {
  color: #94a3b8;
}

.stat-item i {
  font-size: 13px;
  width: 14px;
}

/* 不同统计项的图标颜色 */
.stat-item:nth-child(1) i { color: #17a2b8; } /* 播放 */
.stat-item:nth-child(2) i { color: #28a745; } /* 点赞 */
.stat-item:nth-child(3) i { color: #ffc107; } /* 收藏 */
.stat-item:nth-child(4) i { color: #fd7e14; } /* 硬币 */
.stat-item:nth-child(5) i { color: #6f42c1; } /* 评论 */
.stat-item:nth-child(6) i { color: #20c997; } /* 分享 */

/* 暗色模式统计图标颜色 */
.dark .stat-item:nth-child(1) i { color: #06b6d4; }
.dark .stat-item:nth-child(2) i { color: #10b981; }
.dark .stat-item:nth-child(3) i { color: #f59e0b; }
.dark .stat-item:nth-child(4) i { color: #f97316; }
.dark .stat-item:nth-child(5) i { color: #8b5cf6; }
.dark .stat-item:nth-child(6) i { color: #14b8a6; }

/* 移动端适配 */
@media (max-width: 768px) {
  .bilibili-video {
    max-width: 100%;
  }
  
  .video-info {
    padding: 12px;
  }
  
  .video-title {
    font-size: 15px;
  }
  
  .video-meta {
    gap: 8px;
  }
  
  .video-stats {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .video-stats {
    gap: 8px;
  }
  
  .stat-item {
    font-size: 11px;
  }
  
  .author-name {
    font-size: 13px;
  }
}
</style> 