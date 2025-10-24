<template>
  <div class="roulette-game" :class="{ 'mobile': isMobile }">
    <!-- 게임 헤더 -->
    <div class="game-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🍀</span>
          <span class="logo-text">🍀</span>
        </div>
<div class="user-info" v-if="user">
          <div class="balance">
            <span class="balance-label">보유 코인</span>
            <span class="balance-amount">{{ formatNumber(userBalance) }}</span>
            <CoinIcon />
          </div>
<a-dropdown>
            <a-button type="text" class="user-btn">
              <a-avatar :src="user.avatar" size="small">
                {{ user.name?.charAt(0) }}
              </a-avatar>
              <span class="username">{{ user.name }}</span>
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="showProfile = true">
                  <UserOutlined />
                  프로필
                </a-menu-item>
                <a-menu-item @click="showHistory = true">
                  <HistoryOutlined />
                  게임 기록
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="logout">
                  <LogoutOutlined />
                  로그아웃
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
</div>
    </div>
<!-- 메인 게임 영역 -->
    <div class="game-content">
      <!-- 룰렛 영역 -->
      <div class="roulette-section">
        <div class="roulette-container">
          <!-- 룰렛 휠 -->
          <div 
            class="roulette-wheel" 
            :style="{ transform: `rotate(${wheelRotation}deg)` }"
          >
            <div 
              v-for="(segment, index) in rouletteSegments"
              :key="index"
              class="segment"
              :style="{
                transform: `rotate(${index * segmentAngle}deg)`,
                background: `conic-gradient(from 0deg, ${segment.color} 0deg, ${segment.color} ${segmentAngle}deg, transparent ${segmentAngle}deg)`
              }"
            >
              <div class="segment-content">
                <span class="segment-number">{{ segment.number }}</span>
                <span class="segment-multiplier">{{ segment.multiplier }}</span>
              </div>
</div>
            
            <!-- 중앙 로고 -->
            <div class="wheel-center">
              <span class="center-icon">🍀</span>
            </div>
</div>
          
          <!-- 포인터 -->
          <div class="wheel-pointer">▲</div>
<!-- 스핀 버튼 -->
          <a-button 
            type="primary" 
            size="large"
            class="spin-button"
            :loading="isSpinning"
            :disabled="!canSpin"
            @click="spinWheel"
          >
            {{ isSpinning ? '돌리는 중...' : 'SPIN!' }}
          </a-button>
        </div>
<!-- 최근 결과 -->
        <div class="recent-results">
          <h3>최근 결과</h3>
<div class="results-list">
            <div 
              v-for="(result, index) in recentResults"
              :key="index"
              class="result-item"
              :style="{ background: getSegmentColor(result.number) }"
            >
              {{ result.number }}
            </div>
</div>
        </div>
</div>

      <!-- 베팅 영역 -->
      <div class="betting-section">
        <div class="betting-header">
          <h2>베팅하기</h2>
<div class="betting-stats">
            <span class="total-bet">총 베팅: {{ formatNumber(totalBet) }}</span>
            <span class="potential-win">예상 수익: {{ formatNumber(potentialWin) }}</span>
          </div>
</div>
        
        <!-- 베팅 금액 선택 -->
        <div class="bet-amount-section">
          <h3>베팅 금액</h3>
<div class="amount-buttons">
            <a-button
              v-for="amount in betAmounts"
              :key="amount"
              :type="selectedBetAmount === amount ? 'primary' : 'default'"
              @click="selectBetAmount(amount)"
              class="amount-btn"
            >
              {{ formatNumber(amount) }}
            </a-button>
          </div>
<div class="custom-amount">
            <a-input-number
              v-model:value="customBetAmount"
              :min="minBet"
              :max="userBalance"
              :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="value => value.replace(/\$\s?|(,*)/g, '')"
              placeholder="직접 입력"
              size="large"
              addon-after="코인"
              style="width: 200px"
            />
            <a-button @click="selectCustomAmount" type="dashed">적용</a-button>
          </div>
