import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import routes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import { config } from './config/index.js'
import path from 'path'

const app = express()

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors())

// Logging
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'))
}

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(config.uploadDir)))

// API routes
app.use('/api', routes)

// Global error handler
app.use(errorHandler)

export default app
