<template>
  <div class="qplay-container" :class="{ shake: isShaking }">
    <!-- 배경 효과 -->
    <div class="background-overlay"></div>
<!-- 비 효과 -->
    <div v-if="showRain" class="rain-container">
      <div v-for="n in 50" :key="n" class="raindrop" :style="getRainStyle(n)"></div>
</div>
    
    <!-- 폭죽 효과 -->
    <canvas 
      v-if="showFireworks" 
      ref="fireworksCanvas" 
      class="fireworks-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>

    <!-- 헤더 -->
    <div class="qplay-header">
      <div class="logo">
        <h1>정보기기 운용기능사</h1>
</div>
      <div v-if="gameStarted && !gameFinished" class="game-info">
        <div class="question-counter">
          <span class="current">{{ currentQuestionIndex + 1 }}</span>
          <span class="divider">/</span>
          <span class="total">10</span>
        </div>
<div class="score-display">
          점수: {{ score }}
        </div>
</div>
    </div>
<!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 시작 화면 -->
      <div v-if="!gameStarted && !gameFinished" class="lobby-screen">
        <div class="lobby-card">
          <div class="game-title">
            <h2>정보기기 운용기능사 퀴즈</h2>
<p class="subtitle">실전 문제로 실력을 테스트해보세요!</p>
          </div>
<div class="game-info-grid">
            <div class="info-item">
              <div class="info-icon">📚</div>
<div class="info-text">
                <h3>총 200문제</h3>
<p>최신 출제 경향 반영</p>
              </div>
</div>
            <div class="info-item">
              <div class="info-icon">⏰</div>
<div class="info-text">
                <h3>10초 제한</h3>
<p>실전과 동일한 시간</p>
              </div>
</div>
            <div class="info-item">
              <div class="info-icon">🎯</div>
<div class="info-text">
                <h3>10문제 출제</h3>
<p>랜덤 선별 문제</p>
              </div>
</div>
          </div>
<button class="start-button" @click="startGame">
            <span class="button-text">게임 시작</span>
            <span class="button-icon">▶️</span>
          </button>
        </div>
</div>

      <!-- 퀴즈 화면 -->
      <div v-else-if="gameStarted && !gameFinished" class="game-screen">
        <!-- 진행률 바 -->
        <div class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: ((currentQuestionIndex + 1) / 10) * 100 + '%' }"
            ></div>
</div>
          <div class="progress-text">{{ currentQuestionIndex + 1 }}/10</div>
</div>

        <!-- 타이머 -->
        <div class="timer-section" :class="{ 'timer-warning': timeLeft <= 3 }">
          <div class="timer-circle">
            <div class="timer-inner">
              <span class="timer-number">{{ timeLeft }}</span>
            </div>
<svg class="timer-ring" width="80" height="80">
              <circle cx="40" cy="40" r="36" 
                      fill="none" 
                      stroke="#e0e0e0" 
                      stroke-width="4"/>
              <circle cx="40" cy="40" r="36" 
                      fill="none" 
                      :stroke="timeLeft <= 3 ? '#ff4757' : '#5352ed'" 
                      stroke-width="4"
                      stroke-linecap="round"
                      :stroke-dasharray="circumference"
                      :stroke-dashoffset="strokeDashoffset"
                      class="progress-ring"/>
            </svg>
          </div>
</div>

        <!-- 문제 카드 -->
        <div class="question-card" :class="{ 'answer-revealed': showResult }">
          <div class="question-header">
            <span class="question-label">문제</span>
            <span class="question-number">Q{{ currentQuestionIndex + 1 }}</span>
          </div>
<div class="question-content">
            <h3 class="question-text">{{ currentQuestion?.question }}</h3>
</div>
        </div>
<!-- 선택지 -->
        <div class="options-container">
          <div 
            v-for="(option, index) in shuffledOptions" 
            :key="index"
            class="option-card"
            :class="{
              'selected': selectedAnswer === index,
              'correct': showResult && index === correctAnswerIndex,
              'incorrect': showResult && selectedAnswer === index && index !== correctAnswerIndex,
              'disabled': showResult
            }"
            @click="selectAnswer(index)"
          >
            <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
