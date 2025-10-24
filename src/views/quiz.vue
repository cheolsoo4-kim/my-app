<template>
  <div class="quiz-container" :class="{ shake: isShaking }">
    <!-- 비 효과 -->
    <div v-if="showRain" class="rain-container">
      <div v-for="n in 50" :key="n" class="raindrop" :style="getRainStyle(n)"></div>
</div>
    
    <!-- 개선된 폭죽 효과 -->
    <canvas 
      v-if="showFireworks" 
      ref="fireworksCanvas" 
      class="fireworks-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>

    <a-card class="quiz-card" :class="{ 'sad-mode': showRain }">
      <!-- 시작 화면 -->
      <div v-if="!gameStarted && !gameFinished" class="start-screen">
        <h1 class="quiz-title">정보기기 운용기능사 퀴즈</h1>
<p class="quiz-description">
          총 200개 문제 중 10문제가 랜덤으로 출제됩니다<br>
          각 문제당 10초 제한
        </p>
        <a-button type="primary" size="large" @click="startGame">
          퀴즈 시작
        </a-button>
      </div>
<!-- 퀴즈 화면 -->
      <div v-else-if="gameStarted && !gameFinished" class="quiz-screen">
        <div class="quiz-header">
          <a-progress 
            :percent="(currentQuestionIndex + 1) * 10" 
            :show-info="false"
            stroke-color="#1890ff"
          />
          <div class="quiz-info">
            <span class="question-counter">문제 {{ currentQuestionIndex + 1 }} / 10</span>
            
            <!-- 바 형태 타이머 -->
            <div class="timer-container" :class="{ 'timer-warning': timeLeft <= 3 }">
              <div class="timer-bar-wrapper">
                <div class="timer-bar">
                  <div 
                    class="timer-fill" 
                    :style="{ 
                      width: timerPercent + '%',
                      backgroundColor: getTimerColor()
                    }"
                  ></div>
<div class="timer-segments">
                    <div v-for="n in 9" :key="n" class="segment-line"></div>
</div>
                </div>
<div class="timer-glow" :style="{ width: timerPercent + '%' }"></div>
</div>
              <div class="timer-text" :class="{ 'pulse': timeLeft <= 3 }">
                <span class="timer-icon">⏱️</span>
                {{ timeLeft }}초
              </div>
</div>
          </div>
</div>

        <div class="question-section">
          <h2 class="question-text">{{ currentQuestion.question }}</h2>
<div class="options-grid">
            <a-button
              v-for="(option, index) in shuffledOptions"
              :key="index"
              class="option-button"
              :class="{
                'selected': selectedAnswer === index,
                'correct': showResult && index === correctAnswerIndex,
                'incorrect': showResult && selectedAnswer === index && index !== correctAnswerIndex
              }"
              :disabled="showResult"
              @click="selectAnswer(index)"
              block
            >
              {{ String.fromCharCode(65 + index) }}. {{ option }}
            </a-button>
          </div>
</div>
      </div>
<!-- 결과 화면 -->
      <div v-else-if="gameFinished" class="result-screen">
        <div class="result-header">
          <h1 class="result-title">퀴즈 완료!</h1>
<div class="score-display">
            <a-statistic
              title="최종 점수"
              :value="score"
              suffix="/ 10"
              :value-style="{ color: score >= 7 ? '#3f8600' : score >= 5 ? '#faad14' : '#cf1322' }"
            />
          </div>
<div class="score-percentage">
            정답률: {{ Math.round((score / 10) * 100) }}%
          </div>
<div class="grade-badge">
            <a-tag :color="getGradeColor()" size="large">{{ getGradeText() }}</a-tag>
          </div>
</div>

        <a-divider />

        <div class="answers-review">
          <h3>정답 확인</h3>
<div v-for="(result, index) in quizResults" :key="index" class="answer-item">
            <div class="question-review">
              <span class="question-number">Q{{ index + 1 }}.</span>
              <span class="question-text-small">{{ result.question }}</span>
              <a-tag :color="result.correct ? 'green' : 'red'">
                {{ result.correct ? '정답' : '오답' }}
              </a-tag>
            </div>
<div class="answer-details">
              <div class="user-answer">
                내 답: {{ result.userAnswer || '시간초과' }}
              </div>
<div class="correct-answer">
                정답: {{ result.correctAnswer }}
              </div>
</div>
          </div>
</div>

        <div class="restart-section">
          <a-button type="primary" size="large" @click="restartGame">
            다시 시작
          </a-button>
        </div>
</div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { quizData } from './quiz-data.js';

