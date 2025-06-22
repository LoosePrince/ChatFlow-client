import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
      port: parseInt(env.VITE_APP_PORT) || 5173,
    host: true,
    // CORS配置
    cors: {
      origin: env.VITE_CORS_ORIGIN ? env.VITE_CORS_ORIGIN.split(',').map(origin => origin.trim()) : true,
      credentials: env.VITE_CORS_CREDENTIALS === 'true' || true,
      methods: env.VITE_CORS_METHODS ? env.VITE_CORS_METHODS.split(',').map(method => method.trim()) : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: env.VITE_CORS_ALLOWED_HEADERS ? env.VITE_CORS_ALLOWED_HEADERS.split(',').map(header => header.trim()) : ['Content-Type', 'Authorization']
    },
    proxy: {
      '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        // 为代理请求添加CORS支持
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 设置代理请求的CORS头
            if (env.VITE_API_BASE_URL) {
              proxyReq.setHeader('Origin', `http://localhost:${parseInt(env.VITE_APP_PORT) || 5173}`);
            }
          });
        }
      },
      '/uploads': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (env.VITE_API_BASE_URL) {
              proxyReq.setHeader('Origin', `http://localhost:${parseInt(env.VITE_APP_PORT) || 5173}`);
            }
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['bootstrap'],
          socket: ['socket.io-client']
        }
      }
      }
    },
    // 定义全局常量，用于在代码中访问环境变量
    define: {
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:3000'),
      __SOCKET_URL__: JSON.stringify(env.VITE_SOCKET_URL || 'http://localhost:3000'),
      __CORS_ORIGIN__: JSON.stringify(env.VITE_CORS_ORIGIN || `http://localhost:${parseInt(env.VITE_APP_PORT) || 8080}`),
      __CORS_CREDENTIALS__: JSON.stringify(env.VITE_CORS_CREDENTIALS === 'true' || true)
    }
  }
}) 