import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/rules - List all alert rules
router.get('/', authenticate, async (req, res, next) => {
  try {
    const rules = await prisma.alertRule.findMany({
      orderBy: [{ alertType: 'asc' }, { priority: 'asc' }],
    })
    res.json(rules)
  } catch (err) { next(err) }
})

// GET /api/rules/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const rule = await prisma.alertRule.findUnique({
      where: { id: parseInt(req.params.id) },
    })
    if (!rule) { res.status(404).json({ message: '规则不存在' }); return }
    res.json(rule)
  } catch (err) { next(err) }
})

// POST /api/rules - Create a new rule
router.post('/', authenticate, authorize('ENTERPRISE_ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const rule = await prisma.alertRule.create({ data: req.body })
    res.status(201).json(rule)
  } catch (err) { next(err) }
})

// PUT /api/rules/:id - Update a rule
router.put('/:id', authenticate, authorize('ENTERPRISE_ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const rule = await prisma.alertRule.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    })
    res.json(rule)
  } catch (err) { next(err) }
})

// DELETE /api/rules/:id
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    await prisma.alertRule.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: '规则已删除' })
  } catch (err) { next(err) }
})

// POST /api/rules/:id/toggle - Enable/disable a rule
router.post('/:id/toggle', authenticate, authorize('ENTERPRISE_ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.alertRule.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!existing) { res.status(404).json({ message: '规则不存在' }); return }
    const rule = await prisma.alertRule.update({
      where: { id: parseInt(req.params.id) },
      data: { enabled: !existing.enabled },
    })
    res.json(rule)
  } catch (err) { next(err) }
})

export default router
