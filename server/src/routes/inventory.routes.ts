import { Router } from 'express'
import * as inventory from '../controllers/inventory.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, inventory.list)
router.put('/batch', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'), inventory.batchUpdate)
router.get('/threshold', authenticate, inventory.getThresholdAlerts)

export default router
