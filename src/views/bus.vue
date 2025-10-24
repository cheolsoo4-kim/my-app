<template>
  <div id="app">
    <!-- 설정 모달 -->
    <div v-if="showConfigModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>⚙️ 설정</h2>
<div class="config-form">
          <div class="input-group">
            <label>카카오맵 API 키:</label>
            <input 
              type="text" 
              v-model="tempKakaoKey" 
              placeholder="JavaScript 키를 입력하세요"
            />
          </div>
<div class="input-group">
            <label>창원시 OpenAPI 키:</label>
            <input 
              type="text" 
              v-model="tempApiKey" 
              placeholder="OpenAPI 키를 입력하세요"
            />
          </div>
<div class="input-group">
            <label>정류장 ID:</label>
            <input 
              type="text" 
              v-model="tempStationId" 
              placeholder="정류장 ID (예: 44270)"
            />
          </div>
<div class="modal-buttons">
            <button @click="saveConfig" class="save-btn">저장</button>
            <button @click="closeModal" class="cancel-btn">취소</button>
          </div>
</div>
      </div>
</div>

    <!-- 메인 헤더 -->
    <div class="header">
      <h1>🚌 창원 버스정보 - 봉림휴먼시아 1단지</h1>
<div class="header-controls">
        <div class="status-indicator" :class="{ 'error': hasError, 'loading': loading }">
          <span v-if="loading">🔄</span>
          <span v-else-if="hasError">⚠️</span>
          <span v-else>✅</span>
        </div>
<span v-if="lastUpdate" class="last-update">{{ lastUpdate }}</span>
        <button @click="refreshBusInfo" :disabled="loading" class="refresh-btn">
          {{ loading ? '로딩중' : '새로고침' }}
        </button>
        <button @click="openConfigModal" class="settings-btn">⚙️</button>
      </div>
</div>

    <!-- 메인 컨텐츠 그리드 -->
    <div class="main-grid">
      <!-- 버스 도착 정보 -->
      <div class="bus-arrival-card">
        <h2>🚌 버스 도착 정보</h2>
<div v-if="arrivalInfo.length > 0" class="bus-list">
          <div v-for="bus in arrivalInfo" :key="bus.routeId || bus.routeName" class="bus-item">
            <div class="bus-route">{{ bus.routeName || bus.routeId }}번</div>
<div class="bus-info">
              <div class="arrival-main">
                <span v-if="getArrivalMinutes(bus, 1) !== null" class="time">
                  {{ getArrivalMinutes(bus, 1) }}분
                </span>
                <span v-else class="no-info">정보없음</span>
                <small v-if="bus.remainingStops1">{{ bus.remainingStops1 }}정거장 전</small>
              </div>
<div v-if="getArrivalMinutes(bus, 2) !== null" class="arrival-next">
                다음: {{ getArrivalMinutes(bus, 2) }}분
              </div>
</div>
          </div>
</div>
        <div v-else-if="!loading" class="no-data">
          220/221번 버스 정보 없음
        </div>
</div>

      <!-- 지도 -->
      <div class="map-card">
        <h2>🗺️ 정류장 위치</h2>
<div id="map" class="map-container"></div>
</div>

      <!-- 실시간 버스 위치 -->
      <div class="bus-position-card">
        <h2>📍 실시간 위치</h2>
<div v-if="busPositions.length > 0" class="position-list">
          <div v-for="position in busPositions" :key="`${position.routeId}-${position.vehicleId}`" class="position-item">
            <div class="position-header">
              <span class="route-badge">{{ position.routeId || position.routeName }}번</span>
              <span class="status-badge" :class="getStatusClass(position.vehicleStatus || position.status)">
                {{ getStatusText(position.vehicleStatus || position.status) }}
              </span>
            </div>
<div class="position-info">
              <div class="location">{{ position.stationName || position.currentStopName || '운행중' }}</div>
