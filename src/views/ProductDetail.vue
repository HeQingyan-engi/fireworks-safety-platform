<template>
  <div class="product-detail" v-if="product">
    <el-button text @click="$router.back()">← 返回</el-button>

    <div class="detail-hero">
      <div class="video-section">
        <video v-if="product.effectVideoUrl" :src="effectUrl" controls style="width:100%; max-height:400px; border-radius:8px" />
      </div>
      <div class="detail-info">
        <h1>{{ product.name }}</h1>
        <div class="detail-tags">
          <el-tag v-if="product.safetyLevel" :type="product.safetyLevel === 'D' ? 'success' : product.safetyLevel === 'C' ? 'warning' : 'danger'">
            {{ product.safetyLevel }}级
          </el-tag>
          <el-tag v-if="product.isKidFriendly" type="primary">儿童友好</el-tag>
          <el-tag v-if="product.isOnSale" type="danger">促销中</el-tag>
        </div>
        <p class="detail-price">
          <span v-if="product.isOnSale && product.originalPrice" class="original">¥{{ product.originalPrice }}</span>
          ¥{{ product.price }}
        </p>
        <el-descriptions :column="1" border style="margin-top: 16px">
          <el-descriptions-item label="安全等级">{{ product.safetyLevel }}级</el-descriptions-item>
          <el-descriptions-item label="执行标准">{{ product.standards || 'GB 10631-2025' }}</el-descriptions-item>
          <el-descriptions-item label="药量">{{ product.powderQuantity || '-' }}g</el-descriptions-item>
          <el-descriptions-item label="安全距离">{{ product.safetyDistance || '-' }}m</el-descriptions-item>
          <el-descriptions-item label="分类">{{ product.categoryName || '-' }}</el-descriptions-item>
        </el-descriptions>
        <p style="margin-top: 16px; color: #666">{{ product.description }}</p>

        <div style="margin-top: 20px; display: flex; gap: 12px; align-items: center">
          <el-input-number v-model="quantity" :min="1" :max="99" />
          <el-button type="danger" size="large" @click="addToCart">加入购物车</el-button>
        </div>
      </div>
    </div>
  </div>
  <div v-else style="text-align:center;padding:60px">加载中...</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProductById } from '@/api/product'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'
import type { Product } from '@/types/product'

const route = useRoute()
const cartStore = useCartStore()
const product = ref<Product | null>(null)
const quantity = ref(1)

const effectUrl = computed(() => {
  if (!product.value?.effectVideoUrl) return ''
  return `/videos/${product.value.effectVideoUrl.split('/').pop()}`
})

function addToCart() {
  if (product.value) {
    for (let i = 0; i < quantity.value; i++) {
      cartStore.addItem(product.value)
    }
    ElMessage.success(`已添加 ${quantity.value} 件到购物车`)
    quantity.value = 1
  }
}

onMounted(async () => {
  const id = parseInt(route.params.id as string)
  try {
    product.value = await getProductById(id)
  } catch {
    ElMessage.error('产品不存在')
  }
})
</script>

<style scoped>
.product-detail { max-width: 1000px; margin: 0 auto; }
.detail-hero { display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap; }
.video-section { flex: 1; min-width: 300px; }
.detail-info { flex: 1; min-width: 300px; }
.detail-info h1 { font-size: 28px; margin-bottom: 12px; }
.detail-tags { display: flex; gap: 8px; margin-bottom: 12px; }
.detail-price { font-size: 28px; font-weight: bold; color: #e63946; }
.detail-price .original { font-size: 16px; color: #999; text-decoration: line-through; margin-right: 8px; }
</style>
