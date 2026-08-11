import { Router } from 'express'
import * as product from '../controllers/product.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', product.list)
router.get('/categories', product.listCategories)
router.get('/:id', product.getById)
router.post('/', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'), product.create)
router.put('/:id', authenticate, authorize('ENTERPRISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'), product.update)
router.delete('/:id', authenticate, authorize('ENTERPRISE_ADMIN', 'SUPER_ADMIN'), product.remove)

export default router
