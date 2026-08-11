import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { hashPassword, comparePassword } from '../utils/password.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt.js'
import { AppError } from '../middleware/errorHandler.js'
import { writeAuditLog } from '../utils/audit.js'

const prisma = new PrismaClient()

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password, realName, phone } = req.body

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) throw new AppError('用户名已存在', 409)

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, realName, phone, role: 'CUSTOMER' },
    })

    await writeAuditLog(user.id, 'REGISTER', 'User', user.id)

    const payload: TokenPayload = { userId: user.id, username: user.username, role: user.role, storeId: user.storeId }
    res.status(201).json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: { id: user.id, username: user.username, realName: user.realName, phone: user.phone, role: user.role },
    })
  } catch (err) { next(err) }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) throw new AppError('用户名或密码错误', 401)

    const valid = await comparePassword(password, user.password)
    if (!valid) throw new AppError('用户名或密码错误', 401)

    const payload: TokenPayload = { userId: user.id, username: user.username, role: user.role, storeId: user.storeId }
    await writeAuditLog(user.id, 'LOGIN', 'User', user.id)

    res.json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: { id: user.id, username: user.username, realName: user.realName, phone: user.phone, role: user.role, storeId: user.storeId },
    })
  } catch (err) { next(err) }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw new AppError('请提供刷新令牌', 400)

    const payload = verifyRefreshToken(refreshToken)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) throw new AppError('用户不存在', 404)

    const newPayload: TokenPayload = { userId: user.id, username: user.username, role: user.role, storeId: user.storeId }
    res.json({
      accessToken: signAccessToken(newPayload),
      refreshToken: signRefreshToken(newPayload),
    })
  } catch (err) { next(err) }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { store: { select: { id: true, name: true, code: true } } },
    })
    if (!user) throw new AppError('用户不存在', 404)

    res.json({
      id: user.id, username: user.username, realName: user.realName,
      phone: user.phone, role: user.role, storeId: user.storeId,
      storeName: user.store?.name,
    })
  } catch (err) { next(err) }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { realName, phone } = req.body
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { realName, phone },
    })
    res.json({ id: user.id, username: user.username, realName: user.realName, phone: user.phone, role: user.role })
  } catch (err) { next(err) }
}
