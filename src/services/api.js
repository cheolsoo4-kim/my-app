import axios from 'axios'

// Swagger API 기본 설정
const API_BASE_URL = 'http://192.168.146.128:8080/api' // 실제 API URL로 변경

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 응답 인터셉터로 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    throw error
  }
)

export const apiService = {
  // 게임 기록 저장
  async saveGameRecord(record) {
    try {
      const response = await api.post('/game-records', {
        player_name: record.playerName,
        score: record.score,
        wpm: record.wpm,
        accuracy: record.accuracy,
        difficulty: record.difficulty,
        completed_sentences: record.completedSentences,
        play_time: record.playTime,
        created_at: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save record')
    }
  },

  // 순위표 조회
 async getLeaderboard(limit = 50, difficulty = 'all', period = 'all') {
    try {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (difficulty !== 'all') params.append('difficulty', difficulty)
      if (period !== 'all') params.append('period', period)

      const response = await api.get(`/game-records/leaderboard?${params}`)
      return response.data.map(record => ({
        id: record.id,
        playerName: record.player_name,
        score: record.score,
        wpm: record.wpm,
        accuracy: record.accuracy,
        difficulty: record.difficulty,
        createdAt: new Date(record.created_at).toLocaleDateString()
      }))
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard')
    }
  },
  // 개인 기록 조회
  async getPlayerRecords(playerName) {
    try {
      const response = await api.get(`/game-records/player/${encodeURIComponent(playerName)}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch player records')
    }
  },

 // 개인 통계 조회
  async getPlayerStats(playerName) {
    try {
      const response = await api.get(`/game-records/player/${encodeURIComponent(playerName)}/stats`)
      return {
        bestScore: response.data.best_score || 0,
        totalGames: response.data.total_games || 0,
        avgWpm: response.data.avg_wpm || 0,
        avgAccuracy: response.data.avg_accuracy || 0
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch player stats')
    }
  },

  // 전체 통계 조회
  async getGlobalStats() {
    try {
      const response = await api.get('/game-records/stats')
      return {
        totalGames: response.data.total_games || 0,
        totalPlayers: response.data.total_players || 0,
        highestScore: response.data.highest_score || 0,
        avgScore: response.data.avg_score || 0,
        avgWpm: response.data.avg_wpm || 0,
        avgAccuracy: response.data.avg_accuracy || 0
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch global stats')
    }
  }

}

// API 엔드포인트 스키마 (Swagger/OpenAPI 참조용)
export const API_SCHEMA = {
  paths: {
    '/game-records': {
      post: {
        summary: 'Create game record',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['player_name', 'score', 'wpm', 'accuracy'],
                properties: {
                  player_name: { type: 'string' },
                  score: { type: 'integer' },
                  wpm: { type: 'number' },
                  accuracy: { type: 'number' },
                  difficulty: { type: 'string', enum: ['easy', 'normal', 'hard'] },
                  completed_sentences: { type: 'integer' },
                  play_time: { type: 'integer' },
                  created_at: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    },
    '/game-records/leaderboard': {
      get: {
        summary: 'Get leaderboard',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 100 }
          }
        ]
      }
    }
  }
}
