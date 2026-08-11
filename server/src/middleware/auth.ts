import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js'

/**
 * 验证JWT Token，将用户信息注入 req.user
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: '未提供认证令牌' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: '认证令牌无效或已过期' })
  }
}

/**
 * 可选认证：有Token则解析，无Token则继续
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      req.user = verifyAccessToken(token)
    } catch {
      // Token invalid, continue without user
    }
  }
  next()
}

/**
 * 角色授权中间件工厂
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: '请先登录' })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: '您没有权限执行此操作' })
      return
    }

    next()
  }
}