// 반응형 데이터
const gameStarted = ref(false);
const gameFinished = ref(false);
const currentQuestionIndex = ref(0);
const selectedQuestions = ref([]);
const selectedAnswer = ref(null);
const showResult = ref(false);
const timeLeft = ref(10);
const timer = ref(null);
const score = ref(0);
const quizResults = ref([]);
const shuffledOptions = ref([]);
const correctAnswerIndex = ref(0);
const showFireworks = ref(false);
const showRain = ref(false);
const isShaking = ref(false);

// 캔버스 관련
const fireworksCanvas = ref(null);
const canvasWidth = ref(window.innerWidth);
const canvasHeight = ref(window.innerHeight);
let fireworksInterval = null;
let fireworksParticles = [];

// computed - 타이머 바를 위한 계산
const timerPercent = computed(() => {
  return (timeLeft.value / 10) * 100;
});

const currentQuestion = computed(() => {
  if (selectedQuestions.value.length === 0) return null;
  return selectedQuestions.value[currentQuestionIndex.value];
});

// 타이머 색상 변경 함수
const getTimerColor = () => {
  const percent = timerPercent.value;
  if (percent > 60) return '#52c41a'; // 초록색
  if (percent > 30) return '#faad14'; // 주황색
  return '#ff4d4f'; // 빨간색
};

// 폭죽 파티클 클래스
class FireworkParticle {
  constructor(x, y, color, velocity, gravity = 0.02) {
    this.x = x;
    this.y = y;
    this.vx = velocity.x;
    this.vy = velocity.y;
    this.color = color;
    this.gravity = gravity;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.01;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.alpha -= this.decay;
    this.size *= 0.98;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.alpha <= 0 || this.size <= 0.1;
  }
}

// 폭죽 발사체 클래스
class Firework {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    
    const distance = Math.sqrt((targetX - x) ** 2 + (targetY - y) ** 2);
    this.vx = (targetX - x) / distance * 5;
    this.vy = (targetY - y) / distance * 5;
    
    this.exploded = false;
    this.particles = [];
    this.trail = [];
    this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
  }

  update() {
    if (!this.exploded) {
      // 발사체 이동
      this.x += this.vx;
      this.y += this.vy;
      
      // 궤적 추가
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 10) {
        this.trail.shift();
      }
      
      // 목표 지점 도달 확인
      const distance = Math.sqrt((this.targetX - this.x) ** 2 + (this.targetY - this.y) ** 2);
      if (distance < 10) {
        this.explode();
      }
    } else {
      // 파티클 업데이트
      for (let i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].update();
        if (this.particles[i].isDead()) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  explode() {
    this.exploded = true;
    const particleCount = Math.random() * 30 + 50;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = Math.random() * 6 + 2;
      
      const particle = new FireworkParticle(
        this.x,
        this.y,
        `hsl(${Math.random() * 60 + (Math.random() * 360)}, 100%, ${Math.random() * 30 + 60}%)`,
        {
          x: Math.cos(angle) * velocity * (Math.random() * 0.5 + 0.5),
          y: Math.sin(angle) * velocity * (Math.random() * 0.5 + 0.5)
        }
      );
      
      this.particles.push(particle);
    }
    
    // 별 모양 파티클 추가
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const velocity = Math.random() * 4 + 3;
      
      const starParticle = new FireworkParticle(
        this.x,
        this.y,
        this.color,
        {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity
        },
        0.01
      );
      
      this.particles.push(starParticle);
    }
  }

  draw(ctx) {
    if (!this.exploded) {
      // 발사체 그리기
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // 궤적 그리기
      for (let i = 0; i < this.trail.length; i++) {
        const alpha = i / this.trail.length;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else {
      // 파티클 그리기
      this.particles.forEach(particle => particle.draw(ctx));
    }
  }

  isDead() {
    return this.exploded && this.particles.length === 0;
  }
}

// 창 크기 변경 감지
onMounted(() => {
  const updateCanvasSize = () => {
    canvasWidth.value = window.innerWidth;
    canvasHeight.value = window.innerHeight;
  };
  
  window.addEventListener('resize', updateCanvasSize);
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateCanvasSize);
  });
});

// 메서드
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const startGame = () => {
  gameStarted.value = true;
  gameFinished.value = false;
  score.value = 0;
  quizResults.value = [];
  currentQuestionIndex.value = 0;
  
  // 문제 섞기 (10개 선택)
  const shuffledQuestions = shuffleArray(quizData).slice(0, 10);
  selectedQuestions.value = shuffledQuestions;
  
  setupCurrentQuestion();
  startTimer();
};

