<template>
  <div>
    <h3 style="margin-bottom:16px">门店管理</h3>
    <el-table :data="stores" border stripe>
      <el-table-column prop="code" label="许可证号" width="140" />
      <el-table-column prop="name" label="门店名称" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="contact" label="联系人" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="{row}">
          <el-tag :type="row.status==='NORMAL'?'success':row.status==='CAUTION'?'warning':'danger'" size="small">
            {{ row.status === 'NORMAL' ? '正常' : row.status === 'CAUTION' ? '注意' : '危险' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{row}">
          <el-button size="small" @click="$router.push('/gov/store/' + row.id)">一企一档</el-button>
          <el-button size="small" type="primary" @click="$router.push('/gov/inspect/' + row.id)">巡查</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStores } from '@/api/store'
import type { Store } from '@/types/store'

const stores = ref<Store[]>([])

onMounted(async () => { try { stores.value = await getStores() } catch { /* */ } })
</script>
