const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value))
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function fileExtension(url?: string | null): string {
  if (!url) return ''
  const clean = url.split(/[?#]/)[0]
  const dot = clean.lastIndexOf('.')
  return dot === -1 ? '' : clean.slice(dot + 1).toLowerCase()
}

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif']

export function isImageUrl(url?: string | null): boolean {
  return IMAGE_EXTENSIONS.includes(fileExtension(url))
}

export function matches(keyword: string, ...values: (string | null | undefined)[]) {
  return values.some((value) => value?.toLowerCase().includes(keyword))
}