const setupCurrentQuestion = () => {
  if (!currentQuestion.value) return;
  
  selectedAnswer.value = null;
  showResult.value = false;
  
  // 보기 섞기
  const question = currentQuestion.value;
  const optionsWithIndex = question.options.map((option, index) => ({ option, originalIndex: index }));
  const shuffled = shuffleArray(optionsWithIndex);
  
  shuffledOptions.value = shuffled.map(item => item.option);
  
  // 정답의 새로운 위치 찾기
  correctAnswerIndex.value = shuffled.findIndex(item => item.originalIndex === question.correct);
};

const startTimer = () => {
  timeLeft.value = 10;
  timer.value = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(timer.value);
      handleTimeUp();
    }
  }, 1000);
};

const selectAnswer = (index) => {
  if (showResult.value) return;
  
  selectedAnswer.value = index;
  clearInterval(timer.value);
  
  const isCorrect = index === correctAnswerIndex.value;
  
  if (isCorrect) {
    score.value++;
    showCorrectEffect();
  } else {
    showIncorrectEffect();
  }
  
  // 결과 저장
  quizResults.value.push({
    question: currentQuestion.value.question,
    userAnswer: shuffledOptions.value[index],
    correctAnswer: currentQuestion.value.options[currentQuestion.value.correct],
    correct: isCorrect
  });
  
  showResult.value = true;
  
  setTimeout(() => {
    nextQuestion();
  }, 3000); // 폭죽 효과를 더 오래 보여주기 위해 3초로 연장
};

const handleTimeUp = () => {
  showIncorrectEffect();
  
  // 시간 초과 결과 저장
  quizResults.value.push({
    question: currentQuestion.value.question,
    userAnswer: null,
    correctAnswer: currentQuestion.value.options[currentQuestion.value.correct],
    correct: false
  });
  
  showResult.value = true;
  
  setTimeout(() => {
    nextQuestion();
  }, 2000);
};

const nextQuestion = () => {
  hideEffects();
  
  if (currentQuestionIndex.value < 9) {
    currentQuestionIndex.value++;
    setupCurrentQuestion();
    startTimer();
  } else {
    finishGame();
  }
};

const finishGame = () => {
  gameStarted.value = false;
  gameFinished.value = true;
  hideEffects();
};

const restartGame = () => {
  gameFinished.value = false;
  startGame();
};

// 개선된 폭죽 효과
const showCorrectEffect = () => {
  showFireworks.value = true;
  nextTick(() => {
    startFireworks();
  });
};

const startFireworks = () => {
  const canvas = fireworksCanvas.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  fireworksParticles = [];
  
  // 여러 개의 폭죽 생성
  const createFirework = () => {
    const startX = Math.random() * canvas.width * 0.2 + canvas.width * 0.4;
    const startY = canvas.height;
    const targetX = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
    const targetY = Math.random() * canvas.height * 0.3 + canvas.height * 0.1;
    
    fireworksParticles.push(new Firework(startX, startY, targetX, targetY));
  };
  
  // 초기 폭죽 생성
  for (let i = 0; i < 5; i++) {
    setTimeout(createFirework, i * 200);
  }
  
  // 애니메이션 루프
  const animate = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 새로운 폭죽 랜덤 생성
    if (Math.random() < 0.05 && fireworksParticles.length < 8) {
      createFirework();
    }
    
    // 폭죽 업데이트 및 그리기
    for (let i = fireworksParticles.length - 1; i >= 0; i--) {
      fireworksParticles[i].update();
      fireworksParticles[i].draw(ctx);
      
      if (fireworksParticles[i].isDead()) {
        fireworksParticles.splice(i, 1);
      }
    }
    
    if (showFireworks.value) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
};

const showIncorrectEffect = () => {
  showRain.value = true;
  isShaking.value = true;
  
  setTimeout(() => {
    isShaking.value = false;
  }, 1000);
};

const hideEffects = () => {
  showFireworks.value = false;
  showRain.value = false;
  isShaking.value = false;
  fireworksParticles = [];
};

