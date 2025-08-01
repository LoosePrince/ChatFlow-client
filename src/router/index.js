import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRouteCacheStore } from '@/stores/routeCache'

// 直接导入所有路由组件
import Home from '@/views/Home.vue'
import Profile from '@/views/Profile.vue'
import ChatRoom from '@/views/ChatRoom.vue'
import RoomSelect from '@/views/RoomSelect.vue'
import Dashboard from '@/views/Dashboard.vue'
import UserAgreement from '@/views/UserAgreement.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import NotFound from '@/views/NotFound.vue'

// Dashboard子页面组件
import RoomsPage from '@/components/common/RoomsPage.vue'
import DomainPage from '@/components/common/DomainPage.vue'
import PrivateChatPage from '@/components/common/PrivateChatPage.vue'
import ProfilePage from '@/components/common/ProfilePage.vue'

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
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '仪表板',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'DashboardDefault',
        redirect: 'rooms'
      },
      {
        path: 'rooms',
        name: 'DashboardRooms',
        component: RoomsPage,
        meta: {
          title: '我的房间'
        }
      },
      {
        path: 'domain',
        name: 'DashboardDomain',
        component: DomainPage,
        meta: {
          title: '领域探索'
        }
      },
      {
        path: 'private',
        name: 'DashboardPrivate',
        component: PrivateChatPage,
        meta: {
          title: '私聊消息'
        }
      },
      {
        path: 'profile',
        name: 'DashboardProfile',
        component: ProfilePage,
        meta: {
          title: '个人资料'
        }
      }
    ]
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
    path: '/private-chat/:targetUid',
    name: 'PrivateChat',
    component: ChatRoom,
    meta: {
      title: '私聊',
      requiresAuth: true
    },
    props: route => ({
      targetUid: route.params.targetUid,
      isPrivateChat: true
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
  let title = 'ChatFlow'
  if (to.meta.title) {
    title = `${to.meta.title} - ChatFlow`
  } else if (to.name && to.name.startsWith('Dashboard')) {
    // 为Dashboard子路由设置默认标题
    title = '仪表板 - ChatFlow'
  }
  document.title = title
  
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

  // 如果用户已退出登录且尝试访问需要认证的页面，重定向到首页
  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    next({ name: 'Home' })
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