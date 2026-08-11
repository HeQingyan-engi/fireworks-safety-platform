<template>
  <div class="checkout-page">
    <h2>确认订单</h2>

    <!-- 订单商品 -->
    <el-card style="margin-bottom: 16px">
      <template #header>商品清单</template>
      <el-table :data="cartStore.items" style="width:100%">
        <el-table-column prop="name" label="商品" />
        <el-table-column prop="price" label="单价" width="80"><template #default="{row}">¥{{row.price}}</template></el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column label="小计" width="100"><template #default="{row}">¥{{row.price * row.quantity}}</template></el-table-column>
      </el-table>
      <div style="text-align:right;font-size:20px;font-weight:bold;margin-top:12px">总计：¥{{ cartStore.totalPrice }}</div>
    </el-card>

    <!-- 客户信息 -->
    <el-card style="margin-bottom: 16px">
      <template #header>取货信息</template>
      <el-form :model="form" label-width="100px">
        <el-form-item label="姓名" required><el-input v-model="form.customerName" placeholder="请输入姓名" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.customerPhone" placeholder="请输入手机号" /></el-form-item>
        <el-form-item label="取货门店">
          <el-select v-model="form.storeId" placeholder="请选择" style="width:100%">
            <el-option v-for="s in stores" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 安全告知 -->
    <el-card style="margin-bottom: 16px">
      <template #header>⚠️ 安全告知（强制阅读）</template>
      <div class="safety-notice">
        <h4>烟花爆竹购买安全须知</h4>
        <ol>
          <li>烟花爆竹属于易燃易爆物品，请务必在合法零售店购买。</li>
          <li>购买时请出示有效身份证件，配合实名登记。</li>
          <li>C级产品需在开放空间燃放，保持{{ 20 }}米以上安全距离。</li>
          <li>D级产品需在成人监护下使用，保持{{ 5 }}米以上安全距离。</li>
          <li>严禁在禁放区、人员密集场所、加油站附近燃放。</li>
          <li>严禁向人群、车辆、建筑物投掷烟花爆竹。</li>
          <li>燃放后请确认无明火后再离开，防止引发火灾。</li>
          <li>未成年人须在成人陪同下购买和燃放烟花爆竹。</li>
        </ol>
        <el-checkbox v-model="agreed" style="margin-top:12px">
          我已仔细阅读并理解以上安全须知，承诺遵守相关规定
        </el-checkbox>
      </div>
    </el-card>

    <!-- 电子签名 -->
    <el-card style="margin-bottom: 16px">
      <template #header>✍️ 电子签名确认</template>
      <SignaturePad ref="signaturePadRef" />
    </el-card>

    <div style="text-align:center">
      <el-button size="large" @click="$router.back()">返回修改</el-button>
      <el-button type="primary" size="large" :disabled="!canSubmit" :loading="submitting" @click="submitOrder">
        确认下单（¥{{ cartStore.totalPrice }}）
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { createOrder } from '@/api/order'
import { getStores } from '@/api/store'
import { ElMessage } from 'element-plus'
import SignaturePad from '@/components/SignaturePad.vue'
import type { Store } from '@/types/store'

const cartStore = useCartStore()
const router = useRouter()

const stores = ref<Store[]>([])
const form = ref({ customerName: '', customerPhone: '', storeId: null as number | null })
const agreed = ref(false)
const submitting = ref(false)
const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null)

const canSubmit = computed(() => form.value.customerName && form.value.storeId && agreed.value && cartStore.items.length > 0)

onMounted(async () => {
  try { stores.value = await getStores() } catch { /* */ }
})

async function submitOrder() {
  if (!canSubmit.value) return

  const signatureImage = signaturePadRef.value?.getSignature()
  if (!signatureImage) {
    ElMessage.warning('请完成电子签名')
    return
  }

  submitting.value = true
  try {
    const order = await createOrder({
      storeId: form.value.storeId!,
      customerName: form.value.customerName,
      customerPhone: form.value.customerPhone,
      items: cartStore.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
    })
    // Sign safety
    await import('@/api/order').then((m) => m.signSafety(order.id, signatureImage))
    cartStore.items = []
    ElMessage.success('下单成功！')
    router.push(`/order/${order.id}`)
  } catch {
    ElMessage.error('下单失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-page { max-width: 700px; margin: 0 auto; }
.checkout-page h2 { margin-bottom: 20px; }
.safety-notice ol { padding-left: 20px; line-height: 1.8; }
.safety-notice ol li { margin-bottom: 4px; }
</style>