<div class="option-text">{{ option }}</div>
<div class="option-indicator">
              <span v-if="showResult && index === correctAnswerIndex" class="correct-icon">✓</span>
              <span v-else-if="showResult && selectedAnswer === index && index !== correctAnswerIndex" class="incorrect-icon">✗</span>
            </div>
</div>
        </div>
</div>

      <!-- 결과 화면 -->
      <div v-else-if="gameFinished" class="result-screen">
        <div class="result-card">
          <div class="result-header">
            <div class="result-icon" :class="getResultIconClass()">
              {{ getResultIcon() }}
            </div>
<h2 class="result-title">{{ getResultTitle() }}</h2>
<div class="final-score">
              <span class="score-number">{{ score }}</span>
              <span class="score-total">/10</span>
            </div>
<div class="accuracy-rate">정답률 {{ Math.round((score / 10) * 100) }}%</div>
</div>

          <div class="result-stats">
            <div class="stat-item correct">
              <div class="stat-number">{{ score }}</div>
<div class="stat-label">정답</div>
</div>
            <div class="stat-item incorrect">
              <div class="stat-number">{{ 10 - score }}</div>
<div class="stat-label">오답</div>
</div>
            <div class="stat-item grade">
              <div class="stat-number">{{ getGradeText() }}</div>
<div class="stat-label">등급</div>
</div>
          </div>
<div class="review-section">
            <h3 class="review-title">문제 리뷰</h3>
<div class="review-list">
              <div v-for="(result, index) in quizResults" :key="index" class="review-item">
                <div class="review-number">{{ index + 1 }}</div>
<div class="review-content">
                  <div class="review-question">{{ result.question }}</div>
<div class="review-answers">
                    <div class="my-answer" :class="{ correct: result.correct, incorrect: !result.correct }">
                      내 답: {{ result.userAnswer || '시간초과' }}
                    </div>
<div class="correct-answer">
                      정답: {{ result.correctAnswer }}
                    </div>
</div>
                </div>
<div class="review-status">
                  <span class="status-icon" :class="{ correct: result.correct, incorrect: !result.correct }">
                    {{ result.correct ? '✓' : '✗' }}
                  </span>
                </div>
</div>
            </div>
</div>

          <div class="result-actions">
            <button class="retry-button" @click="restartGame">
              <span class="button-icon">🔄</span>
              <span class="button-text">다시 도전</span>
            </button>
          </div>
</div>
      </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
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
let fireworksParticles = [];

// computed
const currentQuestion = computed(() => {
  if (selectedQuestions.value.length === 0) return null;
  return selectedQuestions.value[currentQuestionIndex.value];
});

const circumference = 226;
const strokeDashoffset = computed(() => {
  const offset = circumference - (timeLeft.value / 10) * circumference;
  return offset;
});

// 폭죽 효과 클래스들 (이전과 동일)
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
      this.x += this.vx;
      this.y += this.vy;
      
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 10) {
        this.trail.shift();
      }
      
      const distance = Math.sqrt((this.targetX - this.x) ** 2 + (this.targetY - this.y) ** 2);
      if (distance < 10) {
        this.explode();
      }
    } else {
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
  }

  draw(ctx) {
    if (!this.exploded) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      for (let i = 0; i < this.trail.length; i++) {
        const alpha = i / this.trail.length;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else {
      this.particles.forEach(particle => particle.draw(ctx));
    }
  }

  isDead() {
    return this.exploded && this.particles.length === 0;
  }
}

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
  
  const shuffledQuestions = shuffleArray(quizData).slice(0, 10);
  selectedQuestions.value = shuffledQuestions;
  
  setupCurrentQuestion();
  startTimer();
};

const setupCurrentQuestion = () => {
  if (!currentQuestion.value) return;
  
  selectedAnswer.value = null;
  showResult.value = false;
  
  const question = currentQuestion.value;
  const optionsWithIndex = question.options.map((option, index) => ({ option, originalIndex: index }));
  const shuffled = shuffleArray(optionsWithIndex);
  
  shuffledOptions.value = shuffled.map(item => item.option);
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
  
  quizResults.value.push({
    question: currentQuestion.value.question,
    userAnswer: shuffledOptions.value[index],
    correctAnswer: currentQuestion.value.options[currentQuestion.value.correct],
    correct: isCorrect
  });
  
  showResult.value = true;
  
  setTimeout(() => {
    nextQuestion();
  }, 2500);
};

