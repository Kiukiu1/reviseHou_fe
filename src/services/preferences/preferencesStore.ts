import { createPersistentStore } from '../../utils/persistentStore'

type Theme = 'light' | 'dark'

export interface Preferences {
  theme: Theme
  notifications: boolean
}

export const preferencesStore = createPersistentStore<Preferences>('revise.preferences', {
  theme: 'light',
  notifications: true,
})

function applyTheme() {
  document.documentElement.dataset.theme = preferencesStore.get().theme
}

applyTheme()
preferencesStore.subscribe(applyTheme)
