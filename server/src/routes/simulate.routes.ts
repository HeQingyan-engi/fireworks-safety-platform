import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'
import { processSensorReading } from '../services/rules/engine.js'
import { handleSensorData } from '../services/mqtt/sensor-handler.js'
import { emitAlert } from '../services/socketManager.js'

const router = Router()
const prisma = new PrismaClient()

/**
 * 🧪 Sensor Simulation Endpoints
 * These endpoints simulate IoT sensor data for testing purposes.
 * In production, real MQTT sensor data triggers the rule engine automatically.
 */

// POST /api/simulate/temperature - Simulate temperature reading
router.post('/temperature', authenticate, async (req, res, next) => {
  try {
    const { storeId, temperature, humidity } = req.body
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) { res.status(404).json({ message: '门店不存在' }); return }

    // Simulate MQTT topic: fw/{storeCode}/temp-humidity/SIM001/reading
    const topic = `fw/${store.code}/temp-humidity/SIM001/reading`
    const payload = { temperature, humidity: humidity || 50 }

    await handleSensorData(topic, payload)

    res.json({
      message: '温湿度数据已接收，正在分析中...',
      simulated: { store: store.name, temperature, humidity: humidity || 50 },
    })
  } catch (err) { next(err) }
})

// POST /api/simulate/smoke - Simulate smoke detector
router.post('/smoke', authenticate, async (req, res, next) => {
  try {
    const { storeId, smoke, alarm } = req.body
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) { res.status(404).json({ message: '门店不存在' }); return }

    const topic = `fw/${store.code}/smoke-detector/SIM002/alarm`
    const payload = { smoke: smoke || 0, alarm: alarm || false }

    await handleSensorData(topic, payload)

    res.json({
      message: '烟雾数据已接收，正在分析中...',
      simulated: { store: store.name, smoke, alarm },
    })
  } catch (err) { next(err) }
})

// POST /api/simulate/people-count - Simulate people counter
router.post('/people-count', authenticate, async (req, res, next) => {
  try {
    const { storeId, count } = req.body
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) { res.status(404).json({ message: '门店不存在' }); return }

    const topic = `fw/${store.code}/people-counter/SIM003/reading`
    const payload = { total: count || 0 }

    await handleSensorData(topic, payload)

    res.json({
      message: '人流量数据已接收，正在分析中...',
      simulated: { store: store.name, personCount: count || 0 },
    })
  } catch (err) { next(err) }
})

// POST /api/simulate/ai-event - Simulate AI camera detection
router.post('/ai-event', authenticate, async (req, res, next) => {
  try {
    const { storeId, event, confidence } = req.body
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) { res.status(404).json({ message: '门店不存在' }); return }

    const topic = `fw/${store.code}/ai-camera/SIM004/detection`
    const payload = {
      events: [event], // SMOKING, FIRE, CROWD, OUTDOOR_ACTIVITY
      confidence: confidence || 0.9,
      person_count: 5,
    }

    await handleSensorData(topic, payload)

    res.json({
      message: 'AI事件数据已接收，正在分析中...',
      simulated: { store: store.name, event, confidence },
    })
  } catch (err) { next(err) }
})

// POST /api/simulate/fire-alarm - Simulate full fire emergency (comprehensive test)
router.post('/fire-alarm', authenticate, authorize('ENTERPRISE_ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { storeId } = req.body
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) { res.status(404).json({ message: '门店不存在' }); return }

    // Simulate multiple sensor inputs simultaneously
    const events = [
      { topic: `fw/${store.code}/temp-humidity/SIM001/reading`, payload: { temperature: 55, humidity: 15 } },
      { topic: `fw/${store.code}/smoke-detector/SIM002/alarm`, payload: { smoke: 100, alarm: true } },
      { topic: `fw/${store.code}/ai-camera/SIM004/detection`, payload: { events: ['FIRE', 'SMOKING'], confidence: 0.98 } },
    ]

    const results = []
    for (const ev of events) {
      await handleSensorData(ev.topic, ev.payload)
      results.push(ev.topic)
    }

    res.json({
      message: '🔥 综合火警模拟完成！多个传感器同时触发预警。',
      results,
    })
  } catch (err) { next(err) }
})

// GET /api/simulate/stores - List stores available for simulation
router.get('/stores', authenticate, async (_req, res, next) => {
  try {
    const stores = await prisma.store.findMany({
      select: { id: true, name: true, code: true, status: true, capacity: true },
    })
    res.json(stores)
  } catch (err) { next(err) }
})

export default router
