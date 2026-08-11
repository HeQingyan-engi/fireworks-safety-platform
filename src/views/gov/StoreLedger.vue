<template>
  <div>
    <el-button text @click="$router.back()">← 返回</el-button>
    <h3 v-if="store" style="margin:12px 0">{{ store.name }} — 一企一档</h3>
    <el-tabs v-model="activeTab" v-if="store">
      <el-tab-pane label="基本信息" name="info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="门店名称">{{ store.name }}</el-descriptions-item>
          <el-descriptions-item label="许可证号">{{ store.code }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ store.address }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ store.contact || '-' }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ store.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="核定存储量">{{ store.capacity ? store.capacity + 'g' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="store.status==='NORMAL'?'success':store.status==='CAUTION'?'warning':'danger'">
              {{ store.status==='NORMAL'?'正常':store.status==='CAUTION'?'注意':'危险' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane label="预警记录" name="alerts">
        <el-table :data="alerts" border>
          <el-table-column label="等级" width="70"><template #default="{row}"><el-tag :type="row.level==='RED'?'danger':'warning'" size="small">{{row.level}}</el-tag></template></el-table-column>
          <el-table-column prop="title" label="内容" />
          <el-table-column prop="status" label="状态" width="80" />
          <el-table-column label="时间" width="160"><template #default="{row}">{{new Date(row.createdAt).toLocaleString()}}</template></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="巡查记录" name="inspections">
        <div v-if="inspections.length===0" style="color:#999;text-align:center;padding:20px">暂无巡查记录</div>
        <el-table v-else :data="inspections" border>
          <el-table-column prop="inspector.realName" label="巡查员" width="80" />
          <el-table-column label="结果" width="80"><template #default="{row}"><el-tag :type="row.result==='PASS'?'success':'danger'" size="small">{{row.result}}</el-tag></template></el-table-column>
          <el-table-column prop="score" label="评分" width="60" />
          <el-table-column prop="remark" label="备注" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getStoreById } from '@/api/store'
import api from '@/api/request'
import type { Store } from '@/types/store'

const route = useRoute()
const store = ref<Store | null>(null)
const alerts = ref<any[]>([])
const inspections = ref<any[]>([])
const activeTab = ref('info')

onMounted(async () => {
  try {
    const id = parseInt(route.params.id as string)
    store.value = await getStoreById(id)
    const [aRes, iRes] = await Promise.all([
      api.get('/alerts', { params: { storeId: id } }),
      api.get('/inspections/store/' + id),
    ])
    alerts.value = aRes.data.data
    inspections.value = iRes.data
  } catch { /* */ }
})
</script>
