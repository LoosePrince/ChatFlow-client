import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRouteCacheStore } from '@/stores/routeCache'

// 路由组件懒加载
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Profile = () => import('@/views/Profile.vue')
const ChatRoom = () => import('@/views/ChatRoom.vue')
const RoomSelect = () => import('@/views/RoomSelect.vue')
const UserAgreement = () => import('@/views/UserAgreement.vue')
const PrivacyPolicy = () => import('@/views/PrivacyPolicy.vue')
const NotFound = () => import('@/views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '欢迎使用 ChatFlow',
      description: 'ChatFlow - 现代化的实时聊天应用'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      guest: true
    }
  },
  {
    path: '/register', 
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      guest: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人设置',
      requiresAuth: true,
      requiresUser: true
    }
  },
  {
    path: '/rooms',
    name: 'RoomSelect',
    component: RoomSelect,
    meta: {
      title: '选择聊天室'
    }
  },
  {
    path: '/chat/:roomId',
    name: 'ChatRoom',
    component: ChatRoom,
    meta: {
      title: '聊天室',
      requiresAuth: true
    },
    props: route => ({
      roomId: route.params.roomId
    })
  },
  {
    path: '/user-agreement',
    name: 'UserAgreement',
    component: UserAgreement,
    meta: {
      title: '用户协议',
      description: 'ChatFlow 用户协议和服务条款'
    }
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
    meta: {
      title: '隐私政策',
      description: 'ChatFlow 隐私政策和数据保护说明'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - ChatFlow` : 'ChatFlow'
  
  // 设置页面描述
  if (to.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description)
    }
  }

  // 检查用户认证状态
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  // 需要认证的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'Home',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 需要注册用户的路由
  if (to.meta.requiresUser && (!authStore.isAuthenticated || !authStore.isUser)) {
    next({
      name: 'Home',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 游客专用路由（已登录用户不能访问）
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'RoomSelect' })
    return
  }

  next()
})

// 路由后置守卫 - 保存路由缓存
router.afterEach((to, from) => {
  try {
    const routeCacheStore = useRouteCacheStore()
    
    // 保存当前路由到缓存
    routeCacheStore.saveRoute(to)
    
    // 更新最后访问时间
    routeCacheStore.updateLastVisit()
  } catch (error) {
    console.error('路由缓存保存失败:', error)
  }
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

export default router 