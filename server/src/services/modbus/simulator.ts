/**
 * Modbus TCP 设备模拟器
 *
 * 模拟一个工业温湿度+烟雾传感器，通过 Modbus TCP 协议对外提供数据。
 * 用于本地开发调试——不需要真实 PLC/传感器硬件。
 *
 * Modbus TCP 协议基础：
 * - 端口 502（标准），开发用 5020（避免管理员权限）
 * - Holding Register: 可读可写的寄存器（功能码 03 读 / 06 写）
 * - 一个寄存器 = 16 位整数（0-65535）
 * - 温度/湿度存为实际值×10（如 28.5°C → 285），读取后除以 10 还原
 *
 * 寄存器映射表（本模拟器）：
 *   地址 0  → 温度 (×10)    例: 285 = 28.5°C
 *   地址 1  → 湿度 (×10)    例: 550 = 55.0%RH
 *   地址 2  → 烟雾浓度 (ppm) 例: 0-1000
 *   地址 3  → 设备状态       0=离线, 1=在线
 *   地址 10 → 采样间隔 (秒)  可写，默认 30
 */

import { ServerTCP } from 'modbus-serial'
import logger from '../../utils/logger.js'

// 模拟的传感器数据（会随时间微微波动，模拟真实读数）
const sensorState = {
  temperature: 26.5,   // °C
  humidity: 52.0,       // %RH
  smoke: 15,            // ppm (正常值 < 50)
  online: true,
  sampleInterval: 30,   // 秒
}

let server: ServerTCP | null = null
let waveTimer: ReturnType<typeof setInterval> | null = null

/**
 * 启动 Modbus TCP 模拟器。
 * 设备端（PLC/传感器）用这个端口暴露寄存器，客户端（我们的 Bridge）来读。
 */
export function startModbusSimulator(port: number = 5020): void {
  if (server) {
    logger.warn('[Modbus Simulator] Already running')
    return
  }

  const vector = {
    // 读 Holding Register（功能码 03）—— 传感器数据 + 状态
    getHoldingRegister: (addr: number) => {
      switch (addr) {
        case 0:  return Math.round(sensorState.temperature * 10)  // 温度×10
        case 1:  return Math.round(sensorState.humidity * 10)      // 湿度×10
        case 2:  return Math.round(sensorState.smoke)               // 烟雾 ppm
        case 3:  return sensorState.online ? 1 : 0                  // 在线状态
        case 10: return sensorState.sampleInterval                  // 采样间隔
        default: return 0
      }
    },
    // 写 Holding Register（功能码 06）—— 允许修改采样间隔
    setRegister: (addr: number, value: number) => {
      if (addr === 10) {
        sensorState.sampleInterval = value
        logger.info(`[Modbus Simulator] Sample interval set to ${value}s`)
      }
    },
  }

  // ServerTCP 构造函数自动启动监听，不需要手动调 listen()
  server = new ServerTCP(vector, {
    host: '127.0.0.1',
    port,
    debug: false,
    unitID: 1,
  })

  server.on('initialized', () => {
    logger.info(`[Modbus Simulator] Modbus TCP server listening on port ${port}`)
    logger.info(`[Modbus Simulator] Simulating: Temp=${sensorState.temperature}°C, Humidity=${sensorState.humidity}%, Smoke=${sensorState.smoke}ppm`)
  })

  server.on('serverError', (err: Error) => {
    logger.error(`[Modbus Simulator] Server error: ${err.message}`)
  })

  // 模拟数据波动——每 10 秒微微变化，模拟真实传感器漂移
  waveTimer = setInterval(() => {
    const jitter = (Math.random() - 0.5) * 0.6
    sensorState.temperature = +(sensorState.temperature + jitter).toFixed(1)
    sensorState.humidity = +(sensorState.humidity + jitter * 2).toFixed(1)
    sensorState.smoke = Math.max(0, Math.min(100, sensorState.smoke + Math.round((Math.random() - 0.5) * 4)))
  }, 10000)
}

/**
 * 手动设置模拟值（用于测试告警阈值触发）
 */
export function setSimulatedValues(temp: number, humidity: number, smoke: number): void {
  sensorState.temperature = temp
  sensorState.humidity = humidity
  sensorState.smoke = smoke
  logger.info(`[Modbus Simulator] Values updated → ${temp}°C, ${humidity}%, ${smoke}ppm`)
}

/**
 * 获取当前模拟值
 */
export function getSimulatedValues() {
  return { ...sensorState }
}

/**
 * 停止 Modbus 模拟器
 */
export function stopModbusSimulator(): void {
  if (waveTimer) clearInterval(waveTimer)
  if (server) {
    server.close(() => {})
    server = null
    logger.info('[Modbus Simulator] Stopped')
  }
}
