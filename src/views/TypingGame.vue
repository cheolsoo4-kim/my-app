<template>
  <div class="typing-game">
    <a-layout>
      <a-layout-header class="game-header">
        <h1>타자게임</h1>
<div class="stats">
          <a-statistic title="타수" :value="wpm" suffix="타/분" />
          <a-statistic title="정확도" :value="accuracy" suffix="%" />
          <a-statistic title="점수" :value="score" />
        </div>
</a-layout-header>
      
      <a-layout class="main-layout">
        <!-- 게임 영역 (왼쪽) -->
        <a-layout-content class="game-content">
          <!-- 게임 설정 패널 -->
          <a-card v-if="!gameStarted" class="setup-panel">
            <h2>게임 설정</h2>
<a-form layout="vertical">
              <a-form-item label="플레이어 이름">
                <a-input v-model:value="playerName" placeholder="이름을 입력하세요" />
              </a-form-item>
              <a-form-item label="난이도">
                <a-select v-model:value="difficulty">
                  <a-select-option value="easy">쉬움</a-select-option>
                  <a-select-option value="normal">보통</a-select-option>
                  <a-select-option value="hard">어려움</a-select-option>
                </a-select>
              </a-form-item>
              <a-button type="primary" @click="startGame" size="large">
                게임 시작
              </a-button>
            </a-form>
          </a-card>

          <!-- 메인 게임 영역 -->
          <div v-if="gameStarted" class="game-area">
            <!-- 타이머와 진행도 -->
            <div class="game-info">
              <a-progress 
                :percent="progress" 
                :status="timeLeft < 10 ? 'exception' : 'active'"
                :strokeColor="timeLeft < 10 ? '#ff4d4f' : '#1890ff'"
              />
              <div class="timer">
                <a-statistic 
                  title="남은 시간" 
                  :value="timeLeft" 
                  suffix="초"
                  :valueStyle="{ color: timeLeft < 10 ? '#cf1322' : '#3f8600' }"
                />
              </div>
</div>

            <!-- 텍스트 표시 영역 -->
            <a-card class="text-display">
              <div class="target-text">
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
            <div class="input-area">
              <a-input 
                v-model:value="userInput"
                @input="handleInput"
                @keydown="handleKeyDown"
                placeholder="위의 문장을 정확히 입력하세요"
                size="large"
                :disabled="gameEnded"
                ref="gameInput"
              />
            </div>
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
          </div>
<!-- 게임 결과 -->
          <a-modal 
            v-model:open="showResults"
            title="게임 결과"
            :footer="null"
            width="600px"
          >
            <div class="results">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-statistic title="최종 점수" :value="finalScore" />
                </a-col>
                <a-col :span="12">
                  <a-statistic title="평균 타수" :value="finalWpm" suffix="타/분" />
                </a-col>
              </a-row>
              <a-row :gutter="16" style="margin-top: 16px;">
                <a-col :span="12">
                  <a-statistic title="정확도" :value="finalAccuracy" suffix="%" />
                </a-col>
                <a-col :span="12">
                  <a-statistic title="완료 문장" :value="completedSentences" />
                </a-col>
              </a-row>
              
              <div class="result-actions">
                <a-button type="primary" @click="saveRecord" :loading="saving">
                  기록 저장
                </a-button>
                <a-button @click="resetGame">다시하기</a-button>
              </div>
</div>
          </a-modal>
        </a-layout-content>

        <!-- 순위표 사이드바 (오른쪽) -->
        <a-layout-sider 
          width="400" 
          theme="light" 
          class="leaderboard-sidebar"
          :breakpoint="'lg'"
          :collapsedWidth="0"
        >
          <div class="leaderboard-container">
            <div class="leaderboard-header">
              <h3>
                <a-badge :count="leaderboardData.length" showZero>
                  🏆 실시간 순위표
                </a-badge>
              </h3>
<a-button 
                type="text" 
                size="small" 
                @click="loadLeaderboard"
                :loading="loadingLeaderboard"
              >
                <template #icon>
                  <ReloadOutlined />
                </template>
                새로고침
              </a-button>
            </div>
