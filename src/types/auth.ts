export interface AuthUser {
  id: number
  username: string
  email: string
  avatarUrl?: string
  createdAt?: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
