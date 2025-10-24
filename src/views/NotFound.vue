<template>
  <div class="not-found">
    <div class="container">
      <h1>404</h1>
<p>페이지를 찾을 수 없습니다.</p>
      <router-link to="/" class="home-btn">홈으로 돌아가기</router-link>
    </div>
</div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  text-align: center;
}

h1 {
  font-size: 5rem;
  margin-bottom: 20px;
}

p {
  font-size: 1.5rem;
  margin-bottom: 30px;
}

.home-btn {
  display: inline-block;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
