<template>
  <div class="home-page">
    <!-- 英雄横幅 -->
    <section class="hero-banner">
      <div class="hero-overlay">
        <h1>🎆 安万嘉烟花展厅</h1>
        <p>安全 · 合规 · 智能 — 烟花爆竹智慧零售与风险监测一体化平台</p>
        <div class="hero-actions">
          <el-button type="warning" size="large" round @click="scrollToProducts">🛍️ 浏览产品</el-button>
          <el-button type="info" size="large" round @click="$router.push('/about')">📖 了解我们</el-button>
        </div>
      </div>
    </section>

    <!-- 主体区域：左侧店铺信息 + 右侧产品展示 -->
    <div class="main-content">
      <!-- 左侧店铺信息 -->
      <aside class="store-sidebar">
        <el-card shadow="hover" class="store-card">
          <template #header>
            <span style="font-weight:bold;font-size:16px">🏪 店铺信息</span>
          </template>
          <div class="store-info">
            <div class="info-item">
              <span class="info-icon">📞</span>
              <div>
                <p class="info-label">联系电话</p>
                <p class="info-value">023-6888-9999</p>
                <p class="info-value">138-8888-6666（微信同号）</p>
              </div>
            </div>
            <el-divider style="margin:12px 0" />
            <div class="info-item">
              <span class="info-icon">📍</span>
              <div>
                <p class="info-label">门店地址</p>
                <p class="info-value">重庆市渝北区龙山街道烟花爆竹专营店</p>
              </div>
            </div>
            <el-divider style="margin:12px 0" />
            <div class="info-item">
              <span class="info-icon">🕐</span>
              <div>
                <p class="info-label">营业时间</p>
                <p class="info-value">周一至周日 9:00 - 21:00</p>
                <p class="info-value">节假日照常营业</p>
              </div>
            </div>
            <el-divider style="margin:12px 0" />
            <div class="info-item">
              <span class="info-icon">💬</span>
              <div>
                <p class="info-label">在线咨询</p>
                <p class="info-value">添加微信：ANWJ-8888</p>
                <p class="info-value">QQ群：888-999-000</p>
              </div>
            </div>
            <el-divider style="margin:12px 0" />
            <div class="qr-section">
              <p style="text-align:center;font-size:13px;color:#666;margin-bottom:8px">扫码关注公众号</p>
              <div class="qr-placeholder">
                <span style="font-size:48px">📱</span>
                <p style="font-size:11px;color:#999">安万嘉安全科技</p>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 购物车快捷面板 -->
        <el-card shadow="hover" class="cart-panel" v-if="cartStore.items.length > 0">
          <template #header>
            <span style="font-weight:bold;font-size:16px">🛒 我的购物车</span>
          </template>
          <div v-for="item in cartStore.items" :key="item.id" class="cart-mini-item">
            <span class="cart-mini-name">{{ item.name }}</span>
            <span class="cart-mini-qty">×{{ item.quantity }}</span>
            <span class="cart-mini-price">¥{{ item.price * item.quantity }}</span>
          </div>
          <el-divider style="margin:8px 0" />
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:bold;color:#e63946">合计：¥{{ cartStore.totalPrice }}</span>
            <el-button type="danger" size="small" @click="$router.push('/cart')">去结算</el-button>
          </div>
        </el-card>
      </aside>

      <!-- 右侧产品区域 -->
      <div class="products-area">
        <!-- 分类标签 -->
        <div class="category-tabs">
          <div
            v-for="c in displayCategories"
            :key="c.id"
            class="category-tab"
            :class="{ active: activeCategory === c.id }"
            @click="activeCategory = c.id"
          >
            {{ c.name }}
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-area">
          <el-skeleton :rows="3" animated />
          <el-skeleton :rows="3" animated style="margin-top:16px" />
        </div>

        <!-- 无产品提示 -->
        <div v-else-if="filteredProducts.length === 0" class="empty-area">
          <el-empty description="该分类暂无产品，请选择其他分类查看">
            <el-button type="primary" @click="activeCategory = categories[0]?.id || 1">查看全部产品</el-button>
          </el-empty>
        </div>

        <!-- 产品网格 -->
        <div v-else class="product-grid">
          <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { getProducts, getCategories } from '@/api/product'
