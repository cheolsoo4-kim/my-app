<template>
  <div id="app">
    <div class="game-container">
      <h1>🎰 777 룰렛 게임 (3x3)</h1>
<div class="roulette-container">
        <div class="slot-machine">
          <div 
            v-for="(slot, index) in slots" 
            :key="index" 
            class="slot" 
            :class="{ 
              spinning: isSpinning,
              highlight: winningPositions.includes(index)
            }"
          >
            <div class="slot-reel" :style="{ transform: `translateY(${slot.position}px)` }">
              <div v-for="symbol in slot.symbols" :key="symbol" class="symbol">
                {{ symbol }}
              </div>
</div>
          </div>
</div>
        
        <div class="paylines">
          <div class="payline-info">
            <h4>페이라인 (당첨선)</h4>
<div class="lines">
              <span class="line horizontal">━━━ 가로 3줄</span>
              <span class="line vertical">┃┃┃ 세로 3줄</span>
              <span class="line diagonal">╲╱ 대각선 2줄</span>
            </div>
<p>총 8개의 당첨선</p>
          </div>
</div>
        
        <div class="result-display" v-if="gameResult">
          <h2 :class="gameResult.type">{{ gameResult.message }}</h2>
<p v-if="gameResult.winningLines.length > 0" class="winning-lines">
            당첨선: {{ gameResult.winningLines.join(', ') }}
          </p>
          <p v-if="gameResult.prize">상금: {{ gameResult.prize }}원</p>
        </div>
<div class="controls">
          <div class="balance">
            <span>보유 금액: {{ balance.toLocaleString() }}원</span>
          </div>
<div class="bet-controls">
            <label>배팅 금액:</label>
            <select v-model="betAmount" :disabled="isSpinning">
              <option value="1000">1,000원</option>
              <option value="5000">5,000원</option>
              <option value="10000">10,000원</option>
              <option value="50000">50,000원</option>
            </select>
          </div>
<button @click="spin" :disabled="isSpinning || balance < betAmount" class="spin-button">
            {{ isSpinning ? '돌리는 중...' : 'SPIN!' }}
          </button>
          
          <button @click="resetGame" class="reset-button">게임 리셋</button>
        </div>
</div>
      
      <div class="rules">
        <h3>게임 규칙</h3>
<div class="rule-section">
          <h4>배당표 (각 라인당)</h4>
<ul>
            <li>🍒🍒🍒: 배팅 금액 × 50</li>
<li>🍋🍋🍋: 배팅 금액 × 30</li>
<li>🍊🍊🍊: 배팅 금액 × 20</li>
<li>⭐⭐⭐: 배팅 금액 × 100</li>
<li>7️⃣7️⃣7️⃣: 배팅 금액 × 777 (잭팟!)</li>
<li>같은 숫자 3개: 배팅 금액 × 15</li>
</ul>
          <p><strong>※ 여러 라인이 동시에 당첨되면 각각 지급!</strong></p>
        </div>
</div>
    </div>
</div>
</template>

