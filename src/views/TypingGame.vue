<template>
  <div class="typing-game" :class="{ 'mobile': isMobile }">
    <a-layout>
      <!-- 밝고 깔끔한 헤더 -->
      <a-layout-header class="game-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-icon">⌨️</div>
<div class="logo-text">
              <h1>타자게임</h1>
<span class="subtitle">Type Fast & Accurate</span>
            </div>
</div>
          
          <div class="stats" v-if="gameStarted">
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
<div class="stat-content">
                <span class="stat-value">{{ wpm }}</span>
                <span class="stat-label">타/분</span>
              </div>
</div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
<div class="stat-content">
                <span class="stat-value">{{ accuracy }}</span>
                <span class="stat-label">정확도%</span>
              </div>
</div>
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
<div class="stat-content">
                <span class="stat-value">{{ score }}</span>
                <span class="stat-label">점수</span>
              </div>
</div>
          </div>
<div v-if="!gameStarted" class="header-welcome">
            <span>🎮 Ready to start?</span>
          </div>
</div>
      </a-layout-header>
      
      <a-layout class="main-layout">
        <!-- 게임 영역 -->
        <a-layout-content class="game-content">
          <!-- 게임 설정 패널 -->
          <a-card v-if="!gameStarted" class="setup-panel">
            <div class="setup-header">
              <div class="setup-icon">🚀</div>
<h2>게임 시작하기</h2>
<p>키보드 마스터가 되어보세요!</p>
            </div>
<a-form layout="vertical" class="setup-form">
              <a-form-item label="플레이어 이름">
                <a-input 
                  v-model:value="playerName" 
                  placeholder="멋진 닉네임을 입력하세요"
                  size="large"
                  prefix="👤"
                />
              </a-form-item>
              
              <a-form-item label="난이도 선택">
                <div class="difficulty-cards">
                  <div 
                    v-for="diff in difficulties" 
                    :key="diff.value"
                    :class="[
                      'difficulty-card', 
                      { 'selected': difficulty === diff.value }
                    ]"
                    @click="difficulty = diff.value"
                  >
                    <div class="difficulty-icon">{{ diff.icon }}</div>
<div class="difficulty-name">{{ diff.name }}</div>
<div class="difficulty-desc">{{ diff.desc }}</div>
</div>
                </div>
</a-form-item>
              
              <a-button 
                type="primary" 
                @click="startGame" 
                size="large"
                block
                :loading="starting"
                class="start-button"
              >
                <template #icon>
                  <span>🎯</span>
                </template>
                게임 시작하기
              </a-button>
            </a-form>
          </a-card>

          <!-- 메인 게임 영역 -->
          <div v-if="gameStarted" class="game-area">
            <!-- 게임 정보 (밝은 디자인) -->
            <div class="game-info-card">
              <div class="timer-section">
                <a-progress 
                  type="circle"
                  :percent="(timeLeft / totalTime) * 100"
                  :status="timeLeft < 10 ? 'exception' : 'active'"
                  :stroke-color="{
                    '0%': '#87d068',
                    '100%': '#108ee9',
                  }"
                  :width="isMobile ? 100 : 120"
                  :format="() => `${timeLeft}`"
                  :strokeWidth="8"
                />
                <div class="timer-label">남은 시간</div>
</div>
              
              <div class="progress-section">
                <div class="progress-header">
                  <span class="progress-title">🎯 진행률</span>
                  <span class="progress-count">{{ completedSentences }} / {{ gameTexts[difficulty].length }}</span>
                </div>
<a-progress 
                  :percent="progress" 
                  :status="progress === 100 ? 'success' : 'active'"
                  stroke-color="#52c41a"
                  :showInfo="false"
                  strokeWidth="12"
                />
                <div class="level-info">
                  <span class="level-badge">{{ getDifficultyText(difficulty) }}</span>
                  <span class="combo-text" v-if="completedSentences > 0">
                    🔥 {{ completedSentences }}연속 성공!
                  </span>
                </div>
</div>
            </div>
<!-- 텍스트 표시 영역 -->
            <a-card class="text-display-card">
              <template #title>
                <div class="text-header">
                  <span class="text-icon">📝</span>
                  <span>문장 {{ currentTextIndex + 1 }}</span>
                  <a-tag color="blue">{{ getDifficultyText(difficulty) }}</a-tag>
                </div>
</template>
              
              <div class="target-text" :class="{ 'mobile-text': isMobile }">
                <span 
                  v-for="(char, index) in currentText" 
                  :key="index"
                  :class="getCharClass(index)"
                >
                  {{ char }}
                </span>
              </div>
