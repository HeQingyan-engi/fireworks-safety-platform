import cron from 'node-cron'
import logger from '../utils/logger.js'
import { PrismaClient } from '@prisma/client'
import { runScheduledChecks } from './rules/engine.js'

const prisma = new PrismaClient()

/**
 * Initialize all scheduled tasks.
 */
export function initScheduler(): void {
  logger.info('[Scheduler] Initializing scheduled tasks...')

  // Every 5 minutes: run overstock and periodic checks
  cron.schedule('*/5 * * * *', async () => {
    try {
      await runScheduledChecks()
    } catch (err) {
      logger.error('[Scheduler] Periodic check error:', err)
    }
  })

  // Every 1 minute: check device heartbeats
  cron.schedule('* * * * *', async () => {
    try {
      await checkDeviceHeartbeats()
    } catch (err) {
      logger.error('[Scheduler] Device heartbeat check error:', err)
    }
  })

  // Every 2 minutes: check alert escalations
  cron.schedule('*/2 * * * *', async () => {
    try {
      await checkAlertEscalations()
    } catch (err) {
      logger.error('[Scheduler] Alert escalation error:', err)
    }
  })

  // Every day at 3am: cleanup old device readings (keep 90 days)
  cron.schedule('0 3 * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      const result = await prisma.deviceReading.deleteMany({
        where: { timestamp: { lt: cutoff } },
      })
      logger.info(`[Scheduler] Cleaned ${result.count} old device readings`)
    } catch (err) {
      logger.error('[Scheduler] Cleanup error:', err)
    }
  })

  logger.info('[Scheduler] All tasks scheduled')
}

/**
 * Check if devices have stopped sending heartbeats.
 * Devices with no heartbeat for > 5 minutes are marked OFFLINE.
 */
async function checkDeviceHeartbeats(): Promise<void> {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000)
  const result = await prisma.device.updateMany({
    where: {
      status: 'ONLINE',
      lastHeartbeat: { lt: cutoff },
    },
    data: { status: 'OFFLINE' },
  })
  if (result.count > 0) {
    logger.warn(`[Scheduler] Marked ${result.count} devices as OFFLINE`)
  }
}

/**
 * Check for alerts that should be escalated.
 */
async function checkAlertEscalations(): Promise<void> {
  // Find rules with escalation enabled
  const rules = await prisma.alertRule.findMany({
    where: { escalationEnabled: true },
  })

  for (const rule of rules) {
    if (!rule.escalateAfterMin || !rule.escalateToLevel) continue

    const cutoff = new Date(Date.now() - rule.escalateAfterMin * 60 * 1000)

    // Find unresolved alerts matching this rule's type that are old enough
    const alerts = await prisma.alert.findMany({
      where: {
        type: rule.alertType,
        status: { not: 'RESOLVED' },
        level: { not: rule.escalateToLevel }, // not already escalated
        createdAt: { lt: cutoff },
        ...(rule.storeId ? { storeId: rule.storeId } : {}),
      },
    })

    for (const alert of alerts) {
      // Only escalate if current level is lower than target
      const levelOrder = ['YELLOW', 'ORANGE', 'RED']
      if (levelOrder.indexOf(alert.level) >= levelOrder.indexOf(rule.escalateToLevel)) {
        continue
      }

      await prisma.alert.update({
        where: { id: alert.id },
        data: { level: rule.escalateToLevel },
      })

      logger.info(
        `[Scheduler] Escalated alert #${alert.id} from ${alert.level} to ${rule.escalateToLevel}`,
      )
    }
  }
}
