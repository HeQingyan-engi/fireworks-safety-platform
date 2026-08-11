import { Router } from 'express'
import * as store from '../controllers/store.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, store.list)
router.get('/:id', authenticate, store.getById)
router.put('/:id', authenticate, authorize('ENTERPRISE_ADMIN', 'SUPER_ADMIN'), store.update)
router.get('/:id/status', store.getStatus)

export default router
