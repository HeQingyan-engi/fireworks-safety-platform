import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger.js'

export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error(err.message)

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  if (err.name === 'ZodError') {
    res.status(400).json({ message: '请求参数校验失败', errors: (err as any).errors })
    return
  }

  res.status(500).json({ message: '服务器内部错误' })
}
