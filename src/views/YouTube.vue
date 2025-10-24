<template>
  <div class="youtube-page">
    <!-- 유튜브 배경 영상 -->
    <div class="youtube-background">
      <div class="video-overlay" :style="{ background: overlayColor }"></div>
<iframe
        v-if="embedUrl"
        :key="videoKey"
        :src="embedUrl"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
        class="background-video"
      ></iframe>
    </div>
<!-- 컨텐츠 오버레이 -->
    <div class="content-overlay">
      <div class="content-container">
        <h1 class="main-title">{{ pageTitle }}</h1>
<p class="subtitle">{{ pageSubtitle }}</p>
        
        <!-- URL 입력 섹션 (항상 표시) -->
        <div class="url-input-section">
          <div class="input-group">
            <a-input
              v-model:value="videoUrl"
              size="large"
              placeholder="유튜브 URL을 입력하세요... (예: https://www.youtube.com/watch?v=VIDEO_ID)"
              class="url-input"
              @keyup.enter="changeVideo"
              @blur="changeVideo"
            >
              <template #prefix>
                <YoutubeOutlined style="color: #ff0000;" />
              </template>
            </a-input>
            <a-button 
              type="primary" 
              size="large"
              @click="changeVideo"
              :loading="videoLoading"
              class="change-btn"
            >
              <PlayCircleOutlined />
              변경
            </a-button>
          </div>
</div>

        <!-- 프리셋 비디오 버튼들 -->
        <div class="preset-videos">
          <a-space wrap>
            <a-button 
              v-for="preset in videoPresets" 
              :key="preset.id"
              @click="loadPreset(preset)"
              :type="currentVideoId === preset.videoId ? 'primary' : 'default'"
              class="preset-btn"
            >
              <template #icon>
                <component :is="preset.icon" />
              </template>
              {{ preset.name }}
            </a-button>
          </a-space>
        </div>
<!-- 제어 패널 -->
        <div class="controls">
          <a-space wrap>
            <a-button @click="toggleMute" :type="isMuted ? 'default' : 'primary'" size="large">
              <template #icon>
                <component :is="isMuted ? 'SoundOutlined' : 'SoundFilled'" />
              </template>
              {{ isMuted ? '음소거 해제' : '음소거' }}
            </a-button>
            <a-button @click="changeOverlay" size="large">
              <BgColorsOutlined />
              오버레이 변경
            </a-button>
            <a-button @click="toggleFullscreen" size="large">
              <ExpandOutlined />
              전체화면
            </a-button>
          </a-space>
        </div>
<!-- 비디오 정보 표시 -->
        <div class="video-info" v-if="videoInfo.title">
          <a-card size="small" class="info-card">
            <h4>{{ videoInfo.title }}</h4>
<p>{{ videoInfo.description }}</p>
          </a-card>
        </div>
</div>
    </div>
<!-- 키보드 단축키 도움말 (ESC로 토글) -->
    <a-modal
      v-model:open="showHelp"
      title="키보드 단축키"
      :footer="null"
      width="400px"
    >
      <div class="keyboard-shortcuts">
        <p><kbd>Space</kbd> - 음소거 토글</p>
<p><kbd>O</kbd> - 오버레이 변경</p>
<p><kbd>F</kbd> - 전체화면</p>
<p><kbd>H</kbd> - 도움말 표시</p>
<p><kbd>1-5</kbd> - 프리셋 비디오 선택</p>
      </div>
</a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { message } from 'ant-design-vue'

// 반응형 데이터
const currentVideoId = ref('jfKfPfyJRdk') // 기본: 로제 - On The Ground
const videoUrl = ref('')
const videoKey = ref(0)
const overlayIndex = ref(0)
const pageTitle = ref('YouTube Background')
const pageSubtitle = ref('배경 음악과 함께하는 아름다운 페이지')
const videoLoading = ref(false)
const isMuted = ref(true)
const showHelp = ref(false)