</a-card>

            <!-- 입력 영역 -->
            <a-card class="input-card">
              <template #title>
                <div class="input-header">
                  <span class="input-icon">⌨️</span>
                  <span>여기에 입력하세요</span>
                  <div class="input-stats">
                    <span class="chars-typed">{{ userInput.length }}/{{ currentText.length }}</span>
                  </div>
</div>
              </template>
              
              <a-textarea 
                v-model:value="userInput"
                @input="handleInput"
                @keydown="handleKeyDown"
                placeholder="위의 문장을 정확히 입력하세요..."
                :rows="isMobile ? 3 : 2"
                :disabled="gameEnded || gamePaused"
                ref="gameInput"
                :style="{ fontSize: isMobile ? '18px' : '16px' }"
                class="game-input"
              />
              
              <div class="input-controls" v-if="isMobile">
                <a-button @click="clearInput" size="large" class="control-btn">
                  🗑️ 지우기
                </a-button>
                <a-button @click="skipSentence" size="large" type="dashed" class="control-btn">
                  ⏭️ 건너뛰기
                </a-button>
                <a-button @click="pauseGame" size="large" :type="gamePaused ? 'primary' : 'default'" class="control-btn">
                  {{ gamePaused ? '▶️ 계속' : '⏸️ 일시정지' }}
                </a-button>
              </div>
</a-card>

            <!-- 이벤트 알림 -->
            <a-alert
              v-if="currentEvent"
              :message="currentEvent.message"
              :type="currentEvent.type"
              :description="currentEvent.description"
              show-icon
              closable
              @close="currentEvent = null"
              class="event-alert"
            />

            <!-- 모바일 액션 바 -->
            <div v-if="isMobile" class="mobile-actions">
              <a-button 
                @click="showMobileLeaderboard = true" 
                type="default"
                size="large"
                class="action-btn"
              >
                🏆 순위표
              </a-button>
              <a-button 
                @click="showMobileStats = true" 
                type="default"
                size="large"
                class="action-btn"
              >
                📊 통계
              </a-button>
              <a-button 
                @click="resetGame" 
                danger
                size="large"
                class="action-btn"
              >
                🔄 다시하기
              </a-button>
            </div>
</div>

          <!-- 나머지 모달들과 드로어는 동일... -->
        </a-layout-content>

        <!-- 데스크톱 순위표 사이드바 -->
        <a-layout-sider 
          v-if="!isMobile && gameStarted"
          width="380" 
          theme="light" 
          class="leaderboard-sidebar"
        >
          <!-- 순위표 내용... -->
        </a-layout-sider>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'

// 반응형 감지
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 난이도 데이터 추가
const difficulties = ref([
  {
    value: 'easy',
    name: '쉬움',
    icon: '🟢',
    desc: '90초, 간단한 문장'
  },
  {
    value: 'normal', 
    name: '보통',
    icon: '🟡',
    desc: '60초, 일반 문장'
  },
  {
    value: 'hard',
    name: '어려움', 
    icon: '🔴',
    desc: '45초, 복잡한 문장'
  }
])

// 게임 상태
const gameStarted = ref(false)
const gameEnded = ref(false)
const gamePaused = ref(false)
const starting = ref(false)
const playerName = ref('')
const difficulty = ref('normal')
const currentTextIndex = ref(0)
const userInput = ref('')
const startTime = ref(null)
const gameTimer = ref(null)
const timeLeft = ref(60)
const totalTime = ref(60)
const score = ref(0)
const completedSentences = ref(0)

// 게임 통계
const totalChars = ref(0)
const correctChars = ref(0)
const errors = ref(0)
const wpmHistory = ref([])

// 이벤트 시스템
const currentEvent = ref(null)
const eventTriggered = ref(new Set())

// 결과 모달
const showResults = ref(false)
const saving = ref(false)

// 모바일 드로어
const showMobileLeaderboard = ref(false)
const showMobileStats = ref(false)

// 순위표 관련
const leaderboardData = ref([])
const loadingLeaderboard = ref(false)
const leaderboardFilter = ref('all')
const leaderboardPeriod = ref('all')
const personalStats = ref(null)
const globalStats = ref(null)
const leaderboardTimer = ref(null)

// 입력 참조
const gameInput = ref(null)

