<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>产品管理</h3>
      <el-button type="primary" @click="openDialog()">新增产品</el-button>
    </div>
    <el-table :data="products" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="产品名称" />
      <el-table-column prop="categoryName" label="分类" width="100" />
      <el-table-column prop="price" label="价格" width="80"><template #default="{row}">¥{{row.price}}</template></el-table-column>
      <el-table-column prop="safetyLevel" label="安全等级" width="80" />
      <el-table-column prop="powderQuantity" label="药量(g)" width="80" />
      <el-table-column label="操作" width="140">
        <template #default="{row}">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editing?.id ? '编辑产品' : '新增产品'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" style="width:100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" /></el-form-item>
        <el-form-item label="安全等级">
          <el-select v-model="form.safetyLevel"><el-option label="C级" value="C" /><el-option label="D级" value="D" /></el-select>
        </el-form-item>
        <el-form-item label="药量(g)"><el-input v-model="form.powderQuantity" /></el-form-item>
        <el-form-item label="安全距离(m)"><el-input v-model="form.safetyDistance" /></el-form-item>
        <el-form-item label="执行标准"><el-input v-model="form.standards" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
        <el-form-item label="儿童友好"><el-switch v-model="form.isKidFriendly" /></el-form-item>
        <el-form-item label="促销"><el-switch v-model="form.isOnSale" /></el-form-item>
        <el-form-item v-if="form.isOnSale" label="原价"><el-input-number v-model="form.originalPrice" :min="0" /></el-form-item>
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
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '@/api/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Product, Category } from '@/types/product'

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const editing = ref<Product | null>(null)
const form = ref<Record<string, any>>({
  name: '', categoryId: 1, price: 0, safetyLevel: 'D', powderQuantity: '', safetyDistance: '', standards: 'GB 10631-2025', description: '', isKidFriendly: false, isOnSale: false, originalPrice: undefined,
})

async function load() {
  loading.value = true
  try { const d = await getProducts(); products.value = d.data } catch { /* */ }
  finally { loading.value = false }
}

function openDialog(product?: Product) {
  if (product) {
    editing.value = product
    form.value = { ...product }
  } else {
    editing.value = null
    form.value = { name: '', categoryId: 1, price: 0, safetyLevel: 'D', powderQuantity: '', safetyDistance: '', standards: 'GB 10631-2025', description: '', isKidFriendly: false, isOnSale: false, originalPrice: undefined }
  }
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editing.value?.id) {
      await updateProduct(editing.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createProduct(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await load()
  } catch { /* */ }
  finally { saving.value = false }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该产品？', '确认', { type: 'warning' })
    await deleteProduct(id)
    ElMessage.success('已删除')
    await load()
  } catch { /* */ }
}

onMounted(async () => {
  await load()
  try { categories.value = await getCategories() } catch { /* */ }
})
</script>
