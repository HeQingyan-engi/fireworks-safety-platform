<template>
  <div class="monitor-page">
    <h3 style="margin-bottom:16px">📹 实时监控中心</h3>

    <!-- 摄像头网格 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-header">
          <span>🎥 摄像头实时画面</span>
          <el-tag :type="allOnline ? 'success' : 'warning'" size="small">
            {{ onlineCount }}/{{ cameras.length }} 在线
          </el-tag>
        </div>
      </template>
      <div class="camera-grid">
        <div v-for="cam in cameras" :key="cam.id" class="camera-item" :class="{ offline: !cam.status }">
          <div class="camera-feed">
            <!-- 模拟视频画面 -->
            <div class="camera-view" v-if="cam.status">
              <div class="camera-simulated-scene">
                <div class="scene-bg">{{ cam.sceneIcon }}</div>
                <div class="scene-overlay-info">
                  <span class="camera-timestamp">{{ currentTime }}</span>
                  <span class="camera-label">{{ cam.name }}</span>
                </div>
                <!-- 模拟检测框 -->
                <div v-if="cam.detections" class="detection-overlay">
                  <div
                    v-for="(det, idx) in cam.detections"
                    :key="idx"
                    class="detection-box"
                    :style="det.style"
                    :class="'detect-' + det.type"
                  >
                    <span class="detect-label">{{ det.label }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 离线状态 -->
            <div v-else class="camera-offline">
              <span style="font-size:40px">📷</span>
              <p>摄像头离线</p>
            </div>
          </div>
          <div class="camera-info-bar">
            <span>{{ cam.name }}</span>
            <el-tag :type="cam.status ? 'success' : 'danger'" size="small" effect="dark">
              {{ cam.status ? '● 在线' : '● 离线' }}
            </el-tag>
          </div>
        </div>
        <div v-if="cameras.length === 0" class="empty-cameras">
          <el-empty description="暂无摄像头数据，请检查设备连接" />
        </div>
      </div>
    </el-card>

    <!-- 两栏布局：预警时间线 + 上传信息面板 -->
    <el-row :gutter="16" style="margin-top:16px">
      <!-- 预警时间线 -->
      <el-col :span="14">
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>🔔 实时预警时间线</span>
              <el-button type="primary" size="small" @click="refreshAlerts" :loading="alertLoading">
                刷新数据
              </el-button>
            </div>
          </template>
          <div v-if="recentAlerts.length === 0" style="text-align:center;padding:30px;color:#999">
            ✅ 暂无预警，系统运行正常
          </div>
          <div v-else class="alert-timeline">
            <div
              v-for="alert in recentAlerts"
              :key="alert.id"
              class="timeline-item"
              :class="'level-' + alert.level.toLowerCase()"
            >
              <div class="timeline-dot" :class="'dot-' + alert.level.toLowerCase()"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <el-tag
                    :type="alert.level === 'RED' ? 'danger' : alert.level === 'ORANGE' ? 'warning' : 'info'"
                    size="small"
                    effect="dark"
                  >
                    {{ alert.levelLabel || alert.level }}
                  </el-tag>
                  <span class="timeline-title">{{ alert.title }}</span>
                </div>
                <p class="timeline-desc">{{ alert.description || getAlertDescription(alert) }}</p>
                <div class="timeline-meta">
                  <span>📅 上传时间：{{ formatTime(alert.createdAt) }}</span>
                  <span>📍 门店：{{ alert.storeName || '总店' }}</span>
                  <span>📋 状态：{{ alert.statusLabel || alert.status }}</span>
                </div>
                <!-- 上传信息摘要 -->
                <div class="upload-summary" v-if="alert.uploadInfo">
                  <span class="upload-tag">📤 {{ alert.uploadInfo }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 上传信息与统计数据面板 -->
      <el-col :span="10">
        <!-- 上传信息面板 -->
        <el-card class="section-card">
          <template #header>
            <span>📤 最近上传记录</span>
          </template>
          <div class="upload-log">
            <div v-for="(log, idx) in uploadLogs" :key="idx" class="upload-log-item">
              <div class="upload-log-icon">{{ log.icon }}</div>
              <div class="upload-log-info">
                <p class="upload-log-title">{{ log.title }}</p>
                <p class="upload-log-time">{{ log.time }}</p>
                <p class="upload-log-detail">{{ log.detail }}</p>
              </div>
              <el-tag :type="log.statusType" size="small">{{ log.status }}</el-tag>
            </div>
          </div>
        </el-card>

        <!-- 传感器实时数据 -->
        <el-card class="section-card" style="margin-top:16px">
          <template #header>
            <span>🌡️ 传感器实时数据</span>
          </template>
          <div class="sensor-grid">
            <div class="sensor-item">
              <div class="sensor-icon">🌡️</div>
              <div class="sensor-value" :class="{ warning: sensorData.temp > 33 }">
                {{ sensorData.temp }}°C
              </div>
              <div class="sensor-label">仓库温度</div>
              <div class="sensor-status">
                {{ sensorData.temp > 35 ? '⚠️ 超标' : sensorData.temp > 30 ? '⚡ 偏高' : '✅ 正常' }}
              </div>
            </div>
            <div class="sensor-item">
              <div class="sensor-icon">💧</div>
              <div class="sensor-value" :class="{ warning: sensorData.humidity > 70 }">
                {{ sensorData.humidity }}%
              </div>
              <div class="sensor-label">仓库湿度</div>
              <div class="sensor-status">
                {{ sensorData.humidity > 75 ? '⚠️ 超标' : sensorData.humidity > 65 ? '⚡ 偏高' : '✅ 正常' }}
              </div>
            </div>
            <div class="sensor-item">
              <div class="sensor-icon">👥</div>
              <div class="sensor-value" :class="{ warning: sensorData.peopleCount > 8 }">
                {{ sensorData.peopleCount }}
              </div>
              <div class="sensor-label">店内人数</div>
              <div class="sensor-status">
                {{ sensorData.peopleCount > 10 ? '⚠️ 超标' : sensorData.peopleCount > 8 ? '⚡ 偏多' : '✅ 正常' }}
              </div>
            </div>
            <div class="sensor-item">
              <div class="sensor-icon">📦</div>
              <div class="sensor-value" :class="{ warning: sensorData.stockUsage > 90 }">
                {{ sensorData.stockUsage }}%
              </div>
              <div class="sensor-label">库存使用率</div>
              <div class="sensor-status">
                {{ sensorData.stockUsage > 95 ? '⚠️ 预警' : sensorData.stockUsage > 85 ? '⚡ 注意' : '✅ 正常' }}
              </div>
            </div>
          </div>
          <div class="sensor-update-time">
            数据更新时间：{{ sensorData.updateTime }}
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/api/request'
import { getAlerts } from '@/api/alert'
import { ALERT_TYPE_LABELS, ALERT_LEVEL_LABELS, ALERT_STATUS_LABELS } from '@/types/alert'
import type { Alert } from '@/types/alert'

// 摄像头数据
interface CameraDisplay {
  id: number
  name: string
  status: boolean
  sceneIcon: string
  detections?: Array<{ label: string; type: string; style: any }>
}
const cameras = ref<CameraDisplay[]>([])

// 当前时间
const currentTime = ref('')
let timeTimer: ReturnType<typeof setInterval> | null = null

// 预警数据
const recentAlerts = ref<Alert[]>([])
const alertLoading = ref(false)

// 上传日志
const uploadLogs = ref([
  { icon: '📸', title: '摄像头截图上传', time: '刚刚', detail: '入口摄像头：人员计数快照(8人).png', status: '成功', statusType: 'success' },
  { icon: '🌡️', title: '传感器数据上传', time: '30秒前', detail: '温湿度传感器#03：温度34.2°C/湿度68%', status: '成功', statusType: 'success' },
  { icon: '📋', title: '库存盘点上报', time: '2分钟前', detail: 'RFID盘点：库存总量85箱，使用率89%', status: '成功', statusType: 'success' },
  { icon: '🔔', title: '预警事件上传', time: '5分钟前', detail: '人员聚集预警：店内10人，已自动解除', status: '已归档', statusType: 'info' },
  { icon: '📹', title: '视频片段上传', time: '12分钟前', detail: '预警关联视频30s.mp4 (15.2MB)', status: '成功', statusType: 'success' },
])

// 传感器数据（模拟）
const sensorData = ref({
  temp: 32.5,
  humidity: 62,
  peopleCount: 6,
  stockUsage: 82,
  updateTime: new Date().toLocaleString('zh-CN'),
})

const allOnline = computed(() => cameras.value.every((c) => c.status))
const onlineCount = computed(() => cameras.value.filter((c) => c.status).length)

function formatTime(timeStr: string) {
  if (!timeStr) return '-'
  try {
    return new Date(timeStr).toLocaleString('zh-CN')
  } catch {
    return timeStr
  }
}

function getAlertDescription(alert: Alert) {
  const typeLabel = ALERT_TYPE_LABELS[alert.type] || alert.type
  const levelLabel = ALERT_LEVEL_LABELS[alert.level] || alert.level
  return `[${typeLabel}] ${levelLabel} - ${alert.title}`
}

async function refreshAlerts() {
  alertLoading.value = true
  try {
    const res = await getAlerts({ limit: 10 })
    recentAlerts.value = res.data || []
    // 补充上传信息标识
    recentAlerts.value = recentAlerts.value.map((a: Alert) => ({
      ...a,
      levelLabel: ALERT_LEVEL_LABELS[a.level],
      statusLabel: ALERT_STATUS_LABELS[a.status],
      uploadInfo: getUploadInfoForAlert(a),
    }))
  } catch {
    // 使用模拟数据
    recentAlerts.value = getMockAlerts()
  } finally {
    alertLoading.value = false
  }
}

function getUploadInfoForAlert(alert: Alert) {
  const infos: Record<string, string> = {
    OVERSTOCK: '已上传：库存清单.csv + 超标比例报告 + RFID扫描日志',
    CROWD_GATHERING: '已上传：人员计数数据.json + 区域热力图.png + 视频片段30s.mp4',
    SMOKING: '已上传：双光视频流 + 烟雾浓度数据 + 事件报告.json',
    OUT_OF_SCOPE_SALES: '已上传：违规交易记录.csv + POS截图.png',
    OUTDOOR_ILLEGAL: '已上传：现场照片3张 + GPS坐标 + 违规时间线.json',
    OUTDOOR_TEST_FIRE: '已上传：热成像视频流 + 音频录音 + GPS坐标',
    TEMP_HUMIDITY_ANOMALY: '已上传：温湿度时序数据.csv + 传感器日志',
    SMOKE_FIRE: '已上传：实时视频流 + 烟雾浓度 + 温度数据 + 建筑结构图',
  }
  return infos[alert.type] || '已上传：事件数据包'
}

function getMockAlerts(): Alert[] {
  const now = new Date()
  return [
    {
      id: 101, storeId: 1, storeName: '总店', type: 'OVERSTOCK', level: 'ORANGE',
      title: '仓库库存接近容量上限', description: '当前库存使用率89%，接近95%黄色预警线',
      status: 'ACKNOWLEDGED', createdAt: new Date(now.getTime() - 2 * 60000).toISOString(),
      levelLabel: '橙色预警', statusLabel: '已确认',
      uploadInfo: '已上传：库存清单.csv + 超标比例报告 + RFID扫描日志',
    },
    {
      id: 100, storeId: 1, storeName: '总店', type: 'TEMP_HUMIDITY_ANOMALY', level: 'YELLOW',
      title: '仓库温度偏高', description: '温度传感器#03读数34.2°C，接近35°C预警阈值，已自动开启通风扇',
      status: 'HANDLING', createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
      levelLabel: '黄色预警', statusLabel: '处理中',
      uploadInfo: '已上传：温湿度时序数据.csv + 传感器日志',
    },
    {
      id: 99, storeId: 1, storeName: '总店', type: 'CROWD_GATHERING', level: 'ORANGE',
      title: '店内人员达到10人', description: '顾客区AI摄像头检测到10人，已触发限流提示，5分钟后回落至6人自动解除',
      status: 'RESOLVED', createdAt: new Date(now.getTime() - 25 * 60000).toISOString(),
      levelLabel: '橙色预警', statusLabel: '已解决',
      uploadInfo: '已上传：人员计数数据.json + 区域热力图.png + 视频片段30s.mp4',
    },
    {
      id: 98, storeId: 1, storeName: '总店', type: 'SMOKE_FIRE', level: 'RED',
      title: '仓库烟感触发报警（误报已排除）', description: '仓库B区烟感探测器触发，视频AI未检测到火焰，现场确认为灰尘触发，已复位',
      status: 'RESOLVED', createdAt: new Date(now.getTime() - 120 * 60000).toISOString(),
      levelLabel: '红色预警', statusLabel: '已解决',
      uploadInfo: '已上传：实时视频流 + 烟雾浓度 + 温度数据 + 建筑结构图',
    },
  ] as any
}

// 更新时间和传感器数据
function updateTimeAndSensor() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN')
  sensorData.value.updateTime = now.toLocaleString('zh-CN')
  // 微调传感器数据
  sensorData.value.temp = +(32 + Math.sin(now.getTime() / 60000) * 2).toFixed(1)
  sensorData.value.humidity = +(62 + Math.cos(now.getTime() / 60000) * 3).toFixed(0)
  sensorData.value.peopleCount = Math.floor(5 + Math.abs(Math.sin(now.getTime() / 300000)) * 7)
  sensorData.value.stockUsage = +(82 + Math.sin(now.getTime() / 1800000) * 5).toFixed(0)
}

async function loadCameras() {
  try {
    const res = await api.get('/cameras')
    const raw = res.data || []
    cameras.value = raw.map((cam: any) => ({
      ...cam,
      sceneIcon: getSceneIcon(cam.name),
      detections: cam.status ? generateMockDetections(cam.name) : null,
    }))
  } catch {
    // 模拟摄像头数据
    cameras.value = [
      { id: 1, name: '展示区摄像头', status: true, sceneIcon: '🎆',
        detections: [
          { label: '顾客', type: 'person', style: { top: '30%', left: '20%', width: '18%', height: '35%' } },
          { label: '顾客', type: 'person', style: { top: '25%', left: '55%', width: '18%', height: '35%' } },
        ] },
      { id: 2, name: '仓库A区摄像头', status: true, sceneIcon: '📦',
        detections: [
          { label: '烟花箱', type: 'object', style: { top: '40%', left: '15%', width: '25%', height: '20%' } },
          { label: '烟花箱', type: 'object', style: { top: '35%', left: '55%', width: '25%', height: '25%' } },
        ] },
      { id: 3, name: '顾客区摄像头', status: true, sceneIcon: '🛒',
        detections: [
          { label: '顾客', type: 'person', style: { top: '20%', left: '30%', width: '18%', height: '40%' } },
          { label: '顾客', type: 'person', style: { top: '25%', left: '60%', width: '18%', height: '38%' } },
        ] },
      { id: 4, name: '入口摄像头', status: true, sceneIcon: '🚪',
        detections: [
          { label: '人', type: 'person', style: { top: '15%', left: '40%', width: '20%', height: '45%' } },
        ] },
    ]
  }
}

function getSceneIcon(name: string): string {
  if (name.includes('展示')) return '🎆'
  if (name.includes('仓库') || name.includes('存储')) return '📦'
  if (name.includes('顾客') || name.includes('客户')) return '🛒'
  if (name.includes('入口')) return '🚪'
  return '🏪'
}

function generateMockDetections(name: string) {
  if (name.includes('展示') || name.includes('顾客')) {
    return [
      { label: '顾客', type: 'person', style: { top: '20%', left: '25%', width: '18%', height: '38%' } },
      { label: '顾客', type: 'person', style: { top: '15%', left: '55%', width: '18%', height: '35%' } },
    ]
  }
  if (name.includes('仓库')) {
    return [
      { label: '货箱', type: 'object', style: { top: '40%', left: '20%', width: '22%', height: '22%' } },
    ]
  }
  return [
    { label: '访客', type: 'person', style: { top: '25%', left: '40%', width: '18%', height: '40%' } },
  ]
}

onMounted(() => {
  loadCameras()
  refreshAlerts()
  updateTimeAndSensor()
  timeTimer = setInterval(updateTimeAndSensor, 3000)
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
})
</script>

<style scoped>
.monitor-page {
  padding: 0;
}

.section-card {
  margin-bottom: 0;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 摄像头网格 */
.camera-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.camera-item {
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #67c23a;
  transition: border-color 0.3s;
}
.camera-item.offline {
  border-color: #e63946;
}
.camera-feed {
  aspect-ratio: 16/9;
  background: #1a1a2e;
  position: relative;
  overflow: hidden;
}

/* 模拟视频画面 */
.camera-view {
  width: 100%;
  height: 100%;
  position: relative;
}
.camera-simulated-scene {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 100%);
  position: relative;
}
.scene-bg {
  font-size: 64px;
  opacity: 0.4;
}
.scene-overlay-info {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 12px;
}
.camera-timestamp {
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 4px;
}
.camera-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 4px;
}

