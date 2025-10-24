<template>
  <div class="api-docs-page">
    <!-- 헤더 섹션 -->
    <a-card class="header-card" :bordered="false">
      <div class="header-content">
        <h1 class="page-title">
          <ApiOutlined />
          API Documentation
        </h1>
<p class="page-description">
          애플리케이션의 API 엔드포인트 및 사용 방법에 대한 문서입니다.
	  <br>
	  DB : postgreSql  / server: Node.js
        </p>
      </div>
</a-card>

    <!-- API 목록 및 문서 -->
    <div class="api-sections">
      <!-- User API -->
      <a-card 
        title="User Management API" 
        class="api-section-card"
        :bordered="false"
      >
        <template #extra>
          <a-tag color="blue">v1.0.0</a-tag>
        </template>

        <div class="api-endpoints">
          <!-- GET /api/users -->
          <a-card size="small" class="endpoint-card" title="GET /api/users">
            <template #extra>
              <a-tag color="green">GET</a-tag>
            </template>
            <p class="endpoint-description">모든 사용자 목록을 조회합니다.</p>
            
            <a-collapse>
              <a-collapse-panel key="1" header="Details">
                <div class="endpoint-details">
                  <h4>Parameters:</h4>
<a-table 
                    :columns="parameterColumns" 
                    :data-source="getUsersParams"
                    :pagination="false"
                    size="small"
                  />
                  
                  <h4 style="margin-top: 16px;">Response:</h4>
<pre class="code-block">{{
JSON.stringify({
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.***",
      "phone": "010-1234-5678",
      "status": "active"
    }
  ],
  "total": 1,
  "success": true
}, null, 2)
                  }}</pre>
                  
                  <a-button 
                    type="primary" 
                    @click="testEndpoint('/api/users', 'GET')"
                    :loading="loading"
                  >
                    <ExperimentOutlined />
                    Test API
                  </a-button>
                </div>
</a-collapse-panel>
            </a-collapse>
          </a-card>

          <!-- POST /api/users -->
          <a-card size="small" class="endpoint-card" title="POST /api/users">
            <template #extra>
              <a-tag color="orange">POST</a-tag>
            </template>
            <p class="endpoint-description">새로운 사용자를 생성합니다.</p>
            
            <a-collapse>
              <a-collapse-panel key="1" header="Details">
                <div class="endpoint-details">
                  <h4>Request Body:</h4>
<pre class="code-block">{{
JSON.stringify({
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string",
  "status": "string (active|inactive)"
}, null, 2)
                  }}</pre>
                  
                  <h4>Response:</h4>
<pre class="code-block">{{
JSON.stringify({
  "data": {
    "id": 2,
    "name": "New User",
    "email": "newu***@***********",
    "phone": "010-0000-0000",
    "status": "active"
  },
  "success": true
}, null, 2)
                  }}</pre>

                  <h4>Test Request:</h4>
<a-form layout="vertical">
                    <a-form-item label="Name">
                      <a-input v-model:value="testUser.name" placeholder="User name" />
                    </a-form-item>
                    <a-form-item label="Email">
                      <a-input v-model:value="testUser.email" placeholder="u***@***********" />
                    </a-form-item>
                    <a-form-item label="Phone">
                      <a-input v-model:value="testUser.phone" placeholder="010-0000-0000" />
                    </a-form-item>
                    <a-form-item label="Status">
                      <a-select v-model:value="testUser.status">
                        <a-select-option value="active">Active</a-select-option>
                        <a-select-option value="inactive">Inactive</a-select-option>
                      </a-select>
                    </a-form-item>
                    <a-button 
                      type="primary" 
                      @click="testCreateUser"
                      :loading="loading"
                    >
                      <PlusOutlined />
                      Create User
                    </a-button>
                  </a-form>
                </div>
</a-collapse-panel>
            </a-collapse>
          </a-card>

          <!-- PUT /api/users/{id} -->
          <a-card size="small" class="endpoint-card" title="PUT /api/users/{id}">
            <template #extra>
              <a-tag color="blue">PUT</a-tag>
            </template>
            <p class="endpoint-description">사용자 정보를 수정합니다.</p>
            
            <a-collapse>
              <a-collapse-panel key="1" header="Details">
                <div class="endpoint-details">
                  <h4>Path Parameters:</h4>
