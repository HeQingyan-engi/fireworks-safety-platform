<template>
  <div>
    <h3 style="margin-bottom:16px">库存管理</h3>
    <el-table :data="inventory" border stripe v-loading="loading">
      <el-table-column label="产品" prop="product.name" />
      <el-table-column label="安全等级" width="80">
        <template #default="{row}"><el-tag :type="row.product.safetyLevel==='D'?'success':'warning'" size="small">{{row.product.safetyLevel}}级</el-tag></template>
      </el-table-column>
      <el-table-column label="当前库存" width="100">
        <template #default="{row}">
          <span :style="{color: row.quantity <= 5 ? '#e63946' : '#333', fontWeight: row.quantity <= 5 ? 'bold' : 'normal'}">
            {{ row.quantity }}
          </span>
          <el-tag v-if="row.quantity <= 5" type="danger" size="small" style="margin-left:4px">低</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{row}">
          <el-input-number v-model="row.quantity" :min="0" size="small" style="width:120px" />
          <el-button size="small" type="primary" style="margin-left:8px" @click="updateStock(row)">更新</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/request'
import { ElMessage } from 'element-plus'

const inventory = ref<any[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try { const res = await api.get('/inventory'); inventory.value = res.data } catch { /* */ }
  finally { loading.value = false }
}

async function updateStock(item: any) {
  try {
    await api.put('/inventory/batch', {
      storeId: item.storeId,
      items: [{ productId: item.productId, quantity: item.quantity }],
    })
    ElMessage.success('库存已更新')
  } catch { ElMessage.error('更新失败') }
}

onMounted(load)
</script>
