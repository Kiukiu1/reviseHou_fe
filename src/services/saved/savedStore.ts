import { savedApi, type SavedKey } from '../api/savedApi'
import { tokenStorage } from '../auth/tokenStorage'

type Listener = () => void

const keyOf = ({ sourceType, sourceId }: SavedKey) => `${sourceType}:${sourceId}`

let keys = new Set<string>()
let loadedFor: number | null = null
let loading: Promise<void> | null = null
const listeners = new Set<Listener>()

const notify = () => listeners.forEach((listener) => listener())

function setKeys(next: Set<string>) {
  keys = next
  notify()
}

tokenStorage.subscribe(() => {
  if (tokenStorage.getSession()?.user.id !== loadedFor) {
    loadedFor = null
    setKeys(new Set())
  }
})

export const savedStore = {
  getKeys: () => keys,

  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  ensureLoaded() {
    const userId = tokenStorage.getSession()?.user.id ?? null
    if (userId === null || userId === loadedFor || loading) return
    loading = savedApi
      .keys()
      .then((items) => {
        loadedFor = userId
        setKeys(new Set(items.map(keyOf)))
      })
      .catch(() => {})
      .finally(() => {
        loading = null
      })
  },

  has(key: SavedKey) {
    return keys.has(keyOf(key))
  },

  async toggle(key: SavedKey) {
    const id = keyOf(key)
    const wasSaved = keys.has(id)
    const next = new Set(keys)
    if (wasSaved) next.delete(id)
    else next.add(id)
    setKeys(next)
    try {
      if (wasSaved) await savedApi.remove(key)
      else await savedApi.save(key)
    } catch (error) {
      const reverted = new Set(keys)
      if (wasSaved) reverted.add(id)
      else reverted.delete(id)
      setKeys(reverted)
      throw error
    }
  },
}
