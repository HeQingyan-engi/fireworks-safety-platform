<template>
  <div class="login-page">
    <el-card style="width:400px">
      <template #header><h2 style="text-align:center">登录</h2></template>
      <el-form :model="form" label-width="0" @submit.prevent="handleLogin">
        <el-form-item><el-input v-model="form.username" placeholder="用户名" prefix-icon="User" /></el-form-item>
        <el-form-item><el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password @keyup.enter="handleLogin" /></el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div style="text-align:center">
        <router-link to="/register">还没有账号？立即注册</router-link>
      </div>
      <el-divider />
      <div style="font-size:12px;color:#999;text-align:center">
        测试账号：admin / 123456（超级管理员）<br />
        manager / 123456（店长）| inspector / 123456（监管员）
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const form = ref({ username: '', password: '' })
const loading = ref(false)

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    const res = await login(form.value)
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    authStore.setUser(res.user)

    const redirect = route.query.redirect as string
    if (res.user.role === 'GOV_INSPECTOR' || res.user.role === 'SUPER_ADMIN') {
      router.push(redirect || '/gov/map')
    } else if (res.user.role === 'ENTERPRISE_ADMIN' || res.user.role === 'STORE_MANAGER' || res.user.role === 'CLERK') {
      router.push(redirect || '/admin/dashboard')
    } else {
      router.push(redirect || '/')
    }
    ElMessage.success('登录成功')
  } catch { /* error handled by interceptor */ }
  finally { loading.value = false }
}
</script>

<style scoped>
.login-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
</style>