const handleTimeUp = () => {
  showIncorrectEffect();
  
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
  
  const createFirework = () => {
    const startX = Math.random() * canvas.width * 0.2 + canvas.width * 0.4;
    const startY = canvas.height;
    const targetX = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
    const targetY = Math.random() * canvas.height * 0.3 + canvas.height * 0.1;
    
    fireworksParticles.push(new Firework(startX, startY, targetX, targetY));
  };
  
  for (let i = 0; i < 8; i++) {
    setTimeout(createFirework, i * 100);
  }
  
  const animate = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (Math.random() < 0.05 && fireworksParticles.length < 8) {
      createFirework();
    }
    
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

const getResultIcon = () => {
  if (score.value >= 9) return '🏆';
  if (score.value >= 7) return '🥇';
  if (score.value >= 5) return '🥈';
  if (score.value >= 3) return '🥉';
  return '📚';
};

const getResultIconClass = () => {
  if (score.value >= 9) return 'excellent';
  if (score.value >= 7) return 'good';
  if (score.value >= 5) return 'average';
  if (score.value >= 3) return 'poor';
  return 'bad';
};

const getResultTitle = () => {
  if (score.value >= 9) return '완벽해요!';
  if (score.value >= 7) return '잘했어요!';
  if (score.value >= 5) return '보통이에요';
  if (score.value >= 3) return '더 노력해요';
  return '다시 도전해보세요';
};

const getGradeText = () => {
  if (score.value >= 9) return 'A+';
  if (score.value >= 8) return 'A';
  if (score.value >= 7) return 'B+';
  if (score.value >= 6) return 'B';
  if (score.value >= 5) return 'C+';
  if (score.value >= 4) return 'C';
  return 'D';
};

// 생명주기
onMounted(() => {
  const updateCanvasSize = () => {
    canvasWidth.value = window.innerWidth;
    canvasHeight.value = window.innerHeight;
  };
  
  window.addEventListener('resize', updateCanvasSize);
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateCanvasSize);
    if (timer.value) clearInterval(timer.value);
    hideEffects();
  });
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
  hideEffects();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.qplay-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.qplay-container.shake {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 48, 0.3) 0%, transparent 50%);
  pointer-events: none;
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

/* 비 효과 */
.rain-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
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

/* 헤더 */
.qplay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.logo h1 {
  margin: 0;
  font-size: 1.5em;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.game-info {
  display: flex;
  gap: 30px;
  align-items: center;
}

.question-counter {
  font-size: 1.2em;
  font-weight: 600;
  color: white;
}

.question-counter .current {
  font-size: 1.4em;
  color: #ffd700;
}

.question-counter .divider {
  margin: 0 5px;
  opacity: 0.7;
}

.score-display {
  font-size: 1.1em;
  font-weight: 600;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
}

/* 메인 컨테이너 */
.main-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: calc(100vh - 80px);
}

/* 로비 화면 */
.lobby-screen {
  width: 100%;
  max-width: 500px;
}

.lobby-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  text-align: center;
}

.game-title h2 {
  margin: 0 0 10px 0;
  font-size: 2.2em;
  font-weight: 700;
  color: #2c3e50;
}

.subtitle {
  margin: 0 0 30px 0;
  color: #7f8c8d;
  font-size: 1.1em;
}

.game-info-grid {
  display: grid;
  gap: 20px;
  margin: 30px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
}

.info-icon {
  font-size: 2em;
}

.info-text h3 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
  font-weight: 600;
  color: #2c3e50;
}

.info-text p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9em;
}

.start-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.3em;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

/* 게임 화면 */
.game-screen {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 진행률 */
.progress-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d2ff, #3a7bd5);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-weight: 600;
  color: white;
  font-size: 1.1em;
}

/* 타이머 */
.timer-section {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.timer-section.timer-warning {
  animation: timerPulse 0.5s infinite;
}

@keyframes timerPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.timer-circle {
  position: relative;
  width: 80px;
  height: 80px;
}

.timer-ring {
  transform: rotate(-90deg);
  position: absolute;
  top: 0;
  left: 0;
}

.progress-ring {
  transition: stroke-dashoffset 1s linear;
}

.timer-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.timer-number {
  font-size: 1.8em;
  font-weight: 700;
  color: #2c3e50;
}

/* 문제 카드 */
.question-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.question-card.answer-revealed {
  background: rgba(255, 255, 255, 1);
}

.question-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 15px;
}

