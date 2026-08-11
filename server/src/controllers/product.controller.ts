import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { categoryId, search, storeId, page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const where: any = {}
    if (categoryId) where.categoryId = parseInt(categoryId as string)
    if (search) where.name = { contains: search as string }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    // 如果指定了门店，查询该门店的库存和定价
    let storeInventory: any[] = []
    if (storeId) {
      storeInventory = await prisma.inventory.findMany({
        where: { storeId: parseInt(storeId as string) },
      })
    }

    const result = products.map((p) => {
      const inv = storeInventory.find((i: any) => i.productId === p.id)
      return {
        ...p,
        categoryName: p.category.name,
        category: undefined,
        stock: inv?.quantity ?? 0,
        storePrice: inv?.price ?? p.price,
      }
    })

    res.json({ data: result, total, page: parseInt(page as string), limit: take })
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: { select: { id: true, name: true } } },
    })
    if (!product) throw new AppError('产品不存在', 404)

    res.json({ ...product, categoryName: product.category.name, category: undefined })
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await prisma.product.create({ data: req.body })
    res.status(201).json(product)
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    })
    res.json(product)
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: '产品已删除' })
  } catch (err) { next(err) }
}

export async function listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { id: 'asc' },
    })
    res.json(categories.map((c) => ({ id: c.id, name: c.name, productCount: c._count.products })))
  } catch (err) { next(err) }
}