<a-table 
                    :columns="parameterColumns" 
                    :data-source="[{key: 1, name: 'id', type: 'integer', required: 'Yes', description: 'User ID'}]"
                    :pagination="false"
                    size="small"
                  />
                  
                  <a-button 
                    type="primary" 
                    @click="testEndpoint('/api/users/1', 'PUT')"
                    :loading="loading"
                  >
                    <EditOutlined />
                    Test API
                  </a-button>
                </div>
</a-collapse-panel>
            </a-collapse>
          </a-card>

          <!-- DELETE /api/users/{id} -->
          <a-card size="small" class="endpoint-card" title="DELETE /api/users/{id}">
            <template #extra>
              <a-tag color="red">DELETE</a-tag>
            </template>
            <p class="endpoint-description">사용자를 삭제합니다.</p>
            
            <a-collapse>
              <a-collapse-panel key="1" header="Details">
                <div class="endpoint-details">
                  <h4>Path Parameters:</h4>
<a-table 
                    :columns="parameterColumns" 
                    :data-source="[{key: 1, name: 'id', type: 'integer', required: 'Yes', description: 'User ID'}]"
                    :pagination="false"
                    size="small"
                  />
                  
                  <a-popconfirm
                    title="Are you sure you want to test the DELETE API?"
                    @confirm="testEndpoint('/api/users/1', 'DELETE')"
                  >
                    <a-button 
                      type="primary" 
                      danger
                      :loading="loading"
                    >
                      <DeleteOutlined />
                      Test API
                    </a-button>
                  </a-popconfirm>
                </div>
</a-collapse-panel>
            </a-collapse>
          </a-card>
        </div>
</a-card>

      <!-- YouTube API -->
      <a-card 
        title="YouTube API" 
        class="api-section-card"
        :bordered="false"
      >
        <template #extra>
          <a-tag color="red">v1.0.0</a-tag>
        </template>

        <div class="api-endpoints">
          <a-card size="small" class="endpoint-card" title="GET /api/youtube/videos">
            <template #extra>
              <a-tag color="green">GET</a-tag>
            </template>
            <p class="endpoint-description">YouTube 비디오 목록을 조회합니다.</p>
            
            <a-collapse>
              <a-collapse-panel key="1" header="Details">
                <div class="endpoint-details">
                  <h4>Response:</h4>
<pre class="code-block">{{
JSON.stringify({
  "data": [
    {
      "id": "jfKfPfyJRdk",
      "title": "ROSÉ - On The Ground",
      "description": "Official Music Video"
    },
    {
      "id": "gdZLi9oWNZg", 
      "title": "BTS (방탄소년단) Dynamite",
      "description": "Official MV"
    }
  ],
  "success": true
}, null, 2)
                  }}</pre>
                  
                  <a-button 
                    type="primary" 
                    @click="testEndpoint('/api/youtube/videos', 'GET')"
                    :loading="loading"
                  >
                    <YoutubeOutlined />
                    Test API
                  </a-button>
                </div>
</a-collapse-panel>
            </a-collapse>
          </a-card>

          <a-card size="small" class="endpoint-card" title="GET /api/youtube/video/{videoId}">
            <template #extra>
              <a-tag color="green">GET</a-tag>
            </template>
            <p class="endpoint-description">특정 YouTube 비디오 정보를 조회합니다.</p>
            
            <a-collapse>
              <a-collapse-panel key="1" header="Details">
                <div class="endpoint-details">
                  <h4>Test with Video ID:</h4>
<a-input-group compact>
                    <a-input 
                      v-model:value="testVideoId" 
                      placeholder="Enter YouTube Video ID"
                      style="width: 200px"
                    />
                    <a-button 
                      type="primary" 
                      @click="testEndpoint(`/api/youtube/video/${testVideoId}`, 'GET')"
                      :loading="loading"
                    >
                      Test
                    </a-button>
                  </a-input-group>
                </div>
</a-collapse-panel>
            </a-collapse>
          </a-card>
        </div>
</a-card>
    </div>
