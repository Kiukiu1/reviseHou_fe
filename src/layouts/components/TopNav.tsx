import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import styles from './TopNav.module.css'

interface NavProps {
  mobile?: boolean
  onNavigate?: () => void
}

export default function TopNav({ mobile, onNavigate }: NavProps) {
  const { pathname } = useLocation()
  const base = mobile ? styles.mobileLink : styles.link

  return (
    <nav className={mobile ? styles.mobile : styles.nav} aria-label="Điều hướng chính">
      {NAV_ITEMS.map((item) => {
        const active = item.isActive(pathname)
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={active ? `${base} ${styles.active}` : base}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
