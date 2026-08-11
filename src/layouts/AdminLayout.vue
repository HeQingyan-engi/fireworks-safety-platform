<template>
  <div class="admin-layout">
    <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
      <div class="sidebar-header">
        <router-link to="/admin/dashboard" class="sidebar-logo">
          <span v-if="!appStore.sidebarCollapsed">🔥 安万嘉管理</span>
          <span v-else>🔥</span>
        </router-link>
      </div>
      <el-menu
        :default-active="route.path"
        :collapse="appStore.sidebarCollapsed"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/products">
          <el-icon><Goods /></el-icon>
          <span>产品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/inventory">
          <el-icon><Box /></el-icon>
          <span>库存管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/flow">
          <el-icon><Connection /></el-icon>
          <span>流向登记</span>
        </el-menu-item>
        <el-menu-item index="/admin/monitor">
          <el-icon><VideoCamera /></el-icon>
          <span>视频监控</span>
        </el-menu-item>
        <el-menu-item index="/admin/alerts">
          <el-icon><Bell /></el-icon>
          <span>预警管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/reports">
          <el-icon><TrendCharts /></el-icon>
          <span>数据报表</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <div class="admin-header-left">
          <el-button @click="appStore.toggleSidebar()" :icon="Fold" text />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="admin-header-right">
          <span>{{ authStore.user?.realName || authStore.user?.username }}</span>
          <el-button text @click="handleLogout">退出</el-button>
        </div>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { Fold } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

.sidebar {
  width: 220px;
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
  flex-shrink: 0;
}
.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar-logo {
  color: white;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.admin-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