<!-- 필터 -->
            <div class="leaderboard-filters">
              <a-select 
                v-model:value="leaderboardFilter" 
                size="small" 
                @change="loadLeaderboard"
                style="width: 100px;"
              >
                <a-select-option value="all">전체</a-select-option>
                <a-select-option value="easy">쉬움</a-select-option>
                <a-select-option value="normal">보통</a-select-option>
                <a-select-option value="hard">어려움</a-select-option>
              </a-select>
              
              <a-select 
                v-model:value="leaderboardPeriod" 
                size="small" 
                @change="loadLeaderboard"
                style="width: 120px; margin-left: 8px;"
              >
                <a-select-option value="all">전체기간</a-select-option>
                <a-select-option value="today">오늘</a-select-option>
                <a-select-option value="week">이번주</a-select-option>
                <a-select-option value="month">이번달</a-select-option>
              </a-select>
            </div>
<!-- 순위표 리스트 -->
            <div class="leaderboard-list">
              <a-list
                :data-source="leaderboardData"
                :loading="loadingLeaderboard"
                size="small"
              >
                <template #renderItem="{ item, index }">
                  <a-list-item 
                    :class="[
                      'leaderboard-item',
                      { 'current-player': item.playerName === playerName },
                      { 'top-three': index < 3 }
                    ]"
                  >
                    <div class="rank-info">
                      <span class="rank-number">
                        <a-badge 
                          :count="index + 1" 
                          :color="getRankColor(index)"
                          :number-style="{ fontSize: '12px' }"
                        />
                      </span>
                      <div class="player-info">
                        <div class="player-name">
                          {{ item.playerName }}
                          <a-tag v-if="item.difficulty" size="small" :color="getDifficultyColor(item.difficulty)">
                            {{ getDifficultyText(item.difficulty) }}
                          </a-tag>
                        </div>
<div class="player-stats">
                          <span class="score">{{ item.score }}점</span>
                          <span class="wpm">{{ item.wpm }}타/분</span>
                          <span class="accuracy">{{ item.accuracy }}%</span>
                        </div>
<div class="play-time">
                          {{ item.createdAt }}
                        </div>
</div>
                    </div>
</a-list-item>
                </template>
              </a-list>
            </div>
<!-- 개인 통계 -->
            <div class="personal-stats" v-if="playerName && personalStats">
              <a-divider>개인 통계</a-divider>
              <a-row :gutter="8">
                <a-col :span="12">
                  <a-statistic 
                    title="최고점수" 
                    :value="personalStats.bestScore" 
                    :valueStyle="{ fontSize: '14px' }"
                  />
                </a-col>
                <a-col :span="12">
                  <a-statistic 
                    title="게임횟수" 
                    :value="personalStats.totalGames" 
                    :valueStyle="{ fontSize: '14px' }"
                  />
                </a-col>
              </a-row>
              <a-row :gutter="8" style="margin-top: 8px;">
                <a-col :span="12">
                  <a-statistic 
                    title="평균타수" 
                    :value="personalStats.avgWpm" 
                    suffix="타/분"
                    :precision="1"
                    :valueStyle="{ fontSize: '14px' }"
                  />
                </a-col>
                <a-col :span="12">
                  <a-statistic 
                    title="평균정확도" 
                    :value="personalStats.avgAccuracy" 
                    suffix="%"
                    :precision="1"
                    :valueStyle="{ fontSize: '14px' }"
                  />
                </a-col>
              </a-row>
            </div>
<!-- 전체 통계 -->
            <div class="global-stats" v-if="globalStats">
              <a-divider>전체 통계</a-divider>
              <a-descriptions size="small" :column="1">
                <a-descriptions-item label="총 게임수">
                  {{ globalStats.totalGames }}
                </a-descriptions-item>
                <a-descriptions-item label="총 플레이어수">
                  {{ globalStats.totalPlayers }}
                </a-descriptions-item>
                <a-descriptions-item label="최고기록">
                  {{ globalStats.highestScore }}점
                </a-descriptions-item>
              </a-descriptions>
            </div>
</div>
        </a-layout-sider>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { gameTexts, specialEvents } from './gameData'
import { apiService } from '../services/api'

// 게임 상태
const gameStarted = ref(false)
const gameEnded = ref(false)
const playerName = ref('')
const difficulty = ref('normal')
const currentTextIndex = ref(0)
const userInput = ref('')
const startTime = ref(null)
const gameTimer = ref(null)
const timeLeft = ref(60)
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

// 순위표 실시간 업데이트
const startLeaderboardUpdates = () => {
  loadLeaderboard()
  leaderboardTimer.value = setInterval(() => {
    loadLeaderboard()
  }, 10000) // 10초마다 업데이트
}

