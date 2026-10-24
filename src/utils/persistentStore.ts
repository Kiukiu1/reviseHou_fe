type Listener = () => void

export interface PersistentStore<T> {
  get: () => T
  set: (next: T | ((prev: T) => T)) => void
  subscribe: (listener: Listener) => () => void
}

export function createPersistentStore<T>(key: string, initial: T): PersistentStore<T> {
  const listeners = new Set<Listener>()

  const read = (): T => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? { ...initial, ...(JSON.parse(raw) as T) } : initial
    } catch {
      return initial
    }
  }

  let value = read()

  const notify = () => listeners.forEach((listener) => listener())

  window.addEventListener('storage', (event) => {
    if (event.key !== key) return
    value = read()
    notify()
  })

  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {}
      notify()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
