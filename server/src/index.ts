import { createServer } from 'http'
import app from './app.js'
import { config } from './config/index.js'
import { initSocket } from './services/socketManager.js'
import { initMQTT } from './services/mqtt/broker.js'
import { startModbusSimulator } from './services/modbus/simulator.js'
import { startModbusBridge } from './services/modbus/bridge.js'
import { initScheduler } from './services/scheduler.js'
import { seedDefaultRules } from './services/rules/engine.js'
import logger from './utils/logger.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function bootstrap() {
  // 1. Connect to database
  await prisma.$connect()
  logger.info('✅ Database connected')

  // 2. Seed default alert rules
  await seedDefaultRules()
  logger.info('✅ Alert rules ready')

  // 3. Create HTTP server from Express app
  const httpServer = createServer(app)

  // 4. Initialize Socket.IO on the HTTP server
  initSocket(httpServer)
  logger.info('✅ Socket.IO initialized')

  // 5. Connect to MQTT broker (fails gracefully if unavailable)
  await initMQTT()

  // 5b. [Dev] Start Modbus TCP simulator + bridge (模拟工业传感器)
  if (config.nodeEnv === 'development') {
    startModbusSimulator(5020)
    // 延迟 1 秒等模拟器就绪后启动桥接
    setTimeout(() => {
      startModbusBridge('127.0.0.1', 5020, 1, 'FW-2026-001', 'MODBUS-TH-001', 5000)
    }, 1000)
    logger.info('✅ Modbus simulator + bridge started (dev mode)')
  }

  // 6. Start scheduled tasks (periodic checks, escalations, cleanup)
  initScheduler()

  // 7. Start listening
  httpServer.listen(config.port, () => {
    logger.info('═══════════════════════════════════════')
    logger.info(`  🎆 安万嘉烟花预警系统已启动`)
    logger.info(`  📡 API:  http://localhost:${config.port}/api`)
    logger.info(`  🔌 WS:   ws://localhost:${config.port}`)
    logger.info(`  🌍 ENV:  ${config.nodeEnv}`)
    logger.info('═══════════════════════════════════════')
  })

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down gracefully...')
    httpServer.close()
    await prisma.$disconnect()
    logger.info('👋 Server stopped')
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

bootstrap().catch((err) => {
  logger.error('Bootstrap failed:', err)
  process.exit(1)
})
