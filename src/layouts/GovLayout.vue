<template>
  <div class="gov-layout">
    <header class="gov-header">
      <div class="gov-header-left">
        <h2>🏛️ 烟花爆竹安全监管平台</h2>
      </div>
      <nav class="gov-nav">
        <router-link to="/gov/map">实时地图</router-link>
        <router-link to="/gov/stores">门店管理</router-link>
        <router-link to="/gov/alerts">预警管理</router-link>
        <router-link to="/gov/dashboard">数据分析</router-link>
      </nav>
      <div class="gov-header-right">
        <span>{{ authStore.user?.realName || authStore.user?.username }}</span>
        <el-button text @click="handleLogout">退出</el-button>
      </div>
    </header>
    <main class="gov-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.gov-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.gov-header {
  height: 56px;
  background: linear-gradient(135deg, #1a3a5c, #2c5f8a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.gov-header-left h2 {
  font-size: 18px;
  font-weight: 600;
}

.gov-nav {
  display: flex;
  gap: 8px;
}
.gov-nav a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}
.gov-nav a:hover,
.gov-nav a.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.gov-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
.gov-header-right .el-button {
  color: rgba(255, 255, 255, 0.8);
}

.gov-content {
  flex: 1;
  padding: 20px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}
</style>