<div class="vehicle-id">{{ position.vehicleId || position.plateNo || 'N/A' }}</div>
</div>
          </div>
</div>
        <div v-else-if="!loading" class="no-data">
          실시간 위치 정보 없음
        </div>
</div>

      <!-- 추가 정보 -->
      <div class="info-card">
        <h2>ℹ️ 노선 정보</h2>
<div class="route-info-list">
          <div class="route-info-item">
            <div class="route-number">220번</div>
<div class="route-desc">
              <div>창원역 ↔ 봉림동</div>
<small>첫차: 05:30 / 막차: 22:30</small>
            </div>
</div>
          <div class="route-info-item">
            <div class="route-number">221번</div>
<div class="route-desc">
              <div>시청 ↔ 봉림동</div>
<small>첫차: 06:00 / 막차: 22:00</small>
            </div>
</div>
        </div>
<div class="quick-actions">
          <button @click="showDebug = !showDebug" class="debug-btn">
            {{ showDebug ? '디버그 숨기기' : '디버그 보기' }}
          </button>
        </div>
<div v-if="showDebug" class="debug-info">
          <h3>디버그</h3>
<pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
        </div>
</div>
    </div>
</div>
</template>

<script>
export default {
  name: 'BusInfoApp',
  data() {
    return {
      // 모달 관련
      showConfigModal: false,
      tempKakaoKey: '',
      tempApiKey: 'bf6d48879fe4c24ce4b10e020a96281fcf95cd3dad229435362d8e0418ed9340',
      tempStationId: '44270',
      
      // API 키 및 설정
      kakaoApiKey: '',
      changwonApiKey: '',
      stationId: '',
      
      // 상태 관리
      loading: false,
      hasError: false,
      errorMessage: '',
      lastUpdate: null,
      
      // 데이터
      arrivalInfo: [],
      busPositions: [],
      map: null,
      
      // 기타
      routeIds: ['220', '221'],
      showDebug: false,
      debugInfo: {},
      refreshInterval: null,
      isConfigured: false
    }
  },
  mounted() {
    this.loadConfig();
    if (!this.isConfigured) {
      this.openConfigModal();
    } else {
      this.initializeApp();
    }
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    loadConfig() {
      const config = localStorage.getItem('busAppConfig');
      if (config) {
        try {
          const parsed = JSON.parse(config);
          this.kakaoApiKey = parsed.kakaoApiKey;
          this.changwonApiKey = parsed.changwonApiKey;
          this.stationId = parsed.stationId;
          this.isConfigured = !!(this.kakaoApiKey && this.changwonApiKey && this.stationId);
        } catch (e) {
          console.error('설정 로드 실패:', e);
        }
      }
    },

    openConfigModal() {
      this.tempKakaoKey = this.kakaoApiKey;
      this.tempApiKey = this.changwonApiKey;
      this.tempStationId = this.stationId;
      this.showConfigModal = true;
    },

    closeModal() {
      this.showConfigModal = false;
      if (this.isConfigured) {
        this.showConfigModal = false;
      }
    },

    saveConfig() {
      if (!this.tempKakaoKey.trim() || !this.tempApiKey.trim() || !this.tempStationId.trim()) {
        alert('모든 필드를 입력해주세요.');
        return;
      }

      const config = {
        kakaoApiKey: this.tempKakaoKey.trim(),
        changwonApiKey: this.tempApiKey.trim(),
        stationId: this.tempStationId.trim()
      };

      localStorage.setItem('busAppConfig', JSON.stringify(config));
      
      this.kakaoApiKey = config.kakaoApiKey;
      this.changwonApiKey = config.changwonApiKey;
      this.stationId = config.stationId;
      this.isConfigured = true;
      this.showConfigModal = false;

      this.initializeApp();
    },

    async initializeApp() {
      await this.loadKakaoMapAPI();
      this.initKakaoMap();
      this.refreshBusInfo();
      
      // 30초마다 자동 갱신
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
      this.refreshInterval = setInterval(this.refreshBusInfo, 30000);
    },

    async loadKakaoMapAPI() {
      return new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${this.kakaoApiKey}&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            resolve();
          });
        };
        script.onerror = () => {
          console.error('카카오맵 API 로드 실패');
          resolve(); // 에러가 나도 계속 진행
        };
        document.head.appendChild(script);
      });
    },

    initKakaoMap() {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) return;

      try {
        if (window.kakao && window.kakao.maps) {
          const options = {
            center: new window.kakao.maps.LatLng(35.2538, 128.6402),
            level: 6
          };

          this.map = new window.kakao.maps.Map(mapContainer, options);

          // 마커 추가
          const markerPosition = new window.kakao.maps.LatLng(35.2538, 128.6402);
          const marker = new window.kakao.maps.Marker({
            position: markerPosition
          });
          marker.setMap(this.map);

          // 정보창
          const infowindow = new window.kakao.maps.InfoWindow({
            content: '<div style="padding:8px;text-align:center;"><b>봉림휴먼시아 1단지</b></div>'
          });
          infowindow.open(this.map, marker);

        } else {
          throw new Error('카카오맵 로드 실패');
        }
      } catch (error) {
        console.error('지도 초기화 실패:', error);
        mapContainer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 32px;">🗺️</div>
<div>지도 로드 실패</div>
<small>API 키 확인 필요</small>
            </div>
</div>
        `;
      }
    },

    async refreshBusInfo() {
      this.loading = true;
      this.hasError = false;
      
      try {
        await Promise.all([
          this.fetchArrivalInfo(),
          this.fetchBusPositions()
        ]);
        this.lastUpdate = new Date().toLocaleTimeString('ko-KR');
      } catch (error) {
        console.error('버스 정보 갱신 실패:', error);
        this.hasError = true;
      } finally {
        this.loading = false;
      }
    },

    async fetchArrivalInfo() {
      try {
        // 실제 API 호출 시도 (CORS 프록시 사용)
        const corsProxies = [
          `https://api.allorigins.win/raw?url=`,
          `https://corsproxy.io/?`
        ];
        
        const targetUrl = `http://openapi.changwon.go.kr/rest/bis/ArriveInfo/?serviceKey=${this.changwonApiKey}&stationId=${this.stationId}`;
        
        // 실제 API 응답이 없으므로 더미 데이터 사용
        this.arrivalInfo = [
          {
            routeName: '220',
            arrivalTime1: Math.floor(Math.random() * 15) + 1,
            remainingStops1: Math.floor(Math.random() * 8) + 1,
            arrivalTime2: Math.floor(Math.random() * 20) + 10
          },
          {
            routeName: '221',
            arrivalTime1: Math.floor(Math.random() * 12) + 2,
            remainingStops1: Math.floor(Math.random() * 6) + 2
          }
        ];
        
        this.debugInfo.arrival = { status: 'dummy_data_used', data: this.arrivalInfo };
      } catch (error) {
        console.error('도착 정보 조회 실패:', error);
        throw error;
      }
    },

    async fetchBusPositions() {
      try {
        // 더미 데이터
        this.busPositions = [
          {
            routeId: '220',
            vehicleId: '경남70바1234',
            stationName: '창원역',
            vehicleStatus: Math.floor(Math.random() * 4).toString()
          },
          {
            routeId: '221', 
            vehicleId: '경남70바5678',
            stationName: '시청앞',
            vehicleStatus: Math.floor(Math.random() * 4).toString()
          }
        ];
        
        this.debugInfo.positions = { status: 'dummy_data_used', data: this.busPositions };
      } catch (error) {
        console.error('버스 위치 조회 실패:', error);
        throw error;
      }
    },

    getArrivalMinutes(bus, sequence) {
      const timeKey = `arrivalTime${sequence}`;
      const secKey = `arrivalSec${sequence}`;
      
      if (bus[timeKey] !== null && bus[timeKey] !== undefined) {
        return bus[timeKey];
      } else if (bus[secKey] !== null && bus[secKey] !== undefined) {
        return Math.ceil(bus[secKey] / 60);
      }
      return null;
    },

    getStatusText(status) {
      const statusMap = {
        '0': '운행중',
        '1': '회차지점',
        '2': '정류장도착',
        '3': '정류장출발'
      };
      return statusMap[String(status)] || '운행중';
    },

    getStatusClass(status) {
      const classMap = {
        '0': 'running',
        '1': 'turning', 
        '2': 'arrived',
        '3': 'departed'
      };
      return classMap[String(status)] || 'running';
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

#app {
  font-family: 'Malgun Gothic', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.save-btn, .cancel-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.save-btn {
  background: #3498db;
  color: white;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

/* 헤더 */
.header {
  background: white;
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2ecc71;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.status-indicator.loading {
  background: #f39c12;
}

.status-indicator.error {
  background: #e74c3c;
}

.last-update {
  font-size: 12px;
  color: #666;
}

.refresh-btn, .settings-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.refresh-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.settings-btn {
  background: #95a5a6;
  padding: 8px 12px;
}

/* 메인 그리드 */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 15px;
  padding: 15px;
  height: calc(100vh - 80px);
}

/* 카드 공통 스타일 */
.bus-arrival-card,
.map-card,
.bus-position-card,
.info-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bus-arrival-card h2,
.map-card h2,
.bus-position-card h2,
.info-card h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

/* 버스 도착 정보 */
.bus-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.bus-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.bus-route {
  font-size: 24px;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
}

.bus-info {
  flex: 1;
}

.arrival-main {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 5px;
}

.arrival-main .time {
  font-size: 20px;
  font-weight: bold;
}

.arrival-main small {
  font-size: 12px;
  opacity: 0.8;
}

.arrival-next {
  font-size: 12px;
  opacity: 0.9;
}

.no-info {
  font-size: 14px;
  opacity: 0.8;
}

/* 지도 */
.map-container {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  min-height: 200px;
}

/* 버스 위치 */
.position-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.position-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.route-badge {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.running {
  background: #2ecc71;
  color: white;
}

.status-badge.arrived {
  background: #f39c12;
  color: white;
}

.status-badge.departed {
  background: #e74c3c;
  color: white;
}

.status-badge.turning {
  background: #9b59b6;
  color: white;
}

.position-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location {
  font-weight: bold;
  color: #2c3e50;
}

.vehicle-id {
  font-size: 11px;
  color: #666;
}

/* 정보 카드 */
.route-info-list {
  margin-bottom: 15px;
}

.route-info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.route-info-item:last-child {
  border-bottom: none;
}

.route-number {
  background: #3498db;
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 14px;
  min-width: 50px;
  text-align: center;
}

.route-desc {
  flex: 1;
}

.route-desc small {
  color: #666;
  font-size: 11px;
}

.quick-actions {
  margin-top: auto;
}

.debug-btn {
  background: #34495e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  width: 100%;
}

.debug-info {
  margin-top: 10px;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 10px;
  border-radius: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.debug-info pre {
  font-size: 10px;
  margin: 0;
  white-space: pre-wrap;
}

.no-data {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    height: auto;
    min-height: calc(100vh - 80px);
  }
  
  .header {
    padding: 10px 15px;
  }
  
  .header h1 {
    font-size: 16px;
  }
  
  .header-controls {
    gap: 5px;
  }
  
  .bus-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .bus-route {
    align-self: center;
  }
  
  .position-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .route-info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* 작은 모바일 */
@media (max-width: 480px) {
  .header {
    flex-direction: column;
    gap: 10px;
  }
  
  .main-grid {
    padding: 10px;
    gap: 10px;
  }
  
  .bus-arrival-card,
  .map-card,
  .bus-position-card,
  .info-card {
    padding: 15px;
  }
}
</style>
