export interface AuthUser {
  id: string
  fullName: string
  email: string
  avatar?: string | null
  dateCreated: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
