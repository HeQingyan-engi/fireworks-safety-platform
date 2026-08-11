import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { storeId, page = '1', limit = '20' } = req.query
    const where: any = {}
    if (storeId) where.storeId = parseInt(storeId as string)

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const [inspections, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        include: {
          store: { select: { id: true, name: true } },
          inspector: { select: { id: true, realName: true } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inspection.count({ where }),
    ])

    res.json({ data: inspections, total, page: parseInt(page as string), limit: parseInt(limit as string) })
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const inspection = await prisma.inspection.create({
      data: { ...req.body, inspectorId: req.user!.userId },
    })
    res.status(201).json(inspection)
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const inspection = await prisma.inspection.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        store: { select: { id: true, name: true, address: true } },
        inspector: { select: { id: true, realName: true } },
      },
    })
    if (!inspection) throw new AppError('巡查记录不存在', 404)
    res.json(inspection)
  } catch (err) { next(err) }
}

export async function getByStore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const inspections = await prisma.inspection.findMany({
      where: { storeId: parseInt(req.params.storeId) },
      include: { inspector: { select: { id: true, realName: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(inspections)
  } catch (err) { next(err) }
}
