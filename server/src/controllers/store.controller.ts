import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stores = await prisma.store.findMany({
      include: { _count: { select: { alerts: true } } },
      orderBy: { id: 'asc' },
    })
    res.json(stores)
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        _count: { select: { alerts: true, inventory: true, orders: true } },
      },
    })
    if (!store) throw new AppError('门店不存在', 404)
    res.json(store)
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const store = await prisma.store.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    })
    res.json(store)
  } catch (err) { next(err) }
}

export async function getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { id: true, name: true, status: true },
    })
    if (!store) throw new AppError('门店不存在', 404)

    const recentAlerts = await prisma.alert.count({
      where: { storeId: store.id, status: { not: 'RESOLVED' } },
    })

    res.json({ ...store, unresolvedAlerts: recentAlerts })
  } catch (err) { next(err) }
}