.question-label {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
}

.question-number {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1em;
  margin-left: auto;
}

.question-content h3 {
  margin: 0;
  font-size: 1.3em;
  line-height: 1.5;
  color: #2c3e50;
  font-weight: 600;
}

/* 선택지 */
.options-container {
  display: grid;
  gap: 12px;
}

.option-card {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.option-card:hover:not(.disabled) {
  background: rgba(255, 255, 255, 1);
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.option-card.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.option-card.correct {
  border-color: #27ae60;
  background: #d5f4e6;
  animation: correctPulse 0.6s ease;
}

.option-card.incorrect {
  border-color: #e74c3c;
  background: #fdeaea;
  animation: incorrectShake 0.6s ease;
}

.option-card.disabled {
  cursor: not-allowed;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes incorrectShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.option-letter {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 1.1em;
  flex-shrink: 0;
}

.option-card.correct .option-letter {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.option-card.incorrect .option-letter {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.option-text {
  flex: 1;
  font-size: 1.1em;
  color: #2c3e50;
  font-weight: 500;
}

.option-indicator {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
}

.correct-icon {
  color: #27ae60;
}

.incorrect-icon {
  color: #e74c3c;
}

/* 결과 화면 */
.result-screen {
  width: 100%;
  max-width: 700px;
}

.result-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
}

.result-icon {
  font-size: 4em;
  margin-bottom: 15px;
  display: block;
}

.result-icon.excellent { filter: drop-shadow(0 0 20px gold); }
.result-icon.good { filter: drop-shadow(0 0 15px silver); }
.result-icon.average { filter: drop-shadow(0 0 10px orange); }

.result-title {
  margin: 0 0 20px 0;
  font-size: 2.2em;
  font-weight: 700;
  color: #2c3e50;
}

.final-score {
  margin-bottom: 10px;
}

.score-number {
  font-size: 3em;
  font-weight: 800;
  color: #667eea;
}

.score-total {
  font-size: 2em;
  color: #95a5a6;
  margin-left: 5px;
}

.accuracy-rate {
  font-size: 1.3em;
  color: #7f8c8d;
  font-weight: 600;
}

.result-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin: 30px 0;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 16px;
}

.stat-item.correct {
  background: #d5f4e6;
  color: #27ae60;
}

.stat-item.incorrect {
  background: #fdeaea;
  color: #e74c3c;
}

.stat-item.grade {
  background: #e8f4fd;
  color: #667eea;
}

.stat-number {
  font-size: 2em;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1em;
  font-weight: 600;
  opacity: 0.8;
}

/* 리뷰 섹션 */
.review-section {
  margin: 30px 0;
}

.review-title {
  margin: 0 0 20px 0;
  font-size: 1.4em;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
}

.review-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.review-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-radius: 12px;
  background: #f8f9fa;
  margin-bottom: 10px;
}

.review-number {
  width: 30px;
  height: 30px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  flex-shrink: 0;
}

.review-content {
  flex: 1;
}

.review-question {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.95em;
}

.review-answers {
  font-size: 0.9em;
}

.my-answer {
  margin-bottom: 4px;
}

.my-answer.correct {
  color: #27ae60;
  font-weight: 600;
}

.my-answer.incorrect {
  color: #e74c3c;
  font-weight: 600;
}

.correct-answer {
  color: #27ae60;
  font-weight: 600;
}

.review-status {
  display: flex;
  align-items: center;
}

.status-icon {
  font-size: 1.5em;
  font-weight: bold;
}

.status-icon.correct {
  color: #27ae60;
}

.status-icon.incorrect {
  color: #e74c3c;
}

.result-actions {
  text-align: center;
  margin-top: 30px;
}

.retry-button {
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.2em;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

/* 반응형 */
@media (max-width: 768px) {
  .qplay-header {
    padding: 15px 20px;
  }
  
  .logo h1 {
    font-size: 1.2em;
  }
  
  .game-info {
    gap: 15px;
  }
  
  .main-container {
    padding: 15px;
  }
  
  .lobby-card {
    padding: 30px 25px;
  }
  
  .game-title h2 {
    font-size: 1.8em;
  }
  
  .result-stats {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .review-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .review-number {
    align-self: flex-start;
  }
}
</style>