<!-- API Response Modal -->
    <a-modal
      v-model:open="responseModalVisible"
      title="API Response"
      width="800px"
      :footer="null"
    >
      <div class="response-content">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="Method">
            <a-tag :color="getMethodColor(apiResponse.method)">
              {{ apiResponse.method }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="URL">
            <code>{{ apiResponse.url }}</code>
          </a-descriptions-item>
          <a-descriptions-item label="Status">
            <a-tag :color="getStatusColor(apiResponse.status)">
              {{ apiResponse.status }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Time">
            {{ apiResponse.time }}ms
          </a-descriptions-item>
        </a-descriptions>

        <h4 style="margin: 16px 0 8px 0;">Response Body:</h4>
<pre class="response-body">{{ apiResponse.data }}</pre>

        <div style="margin-top: 16px; text-align: right;">
          <a-button @click="responseModalVisible = false">Close</a-button>
        </div>
</div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { userApi, youtubeApi } from '@/api/service'

// 반응형 데이터
const loading = ref(false)
const responseModalVisible = ref(false)
const testVideoId = ref('jfKfPfyJRdk')

// 테스트용 유저 데이터
const testUser = reactive({
  name: 'Test User',
  email: 't***@***********',
  phone: '010-0000-0000',
  status: 'active'
})

// API 응답 데이터
const apiResponse = ref({
  method: '',
  url: '',
  status: '',
  time: 0,
  data: ''
})

// 테이블 컬럼 정의
const parameterColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Required', dataIndex: 'required', key: 'required' },
  { title: 'Description', dataIndex: 'description', key: 'description' }
]

// GET /api/users 파라미터
const getUsersParams = [
  { key: 1, name: 'page', type: 'integer', required: 'No', description: 'Page number (default: 1)' },
  { key: 2, name: 'limit', type: 'integer', required: 'No', description: 'Items per page (default: 10)' },
  { key: 3, name: 'search', type: 'string', required: 'No', description: 'Search keyword' },
  { key: 4, name: 'status', type: 'string', required: 'No', description: 'Filter by status (active|inactive)' }
]

// 메소드들
const testEndpoint = async (url, method) => {
  loading.value = true
  const startTime = Date.now()
  
  try {
    let response
    
    switch (method.toUpperCase()) {
      case 'GET':
        if (url.includes('/users/')) {
          response = await userApi.getUser(1)
        } else if (url.includes('/youtube/videos')) {
          response = await youtubeApi.getVideos()
        } else if (url.includes('/youtube/video/')) {
          response = await youtubeApi.getVideoInfo(testVideoId.value)
        } else {
          response = await userApi.getUsers()
        }
        break
      case 'POST':
        response = await userApi.createUser(testUser)
        break
      case 'PUT':
        response = await userApi.updateUser(1, testUser)
        break
      case 'DELETE':
        response = await userApi.deleteUser(1)
        break
      default:
        throw new Error('Unsupported method')
    }
    
    const endTime = Date.now()
    
    apiResponse.value = {
      method: method.toUpperCase(),
      url: url,
      status: '200 OK',
      time: endTime - startTime,
      data: JSON.stringify(response, null, 2)
    }
    
    responseModalVisible.value = true
    message.success('API 호출 성공!')
    
  } catch (error) {
    const endTime = Date.now()
    
    apiResponse.value = {
      method: method.toUpperCase(),
      url: url,
      status: '500 Error',
      time: endTime - startTime,
      data: JSON.stringify({ 
        error: error.message || 'API call failed',
        details: 'This is a mock API simulation'
      }, null, 2)
    }
    
    responseModalVisible.value = true
    message.error('API 호출 실패')
  } finally {
    loading.value = false
  }
}

const testCreateUser = async () => {
  if (!testUser.name || !testUser.email) {
    message.error('Name and Email are required')
    return
  }
  
  await testEndpoint('/api/users', 'POST')
}

const getMethodColor = (method) => {
  const colors = {
    'GET': 'green',
    'POST': 'orange', 
    'PUT': 'blue',
    'DELETE': 'red'
  }
  return colors[method] || 'default'
}

const getStatusColor = (status) => {
  if (status.includes('200')) return 'green'
  if (status.includes('400')) return 'orange'
  if (status.includes('500')) return 'red'
  return 'default'
}
</script>

<style scoped>
.api-docs-page {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  text-align: center;
  padding: 20px;
}

.page-title {
  font-size: 2.5rem;
  color: #1890ff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-description {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.api-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.api-section-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.api-endpoints {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.endpoint-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.endpoint-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.endpoint-description {
  color: #666;
  margin-bottom: 16px;
}

.endpoint-details {
  padding: 8px 0;
}

.endpoint-details h4 {
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.code-block {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  margin-bottom: 16px;
  color: #24292e;
}

.response-content .response-body {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .api-docs-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .code-block {
    font-size: 11px;
    padding: 12px;
  }
}

/* Ant Design 커스텀 스타일 */
:deep(.ant-card-head-title) {
  font-weight: 600;
}

:deep(.ant-collapse > .ant-collapse-item > .ant-collapse-header) {
  font-weight: 500;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
}
</style>
