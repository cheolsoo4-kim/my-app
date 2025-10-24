const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();
const { Pool } = require('pg')

const { syncDatabase } = require('./models');
const userRoutes = require('./routes/users');
const youtubeRoutes = require('./routes/youtube');

const app = express();
// PostgreSQL 연결
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'myapp_db',
  user: process.env.DB_USER || 'myapp_user',
  password: process.env.DB_PASSWORD || 'myapp_password',
  ssl: { rejectUnauthorized: false }	
})

// 서버 IP 주소 가져오기
const getServerIP = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  // 첫 번째 외부 IP 반환
  for (const name of Object.keys(results)) {
    if (results[name].length > 0) {
      return results[name][0];
    }
  }
  return 'localhost';
};

const SERVER_IP = getServerIP();

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My App API',
      version: '1.0.0',
      description: 'API documentation for My App',
      contact: {
        name: 'API Support',
        email: 'supp***@*********'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}`,
        description: 'Local server'
      },
      {
        url: `http://${SERVER_IP}:${process.env.PORT || 8080}`,
        description: 'Network server'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// 보안 미들웨어
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS 설정 - 외부 접속 허용
app.use(cors({
  origin: function (origin, callback) {
    // 개발 환경에서는 모든 origin 허용
    return callback(null, true);
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 프로덕션에서는 허용된 도메인만
    const allowedOrigins = process.env.FRONTEND_URL?.split(',') || [];
    
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Preflight 요청 처리
app.options('*', cors());

// Rate limiting - 외부 접속을 위해 조금 더 관대하게 설정
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 개발환경에서는 더 많은 요청 허용
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 로깅
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 바디 파서
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const API_BASE_URL = 'http://openapi.changwon.go.kr/rest/bis';
const SERVICE_KEY = 'bf6d48879fe4c24ce4b10e020a96281fcf95cd3dad229435362d8e0418ed9340';

// 버스 도착 정보 API 프록시
app.get('/api/arrival/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const response = await axios.get(`${API_BASE_URL}/ArriveInfo/`, {
      params: {
        serviceKey: SERVICE_KEY,
        stationId: stationId
      },
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('도착 정보 API 에러:', error.message);
    res.status(500).json({ error: '도착 정보를 가져올 수 없습니다.' });
  }
});

// 버스 위치 정보 API 프록시
app.get('/api/position/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const response = await axios.get(`${API_BASE_URL}/BusPosition/`, {
      params: {
        serviceKey: SERVICE_KEY,
        routeId: routeId
      },
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('위치 정보 API 에러:', error.message);
    res.status(500).json({ error: '버스 위치 정보를 가져올 수 없습니다.' });
  }
});


// API 문서
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'My App API Documentation'
}));

// 라우트
app.use('/api/users', userRoutes);
app.use('/api/youtube', youtubeRoutes);

// 서버 정보 확인 엔드포인트
app.get('/server-info', (req, res) => {
  res.json({
    success: true,
    serverIP: SERVER_IP,
    port: process.env.PORT || 8080,
    endpoints: {
      health: `http://${SERVER_IP}:${process.env.PORT || 8080}/health`,
      apiDocs: `http://${SERVER_IP}:${process.env.PORT || 8080}/api-docs`,
      users: `http://${SERVER_IP}:${process.env.PORT || 8080}/api/users`,
      youtube: `http://${SERVER_IP}:${process.env.PORT || 8080}/api/youtube/videos`
    }
  });
});

// 건강 상태 확인
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    serverIP: SERVER_IP,
    environment: process.env.NODE_ENV || 'development'
  });
});

// OpenAPI JSON 엔드포인트
app.get('/api/openapi.json', (req, res) => {
  res.json(specs);
});

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'My App API Server',
    version: '1.0.0',
    serverIP: SERVER_IP,
    port: process.env.PORT || 8080,
    docs: `/api-docs`,
    health: `/health`,
    externalAccess: {
      docs: `http://${SERVER_IP}:${process.env.PORT || 8080}/api-docs`,
      health: `http://${SERVER_IP}:${process.env.PORT || 8080}/health`
    }
  });
});

// 게임 기록 저장
app.post('/api/game-records', async (req, res) => {
  try {
    const { 
      player_name, score, wpm, accuracy, 
      difficulty, completed_sentences, play_time 
    } = req.body

    const result = await pool.query(
      `INSERT INTO game_records 
       (player_name, score, wpm, accuracy, difficulty, completed_sentences, play_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [player_name, score, wpm, accuracy, difficulty, completed_sentences, play_time]
    )

    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 순위표 조회
app.get('/api/game-records/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100
    
    const result = await pool.query(
      `SELECT * FROM leaderboard LIMIT $1`,
      [limit]
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 플레이어별 기록
app.get('/api/game-records/player/:playerName', async (req, res) => {
  try {
    const { playerName } = req.params
    
    const result = await pool.query(
      `SELECT * FROM game_records 
       WHERE player_name = $1 
       ORDER BY created_at DESC`,
      [playerName]
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})
app.get('/api/game-records/player/:playerName/stats', async (req, res) => {
  try {
    const { playerName } = req.params
    
    const result = await pool.query(
      `SELECT 
         MAX(score) as best_score,
         COUNT(*) as total_games,
         AVG(wpm) as avg_wpm,
         AVG(accuracy) as avg_accuracy
       FROM game_records 
       WHERE player_name = $1`,
      [playerName]
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 필터링된 순위표 조회
app.get('/api/game-records/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const difficulty = req.query.difficulty || 'all'
    const period = req.query.period || 'all'
    
    let query = `
      SELECT ROW_NUMBER() OVER (ORDER BY score DESC, wmp DESC) as rank,
             player_name, score, wpm, accuracy, difficulty, created_at
      FROM game_records
    `
    
    const conditions = []
    const params = []
    let paramCount = 0

    // 난이도 필터
    if (difficulty !== 'all') {
      paramCount++
      conditions.push(`difficulty = $${paramCount}`)
      params.push(difficulty)
    }

    // 기간 필터
    if (period !== 'all') {
      paramCount++
      let dateCondition = ''
      switch (period) {
        case 'today':
          dateCondition = `created_at >= CURRENT_DATE`
          break
        case 'week':
          dateCondition = `created_at >= CURRENT_DATE - INTERVAL '7 days'`
          break
        case 'month':
          dateCondition = `created_at >= CURRENT_DATE - INTERVAL '30 days'`
          break
      }
      if (dateCondition) {
        conditions.push(dateCondition)
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ` ORDER BY score DESC, wmp DESC LIMIT $${paramCount + 1}`
    params.push(limit)

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})
// 통계 조회
app.get('/api/game-records/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM get_game_stats()')
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      '/health',
      '/api-docs',
      '/server-info',
      '/api/users',
      '/api/youtube/videos',
      '/api/game-records/player',
      '/api/game-records/leaderboard',
      '/api/game-records'
    ]
  });
});



// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;