// 임시 게임 텍스트 데이터
const gameTexts = {
  easy: [
    '안녕하세요',
    '좋은 하루 되세요',
    '타자 연습을 해봅시다',
    '오늘 날씨가 좋네요',
    '키보드를 잘 다뤄보세요'
  ],
  normal: [
    '빠른 갈색 여우가 게으른 개를 뛰어넘습니다',
    '연습이 완벽을 만듭니다',
    '꾸준한 노력이 중요합니다',
    '타자 속도를 높여보세요',
    '정확도가 더 중요합니다'
  ],
  hard: [
    'The quick brown fox jumps over the lazy dog',
    '복잡한 문장을 정확하게 타이핑하는 것은 쉽지 않습니다',
    'Lorem ipsum dolor sit amet consectetur adipiscing elit',
    '프로그래밍 언어를 배우는 것처럼 타자도 연습이 필요합니다',
    'JavaScript, Python, Java 등 다양한 언어가 있습니다'
  ]
}

// 계산된 속성들
const currentText = computed(() => {
  return gameTexts[difficulty.value][currentTextIndex.value] || ''
})

const progress = computed(() => {
  const total = gameTexts[difficulty.value].length
  return (completedSentences.value / total) * 100
})

const wpm = computed(() => {
  if (!startTime.value) return 0
  const elapsed = (Date.now() - startTime.value) / 1000 / 60
  return Math.round(correctChars.value / 5 / elapsed) || 0
})

const accuracy = computed(() => {
  if (totalChars.value === 0) return 100
  return Math.round((correctChars.value / totalChars.value) * 100)
})

const finalScore = computed(() => Math.round(score.value))
const finalWpm = computed(() => wpm.value)
const finalAccuracy = computed(() => accuracy.value)

// 난이도 텍스트
const getDifficultyText = (diff) => {
  return { easy: '쉬움', normal: '보통', hard: '어려움' }[diff] || diff
}

// 게임 시작
const startGame = async () => {
  if (!playerName.value.trim()) {
    message.error('플레이어 이름을 입력해주세요')
    return
  }
  
  starting.value = true
  await new Promise(resolve => setTimeout(resolve, 500)) // 로딩 효과
  
  gameStarted.value = true
  gameEnded.value = false
  gamePaused.value = false
  startTime.value = Date.now()
  currentTextIndex.value = 0
  userInput.value = ''
  score.value = 0
  completedSentences.value = 0
  totalChars.value = 0
  correctChars.value = 0
  errors.value = 0
  currentEvent.value = null
  eventTriggered.value.clear()
  
  // 난이도별 시간 설정
  totalTime.value = difficulty.value === 'easy' ? 90 : difficulty.value === 'normal' ? 60 : 45
  timeLeft.value = totalTime.value
  
  // 게임 타이머 시작
  gameTimer.value = setInterval(() => {
    if (!gamePaused.value) {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        endGame()
      }
    }
  }, 1000)
  
  starting.value = false
  
  // 입력 필드에 포커스
  nextTick(() => {
    gameInput.value?.focus()
  })
}

// 입력 처리
const handleInput = (e) => {
  if (gamePaused.value) return
  
  const input = e.target.value
  totalChars.value++
  
  // 정확도 계산
  if (input === currentText.value.substring(0, input.length)) {
    correctChars.value++
  } else {
    errors.value++
  }
  
  // 문장 완료 체크
  if (input === currentText.value) {
    completeSentence()
  }
}

// 키 입력 처리
const handleKeyDown = (e) => {
  if (gamePaused.value) {
    e.preventDefault()
    return
  }
  
  // ESC키로 일시정지
  if (e.key === 'Escape') {
    pauseGame()
  }
}

// 문장 완료
const completeSentence = () => {
  completedSentences.value++
  
  // 점수 계산
  const timeBonus = Math.max(0, timeLeft.value)
  const accuracyBonus = accuracy.value
  const difficultyMultiplier = { easy: 1, normal: 1.5, hard: 2 }[difficulty.value]
  const points = Math.round((100 + timeBonus + accuracyBonus) * difficultyMultiplier)
  score.value += points
  
  // 다음 문장으로
  currentTextIndex.value++
  userInput.value = ''
  
  // 모든 문장 완료시
  if (currentTextIndex.value >= gameTexts[difficulty.value].length) {
    endGame()
    return
  }
  
  message.success({
    content: `🎉 문장 완료! +${points}점`,
    duration: 2
  })
}

// 문자 스타일 클래스
const getCharClass = (index) => {
  if (index < userInput.value.length) {
    return userInput.value[index] === currentText.value[index] 
      ? 'correct' : 'incorrect'
  } else if (index === userInput.value.length) {
    return 'current'
  }
  return 'pending'
}

// 게임 제어 함수들
const clearInput = () => {
  userInput.value = ''
}

