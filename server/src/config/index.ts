import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  nodeEnv: process.env.NODE_ENV || 'development',

  // MQTT
  mqttBrokerUrl: process.env.MQTT_BROKER_URL || '',
  mqttUsername: process.env.MQTT_USERNAME || '',
  mqttPassword: process.env.MQTT_PASSWORD || '',

  // Alibaba Cloud SMS
  aliSmsAccessKeyId: process.env.ALI_SMS_ACCESS_KEY_ID || '',
  aliSmsAccessKeySecret: process.env.ALI_SMS_ACCESS_KEY_SECRET || '',
  aliSmsSignName: process.env.ALI_SMS_SIGN_NAME || '安万嘉烟花',
  aliSmsTemplateCode: process.env.ALI_SMS_TEMPLATE_CODE || '',
}