const stopLeaderboardUpdates = () => {
  if (leaderboardTimer.value) {
    clearInterval(leaderboardTimer.value)
    leaderboardTimer.value = null
  }
}

// 순위표 로드
const loadLeaderboard = async () => {
  if (loadingLeaderboard.value) return
  
  loadingLeaderboard.value = true
  try {
    const data = await apiService.getLeaderboard(50, leaderboardFilter.value, leaderboardPeriod.value)
    leaderboardData.value = data
    
    // 개인 통계 로드
    if (playerName.value) {
      await loadPersonalStats()
    }
    
    // 전체 통계 로드
    await loadGlobalStats()
  } catch (error) {
    console.error('Failed to load leaderboard:', error)
  } finally {
    loadingLeaderboard.value = false
  }
}

// 개인 통계 로드
const loadPersonalStats = async () => {
  try {
    const stats = await apiService.getPlayerStats(playerName.value)
    personalStats.value = stats
  } catch (error) {
    console.error('Failed to load personal stats:', error)
  }
}

// 전체 통계 로드
const loadGlobalStats = async () => {
  try {
    const stats = await apiService.getGlobalStats()
    globalStats.value = stats
  } catch (error) {
    console.error('Failed to load global stats:', error)
  }
}

// 순위 색상
const getRankColor = (index) => {
  if (index === 0) return '#ffd700' // 금
  if (index === 1) return '#c0c0c0' // 은
  if (index === 2) return '#cd7f32' // 동
  return '#1890ff'
}

// 난이도 색상
const getDifficultyColor = (diff) => {
  return { easy: 'green', normal: 'blue', hard: 'red' }[diff] || 'default'
}

// 난이도 텍스트
const getDifficultyText = (diff) => {
  return { easy: '쉬움', normal: '보통', hard: '어려움' }[diff] || diff
}

// 게임 시작
const startGame = () => {
  if (!playerName.value.trim()) {
    message.error('플레이어 이름을 입력해주세요')
    return
  }
  
  gameStarted.value = true
  gameEnded.value = false
  startTime.value = Date.now()
  timeLeft.value = difficulty.value === 'easy' ? 90 : difficulty.value === 'normal' ? 60 : 45
  
  // 게임 타이머 시작
  gameTimer.value = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
  
  // 순위표 업데이트 시작
  startLeaderboardUpdates()
  
  // 입력 필드에 포커스
  nextTick(() => {
    gameInput.value?.focus()
  })
}

// 입력 처리
const handleInput = (e) => {
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
  // 특수 이벤트 체크
  checkSpecialEvents(userInput.value + e.key)
}

// 문장 완료
const completeSentence = () => {
  completedSentences.value++
  
  // 점수 계산
  const timeBonus = Math.max(0, timeLeft.value)
  const accuracyBonus = accuracy.value
  score.value += (100 + timeBonus + accuracyBonus) * getDifficultyMultiplier()
  
  // 다음 문장으로
  currentTextIndex.value++
  userInput.value = ''
  
  // 모든 문장 완료시
  if (currentTextIndex.value >= gameTexts[difficulty.value].length) {
    endGame()
  }
  
  message.success(`문장 완료! +${100 + timeBonus + accuracyBonus} 점`)
}

// 특수 이벤트 체크
const checkSpecialEvents = (text) => {
  for (const event of specialEvents) {
    if (text.includes(event.trigger) && !eventTriggered.value.has(event.id)) {
      triggerEvent(event)
      eventTriggered.value.add(event.id)
      break
    }
  }
}