</div>
        
        <!-- 베팅 옵션 -->
        <div class="betting-options">
          <a-tabs v-model:activeKey="activeBetTab" type="card">
            <!-- 숫자별 베팅 -->
            <a-tab-pane key="numbers" tab="숫자 베팅">
              <div class="numbers-grid">
                <div
                  v-for="segment in rouletteSegments"
                  :key="segment.number"
                  class="number-bet-item"
                  :class="{ 'has-bet': bets.numbers[segment.number] > 0 }"
                  :style="{ borderColor: segment.color }"
                  @click="placeBet('number', segment.number)"
                >
                  <div class="number-display" :style="{ background: segment.color }">
                    {{ segment.number }}
                  </div>
<div class="multiplier">{{ segment.multiplier }}</div>
<div v-if="bets.numbers[segment.number]" class="bet-amount">
                    {{ formatNumber(bets.numbers[segment.number]) }}
                  </div>
</div>
              </div>
</a-tab-pane>
            
            <!-- 색상별 베팅 -->
            <a-tab-pane key="colors" tab="색상 베팅">
              <div class="color-bets">
                <div 
                  v-for="color in colorBets"
                  :key="color.name"
                  class="color-bet-item"
                  :class="{ 'has-bet': bets.colors[color.name] > 0 }"
                  @click="placeBet('color', color.name)"
                >
                  <div class="color-display" :style="{ background: color.color }">
                    {{ color.name }}
                  </div>
<div class="color-info">
                    <span class="color-multiplier">{{ color.multiplier }}</span>
                    <span class="color-numbers">{{ color.numbers.join(', ') }}</span>
                  </div>
<div v-if="bets.colors[color.name]" class="bet-amount">
                    {{ formatNumber(bets.colors[color.name]) }}
                  </div>
</div>
              </div>
</a-tab-pane>
            
            <!-- 구간별 베팅 -->
            <a-tab-pane key="ranges" tab="구간 베팅">
              <div class="range-bets">
                <div 
                  v-for="range in rangeBets"
                  :key="range.name"
                  class="range-bet-item"
                  :class="{ 'has-bet': bets.ranges[range.name] > 0 }"
                  @click="placeBet('range', range.name)"
                >
                  <div class="range-display">
                    {{ range.name }}
                  </div>
<div class="range-info">
                    <span class="range-multiplier">{{ range.multiplier }}</span>
                    <span class="range-numbers">{{ range.displayText }}</span>
                  </div>
<div v-if="bets.ranges[range.name]" class="bet-amount">
                    {{ formatNumber(bets.ranges[range.name]) }}
                  </div>
</div>
              </div>
</a-tab-pane>
          </a-tabs>
        </div>
<!-- 베팅 액션 -->
        <div class="betting-actions">
          <a-button 
            size="large" 
            @click="clearAllBets"
            :disabled="isSpinning || totalBet === 0"
          >
            베팅 취소
          </a-button>
          
          <a-button 
            type="primary" 
            size="large"
            :disabled="!canSpin"
            @click="confirmBetsAndSpin"
            class="confirm-bet-btn"
          >
            베팅 확정 & 스핀 ({{ formatNumber(totalBet) }})
          </a-button>
        </div>
</div>
    </div>
<!-- 게임 결과 모달 -->
    <a-modal
      v-model:open="showResultModal"
      :title="resultModalTitle"
      :footer="null"
      centered
      :width="isMobile ? '90%' : 500"
      class="result-modal"
    >
      <div class="result-content">
        <div class="result-number" :style="{ background: getSegmentColor(lastResult?.number) }">
          {{ lastResult?.number }}
        </div>
<div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">베팅 금액</span>
            <span class="stat-value">{{ formatNumber(lastResult?.totalBet || 0) }}</span>
          </div>
<div class="stat-item">
            <span class="stat-label">{{ lastResult?.isWin ? '획득 금액' : '손실 금액' }}</span>
            <span 
              class="stat-value"
              :style="{ color: lastResult?.isWin ? '#52c41a' : '#ff4d4f' }"
            >
              {{ lastResult?.isWin ? '+' : '-' }}{{ formatNumber(Math.abs(lastResult?.winAmount || 0)) }}
            </span>
          </div>
<div class="stat-item">
            <span class="stat-label">현재 잔액</span>
            <span class="stat-value">{{ formatNumber(userBalance) }}</span>
          </div>
</div>
        
        <div v-if="lastResult?.winDetails?.length" class="win-details">
          <h4>당첨 내역</h4>
