<template>
  <div class="gov-map">
    <h3>辖区门店实时地图</h3>
    <div class="map-container">
      <div class="map-placeholder">
        <div style="text-align:center;padding:60px">
          <span style="font-size:48px">🗺️</span>
          <h3>实时地图监控</h3>
          <p style="color:#999">集成高德/Leaflet地图显示门店位置和状态</p>
        </div>
        <div class="store-markers">
          <el-card v-for="store in stores" :key="store.id" class="store-marker" :class="'marker-' + store.status.toLowerCase()" @click="$router.push('/gov/store/' + store.id)" style="cursor:pointer">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong>{{ store.name }}</strong>
                <p style="font-size:12px;color:#666;margin:4px 0">{{ store.address }}</p>
                <el-tag :type="store.status==='NORMAL'?'success':store.status==='CAUTION'?'warning':'danger'" size="small">
                  {{ store.status === 'NORMAL' ? '正常' : store.status === 'CAUTION' ? '注意' : '危险' }}
                </el-tag>
              </div>
              <div class="status-dot" :class="'dot-' + store.status.toLowerCase()" />
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStores } from '@/api/store'
import type { Store } from '@/types/store'

const stores = ref<Store[]>([])

onMounted(async () => { try { stores.value = await getStores() } catch { /* */ } })
</script>

<style scoped>
.gov-map h3 { margin-bottom: 16px; }
.map-container { background: #e8f4f8; border-radius: 8px; min-height: 400px; padding: 16px; }
.store-markers { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px; }
.store-marker { border-left: 4px solid #67c23a; }
.marker-caution { border-left-color: #e6a23c; }
.marker-danger { border-left-color: #e63946; }
.status-dot { width: 12px; height: 12px; border-radius: 50%; }
.dot-normal { background: #67c23a; }
.dot-caution { background: #e6a23c; }
.dot-danger { background: #e63946; }
</style>
