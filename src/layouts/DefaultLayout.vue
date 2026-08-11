<template>
  <div class="default-layout">
    <header class="header">
      <div class="header-inner">
        <router-link to="/" class="logo">
          <img src="/logo.jpg" alt="安万嘉" />
          <span>安万嘉烟花展厅</span>
        </router-link>
        <nav class="nav">
          <router-link to="/">首页</router-link>
          <router-link to="/about">关于我们</router-link>
          <template v-if="authStore.isLoggedIn">
            <span class="user-name">{{ authStore.user?.realName || authStore.user?.username }}</span>
            <a href="#" @click.prevent="handleLogout">退出</a>
          </template>
          <router-link v-else to="/login">登录</router-link>
        </nav>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>

    <CartFloat />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import CartFloat from '@/components/CartFloat.vue'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #e63946, #d62828);
  color: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  text-decoration: none;
  font-size: 20px;
  font-weight: bold;
}
.logo img {
  width: 36px;
  height: 36px;
  border-radius: 4px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 20px;
}
.nav a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}
.nav a:hover {
  color: white;
}

.user-name {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
