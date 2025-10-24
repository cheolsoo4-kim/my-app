<template>
  <div class="m-page">
    <div class="container">
      <h1>test Page</h1>
<p>각각 테스트  페이지입니다</p>
      
      <div class="features">
	      <div class="feature-card" @click="goToTest">
          <h3>대시보드</h3>
	  <p>json데이터로 구현한 대시 보드<br> (sql[X],단일페이지) </p>
        </div>
<div class="feature-card" @click="goToType">
	<h3>타자[단어]게임</h3>
	<p>PostgreSql15+vue3.0<br>+antd+node.js<br>+swagger-ui</p>
        </div>
	<div class="feature-card" @click="goToBus">
          <h3>API연동</h3>
<p>창원버스API2개+카카오맵API 연동처리.</p>
        </div>
</div>

      <router-link to="/" class="home-btn">홈으로 돌아가기</router-link>
    </div>
</div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('M 페이지가 로드되었습니다!')
})
</script>
<script>
export default {
	name: "Mpage",
	methods: {
		goToTest(){
			this.$router.push('/m/test');
		},
		goToType(){
			this.$router.push('/type');
		},
		goToBus(){
			this.$router.push('/bus');
		}


	}

}

</script>


<style scoped>
.m-page {
  min-height: 100vh;
  background:  #000000 ;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.m-page2 {
  min-height: 100vh;
  background: linear-gradient(135deg, #cccccc 0%, #000000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  max-width: 800px;
  text-align: center;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

p {
  font-size: 1.2rem;
  margin-bottom: 40px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 30px;
  border-radius: 15px;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.home-btn {
  display: inline-block;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
</style>
