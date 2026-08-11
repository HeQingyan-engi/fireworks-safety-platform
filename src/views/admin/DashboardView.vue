<template>
  <div class="dashboard">
    <h3 style="margin-bottom:16px">📊 管理仪表盘</h3>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div class="stat-card">
            <div class="stat-icon">{{ card.icon }}</div>
            <div class="stat-info">
              <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
              <div class="stat-label">{{ card.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 最近预警列表（含详细时间和上传信息） -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🔔 最近预警详情</span>
              <el-button type="primary" size="small" text @click="$router.push('/admin/alerts')">
                查看全部 →
              </el-button>
            </div>
          </template>

          <div v-if="recentAlerts.length === 0" style="text-align:center;padding:40px;color:#999">
            ✅ 暂无预警，一切正常
          </div>

          <el-table v-else :data="recentAlerts" stripe style="width:100%" max-height="420">
            <el-table-column label="等级" width="90">
              <template #default="{ row }">
                <el-tag
                  :type="row.level === 'RED' ? 'danger' : row.level === 'ORANGE' ? 'warning' : 'info'"
                  size="small"
                  effect="dark"
                >
                  {{ getLevelLabel(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <span style="font-size:13px">{{ getTypeLabel(row.type) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="预警标题" min-width="160" show-overflow-tooltip />
            <el-table-column label="上传时间" width="170">
              <template #default="{ row }">
                <span style="font-size:12px;color:#666">{{ formatTime(row.createdAt) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧面板 -->
      <el-col :span="8">
        <!-- 快捷入口 -->
        <el-card style="margin-bottom:16px">
          <template #header><span>⚡ 快捷入口</span></template>
          <el-row :gutter="8">
            <el-col :span="8" v-for="link in quickLinks" :key="link.path" style="margin-bottom:8px">
              <router-link :to="link.path" style="text-decoration:none">
                <div class="quick-link-card">
                  <div class="quick-link-icon">{{ link.icon }}</div>
                  <div class="quick-link-label">{{ link.label }}</div>
                </div>
              </router-link>
            </el-col>
          </el-row>
        </el-card>

        <!-- 预警统计 -->
        <el-card style="margin-bottom:16px">
          <template #header><span>📈 预警统计（近7天）</span></template>
          <div class="alert-stats">
            <div class="alert-stat-item">
              <span class="alert-stat-dot" style="background:#e63946"></span>
              <span class="alert-stat-label">红色预警</span>
              <span class="alert-stat-count">{{ alertCounts.red }}</span>
            </div>
            <div class="alert-stat-item">
              <span class="alert-stat-dot" style="background:#e6a23c"></span>
              <span class="alert-stat-label">橙色预警</span>
              <span class="alert-stat-count">{{ alertCounts.orange }}</span>
            </div>
            <div class="alert-stat-item">
              <span class="alert-stat-dot" style="background:#f5a623"></span>
              <span class="alert-stat-label">黄色预警</span>
              <span class="alert-stat-count">{{ alertCounts.yellow }}</span>
            </div>
            <el-divider style="margin:8px 0" />
            <div class="alert-stat-item">
              <span class="alert-stat-dot" style="background:#67c23a"></span>
              <span class="alert-stat-label">已解决</span>
              <span class="alert-stat-count">{{ alertCounts.resolved }}</span>
            </div>
            <div class="alert-stat-item">
              <span class="alert-stat-dot" style="background:#909399"></span>
              <span class="alert-stat-label">未处理</span>
              <span class="alert-stat-count" style="color:#e63946">{{ alertCounts.unresolved }}</span>
            </div>
          </div>
        </el-card>

        <!-- 最近上传记录 -->
        <el-card>
          <template #header><span>📤 最近数据上传</span></template>
          <div class="upload-feed">
            <div v-for="(log, idx) in recentUploads" :key="idx" class="upload-feed-item">
              <span class="upload-feed-icon">{{ log.icon }}</span>
              <div class="upload-feed-info">
                <span class="upload-feed-title">{{ log.title }}</span>
                <span class="upload-feed-time">{{ log.time }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部：传感器状态 + 硬件连接 -->
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card>
          <template #header><span>🌡️ 环境传感器状态（实时）</span></template>
          <el-table :data="sensorTable" stripe size="small">
            <el-table-column prop="name" label="传感器名称" width="160" />
            <el-table-column prop="location" label="位置" width="120" />
            <el-table-column label="温度" width="100">
              <template #default="{ row }">
                <span :style="{ color: row.temp > 35 ? '#e63946' : row.temp > 30 ? '#e6a23c' : '#333' }">
                  {{ row.temp }}°C
                </span>
              </template>
            </el-table-column>
            <el-table-column label="湿度" width="100">
              <template #default="{ row }">
                <span :style="{ color: row.humidity > 75 ? '#e63946' : row.humidity > 65 ? '#e6a23c' : '#333' }">
                  {{ row.humidity }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column label="最后上传" width="160">
              <template #default="{ row }">
                <span style="font-size:12px;color:#999">{{ row.lastUpload }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.online ? 'success' : 'danger'" size="small">
                  {{ row.online ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>🖥️ 硬件设备连接状态</span></template>
          <el-table :data="deviceTable" stripe size="small">
            <el-table-column prop="name" label="设备名称" width="160" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column label="连接状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.connected ? 'success' : 'danger'" size="small">
                  {{ row.connected ? '● 已连接' : '● 断开' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最后心跳" width="160">
              <template #default="{ row }">
                <span style="font-size:12px;color:#999">{{ row.lastHeartbeat }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数据上传间隔" width="120">
              <template #default="{ row }">
                <span style="font-size:12px">{{ row.uploadInterval }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getAlerts, getAlertStats } from '@/api/alert'
import { ALERT_TYPE_LABELS, ALERT_LEVEL_LABELS, ALERT_STATUS_LABELS } from '@/types/alert'
import type { Alert } from '@/types/alert'

const statCards = ref([
  { icon: '🔔', title: '未处理预警', value: 0, color: '#e63946' },
  { icon: '📦', title: '今日订单', value: 0, color: '#409eff' },
  { icon: '🎆', title: '产品总数', value: 0, color: '#67c23a' },
  { icon: '📋', title: '库存项数', value: 0, color: '#e6a23c' },
])

const recentAlerts = ref<Alert[]>([])
const alertCounts = ref({ red: 0, orange: 0, yellow: 0, resolved: 0, unresolved: 0 })

const quickLinks = [
  { icon: '📦', label: '产品管理', path: '/admin/products' },
  { icon: '📋', label: '库存管理', path: '/admin/inventory' },
  { icon: '📝', label: '订单管理', path: '/admin/orders' },
  { icon: '📊', label: '流向登记', path: '/admin/flow' },
  { icon: '📹', label: '视频监控', path: '/admin/monitor' },
  { icon: '🔔', label: '预警管理', path: '/admin/alerts' },
]

// 传感器数据（模拟实时）
const sensorTable = ref([
  { name: '温湿度传感器#01', location: '展示区', temp: 28.5, humidity: 55, lastUpload: '刚刚', online: true },
  { name: '温湿度传感器#02', location: '仓库A区', temp: 33.8, humidity: 68, lastUpload: '30秒前', online: true },
  { name: '温湿度传感器#03', location: '仓库B区', temp: 32.1, humidity: 62, lastUpload: '1分钟前', online: true },
  { name: '温湿度传感器#04', location: '顾客区', temp: 26.2, humidity: 50, lastUpload: '刚刚', online: true },
])

// 硬件设备连接状态
const deviceTable = ref([
  { name: 'AI摄像头#01', type: '网络摄像头', connected: true, lastHeartbeat: '3秒前', uploadInterval: '实时（25fps）' },
  { name: 'AI摄像头#02', type: '网络摄像头', connected: true, lastHeartbeat: '5秒前', uploadInterval: '实时（25fps）' },
  { name: 'AI摄像头#03', type: '网络摄像头', connected: true, lastHeartbeat: '2秒前', uploadInterval: '实时（25fps）' },
  { name: 'AI摄像头#04', type: '网络摄像头', connected: true, lastHeartbeat: '8秒前', uploadInterval: '实时（25fps）' },
  { name: 'RFID读写器', type: '物联网网关', connected: true, lastHeartbeat: '15秒前', uploadInterval: '30秒' },
  { name: 'LoRa网关', type: '通信基站', connected: true, lastHeartbeat: '10秒前', uploadInterval: '30秒' },
  { name: '烟感探测器#01', type: '消防设备', connected: true, lastHeartbeat: '30秒前', uploadInterval: '1秒（仅报警时）' },
  { name: '烟感探测器#02', type: '消防设备', connected: true, lastHeartbeat: '28秒前', uploadInterval: '1秒（仅报警时）' },
])

// 最近上传记录
const recentUploads = ref([
  { icon: '🌡️', title: '温湿度传感器#01-#04 批量上传', time: '刚刚' },
  { icon: '📹', title: 'AI摄像头#02 检测快照上传', time: '15秒前' },
  { icon: '📦', title: 'RFID库存盘点数据上传', time: '30秒前' },
  { icon: '📹', title: 'AI摄像头#01 人员计数数据上传', time: '45秒前' },
  { icon: '📹', title: 'AI摄像头#03 检测快照上传', time: '1分钟前' },
  { icon: '📋', title: '订单同步数据上报', time: '2分钟前' },
])

let refreshTimer: ReturnType<typeof setInterval> | null = null

function formatTime(timeStr: string) {
  if (!timeStr) return '-'
  try { return new Date(timeStr).toLocaleString('zh-CN') } catch { return timeStr }
}

function getLevelLabel(level: string) { return ALERT_LEVEL_LABELS[level as keyof typeof ALERT_LEVEL_LABELS] || level }
function getTypeLabel(type: string) { return ALERT_TYPE_LABELS[type as keyof typeof ALERT_TYPE_LABELS] || type }
function getStatusLabel(status: string) { return ALERT_STATUS_LABELS[status as keyof typeof ALERT_STATUS_LABELS] || status }

function getStatusTag(status: string) {
  const map: Record<string, string> = { NEW: 'danger', ACKNOWLEDGED: 'warning', HANDLING: '', RESOLVED: 'success' }
  return map[status] || 'info'
}

async function loadData() {
  try {
    const stats = await getAlertStats()
    statCards.value[0].value = stats.unresolved || 0
    alertCounts.value.unresolved = stats.unresolved || 0
    alertCounts.value.resolved = stats.resolved || 0
    alertCounts.value.red = stats.redCount || 0
    alertCounts.value.orange = stats.orangeCount || 0
    alertCounts.value.yellow = stats.yellowCount || 0
  } catch {
    // 模拟数据
    statCards.value = [
      { icon: '🔔', title: '未处理预警', value: 2, color: '#e63946' },
      { icon: '📦', title: '今日订单', value: 15, color: '#409eff' },
      { icon: '🎆', title: '产品总数', value: 128, color: '#67c23a' },
      { icon: '📋', title: '库存项数', value: 856, color: '#e6a23c' },
    ]
    alertCounts.value = { red: 3, orange: 5, yellow: 8, resolved: 12, unresolved: 2 }
  }

  try {
    const alerts = await getAlerts({ limit: 10 })
    recentAlerts.value = alerts.data || []
  } catch {
    const now = new Date()
    recentAlerts.value = [
      { id: 101, type: 'OVERSTOCK', level: 'ORANGE', title: '仓库库存接近容量上限', status: 'ACKNOWLEDGED', createdAt: new Date(now.getTime() - 120000).toISOString() },
      { id: 100, type: 'TEMP_HUMIDITY_ANOMALY', level: 'YELLOW', title: '仓库温度偏高(34.2°C)', status: 'HANDLING', createdAt: new Date(now.getTime() - 600000).toISOString() },
      { id: 99, type: 'CROWD_GATHERING', level: 'ORANGE', title: '店内人员达到10人', status: 'RESOLVED', createdAt: new Date(now.getTime() - 1500000).toISOString() },
      { id: 98, type: 'SMOKE_FIRE', level: 'RED', title: '仓库烟感触发（误报已排除）', status: 'RESOLVED', createdAt: new Date(now.getTime() - 7200000).toISOString() },
    ] as Alert[]
  }
}

// 模拟实时更新
function simulateUpdates() {
  const now = new Date()
  sensorTable.value.forEach((s) => {
    const jitter = (Math.random() - 0.5) * 2
    s.temp = +(Number(s.temp) + jitter).toFixed(1)
    s.humidity = +(Number(s.humidity) + jitter * 2).toFixed(0)
    s.lastUpload = '刚刚'
  })
  deviceTable.value.forEach((d) => {
    d.lastHeartbeat = `${Math.floor(Math.random() * 30) + 1}秒前`
  })
  recentUploads.value[0].time = '刚刚'
}

onMounted(() => {
  loadData()
  refreshTimer = setInterval(simulateUpdates, 15000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  font-size: 36px;
  flex-shrink: 0;
}
.stat-info {
  flex: 1;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  line-height: 1.2;
}
.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 快捷入口 */
.quick-link-card {
  text-align: center;
  padding: 12px 4px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-link-card:hover {
  border-color: #e63946;
  box-shadow: 0 2px 8px rgba(230, 57, 70, 0.1);
  transform: translateY(-1px);
}
.quick-link-icon {
  font-size: 24px;
}
.quick-link-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* 预警统计 */
.alert-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.alert-stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.alert-stat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.alert-stat-label {
  flex: 1;
  font-size: 13px;
  color: #666;
}
.alert-stat-count {
  font-weight: bold;
  font-size: 16px;
}

/* 上传动态 */
.upload-feed {
  max-height: 240px;
  overflow-y: auto;
}
.upload-feed-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.upload-feed-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.upload-feed-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.upload-feed-title {
  font-size: 12px;
  color: #333;
}
.upload-feed-time {
  font-size: 11px;
  color: #999;
}
</style>
