import { createRouter, createWebHistory } from 'vue-router'
import { message } from 'ant-design-vue'
// 모든 views 파일을 미리 매핑
const viewModules = import.meta.glob('@/views/*.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'Home' }
  },{
    path: '/g2',
    name: 'g2',
    component: () => import('@/views/g2.vue'),
    meta: { title: 'g2' }
  },{
    path: '/q1',
    name: 'q1',
    component: () => import('@/views/quiz.vue'),
    meta: { title: 'q1' }
  },{
    path: '/q2',
    name: 'q2',
    component: () => import('@/views/q2.vue'),
    meta: { title: 'q2' }
  }
  ,
  {
    path: '/g1',
    name: 'g1',
    component: () => import('@/views/g1.vue'),
    meta: { title: 'g' }
  },
  {
    path: '/sample',
    name: 'Sample',
    component: () => import('@/views/sample.vue'),
    meta: { title: 'Sample' }
  },
  {
    path: '/youtube',
    name: 'YouTube',
    component: () => import('@/views/YouTube.vue'),
    meta: { title: 'YouTube Background' }
  },
  {
    path: '/m',
    name: 'M',
    component: () => import('@/views/M.vue'),
    meta: { title: 'M Page' }
  },
 {
    path: '/type',
    name: 'TypingGame',
    component: () => import('@/views/TypingGame.vue'),
    meta: { title: 'Typing Page' }
  },
  {
    path: '/bus',
    name: 'Bus',
    component: () => import('@/views/bus.vue'),
    meta: { title: 'bus' }
  },

  {
    path: '/m/test',
    name: 'test',
    component: () => import('@/views/test.vue'),
    meta: { title: 'test Page' }
  },
  {
  path: '/m/:page',
  name: 'DynamicPage',
  component: async (to) => {
    const pageName = to.params.page;
    const modulePath = `/src/views/${pageName}.vue`;
    console.log(mudlePath);   
    if (viewModules[modulePath]) {
      const module = await viewModules[modulePath]();
      return module.default;
    } else {
      return import('@/views/NotFound.vue');
    }
  },
  meta: { title: 'Dynamic Page' }
  },
  {
    path: '/api-docs',
    name: 'ApiDocs',
    component: () => import('@/views/ApiDocs.vue'),
    meta: { title: 'API Documentation' }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users.vue'),
    meta: { title: 'User Management' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404 Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 라우터 가드
router.beforeEach((to, from, next) => {
  // 페이지 타이틀 설정
  document.title = to.meta?.title ? `${to.meta.title} - My App` : 'My App'
  
  // 인증이 필요한 페이지 체크 (예시)
  if (to.meta?.requireAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('로그인이 필요합니다.')
      return next('/login')
    }
  }
  
  next()
})

export default router