const getRainStyle = (n) => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${0.5 + Math.random() * 0.5}s`
  };
};

const getGradeText = () => {
  if (score.value >= 9) return '최우수';
  if (score.value >= 8) return '우수';
  if (score.value >= 7) return '양호';
  if (score.value >= 5) return '보통';
  if (score.value >= 3) return '미흡';
  return '부족';
};

const getGradeColor = () => {
  if (score.value >= 8) return 'green';
  if (score.value >= 6) return 'blue';
  if (score.value >= 4) return 'orange';
  return 'red';
};

// 생명주기
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  hideEffects();
});
</script>

<style scoped>
.quiz-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.quiz-container.shake {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.quiz-card {
  width: 100%;
  max-width: 800px;
  min-height: 500px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  transition: all 0.3s ease;
}

.quiz-card.sad-mode {
  background: rgba(200, 200, 220, 0.95) !important;
  filter: grayscale(30%);
}

/* 폭죽 캔버스 */
.fireworks-canvas {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1000;
  background: transparent;
}

/* 시작 화면 */
.start-screen {
  text-align: center;
  padding: 60px 0;
}

.quiz-title {
  font-size: 2.5em;
  color: #1890ff;
  margin-bottom: 20px;
  font-weight: bold;
}

.quiz-description {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

/* 퀴즈 화면 */
.quiz-screen {
  padding: 20px;
}

.quiz-header {
  margin-bottom: 30px;
}

.quiz-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.question-counter {
  font-weight: bold;
  color: #1890ff;
}

/* 바 형태 타이머 */
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
}

.timer-container.timer-warning {
  animation: warningPulse 0.8s infinite;
}

@keyframes warningPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.timer-bar-wrapper {
  position: relative;
  width: 180px;
  height: 20px;
  margin-bottom: 8px;
}

.timer-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  border-radius: 10px;
  border: 2px solid #d0d0d0;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.timer-fill {
  height: 100%;
  background: linear-gradient(45deg, #52c41a, #73d13d);
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.timer-fill::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.3) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.timer-segments {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10%;
}

.segment-line {
  width: 2px;
  height: 80%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
}

.timer-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  height: calc(100% + 4px);
  background: linear-gradient(45deg, #52c41a, #73d13d);
  border-radius: 12px;
  filter: blur(4px);
  opacity: 0.5;
  z-index: -1;
  transition: all 0.3s ease;
}

.timer-text {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  font-size: 14px;
  color: #1890ff;
  transition: all 0.3s ease;
}

.timer-text.pulse {
  color: #ff4d4f;
  font-size: 16px;
  animation: pulse 0.6s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.timer-icon {
  font-size: 16px;
  animation: tick 1s infinite;
}

@keyframes tick {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.question-section {
  text-align: center;
}

.question-text {
  font-size: 1.4em;
  margin-bottom: 30px;
  color: #333;
  line-height: 1.6;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.option-button {
  height: auto;
  min-height: 60px;
  padding: 15px;
  font-size: 1.1em;
  text-align: left;
  border-radius: 10px;
  border: 2px solid #d9d9d9;
  transition: all 0.3s ease;
  background: white;
}

.option-button:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.option-button.selected {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.option-button.correct {
  border-color: #52c41a;
  background-color: #f6ffed;
  animation: correctPulse 1s ease;
}

.option-button.incorrect {
  border-color: #ff4d4f;
  background-color: #fff2f0;
  animation: incorrectPulse 0.5s ease;
}

@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes incorrectPulse {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 결과 화면 */
.result-screen {
  padding: 20px;
  text-align: center;
}

.result-header {
  margin-bottom: 30px;
}

.result-title {
  font-size: 2.2em;
  color: #1890ff;
  margin-bottom: 20px;
}

.score-display {
  margin: 20px 0;
}

.score-percentage {
  font-size: 1.3em;
  font-weight: bold;
  color: #666;
  margin-bottom: 10px;
}

.grade-badge {
  margin: 10px 0;
}

.answers-review {
  text-align: left;
  margin-bottom: 30px;
  max-height: 400px;
  overflow-y: auto;
}

.answers-review h3 {
  font-size: 1.4em;
  color: #1890ff;
  margin-bottom: 20px;
  text-align: center;
}

.answer-item {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 10px;
  background: #fafafa;
  border-left: 4px solid #1890ff;
}

.question-review {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.question-number {
  font-weight: bold;
  color: #1890ff;
  min-width: 30px;
}

.question-text-small {
  flex: 1;
  font-size: 0.9em;
}

.answer-details {
  padding-left: 40px;
  font-size: 0.9em;
}

.user-answer {
  color: #666;
  margin-bottom: 5px;
}

.correct-answer {
  color: #52c41a;
  font-weight: bold;
}

.restart-section {
  margin-top: 30px;
}

/* 비 효과 */
.rain-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.raindrop {
  position: absolute;
  top: -10px;
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, transparent, #4dabf7);
  animation: rain-fall linear infinite;
}

@keyframes rain-fall {
  to {
    transform: translateY(100vh);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .quiz-container {
    padding: 10px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .question-text {
    font-size: 1.2em;
  }
  
  .quiz-title {
    font-size: 2em;
  }
  
  .timer-bar-wrapper {
    width: 150px;
  }
  
  .answers-review {
    max-height: 300px;
  }
}
</style>