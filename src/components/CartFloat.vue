<template>
  <div v-if="showCart" class="cart-float" @click="dialogVisible = true">
    🛒 购物车 ({{ cartStore.totalCount }})
  </div>

  <el-dialog v-model="dialogVisible" title="我的购物车" width="500px">
    <el-table v-if="cartStore.items.length > 0" :data="cartStore.items" style="width: 100%">
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="单价" width="80">
        <template #default="{ row }"> ¥{{ row.price }} </template>
      </el-table-column>
      <el-table-column label="数量" width="120">
        <template #default="{ row }">
          <el-input-number
            v-model="row.quantity"
            :min="1"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="cartStore.removeItem(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-else description="购物车为空" />
    <div style="margin-top: 16px; text-align: right; font-weight: bold">
      总计：¥{{ cartStore.totalPrice }}
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">继续购物</el-button>
      <el-button type="primary" @click="goCheckout" :disabled="cartStore.items.length === 0">去结算</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()
const dialogVisible = ref(false)

const showCart = computed(() => {
  // Only show cart float on customer-facing pages
  return !route.path.startsWith('/admin') && !route.path.startsWith('/gov') && route.path !== '/login'
})

function goCheckout() {
  dialogVisible.value = false
  router.push('/checkout')
}
</script>

<style scoped>
.cart-float {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #409eff;
  color: white;
  padding: 10px 20px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 1000;
}
.cart-float:hover {
  background-color: #66b1ff;
}
</style>
