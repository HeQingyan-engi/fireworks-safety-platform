import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Alert } from '@/types/alert'

export const useAlertStore = defineStore('alert', () => {
  const newAlerts = ref<Alert[]>([])

  function addAlert(alert: Alert) {
    newAlerts.value.unshift(alert)
    // Keep last 50 alerts
    if (newAlerts.value.length > 50) {
      newAlerts.value = newAlerts.value.slice(0, 50)
    }
  }

  function clearAlerts() {
    newAlerts.value = []
  }

  function dismissAlert(id: number) {
    newAlerts.value = newAlerts.value.filter((a) => a.id !== id)
  }

  return { newAlerts, addAlert, clearAlerts, dismissAlert }
})
