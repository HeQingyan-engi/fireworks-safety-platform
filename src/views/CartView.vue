<template>
  <div class="cart-page">
    <h2>我的购物车</h2>
    <div v-if="cartStore.items.length === 0" style="text-align:center;padding:60px">
      <el-empty description="购物车为空">
        <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
      </el-empty>
    </div>
    <template v-else>
      <el-table :data="cartStore.items" style="width:100%">
        <el-table-column prop="name" label="商品" />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="数量" width="140">
          <template #default="{ row }">
            <el-input-number v-model="row.quantity" :min="1" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="100">
          <template #default="{ row }">¥{{ row.price * row.quantity }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="cartStore.removeItem(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="cart-footer">
        <span class="total">总计：¥{{ cartStore.totalPrice }}</span>
        <el-button type="primary" size="large" @click="$router.push('/checkout')">去结算</el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
const cartStore = useCartStore()
</script>

<style scoped>
.cart-page { max-width: 800px; margin: 0 auto; }
.cart-page h2 { margin-bottom: 20px; }
.cart-footer { display: flex; justify-content: flex-end; align-items: center; gap: 20px; margin-top: 20px; }
.total { font-size: 20px; font-weight: bold; color: #e63946; }
</style>
