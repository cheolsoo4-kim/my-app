<template>
  <div class="users-page">
    <a-card title="User Management(Vue[vite,openapi,antd] Node.js[swagger-ui]+PostgreSql17[https://neon.com/]">
      <template #extra>
        <a-button type="primary" @click="showCreateModal">
          <PlusOutlined />
          Add User
        </a-button>
      </template>

      <!-- 검색 필터 -->
      <a-row :gutter="[16, 16]" class="search-filters">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input
            v-model:value="searchText"
            placeholder="Search users..."
            @change="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <a-select
            v-model:value="statusFilter"
            placeholder="Filter by status"
            style="width: 100%"
            @change="handleStatusFilter"
          >
            <a-select-option value="">All Status</a-select-option>
            <a-select-option value="active">Active</a-select-option>
            <a-select-option value="inactive">Inactive</a-select-option>
          </a-select>
        </a-col>
      </a-row>

      <!-- 사용자 테이블 -->
      <a-table
        :columns="columns"
        :data-source="filteredUsers"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record, index }">
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
              <a-button 
                type="link" 
                size="small" 
                @click="editUser(record)"
              >
                <EditOutlined />
                Edit
              </a-button>
              <a-popconfirm
                title="Are you sure delete this user?"
                @confirm="deleteUser(record.id)"
              >
                <a-button type="link" danger size="small">
                  <DeleteOutlined />
                  Delete
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 사용자 생성/수정 모달 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalMode === 'create' ? 'Create User' : 'Edit User'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="userForm"
        :model="userFormData"
        :rules="userFormRules"
        layout="vertical"
      >
        <a-form-item label="Name" name="name">
          <a-input v-model:value="userFormData.name" />
        </a-form-item>
        
        <a-form-item label="Email" name="email">
          <a-input v-model:value="userFormData.email" />
        </a-form-item>
        
        <a-form-item label="Phone" name="phone">
          <a-input v-model:value="userFormData.phone" />
        </a-form-item>
        
        <a-form-item label="Status" name="status">
          <a-select v-model:value="userFormData.status">
            <a-select-option value="active">Active</a-select-option>
            <a-select-option value="inactive">Inactive</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { userApi } from '@/api/service'

// 반응형 데이터
const loading = ref(false)
const users = ref([])
const searchText = ref('')
const statusFilter = ref('')

// 모달 관련
const modalVisible = ref(false)
const modalMode = ref('create') // 'create' or 'edit'
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
  name: [
    { required: true, message: 'Please input name!' }
  ],
  email: [
    { required: true, message: 'Please input email!' },
    { type: 'email', message: 'Please input valid email!' }
  ]
}

// 테이블 컬럼 정의
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
    filters: [
      { text: 'Active', value: 'active' },
      { text: 'Inactive', value: 'inactive' }
    ]
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    width: 150,
    align: 'center'
  }
]

// 페이지네이션
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
})

// 필터링된 사용자 목록
const filteredUsers = computed(() => {
  let filtered = users.value

  // 텍스트 검색
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    )
  }

  // 상태 필터
  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  return filtered
})

// 메소드들
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await userApi.getUsers()
    users.value = response.data || []
    pagination.total = response.total || 0
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
    
    if (modalMode.value === 'create') {
      await userApi.createUser(userFormData)
      message.success('User created successfully')
    } else {
      await userApi.updateUser(userFormData.id, userFormData)
      message.success('User updated successfully')
    }
    
    modalVisible.value = false
    fetchUsers()
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

const deleteUser = async (userId) => {
  try {
    await userApi.deleteUser(userId)
    message.success('User deleted successfully')
    fetchUsers()
  } catch (error) {
    message.error('Failed to delete user')
  }
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
  // 실시간 검색은 computed에서 처리
}

const handleStatusFilter = () => {
  // 실시간 필터링은 computed에서 처리
}

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 라이프사이클
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
  padding: 24px;
}

.search-filters {
  margin-bottom: 24px;
}
</style>
