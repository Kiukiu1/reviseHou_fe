export function isTokenExpired(token: string, skewSeconds = 30): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload)) as { exp?: number }
    return !exp || exp * 1000 <= Date.now() + skewSeconds * 1000
  } catch {
    return true
  }
}
