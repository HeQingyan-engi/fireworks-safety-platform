import { Router } from 'express'
import * as camera from '../controllers/camera.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, camera.list)
router.post('/', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'), camera.create)
router.put('/:id', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'), camera.update)
router.delete('/:id', authenticate, authorize('ENTERPRISE_ADMIN', 'SUPER_ADMIN'), camera.remove)
router.post('/init-defaults', authenticate, authorize('ENTERPRISE_ADMIN', 'SUPER_ADMIN'), camera.initDefaultCameras)

export default router