<div v-for="detail in lastResult.winDetails" :key="detail.type + detail.value" class="win-detail-item">
            <span>{{ detail.description }}</span>
            <span class="win-amount">+{{ formatNumber(detail.amount) }}</span>
          </div>
</div>
        
        <div class="result-actions">
          <a-button size="large" @click="showResultModal = false">
            확인
          </a-button>
          <a-button 
            type="primary" 
            size="large" 
            @click="playAgain"
            :disabled="userBalance < minBet"
          >
            다시 플레이
          </a-button>
        </div>
</div>
    </a-modal>

    <!-- 기타 모달들 -->
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons-vue'


// 반응형 감지
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 사용자 정보 (임시)
const user = ref({
  id: 1,
  name: '플레이어',
  avatar: 'https://ui-avatars.com/api/?name=Player&background=52c41a&color=fff'
})

const userBalance = ref(50000)

// 룰렛 설정
const rouletteSegments = ref([
  { number: 0, multiplier: '35:1', color: '#22c55e' },   // 초록
  { number: 32, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 15, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 19, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 4, multiplier: '35:1', color: '#000000' },   // 검정
  { number: 21, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 2, multiplier: '35:1', color: '#000000' },   // 검정
  { number: 25, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 17, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 34, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 6, multiplier: '35:1', color: '#000000' },   // 검정
  { number: 27, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 13, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 36, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 11, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 30, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 8, multiplier: '35:1', color: '#000000' },   // 검정
  { number: 23, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 10, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 5, multiplier: '35:1', color: '#ef4444' },   // 빨강
  { number: 24, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 16, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 33, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 1, multiplier: '35:1', color: '#ef4444' },   // 빨강
  { number: 20, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 14, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 31, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 9, multiplier: '35:1', color: '#ef4444' },   // 빨강
  { number: 22, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 18, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 29, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 7, multiplier: '35:1', color: '#ef4444' },   // 빨강
  { number: 28, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 12, multiplier: '35:1', color: '#ef4444' },  // 빨강
  { number: 35, multiplier: '35:1', color: '#000000' },  // 검정
  { number: 3, multiplier: '35:1', color: '#ef4444' },   // 빨강
  { number: 26, multiplier: '35:1', color: '#000000' },  // 검정
])

const segmentAngle = computed(() => 360 / rouletteSegments.value.length)

// 베팅 관련
const selectedBetAmount = ref(1000)
const customBetAmount = ref(1000)
const betAmounts = [100, 500, 1000, 5000, 10000, 25000]
const minBet = 100
const activeBetTab = ref('numbers')

const bets = ref({
  numbers: {},
  colors: {},
  ranges: {}
})

// 색상별 베팅 옵션
const colorBets = ref([
  {
    name: '빨강',
    color: '#ef4444',
    multiplier: '2:1',
    numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  },
  {
    name: '검정',
    color: '#000000',
    multiplier: '2:1',
    numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
  },
  {
    name: '초록',
    color: '#22c55e',
    multiplier: '35:1',
    numbers: [0]
  }
])

// 구간별 베팅 옵션
const rangeBets = ref([
  {
    name: 'low',
    displayText: '1-18',
    multiplier: '2:1',
    numbers: Array.from({length: 18}, (_, i) => i + 1)
  },
  {
    name: 'high',
    displayText: '19-36',
    multiplier: '2:1',
    numbers: Array.from({length: 18}, (_, i) => i + 19)
  },
  {
    name: 'even',
    displayText: '짝수',
    multiplier: '2:1',
    numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
  },
  {
    name: 'odd',
    displayText: '홀수',
    multiplier: '2:1',
    numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
  }
])

// 게임 상태
const isSpinning = ref(false)
const wheelRotation = ref(0)
const recentResults = ref([])
const showResultModal = ref(false)
const lastResult = ref(null)
const gameHistory = ref([])
const showProfile = ref(false)
const showHistory = ref(false)

// 계산된 속성들
const totalBet = computed(() => {
  let total = 0
  Object.values(bets.value.numbers).forEach(amount => total += amount || 0)
  Object.values(bets.value.colors).forEach(amount => total += amount || 0)
  Object.values(bets.value.ranges).forEach(amount => total += amount || 0)
  return total
})

