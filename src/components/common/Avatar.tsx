import styles from './Avatar.module.css'

const PALETTE = ['#00b85a', '#c0ad01', '#f47c7c', '#005088', '#7a5af8', '#0174c0']

interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: number
}

function colorFor(name: string) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

function initialOf(name: string) {
  const words = name.trim().split(/\s+/)
  return (words[words.length - 1]?.[0] ?? '?').toUpperCase()
}

export default function Avatar({ name, src, size = 40 }: AvatarProps) {
  const label = name || '?'
  const style = { width: size, height: size, fontSize: size / 2 }

  if (src) {
    return <img className={styles.avatar} style={style} src={src} alt={label} referrerPolicy="no-referrer" />
  }

  return (
    <span className={styles.avatar} style={{ ...style, background: colorFor(label) }} aria-label={label}>
      {initialOf(label)}
    </span>
  )
}
