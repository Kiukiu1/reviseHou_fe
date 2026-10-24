import Icon from '../../components/common/Icon'
import { usePreferences } from '../../hooks/usePreferences'
import styles from './Header.module.css'

export default function ThemeToggle() {
  const { preferences, update } = usePreferences()
  const dark = preferences.theme === 'dark'

  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={() => update({ theme: dark ? 'light' : 'dark' })}
      aria-label={dark ? 'Bật giao diện sáng' : 'Bật giao diện tối'}
      aria-pressed={!dark}
      title={dark ? 'Bật đèn (giao diện sáng)' : 'Tắt đèn (giao diện tối)'}
    >
      <Icon name={dark ? 'bulb' : 'bulb-on'} />
    </button>
  )
}