const potentialWin = computed(() => {
  let maxWin = 0
  // 각 숫자에 대해 최대 수익 계산
  rouletteSegments.value.forEach(segment => {
    let winAmount = 0
    
    // 직접 숫자 베팅
    if (bets.value.numbers[segment.number]) {
      winAmount += bets.value.numbers[segment.number] * 35
    }
    
    // 색상 베팅
    const segmentColor = getSegmentColorName(segment.number)
    if (bets.value.colors[segmentColor]) {
      const multiplier = segmentColor === '초록' ? 35 : 1
      winAmount += bets.value.colors[segmentColor] * multiplier
    }
    
    // 구간 베팅
    rangeBets.value.forEach(range => {
      if (range.numbers.includes(segment.number) && bets.value.ranges[range.name]) {
        winAmount += bets.value.ranges[range.name]
      }
    })
    
    maxWin = Math.max(maxWin, winAmount)
  })
  
  return maxWin
})

const canSpin = computed(() => {
  return !isSpinning.value && totalBet.value > 0 && totalBet.value <= userBalance.value
})

const resultModalTitle = computed(() => {
  return lastResult.value?.isWin ? '🎉 승리!' : '😔 아쉽네요'
})

// 게임 로직
const selectBetAmount = (amount) => {
  selectedBetAmount.value = amount
}

const selectCustomAmount = () => {
  if (customBetAmount.value >= minBet && customBetAmount.value <= userBalance.value) {
    selectedBetAmount.value = customBetAmount.value
    message.success(`베팅 금액을 ${formatNumber(customBetAmount.value)}로 설정했습니다`)
  } else {
    message.error('유효하지 않은 베팅 금액입니다')
  }
}

const placeBet = (type, value) => {
  if (isSpinning.value) return
  
  const betAmount = selectedBetAmount.value
  
  if (userBalance.value < totalBet.value + betAmount) {
    message.error('잔액이 부족합니다')
    return
  }
  
  if (type === 'number') {
    bets.value.numbers[value] = (bets.value.numbers[value] || 0) + betAmount
  } else if (type === 'color') {
    bets.value.colors[value] = (bets.value.colors[value] || 0) + betAmount
  } else if (type === 'range') {
    bets.value.ranges[value] = (bets.value.ranges[value] || 0) + betAmount
  }
  
  message.success(`${formatNumber(betAmount)} 베팅이 추가되었습니다`)
}

const clearAllBets = () => {
  bets.value = {
    numbers: {},
    colors: {},
    ranges: {}
  }
  message.info('모든 베팅이 취소되었습니다')
}

const spinWheel = () => {
  if (!canSpin.value) return
  
  isSpinning.value = true
  
  // 랜덤 결과 생성
  const randomIndex = Math.floor(Math.random() * rouletteSegments.value.length)
  const result = rouletteSegments.value[randomIndex]
  
  // 휠 회전 애니메이션
  const spins = 5 + Math.random() * 5 // 5-10바퀴
  const targetAngle = randomIndex * segmentAngle.value
  const totalRotation = spins * 360 + (360 - targetAngle)
  
  wheelRotation.value += totalRotation
  
  // 스핀 완료 후 결과 처리
  setTimeout(() => {
    processResult(result)
    isSpinning.value = false
  }, 3000)
}

const processResult = (result) => {
  const winnings = calculateWinnings(result.number)
  const totalBetAmount = totalBet.value
  const netWin = winnings - totalBetAmount
  
  // 잔액 업데이트
  userBalance.value += netWin
  
  // 결과 저장
  const gameResult = {
    number: result.number,
    totalBet: totalBetAmount,
    winAmount: netWin,
    isWin: netWin > 0,
    winDetails: winnings > 0 ? getWinDetails(result.number) : [],
    timestamp: new Date()
  }
  
  lastResult.value = gameResult
  recentResults.value.unshift(result.number)
  if (recentResults.value.length > 10) {
    recentResults.value.pop()
  }
  
  gameHistory.value.unshift(gameResult)
  
  // 베팅 초기화
  clearAllBets()
  
  // 결과 모달 표시
  showResultModal.value = true
  
  // 사운드 효과 등 추가 가능
  if (gameResult.isWin) {
    message.success(`🎉 ${formatNumber(netWin)} 획득!`)
  } else {
    message.error(`😔 ${formatNumber(Math.abs(netWin))} 손실`)
  }
}

