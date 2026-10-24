import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import Icon from '../../components/common/Icon'
import { useAuth } from '../../hooks/useAuth'
import { PATHS } from '../../routes/paths'
import styles from './ProfileMenu.module.css'

export default function ProfileMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tài khoản"
      >
        <Avatar name={user?.username} src={user?.avatarUrl} />
        <Icon name="chevron-down" className={open ? styles.chevronOpen : undefined} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.profile}>
            <strong>{user?.username}</strong>
            <span>{user?.email}</span>
          </div>
          <Link to={PATHS.settings} className={styles.item} role="menuitem" onClick={close}>
            Cài đặt
            <Icon name="nav-setting" />
          </Link>
          <hr className={styles.divider} />
          <button type="button" className={styles.item} role="menuitem" onClick={signOut}>
            Đăng xuất
            <Icon name="logout" />
          </button>
        </div>
      )}
    </div>
  )
}
