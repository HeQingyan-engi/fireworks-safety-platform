import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

/**
 * Zod 请求体验证中间件工厂
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  }
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any
      next()
    } catch (err) {
      next(err)
    }
  }
}
