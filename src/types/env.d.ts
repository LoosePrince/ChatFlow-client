/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 基础配置
  readonly VITE_APP_PORT: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_SOCKET_URL: string
  
  // CORS配置
  readonly VITE_CORS_ORIGIN: string
  readonly VITE_CORS_CREDENTIALS: string
  readonly VITE_CORS_METHODS: string
  readonly VITE_CORS_ALLOWED_HEADERS: string
  
  // 开发环境标识
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 全局常量定义（由vite.config.js中的define配置提供）
declare const __API_BASE_URL__: string
declare const __SOCKET_URL__: string
declare const __CORS_ORIGIN__: string
declare const __CORS_CREDENTIALS__: boolean 