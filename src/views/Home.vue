<template>
  <div class="home-page">
    <a-row justify="center" align="middle" style="min-height: 80vh;">
      <a-col :xs="24" :sm="20" :md="16" :lg="12">
        <a-card class="welcome-card" :bordered="false">
          <template #cover>
            <div class="card-cover">
              <h1 class="welcome-title">
                <RocketOutlined />
                Vue App
              </h1>
</div>
          </template>
          
          <a-card-meta
            title="Vue 3 + Vite + Ant Design Vue"
            description="OpenAPI와 함께하는 현대적인 웹 애플리케이션"
          />
          
          <div class="page-navigation">
            <a-row :gutter="[16, 16]">
              <a-col :xs="24" :sm="12">
                <a-card hoverable @click="$router.push('/youtube')">
                  <template #cover>
                    <div class="nav-card-cover youtube">
                      <YoutubeOutlined style="font-size: 48px; color: #ff0000;" />
                    </div>
</template>
                  <a-card-meta
                    title="YouTube Background"
                    description="배경 영상이 있는 페이지"
                  />
                </a-card>
              </a-col>
              
              <a-col :xs="24" :sm="12">
                <a-card hoverable @click="$router.push('/m')">
                  <template #cover>
                    <div class="nav-card-cover m-page">
                      <AppstoreOutlined style="font-size: 48px; color: #52c41a;" />
                    </div>
</template>
                  <a-card-meta
                    title="Test M Page"
                    description="기능들이 있는 페이지"
                  />
                </a-card>
              </a-col>
              
              <a-col :xs="24" :sm="12">
                <a-card hoverable @click="$router.push('/users')">
                  <template #cover>
                    <div class="nav-card-cover users">
                      <UserOutlined style="font-size: 48px; color: #1890ff;" />
                    </div>
</template>
                  <a-card-meta
                    title="User Management"
                    description="사용자 관리 페이지"
                  />
                </a-card>
              </a-col>
              
              <a-col :xs="24" :sm="12">
                <a-card hoverable @click="$router.push('/api-docs')">
                  <template #cover>
                    <div class="nav-card-cover api-docs">
                      <ApiOutlined style="font-size: 48px; color: #722ed1;" />
                    </div>
</template>
                  <a-card-meta
                    title="API Documentation"
                    description="OpenAPI 문서"
                  />
                </a-card>
              </a-col>
            </a-row>
          </div>
</a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.home-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100%;
  padding: 40px 20px;
}

.welcome-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.card-cover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  text-align: center;
}

.welcome-title {
  color: white;
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-navigation {
  margin-top: 30px;
}

.nav-card-cover {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-bottom: 16px;
}

.nav-card-cover.youtube {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.nav-card-cover.m-page {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.nav-card-cover.users {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
}

.nav-card-cover.api-docs {
  background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
}
</style>