/* 检测框 */
.detection-overlay {
  position: absolute;
  inset: 0;
}
.detection-box {
  position: absolute;
  border: 2px solid;
  border-radius: 4px;
  animation: detection-pulse 2s ease-in-out infinite;
}
.detect-person {
  border-color: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}
.detect-object {
  border-color: #67c23a;
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.4);
}
.detect-label {
  position: absolute;
  top: -18px;
  left: -2px;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
}
@keyframes detection-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* 离线摄像头 */
.camera-offline {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  background: #0d0d1a;
}
.camera-offline p {
  margin-top: 8px;
  font-size: 14px;
  color: #e63946;
}

.camera-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f8f8;
  font-size: 13px;
}

.empty-cameras {
  grid-column: span 2;
  padding: 40px;
}

/* 预警时间线 */
.alert-timeline {
  max-height: 500px;
  overflow-y: auto;
}
.timeline-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 3px solid #ccc;
  background: #fafafa;
  transition: background 0.2s;
}
.timeline-item:hover {
  background: #f0f0f0;
}
.timeline-item.level-red {
  border-left-color: #e63946;
  background: #fff5f5;
}
.timeline-item.level-orange {
  border-left-color: #e6a23c;
  background: #fffaf5;
}
.timeline-item.level-yellow {
  border-left-color: #f5a623;
  background: #fffefa;
}
.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.dot-red { background: #e63946; }
.dot-orange { background: #e6a23c; }
.dot-yellow { background: #f5a623; }
.timeline-content {
  flex: 1;
  min-width: 0;
}
.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.timeline-title {
  font-weight: bold;
  font-size: 14px;
}
.timeline-desc {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
.timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

/* 上传摘要 */
.upload-summary {
  margin-top: 6px;
}
.upload-tag {
  font-size: 11px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 上传日志面板 */
.upload-log {
  max-height: 280px;
  overflow-y: auto;
}
.upload-log-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.upload-log-icon {
  font-size: 24px;
  flex-shrink: 0;
}
.upload-log-info {
  flex: 1;
  min-width: 0;
}
.upload-log-title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
}
.upload-log-time {
  margin: 2px 0;
  font-size: 11px;
  color: #999;
}
.upload-log-detail {
  margin: 0;
  font-size: 11px;
  color: #666;
  word-break: break-all;
}

/* 传感器面板 */
.sensor-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.sensor-item {
  text-align: center;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}
.sensor-icon {
  font-size: 28px;
  margin-bottom: 4px;
}
.sensor-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}
.sensor-value.warning {
  color: #e63946;
}
.sensor-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.sensor-status {
  font-size: 11px;
  margin-top: 4px;
  color: #67c23a;
}
.sensor-item:has(.sensor-value.warning) .sensor-status {
  color: #e6a23c;
}
.sensor-update-time {
  text-align: center;
  margin-top: 12px;
  font-size: 11px;
  color: #999;
}
</style>
