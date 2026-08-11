import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'
import { getDefaultCameras } from '../services/cameraStub.js'

const prisma = new PrismaClient()

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const storeId = req.user?.storeId || parseInt(req.query.storeId as string)
    if (!storeId) {
      res.status(400).json({ message: '请指定门店' })
      return
    }
    const cameras = await prisma.camera.findMany({ where: { storeId } })
    res.json(cameras)
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const camera = await prisma.camera.create({ data: req.body })
    res.status(201).json(camera)
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const camera = await prisma.camera.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    })
    res.json(camera)
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.camera.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: '摄像头已删除' })
  } catch (err) { next(err) }
}

// 初始化门店默认摄像头
export async function initDefaultCameras(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { storeId } = req.body
    const defaults = getDefaultCameras(storeId)
    const cameras = []
    for (const cam of defaults) {
      const created = await prisma.camera.create({ data: cam })
      cameras.push(created)
    }
    res.status(201).json(cameras)
  } catch (err) { next(err) }
}
