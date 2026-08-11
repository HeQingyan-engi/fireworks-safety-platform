export interface Alert {
  id: number
  storeId: number
  storeName?: string
  type: AlertType
  level: AlertLevel
  title: string
  description?: string
  imageUrl?: string
  status: AlertStatus
  handledBy?: number
  handlerName?: string
  rectifiedAt?: string
  createdAt: string
}

export type AlertType =
  | 'OVERSTOCK'
  | 'CROWD_GATHERING'
  | 'SMOKING'
  | 'OUT_OF_SCOPE_SALES'
  | 'OUTDOOR_ILLEGAL'
  | 'OUTDOOR_TEST_FIRE'
  | 'TEMP_HUMIDITY_ANOMALY'
  | 'SMOKE_FIRE'

export type AlertLevel = 'YELLOW' | 'ORANGE' | 'RED'

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'HANDLING' | 'RESOLVED'

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  OVERSTOCK: '超量存放',
  CROWD_GATHERING: '人员聚集',
  SMOKING: '吸烟/点火',
  OUT_OF_SCOPE_SALES: '超范围经营',
  OUTDOOR_ILLEGAL: '店外违规摆放',
  OUTDOOR_TEST_FIRE: '店外点火/试放',
  TEMP_HUMIDITY_ANOMALY: '温湿度超标',
  SMOKE_FIRE: '烟雾/火情',
}

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  YELLOW: '黄色预警',
  ORANGE: '橙色预警',
  RED: '红色预警',
}

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  NEW: '新预警',
  ACKNOWLEDGED: '已确认',
  HANDLING: '处理中',
  RESOLVED: '已解决',
}