const calculateWinnings = (winningNumber) => {
  let totalWinnings = 0
  
  // 직접 숫자 베팅
  if (bets.value.numbers[winningNumber]) {
    totalWinnings += bets.value.numbers[winningNumber] * 36 // 35:1 + 원금
  }
  
  // 색상 베팅
  const winningColor = getSegmentColorName(winningNumber)
  if (bets.value.colors[winningColor]) {
    const multiplier = winningColor === '초록' ? 36 : 2 // 35:1 + 원금 또는 1:1 + 원금
    totalWinnings += bets.value.colors[winningColor] * multiplier
  }
  
  // 구간 베팅
  rangeBets.value.forEach(range => {
    if (range.numbers.includes(winningNumber) && bets.value.ranges[range.name]) {
      totalWinnings += bets.value.ranges[range.name] * 2 // 1:1 + 원금
    }
  })
  
  return totalWinnings
}

const getWinDetails = (winningNumber) => {
  const details = []
  
  // 직접 숫자 베팅
  if (bets.value.numbers[winningNumber]) {
    details.push({
      type: 'number',
      value: winningNumber,
      description: `숫자 ${winningNumber} (35:1)`,
      amount: bets.value.numbers[winningNumber] * 35
    })
  }
  
  // 색상 베팅
  const winningColor = getSegmentColorName(winningNumber)
  if (bets.value.colors[winningColor]) {
    const multiplier = winningColor === '초록' ? 35 : 1
    details.push({
      type: 'color',
      value: winningColor,
      description: `${winningColor} (${multiplier}:1)`,
      amount: bets.value.colors[winningColor] * multiplier
    })
  }
  
  // 구간 베팅
  rangeBets.value.forEach(range => {
    if (range.numbers.includes(winningNumber) && bets.value.ranges[range.name]) {
      details.push({
        type: 'range',
        value: range.name,
        description: `${range.displayText} (1:1)`,
        amount: bets.value.ranges[range.name]
      })
    }
  })
  
  return details
}

const confirmBetsAndSpin = () => {
  if (totalBet.value > userBalance.value) {
    message.error('베팅 금액이 잔액을 초과합니다')
    return
  }
  
  spinWheel()
}

const playAgain = () => {
  showResultModal.value = false
}

// 유틸리티 함수들
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

const getSegmentColor = (number) => {
  const segment = rouletteSegments.value.find(s => s.number === number)
  return segment?.color || '#666666'
}

const getSegmentColorName = (number) => {
  const color = getSegmentColor(number)
  if (color === '#ef4444') return '빨강'
  if (color === '#000000') return '검정'
  if (color === '#22c55e') return '초록'
  return '기타'
}

const logout = () => {
  // 로그아웃 로직
  message.success('로그아웃되었습니다')
}

// 컴포넌트 아이콘
const CoinIcon = () => '💰'

// 라이프사이클
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // 초기 데이터 로드
  loadGameData()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const loadGameData = () => {
  // 게임 데이터 초기화
  recentResults.value = [7, 23, 0, 15, 32]
}
</script>

<style scoped>
.roulette-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding: 0;
}

/* 게임 헤더 */
.game-header {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(45deg, #22c55e, #16a34a);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.balance {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(34, 197, 94, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.balance-label {
  font-size: 12px;
  opacity: 0.8;
}

.balance-amount {
  font-size: 18px;
  font-weight: 700;
  color: #22c55e;
}

.user-btn {
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
}

.username {
  margin-left: 8px;
}

/* 메인 게임 콘텐츠 */
.game-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  align-items: start;
}

