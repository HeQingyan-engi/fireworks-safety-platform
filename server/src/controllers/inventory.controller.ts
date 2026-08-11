import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const storeId = req.user?.storeId || parseInt(req.query.storeId as string)
    if (!storeId) {
      res.status(400).json({ message: '请指定门店' })
      return
    }

    const inventory = await prisma.inventory.findMany({
      where: { storeId },
      include: {
        product: {
          select: { id: true, name: true, price: true, safetyLevel: true, powderQuantity: true, imageUrl: true },
        },
      },
      orderBy: { product: { name: 'asc' } },
    })

    res.json(inventory)
  } catch (err) { next(err) }
}

export async function batchUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { storeId, items } = req.body // items: { productId, quantity }[]

    for (const item of items) {
      await prisma.inventory.upsert({
        where: { storeId_productId: { storeId, productId: item.productId } },
        update: { quantity: item.quantity },
        create: { storeId, productId: item.productId, quantity: item.quantity },
      })
    }

    res.json({ message: `成功更新${items.length}条库存记录` })
  } catch (err) { next(err) }
}

export async function getThresholdAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const storeId = req.user?.storeId || parseInt(req.query.storeId as string)
    if (!storeId) {
      res.status(400).json({ message: '请指定门店' })
      return
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } })
    const lowStock = await prisma.inventory.findMany({
      where: { storeId, quantity: { lte: 5 } },
      include: { product: { select: { id: true, name: true } } },
    })

    res.json({ storeCapacity: store?.capacity, lowStockItems: lowStock })
  } catch (err) { next(err) }
}
