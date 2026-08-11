import { Router } from 'express'
import * as report from '../controllers/report.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/sales', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'), report.salesReport)
router.get('/inventory', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'), report.inventoryReport)
router.get('/compliance', authenticate, authorize('GOV_INSPECTOR', 'SUPER_ADMIN'), report.complianceReport)

export default router