// 비디오 정보
const videoInfo = ref({
  title: '',
  description: ''
})

// 프리셋 비디오들
const videoPresets = ref([
  { 
    id: 1, 
    name: '로제 - On The Ground', 
    videoId: 'jfKfPfyJRdk',
    icon: 'StarOutlined'
  },
  { 
    id: 2, 
    name: 'BTS - Dynamite', 
    videoId: 'gdZLi9oWNZg',
    icon: 'ThunderboltOutlined'
  },
  { 
    id: 3, 
    name: '자연 풍경 - 4K', 
    videoId: 'UfcAVejslrU',
    icon: 'EnvironmentOutlined'
  },
  { 
    id: 4, 
    name: '도시 야경', 
    videoId: 'gGU3cVv7gKs',
    icon: 'BuildOutlined'
  },
  { 
    id: 5, 
    name: '바다 파도 소리', 
    videoId: 'T3-nWYeXRU0',
    icon: 'WaveOutlined'
  }
])

// 오버레이 색상들
const overlayColors = [
  'rgba(0, 0, 0, 0.3)',
  'rgba(0, 0, 0, 0.5)',
  'rgba(0, 0, 0, 0.7)',
  'rgba(26, 35, 126, 0.4)',
  'rgba(74, 20, 140, 0.4)',
  'rgba(136, 14, 79, 0.4)',
  'rgba(229, 57, 53, 0.4)',
  'rgba(67, 160, 71, 0.4)'
]

const overlayColor = computed(() => overlayColors[overlayIndex.value])

// 임베드 URL 생성
const embedUrl = computed(() => {
  if (!currentVideoId.value) return null
  
  return `https://www.youtube.com/embed/${currentVideoId.value}?` + new URLSearchParams({
    autoplay: '1',
    mute: isMuted.value ? '1' : '0',
    loop: '1',
    playlist: currentVideoId.value,
    controls: '0',
    showinfo: '0',
    rel: '0',
    iv_load_policy: '3',
    modestbranding: '1',
    disablekb: '1',
    fs: '0',
    playsinline: '1',
    start: '0'
  }).toString()
})

// 유튜브 비디오 ID 추출
const extractVideoId = (url) => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/
  ]

  for (let pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// 비디오 정보 가져오기 (Mock)
const fetchVideoInfo = async (videoId) => {
  try {
    // 실제로는 YouTube API를 사용해야 합니다
    const mockInfo = {
      'jfKfPfyJRdk': {
        title: 'ROSÉ - On The Ground',
        description: 'Official Music Video'
      },
      'gdZLi9oWNZg': {
        title: 'BTS (방탄소년단) Dynamite',
        description: 'Official MV'
      }
    }
    
    videoInfo.value = mockInfo[videoId] || {
      title: 'YouTube Video',
      description: 'Playing video...'
    }
  } catch (error) {
    console.error('Failed to fetch video info:', error)
  }
}

// 메소드들
const changeVideo = async () => {
  if (!videoUrl.value.trim()) return
  
  const videoId = extractVideoId(videoUrl.value)
  if (!videoId) {
    message.error('유효하지 않은 유튜브 URL입니다.')
    return
  }
  
  videoLoading.value = true
  
  try {
    currentVideoId.value = videoId
    videoKey.value++
    pageTitle.value = 'Custom Video'
    pageSubtitle.value = 'URL로 변경된 배경 영상'
    
    await fetchVideoInfo(videoId)
    message.success('배경 영상이 변경되었습니다!')
  } catch (error) {
    message.error('비디오 로드 중 오류가 발생했습니다.')
  } finally {
    videoLoading.value = false
  }
}

const loadPreset = async (preset) => {
  videoLoading.value = true
  
  try {
    currentVideoId.value = preset.videoId
    pageTitle.value = preset.name
    pageSubtitle.value = 'Beautiful Background Music'
    videoKey.value++
    videoUrl.value = `https://www.youtube.com/watch?v=${preset.videoId}`
    
    await fetchVideoInfo(preset.videoId)
    message.success(`${preset.name} 배경으로 변경되었습니다!`)
  } finally {
    videoLoading.value = false
  }
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  videoKey.value++
  message.info(isMuted.value ? '음소거되었습니다' : '음소거가 해제되었습니다')
}

const changeOverlay = () => {
  overlayIndex.value = (overlayIndex.value + 1) % overlayColors.length
  message.info(`오버레이 ${overlayIndex.value + 1}번으로 변경`)
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    message.info('전체화면 모드')
  } else {
    document.exitFullscreen()
    message.info('전체화면 해제')
  }
}

