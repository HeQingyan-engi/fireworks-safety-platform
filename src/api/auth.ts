import api from './request'
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/user'

export function login(data: LoginRequest): Promise<LoginResponse> {
  return api.post('/auth/login', data).then((res) => res.data)
}

export function register(data: RegisterRequest): Promise<LoginResponse> {
  return api.post('/auth/register', data).then((res) => res.data)
}

export function getMe(): Promise<User> {
  return api.get('/auth/me').then((res) => res.data)
}

export function updateMe(data: Partial<User>): Promise<User> {
  return api.put('/auth/me', data).then((res) => res.data)
}
