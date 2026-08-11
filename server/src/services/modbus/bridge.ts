/**
 * Modbus → MQTT 协议桥接器
 *
 * 核心概念：工业设备说 Modbus，IoT 平台说 MQTT。
 * 这个模块负责"翻译"——从 Modbus 寄存器读出原始数据，转换成结构化 JSON，
 * 再通过 MQTT Topic 上报到云端平台。
 *
 * 这是工业物联网里最常见的架构模式之一：
 *   PLC/传感器 (Modbus RTU/TCP) → 边缘网关 (Bridge) → MQTT → 云平台
 *
 * 本模块连接本地 Modbus 模拟器（simulator.ts），周期读取寄存器并桥接到 MQTT。
 */

import ModbusRTU from 'modbus-serial'
import logger from '../../utils/logger.js'
import { handleSensorData } from '../mqtt/sensor-handler.js'

let client: ModbusRTU | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

interface ModbusReading {
  temperature: number
  humidity: number
  smoke: number
  online: boolean
}

/**
 * 连接 Modbus TCP 设备并开始周期轮询。
 *
 * @param host Modbus TCP 设备 IP（或本地模拟器 127.0.0.1）
 * @param port Modbus TCP 端口（标准 502，模拟器用 5020）
 * @param deviceId Modbus 单元 ID（通常为 1）
 * @param storeCode 归属门店编号
 * @param serialNo  设备序列号
 * @param intervalMs 轮询间隔（毫秒），默认 5000
 */
export async function startModbusBridge(
  host: string = '127.0.0.1',
  port: number = 5020,
  deviceId: number = 1,
  storeCode: string = 'CQ001',
  serialNo: string = 'MODBUS-TH-001',
  intervalMs: number = 5000,
): Promise<void> {
  if (client) {
    logger.warn('[Modbus Bridge] Already connected')
    return
  }

  client = new ModbusRTU()

  try {
    // Modbus TCP 连接（和 HTTP/TCP 不同，是长连接）
    await client.connectTCP(host, { port })
    client.setID(deviceId)
    logger.info(`[Modbus Bridge] Connected to Modbus TCP device at ${host}:${port}`)

    // 周期轮询——每隔 intervalMs 毫秒读一次寄存器
    pollTimer = setInterval(async () => {
      try {
        const reading = await readRegisters(client!)
        logger.debug(`[Modbus Bridge] Read → ${reading.temperature}°C, ${reading.humidity}%, ${reading.smoke}ppm`)

        // 桥接到 MQTT 传感器处理管线
        // 把 Modbus 原始数据包装成和 MQTT 传感器消息一样的格式
        await handleSensorData(
          `fw/${storeCode}/temp-humidity/${serialNo}/reading`,
          {
            temperature: reading.temperature,
            humidity: reading.humidity,
            smoke: reading.smoke,
          },
        )
      } catch (err) {
        logger.error(`[Modbus Bridge] Poll error: ${err}`)
      }
    }, intervalMs)

    logger.info(`[Modbus Bridge] Polling every ${intervalMs}ms`)
  } catch (err) {
    logger.error(`[Modbus Bridge] Connection failed: ${err}`)
    client = null
  }
}

/**
 * 从 Modbus 设备读取传感器数据。
 *
 * 功能码 03 — Read Holding Registers
 * 格式：读取从起始地址开始的 N 个连续寄存器
 *
 * 寄存器布局（对接 simulator.ts 的映射表）：
 *   地址 0: 温度 (×10)  → 读完后 ÷ 10 得到实际 °C
 *   地址 1: 湿度 (×10)  → 读完后 ÷ 10 得到实际 %RH
 *   地址 2: 烟雾 (ppm)   → 直接使用
 *   地址 3: 设备状态     → 1=在线, 0=离线
 */
async function readRegisters(client: ModbusRTU): Promise<ModbusReading> {
  // 一次读取 4 个连续的 Holding Register（地址 0-3）
  const result = await client.readHoldingRegisters(0, 4)

  // result.data 是一个数组，每个元素对应一个寄存器的值（16位整数）
  const rawTemp = result.data[0]       // 如 285 = 28.5°C
  const rawHumidity = result.data[1]   // 如 520 = 52.0%
  const rawSmoke = result.data[2]      // 如 15 ppm
  const rawStatus = result.data[3]     // 1 = online

  return {
    temperature: rawTemp / 10,          // 28.5
    humidity: rawHumidity / 10,         // 52.0
    smoke: rawSmoke,
    online: rawStatus === 1,
  }
}

/**
 * 单次读取（用于手动测试或 HTTP 触发）
 */
export async function readOnce(host: string, port: number, deviceId: number): Promise<ModbusReading> {
  const c = new ModbusRTU()
  await c.connectTCP(host, { port })
  c.setID(deviceId)
  const reading = await readRegisters(c)
  c.close(() => {})
  return reading
}

/**
 * 停止桥接器
 */
export function stopModbusBridge(): void {
  if (pollTimer) clearInterval(pollTimer)
  if (client) {
    client.close(() => {})
    client = null
  }
  logger.info('[Modbus Bridge] Stopped')
}
