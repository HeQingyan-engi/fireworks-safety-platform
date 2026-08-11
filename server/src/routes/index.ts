import { Router } from 'express'
import authRoutes from './auth.routes.js'
import productRoutes from './product.routes.js'
import storeRoutes from './store.routes.js'
import inventoryRoutes from './inventory.routes.js'
import orderRoutes from './order.routes.js'
import flowRoutes from './flow.routes.js'
import alertRoutes from './alert.routes.js'
import cameraRoutes from './camera.routes.js'
import inspectionRoutes from './inspection.routes.js'
import reportRoutes from './report.routes.js'
import deviceRoutes from './device.routes.js'
import ruleRoutes from './rule.routes.js'
import simulateRoutes from './simulate.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/stores', storeRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/orders', orderRoutes)
router.use('/flow', flowRoutes)
router.use('/alerts', alertRoutes)
router.use('/cameras', cameraRoutes)
router.use('/inspections', inspectionRoutes)
router.use('/reports', reportRoutes)
router.use('/devices', deviceRoutes)
router.use('/rules', ruleRoutes)
router.use('/simulate', simulateRoutes)

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
