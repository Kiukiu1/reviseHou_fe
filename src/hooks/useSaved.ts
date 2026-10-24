import { useEffect, useState, useSyncExternalStore } from 'react'
import type { SavedSourceType } from '../services/api/savedApi'
import { savedStore } from '../services/saved/savedStore'

export function useSavedToggle(sourceType: SavedSourceType, sourceId: number | undefined) {
  const keys = useSyncExternalStore(savedStore.subscribe, savedStore.getKeys)
  const [error, setError] = useState('')

  useEffect(() => {
    savedStore.ensureLoaded()
  }, [])

  const saved = sourceId !== undefined && keys.has(`${sourceType}:${sourceId}`)

  const toggle = () => {
    if (sourceId === undefined) return
    setError('')
    savedStore.toggle({ sourceType, sourceId }).catch(() => setError('Không lưu được, vui lòng thử lại.'))
  }

  return { saved, toggle, error }
}
