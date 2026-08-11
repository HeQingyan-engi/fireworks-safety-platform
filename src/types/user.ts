export interface User {
  id: number
  username: string
  realName?: string
  phone?: string
  role: UserRole
  storeId?: number
  storeName?: string
}

export type UserRole = 'SUPER_ADMIN' | 'GOV_INSPECTOR' | 'ENTERPRISE_ADMIN' | 'STORE_MANAGER' | 'CLERK' | 'CUSTOMER'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterRequest {
  username: string
  password: string
  realName?: string
  phone?: string
}
