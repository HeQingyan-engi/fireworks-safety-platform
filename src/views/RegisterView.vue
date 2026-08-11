<template>
  <div class="register-page">
    <el-card style="width:400px">
      <template #header><h2 style="text-align:center">注册</h2></template>
      <el-form :model="form" label-width="0">
        <el-form-item><el-input v-model="form.username" placeholder="用户名" /></el-form-item>
        <el-form-item><el-input v-model="form.password" type="password" placeholder="密码" show-password /></el-form-item>
        <el-form-item><el-input v-model="form.realName" placeholder="真实姓名" /></el-form-item>
        <el-form-item><el-input v-model="form.phone" placeholder="手机号" /></el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="handleRegister">注册</el-button>
        </el-form-item>
      </el-form>
      <div style="text-align:center">
        <router-link to="/login">已有账号？去登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({ username: '', password: '', realName: '', phone: '' })
const loading = ref(false)

async function handleRegister() {
  if (form.value.username.length < 3 || form.value.password.length < 6) {
    ElMessage.warning('用户名至少3位，密码至少6位')
    return
  }
  loading.value = true
  try {
    const res = await register(form.value)
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    ElMessage.success('注册成功')
    router.push('/')
  } catch { /* */ }
  finally { loading.value = false }
}
</script>

<style scoped>
.register-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
</style>
