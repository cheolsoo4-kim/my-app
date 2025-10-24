<template>
  <div class="users-page">
    <!-- 헤더 -->
    <div class="page-header">
      <h2 class="page-title">User Management</h2>
<p class="page-subtitle">Vue + Node.js + PostgreSQL</p>
      <a-button type="primary" @click="showCreateModal" class="add-btn">
        <PlusOutlined />
        <span v-if="!isMobile">Add User</span>
      </a-button>
    </div>
<!-- 검색 및 필터 -->
    <a-card class="search-card" :bordered="false">
      <a-row :gutter="[12, 12]">
        <a-col :xs="24" :sm="16">
          <a-input
            v-model:value="searchText"
            placeholder="Search users..."
            size="large"
            @change="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-select
            v-model:value="statusFilter"
            placeholder="All Status"
            size="large"
            style="width: 100%"
            @change="handleStatusFilter"
          >
            <a-select-option value="">All Status</a-select-option>
            <a-select-option value="active">Active</a-select-option>
            <a-select-option value="inactive">Inactive</a-select-option>
          </a-select>
        </a-col>
      </a-row>
    </a-card>

    <!-- 데스크톱 테이블 -->
    <a-card v-if="!isMobile" class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="paginatedUsers"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :scroll="{ x: 800 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'avatar'">
            <a-avatar :src="record.avatar" :alt="record.name">
              {{ record.name?.charAt(0) }}
            </a-avatar>
          </template>
          
          <template v-else-if="column.dataIndex === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status?.toUpperCase() }}
            </a-tag>
          </template>
          
          <template v-else-if="column.dataIndex === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="editUser(record)">
                <EditOutlined />
              </a-button>
              <a-popconfirm
                title="Delete this user?"
                @confirm="deleteUser(record.id)"
              >
                <a-button type="link" danger size="small">
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
      
      <!-- 커스텀 페이지네이션 -->
      <div class="pagination-wrapper">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="filteredUsers.length"
          :show-size-changer="true"
          :show-quick-jumper="true"
          :show-total="(total, range) => `${range[0]}-${range[1]} of ${total}`"
          @change="handlePageChange"
          @showSizeChange="handlePageSizeChange"
        />
      </div>
</a-card>

    <!-- 모바일 카드 리스트 -->
    <div v-if="isMobile" class="mobile-list">
      <a-card
        v-for="user in paginatedUsers"
        :key="user.id"
        class="user-card"
        :bordered="false"
      >
        <template #title>
          <div class="user-card-header">
            <a-avatar :src="user.avatar" :alt="user.name" size="large">
              {{ user.name?.charAt(0) }}
            </a-avatar>
            <div class="user-info">
              <h3 class="user-name">{{ user.name }}</h3>
<a-tag :color="user.status === 'active' ? 'green' : 'red'" size="small">
                {{ user.status?.toUpperCase() }}
              </a-tag>
            </div>
</div>
        </template>
        
        <template #extra>
          <a-dropdown>
            <a-button type="text" size="small">
              <MoreOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="edit" @click="editUser(user)">
                  <EditOutlined />
                  Edit
                </a-menu-item>
                <a-menu-item key="delete" @click="confirmDelete(user.id)">
                  <DeleteOutlined />
                  Delete
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>

        <div class="user-details">
          <div class="detail-row">
            <MailOutlined />
            <span>{{ user.email }}</span>
          </div>
<div v-if="user.phone" class="detail-row">
            <PhoneOutlined />
            <span>{{ user.phone }}</span>
          </div>
</div>
      </a-card>

      <!-- 모바일 페이지네이션 -->
      <div class="mobile-pagination">
        <a-pagination
          v-model:current="pagination.current"
          :total="filteredUsers.length"
          :page-size="pagination.pageSize"
          simple
          @change="handlePageChange"
        />
      </div>
</div>

    <!-- Empty State -->
    <a-empty v-if="!loading && filteredUsers.length === 0" class="empty-state">
      <template #description>
        <span>No users found</span>
      </template>
      <a-button type="primary" @click="showCreateModal">
        <PlusOutlined />
        Add First User
      </a-button>
    </a-empty>

    <!-- 사용자 생성/수정 모달 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalMode === 'create' ? 'Create User' : 'Edit User'"
      :width="isMobile ? '90%' : 520"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :confirm-loading="modalLoading"
    >
      <a-form
        ref="userForm"
        :model="userFormData"
        :rules="userFormRules"
        layout="vertical"
      >
        <a-form-item label="Name" name="name">
          <a-input v-model:value="userFormData.name" size="large" />
        </a-form-item>
        
        <a-form-item label="Email" name="email">
          <a-input v-model:value="userFormData.email" size="large" />
        </a-form-item>
        
        <a-form-item label="Phone" name="phone">
          <a-input v-model:value="userFormData.phone" size="large" />
        </a-form-item>
        
        <a-form-item label="Status" name="status">
          <a-select v-model:value="userFormData.status" size="large">
            <a-select-option value="active">Active</a-select-option>
            <a-select-option value="inactive">Inactive</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MoreOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons-vue'
// import { userApi } from '@/api/service'

