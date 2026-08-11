import { PrismaClient } from '@prisma/client'
import logger from './logger.js'

const prisma = new PrismaClient()

export async function writeAuditLog(
  userId: number,
  action: string,
  entity: string,
  entityId?: number,
  detail?: string,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { userId, action, entity, entityId, detail },
    })
  } catch (err) {
    logger.error(`Audit log write failed: ${err}`)
  }
}
