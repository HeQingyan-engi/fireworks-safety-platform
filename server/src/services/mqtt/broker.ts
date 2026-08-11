import mqtt, { MqttClient } from 'mqtt'
import { config } from '../../config/index.js'
import logger from '../../utils/logger.js'
import { handleSensorData } from './sensor-handler.js'

let client: MqttClient | null = null

/**
 * Initialize MQTT client and subscribe to sensor topics.
 * Fails gracefully if broker is not available (dev mode).
 */
export async function initMQTT(): Promise<void> {
  if (!config.mqttBrokerUrl) {
    logger.warn('[MQTT] No broker URL configured, skipping MQTT initialization')
    return
  }

  return new Promise((resolve) => {
    client = mqtt.connect(config.mqttBrokerUrl, {
      username: config.mqttUsername || undefined,
      password: config.mqttPassword || undefined,
      clientId: `fireworks-server-${Date.now()}`,
      keepalive: 60,
      reconnectPeriod: 5000,
      connectTimeout: 10000,
      // Will Message: 服务器意外断线时，EMQX 自动广播离线状态
      // 边缘网关订阅 fw/server/status 后可在服务器离线时切换本地自治模式
      will: {
        topic: 'fw/server/status',
        payload: JSON.stringify({ status: 'offline', timestamp: Date.now() }),
        qos: 1,
        retain: true,   // 保留最后一条遗嘱，新上线的设备也能看到
      },
    })

    client.on('connect', () => {
      logger.info('[MQTT] Connected to broker')

      // 清除遗嘱，发布上线通知
      client?.publish('fw/server/status', JSON.stringify({
        status: 'online',
        timestamp: Date.now(),
      }), { qos: 1, retain: true })

      // Subscribe to all sensor data topics
      const topics = [
        'fw/+/temp-humidity/+/reading',
        'fw/+/smoke-detector/+/alarm',
        'fw/+/smoke-detector/+/reading',
        'fw/+/ai-camera/+/detection',
        'fw/+/people-counter/+/reading',
        'fw/+/alarm-relay/+/status',
        'fw/+/device/+/status',
      ]
      topics.forEach((topic) => {
        client?.subscribe(topic, { qos: 1 }, (err) => {
          if (err) logger.error(`[MQTT] Subscribe error for ${topic}:`, err)
          else logger.info(`[MQTT] Subscribed to ${topic}`)
        })
      })
      resolve()
    })

    client.on('message', (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString())
        handleSensorData(topic, data)
      } catch {
        logger.warn(`[MQTT] Failed to parse message on ${topic}`)
      }
    })

    client.on('error', (err) => {
      logger.error('[MQTT] Connection error:', err.message)
      // Don't crash — MQTT is optional in dev
      if (config.nodeEnv === 'development') {
        logger.warn('[MQTT] Running without MQTT (dev mode)')
      }
    })

    client.on('close', () => {
      logger.warn('[MQTT] Connection closed')
    })

    // Timeout: if not connected within 5s in dev, stop retrying and continue without MQTT
    setTimeout(() => {
      if (!client?.connected) {
        logger.warn('[MQTT] Broker not available, continuing without MQTT')
        client?.end()       // stop reconnect loop
        client?.removeAllListeners()
        client = null
        if (config.nodeEnv === 'development') resolve()
      }
    }, 5000)
  })
}

/**
 * Publish a command to a device (e.g., trigger alarm relay).
 */
export function publishCommand(topic: string, payload: object): void {
  if (client?.connected) {
    client.publish(topic, JSON.stringify(payload), { qos: 1 })
    logger.info(`[MQTT] Command sent to ${topic}`)
  } else {
    logger.warn(`[MQTT] Cannot send command — not connected`)
  }
}

/**
 * Get MQTT client for direct use.
 */
export function getMQTTClient(): MqttClient | null {
  return client
}
