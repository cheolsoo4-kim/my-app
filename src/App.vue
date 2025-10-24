<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <a-layout class="layout">
        <!-- 헤더 (특정 페이지에서만 숨김) -->
        <a-layout-header v-if="showHeader" class="header">
          <div class="logo">
            <router-link to="/">
              <h2 style="color: white; margin: 0;">Vue 3.0</h2>
</router-link>
          </div>
<a-menu
            v-model:selectedKeys="selectedKeys"
            theme="dark"
            mode="horizontal"
            class="menu"
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
        </a-layout-header>

        <!-- 메인 컨텐츠 -->
        <a-layout-content class="content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </a-layout-content>

        <!-- 푸터 (특정 페이지에서만 숨김) -->
        <a-layout-footer v-if="showFooter" class="footer">
          My App ©2024 Created with Vue 3 + Vite + Ant Design Vue
        </a-layout-footer>
      </a-layout>

      <!-- 글로벌 로딩 -->
      <a-spin v-if="globalLoading" class="global-loading" size="large" />
    </div>
</a-config-provider>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import koKR from 'ant-design-vue/es/locale/ko_KR'

const route = useRoute()
const router = useRouter()

// Ant Design 로케일
const locale = ref(koKR)

// 선택된 메뉴 키
const selectedKeys = ref(['home'])

// 글로벌 로딩 상태
const globalLoading = ref(false)

// 헤더/푸터를 숨길 페이지들
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
})

// 글로벌 로딩 제어 함수들
const showLoading = () => {
  globalLoading.value = true
}

const hideLoading = () => {
  globalLoading.value = false
}

// 글로벌 함수로 등록 (다른 컴포넌트에서 사용 가능)
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segue UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100vh;
}

.layout {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  margin-right: 30px;
}

.logo a {
  text-decoration: none;
}

.menu {
  flex: 1;
  border: none;
}

.content {
  min-height: calc(100vh - 64px - 69px); /* header + footer 높이 제외 */
}

.footer {
  text-align: center;
}

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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
