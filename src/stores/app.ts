import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const currentStoreId = ref<number | null>(null)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setCurrentStore(storeId: number) {
    currentStoreId.value = storeId
  }

  return { sidebarCollapsed, currentStoreId, toggleSidebar, setCurrentStore }
})
