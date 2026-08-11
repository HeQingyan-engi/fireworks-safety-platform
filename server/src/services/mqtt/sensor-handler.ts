import { PrismaClient } from '@prisma/client'
import logger from '../../utils/logger.js'
import { processSensorReading } from '../rules/engine.js'

const prisma = new PrismaClient()

interface SensorMessage {
  temperature?: number
  temp?: number
  humidity?: number
  smoke?: number
  alarm?: boolean
  personCount?: number
  count?: number
  total?: number
  events?: string[]
  event?: string
  confidence?: number
  status?: string
  battery?: number
  rssi?: number
}

/**
 * Parse MQTT topic and route sensor data to the rule engine.
 *
 * Topic format: fw/{storeCode}/{deviceType}/{serialNo}/{action}
 */
export async function handleSensorData(topic: string, data: SensorMessage): Promise<void> {
  const parts = topic.split('/')
  if (parts.length < 4) return

  const storeCode = parts[1]
  const deviceType = parts[2]
  const serialNo = parts[3]

  // Look up store by code
  const store = await prisma.store.findUnique({ where: { code: storeCode } })
  if (!store) {
    logger.warn(`[Sensor] Unknown store code: ${storeCode}`)
    return
  }

  // Look up or register device
  let device = await prisma.device.findUnique({ where: { serialNo } })
  if (!device) {
    device = await prisma.device.create({
      data: {
        storeId: store.id,
        type: mapDeviceType(deviceType),
        name: `${deviceType}-${serialNo}`,
        serialNo,
        mqttTopic: topic,
        status: 'ONLINE',
        lastHeartbeat: new Date(),
      },
    })
    logger.info(`[Sensor] New device registered: ${serialNo} (${deviceType}) at ${store.name}`)
  } else {
    // Update heartbeat
    await prisma.device.update({
      where: { id: device.id },
      data: { lastHeartbeat: new Date(), status: 'ONLINE' },
    })
  }

  // Store readings and trigger rules
  const timestamp = new Date()

  // Temperature & Humidity
  const temperature = data.temperature ?? data.temp
  if (temperature !== undefined) {
    await saveReading(device.id, store.id, 'temperature', temperature, '°C', timestamp)
    await processSensorReading(store.id, 'temperature', temperature, { deviceId: device.id })
  }
  if (data.humidity !== undefined) {
    await saveReading(device.id, store.id, 'humidity', data.humidity, '%RH', timestamp)
    await processSensorReading(store.id, 'humidity', data.humidity, { deviceId: device.id })
  }

  // Smoke detection
  if (data.smoke !== undefined) {
    await saveReading(device.id, store.id, 'smoke', data.smoke, 'ppm', timestamp)
    await processSensorReading(store.id, 'smokeLevel', data.smoke, { deviceId: device.id })
  }
  if (data.alarm === true) {
    await processSensorReading(store.id, 'smokeDetected', 1, { deviceId: device.id })
  }

  // People counting
  const peopleCount = data.personCount ?? data.count ?? data.total
  if (peopleCount !== undefined) {
    await saveReading(device.id, store.id, 'personCount', peopleCount, 'count', timestamp)
    await processSensorReading(store.id, 'personCount', peopleCount, { deviceId: device.id })
  }

  // AI camera events
  if (data.events && Array.isArray(data.events)) {
    for (const event of data.events) {
      switch (event.toUpperCase()) {
        case 'SMOKING':
          await processSensorReading(store.id, 'smokingDetected', 1, { deviceId: device.id, confidence: data.confidence })
          break
        case 'FIRE':
          await processSensorReading(store.id, 'fireDetected', 1, { deviceId: device.id, confidence: data.confidence })
          break
        case 'CROWD':
          await processSensorReading(store.id, 'crowdDetected', 1, { deviceId: device.id })
          break
        case 'OUTDOOR_ACTIVITY':
          await processSensorReading(store.id, 'outdoorActivity', 1, { deviceId: device.id })
          break
      }
    }
  }
  if (data.event) {
    switch (data.event.toUpperCase()) {
      case 'SMOKING':
        await processSensorReading(store.id, 'smokingDetected', 1, { deviceId: device.id })
        break
      case 'FIRE':
        await processSensorReading(store.id, 'fireDetected', 1, { deviceId: device.id })
        break
    }
  }
}

async function saveReading(
  deviceId: number,
  storeId: number,
  key: string,
  value: number,
  unit: string,
  timestamp: Date,
): Promise<void> {
  try {
    await prisma.deviceReading.create({
      data: { deviceId, storeId, key, value, unit, timestamp },
    })
  } catch (err) {
    logger.error(`[Sensor] Failed to save reading: ${err}`)
  }
}

function mapDeviceType(topicType: string): string {
  const map: Record<string, string> = {
    'temp-humidity': 'TEMP_HUMIDITY',
    'smoke-detector': 'SMOKE',
    'ai-camera': 'CAMERA_AI',
    'people-counter': 'INFRARED_COUNTER',
    'alarm-relay': 'RELAY',
  }
  return map[topicType] || topicType.toUpperCase()
}
