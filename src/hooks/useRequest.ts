import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

export function useRequest<T>(fetcher: () => Promise<T>, key: string) {
  const query = useQuery({
    queryKey: [key],
    queryFn: async () => (await fetcher()) ?? null,
  })
  const { refetch } = query
  const data = (query.data ?? undefined) as T | undefined

  const reload = useCallback(() => {
    void refetch()
  }, [refetch])

  return {
    data,
    error: query.isFetching ? undefined : (query.error ?? undefined),
    loading: query.isPending || (query.isFetching && data === undefined),
    reload,
  }
}
