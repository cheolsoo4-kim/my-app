import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupAntd } from './plugins/antd'
import { apiService } from './api/service'

// 전역 스타일
import './assets/styles/global.css'

const app = createApp(App)

// 플러그인 설정
setupAntd(app)

// API 서비스를 전역 속성으로 등록
app.config.globalProperties.$api = apiService

// 라우터 사용
app.use(router)

app.mount('#app')
