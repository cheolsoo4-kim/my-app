<template>
  <div class="made-with-vue">
    <!-- 헤더 -->
    <header class="header">
      <div class="container">
        <div class="nav-content">
          <div class="logo">
            <img src="https://vuejs.org/images/logo.png" alt="Vue.js" class="logo-img">
            <span class="logo-text">Made with Vue.js</span>
          </div>
<nav class="nav-menu">
            <a href="#" class="nav-link">Projects</a>
            <a href="#" class="nav-link">Libraries</a>
            <a href="#" class="nav-link">Resources</a>
            <a href="#" class="nav-link">Jobs</a>
            <a-button type="primary" class="submit-btn">Submit Project</a-button>
          </nav>
          
          <!-- 모바일 메뉴 버튼 -->
          <a-button 
            v-if="isMobile"
            type="text" 
            @click="showMobileMenu = true"
            class="mobile-menu-btn"
          >
            <MenuOutlined />
          </a-button>
        </div>
</div>
    </header>

    <!-- 히어로 섹션 -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            Discover amazing projects <br>
            <span class="highlight">built with Vue.js</span>
          </h1>
<p class="hero-subtitle">
            A curated list of projects made by the community. 
            From open-source libraries to production applications.
          </p>
          
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">{{ projectCount }}</span>
              <span class="stat-label">Projects</span>
            </div>
<div class="stat-item">
              <span class="stat-number">{{ categoryCount }}</span>
              <span class="stat-label">Categories</span>
            </div>
<div class="stat-item">
              <span class="stat-number">{{ weeklySubmissions }}</span>
              <span class="stat-label">Weekly submissions</span>
            </div>
</div>
        </div>
</div>
    </section>

    <!-- 필터 섹션 -->
    <section class="filters">
      <div class="container">
        <div class="filter-content">
          <div class="search-section">
            <a-input
              v-model:value="searchQuery"
              placeholder="Search projects..."
              size="large"
              class="search-input"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
          </div>
<div class="filter-tabs">
            <div class="category-filters">
              <a-button
                v-for="category in categories"
                :key="category.key"
                :type="selectedCategory === category.key ? 'primary' : 'default'"
                @click="selectedCategory = category.key"
                class="category-btn"
              >
                <span class="category-icon">{{ category.icon }}</span>
                {{ category.name }}
                <a-badge 
                  :count="category.count" 
                  :number-style="{ backgroundColor: selectedCategory === category.key ? '#fff' : '#f0f0f0', color: selectedCategory === category.key ? '#1890ff' : '#666' }"
                />
              </a-button>
            </div>
<div class="sort-section">
              <a-select
                v-model:value="sortBy"
                size="large"
                style="width: 150px"
                class="sort-select"
              >
                <a-select-option value="recent">Most Recent</a-select-option>
                <a-select-option value="popular">Most Popular</a-select-option>
                <a-select-option value="name">Alphabetical</a-select-option>
              </a-select>
            </div>
</div>
        </div>
</div>
    </section>

    <!-- 프로젝트 그리드 -->
    <section class="projects">
      <div class="container">
        <div class="projects-grid">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            @click="openProject(project)"
          >
            <div class="project-image">
              <img :src="project.image" :alt="project.name" />
              <div class="project-overlay">
                <div class="overlay-content">
                  <a-button type="primary" ghost>
                    <ExternalLinkIcon />
                    Visit Site
                  </a-button>
                  <a-button type="default" ghost>
                    <GithubOutlined />
                    Source
                  </a-button>
                </div>
</div>
            </div>
<div class="project-content">
              <div class="project-header">
                <h3 class="project-name">{{ project.name }}</h3>
<div class="project-tags">
                  <a-tag 
                    v-for="tag in project.tags.slice(0, 2)" 
                    :key="tag"
                    :color="getTagColor(tag)"
                    size="small"
                  >
                    {{ tag }}
                  </a-tag>
                  <span v-if="project.tags.length > 2" class="more-tags">
                    +{{ project.tags.length - 2 }}
                  </span>
                </div>
</div>
              
              <p class="project-description">{{ project.description }}</p>
              
              <div class="project-footer">
                <div class="project-stats">
                  <span class="stat">
                    <HeartOutlined />
                    {{ project.likes }}
                  </span>
                  <span class="stat">
                    <EyeOutlined />
                    {{ project.views }}
                  </span>
                </div>
<div class="project-date">
                  {{ formatDate(project.createdAt) }}
                </div>
</div>
            </div>
</div>
        </div>
<!-- 로딩 -->
        <div v-if="loading" class="loading-section">
          <a-spin size="large" />
          <p>Loading more projects...</p>
        </div>
