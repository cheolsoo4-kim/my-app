<template>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <h1>📊 Dashboard</h1>
<div class="user-info">
        <span>Welcome, {{ userName }}</span>
        <div class="current-time">{{ currentTime }}</div>
</div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.id">
          <div class="stat-icon">{{ stat.icon }}</div>
<div class="stat-info">
            <h3>{{ stat.value }}</h3>
<p>{{ stat.label }}</p>
            <span class="stat-change" :class="stat.trend">
              {{ stat.change }}
            </span>
          </div>
</div>
      </div>
<!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <h3>월별 매출</h3>
<div class="chart">
            <div class="bar-chart">
              <div 
                v-for="(item, index) in chartData" 
                :key="index"
                class="bar"
                :style="{ height: item.height + '%' }"
              >
                <span class="bar-label">{{ item.month }}</span>
                <span class="bar-value">{{ item.value }}M</span>
              </div>
</div>
          </div>
</div>

        <div class="progress-container">
          <h3>목표 달성률</h3>
<div class="progress-list">
            <div v-for="goal in goals" :key="goal.id" class="progress-item">
              <div class="progress-info">
                <span>{{ goal.title }}</span>
                <span>{{ goal.percentage }}%</span>
              </div>
<div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: goal.percentage + '%' }"
                ></div>
</div>
            </div>
</div>
        </div>
</div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h3>최근 활동</h3>
<div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">{{ activity.icon }}</div>
<div class="activity-content">
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
</div>
        </div>
</div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      userName: 'John Doe',
      currentTime: '',
      stats: [
        {
          id: 1,
          icon: '💰',
          value: '₩125M',
          label: '총 매출',
          change: '+12.5%',
          trend: 'positive'
        },
        {
          id: 2,
          icon: '👥',
          value: '1,234',
          label: '총 사용자',
          change: '+8.3%',
          trend: 'positive'
        },
        {
          id: 3,
          icon: '📦',
          value: '456',
          label: '주문 수',
          change: '-2.1%',
          trend: 'negative'
        },
        {
          id: 4,
          icon: '📈',
          value: '89.5%',
          label: '전환율',
          change: '+5.2%',
          trend: 'positive'
        }
      ],
      chartData: [
        { month: 'Jan', value: 45, height: 45 },
        { month: 'Feb', value: 52, height: 52 },
        { month: 'Mar', value: 38, height: 38 },
        { month: 'Apr', value: 67, height: 67 },
        { month: 'May', value: 89, height: 89 },
        { month: 'Jun', value: 76, height: 76 }
      ],
      goals: [
        { id: 1, title: '월 매출 목표', percentage: 78 },
        { id: 2, title: '신규 사용자', percentage: 65 },
        { id: 3, title: '고객 만족도', percentage: 92 },
        { id: 4, title: '제품 출시', percentage: 45 }
      ],
      recentActivities: [
        {
          id: 1,
          icon: '🔔',
          description: '새로운 주문이 접수되었습니다.',
          time: '5분 전'
        },
        {
          id: 2,
          icon: '👤',
          description: '새로운 사용자가 가입했습니다.',
          time: '15분 전'
        },
        {
          id: 3,
          icon: '📊',
          description: '주간 보고서가 생성되었습니다.',
          time: '1시간 전'
        },
        {
          id: 4,
          icon: '⚠️',
          description: '서버 점검이 예정되어 있습니다.',
          time: '2시간 전'
        }
      ]
    }
  },
  mounted() {
    this.updateCurrentTime();
    setInterval(this.updateCurrentTime, 1000);
  },
  methods: {
    updateCurrentTime() {
      const now = new Date();
      this.currentTime = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.header h1 {
  color: #333;
  font-size: 28px;
}

.user-info {
  text-align: right;
}

.user-info span {
  display: block;
  color: #666;
  font-weight: 500;
}

.current-time {
  font-size: 14px;
  color: #888;
  margin-top: 5px;
}

.main-content {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 40px;
  margin-right: 20px;
}

.stat-info h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 5px;
}

.stat-info p {
  color: #666;
  margin-bottom: 8px;
}

.stat-change {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
}

.stat-change.positive {
  background: #e8f5e8;
  color: #2e7d32;
}

.stat-change.negative {
  background: #ffeaea;
  color: #c62828;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.chart-container, .progress-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.chart-container h3, .progress-container h3 {
  margin-bottom: 20px;
  color: #333;
}

.bar-chart {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 200px;
  padding: 20px 0;
}

.bar {
  width: 40px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 5px 5px 0 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  transition: all 0.3s ease;
}

.bar:hover {
  opacity: 0.8;
}

.bar-label {
  position: absolute;
  bottom: -25px;
  font-size: 12px;
  color: #666;
}

.bar-value {
  position: absolute;
  top: -25px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.progress-list {
  space-y: 15px;
}

.progress-item {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.progress-bar {
  background: #e0e0e0;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 100%;
  transition: width 0.3s ease;
}

.activity-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.activity-section h3 {
  margin-bottom: 20px;
  color: #333;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 20px;
  margin-right: 15px;
}

.activity-content p {
  color: #333;
  margin-bottom: 5px;
}

.activity-time {
  color: #888;
  font-size: 12px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    text-align: center;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
