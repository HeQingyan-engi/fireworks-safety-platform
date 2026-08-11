import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, storeId, startDate, endDate, page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {}
    if (type) where.type = type as string
    if (storeId) where.storeId = parseInt(storeId as string)
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate as string) }
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) }

    const [flows, total] = await Promise.all([
      prisma.flowReg.findMany({
        where,
        include: {
          product: { select: { id: true, name: true } },
          operator: { select: { id: true, realName: true } },
          store: { select: { id: true, name: true } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.flowReg.count({ where }),
    ])

    res.json({ data: flows, total, page: parseInt(page as string), limit: parseInt(limit as string) })
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { storeId, type, productId, quantity, batchNo, supplier, remark } = req.body

    const flow = await prisma.flowReg.create({
      data: {
        storeId,
        type,
        productId,
        quantity,
        batchNo,
        supplier,
        operatorId: req.user!.userId,
        remark,
      },
    })

    // 自动更新库存
    const existingInv = await prisma.inventory.findUnique({
      where: { storeId_productId: { storeId, productId } },
    })

    if (type === 'PURCHASE') {
      await prisma.inventory.upsert({
        where: { storeId_productId: { storeId, productId } },
        update: { quantity: (existingInv?.quantity || 0) + quantity },
        create: { storeId, productId, quantity },
      })
    } else if (type === 'SALE' || type === 'DESTROY') {
      if (!existingInv || existingInv.quantity < quantity) {
        throw new AppError('库存不足，无法完成出库', 400)
      }
      await prisma.inventory.update({
        where: { storeId_productId: { storeId, productId } },
        data: { quantity: existingInv.quantity - quantity },
      })
    } else if (type === 'RETURN') {
      await prisma.inventory.upsert({
        where: { storeId_productId: { storeId, productId } },
        update: { quantity: (existingInv?.quantity || 0) + quantity },
        create: { storeId, productId, quantity },
      })
    }

    res.status(201).json(flow)
  } catch (err) { next(err) }
}

export async function getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { storeId, startDate, endDate } = req.query
    const where: any = {}
    if (storeId) where.storeId = parseInt(storeId as string)
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    const flows = await prisma.flowReg.findMany({
      where,
      include: { product: { select: { id: true, name: true } } },
    })

    const summary = {
      PURCHASE: { count: 0, quantity: 0 },
      SALE: { count: 0, quantity: 0 },
      RETURN: { count: 0, quantity: 0 },
      DESTROY: { count: 0, quantity: 0 },
    }

    for (const f of flows) {
      const key = f.type as keyof typeof summary
      summary[key].count++
      summary[key].quantity += f.quantity
    }

    res.json({ summary, detail: flows })
  } catch (err) { next(err) }
}
