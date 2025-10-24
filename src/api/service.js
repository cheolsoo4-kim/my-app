import axios from 'axios'
import { message } from 'ant-design-vue'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error
    
    if (response?.status) {
      const statusMessages = {
        401: '인증이 필요합니다.',
        403: '접근 권한이 없습니다.',
        404: '요청한 리소스를 찾을 수 없습니다.',
        500: '서버 오류가 발생했습니다.',
      }
      
      message.error(statusMessages[response.status] || '알 수 없는 오류가 발생했습니다.')
    } else {
      message.error('네트워크 오류가 발생했습니다.')
    }
    
    return Promise.reject(error)
  }
)

// 기본 API 서비스
export const apiService = {
  get: (url, params = {}) => apiClient.get(url, { params }),
  post: (url, data = {}) => apiClient.post(url, data),
  put: (url, data = {}) => apiClient.put(url, data),
  delete: (url) => apiClient.delete(url),
  upload: (url, formData) => apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 실제 백엔드와 통신하는 사용자 API
export const userApi = {
  getUsers: (params = {}) => apiService.get('/users', params),
  getUser: (id) => apiService.get(`/users/${id}`),
  createUser: (userData) => apiService.post('/users', userData),
  updateUser: (id, userData) => apiService.put(`/users/${id}`, userData),
  deleteUser: (id) => apiService.delete(`/users/${id}`)
}

// YouTube API
export const youtubeApi = {
  getVideos: (params = {}) => apiService.get('/youtube/videos', params),
  getVideoInfo: (videoId) => apiService.get(`/youtube/video/${videoId}`),
  createOrUpdateVideo: (videoData) => apiService.post('/youtube/videos', videoData)
}
