// CORS配置工具
export const corsConfig = {
  // 从环境变量获取CORS配置
  origin: import.meta.env.VITE_CORS_ORIGIN || window.location.origin,
  credentials: import.meta.env.VITE_CORS_CREDENTIALS === 'true' || true,
  methods: import.meta.env.VITE_CORS_METHODS?.split(',').map(method => method.trim()) || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: import.meta.env.VITE_CORS_ALLOWED_HEADERS?.split(',').map(header => header.trim()) || ['Content-Type', 'Authorization', 'X-Requested-With']
}

// 获取允许的源列表
export const getAllowedOrigins = () => {
  if (typeof corsConfig.origin === 'string') {
    return corsConfig.origin.split(',').map(origin => origin.trim())
  }
  return [window.location.origin]
}

// 检查当前源是否被允许
export const isOriginAllowed = (origin = window.location.origin) => {
  const allowedOrigins = getAllowedOrigins()
  return allowedOrigins.includes(origin)
}

// 获取CORS请求头（不包含浏览器自动设置的头）
export const getCorsHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
    // 注意：不要手动设置 Origin、Referer、User-Agent 等浏览器自动设置的头
  }
}

// 创建支持CORS的fetch请求配置
export const createCorsRequestConfig = (config = {}) => {
  return {
    ...config,
    headers: {
      ...getCorsHeaders(),
      ...config.headers
    },
    credentials: corsConfig.credentials ? 'include' : 'same-origin'
  }
}

// WebSocket连接的CORS配置
export const getWebSocketCorsConfig = () => {
  return {
    origin: getAllowedOrigins(),
    credentials: corsConfig.credentials,
    methods: corsConfig.methods
  }
}

// 导出环境变量配置信息（用于调试）
export const getEnvironmentCorsInfo = () => {
  return {
    VITE_CORS_ORIGIN: import.meta.env.VITE_CORS_ORIGIN,
    VITE_CORS_CREDENTIALS: import.meta.env.VITE_CORS_CREDENTIALS,
    VITE_CORS_METHODS: import.meta.env.VITE_CORS_METHODS,
    VITE_CORS_ALLOWED_HEADERS: import.meta.env.VITE_CORS_ALLOWED_HEADERS,
    currentOrigin: window.location.origin,
    isCurrentOriginAllowed: isOriginAllowed()
  }
}

// 调试模式下输出CORS配置信息
if (import.meta.env.DEV) {
  console.log('CORS配置信息:', {
    config: corsConfig,
    environment: getEnvironmentCorsInfo()
  })
} 