const toggleHelp = () => {
  showHelp.value = !showHelp.value
}

// 키보드 이벤트 처리
const handleKeydown = (e) => {
  switch (e.key.toLowerCase()) {
    case ' ': // Space
      e.preventDefault()
      toggleMute()
      break
    case 'o':
      changeOverlay()
      break
    case 'f':
      toggleFullscreen()
      break
    case 'h':
      toggleHelp()
      break
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
      const index = parseInt(e.key) - 1
      if (videoPresets.value[index]) {
        loadPreset(videoPresets.value[index])
      }
      break
  }
}

// 초기 비디오 정보 로드
watch(() => currentVideoId.value, (newVideoId) => {
  if (newVideoId) {
    fetchVideoInfo(newVideoId)
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  fetchVideoInfo(currentVideoId.value)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.youtube-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
}

/* 유튜브 배경 영역 */
.youtube-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-video {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 56.25vw;
  min-height: 100vh;
  min-width: 177.77vh;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  transition: background 0.5s ease;
}

/* 콘텐츠 오버레이 */
.content-overlay {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  padding-top: 64px; /* 헤더 높이만큼 패딩 추가 */
}

.content-container {
  text-align: center;
  color: white;
  max-width: 900px;
  width: 90%;
  padding: 40px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* 타이틀 */
.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  background: linear-gradient(45deg, #fff, #f0f0f0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGlow 2s ease-in-out infinite alternate;
}

.subtitle {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

/* URL 입력 섹션 */
.url-input-section {
  margin-bottom: 32px;
}

.input-group {
  display: flex;
  gap: 12px;
  max-width: 700px;
  margin: 0 auto;
}

.url-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
}

.url-input:focus {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
}

.url-input::placeholder {
  color: rgba(255, 255, 255, 0.6) !important;
}

.change-btn {
  min-width: 100px;
}

/* 프리셋 비디오 */
.preset-videos {
  margin-bottom: 32px;
}

.preset-btn {
  margin: 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s ease;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 제어 패널 */
.controls {
  margin-bottom: 24px;
}

/* 비디오 정보 */
.video-info {
  margin-top: 24px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.info-card h4 {
  color: white;
  margin-bottom: 8px;
}

.info-card p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 키보드 단축키 도움말 */
.keyboard-shortcuts p {
  margin-bottom: 8px;
  font-size: 14px;
}

.keyboard-shortcuts kbd {
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 2px 4px;
  font-family: monospace;
  font-size: 12px;
}

/* 애니메이션 */
@keyframes titleGlow {
  0% { text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.3); }
  100% { text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 255, 255, 0.5); }
}

/* 반응형 */
@media (max-width: 768px) {
  .content-container {
    padding: 20px;
  }
  
  .main-title {
    font-size: 2.5rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .preset-videos .ant-space {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}

/* Ant Design 스타일 오버라이드 */
:deep(.ant-input-affix-wrapper) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.ant-input-affix-wrapper:focus) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
}

:deep(.ant-input) {
  background: transparent !important;
  color: white !important;
}

:deep(.anticon) {
  color: rgba(255, 255, 255, 0.8);
}
</style>