const skipSentence = () => {
  if (currentTextIndex.value < gameTexts[difficulty.value].length - 1) {
    currentTextIndex.value++
    userInput.value = ''
    score.value = Math.max(0, score.value - 50) // 페널티
    message.warning('문장을 건너뛰었습니다 (-50점)')
  }
}

const pauseGame = () => {
  gamePaused.value = !gamePaused.value
  if (gamePaused.value) {
    message.info('⏸️ 게임이 일시정지되었습니다')
  } else {
    message.info('▶️ 게임을 계속합니다')
    nextTick(() => {
      gameInput.value?.focus()
    })
  }
}

// 게임 종료
const endGame = () => {
  gameEnded.value = true
  clearInterval(gameTimer.value)
  showResults.value = true
  
  // 최종 성과 메시지
  let performanceMessage = ''
  if (finalWpm.value >= 80) performanceMessage = '🏆 타자 마스터!'
  else if (finalWpm.value >= 60) performanceMessage = '🥇 우수한 실력!'
  else if (finalWpm.value >= 40) performanceMessage = '🥈 좋은 성과!'
  else performanceMessage = '🥉 연습이 필요해요!'
  
  setTimeout(() => {
    message.success(performanceMessage)
  }, 500)
}

// 기록 저장 (임시 구현)
const saveRecord = async () => {
  saving.value = true
  try {
    // 실제 API 호출 대신 임시 처리
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 로컬 스토리지에 임시 저장
    const records = JSON.parse(localStorage.getItem('typingGameRecords') || '[]')
    records.push({
      playerName: playerName.value,
      score: finalScore.value,
      wpm: finalWpm.value,
      accuracy: finalAccuracy.value,
      difficulty: difficulty.value,
      completedSentences: completedSentences.value,
      date: new Date().toLocaleString('ko-KR')
    })
    localStorage.setItem('typingGameRecords', JSON.stringify(records))
    
    message.success('🎉 기록이 저장되었습니다!')
    showResults.value = false
    loadLeaderboard()
  } catch (error) {
    message.error('❌ 기록 저장에 실패했습니다')
  } finally {
    saving.value = false
  }
}

// 게임 리셋
const resetGame = () => {
  gameStarted.value = false
  gameEnded.value = false
  gamePaused.value = false
  showResults.value = false
  showMobileLeaderboard.value = false
  showMobileStats.value = false
  currentTextIndex.value = 0
  userInput.value = ''
  score.value = 0
  completedSentences.value = 0
  totalChars.value = 0
  correctChars.value = 0
  errors.value = 0
  currentEvent.value = null
  eventTriggered.value.clear()
  clearInterval(gameTimer.value)
}

// 순위표 관련 함수들
const startLeaderboardUpdates = () => {
  loadLeaderboard()
}

const stopLeaderboardUpdates = () => {
  if (leaderboardTimer.value) {
    clearInterval(leaderboardTimer.value)
  }
}

const loadLeaderboard = async () => {
  loadingLeaderboard.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 로컬 스토리지에서 기록 불러오기
    const records = JSON.parse(localStorage.getItem('typingGameRecords') || '[]')
    leaderboardData.value = records
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((record, index) => ({
        ...record,
        id: index + 1,
        createdAt: record.date
      }))
    
    // 개인 통계 계산
    if (playerName.value) {
      const myRecords = records.filter(r => r.playerName === playerName.value)
      if (myRecords.length > 0) {
        personalStats.value = {
          bestScore: Math.max(...myRecords.map(r => r.score)),
          totalGames: myRecords.length,
          avgWpm: Math.round(myRecords.reduce((sum, r) => sum + r.wpm, 0) / myRecords.length),
          avgAccuracy: Math.round(myRecords.reduce((sum, r) => sum + r.accuracy, 0) / myRecords.length)
        }
      }
    }
    
    // 전체 통계
    globalStats.value = {
      totalGames: records.length,
      totalPlayers: [...new Set(records.map(r => r.playerName))].length,
      highestScore: records.length > 0 ? Math.max(...records.map(r => r.score)) : 0
    }
  } finally {
    loadingLeaderboard.value = false
  }
}

const handleFilterChange = ({ filter, period }) => {
  leaderboardFilter.value = filter
  leaderboardPeriod.value = period
  loadLeaderboard()
}

// 라이프사이클
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  startLeaderboardUpdates()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
  }
  stopLeaderboardUpdates()
})

