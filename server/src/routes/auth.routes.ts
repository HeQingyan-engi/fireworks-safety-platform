import { Router } from 'express'
import * as auth from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { z } from 'zod'

const router = Router()

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  realName: z.string().optional(),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

router.post('/register', validateBody(registerSchema), auth.register)
router.post('/login', validateBody(loginSchema), auth.login)
router.post('/refresh', auth.refresh)
router.get('/me', authenticate, auth.getMe)
router.put('/me', authenticate, auth.updateMe)

export default router