// 이벤트 실행
const triggerEvent = (event) => {
  currentEvent.value = {
    message: event.name,
    type: event.type,
    description: event.description
  }
  
  // 이벤트 효과 적용
  if (event.effect.type === 'score') {
    score.value += event.effect.value
  } else if (event.effect.type === 'time') {
    timeLeft.value = Math.max(0, timeLeft.value + event.effect.value)
  } else if (event.effect.type === 'chaos') {
    // 혼돈 이벤트: 입력 필드 일시적으로 비활성화
    gameInput.value.disabled = true
    setTimeout(() => {
      gameInput.value.disabled = false
      gameInput.value.focus()
    }, 2000)
  }
  
  // 3초 후 이벤트 알림 자동 닫기
  setTimeout(() => {
    currentEvent.value = null
  }, 3000)
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

// 난이도 배수
const getDifficultyMultiplier = () => {
  return { easy: 1, normal: 1.5, hard: 2 }[difficulty.value]
}

// 게임 종료
const endGame = () => {
  gameEnded.value = true
  clearInterval(gameTimer.value)
  showResults.value = true
}

// 기록 저장
const saveRecord = async () => {
  saving.value = true
  try {
    const record = {
      playerName: playerName.value,
      score: finalScore.value,
      wpm: finalWpm.value,
      accuracy: finalAccuracy.value,
      difficulty: difficulty.value,
      completedSentences: completedSentences.value,
      playTime: 60 - timeLeft.value
    }
    
    await apiService.saveGameRecord(record)
    message.success('기록이 저장되었습니다!')
    showResults.value = false
    
    // 순위표 즉시 업데이트
    loadLeaderboard()
  } catch (error) {
    message.error('기록 저장에 실패했습니다: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 게임 리셋
const resetGame = () => {
  gameStarted.value = false
  gameEnded.value = false
  showResults.value = false
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
  stopLeaderboardUpdates()
}

// 플레이어 이름 변경시 개인 통계 업데이트
watch(playerName, (newName) => {
  if (newName) {
    loadPersonalStats()
  }
})

// 컴포넌트 마운트시 순위표 로드
onMounted(() => {
  startLeaderboardUpdates()
})

// 컴포넌트 언마운트시 정리
onUnmounted(() => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
  }
  stopLeaderboardUpdates()
})
</script>

<style scoped>
.typing-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.game-header {
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-header h1 {
  color: #1890ff;
  margin: 0;
  font-weight: bold;
}

.stats {
  display: flex;
  gap: 32px;
}

.main-layout {
  min-height: calc(100vh - 64px);
}

.game-content {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.setup-panel {
  max-width: 400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
}

.game-area {
  max-width: 800px;
  margin: 0 auto;
}

.game-info {
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-display {
  background: rgba(255, 255, 255, 0.95);
  margin-bottom: 16px;
}

.target-text {
  font-family: 'Courier New', monospace;
  font-size: 20px;
  line-height: 1.8;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  min-height: 100px;
}

.target-text span.correct {
  background-color: #52c41a;
  color: white;
}

.target-text span.incorrect {
  background-color: #ff4d4f;
  color: white;
}

.target-text span.current {
  background-color: #1890ff;
  color: white;
  animation: blink 1s infinite;
}

.target-text span.pending {
  color: #666;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.input-area {
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  border-radius: 8px;
}

.event-alert {
  margin-top: 16px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.results {
  text-align: center;
}

.result-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.timer {
  text-align: center;
}

/* 순위표 스타일 */
.leaderboard-sidebar {
  background: rgba(255, 255, 255, 0.98) !important;
  border-left: 1px solid #f0f0f0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.leaderboard-container {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.leaderboard-header h3 {
  margin: 0;
  color: #1890ff;
  font-size: 16px;
}

.leaderboard-filters {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.leaderboard-list {
  flex: 1;
  margin-bottom: 16px;
}

.leaderboard-item {
  padding: 8px 0 !important;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.leaderboard-item:hover {
  background-color: #f5f5f5;
  transform: translateX(2px);
}

.leaderboard-item.current-player {
  background-color: #e6f7ff;
  border-left: 3px solid #1890ff;
  padding-left: 12px;
}

.leaderboard-item.top-three {
  background: linear-gradient(45deg, #fff7e6, #fff2e8);
}

.rank-info {
  display: flex;
  align-items: center;
  width: 100%;
}

.rank-number {
  margin-right: 12px;
  min-width: 32px;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.player-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.score {
  color: #52c41a;
  font-weight: 500;
}

.wpm {
  color: #1890ff;
}

.accuracy {
  color: #fa8c16;
}

.play-time {
  font-size: 11px;
  color: #999;
}

.personal-stats,
.global-stats {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.personal-stats .ant-statistic {
  margin-bottom: 8px;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .leaderboard-sidebar {
    width: 350px !important;
  }
}

@media (max-width: 992px) {
  .main-layout {
    flex-direction: column;
  }
  
  .leaderboard-sidebar {
    width: 100% !important;
    height: auto;
    order: 2;
  }
  
  .game-content {
    order: 1;
  }
  
  .leaderboard-container {
    height: auto;
    max-height: 400px;
  }
}
</style>
