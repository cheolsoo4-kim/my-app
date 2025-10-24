<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <a-layout class="layout">
        <!-- 모바일 헤더 -->
        <a-layout-header v-if="showHeader" class="header">
          <div class="header-content">
            <div class="logo">
              <router-link to="/">
                <h2 class="logo-text">Vue 3.0</h2>
</router-link>
            </div>
<!-- 데스크톱 메뉴 -->
            <a-menu
              v-if="!isMobile"
              v-model:selectedKeys="selectedKeys"
              theme="dark"
              mode="horizontal"
              class="desktop-menu"
            >
              <a-menu-item key="home">
                <router-link to="/">
                  <HomeOutlined />
                  Home
                </router-link>
              </a-menu-item>
              <a-menu-item key="youtube">
                <router-link to="/youtube">
                  <YoutubeOutlined />
                  YouTube
                </router-link>
              </a-menu-item>
              <a-menu-item key="m">
                <router-link to="/m">
                  <AppstoreOutlined />
                  M Page
                </router-link>
              </a-menu-item>
              <a-menu-item key="users">
                <router-link to="/users">
                  <UserOutlined />
                  Users
                </router-link>
              </a-menu-item>
              <a-menu-item key="api-docs">
                <router-link to="/api-docs">
                  <ApiOutlined />
                  API Docs
                </router-link>
              </a-menu-item>
            </a-menu>
            
            <!-- 모바일 햄버거 버튼 -->
            <a-button
              v-if="isMobile"
              type="text"
              class="mobile-menu-button"
              @click="showMobileMenu = true"
            >
              <MenuOutlined style="color: white; font-size: 18px;" />
            </a-button>
          </div>
</a-layout-header>

        <!-- 모바일 드로어 메뉴 -->
        <a-drawer
          v-model:open="showMobileMenu"
          title="메뉴"
          placement="right"
          :width="280"
          class="mobile-drawer"
        >
          <a-menu
            v-model:selectedKeys="selectedKeys"
            mode="vertical"
            class="mobile-menu"
            @click="showMobileMenu = false"
          >
            <a-menu-item key="home">
              <router-link to="/">
                <HomeOutlined />
                <span>Home</span>
              </router-link>
            </a-menu-item>
            <a-menu-item key="youtube">
              <router-link to="/youtube">
                <YoutubeOutlined />
                <span>YouTube</span>
              </router-link>
            </a-menu-item>
            <a-menu-item key="m">
              <router-link to="/m">
                <AppstoreOutlined />
                <span>M Page</span>
              </router-link>
            </a-menu-item>
            <a-menu-item key="users">
              <router-link to="/users">
                <UserOutlined />
                <span>Users</span>
              </router-link>
            </a-menu-item>
            <a-menu-item key="api-docs">
              <router-link to="/api-docs">
                <ApiOutlined />
                <span>API Docs</span>
              </router-link>
            </a-menu-item>
          </a-menu>
        </a-drawer>

        <!-- 메인 컨텐츠 -->
        <a-layout-content class="content">
          <div class="content-wrapper">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
</a-layout-content>

        <!-- 푸터 -->
        <a-layout-footer v-if="showFooter" class="footer">
          <div class="footer-content">
            My App ©2024 Created with Vue 3 + Vite + Ant Design + OpenAPI + swagger-ui
          </div>
</a-layout-footer>
      </a-layout>

      <!-- 글로벌 로딩 -->
      <a-spin v-if="globalLoading" class="global-loading" size="large" />
    </div>
</a-config-provider>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import koKR from 'ant-design-vue/es/locale/ko_KR'
import { 
  HomeOutlined, 
  YoutubeOutlined, 
  AppstoreOutlined, 
  UserOutlined, 
  ApiOutlined,
  MenuOutlined
} from '@ant-design/icons-vue'

const route = useRoute()

// 상태 관리
const locale = ref(koKR)
const selectedKeys = ref(['home'])
const globalLoading = ref(false)
const showMobileMenu = ref(false)
const isMobile = ref(false)

// 반응형 감지
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 헤더/푸터 표시 여부
const hideHeaderPages = ['/test']
const hideFooterPages = ['/test']

const showHeader = computed(() => !hideHeaderPages.includes(route.path))
const showFooter = computed(() => !hideFooterPages.includes(route.path))

// 라우트 변경 시 선택된 메뉴 업데이트
watch(() => route.path, (newPath) => {
  const routeKeyMap = {
    '/': ['home'],
    '/youtube': ['youtube'],
    '/m': ['m'],
    '/users': ['users'],
    '/api-docs': ['api-docs']
  }
  
  selectedKeys.value = routeKeyMap[newPath] || []
  showMobileMenu.value = false // 라우트 변경 시 모바일 메뉴 닫기
})

// 글로벌 로딩 제어
const showLoading = () => {
  globalLoading.value = true
}

const hideLoading = () => {
  globalLoading.value = false
}

window.$loading = {
  show: showLoading,
  hide: hideLoading
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  overflow-x: hidden;
}

.layout {
  min-height: 100vh;
}

/* 헤더 스타일 */
.header {
  padding: 0;
  height: 64px;
  line-height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  flex-shrink: 0;
}

.logo a {
  text-decoration: none;
}

.logo-text {
  color: white !important;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

/* 데스크톱 메뉴 */
.desktop-menu {
  flex: 1;
  border: none;
  margin-left: 30px;
}

/* 모바일 햄버거 버튼 */
.mobile-menu-button {
  border: none;
  padding: 0;
  height: auto;
  line-height: 1;
}

.mobile-menu-button:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* 모바일 드로어 */
.mobile-drawer .ant-drawer-body {
  padding: 0;
}

.mobile-menu {
  border: none;
}

.mobile-menu .ant-menu-item {
  padding: 0 24px;
  height: 50px;
  line-height: 50px;
  margin: 0;
}

.mobile-menu .ant-menu-item a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.mobile-menu .ant-menu-item a > span {
  margin-left: 12px;
}

/* 콘텐츠 스타일 */
.content {
  min-height: calc(100vh - 64px - 70px);
  background: #f0f2f5;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* 푸터 스타일 */
.footer {
  text-align: center;
  background: #f0f2f5;
  border-top: 1px solid #d9d9d9;
  padding: 24px 16px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  line-height: 1.5;
}

/* 글로벌 로딩 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 페이지 전환 효과 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 12px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .content-wrapper {
    padding: 16px 12px;
  }
  
  .footer {
    padding: 16px 12px;
  }
  
  .footer-content {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 8px;
  }
  
  .content-wrapper {
    padding: 12px 8px;
  }
  
  .footer {
    padding: 12px 8px;
  }
}

/* 터치 최적화 */
@media (hover: none) and (pointer: coarse) {
  .mobile-menu .ant-menu-item {
    min-height: 48px;
    line-height: 48px;
  }
  
  .mobile-menu-button {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* 링크 스타일 통일 */
a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  color: inherit;
}

/* Ant Design 커스터마이징 */
.ant-layout-header {
  padding: 0;
}

.ant-menu-horizontal {
  line-height: 64px;
}

.ant-menu-item a {
  color: rgba(255, 255, 255, 0.85);
}

.ant-menu-item-selected a {
  color: #fff;
}
</style>