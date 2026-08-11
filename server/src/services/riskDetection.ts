import { PrismaClient } from '@prisma/client'
import { emitAlert } from './socketManager.js'

const prisma = new PrismaClient()

/**
 * 风险检测服务 - 8大场景检测引擎
 * 每个检测函数返回 Alert | null，null表示无风险
 */

// 场景1：店内超量存放 - 库存量 vs 核定存储量
export async function checkOverstock(storeId: number): Promise<void> {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store || !store.capacity) return

  const inventories = await prisma.inventory.findMany({
    where: { storeId },
    include: { product: true },
  })

  // 简单估算：假设每个产品平均药量 * 库存数量
  let estimatedStock = 0
  for (const inv of inventories) {
    const powderQty = parseFloat(inv.product.powderQuantity || '0')
    estimatedStock += powderQty * inv.quantity
  }

  // 超过核定存储量80%预警，超过100%严重预警
  if (estimatedStock > store.capacity) {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'OVERSTOCK',
        level: 'ORANGE',
        title: `门店库存超标：当前${estimatedStock.toFixed(0)}g，核定${store.capacity}g`,
        description: `库存量已超过核定存储量的${((estimatedStock / store.capacity) * 100).toFixed(1)}%`,
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  } else if (estimatedStock > store.capacity * 0.8) {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'OVERSTOCK',
        level: 'YELLOW',
        title: `门店库存接近上限：当前${estimatedStock.toFixed(0)}g，核定${store.capacity}g`,
        description: `库存量已达到核定存储量的${((estimatedStock / store.capacity) * 100).toFixed(1)}%`,
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  }
}

// 场景2：店内人员聚集 - 摄像头AI人头计数
export async function checkCrowdGathering(storeId: number, personCount: number): Promise<void> {
  const MAX_PERSONS = 10 // 门店核定人数上限
  if (personCount > MAX_PERSONS) {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'CROWD_GATHERING',
        level: 'YELLOW',
        title: `店内人员聚集：当前${personCount}人，上限${MAX_PERSONS}人`,
        description: '请疏导人员、限制入店人数',
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  }
}

// 场景3：吸烟/点火检测 - 摄像头AI
export async function checkSmoking(storeId: number, detected: boolean): Promise<void> {
  if (detected) {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'SMOKING',
        level: 'RED',
        title: '检测到店内吸烟或点火行为',
        description: '请立即制止，检查周边是否有易燃物',
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  }
}

// 场景4：超范围经营 - 规则引擎
export async function checkOutOfScopeSales(storeId: number, productId: number): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return

  // 如果是B级产品，需要特殊许可
  if (product.safetyLevel === 'B') {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'OUT_OF_SCOPE_SALES',
        level: 'ORANGE',
        title: `疑似超范围经营：${product.name}（B级产品）`,
        description: 'B级产品需持有相应销售许可，请核实经营许可范围',
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  }
}

// 场景5：店外违规摆放
export async function checkOutdoorIllegal(storeId: number, detected: boolean): Promise<void> {
  if (detected) {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'OUTDOOR_ILLEGAL',
        level: 'YELLOW',
        title: '检测到店外违规摆放产品',
        description: '请立即将产品搬回店内，严禁店外存放烟花爆竹',
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  }
}

// 场景6：店外点火/试放
export async function checkOutdoorTestFire(storeId: number, detected: boolean): Promise<void> {
  if (detected) {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'OUTDOOR_TEST_FIRE',
        level: 'RED',
        title: '检测到店外点火或试放行为',
        description: '极度危险！请立即制止，并检查是否波及周围人员和建筑',
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  }
}

// 场景7：温湿度超标
export async function checkTempHumidity(
  storeId: number,
  temperature: number,
  humidity: number,
): Promise<void> {
  if (temperature > 40) {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'TEMP_HUMIDITY_ANOMALY',
        level: 'ORANGE',
        title: `仓库温度超标：当前${temperature}°C，上限40°C`,
        description: '高温可能导致烟花爆竹自燃或性质不稳定，请立即降温处理',
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  }

  if (humidity > 85) {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'TEMP_HUMIDITY_ANOMALY',
        level: 'ORANGE',
        title: `仓库湿度过高：当前${humidity}%RH，上限85%RH`,
        description: '高湿度可能导致烟花爆竹受潮变质，请检查防潮措施',
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  }
}

// 场景8：烟雾/火情检测
export async function checkSmokeFire(storeId: number, detected: boolean): Promise<void> {
  if (detected) {
    const alert = await prisma.alert.create({
      data: {
        storeId,
        type: 'SMOKE_FIRE',
        level: 'RED',
        title: '🚨 检测到烟雾/火情！',
        description: '立即启动消防应急预案，疏散人员，拨打119报警',
        status: 'NEW',
      },
    })
    emitAlert(storeId, alert)
  }
}

/**
 * 定时巡检：对所有门店执行规则类检测
 * 可通过 node-cron 定时调用此函数
 */
export async function runScheduledChecks(): Promise<void> {
  console.log('[RiskDetection] Running scheduled checks...')
  const stores = await prisma.store.findMany()
  for (const store of stores) {
    try {
      await checkOverstock(store.id)
    } catch (err) {
      console.error(`[RiskDetection] Error checking store ${store.id}:`, err)
    }
  }
  console.log(`[RiskDetection] Checked ${stores.length} stores`)
}