// 반응형 감지
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchUsers()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 상태 관리
const loading = ref(false)
const modalLoading = ref(false)
const users = ref([])
const searchText = ref('')
const statusFilter = ref('')

// 모달 관련
const modalVisible = ref(false)
const modalMode = ref('create')
const userForm = ref()

// 폼 데이터
const userFormData = reactive({
  id: null,
  name: '',
  email: '',
  phone: '',
  status: 'active'
})

// 폼 검증 규칙
const userFormRules = {
  name: [{ required: true, message: 'Please input name!' }],
  email: [
    { required: true, message: 'Please input email!' },
    { type: 'email', message: 'Please input valid email!' }
  ]
}

// 테이블 컬럼 (데스크톱용)
const columns = [
  {
    title: 'Avatar',
    dataIndex: 'avatar',
    width: 80,
    align: 'center'
  },
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    title: 'Email',
    dataIndex: 'email'
  },
  {
    title: 'Phone',
    dataIndex: 'phone'
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 100
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    width: 100,
    align: 'center'
  }
]

// 페이지네이션
const pagination = reactive({
  current: 1,
  pageSize: isMobile.value ? 5 : 10
})

// 필터링된 사용자 목록
const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  return filtered
})

// 페이지네이션된 사용자 목록
const paginatedUsers = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredUsers.value.slice(start, end)
})

// API 메소드들 (실제 API 연결 시 주석 해제)
const fetchUsers = async () => {
  try {
    loading.value = true
    // const response = await userApi.getUsers()
    // users.value = response.data || []
    
    // 임시 데이터
    users.value = [
      {
        id: 1,
        name: 'John Doe',
        email: 'j***@***********',
        phone: '+1-234-567-8901',
        status: 'active',
        avatar: 'https://xsgames.co/randomusers/avatar.php?g=male'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.***',
        phone: '+1-234-567-8902',
        status: 'inactive',
        avatar: 'https://xsgames.co/randomusers/avatar.php?g=female'
      }
    ]
  } catch (error) {
    message.error('Failed to fetch users')
  } finally {
    loading.value = false
  }
}

const showCreateModal = () => {
  modalMode.value = 'create'
  modalVisible.value = true
  resetForm()
}

const editUser = (user) => {
  modalMode.value = 'edit'
  modalVisible.value = true
  Object.assign(userFormData, user)
}

const handleModalOk = async () => {
  try {
    await userForm.value.validateFields()
    modalLoading.value = true
    
    if (modalMode.value === 'create') {
      // await userApi.createUser(userFormData)
      message.success('User created successfully')
    } else {
      // await userApi.updateUser(userFormData.id, userFormData)
      message.success('User updated successfully')
    }
    
    modalVisible.value = false
    fetchUsers()
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    modalLoading.value = false
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

const deleteUser = async (userId) => {
  try {
    // await userApi.deleteUser(userId)
    message.success('User deleted successfully')
    fetchUsers()
  } catch (error) {
    message.error('Failed to delete user')
  }
}

const confirmDelete = (userId) => {
  message.confirm({
    title: 'Delete User',
    content: 'Are you sure you want to delete this user?',
    onOk: () => deleteUser(userId)
  })
}

const resetForm = () => {
  Object.assign(userFormData, {
    id: null,
    name: '',
    email: '',
    phone: '',
    status: 'active'
  })
}

const handleSearch = () => {
  pagination.current = 1
}

const handleStatusFilter = () => {
  pagination.current = 1
}

const handlePageChange = (page) => {
  pagination.current = page
}

const handlePageSizeChange = (current, size) => {
  pagination.pageSize = size
  pagination.current = 1
}
</script>

<style scoped>
.users-page {
  padding: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 페이지 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px 0;
}

.page-title {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
}

.page-subtitle {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.add-btn {
  flex-shrink: 0;
  margin-left: 16px;
}

/* 검색 카드 */
.search-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 테이블 카드 */
.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}

/* 모바일 리스트 */
.mobile-list {
  space-y: 12px;
}

.user-card {
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.user-details {
  margin-top: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #6b7280;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

/* 모바일 페이지네이션 */
.mobile-pagination {
  margin-top: 20px;
  text-align: center;
  padding: 16px;
}

/* Empty State */
.empty-state {
  margin: 40px 0;
}

/* 반응형 */
@media (max-width: 768px) {
  .users-page {
    padding: 8px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .add-btn {
    margin-left: 0;
    align-self: flex-start;
  }

  .page-title {
    font-size: 20px;
  }

  .search-card {
    margin-bottom: 16px;
  }

  .user-card {
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .users-page {
    padding: 4px;
  }

  .page-title {
    font-size: 18px;
  }

  .user-name {
    font-size: 15px;
  }

  .detail-row {
    font-size: 13px;
  }
}

/* 커스텀 스타일 */
:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-card-body) {
  padding: 16px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.ant-pagination) {
  margin: 0;
}

/* 터치 최적화 */
@media (hover: none) and (pointer: coarse) {
  .add-btn,
  .ant-btn {
    min-height: 44px;
  }
  
  .user-card {
    padding: 4px;
  }
}
</style>