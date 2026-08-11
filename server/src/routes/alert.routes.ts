import { Router } from 'express'
import * as alert from '../controllers/alert.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { upload } from '../config/upload.js'

const router = Router()

router.get('/', authenticate, alert.list)
router.get('/stats', authenticate, alert.getStats)
router.get('/:id', authenticate, alert.getById)
router.put('/:id/status', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'), alert.updateStatus)
router.post('/:id/upload-proof', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'), upload.single('image'), alert.uploadProof)

export default router