<!-- Load More 버튼 -->
        <div v-if="hasMore && !loading" class="load-more">
          <a-button 
            type="primary" 
            size="large" 
            @click="loadMore"
            class="load-more-btn"
          >
            Load More Projects
          </a-button>
        </div>
</div>
    </section>

    <!-- 푸터 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo">
              <img src="https://vuejs.org/images/logo.png" alt="Vue.js" class="footer-logo-img">
              <span>Made with Vue.js</span>
            </div>
<p class="footer-desc">
              Showcasing the best projects built with Vue.js framework. 
              Join the community and share your creations.
            </p>
          </div>
<div class="footer-section">
            <h4>Resources</h4>
<ul class="footer-links">
              <li><a href="#">Vue.js Documentation</a></li>
<li><a href="#">Vue Router</a></li>
<li><a href="#">Vuex</a></li>
<li><a href="#">Nuxt.js</a></li>
</ul>
          </div>
<div class="footer-section">
            <h4>Community</h4>
<ul class="footer-links">
              <li><a href="#">Discord</a></li>
<li><a href="#">Twitter</a></li>
<li><a href="#">GitHub</a></li>
<li><a href="#">Reddit</a></li>
</ul>
          </div>
<div class="footer-section">
            <h4>Submit</h4>
<ul class="footer-links">
              <li><a href="#">Submit Project</a></li>
<li><a href="#">Guidelines</a></li>
<li><a href="#">Contact</a></li>
</ul>
          </div>
</div>
        
        <div class="footer-bottom">
          <p> ❤️ </p>
          <div class="social-links">
            <a href="#"><TwitterOutlined /></a>
            <a href="#"><GithubOutlined /></a>
            <a href="#"><LinkedinOutlined /></a>
          </div>
</div>
      </div>
</footer>

    <!-- 모바일 메뉴 드로어 -->
    <a-drawer
      v-model:open="showMobileMenu"
      title="Menu"
      placement="right"
      :width="280"
    >
      <div class="mobile-menu">
        <a href="#" class="mobile-nav-link">Projects</a>
        <a href="#" class="mobile-nav-link">Libraries</a>
        <a href="#" class="mobile-nav-link">Resources</a>
        <a href="#" class="mobile-nav-link">Jobs</a>
        <a-divider />
        <a-button type="primary" block size="large">
          Submit Project
        </a-button>
      </div>
</a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  SearchOutlined, 
  MenuOutlined, 
  HeartOutlined, 
  EyeOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined
} from '@ant-design/icons-vue'

// 반응형 감지
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 상태 관리
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('recent')
const loading = ref(false)
const hasMore = ref(true)
const showMobileMenu = ref(false)

// 통계 데이터
const projectCount = ref(1247)
const categoryCount = ref(12)
const weeklySubmissions = ref(23)

// 카테고리 데이터
const categories = ref([
  { key: 'all', name: 'All', icon: '🌟', count: 1247 },
  { key: 'apps', name: 'Apps', icon: '📱', count: 423 },
  { key: 'websites', name: 'Websites', icon: '🌐', count: 356 },
  { key: 'components', name: 'Components', icon: '🧩', count: 189 },
  { key: 'plugins', name: 'Plugins', icon: '🔌', count: 134 },
  { key: 'tools', name: 'Tools', icon: '🛠️', count: 98 },
  { key: 'games', name: 'Games', icon: '🎮', count: 47 }
])

// 프로젝트 데이터 (샘플)
const projects = ref([
  {
    id: 1,
    name: 'Vue Admin Dashboard',
    description: 'Modern admin dashboard built with Vue 3, TypeScript and Ant Design Vue.',
    image: 'https://picsum.photos/400/250?random=1',
    tags: ['Admin', 'Dashboard', 'TypeScript'],
    category: 'apps',
    likes: 234,
    views: 1520,
    createdAt: new Date('2024-01-15'),
    url: 'https://example.com'
  },
  {
    id: 2,
    name: 'E-Commerce Platform',
    description: 'Full-featured e-commerce platform with Vue.js frontend and Node.js backend.',
    image: 'https://picsum.photos/400/250?random=2',
    tags: ['E-commerce', 'Nuxt.js', 'Stripe'],
    category: 'websites',
    likes: 189,
    views: 2340,
    createdAt: new Date('2024-01-10'),
    url: 'https://example.com'
  },
  {
    id: 3,
    name: 'Vue Calendar Component',
    description: 'Highly customizable calendar component for Vue applications.',
    image: 'https://picsum.photos/400/250?random=3',
    tags: ['Component', 'Calendar', 'Vue 3'],
    category: 'components',
    likes: 156,
    views: 890,
    createdAt: new Date('2024-01-08'),
    url: 'https://example.com'
  },
  {
    id: 4,
    name: 'Task Management App',
    description: 'Beautiful and intuitive task management application built with Vue and Firebase.',
    image: 'https://picsum.photos/400/250?random=4',
    tags: ['Productivity', 'Firebase', 'PWA'],
    category: 'apps',
    likes: 298,
    views: 1780,
    createdAt: new Date('2024-01-05'),
    url: 'https://example.com'
  },
  {
    id: 5,
    name: 'Portfolio Website',
    description: 'Creative portfolio website template for designers and developers.',
    image: 'https://picsum.photos/400/250?random=5',
    tags: ['Portfolio', 'Template', 'Animation'],
    category: 'websites',
    likes: 167,
    views: 1230,
    createdAt: new Date('2024-01-03'),
    url: 'https://example.com'
  },
  {
    id: 6,
    name: 'Vue Development Tools',
    description: 'Essential development tools and utilities for Vue.js developers.',
    image: 'https://picsum.photos/400/250?random=6',
    tags: ['DevTools', 'CLI', 'Productivity'],
    category: 'tools',
    likes: 445,
    views: 3210,
    createdAt: new Date('2024-01-01'),
    url: 'https://example.com'
  }
])

