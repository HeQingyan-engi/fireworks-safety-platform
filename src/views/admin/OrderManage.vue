<template>
  <div>
    <h3 style="margin-bottom:16px">订单管理</h3>
    <el-table :data="orders" border stripe v-loading="loading">
      <el-table-column prop="orderNo" label="订单编号" width="160" />
      <el-table-column prop="customerName" label="顾客" width="80" />
      <el-table-column prop="store.name" label="门店" width="120" />
      <el-table-column prop="totalAmount" label="金额" width="80"><template #default="{row}">¥{{row.totalAmount}}</template></el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{row}">
          <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="pickupCode" label="核销码" width="90" />
      <el-table-column label="操作" width="160">
        <template #default="{row}">
          <el-select v-model="row.status" size="small" @change="(v:string) => handleStatus(row.id, v)" style="width:120px">
            <el-option v-for="s in statuses" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOrders, updateOrderStatus } from '@/api/order'
import { ElMessage } from 'element-plus'
import type { OrderStatus } from '@/types/order'

const orders = ref<any[]>([])
const loading = ref(false)
const statuses = [
  { label: '待支付', value: 'PENDING' }, { label: '已支付', value: 'PAID' },
  { label: '备货中', value: 'READY' }, { label: '已取货', value: 'PICKED_UP' }, { label: '已取消', value: 'CANCELLED' },
]

function statusLabel(s: OrderStatus) {
  const map: Record<string, string> = { PENDING: '待支付', PAID: '已支付', READY: '备货中', PICKED_UP: '已取货', CANCELLED: '已取消' }
  return map[s] || s
}
function statusType(s: OrderStatus) {
  const map: Record<string, string> = { PENDING: 'warning', PAID: 'success', READY: 'primary', PICKED_UP: 'info', CANCELLED: 'danger' }
  return map[s] || 'info'
}

async function load() {
  loading.value = true
  try { const d = await getOrders(); orders.value = d.data } catch { /* */ }
  finally { loading.value = false }
}

async function handleStatus(id: number, status: string) {
  try { await updateOrderStatus(id, status); ElMessage.success('状态已更新') } catch { /* */ }
}

onMounted(load)
</script>
