<template>
  <div class="mobile-inspect">
    <el-button text @click="$router.back()">← 返回</el-button>
    <h3 style="margin:12px 0">移动执法巡查</h3>

    <el-card style="margin-bottom:16px">
      <template #header>基本信息</template>
      <el-form :model="form" label-width="80px">
        <el-form-item label="门店">
          <el-select v-model="form.storeId" style="width:100%" disabled>
            <el-option :label="storeName" :value="form.storeId" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查结果">
          <el-radio-group v-model="form.result">
            <el-radio-button value="PASS">合格</el-radio-button>
            <el-radio-button value="RECTIFY">限期整改</el-radio-button>
            <el-radio-button value="FAIL">不合格</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="评分"><el-rate v-model="form.score" :max="5" /></el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-bottom:16px">
      <template #header>安全检查清单</template>
      <el-checkbox-group v-model="checks">
        <div v-for="item in checklist" :key="item" style="padding:8px 0;border-bottom:1px solid #f0f0f0">
          <el-checkbox :label="item">{{ item }}</el-checkbox>
        </div>
      </el-checkbox-group>
    </el-card>

    <el-card style="margin-bottom:16px">
      <template #header>备注</template>
      <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="巡查备注..." />
    </el-card>

    <div style="text-align:center">
      <el-button type="primary" size="large" :loading="submitting" @click="submit">提交巡查报告</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getStoreById } from '@/api/store'
import api from '@/api/request'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const storeName = ref('')
const form = ref({ storeId: 0, result: 'PASS', score: 4, remark: '' })
const checks = ref<string[]>([])
const submitting = ref(false)

const checklist = [
  '门店经营许可证有效且在显著位置悬挂',
  '产品均在许可范围内，无超范围经营',
  '储存量未超过核定存储量',
  '店内无吸烟、点火等违规行为',
  '消防器材齐全且在有效期内',
  '安全通道畅通，无杂物堆放',
  '电气线路符合防爆要求',
  '温湿度在安全范围内',
  '产品标识清晰，含安全等级和标准信息',
  '无店外违规摆放产品',
]

onMounted(async () => {
  const id = parseInt(route.params.storeId as string)
  form.value.storeId = id
  try { const s = await getStoreById(id); storeName.value = s.name } catch { /* */ }
})

async function submit() {
  submitting.value = true
  try {
    await api.post('/inspections', {
      ...form.value,
      result: checks.value.length < checklist.length / 2 ? 'FAIL' : form.value.result,
    })
    ElMessage.success('巡查报告已提交')
    router.push('/gov/stores')
  } catch { /* */ }
  finally { submitting.value = false }
}
</script>

<style scoped>
.mobile-inspect { max-width: 600px; margin: 0 auto; }
</style>