/* 룰렛 섹션 */
.roulette-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.roulette-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.roulette-wheel {
  width: 400px;
  height: 400px;
  border-radius: 50%;
  position: relative;
  border: 8px solid #22c55e;
  box-shadow: 
    0 0 0 2px rgba(34, 197, 94, 0.3),
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 0 0 20px rgba(0, 0, 0, 0.1);
  transition: transform 3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.segment {
  position: absolute;
  width: 50%;
  height: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  border-radius: 0 100% 0 0;
  overflow: hidden;
}

.segment-content {
  position: absolute;
  top: 10%;
  right: 5%;
  text-align: center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.segment-number {
  display: block;
  font-size: 14px;
  margin-bottom: 2px;
}

.segment-multiplier {
  display: block;
  font-size: 10px;
  opacity: 0.8;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, #22c55e, #16a34a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.wheel-pointer {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  color: #22c55e;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  z-index: 10;
}

.spin-button {
  padding: 12px 48px;
  height: auto;
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(45deg, #22c55e, #16a34a);
  border: none;
  border-radius: 25px;
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
  transition: all 0.3s ease;
}

.spin-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.5);
}

.recent-results h3 {
  text-align: center;
  margin-bottom: 16px;
  color: white;
}

.results-list {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.result-item {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* 베팅 섹션 */
.betting-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.betting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.betting-header h2 {
  margin: 0;
  color: white;
  font-size: 20px;
}

.betting-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.total-bet {
  color: #22c55e;
  font-weight: 600;
}

.potential-win {
  color: #fbbf24;
  font-weight: 600;
  font-size: 12px;
}

.bet-amount-section {
  margin-bottom: 24px;
}

.bet-amount-section h3 {
  color: white;
  margin-bottom: 12px;
  font-size: 16px;
}

.amount-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.amount-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s ease;
}

.amount-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #22c55e;
  color: white;
}

.amount-btn.ant-btn-primary {
  background: linear-gradient(45deg, #22c55e, #16a34a);
  border-color: #22c55e;
}

.custom-amount {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 베팅 옵션 */
.betting-options {
  margin-bottom: 24px;
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.number-bet-item {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 70px;
}

.number-bet-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.number-bet-item.has-bet {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.number-display {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 11px;
  margin: 0 auto 4px;
}

.multiplier {
  font-size: 10px;
  color: #22c55e;
  margin-bottom: 4px;
}

.bet-amount {
  position: absolute;
  top: 2px;
  right: 4px;
  background: #22c55e;
  color: white;
  padding: 1px 4px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: bold;
}

.color-bets,
.range-bets {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-bet-item,
.range-bet-item {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-bet-item:hover,
.range-bet-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.color-bet-item.has-bet,
.range-bet-item.has-bet {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.color-display,
.range-display {
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
}

.range-display {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid #22c55e;
}

.color-info,
.range-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.color-multiplier,
.range-multiplier {
  color: #22c55e;
  font-weight: bold;
}

.color-numbers,
.range-numbers {
  font-size: 11px;
  color: #8c8c8c;
}

/* 베팅 액션 */
.betting-actions {
  display: flex;
  gap: 12px;
}

.betting-actions > * {
  flex: 1;
}

.confirm-bet-btn {
  background: linear-gradient(45deg, #22c55e, #16a34a);
  border: none;
  font-weight: 600;
}

/* 결과 모달 */
.result-modal :deep(.ant-modal-content) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.result-modal :deep(.ant-modal-header) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.result-modal :deep(.ant-modal-title) {
  color: white;
}

.result-content {
  text-align: center;
  color: white;
}

.result-number {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0 auto 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.win-details {
  margin-bottom: 24px;
  text-align: left;
}

.win-details h4 {
  color: white;
  margin-bottom: 12px;
}

.win-detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.win-amount {
  color: #22c55e;
  font-weight: bold;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.result-actions > * {
  flex: 1;
}

/* 반응형 */
@media (max-width: 1200px) {
  .game-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .betting-section {
    max-width: 800px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .game-content {
    padding: 20px 16px;
  }
  
  .roulette-wheel {
    width: 280px;
    height: 280px;
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .user-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }
  
  .numbers-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .amount-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .betting-actions {
    flex-direction: column;
  }
  
  .custom-amount {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .roulette-wheel {
    width: 240px;
    height: 240px;
  }
  
  .numbers-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .logo-text {
    display: none;
  }
  
  .betting-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

/* 탭 스타일 커스터마이징 */
:deep(.ant-tabs-card .ant-tabs-tab) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

:deep(.ant-tabs-card .ant-tabs-tab-active) {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: white;
}

:deep(.ant-tabs-content-holder) {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0 0 8px 8px;
  padding: 16px;
}
</style>