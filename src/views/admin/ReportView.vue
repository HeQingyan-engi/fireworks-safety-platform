<template>
  <div>
    <h3 style="margin-bottom:16px">数据报表</h3>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card><template #header>销售报表</template>
          <div v-if="salesReport">
            <el-statistic title="总销售额" :value="salesReport.totalRevenue" prefix="¥" />
            <el-statistic title="订单总数" :value="salesReport.totalOrders" />
            <div v-for="(v,k) in salesReport.byStore" :key="k" style="margin-top:8px">
              <strong>{{ k }}</strong>：{{ v.count }}单，¥{{ v.revenue }}
            </div>
          </div>
          <el-button style="margin-top:12px" @click="loadSales">加载销售报表</el-button>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card><template #header>库存报表</template>
          <div v-if="inventoryReport">
            <el-statistic title="库存总值" :value="inventoryReport.totalValue" prefix="¥" />
            <el-statistic title="低库存项" :value="inventoryReport.lowStockCount" />
            <el-statistic title="缺货项" :value="inventoryReport.outOfStockCount" />
          </div>
          <el-button style="margin-top:12px" @click="loadInventory">加载库存报表</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getSalesReport, getInventoryReport } from '@/api/report'

const salesReport = ref<any>(null)
const inventoryReport = ref<any>(null)

async function loadSales() { try { salesReport.value = await getSalesReport() } catch { /* */ } }
async function loadInventory() { try { inventoryReport.value = await getInventoryReport() } catch { /* */ } }
</script>
