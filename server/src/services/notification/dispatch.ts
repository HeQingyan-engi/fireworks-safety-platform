import { PrismaClient } from '@prisma/client'
import logger from '../../utils/logger.js'
import type { Alert } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Dispatch notifications based on alert level and configured channels.
 */
export async function dispatchNotifications(alert: Alert): Promise<void> {
  try {
    const channels = await prisma.notificationChannel.findMany({
      where: {
        OR: [{ storeId: alert.storeId }, { storeId: null }],
        enabled: true,
      },
    })

    for (const channel of channels) {
      // Skip based on alert level routing
      if (!shouldNotify(channel.type, alert.level)) continue

      try {
        await sendViaChannel(channel, alert)
        await prisma.notificationLog.create({
          data: { alertId: alert.id, channelId: channel.id, status: 'SUCCESS' },
        })
      } catch (err: any) {
        await prisma.notificationLog.create({
          data: {
            alertId: alert.id,
            channelId: channel.id,
            status: 'FAILED',
            message: err.message?.slice(0, 500),
          },
        })
        logger.error(`[Notify] Failed via ${channel.type}:`, err)
      }
    }
  } catch (err) {
    logger.error('[Notify] Dispatch error:', err)
  }
}

/**
 * Determine if a channel should be used for an alert level.
 */
function shouldNotify(channelType: string, alertLevel: string): boolean {
  // RED: all channels
  // ORANGE: SMS + webhook + onsite
  // YELLOW: webhook only
  switch (channelType) {
    case 'ONSITE_ALARM':
    case 'VOICE':
      return alertLevel === 'RED'
    case 'SMS':
      return alertLevel === 'RED' || alertLevel === 'ORANGE'
    case 'DINGTALK':
    case 'WECHAT_WORK':
    case 'EMAIL':
      return true // all levels
    default:
      return true
  }
}

/**
 * Send via a specific channel.
 */
async function sendViaChannel(
  channel: { id: number; type: string; config: string },
  alert: Alert,
): Promise<void> {
  const cfg = JSON.parse(channel.config || '{}')

  switch (channel.type) {
    case 'SMS':
      await sendSMS(cfg, alert)
      break
    case 'VOICE':
      await sendVoiceCall(cfg, alert)
      break
    case 'DINGTALK':
      await sendDingTalk(cfg, alert)
      break
    case 'WECHAT_WORK':
      await sendWeChatWork(cfg, alert)
      break
    case 'EMAIL':
      await sendEmail(cfg, alert)
      break
    case 'ONSITE_ALARM':
      await triggerOnsiteAlarm(cfg, alert)
      break
    default:
      logger.warn(`[Notify] Unknown channel type: ${channel.type}`)
  }
}

// ===================== Channel Implementations =====================

async function sendSMS(cfg: any, alert: Alert): Promise<void> {
  const phones: string[] = cfg.phoneNumbers || []
  if (phones.length === 0) return

  // If Alibaba Cloud SMS credentials are configured, use real SMS
  if (cfg.accessKeyId && cfg.accessKeySecret) {
    // TODO: Integrate Alibaba Cloud SMS SDK
    // const client = new SMSClient({ accessKeyId: cfg.accessKeyId, accessKeySecret: cfg.accessKeySecret })
    // for (const phone of phones) {
    //   await client.sendSms({ phoneNumbers: phone, signName: cfg.signName, templateCode: cfg.templateCode, templateParam: JSON.stringify({ title: alert.title, level: alert.level }) })
    // }
    logger.info(`[Notify] SMS would be sent to ${phones.join(', ')}: ${alert.title}`)
  } else {
    // Dev mode: log instead of send
    logger.info(`[Notify] [DEV] SMS → ${phones.join(', ')}: ${alert.title}`)
  }
}

async function sendVoiceCall(cfg: any, alert: Alert): Promise<void> {
  const phones: string[] = cfg.phoneNumbers || []
  if (phones.length === 0) return

  if (cfg.accessKeyId && cfg.accessKeySecret) {
    // TODO: Integrate Alibaba Cloud Voice SDK
    logger.info(`[Notify] Voice call would be made to ${phones.join(', ')}: ${alert.title}`)
  } else {
    logger.info(`[Notify] [DEV] Voice Call → ${phones.join(', ')}: ${alert.title}`)
  }
}

async function sendDingTalk(cfg: any, alert: Alert): Promise<void> {
  const webhookUrl = cfg.webhookUrl
  if (!webhookUrl) return

  const message = {
    msgtype: 'markdown',
    markdown: {
      title: `烟花预警：${alert.level} - ${alert.title}`,
      text: `## 🚨 烟花仓库预警\n\n**等级：** ${alert.level}\n**标题：** ${alert.title}\n**描述：** ${alert.description || '无'}\n**时间：** ${alert.createdAt}\n\n请及时处理！`,
    },
  }

  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    if (!resp.ok) throw new Error(`DingTalk webhook returned ${resp.status}`)
    logger.info(`[Notify] DingTalk notification sent: ${alert.title}`)
  } catch (err) {
    // Dev mode: log instead of throw
    logger.warn(`[Notify] [DEV] DingTalk webhook would be called: ${alert.title}`)
  }
}

async function sendWeChatWork(cfg: any, alert: Alert): Promise<void> {
  const webhookUrl = cfg.webhookUrl
  if (!webhookUrl) return

  const message = {
    msgtype: 'markdown',
    markdown: {
      content: `## 🚨 烟花仓库预警\n> 等级：<font color="${alert.level === 'RED' ? 'warning' : alert.level === 'ORANGE' ? 'comment' : 'info'}">${alert.level}</font>\n> 标题：${alert.title}\n> 描述：${alert.description || '无'}\n> 时间：${alert.createdAt}\n\n请及时处理！`,
    },
  }

  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    if (!resp.ok) throw new Error(`WeChat Work webhook returned ${resp.status}`)
    logger.info(`[Notify] WeChat Work notification sent: ${alert.title}`)
  } catch (err) {
    logger.warn(`[Notify] [DEV] WeChat Work webhook would be called: ${alert.title}`)
  }
}

async function sendEmail(cfg: any, alert: Alert): Promise<void> {
  const recipients: string[] = cfg.to || []
  if (recipients.length === 0) return

  if (cfg.host && cfg.auth?.user) {
    // TODO: Integrate nodemailer
    logger.info(`[Notify] Email would be sent to ${recipients.join(', ')}: ${alert.title}`)
  } else {
    logger.info(`[Notify] [DEV] Email → ${recipients.join(', ')}: ${alert.title}`)
  }
}

async function triggerOnsiteAlarm(cfg: any, alert: Alert): Promise<void> {
  const topic = cfg.mqttTopic
  if (!topic) return

  // Determine alarm pattern based on level
  const pattern =
    alert.level === 'RED'
      ? 'continuous'
      : alert.level === 'ORANGE'
        ? 'fast-blink'
        : 'slow-blink'

  // Publish MQTT command to alarm relay
  const { publishCommand } = await import('../mqtt/broker.js')
  publishCommand(topic, { action: 'activate', pattern, duration: 30 })
  logger.info(`[Notify] On-site alarm triggered: ${pattern} via ${topic}`)
}
