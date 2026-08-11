import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'
import { emitAlertUpdate } from '../services/socketManager.js'

const prisma = new PrismaClient()

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, level, status, storeId, page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {}
    if (type) where.type = type as string
    if (level) where.level = level as string
    if (status) where.status = status as string
    if (storeId) where.storeId = parseInt(storeId as string)
    // 店员只能看自己门店的预警
    if (req.user?.role === 'CLERK' || req.user?.role === 'STORE_MANAGER') {
      where.storeId = req.user.storeId
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          store: { select: { id: true, name: true } },
          handler: { select: { id: true, realName: true } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.alert.count({ where }),
    ])

    res.json({ data: alerts, total, page: parseInt(page as string), limit: parseInt(limit as string) })
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        store: { select: { id: true, name: true, address: true } },
        handler: { select: { id: true, realName: true } },
      },
    })
    if (!alert) throw new AppError('预警不存在', 404)
    res.json(alert)
  } catch (err) { next(err) }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body
    const alertId = parseInt(req.params.id)

    const data: any = { status }
    if (status === 'RESOLVED') {
      data.rectifiedAt = new Date()
    }
    if (status === 'ACKNOWLEDGED' || status === 'HANDLING') {
      data.handledBy = req.user!.userId
    }

    const alert = await prisma.alert.update({ where: { id: alertId }, data })

    // 实时推送状态更新
    emitAlertUpdate(alert.storeId, alertId, status)

    res.json(alert)
  } catch (err) { next(err) }
}

export async function uploadProof(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw new AppError('请上传图片', 400)

    const imageUrl = `/uploads/${req.file.filename}`
    const alert = await prisma.alert.update({
      where: { id: parseInt(req.params.id) },
      data: { imageUrl, status: 'RESOLVED', rectifiedAt: new Date(), handledBy: req.user!.userId },
    })

    emitAlertUpdate(alert.storeId, alert.id, 'RESOLVED')
    res.json({ message: '整改凭证已上传', alert, imageUrl })
  } catch (err) { next(err) }
}

export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [total, byType, byLevel, unresolved] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.groupBy({ by: ['type'], _count: true }),
      prisma.alert.groupBy({ by: ['level'], _count: true }),
      prisma.alert.count({ where: { status: { not: 'RESOLVED' } } }),
    ])

    res.json({ total, unresolved, byType, byLevel })
  } catch (err) { next(err) }
}
