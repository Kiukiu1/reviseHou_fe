import axios from 'axios'
import { API_URL } from '../../config/env'
import type { AuthSession } from '../../types/auth'

export const authApi = {
  googleLoginUrl: () => `${API_URL}/auth/google`,

  async refresh(refreshToken: string): Promise<AuthSession> {
    const { data } = await axios.post<AuthSession>(`${API_URL}/auth/refresh-token`, {
      refreshToken,
    })
    return data
  },
}
