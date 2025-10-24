const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;


// 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'dist')));

// 창원 버스 API 프록시
const CHANGWON_API_KEY = process.env.CHANGWON_API_KEY || '';

app.get('/api/bus/arrival/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    
    // 더미 데이터 반환
    const dummyData = {
      success: true,
      data: [
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
      ]
    };
    
    res.json(dummyData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch bus arrival info' });
  }
});

app.get('/api/bus/position/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    
    const dummyData = {
      success: true,
      data: [{
        routeId: routeId,
        vehicleId: `경남70바${Math.floor(Math.random() * 9999)}`,
        stationName: ['창원역', '시청앞', '용호동', '봉림동'][Math.floor(Math.random() * 4)],
        vehicleStatus: Math.floor(Math.random() * 4).toString()
      }]
    };
    
    res.json(dummyData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch bus position info' });
  }
});

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Vue 라우터 지원
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 서버 시작
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;
