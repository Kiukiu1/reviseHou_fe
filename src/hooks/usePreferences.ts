import { useSyncExternalStore } from 'react'
import { preferencesStore, type Preferences } from '../services/preferences/preferencesStore'

export function usePreferences() {
  const preferences = useSyncExternalStore(preferencesStore.subscribe, preferencesStore.get)

  const update = (patch: Partial<Preferences>) => preferencesStore.set((prev) => ({ ...prev, ...patch }))

  return { preferences, update }
}
