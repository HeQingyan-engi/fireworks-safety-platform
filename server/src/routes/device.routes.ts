import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/devices - List all devices
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { storeId } = req.query
    const where: any = {}
    if (storeId) where.storeId = parseInt(storeId as string)
    // Non-admin users can only see their own store's devices
    if (req.user?.role === 'CLERK' || req.user?.role === 'STORE_MANAGER') {
      where.storeId = req.user.storeId
    }

    const devices = await prisma.device.findMany({
      where,
      include: { store: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(devices)
  } catch (err) { next(err) }
})

// GET /api/devices/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const device = await prisma.device.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        store: { select: { id: true, name: true } },
        readings: { orderBy: { timestamp: 'desc' }, take: 20 },
      },
    })
    if (!device) { res.status(404).json({ message: '设备不存在' }); return }
    res.json(device)
  } catch (err) { next(err) }
})

// GET /api/devices/:id/readings - Get latest readings
router.get('/:id/readings', authenticate, async (req, res, next) => {
  try {
    const readings = await prisma.deviceReading.findMany({
      where: { deviceId: parseInt(req.params.id) },
      orderBy: { timestamp: 'desc' },
      take: 100,
    })
    res.json(readings)
  } catch (err) { next(err) }
})

// POST /api/devices - Register a new device (admin only)
router.post('/', authenticate, authorize('ENTERPRISE_ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { storeId, type, name, serialNo, mqttTopic } = req.body
    const device = await prisma.device.create({
      data: { storeId, type, name, serialNo, mqttTopic },
    })
    res.status(201).json(device)
  } catch (err) { next(err) }
})

// DELETE /api/devices/:id (admin only)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    await prisma.deviceReading.deleteMany({ where: { deviceId: parseInt(req.params.id) } })
    await prisma.device.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: '设备已删除' })
  } catch (err) { next(err) }
})

export default router
