import { Router } from 'express'
import * as inspection from '../controllers/inspection.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, authorize('GOV_INSPECTOR', 'SUPER_ADMIN', 'ENTERPRISE_ADMIN'), inspection.list)
router.post('/', authenticate, authorize('GOV_INSPECTOR', 'SUPER_ADMIN'), inspection.create)
router.get('/store/:storeId', authenticate, authorize('GOV_INSPECTOR', 'SUPER_ADMIN', 'ENTERPRISE_ADMIN'), inspection.getByStore)
router.get('/:id', authenticate, authorize('GOV_INSPECTOR', 'SUPER_ADMIN', 'ENTERPRISE_ADMIN'), inspection.getById)

export default router