<script>
export default {
  name: 'RouletteGame',
  data() {
    return {
      balance: 100000,
      betAmount: 1000,
      isSpinning: false,
      gameResult: null,
      winningPositions: [],
      slots: Array(9).fill(null).map(() => ({ position: 0, symbols: [] })),
      allSymbols: ['🍒', '🍋', '🍊', '⭐', '7️⃣', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      finalResults: [],
      // 페이라인 정의 (3x3 그리드에서 0-8 인덱스)
      paylines: [
        // 가로 라인
        { name: '상단 가로', positions: [0, 1, 2] },
        { name: '중간 가로', positions: [3, 4, 5] },
        { name: '하단 가로', positions: [6, 7, 8] },
        // 세로 라인
        { name: '좌측 세로', positions: [0, 3, 6] },
        { name: '중간 세로', positions: [1, 4, 7] },
        { name: '우측 세로', positions: [2, 5, 8] },
        // 대각선 라인
        { name: '좌상-우하 대각선', positions: [0, 4, 8] },
        { name: '우상-좌하 대각선', positions: [2, 4, 6] }
      ]
    }
  },
  mounted() {
    this.initializeSlots();
  },
  methods: {
    initializeSlots() {
      this.slots.forEach(slot => {
        slot.symbols = [];
        for (let i = 0; i < 50; i++) {
          slot.symbols.push(this.allSymbols[Math.floor(Math.random() * this.allSymbols.length)]);
        }
      });
    },
    
    async spin() {
      if (this.balance < this.betAmount) {
        alert('잔액이 부족합니다!');
        return;
      }
      
      this.balance -= this.betAmount;
      this.isSpinning = true;
      this.gameResult = null;
      this.winningPositions = [];
      
      // 9개 위치의 결과 미리 결정
      this.finalResults = Array(9).fill(null).map(() => this.getRandomSymbol());
      
      // 각 슬롯을 다른 시간에 멈추게 하기 (점진적으로 멈춤)
      const baseDuration = 2000;
      const spinDurations = this.slots.map((_, index) => baseDuration + (index * 200));
      
      this.slots.forEach((slot, index) => {
        this.animateSlot(slot, index, spinDurations[index]);
      });
      
      // 모든 슬롯이 멈춘 후 결과 계산
      setTimeout(() => {
        this.calculateResult();
        this.isSpinning = false;
      }, Math.max(...spinDurations) + 100);
    },
    
    animateSlot(slot, slotIndex, duration) {
      const startTime = Date.now();
      const targetPosition = this.getTargetPosition(this.finalResults[slotIndex]);
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 감속 효과
        const easeOut = 1 - Math.pow(1 - progress, 3);
        slot.position = -easeOut * targetPosition;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    },
    
    getTargetPosition(targetSymbol) {
      const symbolHeight = 60;
      const symbolIndex = this.allSymbols.indexOf(targetSymbol);
      return symbolHeight * (symbolIndex + 25); // 25는 추가 회전을 위한 오프셋
    },
    
    getRandomSymbol() {
      return this.allSymbols[Math.floor(Math.random() * this.allSymbols.length)];
    },
    
    calculateResult() {
      let totalPrize = 0;
      let winningLines = [];
      let allWinningPositions = [];
      let hasJackpot = false;
      
      // 각 페이라인 체크
      this.paylines.forEach(payline => {
        const lineSymbols = payline.positions.map(pos => this.finalResults[pos]);
        
        if (lineSymbols[0] === lineSymbols[1] && lineSymbols[1] === lineSymbols[2]) {
          // 라인 당첨!
          const symbol = lineSymbols[0];
          let multiplier = this.getSymbolMultiplier(symbol);
          
          if (symbol === '7️⃣') {
            hasJackpot = true;
          }
          
          totalPrize += this.betAmount * multiplier;
          winningLines.push(payline.name);
          allWinningPositions.push(...payline.positions);
        }
      });
      
      // 중복 제거
      this.winningPositions = [...new Set(allWinningPositions)];
      
      // 결과 메시지 생성
      let message = '';
      let type = 'lose';
      
      if (totalPrize > 0) {
        if (hasJackpot) {
          message = '🎉🎉🎉 잭팟!!! 777!!! 🎉🎉🎉';
          type = 'jackpot';
        } else if (winningLines.length > 1) {
          message = `🎊 ${winningLines.length}개 라인 동시 당첨! 🎊`;
          type = 'big-win';
        } else if (totalPrize >= this.betAmount * 50) {
          message = '🎉 대박! 🎉';
          type = 'big-win';
        } else {
          message = '🎈 당첨! 🎈';
          type = 'win';
        }
      } else {
        message = '다음 기회에!';
        type = 'lose';
      }
      
      this.balance += totalPrize;
      
      this.gameResult = {
        message,
        prize: totalPrize > 0 ? totalPrize.toLocaleString() : null,
        type,
        winningLines
      };
    },
    
    getSymbolMultiplier(symbol) {
      switch (symbol) {
        case '🍒': return 50;
        case '🍋': return 30;
        case '🍊': return 20;
        case '⭐': return 100;
        case '7️⃣': return 777;
        default: return 15; // 숫자들
      }
    },
    
    resetGame() {
      this.balance = 100000;
      this.gameResult = null;
      this.winningPositions = [];
      this.initializeSlots();
    }
  }
}
</script>

<style scoped>
#app {
  font-family: 'Arial', sans-serif;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.game-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.roulette-container {
  margin-bottom: 30px;
}

.slot-machine {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 360px;
  margin: 30px auto;
  padding: 20px;
  background: #222;
  border-radius: 15px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
}

.slot {
  width: 100px;
  height: 80px;
  background: linear-gradient(145deg, #fff, #f0f0f0);
  border: 3px solid #ffd700;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.slot.spinning {
  animation: shake 0.1s infinite;
}

.slot.highlight {
  border-color: #ff4444;
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.6);
  animation: glow 1s infinite alternate;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}

@keyframes glow {
  from { box-shadow: 0 0 10px rgba(255, 68, 68, 0.6); }
  to { box-shadow: 0 0 25px rgba(255, 68, 68, 0.8); }
}

.slot-reel {
  transition: transform 0.1s linear;
  position: relative;
}

.symbol {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  border-bottom: 1px solid #ddd;
  background: linear-gradient(145deg, #fff, #f8f8f8);
}

.paylines {
  margin: 20px 0;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
}

.payline-info h4 {
  margin-bottom: 10px;
  color: #333;
}

.lines {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.line {
  font-family: monospace;
  font-size: 1.1em;
  font-weight: bold;
  margin: 5px;
}

.line.horizontal { color: #28a745; }
.line.vertical { color: #007bff; }
.line.diagonal { color: #dc3545; }

.result-display {
  margin: 20px 0;
  padding: 20px;
  border-radius: 10px;
  font-weight: bold;
}

.winning-lines {
  font-size: 0.9em;
  color: #666;
  margin: 10px 0;
}

.result-display h2.win {
  color: #28a745;
  animation: pulse 1s infinite;
}

.result-display h2.big-win {
  color: #fd7e14;
  animation: bounce 1s infinite;
}

.result-display h2.jackpot {
  color: #dc3545;
  animation: rainbow 2s infinite;
  font-size: 2em;
}

.result-display h2.lose {
  color: #6c757d;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes rainbow {
  0% { color: #ff0000; }
  16% { color: #ff8000; }
  33% { color: #ffff00; }
  50% { color: #00ff00; }
  66% { color: #0080ff; }
  83% { color: #8000ff; }
  100% { color: #ff0000; }
}

.controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
}

.balance {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.bet-controls {
  margin: 15px 0;
}

.bet-controls label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.bet-controls select {
  padding: 8px 15px;
  border-radius: 5px;
  border: 2px solid #ddd;
  font-size: 1em;
}

.spin-button, .reset-button {
  padding: 15px 30px;
  font-size: 1.2em;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin: 10px 5px;
  transition: all 0.3s ease;
}

.spin-button {
  background: linear-gradient(145deg, #28a745, #20c997);
  color: white;
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

.spin-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(40, 167, 69, 0.6);
}

.spin-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-button {
  background: linear-gradient(145deg, #6c757d, #495057);
  color: white;
}

.reset-button:hover {
  background: linear-gradient(145deg, #5a6268, #343a40);
  transform: translateY(-2px);
}

.rules {
  background: #e9ecef;
  padding: 20px;
  border-radius: 10px;
  text-align: left;
}

.rules h3 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.rule-section h4 {
  color: #333;
  margin-bottom: 10px;
}

.rules ul {
  list-style: none;
  padding: 0;
  margin-bottom: 15px;
}

.rules li {
  padding: 5px 0;
  border-bottom: 1px solid #dee2e6;
  font-weight: bold;
}

.rules li:last-child {
  border-bottom: none;
}

.rules p {
  text-align: center;
  font-weight: bold;
  color: #dc3545;
}

@media (max-width: 600px) {
  .slot-machine {
    max-width: 300px;
    gap: 5px;
    padding: 15px;
  }
  
  .slot {
    width: 80px;
    height: 70px;
  }
  
  .symbol {
    height: 50px;
    font-size: 1.5em;
  }
  
  .lines {
    flex-direction: column;
    align-items: center;
  }
}
</style>