import { useCartStore } from '@/stores/cart'
import type { Product, Category } from '@/types/product'

const cartStore = useCartStore()
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const activeCategory = ref<number | 'kid' | 'sale' | 'all'>(1)
const loading = ref(true)

const displayCategories = computed(() => [
  ...categories.value,
  { id: 'kid' as const, name: '👶 儿童推荐' },
  { id: 'sale' as const, name: '🔥 限时促销' },
])

const filteredProducts = computed(() => {
  const id = activeCategory.value
  if (id === 'kid') return products.value.filter((p) => p.isKidFriendly)
  if (id === 'sale') return products.value.filter((p) => p.isOnSale)
  return products.value.filter((p) => p.categoryId === id)
})

function scrollToProducts() {
  document.querySelector('.products-area')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(async () => {
  try {
    const [productData, categoryData] = await Promise.all([
      getProducts(),
      getCategories(),
    ])
    products.value = productData.data || productData || []
    categories.value = categoryData || []
  } catch (e) {
    console.error('Failed to load products, using demo data:', e)
    // 后端不可用时使用演示数据
    categories.value = [
      { id: 1, name: '🎆 喷花类' },
      { id: 2, name: '🎇 旋转类' },
      { id: 3, name: '🧨 爆竹类' },
      { id: 4, name: '🎪 组合烟花' },
      { id: 5, name: '🎋 线香类' },
      { id: 6, name: '🎉 礼花弹' },
    ]
    products.value = [
      { id: 1, name: '金玉满堂组合烟花', price: 288, categoryId: 4, categoryName: '组合烟花', safetyLevel: 'C', powderQuantity: '500', safetyDistance: '25', standards: 'GB 10631-2025', description: '经典组合烟花，绽放绚丽多彩，适合各种庆典场合', isKidFriendly: false, isOnSale: true, originalPrice: 388, effectVideoUrl: '', appearanceVideoUrl: '', imageUrl: '', stock: 50 },
      { id: 2, name: '幸福花开喷花', price: 68, categoryId: 1, categoryName: '喷花类', safetyLevel: 'D', powderQuantity: '50', safetyDistance: '5', standards: 'GB 10631-2025', description: '适合儿童观看的小型喷花，色彩缤纷，安全可靠', isKidFriendly: true, isOnSale: false, originalPrice: 0, effectVideoUrl: '', appearanceVideoUrl: '', imageUrl: '', stock: 200 },
      { id: 3, name: '彩蝶旋转烟花', price: 45, categoryId: 2, categoryName: '旋转类', safetyLevel: 'D', powderQuantity: '30', safetyDistance: '3', standards: 'GB 10631-2025', description: '旋转飞舞的彩色蝴蝶造型烟花，深受小朋友喜爱', isKidFriendly: true, isOnSale: true, originalPrice: 58, effectVideoUrl: '', appearanceVideoUrl: '', imageUrl: '', stock: 150 },
      { id: 4, name: '大地红鞭炮1000响', price: 128, categoryId: 3, categoryName: '爆竹类', safetyLevel: 'C', powderQuantity: '200', safetyDistance: '15', standards: 'GB 10631-2025', description: '千响大地红，过年必备，响亮吉利', isKidFriendly: false, isOnSale: false, originalPrice: 0, effectVideoUrl: '', appearanceVideoUrl: '', imageUrl: '', stock: 80 },
      { id: 5, name: '流星雨线香烟花', price: 25, categoryId: 5, categoryName: '线香类', safetyLevel: 'D', powderQuantity: '10', safetyDistance: '2', standards: 'GB 10631-2025', description: '手持式线香烟花，安全无爆炸，儿童可在成人陪伴下使用', isKidFriendly: true, isOnSale: false, originalPrice: 0, effectVideoUrl: '', appearanceVideoUrl: '', imageUrl: '', stock: 300 },
      { id: 6, name: '盛世华章礼花弹', price: 688, categoryId: 6, categoryName: '礼花弹', safetyLevel: 'B', powderQuantity: '1500', safetyDistance: '50', standards: 'GB 10631-2025', description: '大型礼花弹，适合重大节庆活动，震撼视听体验', isKidFriendly: false, isOnSale: true, originalPrice: 888, effectVideoUrl: '', appearanceVideoUrl: '', imageUrl: '', stock: 20 },
      { id: 7, name: '七彩风火轮', price: 88, categoryId: 2, categoryName: '旋转类', safetyLevel: 'D', powderQuantity: '40', safetyDistance: '5', standards: 'GB 10631-2025', description: '七色交替旋转，犹如风火轮般绚烂', isKidFriendly: true, isOnSale: false, originalPrice: 0, effectVideoUrl: '', appearanceVideoUrl: '', imageUrl: '', stock: 100 },
      { id: 8, name: '年年有余组合烟花', price: 368, categoryId: 4, categoryName: '组合烟花', safetyLevel: 'C', powderQuantity: '600', safetyDistance: '30', standards: 'GB 10631-2025', description: '吉祥如意年年有余，新年必备组合烟花', isKidFriendly: false, isOnSale: false, originalPrice: 0, effectVideoUrl: '', appearanceVideoUrl: '', imageUrl: '', stock: 35 },
    ]
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* 英雄横幅 */
.hero-banner {
  background: linear-gradient(135deg, #e63946 0%, #d62828 30%, #f77f00 70%, #fcbf49 100%);
  border-radius: 12px;
  padding: 50px 30px;
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}
.hero-banner::before {
  content: '🎆 🎇 🧨 🎆 🎇 🧨';
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  font-size: 40px;
  opacity: 0.3;
  letter-spacing: 30px;
}
.hero-overlay {
  position: relative;
  z-index: 1;
}
.hero-overlay h1 {
  color: white;
  font-size: 36px;
  margin: 0 0 12px 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
.hero-overlay p {
  color: rgba(255,255,255,0.9);
  font-size: 16px;
  margin-bottom: 24px;
}
.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 主体布局 */
.main-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* 左侧店铺信息 */
.store-sidebar {
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}
.store-card {
  margin-bottom: 16px;
}
.store-info .info-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.info-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}
.info-label {
  font-size: 12px;
  color: #999;
  margin: 0;
}
.info-value {
  font-size: 14px;
  color: #333;
  margin: 2px 0 0 0;
  font-weight: 500;
}
.qr-placeholder {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

/* 购物车迷你面板 */
.cart-panel {
  margin-bottom: 16px;
}
.cart-mini-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed #f0f0f0;
  font-size: 13px;
}
.cart-mini-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cart-mini-qty {
  color: #999;
  margin: 0 8px;
}
.cart-mini-price {
  color: #e63946;
  font-weight: 500;
}

/* 右侧产品区域 */
.products-area {
  flex: 1;
  min-width: 0;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.category-tab {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  user-select: none;
}
.category-tab:hover {
  border-color: #e63946;
  color: #e63946;
}
.category-tab.active {
  background: #e63946;
  color: white;
  border-color: #e63946;
}

/* 产品网格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* 加载和空状态 */
.loading-area {
  background: white;
  padding: 24px;
  border-radius: 8px;
}
.empty-area {
  background: white;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
}

/* 响应式 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  .store-sidebar {
    width: 100%;
    position: static;
    display: flex;
    gap: 16px;
  }
  .store-sidebar > .store-card,
  .store-sidebar > .cart-panel {
    flex: 1;
  }
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .store-sidebar {
    flex-direction: column;
  }
  .product-grid {
    grid-template-columns: 1fr;
  }
  .hero-overlay h1 {
    font-size: 24px;
  }
}
</style>
