<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>预警管理</h3>
      <div style="display:flex;gap:8px">
        <el-select v-model="filterLevel" placeholder="等级" clearable style="width:100px" @change="load">
          <el-option label="红色" value="RED" /><el-option label="橙色" value="ORANGE" /><el-option label="黄色" value="YELLOW" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width:100px" @change="load">
          <el-option label="新预警" value="NEW" /><el-option label="已确认" value="ACKNOWLEDGED" /><el-option label="处理中" value="HANDLING" /><el-option label="已解决" value="RESOLVED" />
        </el-select>
      </div>
    </div>

    <el-table :data="alerts" border stripe v-loading="loading">
      <el-table-column label="等级" width="70">
        <template #default="{row}">
          <el-tag :type="row.level==='RED'?'danger':row.level==='ORANGE'?'warning':'info'" size="small">{{ levelLabel(row.level) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="预警内容" min-width="200" />
      <el-table-column label="类型" width="100">
        <template #default="{row}">{{ typeLabel(row.type) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{row}">
          <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="160">
        <template #default="{row}">{{ new Date(row.createdAt).toLocaleString() }}</template>
      </el-table-column>
      <el-table-column label="操作" width="240">
        <template #default="{row}">
          <template v-if="row.status === 'NEW'">
            <el-button size="small" @click="updateStatus(row.id, 'ACKNOWLEDGED')">确认</el-button>
            <el-button size="small" type="warning" @click="updateStatus(row.id, 'HANDLING')">处理</el-button>
          </template>
          <template v-else-if="row.status === 'ACKNOWLEDGED' || row.status === 'HANDLING'">
            <el-upload :action="`/api/alerts/${row.id}/upload-proof`" :headers="uploadHeaders" :show-file-list="false" :on-success="() => load()" accept="image/*">
              <el-button size="small" type="success">上传凭证</el-button>
            </el-upload>
          </template>
          <span v-else style="color:#67c23a">✅ 已解决</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAlerts, updateAlertStatus } from '@/api/alert'
import { ALERT_TYPE_LABELS, ALERT_LEVEL_LABELS, ALERT_STATUS_LABELS } from '@/types/alert'
import { ElMessage } from 'element-plus'
import type { AlertType, AlertLevel, AlertStatus } from '@/types/alert'

const alerts = ref<any[]>([])
const loading = ref(false)
const filterLevel = ref('')
const filterStatus = ref('')

const uploadHeaders = computed(() => ({ Authorization: `Bearer ${localStorage.getItem('accessToken')}` }))

function typeLabel(t: AlertType) { return ALERT_TYPE_LABELS[t] || t }
function levelLabel(l: AlertLevel) { return ALERT_LEVEL_LABELS[l] || l }
function statusLabel(s: AlertStatus) { return ALERT_STATUS_LABELS[s] || s }
function statusType(s: AlertStatus) {
  return { NEW: 'danger', ACKNOWLEDGED: 'warning', HANDLING: 'primary', RESOLVED: 'success' }[s] || 'info'
}

async function load() {
  loading.value = true
  try {
    const params: any = {}
    if (filterLevel.value) params.level = filterLevel.value
    if (filterStatus.value) params.status = filterStatus.value
    const d = await getAlerts(params)
    alerts.value = d.data
  } catch { /* */ }
  finally { loading.value = false }
}

async function updateStatus(id: number, status: string) {
  try { await updateAlertStatus(id, status); ElMessage.success('状态已更新'); await load() } catch { /* */ }
}

onMounted(load)
</script>
