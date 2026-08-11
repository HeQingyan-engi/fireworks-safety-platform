<template>
  <div>
    <h3 style="margin-bottom:16px">预警管理</h3>
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="6" v-for="card in statCards" :key="card.label">
        <el-card shadow="hover"><div style="text-align:center"><div :style="{fontSize:'28px',fontWeight:'bold',color:card.color}">{{card.value}}</div><div style="color:#999;font-size:13px">{{card.label}}</div></div></el-card>
      </el-col>
    </el-row>
    <el-table :data="alerts" border stripe v-loading="loading">
      <el-table-column label="等级" width="70"><template #default="{row}"><el-tag :type="row.level==='RED'?'danger':row.level==='ORANGE'?'warning':'info'" size="small">{{row.level}}</el-tag></template></el-table-column>
      <el-table-column prop="store.name" label="门店" width="120" />
      <el-table-column prop="title" label="内容" />
      <el-table-column prop="status" label="状态" width="80" />
      <el-table-column label="时间" width="160"><template #default="{row}">{{new Date(row.createdAt).toLocaleString()}}</template></el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAlerts, getAlertStats } from '@/api/alert'

const alerts = ref<any[]>([])
const loading = ref(false)
const statCards = ref([
  { label: '总预警', value: 0, color: '#333' },
  { label: '未解决', value: 0, color: '#e63946' },
  { label: '红色预警', value: 0, color: '#c1121f' },
  { label: '橙色预警', value: 0, color: '#e76f51' },
])

onMounted(async () => {
  loading.value = true
  try {
    const [d, stats] = await Promise.all([getAlerts({ limit: 50 }), getAlertStats()])
    alerts.value = d.data
    statCards.value[0].value = stats.total
    statCards.value[1].value = stats.unresolved
    statCards.value[2].value = stats.byLevel?.find((l: any) => l.level === 'RED')?._count || 0
    statCards.value[3].value = stats.byLevel?.find((l: any) => l.level === 'ORANGE')?._count || 0
  } catch { /* */ }
  finally { loading.value = false }
})
</script>
