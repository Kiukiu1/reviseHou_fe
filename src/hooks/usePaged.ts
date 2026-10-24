import { useState } from 'react'

export function usePaged<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(page, totalPages)

  return {
    page: current,
    totalPages,
    items: items.slice((current - 1) * pageSize, current * pageSize),
    setPage,
  }
}
