<template>
  <div class="product-card" :class="{ 'on-sale': product.isOnSale }">
    <div v-if="product.isOnSale" class="sale-badge">🔥 促销</div>
    <div v-if="product.isKidFriendly" class="kid-badge">👶 儿童推荐</div>
    <div v-if="product.safetyLevel" class="safety-badge" :class="'safety-' + product.safetyLevel.toLowerCase()">
      {{ product.safetyLevel }}级
    </div>

    <h3>{{ product.name }}</h3>
    <p class="price">¥{{ product.price }}</p>

    <div v-if="product.isOnSale && product.originalPrice" class="price-info">
      <span class="original-price">原价 ¥{{ product.originalPrice }}</span>
    </div>

    <div class="buttons">
      <button class="info-btn" @click="openInfo">📖 介绍</button>
      <button class="effect-btn" @click="openEffect">🎆 效果</button>
      <button class="appearance-btn" @click="openAppearance">🎬 实物</button>
      <button class="buy-btn" @click="handleBuy">🛒 购买</button>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="infoDialog" :title="product.name + ' - 产品介绍'" width="600px">
      <div class="info-content">
        <p>{{ product.description || '暂无详细介绍' }}</p>
        <el-descriptions v-if="product.safetyLevel" :column="2" border style="margin-top: 16px">
          <el-descriptions-item label="安全等级">{{ product.safetyLevel }}级</el-descriptions-item>
          <el-descriptions-item label="执行标准">{{ product.standards || 'GB 10631-2025' }}</el-descriptions-item>
          <el-descriptions-item label="药量">{{ product.powderQuantity || '-' }}g</el-descriptions-item>
          <el-descriptions-item label="安全距离">{{ product.safetyDistance || '-' }}m</el-descriptions-item>
        </el-descriptions>
        <router-link :to="'/product/' + product.id" style="margin-top: 12px; display: inline-block">
          查看完整详情 →
        </router-link>
      </div>
    </el-dialog>

    <!-- 爆炸效果视频 -->
    <el-dialog v-model="effectDialog" :title="product.name + ' - 燃放效果'" width="800px" @close="closeEffect">
      <video
        ref="effectVideoRef"
        :src="fullEffectUrl"
        controls autoplay muted
        style="width: 100%; max-height: 500px"
      ></video>
    </el-dialog>

    <!-- 实物展示视频 -->
    <el-dialog v-model="appearanceDialog" :title="product.name + ' - 实物展示'" width="800px" @close="closeAppearance">
      <video
        ref="appearanceVideoRef"
        :src="fullAppearanceUrl"
        controls autoplay muted
        style="width: 100%; max-height: 500px"
      ></video>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/product'

const props = defineProps<{ product: Product }>()
const cartStore = useCartStore()

const fullEffectUrl = computed(() =>
  props.product.effectVideoUrl ? `/videos/${props.product.effectVideoUrl.split('/').pop()}` : '',
)
const fullAppearanceUrl = computed(() =>
  props.product.appearanceVideoUrl ? `/videos/${props.product.appearanceVideoUrl.split('/').pop()}` : '',
)

const infoDialog = ref(false)
const effectDialog = ref(false)
const appearanceDialog = ref(false)
const effectVideoRef = ref<HTMLVideoElement | null>(null)
const appearanceVideoRef = ref<HTMLVideoElement | null>(null)

function openInfo() { infoDialog.value = true }

async function openEffect() {
  effectDialog.value = true
  await nextTick()
  if (effectVideoRef.value) { effectVideoRef.value.currentTime = 0; try { await effectVideoRef.value.play() } catch { /* */ } }
}
function closeEffect() { if (effectVideoRef.value) effectVideoRef.value.pause(); effectDialog.value = false }

async function openAppearance() {
  appearanceDialog.value = true
  await nextTick()
  if (appearanceVideoRef.value) { appearanceVideoRef.value.currentTime = 0; try { await appearanceVideoRef.value.play() } catch { /* */ } }
}
function closeAppearance() { if (appearanceVideoRef.value) appearanceVideoRef.value.pause(); appearanceDialog.value = false }

function handleBuy() { cartStore.addItem(props.product) }
</script>

<style scoped>
.product-card {
  border: 1px solid #ddd; padding: 12px; text-align: center;
  background: white; border-radius: 8px; position: relative;
  transition: box-shadow 0.3s;
}
.product-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.on-sale { border-color: #ff6b6b; }
.sale-badge { position: absolute; top: 8px; left: 8px; background: #ff6b6b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.kid-badge { position: absolute; top: 8px; right: 8px; background: #4a90e2; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.safety-badge { position: absolute; top: 28px; right: 8px; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
.safety-c { background: #67c23a; color: white; }
.safety-d { background: #409eff; color: white; }
.safety-b { background: #e6a23c; color: white; }
h3 { font-size: 16px; margin: 8px 0; }
.price { font-size: 20px; font-weight: bold; color: #e63946; margin: 8px 0; }
.original-price { text-decoration: line-through; color: #999; font-size: 13px; }
.buttons { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px; }
.buttons button { flex: 1; padding: 6px 4px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; min-width: 50px; }
.info-btn { background: #f0f0f0; }
.effect-btn { background: #fff3e0; }
.appearance-btn { background: #e3f2fd; }
.buy-btn { background: #e63946; color: white; }
.buttons button:hover { opacity: 0.8; }
</style>
