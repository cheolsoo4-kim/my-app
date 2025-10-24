<template>
  <div class="leaderboard-container" :class="{ 'mobile': mobile }">
    <div class="leaderboard-header">
      <h3>
        <a-badge :count="leaderboardData.length" showZero>
          🏆 실시간 순위표
        </a-badge>
      </h3>
<a-button 
        type="text" 
        size="small" 
        @click="$emit('reload')"
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
        :value="leaderboardFilter"
        size="small" 
        @change="handleFilterChange"
        style="width: 100px;"
      >
        <a-select-option value="all">전체</a-select-option>
        <a-select-option value="easy">쉬움</a-select-option>
        <a-select-option value="normal">보통</a-select-option>
        <a-select-option value="hard">어려움</a-select-option>
      </a-select>
      
      <a-select 
        :value="leaderboardPeriod"
        size="small" 
        @change="handlePeriodChange"
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
            :valueStyle="{ fontSize: mobile ? '16px' : '14px' }"
          />
        </a-col>
        <a-col :span="12">
          <a-statistic 
            title="게임횟수" 
            :value="personalStats.totalGames" 
            :valueStyle="{ fontSize: mobile ? '16px' : '14px' }"
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
            :valueStyle="{ fontSize: mobile ? '16px' : '14px' }"
          />
        </a-col>
        <a-col :span="12">
          <a-statistic 
            title="평균정확도" 
            :value="personalStats.avgAccuracy" 
            suffix="%"
            :precision="1"
            :valueStyle="{ fontSize: mobile ? '16px' : '14px' }"
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
</template>

<script setup>
import { ReloadOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  leaderboardData: Array,
  loadingLeaderboard: Boolean,
  leaderboardFilter: String,
  leaderboardPeriod: String,
  playerName: String,
  personalStats: Object,
  globalStats: Object,
  mobile: Boolean
})

const emit = defineEmits(['filter-change', 'reload'])

const handleFilterChange = (value) => {
  emit('filter-change', { filter: value, period: props.leaderboardPeriod })
}

const handlePeriodChange = (value) => {
  emit('filter-change', { filter: props.leaderboardFilter, period: value })
}

const getRankColor = (index) => {
  if (index === 0) return '#ffd700'
  if (index === 1) return '#c0c0c0'
  if (index === 2) return '#cd7f32'
  return '#1890ff'
}

const getDifficultyColor = (diff) => {
  return { easy: 'green', normal: 'blue', hard: 'red' }[diff] || 'default'
}

const getDifficultyText = (diff) => {
  return { easy: '쉬움', normal: '보통', hard: '어려움' }[diff] || diff
}
</script>

<style scoped>
.leaderboard-container {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}

.leaderboard-container.mobile {
  padding: 12px;
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

.mobile .player-stats {
  font-size: 13px;
}

.mobile .player-name {
  font-size: 15px;
}
</style>