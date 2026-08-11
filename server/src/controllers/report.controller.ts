import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function salesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { storeId, startDate, endDate } = req.query
    const where: any = { status: { not: 'CANCELLED' } }
    if (storeId) where.storeId = parseInt(storeId as string)
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        store: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalOrders = orders.length
    const byStore: Record<string, { count: number; revenue: number }> = {}
    for (const o of orders) {
      const key = o.store.name
      if (!byStore[key]) byStore[key] = { count: 0, revenue: 0 }
      byStore[key].count++
      byStore[key].revenue += o.totalAmount
    }

    res.json({ totalRevenue, totalOrders, byStore, orders })
  } catch (err) { next(err) }
}

export async function inventoryReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { storeId } = req.query
    const where: any = {}
    if (storeId) where.storeId = parseInt(storeId as string)

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, price: true, powderQuantity: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { quantity: 'asc' },
    })

    const totalValue = inventory.reduce((sum, i) => sum + i.quantity * i.product.price, 0)
    const lowStock = inventory.filter((i) => i.quantity <= 5)
    const outOfStock = inventory.filter((i) => i.quantity === 0)

    res.json({ totalValue, totalItems: inventory.length, lowStockCount: lowStock.length, outOfStockCount: outOfStock.length, inventory })
  } catch (err) { next(err) }
}

export async function complianceReport(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stores = await prisma.store.findMany({
      include: {
        _count: { select: { alerts: true, flowRegs: true } },
      },
    })

    const data = stores.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      alertCount: s._count.alerts,
      flowCount: s._count.flowRegs,
      complianceScore: Math.max(0, 100 - s._count.alerts * 5), // 简化的合规评分
    }))

    res.json({ stores: data })
  } catch (err) { next(err) }
}