// 필터링된 프로젝트
const filteredProjects = computed(() => {
  let filtered = projects.value

  // 카테고리 필터
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 정렬
  if (sortBy.value === 'popular') {
    filtered.sort((a, b) => b.likes - a.likes)
  } else if (sortBy.value === 'recent') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy.value === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  }

  return filtered
})

// 유틸리티 함수들
const getTagColor = (tag) => {
  const colors = {
    'Admin': 'blue',
    'Dashboard': 'cyan',
    'TypeScript': 'purple',
    'E-commerce': 'green',
    'Nuxt.js': 'geekblue',
    'Component': 'orange',
    'Vue 3': 'green',
    'PWA': 'blue',
    'Template': 'magenta'
  }
  return colors[tag] || 'default'
}

const formatDate = (date) => {
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}

const openProject = (project) => {
  window.open(project.url, '_blank')
}

const loadMore = () => {
  loading.value = true
  // 실제 구현시 API 호출
  setTimeout(() => {
    loading.value = false
    // 더 많은 프로젝트 로드 로직
  }, 1000)
}

// 라이프사이클
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* 전체 스타일 */
.made-with-vue {
  min-height: 100vh;
  background: #fafafa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 헤더 */
.header {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #1890ff;
}

.submit-btn {
  border-radius: 6px;
  font-weight: 600;
}

.mobile-menu-btn {
  display: none;
}

/* 히어로 섹션 */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  text-align: center;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 24px;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 60px;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 80px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 필터 섹션 */
.filters {
  background: white;
  padding: 40px 0;
  border-bottom: 1px solid #f0f0f0;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.search-section {
  text-align: center;
}

.search-input {
  max-width: 500px;
  border-radius: 8px;
}

.filter-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  height: 40px;
  padding: 0 16px;
}

.category-icon {
  font-size: 16px;
}

.sort-select {
  border-radius: 6px;
}

/* 프로젝트 그리드 */
.projects {
  padding: 60px 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
}

.project-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.project-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-card:hover .project-image img {
  transform: scale(1.05);
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  gap: 12px;
}

.project-content {
  padding: 24px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.project-tags {
  display: flex;
  gap: 4px;
  align-items: center;
}

.more-tags {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

.project-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.project-date {
  font-size: 12px;
  color: #999;
}

/* 로딩 및 더보기 */
.loading-section {
  text-align: center;
  padding: 40px 0;
}

.loading-section p {
  margin-top: 16px;
  color: #666;
}

.load-more {
  text-align: center;
}

.load-more-btn {
  height: 48px;
  padding: 0 32px;
  border-radius: 8px;
  font-weight: 600;
}

/* 푸터 */
.footer {
  background: #2c3e50;
  color: white;
  padding: 60px 0 30px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.footer-logo-img {
  width: 24px;
  height: 24px;
}

.footer-desc {
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-section h4 {
  margin-bottom: 16px;
  color: white;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-links a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid #34495e;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-links a {
  color: #bdc3c7;
  font-size: 18px;
  transition: color 0.3s;
}

.social-links a:hover {
  color: white;
}

/* 모바일 메뉴 */
.mobile-menu {
  padding: 20px 0;
}

.mobile-nav-link {
  display: block;
  padding: 12px 0;
  color: #666;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid #f0f0f0;
}

/* 반응형 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .hero {
    padding: 60px 0;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 32px;
  }
  
  .filter-tabs {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .category-filters {
    justify-content: center;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }
  
  .category-filters {
    flex-direction: column;
  }
  
  .category-btn {
    justify-content: center;
  }
}
</style>