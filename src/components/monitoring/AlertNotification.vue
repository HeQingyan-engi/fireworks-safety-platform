<template>
  <teleport to="body">
    <div v-if="visible" class="alert-notification" :class="'alert-' + alert?.level?.toLowerCase()">
      <div class="alert-notify-header">
        <span class="alert-icon">{{ levelIcon }}</span>
        <strong>{{ alert?.title }}</strong>
        <button class="alert-close" @click="dismiss">×</button>
      </div>
      <p class="alert-notify-desc">{{ alert?.description }}</p>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { Alert, AlertLevel } from '@/types/alert'
import { io, Socket } from 'socket.io-client'

const props = defineProps<{ storeId?: number }>()
const visible = ref(false)
const alert = ref<Alert | null>(null)
let socket: Socket | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

const levelIcon = computed(() => {
  const icons: Record<AlertLevel, string> = { RED: '🚨', ORANGE: '⚠️', YELLOW: '⚡' }
  return icons[alert.value?.level as AlertLevel] || '🔔'
})

function dismiss() {
  visible.value = false
  if (hideTimer) clearTimeout(hideTimer)
}

function connectSocket() {
  const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000'
  socket = io(wsUrl)

  socket.on('connect', () => {
    console.log('[WS] Connected')
    if (props.storeId) socket?.emit('joinStore', props.storeId)
  })

  socket.on('alert:new', (data: Alert) => {
    alert.value = data
    visible.value = true
    // Auto-hide after 10s
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => { visible.value = false }, 10000)
  })

  socket.on('alert:update', (data: { alertId: number; status: string }) => {
    console.log('[WS] Alert updated:', data)
  })
}

watch(() => props.storeId, (newId) => {
  if (newId && socket?.connected) socket.emit('joinStore', newId)
})

connectSocket()

onUnmounted(() => {
  if (socket) { socket.disconnect(); socket = null }
  if (hideTimer) clearTimeout(hideTimer)
})

defineExpose({ dismiss })
</script>

<style scoped>
.alert-notification {
  position: fixed; top: 16px; right: 16px; width: 360px;
  padding: 16px; border-radius: 8px; z-index: 9999;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2); animation: slideIn 0.3s ease;
  color: white;
}
.alert-red { background: linear-gradient(135deg, #e63946, #c1121f); }
.alert-orange { background: linear-gradient(135deg, #f4a261, #e76f51); }
.alert-yellow { background: linear-gradient(135deg, #e9c46a, #f4a261); color: #333; }
.alert-notify-header { display: flex; align-items: center; gap: 8px; }
.alert-icon { font-size: 20px; }
.alert-close { margin-left: auto; background: none; border: none; color: inherit; font-size: 20px; cursor: pointer; }
.alert-notify-desc { margin-top: 8px; font-size: 13px; opacity: 0.9; }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
