import { Router } from 'express'
import * as flow from '../controllers/flow.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, flow.list)
router.post('/', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'CLERK', 'SUPER_ADMIN'), flow.create)
router.get('/report', authenticate, flow.getReport)

export default router
