import { Router } from 'express'
import * as order from '../controllers/order.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.post('/', authenticate, order.create)
router.get('/', authenticate, order.list)
router.get('/:id', authenticate, order.getById)
router.put('/:id/status', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'CLERK', 'SUPER_ADMIN'), order.updateStatus)
router.post('/:id/pay', authenticate, order.mockPay)
router.post('/:id/sign-safety', authenticate, order.signSafety)

export default router
