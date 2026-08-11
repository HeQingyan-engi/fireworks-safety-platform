import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'
import { checkOutOfScopeSales } from '../services/riskDetection.js'

const prisma = new PrismaClient()

function generateOrderNo(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `FW${date}${rand}`
}

function generatePickupCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { storeId, customerName, customerPhone, items } = req.body

    // 验证库存
    for (const item of items) {
      const inv = await prisma.inventory.findUnique({
        where: { storeId_productId: { storeId, productId: item.productId } },
      })
      if (!inv || inv.quantity < item.quantity) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        throw new AppError(`${product?.name || '产品'} 库存不足`, 400)
      }
    }

    // 计算总价
    let totalAmount = 0
    const orderItems: any[] = []
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) throw new AppError(`产品ID ${item.productId} 不存在`, 404)

      const price = product.price * item.quantity
      totalAmount += price
      orderItems.push({ productId: item.productId, quantity: item.quantity, price })

      // 风险检测：超范围经营
      await checkOutOfScopeSales(storeId, item.productId)
    }

    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        customerName,
        customerPhone: customerPhone || '',
        storeId,
        totalAmount,
        pickupCode: generatePickupCode(),
        items: { create: orderItems },
      },
      include: { items: true },
    })

    // 扣减库存
    for (const item of items) {
      await prisma.inventory.update({
        where: { storeId_productId: { storeId, productId: item.productId } },
        data: { quantity: { decrement: item.quantity } },
      })
    }

    res.status(201).json(order)
  } catch (err) { next(err) }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const where: any = {}
    // 店员看自己门店的订单，顾客看自己的订单，管理员看全部
    if (req.user?.role === 'CLERK' || req.user?.role === 'STORE_MANAGER') {
      where.storeId = req.user.storeId
    } else if (req.query.storeId) {
      where.storeId = parseInt(req.query.storeId as string)
    }

    const { page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: { select: { id: true, name: true } } } },
          store: { select: { id: true, name: true } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ])

    res.json({ data: orders, total, page: parseInt(page as string), limit: parseInt(limit as string) })
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: { include: { product: { select: { id: true, name: true, safetyLevel: true } } } },
        store: { select: { id: true, name: true, address: true } },
      },
    })
    if (!order) throw new AppError('订单不存在', 404)
    res.json(order)
  } catch (err) { next(err) }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    })
    res.json(order)
  } catch (err) { next(err) }
}

export async function mockPay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'PAID' },
    })
    res.json({ message: '支付成功（模拟）', order })
  } catch (err) { next(err) }
}

export async function signSafety(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { signatureImage } = req.body
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { signedSafety: true },
    })

    // 保存签名记录
    await prisma.safetyAgreement.create({
      data: {
        userId: req.user!.userId,
        orderId: order.id,
        signatureImage,
      },
    })

    res.json({ message: '安全告知已签署', order })
  } catch (err) { next(err) }
}