// 플레이어 이름 변경 감지
watch(playerName, (newName) => {
  if (newName) {
    loadLeaderboard()
  }
})
</script>
<style scoped>
/* 전체 배경을 밝게 */
.typing-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 밝은 헤더 디자인 */
.game-header {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
}

.logo-text h1 {
  margin: 0;
  color: #1890ff;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(45deg, #1890ff, #722ed1);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 12px;
  color: #8c8c8c;
  display: block;
  margin-top: -2px;
}

.header-welcome {
  font-size: 16px;
  color: #52c41a;
  font-weight: 500;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 18px;
}

.stat-content {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1890ff;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 10px;
  color: #8c8c8c;
  margin-top: 2px;
}

/* 메인 레이아웃 */
.main-layout {
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.game-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 밝은 설정 패널 */
.setup-panel {
  max-width: 480px;
  margin: 40px auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.setup-header {
  text-align: center;
  margin-bottom: 32px;
}

.setup-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.setup-header h2 {
  color: #1890ff;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.setup-header p {
  color: #8c8c8c;
  margin: 0;
  font-size: 16px;
}

.setup-form {
  padding: 0 8px;
}

.difficulty-cards {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.difficulty-card {
  flex: 1;
  min-width: 120px;
  background: #fafafa;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.difficulty-card.selected {
  border-color: #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
}

.difficulty-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.difficulty-name {
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.difficulty-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.start-button {
  height: 56px;
  margin-top: 24px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  border: none;
  font-size: 18px;
  font-weight: 600;
}

.start-button:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #9254de 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3);
}

/* 게임 영역 */
.game-area {
  max-width: 900px;
  margin: 0 auto;
}

.game-info-card {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.timer-section {
  text-align: center;
  flex-shrink: 0;
}

.timer-label {
  margin-top: 12px;
  font-size: 14px;
  color: #8c8c8c;
  font-weight: 500;
}

.progress-section {
  flex: 1;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.progress-count {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

.level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.level-badge {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.combo-text {
  font-size: 14px;
  color: #fa541c;
  font-weight: 500;
}

/* 텍스트 표시 영역 */
.text-display-card {
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.text-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #262626;
}

.text-icon {
  font-size: 18px;
}

.target-text {
  font-family: 'Pretendard', -apple-system, sans-serif;
  font-size: 20px;
  line-height: 2;
  padding: 24px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border-radius: 12px;
  min-height: 120px;
  word-break: break-all;
  border: 1px solid #f0f0f0;
}

.target-text.mobile-text {
  font-size: 18px;
  padding: 20px;
  line-height: 1.8;
}

.target-text span {
  padding: 2px 3px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.target-text span.correct {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(82, 196, 26, 0.3);
}

.target-text span.incorrect {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: white;
  animation: shake 0.4s ease;
  box-shadow: 0 2px 4px rgba(255, 77, 79, 0.3);
}

.target-text span.current {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
  animation: pulse 1.5s infinite;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
}

.target-text span.pending {
  color: #8c8c8c;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

/* 입력 영역 */
.input-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #262626;
}

.input-icon {
  font-size: 18px;
}

.chars-typed {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.game-input {
  font-family: 'Pretendard', -apple-system, sans-serif;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.game-input:focus {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  transform: scale(1.01);
}

.input-controls {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: center;
}

.control-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* 모바일 액션 바 */
.mobile-actions {
  display: flex;
  gap: 12px;
  padding: 20px 16px;
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.action-btn {
  flex: 1;
  height: 52px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* 하단 액션바를 위한 여백 */
.mobile .game-area {
  padding-bottom: 100px;
}

/* 이벤트 알림 */
.event-alert {
  margin-top: 20px;
  border-radius: 12px;
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .game-content {
    padding: 16px 12px;
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .logo-text h1 {
    font-size: 20px;
  }
  
  .stats {
    gap: 8px;
  }
  
  .stat-card {
    padding: 6px 8px;
  }
  
  .stat-value {
    font-size: 14px;
  }
  
  .setup-panel {
    margin: 20px auto;
    max-width: 95%;
  }
  
  .difficulty-cards {
    flex-direction: column;
  }
  
  .difficulty-card {
    min-width: auto;
  }
  
  .game-info-card {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 20px;
  }
  
  .target-text.mobile-text {
    font-size: 16px;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 8px;
  }
  
  .logo-text h1 {
    font-size: 18px;
  }
  
  .setup-header h2 {
    font-size: 24px;
  }
  
  .setup-icon {
    font-size: 40px;
  }
}

/* 순위표 사이드바 */
.leaderboard-sidebar {
  background: #ffffff !important;
  border-left: 1px solid #f0f0f0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}
</style>