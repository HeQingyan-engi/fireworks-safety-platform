<template>
  <div>
    <h3 style="margin-bottom:16px">数据分析 — 区域安全态势</h3>
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card><template #header>门店状态分布</template>
          <div v-for="item in storeStats" :key="item.label" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0">
            <span>{{ item.label }}</span>
            <span :style="{color:item.color,fontWeight:'bold'}">{{ item.value }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card><template #header>合规评分排名</template>
          <div v-if="compliance?.stores" v-for="(s,i) in compliance.stores.slice(0,5)" :key="s.id" style="padding:6px 0;border-bottom:1px solid #f0f0f0">
            <span style="color:#999;margin-right:8px">#{{ i+1 }}</span>
            {{ s.name }}
            <el-tag size="small" style="float:right">{{ s.complianceScore }}分</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card><template #header>最近预警趋势</template>
          <div v-if="recentAlerts.length===0" style="color:#999;text-align:center">暂无数据</div>
          <div v-for="a in recentAlerts.slice(0,5)" :key="a.id" style="padding:4px 0;font-size:13px;border-bottom:1px solid #f0f0f0">
            <el-tag :type="a.level==='RED'?'danger':'warning'" size="small">{{ a.level }}</el-tag>
            {{ a.title?.slice(0, 30) }}
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStores } from '@/api/store'
import { getAlerts } from '@/api/alert'
import { getComplianceReport } from '@/api/report'

const storeStats = ref([
  { label: '正常门店', value: 0, color: '#67c23a' },
  { label: '注意门店', value: 0, color: '#e6a23c' },
  { label: '危险门店', value: 0, color: '#e63946' },
])
const recentAlerts = ref<any[]>([])
const compliance = ref<any>(null)

onMounted(async () => {
  try {
    const [stores, alerts, comp] = await Promise.all([
      getStores(), getAlerts({ limit: 5 }), getComplianceReport(),
    ])
    storeStats.value[0].value = stores.filter((s: any) => s.status === 'NORMAL').length
    storeStats.value[1].value = stores.filter((s: any) => s.status === 'CAUTION').length
    storeStats.value[2].value = stores.filter((s: any) => s.status === 'DANGER').length
    recentAlerts.value = alerts.data
    compliance.value = comp
  } catch { /* */ }
})
</script>
