export interface Store {
  id: number
  name: string
  code: string
  address: string
  lat?: number
  lng?: number
  contact?: string
  phone?: string
  status: StoreStatus
  capacity?: number
}

export type StoreStatus = 'NORMAL' | 'CAUTION' | 'DANGER'
