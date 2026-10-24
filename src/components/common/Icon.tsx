import styles from './Icon.module.css'

const sources = import.meta.glob<string>('../../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const icons: Record<string, string> = Object.fromEntries(
  Object.entries(sources).map(([path, svg]) => [path.slice(path.lastIndexOf('/') + 1, -4), svg]),
)

export type IconName =
  | 'arrow-right'
  | 'bell'
  | 'bookmark'
  | 'bulb'
  | 'bulb-on'
  | 'calendar'
  | 'check'
  | 'check-circle'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'comment'
  | 'document-sm'
  | 'external'
  | 'eye'
  | 'flag'
  | 'folder-sm'
  | 'graduation-cap'
  | 'heart'
  | 'help-circle'
  | 'info'
  | 'kebab'
  | 'list'
  | 'logout'
  | 'mail'
  | 'menu'
  | 'moon'
  | 'nav-document'
  | 'nav-home'
  | 'nav-setting'
  | 'nav-test'
  | 'plus'
  | 'quiz-sm'
  | 'search'
  | 'send'
  | 'shield'
  | 'student'
  | 'subject-cap'
  | 'sun'
  | 'trash'
  | 'upload'
  | 'user'

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export default function Icon({ name, size, className }: IconProps) {
  return (
    <span
      className={className ? `${styles.icon} ${className}` : styles.icon}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icons[name] ?? '' }}
    />
  )
}
