import { PrismaClient } from '@prisma/client'
import { emitAlert } from '../socketManager.js'
import { dispatchNotifications } from '../notification/dispatch.js'
import logger from '../../utils/logger.js'

const prisma = new PrismaClient()

// Dedup cache: key = "storeId:alertType", value = last trigger timestamp
const dedupCache = new Map<string, number>()

interface RuleCondition {
  metric: string
  operator: string
  value: number | [number, number]
}

interface SensorContext {
  deviceId?: number
  confidence?: number
  [key: string]: any
}

/**
 * Process a sensor reading against alert rules.
 * Called by the MQTT sensor handler whenever new data arrives.
 */
export async function processSensorReading(
  storeId: number,
  metric: string,
  value: number,
  context: SensorContext = {},
): Promise<void> {
  try {
    // Find rules that match this metric
    const rules = await prisma.alertRule.findMany({
      where: {
        OR: [
          { storeId },
          { storeId: null }, // global rules
        ],
        enabled: true,
      },
      orderBy: { priority: 'asc' },
    })

    for (const rule of rules) {
      const conditions: RuleCondition[] = JSON.parse(rule.conditions)
      const relevantMetric = conditions.some((c) => c.metric === metric)
      if (!relevantMetric) continue

      // Build context for evaluation
      const evalContext: Record<string, number> = { [metric]: value }
      if (context.confidence !== undefined) evalContext['confidence'] = context.confidence

      // Evaluate conditions
      const matched = evaluateConditions(conditions, evalContext, rule.logicOp)
      if (!matched) continue

      // Check dedup
      const dedupKey = `${storeId}:${rule.alertType}`
      const lastTriggered = dedupCache.get(dedupKey)
      const now = Date.now()
      if (lastTriggered && (now - lastTriggered) < rule.dedupWindow * 60 * 1000) {
        continue // Still in cooldown
      }
      dedupCache.set(dedupKey, now)

      // Build title and description from templates
      const title = interpolateTemplate(rule.titleTmpl, evalContext)
      const description = rule.descTmpl
        ? interpolateTemplate(rule.descTmpl, evalContext)
        : null

      // Create alert
      const alert = await prisma.alert.create({
        data: {
          storeId,
          type: rule.alertType,
          level: rule.alertLevel,
          title,
          description,
          status: 'NEW',
        },
      })

      logger.info(
        `[RuleEngine] Alert created: ${rule.alertType} [${rule.alertLevel}] for store ${storeId}`,
      )

      // Push via Socket.IO
      emitAlert(storeId, alert)

      // Dispatch notifications (SMS, voice, etc.)
      await dispatchNotifications(alert)
    }
  } catch (err) {
    logger.error(`[RuleEngine] Error processing sensor reading:`, err)
  }
}

/**
 * Evaluate rule conditions against sensor values.
 */
function evaluateConditions(
  conditions: RuleCondition[],
  context: Record<string, number>,
  logicOp: string,
): boolean {
  const results = conditions.map((cond) => evaluateCondition(cond, context))
  if (logicOp === 'ALL') return results.every(Boolean)
  return results.some(Boolean) // ANY (default)
}

function evaluateCondition(cond: RuleCondition, context: Record<string, number>): boolean {
  const actual = context[cond.metric]
  if (actual === undefined) return false

  const expected = cond.value

  switch (cond.operator) {
    case '>=':
      return actual >= (expected as number)
    case '>':
      return actual > (expected as number)
    case '<=':
      return actual <= (expected as number)
    case '<':
      return actual < (expected as number)
    case '==':
      return actual === (expected as number)
    case '!=':
      return actual !== (expected as number)
    case 'BETWEEN':
      return (
        Array.isArray(expected) &&
        expected.length === 2 &&
        actual >= expected[0] &&
        actual <= expected[1]
      )
    default:
      return false
  }
}

/**
 * Replace {{variable}} placeholders in template strings.
 */
function interpolateTemplate(template: string, context: Record<string, number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const val = context[key]
    if (val !== undefined) {
      // Round to 1 decimal for floats
      return typeof val === 'number' ? val.toFixed(1).replace(/\.0$/, '') : String(val)
    }
    return `{{${key}}}`
  })
}

