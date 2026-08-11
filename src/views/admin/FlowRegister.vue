<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>流向登记（AQ 4102-2026）</h3>
      <el-button type="primary" @click="dialogVisible = true">新增记录</el-button>
    </div>
    <el-table :data="flows" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="类型" width="80">
        <template #default="{row}"><el-tag :type="flowTypeColor(row.type)" size="small">{{ flowTypeLabel(row.type) }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="product.name" label="产品" />
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="batchNo" label="批次号" width="120" />
      <el-table-column prop="supplier" label="供应商" width="100" />
      <el-table-column prop="operator.realName" label="操作人" width="80" />
      <el-table-column label="时间" width="160">
        <template #default="{row}">{{ new Date(row.createdAt).toLocaleString() }}</template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="新增流向记录" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio-button value="PURCHASE">入库</el-radio-button>
            <el-radio-button value="SALE">销售出库</el-radio-button>
            <el-radio-button value="RETURN">退货</el-radio-button>
            <el-radio-button value="DESTROY">销毁</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="产品">
          <el-select v-model="form.productId" style="width:100%">
            <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量"><el-input-number v-model="form.quantity" :min="1" /></el-form-item>
        <el-form-item label="批次号"><el-input v-model="form.batchNo" /></el-form-item>
        <el-form-item label="供应商"><el-input v-model="form.supplier" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/request'
import { getProducts } from '@/api/product'
import { ElMessage } from 'element-plus'
import type { Product } from '@/types/product'

const flows = ref<any[]>([])
const products = ref<Product[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const form = ref({ type: 'PURCHASE', productId: 1, quantity: 1, batchNo: '', supplier: '', remark: '' })

const flowTypeLabel = (t: string) => ({ PURCHASE: '入库', SALE: '销售出库', RETURN: '退货', DESTROY: '销毁' })[t] || t
const flowTypeColor = (t: string) => ({ PURCHASE: 'success', SALE: 'warning', RETURN: 'primary', DESTROY: 'danger' })[t] || 'info'

async function load() {
  loading.value = true
  try { const res = await api.get('/flow'); flows.value = res.data.data } catch { /* */ }
  finally { loading.value = false }
}

async function handleSave() {
  saving.value = true
  try {
    await api.post('/flow', form.value)
    ElMessage.success('记录已创建，库存已自动更新')
    dialogVisible.value = false
    await load()
  } catch { /* */ }
  finally { saving.value = false }
}

onMounted(async () => {
  await load()
  try { const d = await getProducts(); products.value = d.data } catch { /* */ }
})
</script>
