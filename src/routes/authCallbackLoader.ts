import { redirect, type LoaderFunctionArgs } from 'react-router-dom'
import { consumeReturnTo } from '../services/auth/returnTo'
import { tokenStorage } from '../services/auth/tokenStorage'
import type { AuthUser } from '../types/auth'
import { PATHS } from './paths'

export function authCallbackLoader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams
  const accessToken = params.get('accessToken')
  const refreshToken = params.get('refreshToken')
  const userJson = params.get('user')

  if (!accessToken || !refreshToken || !userJson) {
    return redirect(`${PATHS.login}?error=missing_tokens`)
  }

  try {
    const user = JSON.parse(userJson) as AuthUser
    tokenStorage.save({ accessToken, refreshToken, user })
  } catch {
    return redirect(`${PATHS.login}?error=auth_failed`)
  }

  return redirect(consumeReturnTo(PATHS.home))
}