/**
 * Run periodic checks across all stores (for stock checks, etc.)
 */
export async function runScheduledChecks(): Promise<void> {
  logger.info('[RuleEngine] Running scheduled checks...')
  const stores = await prisma.store.findMany({ where: { status: 'NORMAL' } })

  for (const store of stores) {
    try {
      // Check overstock
      if (store.capacity) {
        const inventories = await prisma.inventory.findMany({
          where: { storeId: store.id },
          include: { product: true },
        })
        let estimatedStock = 0
        for (const inv of inventories) {
          const powderQty = parseFloat(inv.product.powderQuantity || '0')
          estimatedStock += powderQty * inv.quantity
        }
        await processSensorReading(store.id, 'stockRatio', estimatedStock / store.capacity, {})
      }
    } catch (err) {
      logger.error(`[RuleEngine] Error checking store ${store.id}:`, err)
    }
  }

  logger.info(`[RuleEngine] Checked ${stores.length} stores`)
}

/**
 * Seed default alert rules into the database.
 */
export async function seedDefaultRules(): Promise<void> {
  const existing = await prisma.alertRule.count()
  if (existing > 0) return

  const defaultRules = [
    {
      alertType: 'TEMP_HUMIDITY_ANOMALY',
      name: '仓库温度偏高',
      priority: 1,
      conditions: JSON.stringify([{ metric: 'temperature', operator: '>=', value: 35 }]),
      logicOp: 'ANY',
      alertLevel: 'YELLOW',
      titleTmpl: '仓库温度偏高：{{temperature}}°C',
      descTmpl: '当前温度{{temperature}}°C，达到黄色预警阈值35°C。建议开启通风降温。',
      dedupWindow: 30,
      escalationEnabled: true,
      escalateAfterMin: 15,
      escalateToLevel: 'ORANGE',
    },
    {
      alertType: 'TEMP_HUMIDITY_ANOMALY',
      name: '仓库温度过高',
      priority: 2,
      conditions: JSON.stringify([{ metric: 'temperature', operator: '>=', value: 40 }]),
      logicOp: 'ANY',
      alertLevel: 'ORANGE',
      titleTmpl: '仓库温度过高：{{temperature}}°C',
      descTmpl: '当前温度{{temperature}}°C，超过橙色预警阈值40°C。请立即降温处理！',
      dedupWindow: 20,
      escalationEnabled: true,
      escalateAfterMin: 10,
      escalateToLevel: 'RED',
    },
    {
      alertType: 'TEMP_HUMIDITY_ANOMALY',
      name: '仓库温度极度危险',
      priority: 3,
      conditions: JSON.stringify([{ metric: 'temperature', operator: '>=', value: 50 }]),
      logicOp: 'ANY',
      alertLevel: 'RED',
      titleTmpl: '🚨 仓库温度极度危险：{{temperature}}°C',
      descTmpl: '温度达到{{temperature}}°C！高温可能导致自燃，请启动消防应急预案！',
      dedupWindow: 10,
    },
    {
      alertType: 'TEMP_HUMIDITY_ANOMALY',
      name: '仓库湿度过高',
      priority: 1,
      conditions: JSON.stringify([{ metric: 'humidity', operator: '>=', value: 85 }]),
      logicOp: 'ANY',
      alertLevel: 'ORANGE',
      titleTmpl: '仓库湿度过高：{{humidity}}%RH',
      descTmpl: '当前湿度{{humidity}}%RH，超过上限85%RH。请检查防潮措施。',
      dedupWindow: 30,
    },
    {
      alertType: 'SMOKE_FIRE',
      name: '烟雾检测报警',
      priority: 1,
      conditions: JSON.stringify([{ metric: 'smokeDetected', operator: '==', value: 1 }]),
      logicOp: 'ANY',
      alertLevel: 'RED',
      titleTmpl: '🚨 检测到烟雾！',
      descTmpl: '烟雾探测器触发报警，请立即检查现场，启动消防应急预案！',
      dedupWindow: 3,
    },
    {
      alertType: 'SMOKE_FIRE',
      name: '火情检测',
      priority: 1,
      conditions: JSON.stringify([{ metric: 'fireDetected', operator: '==', value: 1 }]),
      logicOp: 'ANY',
      alertLevel: 'RED',
      titleTmpl: '🚨 检测到火情！',
      descTmpl: 'AI摄像头检测到明火！请立即拨打119，疏散人员，启动消防应急预案！',
      dedupWindow: 1,
    },
    {
      alertType: 'CROWD_GATHERING',
      name: '人员聚集预警',
      priority: 1,
      conditions: JSON.stringify([{ metric: 'personCount', operator: '>=', value: 10 }]),
      logicOp: 'ANY',
      alertLevel: 'YELLOW',
      titleTmpl: '店内人员聚集：{{personCount}}人',
      descTmpl: '当前店内人数{{personCount}}人，达到预警值10人。请疏导人员或限制入店。',
      dedupWindow: 10,
    },
    {
      alertType: 'CROWD_GATHERING',
      name: '人员严重聚集',
      priority: 2,
      conditions: JSON.stringify([{ metric: 'personCount', operator: '>=', value: 20 }]),
      logicOp: 'ANY',
      alertLevel: 'ORANGE',
      titleTmpl: '店内人员严重聚集：{{personCount}}人',
      descTmpl: '当前店内人数{{personCount}}人，严重超标！请立即限制入店并疏导人群。',
      dedupWindow: 5,
    },
    {
      alertType: 'OVERSTOCK',
      name: '库存接近上限',
      priority: 1,
      conditions: JSON.stringify([{ metric: 'stockRatio', operator: '>=', value: 0.8 }]),
      logicOp: 'ANY',
      alertLevel: 'YELLOW',
      titleTmpl: '门店库存接近上限',
      descTmpl: '库存占比{{stockRatio}}%，已达到核定存储量的80%。',
      dedupWindow: 60,
    },
    {
      alertType: 'OVERSTOCK',
      name: '库存超标',
      priority: 2,
      conditions: JSON.stringify([{ metric: 'stockRatio', operator: '>=', value: 1.0 }]),
      logicOp: 'ANY',
      alertLevel: 'ORANGE',
      titleTmpl: '门店库存超标！',
      descTmpl: '库存占比{{stockRatio}}%，已超过核定存储量！请立即处理超量存放问题。',
      dedupWindow: 30,
    },
    {
      alertType: 'SMOKING',
      name: '吸烟/点火检测',
      priority: 1,
      conditions: JSON.stringify([{ metric: 'smokingDetected', operator: '==', value: 1 }]),
      logicOp: 'ANY',
      alertLevel: 'RED',
      titleTmpl: '检测到吸烟或点火行为',
      descTmpl: 'AI摄像头检测到吸烟/点火行为！请立即制止，检查周边是否有易燃物。',
      dedupWindow: 5,
    },
    {
      alertType: 'OUTDOOR_ILLEGAL',
      name: '店外违规摆放',
      priority: 1,
      conditions: JSON.stringify([{ metric: 'outdoorActivity', operator: '==', value: 1 }]),
      logicOp: 'ANY',
      alertLevel: 'YELLOW',
      titleTmpl: '检测到店外违规摆放',
      descTmpl: '请立即将产品搬回店内，严禁店外存放烟花爆竹。',
      dedupWindow: 10,
    },
    {
      alertType: 'OUTDOOR_TEST_FIRE',
      name: '店外试放检测',
      priority: 1,
      conditions: JSON.stringify([{ metric: 'outdoorActivity', operator: '==', value: 1 }, { metric: 'smokingDetected', operator: '==', value: 1 }]),
      logicOp: 'ALL',
      alertLevel: 'RED',
      titleTmpl: '检测到店外点火/试放行为',
      descTmpl: '极度危险！请立即制止并检查是否波及周围人员和建筑。',
      dedupWindow: 3,
    },
  ]

  for (const rule of defaultRules) {
    await prisma.alertRule.create({ data: rule })
  }
  logger.info(`[RuleEngine] Seeded ${defaultRules.length} default alert rules`)
}
