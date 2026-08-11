<template>
  <div class="order-detail" v-if="order">
    <h2>订单详情</h2>
    <el-card style="margin-bottom:16px">
      <template #header>订单信息</template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ order.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="statusType">{{ statusLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="顾客姓名">{{ order.customerName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ order.customerPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="取货门店">{{ order.storeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ order.createdAt }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="margin-bottom:16px">
      <template #header>商品清单</template>
      <el-table :data="order.items" style="width:100%">
        <el-table-column prop="productName" label="商品" />
        <el-table-column label="单价" width="80"><template #default="{row}">¥{{row.price}}</template></el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column label="小计" width="100"><template #default="{row}">¥{{row.price * row.quantity}}</template></el-table-column>
      </el-table>
      <div style="text-align:right;font-size:18px;font-weight:bold;margin-top:12px">总计：¥{{ order.totalAmount }}</div>
    </el-card>

    <el-card v-if="order.pickupCode" style="margin-bottom:16px;text-align:center">
      <template #header>取货核销码</template>
      <div class="pickup-code">
        <h1>{{ order.pickupCode }}</h1>
        <p>请向店员出示此码取货</p>
      </div>
    </el-card>

    <div style="text-align:center">
      <el-button @click="$router.push('/')">继续购物</el-button>
      <el-button v-if="order.status === 'PENDING'" type="primary" :loading="paying" @click="handlePay">模拟支付</el-button>
    </div>
  </div>
  <div v-else style="text-align:center;padding:60px">加载中...</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getOrderById, mockPay } from '@/api/order'
import { ElMessage } from 'element-plus'
import type { Order, OrderStatus } from '@/types/order'

const route = useRoute()
const order = ref<Order | null>(null)
const paying = ref(false)

const statusLabel = computed(() => {
  const map: Record<OrderStatus, string> = { PENDING: '待支付', PAID: '已支付', READY: '备货中', PICKED_UP: '已取货', CANCELLED: '已取消' }
  return map[order.value?.status as OrderStatus] || '-'
})
const statusType = computed(() => {
  const map: Record<OrderStatus, string> = { PENDING: 'warning', PAID: 'success', READY: 'primary', PICKED_UP: 'info', CANCELLED: 'danger' }
  return map[order.value?.status as OrderStatus] || 'info'
})

async function handlePay() {
  if (!order.value) return
  paying.value = true
  try {
    await mockPay(order.value.id)
    order.value.status = 'PAID'
    ElMessage.success('支付成功！')
  } catch { ElMessage.error('支付失败') }
  finally { paying.value = false }
}

onMounted(async () => {
  try { order.value = await getOrderById(parseInt(route.params.id as string)) } catch { ElMessage.error('订单不存在') }
})
</script>

<style scoped>
.order-detail { max-width: 700px; margin: 0 auto; }
.order-detail h2 { margin-bottom: 20px; }
.pickup-code h1 { font-size: 48px; letter-spacing: 8px; color: #409eff; margin: 8px 0; }
.pickup-code p { color: #999; }
</style>
